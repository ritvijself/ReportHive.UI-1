import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { OverlayTrigger, Tooltip as BSTooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TimingMetricsChart = ({
  siteUrl,
  SquareBox,
  heightchart,
  useStaticData = false,
}) => {
  const [loading, setLoading] = useState(!useStaticData);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const url = `${apibaseurl}/api/${SquareBox?.apiurl}/${SquareBox?.url}`;

  const staticData = {
    firstContentfulPaint: 0.601,
    speedIndex: 2.334,
    largestContentfulPaint: 0.701,
    timeToInteractive: 0.703,
    totalBlockingTime: 0.009,
  };

  useEffect(() => {
    if (useStaticData) {
      setChartData(staticData);
      setLoading(false);
      return;
    }

    if (!siteUrl || !url) return;

    const fetchReportData = async () => {
      setLoading(true);
      setChartData({});
      setError(null);

      try {
        const requestBody = {
          siteUrl: siteUrl,
        };

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const result = await res.json();

        if (!result.timingDetails) {
          throw new Error("No timing details available");
        }

        setChartData(result.timingDetails);
      } catch (err) {
        console.error("TimingMetricsChart error:", err);
        setError(err.message || "Failed to load timing data");
        setChartData({});
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [siteUrl, token, url, useStaticData]);


  const formatTimingData = (timingDetails) => {
    if (!timingDetails) return { labels: [], dataValues: [] };

    const labels = Object.keys(timingDetails).map((key) =>
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );

    const dataValues = Object.values(timingDetails);

    return { labels, dataValues };
  };

  const { labels, dataValues } = formatTimingData(chartData);

  
  const backgroundColors = [
    "#4E79A7", 
    "#F28E2B", 
    "#E15759", 
    "#76B7B2", 
    "#59A14F", 
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Time (seconds)",
        data: dataValues,
        backgroundColor: backgroundColors.slice(0, dataValues.length),
        borderRadius: 0,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false, 
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw.toFixed(3)} seconds`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: "#e0e0e0",
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 10,
          callback: (value) => `${value}s`,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#666",
        },
      },
    },
    barPercentage: 0.5,
    categoryPercentage: 0.7,
  };

  const getTooltipContent = () => {
    return (
      <div>
        <p>This chart shows key page loading metrics:</p>
        <ul style={{ marginBottom: 0, paddingLeft: "15px" }}>
          <li>
            <strong>First Contentful Paint:</strong> When the first content
            appears
          </li>
          <li>
            <strong>Speed Index:</strong> How quickly content is displayed
          </li>
          <li>
            <strong>Largest Contentful Paint:</strong> When the main content
            loads
          </li>
          <li>
            <strong>Time to Interactive:</strong> When page becomes responsive
          </li>
          <li>
            <strong>Total Blocking Time:</strong> Time page was unresponsive
          </li>
        </ul>
      </div>
    );
  };

  const renderTooltip = (props) => (
    <BSTooltip id="timing-metrics-tooltip" {...props}>
      {getTooltipContent()}
    </BSTooltip>
  );

  if (loading) {
    return <Loader />;
  }

  if (error || !chartData || Object.keys(chartData).length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: heightchart || "279px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#666",
        }}
      >
        <div style={{ fontSize: "18px", marginBottom: "10px" }}>
          {error || "No timing data available"}
        </div>
        <div style={{ fontSize: "14px", textAlign: "center" }}>
          Try adjusting your date range or check your connection
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: heightchart || "279px",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "16px", margin: 0 }}>
          {SquareBox?.title || "Page Timing Metrics"}
        </h3>
       
      </div>
      <div style={{ height: "calc(100% - 40px)" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TimingMetricsChart;
