import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(ArcElement, ChartTooltip, Legend);


const COLORS = [
  "#FFA500",
  "#FF8C00",
  "#FF7F50",
  "#FF6347",
  "#FF4500",
  "#FFD700",
  "#FFA07A",
];

const PieChartGA4 = ({
  propertyid,
  title,
  SquareBox,
  totalText = "Sessions",
  startDate,
  endDate,
  height = 160,
  width = 160,
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyid) {
        setChartData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            }),
          }
        );

        if (!response.ok) throw new Error("API request failed");

        const result = await response.json();
        const data = Array.isArray(result)
          ? result
          : result.currentPeriod || [];
        setChartData(data);
      } catch (err) {
        console.error("Error fetching conversion data:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyid, SquareBox, formattedStart, formattedEnd]);

  if (loading) return <Loader />;

  const isEmpty = chartData.length === 0;
  const dimensionKey = "sessionDefaultChannelGroup";
  const metricKey = totalText.toLowerCase();

  const labels = isEmpty
    ? ["No Data"]
    : chartData.map((item) => item[dimensionKey] || "N/A");

  const dataValues = isEmpty
    ? [1]
    : chartData.map((item) => parseFloat(item[metricKey] || "0"));

  const total = isEmpty ? 0 : dataValues.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: isEmpty ? ["#e0e0e0"] : COLORS.slice(0, labels.length),
        hoverBackgroundColor: isEmpty
          ? ["#e0e0e0"]
          : COLORS.slice(0, labels.length),
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
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="p-3 card rounded shadow-sm bg-white h-100">
      <h5 className="mb-3" style={{ fontSize: "16px", fontWeight: "500" }}>
        {title}
      </h5>
      <div className="row align-items-center">
        <div className="col-md-6 d-flex flex-column align-items-center">
          <div style={{ width, height, position: "relative" }}>
            <Doughnut data={data} options={options} />
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
                    backgroundColor: COLORS[i % COLORS.length],
                    marginRight: 8,
                  }}
                />
                <span className="flex-grow-1" style={{ fontSize: "14px" }}>
                  {label}
                </span>
                <span className="fw-bold" style={{ fontSize: "14px" }}>
                  {isEmpty ? 0 : dataValues[i].toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PieChartGA4;
