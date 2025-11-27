import React, { useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../Loader/Loader";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const GmbPiechart = ({
  title = "Platform & Device",
  totalText = "Impressions",
  height = 160,
  width = 160,
  labels = [],
  dataValues = [],
  total = 0,
  loading = false,
  color,
}) => {
  const chartRef = useRef(null);

  const colors = ["#1E90FF", "#4169E1", "#87CEFA", "#ADD8E6"];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-3 rounded shadow-sm bg-white h-100 d-flex justify-content-center align-items-center">
        <Loader small />
      </div>
    );
  }

  return (
    <div className=" card p-3 rounded shadow-sm bg-white h-100">
      <h5
        className="mb-3"
        style={{ fontSize: "16px", fontWeight: "500", color: color }}
      >
        {title}
      </h5>
      <div className="row align-items-center">
        <div className="col-md-6 d-flex flex-column align-items-center">
          <div style={{ width: width, height: height, position: "relative" }}>
            <Doughnut ref={chartRef} data={data} options={options} />
            <div
              className="text-center"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>{total.toLocaleString()}</div>
              <div className="text-muted" style={{ fontSize: "14px" }}>
                {totalText}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <ul className="list-unstyled mb-0">
            {labels.map((label, i) => (
              <li key={i} className="d-flex align-items-center mb-2">
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: colors[i],
                    marginRight: 8,
                  }}
                />
                <span className="flex-grow-1" style={{ fontSize: "14px" }}>
                  {label}
                </span>
                <span className="fw-bold" style={{ fontSize: "14px" }}>
                  {dataValues[i]?.toLocaleString() || 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GmbPiechart;
