import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ProgressBarGoogleAds = ({ title }) => {
  const staticData = [
    { label: "default", click: 49, color: "#446DB9" },
    { label: "Acme Dental", click: 47, color: "#446DB9" },
    { label: "Acme Law", click: 43, color: "#446DB9" },
    { label: "Acme Auto Body", click: 43, color: "#446DB9" },
  ];

  const totalClicks = staticData.reduce((sum, item) => sum + item.click, 0);

  return (
    <div
      className="card  p-4 bg-white rounded-lg border border-gray h-100"
      style={{ height: 200 }}
    >
      <div className="d-flex align-items-center mb-3">
        <span
          className="text-gray-700 font-medium"
          style={{ fontSize: "16px", color: "red" }}
        >
          {title}
        </span>
      </div>
      {staticData.map((item, index) => {
        const pct = totalClicks > 0 ? (item.click / totalClicks) * 100 : 0;
        return (
          <div key={index} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ fontSize: 11, fontWeight: 500, color: "#444" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    marginRight: 6,
                  }}
                ></span>
                <span style={{ textTransform: "capitalize" }}>
                  {item.label}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: "bold" }}>
                {item.click.toLocaleString()}
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
                  backgroundColor: item.color,
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

export default ProgressBarGoogleAds;
