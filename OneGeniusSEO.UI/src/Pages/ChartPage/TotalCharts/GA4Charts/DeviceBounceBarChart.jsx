import React, { useEffect, useState, useCallback } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const DeviceBounceRateChart = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  chartType = "bar",
  chartColor = "#1565c0",
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  const formatPercentage = useCallback((value) => {
    return `${(value * 100).toFixed(1)}%`;
  }, []);

  const getMonthName = (monthNumber, year) => {
    const month = String(monthNumber).padStart(2, "0");
    const defaultYear = year || new Date().getFullYear();
    const date = new Date(`${defaultYear}-${month}-01`);
    if (isNaN(date.getTime())) {
      return `Invalid Month (${month})`;
    }
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const fetchBounceRateData = useCallback(async () => {
    if (!propertyId || !token || !apibaseurl || !SquareBox?.apiurl) {
      console.warn("Missing required props:", {
        propertyId,
        token,
        apibaseurl,
        SquareBox,
      });
      setChartData({
        labels: ["No Data"],
        datasets: [
          {
            label: "Bounce Rate",
            data: [0],
            backgroundColor: "#ccc",
            borderColor: "#999",
            borderWidth: 0,
          },
        ],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url
        }?t=${Date.now()}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: propertyId,
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      const chartData = {
        labels: [],
        datasets: [],
      };

      if (Array.isArray(result) && result.length > 0) {

        const devices = [
          ...new Set(result.map((item) => item.dimension.split("|")[0])),
        ];
        const months = [
          ...new Set(result.map((item) => item.dimension.split("|")[1])),
        ].sort();

        chartData.labels = devices;

        const year = startDate
          ? new Date(startDate).getFullYear()
          : new Date().getFullYear();


        chartData.datasets = months.map((month, index) => {
          const data = devices.map((device) => {
            const item = result.find(
              (entry) => entry.dimension === `${device}|${month}`
            );
            return item ? parseFloat(item.metric) * 100 : 0;
          });


          const totalValue = data.reduce((sum, value) => sum + value, 0);
          const averageValue = data.length > 0 ? totalValue / data.length : 0;

          return {
            label: `${getMonthName(month, year)} (${formatPercentage(
              averageValue / 100
            )})`,
            data: data,
            backgroundColor: chartColor + "66",
            borderColor: chartColor,
            borderWidth: 2,
          };
        });
      } else {
        chartData.labels = ["No Data"];
        chartData.datasets = [
          {
            label: "No Data",
            data: [0],
            backgroundColor: "#ccc",
            borderColor: "#999",
            borderWidth: 0,
          },
        ];
      }

      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching bounce rate data:", error);
      setChartData({
        labels: ["Error"],
        datasets: [
          {
            label: "Error",
            data: [0],
            backgroundColor: "#ff0000",
            borderColor: "#cc0000",
            borderWidth: 0,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [propertyId, startDate, endDate, SquareBox?.apiurl, token, apibaseurl, chartType, chartColor]);

  useEffect(() => {
    fetchBounceRateData();
  }, [fetchBounceRateData, chartType, chartColor]);

  const maxDataValue = Math.max(
    ...(chartData.datasets.flatMap((dataset) => dataset.data) || [0]),
    100
  );
  const yAxisMax = Math.ceil(maxDataValue / 10) * 10;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            }));
          },
          boxWidth: 20,
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label.split(" (")[0]}: ${formatPercentage(
              context.parsed.y / 100
            )}`,
        },
        intersect: false,
        mode: "index",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax > 0 ? yAxisMax : 100,
        ticks: {
          callback: (value) => formatPercentage(value / 100),
          stepSize: yAxisMax > 0 ? yAxisMax / 4 : 25,
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawTicks: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
    elements: {
      bar: {
        barPercentage: 0.3,
        categoryPercentage: 0.8,
      },
    },
  };
  if (isHidden) return null;
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{ color: "black", fontSize: "16px" }}>{title}</h5>
        <span>
          {chartData.datasets.length === 1
            ? formatPercentage(
              chartData.datasets[0].data.reduce((acc, val) => acc + val, 0) /
              (chartData.datasets[0].data.length || 1) /
              100
            )
            : chartData.datasets.length > 1
              ? ""
              : "No Data"}
        </span>
      </div>
      <div  key={`${chartType}-${chartColor}`}  style={{ height: "100%", minWidth: "300px" , width:"100%", position:"relative"}}>
        {chartType === "bar" && <Bar data={chartData} options={chartOptions} />}
        {chartType === "line" && <Line data={chartData} options={chartOptions} />}
        {chartType === "pie" && <Pie data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

export default DeviceBounceRateChart;
