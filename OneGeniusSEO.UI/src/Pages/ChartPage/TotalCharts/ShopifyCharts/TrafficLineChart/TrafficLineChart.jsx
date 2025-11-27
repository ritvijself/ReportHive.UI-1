import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrafficLineChart = () => {
  // Example: 31 days of traffic data
  const visits = [
    120, 200, 180, 300, 250, 400, 350, 210, 180, 260, 300, 340, 400, 380, 420,
    390, 350, 370, 410, 450, 470, 430, 410, 390, 420, 400, 430, 410, 390, 370,
    350,
  ];

  const totalVisits = visits.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: Array.from({ length: visits.length }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Store Visits",
        data: visits,
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        fill: true,
        tension: 0.3,
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
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Visits: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Visits" },
      },
      x: {
        title: { display: true, text: "Day of Month" },
      },
    },
  };

  return (
    <div className="card p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>
          Monthly Traffic
        </h5>
        <span>{totalVisits}</span>
      </div>
      <div style={{ height: 250 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default TrafficLineChart;
