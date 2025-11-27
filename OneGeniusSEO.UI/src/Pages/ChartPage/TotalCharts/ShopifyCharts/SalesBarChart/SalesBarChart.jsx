import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesBarChart = () => {
  const salesData = [5000, 7000, 8000, 6000, 9000];
  const totalSales = salesData.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Total Sales ($)",
        data: salesData,
        backgroundColor: "#4CAF50",
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Sales ($)" },
      },
      x: {
        title: { display: true, text: "Month" },
      },
    },
  };

  return (
    <div className="card  p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>
          Monthly Sales
        </h5>
        <span>${totalSales.toLocaleString()}</span>
      </div>
      <div style={{ height: 250 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesBarChart;
