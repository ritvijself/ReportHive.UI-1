import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CustomerLocationPie = () => {
  const data = {
    labels: ["USA", "UK", "Canada", "Australia"],
    datasets: [
      {
        label: "Customers by Country",
        data: [40, 25, 20, 15],
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#F44336"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} Customers`,
        },
      },
    },
  };

  return (
    <div className="card  p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{ fontSize: "16px", margin: 0, color: "red" }}>
          Customer Locations
        </h5>
      </div>
      <div style={{ height: 250 }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default CustomerLocationPie;
