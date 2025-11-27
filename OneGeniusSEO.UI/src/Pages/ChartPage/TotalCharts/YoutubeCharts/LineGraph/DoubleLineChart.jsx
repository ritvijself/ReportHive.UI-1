import React, { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Loader from "../../../../Loader/Loader";
import { formatDateLocal } from "../../../../../utils/FormatDate";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const ChannelLikesChart = ({
  ytChannel_Id,
  startDate,
  endDate,
  data,
  title,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Likes",
        data: [],
        borderColor: "#3e95cd",
        backgroundColor: "rgba(62, 149, 205, 0.2)",
        tension: 0,
        fill: false,
      },
    ],
  });

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const apiUrl = `${apibaseurl}/api/${data.apiurl}/${data.url}`;

  const tooltipDescription = `YouTube ${title.toLowerCase()} trend for channel between ${formattedStart} and ${formattedEnd}`;

  const renderTooltip = (props) => (
    <Tooltip id="channel-likes-tooltip" {...props}>
      {tooltipDescription}
    </Tooltip>
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Likes",
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  useEffect(() => {
    if (!ytChannel_Id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody = {
          tyChannelId: ytChannel_Id,
          startDate: formattedStart,
          endDate: formattedEnd,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (
          result.IsSuccess === true &&
          result.Data === null &&
          result.Message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        if (result.rows && result.rows.length > 0) {
          const dates = [];
          const likes = [];

          result.rows.forEach((row) => {
            const dateStr = row[0];
            const dateObj = new Date(dateStr);

            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            dates.push(formattedDate);
            likes.push(row[1] || 0);
          });

          setChartData({
            labels: dates,
            datasets: [
              {
                ...chartData.datasets[0],
                data: likes,
              },
            ],
          });
        } else {
          setError("No data available for the selected period");
        }
      } catch (err) {
        console.error("Error fetching YouTube likes data:", err);
        setError("Failed to load likes data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ytChannel_Id, apiUrl, formattedStart, formattedEnd]);
  if (isHidden) return null;

  if (loading) return <Loader small />;

  return (
    <div className="mt-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <h5 className="card-title mb-0">{title}</h5>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <span className="ms-2">
                <FaInfoCircle size={14} />
              </span>
            </OverlayTrigger>
          </div>
          {error ? (
            <div className="text-danger">{error}</div>
          ) : (
            <Line data={chartData} options={options} height={100} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelLikesChart;
