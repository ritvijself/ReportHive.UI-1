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

const ProductPerformanceChart = () => {
  const unitsSold = [120, 90, 150, 80];
  const totalUnits = unitsSold.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: "Units Sold",
        data: unitsSold,
        backgroundColor: "#FF9800",
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
          label: (context) => `${context.parsed.y} units`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Units Sold" },
      },
      x: {
        title: { display: true, text: "Products" },
      },
    },
  };

  return (
    <div className="card  p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>
          Top Selling Products
        </h5>
        <span>{totalUnits} units</span>
      </div>
      <div style={{ height: 250 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ProductPerformanceChart;
