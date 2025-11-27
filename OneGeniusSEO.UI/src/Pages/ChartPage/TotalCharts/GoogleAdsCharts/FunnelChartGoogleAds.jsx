import React from "react";
import { Chart as ChartJS, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import { FunnelController, TrapezoidElement } from "chartjs-chart-funnel";

ChartJS.register(FunnelController, TrapezoidElement, Tooltip, Legend);

const FunnelChartGoogleAds = () => {
  const data = {
    labels: ["Impressions", "Clicks", "Conversions"],
    datasets: [
      {
        data: [18, 12, 6],
        backgroundColor: ["#b5e048", "#fbc169", "#85d3f2"],
      },
    ],
  };

  const options = {
    indexAxis: "y",
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          generateLabels: (chart) => {
            const { data } = chart;
            return data.labels.map((label, i) => ({
              text: `${label}  ${data.datasets[0].data[i].toLocaleString()}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].backgroundColor[i],
              pointStyle: "rectRounded",
              index: i,
              font: {
                size: 14,
              },
            }));
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.raw.toLocaleString()}`,
        },
        bodyFont: {
          size: 16,
        },
      },
    },
    elements: {
      trapezoid: {
        borderWidth: 1,
        borderColor: "#fff",
        spacing: 0,
        width: 0.8,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="card rounded-2 h-100" style={{ width: "100%" }}>
      <div className="card-body p-4 pt-3 ">
        <h5
          className="card-title mb-4"
          style={{ fontSize: "16px", color: "red" }}
        >
          {" "}
          Impressions, Conversions and Clicks
        </h5>
        <div
          style={{
            width: "90%",
            height: "200px",
            minHeight: "200px",
          }}
        >
          <Chart type="funnel" data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default FunnelChartGoogleAds;
