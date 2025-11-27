import React from "react";
import { Container, Row, Col, Card, ProgressBar, Table } from "react-bootstrap";

import { Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";

const ChartCard = ({ title, children, subtitle }) => (
  <Card className="h-100 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Card.Title className="mb-0" style={{ color: "red" }}>
          {title}
        </Card.Title>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      <div style={{ height: "300px" }}>{children}</div>
    </Card.Body>
  </Card>
);

const pageViewsData = {
  labels: ["1 May", "5", "10", "15", "20", "25", "30"],
  datasets: [
    {
      label: "Page Views",
      data: [1200, 1900, 1500, 2000, 1800, 2200, 2500],
      backgroundColor: "rgba(66, 103, 178, 0.6)",
      borderColor: "rgba(66, 103, 178, 1)",
      borderWidth: 1,
    },
  ],
};

const followersGrowthData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Total Followers",
      data: [8500, 9200, 9800, 10500, 11200, 12456],
      fill: true,
      backgroundColor: "rgba(66, 103, 178, 0.2)",
      borderColor: "rgba(66, 103, 178, 1)",
      tension: 0.1,
    },
  ],
};

const topPosts = [1, 2, 3, 4, 5].map((item) => ({
  id: item,
  title: `Post about our new product launch #${item}`,
  reach: Math.floor(Math.random() * 5000) + 1000,
  engagement: Math.floor(Math.random() * 500) + 100,
}));

const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
];

const FacebookInsights = () => {
  return (
    <Container fluid className="py-4 bg-light">
      <Row className="mb-4 g-4" style={{ paddingBottom: "80px" }}>
        <Col lg={12}>
          <ChartCard title="Page Views" subtitle="This Month">
            <Line
              data={pageViewsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </ChartCard>
        </Col>
      </Row>

      <Row className="mb-4 g-4" style={{ paddingBottom: "80px" }}>
        <Col lg={12}>
          <ChartCard title="Followers Growth">
            <Line
              data={followersGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </ChartCard>
        </Col>
      </Row>
    </Container>
  );
};

export default FacebookInsights;
