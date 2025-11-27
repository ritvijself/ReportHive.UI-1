
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

ChartJS.register(...registerables);

const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds)) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const LineChartfilledGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height = 200,
  chartType = "line",
  chartColor,
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);


  const generateDayLabels = () => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  };
  const isThreeMonthView = () => {
    const months = new Set();
    chartData.datasets.forEach((ds) => {
      const match = ds.label?.match(/([A-Za-z]+ \d{4})/);
      if (match && match[1]) {
        months.add(match[1]);
      }
    });
    return months.size >= 3;
  };

     const getRGBAColor = (color, opacity = 0.3) => {
      if (color.startsWith("#")) {
        // Convert hex to rgba
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color; // if already rgba or named color
    };

  const processDataByMonth = (apiData) => {

    const uniqueMonths = [
      ...new Set(
        apiData
          .map((item) => {
            const dateStr = (item.date || item.dimension)?.toString();
            if (!dateStr || !/^\d{8}$/.test(dateStr)) return null;
            return dateStr.slice(0, 6);
          })
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));


    const monthNames = {};
    uniqueMonths.forEach((yearMonth) => {
      const year = yearMonth.slice(0, 4);
      const month = parseInt(yearMonth.slice(4, 6), 10) - 1;
      const date = new Date(year, month, 1);
      monthNames[yearMonth] = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    });


    const monthlyData = {};
    uniqueMonths.forEach((yearMonth) => {
      monthlyData[yearMonth] = Array(31).fill(0);
    });


    apiData.forEach((item) => {
      const dateStr = (item.date || item.dimension)?.toString();
      if (!dateStr || !/^\d{8}$/.test(dateStr)) return;
      const yearMonth = dateStr.slice(0, 6);
      const day = parseInt(dateStr.slice(6, 8), 10) - 1;
      if (monthlyData[yearMonth] && day >= 0 && day < 31) {
        monthlyData[yearMonth][day] =
          parseFloat(item.userEngagementDuration || item.metric) || 0;
      }
    });


    const baseColors = [
      { borderColor: "#bbdefb", backgroundColor: "rgba(187, 222, 251, 0.3)" },
      { borderColor: "#90caf9", backgroundColor: "rgba(144, 202, 249, 0.5)" },
      { borderColor: "#1565c0", backgroundColor: "rgba(21, 101, 192, 0.8)" },
    ];


 


    const colors = chartColor
      ? [
        { borderColor: chartColor, backgroundColor: getRGBAColor(chartColor, 0.3) },
      ]
      : baseColors;

    const datasets = uniqueMonths.map((yearMonth, index) => {
      const total = monthlyData[yearMonth].reduce(
        (acc, val) => acc + (val || 0),
        0
      );
      return {
        label: ` ${monthNames[yearMonth]} (${formatSecondsToHMS(total)})`,
        data: monthlyData[yearMonth],
        borderColor: colors[index % colors.length].borderColor,
        backgroundColor: colors[index % colors.length].backgroundColor,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    });

    return datasets;
  };

  const fetchData = async () => {
    const labels = generateDayLabels();

    if (!propertyId || !token || !SquareBox) {
      setChartData({
        labels,
        datasets: [
          {
            label: "No Data",
            data: Array(31).fill(0),
            borderColor: "#ccc",
            backgroundColor: "rgba(204, 204, 204, 0.3)",
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
      setTotalDuration(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        throw new Error("API error");
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

      if (Array.isArray(result) && result.length > 0) {
        const datasets = processDataByMonth(result);
        const total = datasets.reduce(
          (acc, dataset) =>
            acc + dataset.data.reduce((sum, val) => sum + (val || 0), 0),
          0
        );
        setTotalDuration(total);
        setChartData({
          labels,
          datasets,
        });
      } else {
        setChartData({
          labels,
          datasets: [
            {
              label: "No Data",
              data: Array(31).fill(0),
              borderColor: "#ccc",
              backgroundColor: "rgba(204, 204, 204, 0.3)",
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        });
        setTotalDuration(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData({
        labels,
        datasets: [
          {
            label: "Error",
            data: Array(31).fill(0),
            borderColor: "#ff0000",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
      setTotalDuration(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, token, SquareBox]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.datasets.length) {
              return data.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: "transparent",
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                fontColor: dataset.borderColor,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              }));
            }
            return [];
          },
          boxWidth: 0,
          padding: 10,
          usePointStyle: false,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatSecondsToHMS(context.parsed.y)}`,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatSecondsToHMS(value),
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "User Engagement Duration",
        },
      },
      x: {
        title: {
          display: true,
          text: "Day of Month",
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };
  if (isHidden) return null;
  if (loading) return <Loader />;

  const renderChart = () => {

    // Agar chart type 'pie' hai, toh data ko transform karo
    if (chartType === "pie") {
      // 1. Labels ko mahino ka naam banalo
      const pieLabels = chartData.datasets.map(ds => {
        // Label se total nikaalo, e.g., "October 2025 (120h 5m 0s)"
        const match = ds.label.match(/(.*) \(.*\)/);
        return match ? match[1].trim() : ds.label;
      });

      // 2. Data ko har mahine ka 'total' banalo
      const pieData = chartData.datasets.map(ds =>
        ds.data.reduce((total, dayValue) => total + dayValue, 0)
      );

      // 3. Naya data structure banao
      const pieChartData = {
        labels: pieLabels,
        datasets: [{
          data: pieData,
          backgroundColor:chartColor
            ? [
              getRGBAColor(chartColor, 0.9),
               getRGBAColor(chartColor, 0.6),
                getRGBAColor(chartColor, 0.3)
            ] 
            :
            [
              'rgba(21, 101, 192, 0.8)',
              'rgba(144, 202, 249, 0.5)',
              'rgba(187, 222, 251, 0.3)'

            ],


        }]
      };

      // 4. Pie component ko naya data do
      return <Pie data={pieChartData} options={options} />;
    }

    // Baaki charts ke liye purana logic
    if (chartType === "bar") {
      return <Bar data={chartData} options={options} />;
    }

    // Default 'line' chart
    return <Line data={chartData} options={options} />;
  };


  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center">
        <h5 style={{ fontSize: "16px", margin: 0 }}>{title}</h5>
        {!isThreeMonthView() && (
          <span>{formatSecondsToHMS(totalDuration)}</span>
        )}
      </div>
      <div style={{ height, flex: 1, minHeight: 0 }}>
        {renderChart()}

      </div>
    </div>
  );
};

export default LineChartfilledGA4;

