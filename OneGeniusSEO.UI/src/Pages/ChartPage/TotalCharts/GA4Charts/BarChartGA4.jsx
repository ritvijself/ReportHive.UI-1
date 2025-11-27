import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";

import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const BarChartGA4 = ({ propertyId, startDate, endDate, SquareBox, title }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  
  const generateDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates.map((date) => ({
      formatted: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      raw: date.toISOString().split("T")[0].replace(/-/g, ""), 
    }));
  };

  
  const getMaxTicksLimit = (start, end) => {
    const days =
      Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 30) return 10; 
    if (days > 15) return 8; 
    return 15; 
  };

  const fetchData = async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
        {
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
        }
      );

      const result = await response.json();


      const dateRange = generateDateRange(startDate, endDate);
      const labels = dateRange.map((date) => date.formatted);

      if (Array.isArray(result) && result.length > 0) {
        
        const dataMap = result.reduce((acc, item) => {
          acc[item.date] = parseInt(
            item[
              SquareBox.metric ||
                (result[0].newUsers ? "newUsers" : "activeUsers")
            ] || 0
          );
          return acc;
        }, {});

        const metricData = dateRange.map((date) => dataMap[date.raw] || 0);

        setChartData({
          labels,
          datasets: [
            {
              label:
                SquareBox.metric === "newUsers" ? "New Users" : "Active Users",
              data: metricData,
              backgroundColor:
                SquareBox.metric === "newUsers" ? "#2ecc71" : "#e67e22",
              borderColor:
                SquareBox.metric === "newUsers" ? "#2ecc71" : "#e67e22",
              borderWidth: 0,
            },
          ],
        });
      } else {
        setChartData({
          labels,
          datasets: [
            {
              label: "No Data",
              data: Array(labels.length).fill(0),
              backgroundColor: "#ccc",
              borderColor: "#999",
              borderWidth: 0,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const dateRange = generateDateRange(startDate, endDate);
      const labels = dateRange.map((date) => date.formatted);
      setChartData({
        labels,
        datasets: [
          {
            label: "Error",
            data: Array(labels.length).fill(0),
            backgroundColor: "#ff0000",
            borderColor: "#cc0000",
            borderWidth: 0,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate]);

  const formatNumber = (value) => {
    return value.toLocaleString("en-US");
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${chartData.datasets[0]?.label || "Users"}: ${context.parsed.y}`,
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
        ticks: {
          callback: (value) => formatNumber(value),
          stepSize: 25,
          max: 100,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: getMaxTicksLimit(startDate, endDate),
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
        barPercentage: 0.5,
        categoryPercentage: 0.8,
      },
    },
  };

  const renderTooltip = (props) => (
    <Tooltip id="clicks-tooltip" {...props}>
      {SquareBox.metric === "newUsers"
        ? "Daily new users from Google Analytics"
        : "Daily active users from Google Analytics"}
    </Tooltip>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between">
        <h5 style={{ color: "black", fontSize: "16px" }}>
          {title}
         
        </h5>
        <span>
          {formatNumber(
            chartData.datasets[0]?.data.reduce((acc, val) => acc + val, 0)
          )}
        </span>
      </div>
      <div>
        <Bar data={chartData} options={options} height={200} />
      </div>
    </div>
  );
};

export default BarChartGA4;
