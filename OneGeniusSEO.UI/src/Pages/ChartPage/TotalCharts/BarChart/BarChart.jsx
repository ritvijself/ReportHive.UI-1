import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const CountryChart = ({
  propertyid,
  startDate,
  endDate,
  SquareBox,
  siteUrl,
  height,
  GMBLocation_Id,
  GMBAccount_Id,
  noApiMode = false,
  chartType = "bar", //  new prop chart conversion
  chartColor = "#4285F4", //  new prop color conversion
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metricLabel, setMetricLabel] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const token = localStorage.getItem("token");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const url = noApiMode
    ? null
    : `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;

  useEffect(() => {
    if (noApiMode) {
      setLoading(false);
      setChartData([]);
      setIsHidden(false);
      return;
    }

    if ((!propertyid && !siteUrl && !GMBLocation_Id) || !url) {
      setLoading(false);
      setIsHidden(false);
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);
      setChartData([]);
      setMetricLabel("");
      setIsHidden(false);

      try {
        let requestBody = {};
        if (GMBLocation_Id) {
          requestBody = {
            accountId: GMBAccount_Id,
            locationId: GMBLocation_Id,
            startDate: formattedStart,
            endDate: formattedEnd,
          };
        } else if (SquareBox.requiresSiteUrl) {
          requestBody = {
            siteUrl: siteUrl,
            startDate: formattedStart,
            endDate: formattedEnd,
          };
        } else {
          requestBody = {
            propertyId: propertyid,
            startDate: formattedStart,
            endDate: formattedEnd,
          };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const result = await res.json();

        if (
          result.IsSuccess === true &&
          result.Data === null &&
          result.Message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        let rows = [];
        if (GMBLocation_Id) {
          const dailyMetricTimeSeries = Array.isArray(
            result?.multiDailyMetricTimeSeries
          )
            ? result.multiDailyMetricTimeSeries[0]?.dailyMetricTimeSeries || []
            : [];

          const dateValueMap = {};
          dailyMetricTimeSeries.forEach((metricSeries) => {
            const timeSeries = metricSeries?.timeSeries?.datedValues || [];
            timeSeries.forEach((item) => {
              const dateStr = item.date
                ? `${item.date.year}-${String(item.date.month).padStart(
                  2,
                  "0"
                )}-${String(item.date.day).padStart(2, "0")}`
                : "";
              if (!dateValueMap[dateStr]) dateValueMap[dateStr] = 0;
              dateValueMap[dateStr] += item.value ? parseInt(item.value) : 0;
            });
          });

          rows = Object.keys(dateValueMap).map((date) => ({
            date,
            value: dateValueMap[date],
          }));

          const metric =
            dailyMetricTimeSeries[0]?.dailyMetric || "BUSINESS_IMPRESSIONS";
          setMetricLabel(formatMetricLabel(metric));
        } else if (Array.isArray(result)) {
          rows = result.map((item) => ({
            date: item.Date,
            https: item.HTTPS || 0,
            nonhttps: item.NonHTTPS || 0,
          }));
        } else {
          rows = [];
        }

        setChartData(rows.length > 0 ? rows : []);
      } catch (err) {
        console.error("ChartGMB error:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [
    propertyid,
    siteUrl,
    GMBLocation_Id,
    token,
    formattedStart,
    formattedEnd,
    url,
    SquareBox.requiresSiteUrl,
    noApiMode,
  ]);

  const formatMetricLabel = (metric) => {
    const labelMap = {
      BUSINESS_IMPRESSIONS_DESKTOP_MAPS: "Desktop Map Impressions",
      BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: "Desktop Search Impressions",
      BUSINESS_IMPRESSIONS_MOBILE_MAPS: "Mobile Map Impressions",
      BUSINESS_IMPRESSIONS_MOBILE_SEARCH: "Mobile Search Impressions",
      BUSINESS_IMPRESSIONS: "Total Impressions",
    };
    return labelMap[metric] || metric.split("_").slice(1).join(" ");
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
      monthlyData[month] = { value: 0, https: 0, nonhttps: 0 };
    });


    data.forEach((item) => {
      const month = item.date.slice(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].value += item.value || 0;
        monthlyData[month].https += item.https || 0;
        monthlyData[month].nonhttps += item.nonhttps || 0;
      }
    });


    const colors = [
      { backgroundColor: "#8cc7d4", borderColor: "#8cc7d4" },
      { backgroundColor: "#5aacc3", borderColor: "#5aacc3" },
      { backgroundColor: "#2b91b3", borderColor: "#2b91b3" },
    ];


    const monthlyValues = Object.entries(monthlyData).map(
      ([month, { value, https, nonhttps }], index) => ({
        month: getMonthName(month),
        value: GMBLocation_Id ? value : https + nonhttps,
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

  const sortedData = [...chartData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const isGMBData = GMBLocation_Id;
  const isEmptyData = chartData.length === 0;

  const processedData = processDataByMonth(sortedData);
  const isMonthlyView = processedData.isMonthly;

  const generateDateRange = () => {
    const dates = [];
    const start = new Date(formattedStart);
    const end = new Date(formattedEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(
        `${d.getDate()} ${d.toLocaleDateString("en-US", {
          month: "short",
        })}`
      );
    }
    return dates;
  };

  const labels = isEmptyData
    ? generateDateRange()
    : isMonthlyView
      ? processedData.data.map((item) => item.month)
      : sortedData.map(
        (item) =>
          `${new Date(item.date).getDate()} ${new Date(
            item.date
          ).toLocaleDateString("en-US", { month: "short" })}`
      );

  const data = {
    labels: isMonthlyView
      ? processedData.data.map((item) => item.month)
      : labels,
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
          label: `${item.month} (${formatNumber(item.value)})`,
          data: Array(processedData.data.length)
            .fill(0)
            .map((_, i) => (i === index ? item.value : 0)),
          backgroundColor: item.color.backgroundColor,
          borderColor: item.color.borderColor,
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
        }))
        : isGMBData
          ? [
            {
              label: metricLabel,
              data: sortedData.map((item) => item.value || 0),
              backgroundColor: chartColor,
              borderColor: chartColor,
              borderWidth: 0,
              borderRadius: 0,
              borderSkipped: false,
            },
          ]
          : [
            {
              label: "Non-HTTPS",
              data: sortedData.map((item) => item.nonhttps || 0),
              backgroundColor: "#FF3B30",
              borderColor: "#FF3B30",
              borderWidth: 0,
              borderRadius: 0,
              borderSkipped: false,
            },
            {
              label: "HTTPS",
              data: sortedData.map((item) => item.https || 0),
              backgroundColor: "#34C759",
              borderColor: "#34C759",
              borderWidth: 0,
              borderRadius: 0,
              borderSkipped: false,
            },
          ],
  };

  let lineData = data;
  if (chartType === "line") {
    lineData = {
      labels: data.labels,
      datasets: data.datasets.map((d) => ({
        ...d,
        data: d.data,    //use full series
        fill: true,
        borderColor: chartColor,    //use selected color
        backgroundColor: chartColor,
        tension: 0.4, //smoothcurve
        pointRadius: 0,   //hide options
        borderWidth: 2,  //thicker line 

      }))
    }
  }

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
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: isEmptyData
          ? 10
          : Math.ceil(Math.max(...data.datasets.flatMap((d) => d.data)) * 1.2),
        grid: { drawBorder: false, color: "#e0e0e0" },
        ticks: {
          stepSize: isGMBData
            ? Math.ceil(Math.max(...data.datasets.flatMap((d) => d.data)) / 5)
            : undefined,
          font: { size: 12 },
          padding: 10,
          callback: (value) => (isGMBData && value % 1 !== 0 ? "" : value),
        },
      },
      x: {
        stacked: !isGMBData,
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
              color: SquareBox.color,
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          >
            {SquareBox.title}
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
              color: SquareBox.color,
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          >
            {SquareBox.title}
          </h5>
        </div>
        {!noApiMode && !isEmptyData && !isMonthlyView && (
          <div className="text-end">
            <div className="fw-bold">
              {formatNumber(
                data.datasets.reduce(
                  (sum, dataset) =>
                    sum + dataset.data.reduce((s, v) => s + v, 0),
                  0
                )
              )}
            </div>
          </div>
        )}
      </div>
      <div style={{ height: height || "350px", position: "relative" }}>
        {noApiMode ? (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="text-muted">
              <i className="bi bi-bar-chart-fill fs-3 opacity-50"></i>
              <p className="mt-2 mb-0">Chart not available</p>
            </div>
          </div>
        ) : (
          <>
            {chartType === "line" &&
              <Line
                data={lineData}
                options={options}
              />} {/* use lineData */}

            {chartType === "bar" &&
              <Bar
                data={data}
                options={options}
              />
            }
            {chartType === "pie" && (
              <Pie
                data={{
                  labels: data.labels,
                  datasets: [
                    {
                      labels: "Value",
                      data: data.datasets[0]?.data || [],
                      backgroundColor: [
                        "#4285F4",
                        "#EA4335",
                        "#FBBC05",
                        "#34A853",
                        "#9C27B0",
                        "#03A9F4",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: {
                      callbacks: {
                        label: (ctx) =>
                          `${ctx.label}: ${ctx.formattedValue || ctx.parsed}`,
                      },
                    },
                  },
                }}
              />
            )}

            {isEmptyData && (
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="text-muted">
                  <i
                    className={`bi ${isGMBData ? "bi-map-fill" : "bi-bar-chart-fill"
                      } fs-3 opacity-50`}
                  ></i>
                  <p className="mt-2 mb-0">
                    {isGMBData
                      ? "No GMB data available"
                      : "No HTTP data available"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CountryChart;
