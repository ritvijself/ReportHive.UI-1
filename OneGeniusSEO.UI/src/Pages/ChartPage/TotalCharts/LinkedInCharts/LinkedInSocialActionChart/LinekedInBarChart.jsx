import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LinkedInChart = ({ type }) => {
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

  const chartData =
    type === "netFollowers"
      ? {
          title: "Net Followers",
          total: "83,328",
          datasets: [
            {
              label: "Organic",
              data: [
                1600, 1500, 1400, 1550, 1600, 1580, 1700, 1650, 1620, 1500,
                1320, 1400, 1450, 1380, 1500,
              ],
              backgroundColor: "#A6CE39", // green
              stack: "Stack 0",
            },
            {
              label: "Paid",
              data: [
                1400, 1300, 1250, 1350, 1400, 1420, 1500, 1550, 1580, 1400,
                1208, 1300, 1350, 1280, 1300,
              ],
              backgroundColor: "#F4B63F", // yellow-orange
              stack: "Stack 0",
            },
          ],
        }
      : {
          title: "Social Actions",
          total: "1,349",
          datasets: [
            {
              label: "Comments",
              data: [
                12, 15, 18, 20, 22, 24, 28, 30, 32, 34, 36, 38, 40, 42, 44,
              ],
              backgroundColor: "#C4B69D",
              stack: "Stack 0",
            },
            {
              label: "Likes",
              data: [
                10, 12, 14, 15, 17, 18, 20, 22, 24, 25, 27, 28, 30, 31, 32,
              ],
              backgroundColor: "#D89CC4",
              stack: "Stack 0",
            },
            {
              label: "Shares",
              data: [8, 9, 10, 11, 12, 13, 14, 15, 16, 16, 17, 18, 18, 19, 20],
              backgroundColor: "#4BB1B1",
              stack: "Stack 0",
            },
          ],
        };

  const data = {
    labels,
    datasets: chartData.datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card shadow-sm p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="fw-semibold mb-3">{chartData.title}</h6>
        <div className="fw-bold mt-2" style={{ fontSize: "1.1rem" }}>
          {chartData.total}
        </div>
      </div>
      <Bar data={data} options={options} height={100} />
    </div>
  );
};

export default LinkedInChart;
