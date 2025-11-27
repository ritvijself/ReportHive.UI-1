import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const LineChartGAds = ({ title }) => {
  const chartData = {
    labels: ["26 May", "2 Jun", "9 Jun", "16 Jun"],
    datasets: [
      {
        label: "Impressions",
        data: [12, 13, 14, 15],
        borderColor: "#446DB9",
        backgroundColor: "rgba(68, 77, 173, 0.3)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) => `Impressions: ${ctx.parsed.y}`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      y: {
        min: 10,
        max: 18,
        ticks: { stepSize: 2, callback: (val) => val },
      },
      x: { grid: { display: false } },
    },
    elements: { point: { radius: 0, hoverRadius: 5 } },
  };

  return (
    <div className="card p-3 h-100">
      <div className="d-flex justify-content-between align-items-center">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>{title}</h5>
        <span>403</span>
      </div>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartGAds;
