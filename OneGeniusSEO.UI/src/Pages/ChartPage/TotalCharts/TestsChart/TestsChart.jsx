import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../Loader/Loader";

ChartJS.register(ArcElement, Tooltip, Legend);

const TestsChart = ({ propertyid, SquareBox, startDate, endDate, siteUrl }) => {
  const defaultTestData = {
    passes: 47,
    failures: 6,
    warnings: 0,
    isEmpty: false,
  };

  const [testData, setTestData] = useState(defaultTestData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propertyid && !siteUrl) return;

    const fetchTestData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const apibaseurl = import.meta.env.VITE_API_BASE_URL;

        const response = await fetch(`${apibaseurl}/api/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId: propertyid,
            siteUrl: siteUrl,
            startDate: startDate,
            endDate: endDate,
          }),
        });

        if (!response.ok) throw new Error("API request failed");
        const result = await response.json();

        setTestData({
          passes: result.passes || 0,
          failures: result.failures || 0,
          warnings: result.warnings || 0,
          isEmpty: false,
        });
      } catch (error) {
        console.error("Error fetching test data:", error);
        setTestData({ ...defaultTestData, isEmpty: true });
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [propertyid, siteUrl, startDate, endDate]);

  if (loading) return <Loader />;

  const data = {
    labels: ["Passes", "Failures", "Warnings"],
    datasets: [
      {
        data: [testData.passes, testData.failures, testData.warnings],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "80%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-3 rounded shadow-sm bg-white">
      <h5 className="mb-3" style={{ fontSize: "14px", color: "red" }}>
        Tests
      </h5>
      <div className="text-center position-relative">
        <div
          style={{
            width: 120,
            height: 120,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <Doughnut data={data} options={options} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />
                <span style={{ fontSize: 10 }}>Passes {testData.passes}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#F44336",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />
                <span style={{ fontSize: 10 }}>
                  Failures {testData.failures}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#FFC107",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />
                <span style={{ fontSize: 10 }}>
                  Warnings {testData.warnings}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestsChart;
