import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const LineChartGA4ThreeMonth = ({
  propertyId,
  startDate,
  endDate,
  title = "Total Users Over Time",
   SquareBox,
  chartType='line',
  chartColor = "#1565c0",
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const generateDayLabels = () =>
    Array.from({ length: 31 }, (_, i) => String(i + 1));

  const processDataByMonth = (apiData, totalUsersData) => {
    const uniqueMonths = [
      ...new Set(apiData.map((item) => item.date.slice(0, 6))),
    ].sort();
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

    const totalUsersMap = {};
    totalUsersData.forEach((item) => {
      const month = item.dimension;
      const year = formattedStart.slice(0, 4);
      const yearMonth = `${year}${month}`;
      totalUsersMap[yearMonth] = parseFloat(item.metric) || 0;
    });

    const monthlyData = {};
    uniqueMonths.forEach((yearMonth) => {
      monthlyData[yearMonth] = Array(31).fill(0);
    });

    apiData.forEach((item) => {
      const date = item.date;
      const yearMonth = date.slice(0, 6);
      const day = parseInt(date.slice(6, 8), 10) - 1;
      if (monthlyData[yearMonth] && day >= 0 && day < 31) {
        monthlyData[yearMonth][day] = parseFloat(item.totalUsers) || 0;
      }
    });

    return uniqueMonths.map((yearMonth) => ({
      label: `${monthNames[yearMonth]} (${totalUsersMap[yearMonth] || 0})`,
      data: monthlyData[yearMonth],
      borderColor: chartColor,
      backgroundColor: chartColor + "33",
      fill: false,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
    }));
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

      const dailyRes = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
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

      const dailyData = await dailyRes.json();

      if (
        dailyData.isSuccess === true &&
        dailyData.data === null &&
        dailyData.message === "User wants to hide this API"
      ) {
        setHidden(true);
        setLoading(false);
        return;
      }

      const totalUsersRes = await fetch(
        `${apibaseurl}/api/google-analytics/report/total-users-month`,
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

      const totalUsersData = await totalUsersRes.json();
      const datasets = processDataByMonth(dailyData, totalUsersData);
      setChartData({ labels, datasets });
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData({
        labels,
        datasets: [
          {
            label: "Error",
            data: Array(31).fill(0),
            borderColor: "#ff0000",
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
  }, [propertyId, startDate, endDate, token, SquareBox, chartColor]);

  const formatNumber = (val) =>
    typeof val === "number" ? val.toLocaleString("en-US") : val;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
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
        ticks: { callback: formatNumber },
        grid: { color: "rgba(0,0,0,0.05)" },
        title: { display: true, text: "Total Users" },
      },
      x: {
        title: { display: true, text: "Day of Month" },
        grid: { display: false },
      },
    },
    elements: {
      point: { radius: 0, hoverRadius: 5 },
    },
  };

  if (hidden) return null;
  if (loading) return <Loader />;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0 }}>{title}</h5>
        <div className="d-flex align-items-center gap-2">
      
        </div>
      </div>
      <div style={{ flex: 1, minHeight: "200px", height:"100%", width:"100%" }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default LineChartGA4ThreeMonth;
