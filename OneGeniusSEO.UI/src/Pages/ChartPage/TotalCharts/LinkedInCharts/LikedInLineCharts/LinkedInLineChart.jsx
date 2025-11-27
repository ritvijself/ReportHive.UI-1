import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const LineChartLinkedIn = ({ title, type }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Common labels
    const labels = [
      "14 Jul",
      "16 Jul",
      "18 Jul",
      "20 Jul",
      "22 Jul",
      "24 Jul",
      "26 Jul",
      "28 Jul",
      "30 Jul",
      "1 Aug",
      "3 Aug",
      "5 Aug",
      "7 Aug",
      "9 Aug",
      "11 Aug",
    ];

    // Static data for each type
    const dataSets = {
      impressions: {
        label: "Impressions",
        values: [
          120, 140, 160, 155, 170, 185, 190, 200, 210, 220, 240, 250, 260, 275,
          280,
        ],
        borderColor: "#1877F2",
        backgroundColor: "rgba(24, 119, 242, 0.1)",
      },
      clicks: {
        label: "Clicks",
        values: [20, 25, 28, 27, 30, 33, 35, 36, 38, 40, 42, 45, 47, 49, 50],
        borderColor: "#00A0DC",
        backgroundColor: "rgba(0, 160, 220, 0.1)",
      },
    };

    const selected = dataSets[type] || dataSets.impressions;
    const totalValue = selected.values.reduce((sum, val) => sum + val, 0);

    setTotal(totalValue);

    setChartData({
      labels,
      datasets: [
        {
          label: `${selected.label} (${totalValue})`,
          data: selected.values,
          borderColor: selected.borderColor,
          backgroundColor: selected.backgroundColor,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    });
  }, [type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
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
  };

  return (
    <div className="card shadow-sm p-3 h-100 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>{title}</h5>
        <span>{total}</span>
      </div>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartLinkedIn;
