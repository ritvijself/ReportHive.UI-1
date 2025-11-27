import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { OverlayTrigger, Tooltip as BSTooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./ScoreChart.module.css";
import Loader from "../../../Loader/Loader";

ChartJS.register(ArcElement, Tooltip, Legend);

const ScoreChart = ({
  siteUrl,
  SquareBox,
  metric,
  minHeight,
  widthDoughnut,
  heightDoughnut,
  colordoughnut,
  margintopbottom,
  title,
}) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!siteUrl || !metric) {
        setScore(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ siteUrl }),
          }
        );

        if (!response.ok) throw new Error("API request failed");

        const result = await response.json();

        if (!result.scores || !result.scores[metric]) {
          throw new Error(`No ${metric} data found in response`);
        }

        const roundedScore =
          Math.round(result.scores[metric].score * 100) / 100;
        setScore(roundedScore);
        setLoading(false);
      } catch (err) {
        console.error("API error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [siteUrl, token, SquareBox, metric]);

  const getTooltipContent = () => {
    switch (metric) {
      case "performance":
        return "This score represents how quickly your page loads and becomes interactive. Scores closer to 100 indicate better performance.";
      case "seo":
        return "This score measures how well your page follows SEO best practices. Higher scores indicate better search engine visibility.";
      case "accessibility":
        return "This score evaluates how accessible your page is to all users, including those with disabilities. Higher scores indicate better accessibility.";
      case "best-practices":
        return "This score reflects how well your page follows modern web development best practices.";
      default:
        return `This is the ${metric} score for your website.`;
    }
  };

  const renderTooltip = (props) => (
    <BSTooltip id="score-tooltip" {...props}>
      {getTooltipContent()}
    </BSTooltip>
  );

  if (loading) return <Loader />;
  if (error) return <div className="text-danger">Error: {error}</div>;
  if (score === null) return <div>No data available</div>;

  const data = {
    labels: [metric.charAt(0).toUpperCase() + metric.slice(1), ""],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [colordoughnut || "#3498db", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "80%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw.toFixed(0)}%`;
          },
        },
      },
    },
  };

  return (
    <div
      className={`p-3 rounded shadow-sm bg-white ${style.analytic_chart}`}
      style={{ minHeight: minHeight }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{ fontSize: "15px", marginBottom: 0 }}>
          {title || metric.charAt(0).toUpperCase() + metric.slice(1)}
        </h5>
    
      </div>
      <div className="text-center position-relative">
        <div
          style={{
            width: widthDoughnut || 120,
            height: heightDoughnut || 120,
            margin: `${margintopbottom} auto`,
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
              textAlign: "center",
              width: "100%",
            }}
          >
            <div className="fw-bold" style={{ fontSize: "20px" }}>
              {score.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreChart;
