import React from "react";
import { Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";

const engagementData = {
  labels: ["Likes", "Comments", "Shares", "Reactions"],
  datasets: [
    {
      data: [1200, 500, 300, 800],
      backgroundColor: ["#4267B2", "#36A2EB", "#FFCE56", "#4BC0C0"],
    },
  ],
};

const PieChart = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0" style={{ color: "red" }}>
            Engagement Breakdown
          </Card.Title>
        </div>
        <div style={{ height: "300px" }}>
          <Pie
            data={engagementData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default PieChart;
