import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const EngagementTimeBox = ({ propertyId, startDate, endDate, SquareBox }) => {
  const [metricValue, setMetricValue] = useState("-");
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const calculateMetric = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("No valid data for calculation");
      return 0;
    }

    // Calculate average engagement time per user
    const totalEngagement = data.reduce((acc, item) => {
      const engagement = parseInt(item.userEngagementDuration) || 0;
      const users = parseInt(item.totalUsers) || 1;
      return acc + engagement / users;
    }, 0);

    const avgEngagement = totalEngagement / data.length;
    console.log("Calculated avg engagement (seconds):", avgEngagement);
    return avgEngagement;
  };

  const fetchMetricData = async () => {
    if (!propertyId || !SquareBox?.apiurl || !SquareBox?.url) {
      console.log("Missing propertyId or SquareBox configuration");
      return [];
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
          body: JSON.stringify({
            propertyId: propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching engagement time data:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMetricData();
        const value = calculateMetric(data);
        setMetricValue(formatSecondsToHMS(value));
      } catch (error) {
        console.error("Error processing data:", error);
        setMetricValue("-");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, startDate, endDate, SquareBox]);

  const renderTooltip = (description) => (props) =>
    <Tooltip {...props}>{description}</Tooltip>;

  const metricInfo = {
    title: "Average Engagement Time",
    value: metricValue,
    description: "Average time per user for the selected period",
    tooltip:
      "Average time users spent engaging with content, in hours, minutes, and seconds",
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="col-md-12 col-sm-12">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="text-muted mb-0 fw-semibold">
              {metricInfo.title}
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip(metricInfo.tooltip)}
              >
                <span className="ms-2">
                  <FaInfoCircle size={14} />
                </span>
              </OverlayTrigger>
            </h6>
          </div>
          <div
            className="mt-auto text-center fw-bold"
            style={{ marginBottom: "20px", fontSize: "35px" }}
          >
            {metricInfo.value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementTimeBox;
