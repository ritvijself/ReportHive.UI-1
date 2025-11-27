
import React from "react";
import { Card } from "react-bootstrap";
import { Line } from "react-chartjs-2";

const GMBLineChart = ({ title, type }) => {
 
  const formatNumber = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k";
    }
    return value;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getChartData = () => {
    const commonOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            boxWidth: 12,
            padding: 10,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 9,
            },
          },
          rtl: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += context.raw.toLocaleString();
              return label;
            },
            title: function (context) {
           
              const dateStr = context[0].label;
              const date = new Date(dateStr);
              return date.toISOString().split("T")[0]; 
            },
          },
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false, 
          },
          ticks: {
            callback: function (value, index, ticks) {
              const date = new Date(this.getLabelForValue(value));
              if (index === 0) {
            
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              } else {
               
                return date.getDate();
              }
            },
          },
        },
        y: {
          grid: {
            display: true,
          },
          ticks: {
            callback: function (value) {
              return formatNumber(value);
            },
          },
        },
      },
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        },
      },
    };

  
    const baseDate = new Date("2025-04-27");
    const labels = [0, 5, 10, 15, 20, 25].map((days) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + days);
      return date.toISOString().split("T")[0];
    });

    if (type === "impressions") {
      return {
        data: {
          labels: labels,
          datasets: [
            {
              label: "Maps Impressions",
              data: [1000, 1200, 800, 1100, 1300, 1000],
              borderColor: "#1e2f42",
              backgroundColor: "rgba(0,0,0,0.1)",
              tension: 0,
              pointBackgroundColor: "#1e2f42",
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: {
                target: "origin",
                above: "rgba(0,0,0,0.1)",
              },
            },
            {
              label: "Search Impressions",
              data: [1100, 900, 950, 1000, 1250, 980],
              borderColor: "#3b74ed",
              backgroundColor: "rgba(63,81,181,0.1)",
              tension: 0,
              pointBackgroundColor: "#3b74ed",
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: {
                target: "origin",
                above: "rgba(63,81,181,0.1)",
              },
            },
          ],
        },
        options: commonOptions,
      };
    }

    if (type === "reviews") {
      return {
        data: {
          labels: labels,
          datasets: [
            {
              label: "Current total review count",
              data: [7000, 8000, 6500, 7500, 9000, 8500],
              borderColor: "#1e2f42",
              backgroundColor: "rgba(0,0,0,0.1)",
              tension: 0,
              pointBackgroundColor: "#1e2f42",
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: {
                target: "origin",
                above: "rgba(0,0,0,0.1)",
              },
            },
            {
              label: "Current avg. review rating",
              data: [6000, 7000, 6800, 7200, 6900, 6913],
              borderColor: "#3b74ed",
              backgroundColor: "rgba(63,81,181,0.1)",
              tension: 0,
              pointBackgroundColor: "#3b74ed",
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: {
                target: "origin",
                above: "rgba(63,81,181,0.1)",
              },
            },
          ],
        },
        options: commonOptions,
      };
    }

    return { data: {}, options: commonOptions };
  };

  const chartData = getChartData();

  return (
    <Card className="chart-card">
      <Card.Body>
        <Card.Title className="chart-title" style={{ color: "red" }}>
          {title}
        </Card.Title>
        <div style={{ minHeight: "161px" }}>
          <Line data={chartData.data} options={chartData.options} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default GMBLineChart;
