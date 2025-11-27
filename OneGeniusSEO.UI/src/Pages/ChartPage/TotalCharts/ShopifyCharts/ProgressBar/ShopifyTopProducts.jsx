import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ShopifyTopProducts = ({ chartType }) => {
  // Data for both chart types
  const topProducts = [
    { label: "Humvee Marshal", sold: 27 },
    { label: "Samand EL", sold: 26 },
    { label: "Marshell DN", sold: 25 },
    { label: "Innocenti Elba", sold: 25 },
  ];

  const productsByType = [
    { label: "SUV", sold: 52 },
    { label: "Sedan", sold: 40 },
    { label: "Motorbike", sold: 35 },
    { label: "Truck", sold: 20 },
  ];

  // Pick data based on chartType prop
  const data = chartType === "byType" ? productsByType : topProducts;
  const title =
    chartType === "byType" ? "Products by Type" : "Top Products Sold";
  const barColor = chartType === "byType" ? "#28a745" : "#007bff";

  // Scale based on highest value so the top bar is always full width
  const maxSold = Math.max(...data.map((item) => item.sold));

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        borderRadius: 6,
        padding: 16,
        border: "1px solid #ddd",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: 14,
          marginBottom: 12,
          color: "red",
        }}
      >
        {title}
      </div>

      {data.map((item, index) => {
        const pct = maxSold > 0 ? (item.sold / maxSold) * 100 : 0;
        return (
          <div key={index} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ fontSize: 13, fontWeight: 500, color: "#444" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: "bold" }}>
                {item.sold}
              </div>
            </div>
            <div
              className="progress"
              style={{
                height: 8,
                backgroundColor: "#f0f0f5",
                borderRadius: 4,
                marginTop: 4,
              }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  borderRadius: 4,
                }}
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShopifyTopProducts;
