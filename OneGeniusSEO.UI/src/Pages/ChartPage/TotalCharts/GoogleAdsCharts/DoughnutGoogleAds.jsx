import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart) => {
    const { ctx, data } = chart;
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    ctx.save();
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#444";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerX = chart.getDatasetMeta(0).data[0].x;
    const centerY = chart.getDatasetMeta(0).data[0].y;
    ctx.fillText(`${total}`, centerX, centerY - 8);
    ctx.font = "14px Arial";
    ctx.fillText("Clicks", centerX, centerY + 8);
    ctx.restore();
  },
};

const StaticPieChart = () => {
  const data = {
    labels: ["Female", "Male"],
    datasets: [
      {
        data: [43, 39],
        backgroundColor: ["#7FB3D5", "#A3D9A3"],
        borderColor: ["#7FB3D5", "#A3D9A3"],
        borderWidth: 1,
        cutout: "75%",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} ${data.datasets[0].data[i]}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              datasetIndex: 0,
              index: i,
              font: { size: 14 },
            }));
          },
        },
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 20,
        top: 0,
        bottom: 0,
      },
    },
  };

  return (
    <div
      className="card  p-4 bg-white rounded-lg border border-gray-200"
      style={{ height: 300 }}
    >
      <div className="d-flex align-items-center mb-5">
        <span
          className="text-gray-700 font-medium"
          style={{ fontSize: "16px", color: "red" }}
        >
          Clicks By Devices
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
};

export default StaticPieChart;
