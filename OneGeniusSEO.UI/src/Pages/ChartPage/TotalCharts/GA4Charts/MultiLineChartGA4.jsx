
import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { FaChartLine } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const MultiLineChartGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height,
  chartType = "line",
  chartColor= "#1565c0"
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [metric, setMetric] = useState("totalUsers");
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  // ✅ Generate Date Range for X-axis
  const generateDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);
    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates.map((date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return {
        formatted: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        raw: `${yyyy}${mm}${dd}`,
      };
    });
  };

  // ✅ Fetch total users
  const fetchTotalUsers = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/google-analytics/report/total-users`,
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
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      setTotalUsers(parseInt(result[0]?.totalUsers || 0));
    } catch (error) {
      console.error("Error fetching total users:", error);
      setTotalUsers(0);
    }
  };

  // ✅ Fetch analytics data
  const fetchData = async () => {
    if (!propertyId || !token) {
      const dateRange = generateDateRange(startDate, endDate);
      setChartData({
        labels: dateRange.map((d) => d.formatted),
        datasets: [
          {
            label: "No Data",
            data: Array(dateRange.length).fill(0),
            borderColor: "#ccc",
            backgroundColor: "rgba(204,204,204,0.3)",
          },
        ],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await fetchTotalUsers();

      const response = await fetch(
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

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return;
      }

      const dateRange = generateDateRange(startDate, endDate);
      const labels = dateRange.map((date) => date.formatted);

      const metricName = result.metricHeaders[0]?.name || "totalUsers";
      setMetric(metricName);

      const dataMap = {};
      result.rows.forEach((row) => {
        if (!dataMap[row.date]) dataMap[row.date] = {};
        dataMap[row.date][row.deviceCategory] = parseInt(row[metricName] || 0);
      });

      const deviceCategories = ["mobile", "desktop", "tablet"];
      const colors = {
        mobile:  "#34c759", //green fixed
        desktop: chartColor ,
        tablet: "#ff8c00",
      };

      const datasets = deviceCategories.map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        data: dateRange.map((date) => dataMap[date.raw]?.[category] || 0),
        borderColor: colors[category],
        backgroundColor: colors[category] + "66",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
      }));

      setChartData({ labels, datasets });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, token, SquareBox ,  chartType, chartColor]);

  // ✅ Formatters
  const formatNumber = (value) => value.toLocaleString("en-US");
  const formatSecondsToHMS = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const sec = Math.floor(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getTotalValue = () =>
    metric === "userEngagementDuration"
      ? formatSecondsToHMS(
          chartData.datasets.reduce(
            (acc, dataset) =>
              acc + dataset.data.reduce((sum, val) => sum + val, 0),
            0
          )
        )
      : formatNumber(totalUsers);

  // ✅ Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return metric === "userEngagementDuration"
              ? `${context.dataset.label}: ${formatSecondsToHMS(value)}`
              : `${context.dataset.label}: ${formatNumber(value)}`;
          },
        },
      },
    },
  };

  if (isHidden) return null;
  if (loading) return <Loader />;

  // ✅ Chart Type Switch
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
        <div className="d-flex align-items-center">
          <FaChartLine size={16} color={chartColor} className="me-2" />
          <h5 style={{ fontSize: "16px", margin: 0 }}>
            {metric === "userEngagementDuration" ? "Engagement Duration" : title}
          </h5>
        </div>
       
        <div className="d-flex align-items-center gap-2">
         <div className="text-end mt-2">
        <strong>Total:</strong> {getTotalValue()}
      </div>
        </div>
      </div>

      <div  key={`${chartType}-${chartColor}`} style={{ height: "100%", width:"100%", position: "relative" }}>
        {renderChart()}
      </div>
     
    </div>
  );
};

export default MultiLineChartGA4;
