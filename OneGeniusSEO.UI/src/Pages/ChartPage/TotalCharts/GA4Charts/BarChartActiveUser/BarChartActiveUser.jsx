import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import Loader from "../../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../../utils/FormatDate";
import styles from "./BarChartActiveUser.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const BarChartActiveUser = ({
  propertyId,
  startDate,
  endDate,
  title,
  SquareBox,
  height = "300px",
  viewType = "chart",
  code,
  chartType = "bar",
  chartColor = "#1565c0",
}) => {
  const [chartData, setChartData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataShowType, setDataShowType] = useState(viewType);
  const [isHidden, setIsHidden] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toLocaleString("en-US");
  };

  const getMonthName = (month) => {
    const date = new Date(`${new Date().getFullYear()}-${month}-01`);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isMonthInRange = (monthStr) => {
    const currentYear = new Date().getFullYear();
    const monthStart = new Date(`${currentYear}-${monthStr}-01`);
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    return monthStart <= rangeEnd && monthEnd >= rangeStart;
  };

  const fetchDataShowType = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/GA4CustomizeMonthApiList/get-datashowtype/${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      return data.dataShowType || viewType;
    } catch (error) {
      console.error("Fetch dataShowType error:", error);
      return viewType;
    }
  };
// ✅ Converts hex color (like "#1565c0") to rgba() format with transparency
const hexToRgba = (hex, alpha = 0.6) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `rgba(${+r},${+g},${+b},${alpha})`;
};

  const fetchData = async () => {
    if (!propertyId || !SquareBox?.apiurl || !SquareBox?.url) {
      setChartData([]);
      setTotalUsers(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const dynamicViewType = await fetchDataShowType();
      setDataShowType(dynamicViewType);

      const chartResponse = await fetch(
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

      if (!chartResponse.ok)
        throw new Error(`Chart API request failed: ${chartResponse.status}`);

      const chartResult = await chartResponse.json();

      if (
        chartResult.isSuccess === true &&
        chartResult.data === null &&
        chartResult.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      const totalResponse = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/active-users`,
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

      if (!totalResponse.ok)
        throw new Error(`Total API request failed: ${totalResponse.status}`);

      const totalResult = await totalResponse.json();

    const colors = [
  { backgroundColor: hexToRgba(chartColor, 0.6), borderColor: chartColor },
  { backgroundColor: "rgba(255, 140, 0, 0.6)", borderColor: "#ff8c00" },
  { backgroundColor: "rgba(76, 175, 80, 0.6)", borderColor: "#4CAF50" },
];


      const normalizedData = Array.isArray(chartResult)
        ? chartResult
          .map((item, index) => ({
            monthKey: item.month,
            month: getMonthName(item.month),
            value: parseInt(item.activeUsers) || 0,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => parseInt(a.monthKey) - parseInt(b.monthKey))
        : [];

      setChartData(normalizedData);
      setTotalUsers(parseInt(totalResult[0]?.activeUsers) || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, SquareBox, chartType, chartColor]);

  const isEmptyData = chartData.length === 0;

  const labels = chartData.map((item) => item.month);

  const data = {
    labels,
    datasets: isEmptyData
      ? [
        {
          label: "No Data",
          data: Array(labels.length).fill(0),
          backgroundColor: "rgba(66, 133, 244, 0.1)",
          borderColor: "rgba(66, 133, 244, 0.3)",
          borderWidth: 1,
        },
      ]
      : chartData.map((item, index) => ({
        label: `${item.month} (${formatNumber(item.value)})`,
        data: chartData.map((_, i) => (i === index ? item.value : 0)),
        backgroundColor: item.color.backgroundColor,
        borderColor: item.color.borderColor,
        borderWidth: 0,
        borderRadius: 0,
        borderSkipped: false,
      })),
  };

  const maxDataValue = Math.max(
    ...(data.datasets.flatMap((d) => d.data) || [0]),
    0
  );
  const yAxisMax = maxDataValue > 0 ? Math.ceil(maxDataValue * 1.2) : 100;
  const stepSize = maxDataValue > 0 ? Math.ceil(maxDataValue / 5) : 25;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          generateLabels: (chart) =>
            chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            })),
          boxWidth: 20,
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) =>
            isEmptyData
              ? `${context.dataset.label}: No data available`
              : `${context.dataset.label}: ${formatNumber(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        grid: { drawBorder: false, color: "#e0e0e0" },
        ticks: {
          stepSize: stepSize,
          font: { size: 12 },
          padding: 10,
          callback: (value) => formatNumber(value),
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 12 }, color: "#666" },
      },
    },
    barPercentage: 0.4,
    categoryPercentage: 0.9,
  };

  if (isHidden) return null;

  if (loading) {
    return (
      <div className="card shadow-sm p-3">
        <div className="d-flex align-items-center mb-3">
          <h5
            className={`${styles.cardTitle}`}
            style={{ color: SquareBox.color || "black" }}
          >
            {title}
          </h5>
        </div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-3">
      {dataShowType === "chart" ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5
              className={`${styles.cardTitle}`}
              style={{ color: SquareBox.color || "black" }}
            >
              {title}
            </h5>
          </div>
          <div key={`${chartType}-${chartColor}`} className={styles.chartContainer} style={{ height }}>
            {chartType === "bar" && <Bar key={`${chartType}-${chartColor}`} data={data} options={options} />}
            {chartType === "line" && <Line key={`${chartType}-${chartColor}`} data={data} options={options} />}
            {chartType === "pie" && <Pie key={`${chartType}-${chartColor}`} data={data} options={options} />}

            {isEmptyData && (
              <div className={styles.noDataOverlay}>
                <div className="text-muted">
                  <i
                    className={`bi bi-bar-chart-fill ${styles.noDataIcon}`}
                  ></i>
                  <p className="mt-2 mb-0">No active users data available</p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="table-responsive">
          <table
            className="table table-sm"
            style={{ border: "1px solid black" }}
          >
            <thead>
              <tr>
                <th className={`${styles.tableHeader}`}>Month</th>
                <th
                  className={`${styles.tableHeader} ${styles.tableHeaderSmall}`}
                >
                  Total Active Users
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => {
                const isHighlighted = isMonthInRange(item.monthKey);
                const rowClass = isHighlighted
                  ? styles.highlightCell
                  : styles.defaultCell;
                return (
                  <tr key={index}>
                    <td className={`${styles.tableCell} ${rowClass}`}>
                      {item.month}
                    </td>
                    <td className={`${styles.tableCell} ${rowClass}`}>
                      {formatNumber(item.value)}
                    </td>
                  </tr>
                );
              })}
              {chartData.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-muted">
                    No active users data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarChartActiveUser;
