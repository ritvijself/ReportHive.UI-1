import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader"; // Adjust path as needed
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./ClickLineGraph.module.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const ClicksLineGraph = ({ siteUrl, startDate, endDate, SquareBox, title }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  const generateDayLabels = () => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1)); // ["1", "2", ..., "31"]
  };

  const processDataByMonth = (apiData) => {
    const uniqueMonths = [
      ...new Set(apiData.map((item) => item.Date.slice(0, 7).replace("-", ""))),
    ].sort((a, b) => a.localeCompare(b));

    const monthNames = {};
    uniqueMonths.forEach((yearMonth) => {
      const year = yearMonth.slice(0, 4);
      const month = parseInt(yearMonth.slice(4, 6), 10) - 1; // 0-based month for Date
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

    // Map API data to monthly arrays
    apiData.forEach((item) => {
      const date = item.Date.replace(/-/g, "");
      const yearMonth = date.slice(0, 6);
      const day = parseInt(date.slice(6, 8), 10) - 1;
      if (monthlyData[yearMonth] && day >= 0 && day < 31) {
        monthlyData[yearMonth][day] = parseFloat(item.Clicks) || 0;
      }
    });

    const colors = [
      { borderColor: "#bbdefb", backgroundColor: "rgba(187, 222, 251, 0.3)" },
      { borderColor: "#90caf9", backgroundColor: "rgba(144, 202, 249, 0.5)" },
      { borderColor: "#1565c0", backgroundColor: "rgba(21, 101, 192, 0.8)" },
    ];

    const datasets = uniqueMonths.map((yearMonth, index) => {
      const total = monthlyData[yearMonth].reduce(
        (acc, val) => acc + (val || 0),
        0
      );
      return {
        label: `${monthNames[yearMonth]} (${formatNumber(total)})`,
        data: monthlyData[yearMonth],
        borderColor: colors[index % colors.length].borderColor,
        backgroundColor: colors[index % colors.length].backgroundColor,
        fill: false,
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

    if (!siteUrl || !token || !SquareBox) {
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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            siteUrl: siteUrl,
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
        setLoading(false);
        return;
      }
      if (Array.isArray(result.data) && result.data.length > 0) {
        const datasets = processDataByMonth(result.data);
        setChartData({
          labels,
          datasets,
        });
      } else {
        if (!isHidden) {
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
        }
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteUrl, startDate, endDate, token, SquareBox]);

  const formatNumber = (value) => {
    if (typeof value !== "number") return value;
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString("en-US");
  };

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
          label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`,
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
          callback: (value) => formatNumber(value),
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Clicks",
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

  const renderTooltip = (props) => (
    <Tooltip id="clicks-tooltip" {...props}>
      Daily clicks from Google Search Console
    </Tooltip>
  );
  if (isHidden) return null;

  if (loading) {
    return <Loader />;
  }

  const totalClicks = chartData.datasets.reduce(
    (acc, dataset) =>
      acc + dataset.data.reduce((sum, val) => sum + (val || 0), 0),
    0
  );

  return (
    <Col md={6}>
      <p>Number of people clicked on your website</p>
      <div className="card shadow-sm p-3">
        <div className={style.header}>
          <h5 className={style.chart_title}>{title}</h5>
        </div>
        <div className={style.chart_box}>
          <Line data={chartData} options={options} height={260} />
        </div>
      </div>
    </Col>
  );
};

export default ClicksLineGraph;
