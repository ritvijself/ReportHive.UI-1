import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate"; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const AvgEngagementBarChart = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height = "218px",
}) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const generateDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDate.getDate()).padStart(2, "0");
      dates.push({
        formatted: `${currentDate.getDate()} ${currentDate.toLocaleDateString(
          "en-US",
          { month: "short" }
        )}`,
        raw: `${yyyy}-${mm}-${dd}`,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const getMonthName = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const processDataByMonth = (data) => {
    const uniqueMonths = [
      ...new Set(data.map((item) => item.date.slice(0, 7))),
    ].sort((a, b) => a.localeCompare(b));

    const monthlyData = {};
    uniqueMonths.forEach((month) => {
      monthlyData[month] = { engagement: 0, users: 0 };
    });

    data.forEach((item) => {
      const month = item.date.slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].engagement +=
          parseInt(item.userEngagementDuration) || 0;
        monthlyData[month].users += parseInt(item.totalUsers) || 1;
      }
    });

    const colors = [
      { backgroundColor: "#8cc7d4", borderColor: "#8cc7d4" },
      { backgroundColor: "#5aacc3", borderColor: "#5aacc3" },
      { backgroundColor: "#2b91b3", borderColor: "#2b91b3" }, // Deep teal blue
    ];

    const monthlyValues = Object.entries(monthlyData).map(
      ([month, { engagement, users }], index) => ({
        month: getMonthName(month),
        value: users > 0 ? engagement / users : 0,
        color: colors[index % colors.length],
      })
    );

    return {
      isMonthly: uniqueMonths.length >= 3,
      data: monthlyValues,
    };
  };

  const formatNumber = (value) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? value : numValue.toLocaleString();
  };

  const fetchData = async () => {
    if (!propertyId || !SquareBox?.apiurl || !SquareBox?.url) {
      setChartData([]);
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

      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const result = await response.json();
      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      if (!Array.isArray(result) || result.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

 
      const normalizedData = result.map((item) => {
        let date = item.date.includes("-")
          ? item.date
          : `${item.date.slice(0, 4)}-${item.date.slice(
              4,
              6
            )}-${item.date.slice(6, 8)}`;
        return {
          date,
          userEngagementDuration: parseInt(item.userEngagementDuration) || 0,
          totalUsers: parseInt(item.totalUsers) || 1,
        };
      });

      setChartData(normalizedData);
    } catch (error) {
      console.error("Error:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, SquareBox]);

  const sortedData = [...chartData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const isEmptyData = chartData.length === 0;
  const processedData = processDataByMonth(sortedData);
  const isMonthlyView = processedData.isMonthly;

  const dateRange = generateDateRange(startDate, endDate);
  const labels = isEmptyData
    ? dateRange.map((date) => date.formatted)
    : isMonthlyView
    ? processedData.data.map((item) => item.month)
    : sortedData.map(
        (item) =>
          `${new Date(item.date).getDate()} ${new Date(
            item.date
          ).toLocaleDateString("en-US", { month: "short" })}`
      );

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
      : isMonthlyView
      ? processedData.data.map((item, index) => ({
          label: `${item.month} (${formatSecondsToHMS(item.value)})`,
          data: Array(processedData.data.length)
            .fill(0)
            .map((_, i) => (i === index ? item.value : 0)),
          backgroundColor: item.color.backgroundColor,
          borderColor: item.color.borderColor,
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
        }))
      : [
          {
            label: "Avg. Engagement Time per User",
            data: sortedData.map(
              (item) =>
                (parseInt(item.userEngagementDuration) || 0) /
                (parseInt(item.totalUsers) || 1)
            ),
            backgroundColor: "#009385",
            borderColor: "#009385",
            borderWidth: 0,
            borderRadius: 0,
            borderSkipped: false,
          },
        ],
  };

  const totalAvgEngagement = isEmptyData
    ? "-"
    : isMonthlyView
    ? formatSecondsToHMS(
        processedData.data.reduce((sum, item) => sum + item.value, 0) /
          processedData.data.length
      )
    : formatSecondsToHMS(
        sortedData.reduce(
          (sum, item) =>
            sum +
            (parseInt(item.userEngagementDuration) || 0) /
              (parseInt(item.totalUsers) || 1),
          0
        ) / sortedData.length
      );

  const maxDataValue = Math.max(
    ...(data.datasets.flatMap((d) => d.data) || [0]),
    0
  );
  const yAxisMax = maxDataValue > 0 ? Math.ceil(maxDataValue * 1.2) : 120;
  const stepSize = maxDataValue > 0 ? Math.ceil(maxDataValue / 5) : 30;

  const options = {
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
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          title: (context) => {
            if (isEmptyData) return context[0].label;
            if (isMonthlyView) {
              return context[0].label;
            }
            const item = sortedData[context[0].dataIndex];
            const date = new Date(item?.date || context[0].label);
            return date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          },
          label: (context) => {
            if (isEmptyData)
              return `${context.dataset.label}: No data available`;
            return `${context.dataset.label}: ${formatSecondsToHMS(
              context.raw
            )}`;
          },
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
          callback: (value) => formatSecondsToHMS(value),
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 12 }, color: "#666" },
      },
    },
    barPercentage: isMonthlyView ? 0.4 : 0.6,
    categoryPercentage: isMonthlyView ? 0.9 : 0.8,
  };
  if (isHidden) return null;
  if (loading) {
    return (
      <div className="card shadow-sm p-3">
        <div className="d-flex align-items-center mb-3">
          <h5
            className="m-0"
            style={{
              color: SquareBox.color || "black",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center">
          <h5
            className="m-0"
            style={{
              color: SquareBox.color || "black",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          >
            {title}
          </h5>
        </div>
        {!isEmptyData && !isMonthlyView && (
          <div className="text-end">
            <div className="fw-bold">{totalAvgEngagement}</div>
          </div>
        )}
      </div>
      <div style={{ height: height, position: "relative" }}>
        <Bar data={data} options={options} />
        {isEmptyData && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="text-muted">
              <i className="bi bi-bar-chart-fill fs-3 opacity-50"></i>
              <p className="mt-2 mb-0">No engagement data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvgEngagementBarChart;
