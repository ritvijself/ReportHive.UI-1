import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const LineChartFb = ({ pageId, startDate, endDate, data, title }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [total, setTotal] = useState(0);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const getChartSettings = () => {
    if (data.url === "daily-followers") {
      return {
        yAxisTitle: "Daily Followers",
        tooltipLabel: (value) => `Followers: ${value}`,
        borderColor: "#42b72a",
        backgroundColor: "rgba(66, 183, 42, 0.1)",
      };
    }

    return {
      yAxisTitle: "Unique Impressions",
      tooltipLabel: (value) => `Unique impressions: ${value}`,
      borderColor: "#1877F2",
      backgroundColor: "rgba(24, 119, 242, 0.1)",
    };
  };

  const chartSettings = getChartSettings();

  useEffect(() => {
    if (!pageId || !startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/${data.apiurl}/${data.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              pageId,
              startDate: formatDateLocal(startDate),
              endDate: formatDateLocal(endDate),
            }),
          }
        );

        const result = await response.json();

        if (result.data?.[0]?.values?.length > 0) {
          const values = result.data[0].values;
          const labels = values.map((item) =>
            new Date(item.end_time).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          );
          const chartValues = values.map((item) => item.value || 0);
          const totalValue = chartValues.reduce((sum, val) => sum + val, 0);

          const maxValue = Math.max(...chartValues);
          const suggestedMax = Math.ceil(maxValue + 1); 

          setChartData({
            labels,
            datasets: [
              {
                label: `${chartSettings.yAxisTitle} (${totalValue})`,
                data: chartValues,
                borderColor: chartSettings.borderColor,
                backgroundColor: chartSettings.backgroundColor,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
              },
            ],
            suggestedMax,
          });

          setTotal(totalValue);
        } else {
          setChartData({
            labels: [],
            datasets: [
              {
                label: "No Data",
                data: [],
                borderColor: "#ccc",
                backgroundColor: "rgba(204, 204, 204, 0.3)",
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
            ],
          });
          setTotal(0);
        }
      } catch (err) {
        console.error("Error fetching Facebook insights:", err);
        setChartData({
          labels: [],
          datasets: [
            {
              label: "Error",
              data: [],
              borderColor: "#ff0000",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        });
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, startDate, endDate]);

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
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => chartSettings.tooltipLabel(context.parsed.y),
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
        suggestedMax: chartData.suggestedMax || 10,
        title: {
          display: true,

          text: chartSettings.yAxisTitle,
        },
        ticks: {
          callback: (value) => (Number.isInteger(value) ? value : null),
          stepSize: 1,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
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

  if (loading) return <Loader />;

  return (
    <div className="card shadow-sm p-3 h-100 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0 }}>{title}</h5>
        <span>{total}</span>
      </div>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartFb;
