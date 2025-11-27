import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./LineGraph.module.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const LineGraph = ({
  propertyid,
  SquareBox,
  title,
  startDate,
  endDate,
  siteUrl,
  titleSize,
  titleColor,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const url = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const squareBoxKey = useMemo(() => JSON.stringify(SquareBox), [SquareBox]);

  const tooltipDescription = useMemo(() => {
    if (SquareBox.requiresSiteUrl) {
      switch (SquareBox.url) {
        case "search-clicks":
          return "Shows daily clicks, impressions, CTR, and average position over time.";
        case "discover-performance":
          return "Shows how your site appears in Google Discover(Google’s content feed on mobile).";
        case "lifetime-performance":
          return "Shows your website's search performance from the start date to the end date across all days.";
        default:
          return "Line graph displaying clicks and impressions from Google Search Console for the selected date range";
      }
    }
    switch (SquareBox.url) {
      case "sessions":
        return "Line graph showing sessions from Google Analytics for the selected date range";
      case "conversions":
        return "Line graph showing conversions from Google Analytics for the selected date range";
      default:
        return `Line graph showing ${
          title?.toLowerCase() || "sessions"
        } from Google Analytics for the selected date range`;
    }
  }, [SquareBox.requiresSiteUrl, SquareBox.url, title]);

  const fetchData = async () => {
    if (!propertyid && !siteUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const requestBody = SquareBox.requiresSiteUrl
        ? {
            siteUrl: siteUrl,
            startDate: formattedStart,
            endDate: formattedEnd,
          }
        : {
            propertyId: propertyid,
            startDate: formattedStart,
            endDate: formattedEnd,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      let dataToProcess = [];
      if (SquareBox.requiresSiteUrl) {
        if (Array.isArray(result) && result[0]?.Date) {
          const sessions = [...result].sort(
            (a, b) => new Date(a.Date) - new Date(b.Date)
          );

          const labels = sessions.map((item) =>
            new Date(item.Date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })
          );

          setChartData({
            labels,
            datasets: [
              {
                label: "Clicks",
                data: sessions.map((item) => item.Clicks),
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.3)",
                fill: false,
                tension: 0,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: "y",
              },
              {
                label: "Impressions",
                data: sessions.map((item) => item.Impressions),
                borderColor: "#2ecc71",
                backgroundColor: "rgba(46, 204, 113, 0.3)",
                fill: false,
                tension: 0,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: "y1",
              },
            ],
          });
          setLoading(false);
          return;
        } else if (Array.isArray(result)) {
          dataToProcess = result;
        } else if (result && typeof result === "object") {
          dataToProcess = [
            {
              dimension: result.dimension || formattedStart,
              metric: result.metric || 0,
            },
          ];
        }
      } else {
        if (Array.isArray(result)) {
          dataToProcess = result;
        } else if (Array.isArray(result?.currentPeriod)) {
          dataToProcess = result.currentPeriod;
        } else if (Array.isArray(result?.rows)) {
          dataToProcess = result.rows;
        }
      }

      if (dataToProcess.length > 0) {
        const sessions = [...dataToProcess].sort((a, b) => {
          const parseDate = (str) =>
            /^\d{8}$/.test(str)
              ? new Date(
                  parseInt(str.slice(0, 4)),
                  parseInt(str.slice(4, 6)) - 1,
                  parseInt(str.slice(6, 8))
                )
              : new Date(str);
          return parseDate(a.dimension) - parseDate(b.dimension);
        });

        const formatDate = (dateStr) => {
          if (/^\d{8}$/.test(dateStr)) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const dateObj = new Date(year, parseInt(month) - 1, day);
            return dateObj.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            });
          }
          return dateStr;
        };

        const labels = sessions.map((item) => formatDate(item.dimension));
        const data = sessions.map((item) => parseInt(item.metric || 0));

        setChartData({
          labels,
          datasets: [
            {
              label: title || "Sessions",
              data,
              borderColor: "#3498db",
              backgroundColor: "rgba(52, 152, 219, 0.3)",
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
          ],
        });
      } else {
        setChartData({
          labels: ["No Data"],
          datasets: [
            {
              label: "No Data",
              data: [0],
              borderColor: "#ccc",
              backgroundColor: "rgba(204, 204, 204, 0.3)",
              fill: false,
              borderWidth: 2,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData({
        labels: ["No Data"],
        datasets: [
          {
            label: "No Data",
            data: [0],
            borderColor: "#ccc",
            backgroundColor: "rgba(204, 204, 204, 0.3)",
            fill: false,
            borderWidth: 2,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyid, siteUrl, squareBoxKey, formattedStart, formattedEnd]);

  const isDualAxis =
    chartData.datasets.length === 2 &&
    chartData.datasets.some((d) => d.label === "Clicks") &&
    chartData.datasets.some((d) => d.label === "Impressions");

  const calculateAlignedMax = (datasets) => {
    if (datasets.length !== 2) {
      return datasets.map((d) =>
        Math.ceil(Math.max(...(d.data || [0]), 10) * 1.1)
      );
    }

    const avg1 =
      datasets[0].data.reduce((a, b) => a + b, 0) / datasets[0].data.length;
    const avg2 =
      datasets[1].data.reduce((a, b) => a + b, 0) / datasets[1].data.length;
    const ratio = avg2 / avg1;

    const max1 = Math.ceil(Math.max(...datasets[0].data, 10) * 1.1);
    const max2 = Math.ceil(max1 * ratio);

    return [max1, max2];
  };

  const maxValues = calculateAlignedMax(chartData.datasets);

  const formatNumber = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: chartData.datasets.length > 1,
        position: "top",
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatNumber(
              context.parsed.y.toLocaleString()
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: isDualAxis,
          text: "Clicks",
        },
        beginAtZero: true,
        max: isDualAxis ? maxValues[0] : maxValues[0],
        ticks: {
          stepSize: Math.ceil((isDualAxis ? maxValues[0] : maxValues[0]) / 5),
          callback: (value) => formatNumber(value),
        },
        grid: {
          drawOnChartArea: !isDualAxis,
          color: "rgba(0, 0, 0, 0.1)",
        },
        border: {
          display: false,
        },
      },
      y1: {
        type: "linear",
        display: isDualAxis,
        position: "right",
        title: {
          display: isDualAxis,
          text: "Impressions",
        },
        beginAtZero: true,
        max: isDualAxis ? maxValues[1] : undefined,
        ticks: {
          stepSize: isDualAxis ? Math.ceil(maxValues[1] / 5) : undefined,
          callback: (value) => formatNumber(value),
        },
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const renderTooltip = (props) => (
    <Tooltip id="line-graph-tooltip" {...props}>
      {tooltipDescription}
    </Tooltip>
  );

  if (loading) {
    return (
      <div className="card shadow-sm p-3 h-100">
        <div className={style.header}>
          <h5
            className={style.chart_title}
            style={{ color: titleColor, fontSize: titleSize }}
          >
            {title?.toUpperCase()}
          </h5>
         
        </div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className={style.header}>
        <h5
          className={style.chart_title}
          style={{ color: titleColor, fontSize: titleSize }}
        >
          {title?.toUpperCase()}
        
        </h5>

        {chartData.datasets.length === 1 && (
          <span className={style.totalValue}>
            {formatNumber(
              chartData.datasets[0]?.data.reduce((acc, val) => acc + val, 0)
            )}
          </span>
        )}
      </div>
      <div className={style.chart_box}>
        <Line
          data={chartData}
          options={options}
          key={`${formattedStart}-${formattedEnd}-${chartData.labels.length}`}
        />
      </div>
    </div>
  );
};

export default LineGraph;
