import React from "react";
import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";

const audienceData = {
  labels: ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  datasets: [
    {
      label: "Male",
      data: [15, 29, 35, 25, 18, 12, 8],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    },
    {
      label: "Female",
      data: [20, 35, 40, 30, 22, 15, 10],
      backgroundColor: "rgba(255, 99, 132, 0.6)",
    },
  ],
};

const AudienceDemographicsChart = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0" style={{ color: "red" }}>
            Audience Demographics
          </Card.Title>
        </div>
        <div style={{ height: "300px" }}>
          <Bar
            data={audienceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default AudienceDemographicsChart;
