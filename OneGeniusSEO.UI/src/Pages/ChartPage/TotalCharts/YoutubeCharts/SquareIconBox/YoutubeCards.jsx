import React, { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Card from "react-bootstrap/Card";
import Loader from "../../../../Loader/Loader";
import { formatDateLocal } from "../../../../../utils/FormatDate";

const YoutubeCards = ({
  title,
  value: propValue,
  icon,
  change: propChange,
  ytChannel_Id,
  data,
  Color,
  startDate,
  endDate,
  metricType,
}) => {
  const [loading, setLoading] = useState(!!ytChannel_Id);
  const [dynamicValue, setDynamicValue] = useState(0);
  const [dynamicChange, setDynamicChange] = useState(null);
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const isDynamic = !!ytChannel_Id;
  const value = isDynamic ? dynamicValue : propValue;
  const change = isDynamic ? dynamicChange : propChange;
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const tooltipDescription = `YouTube ${title.toLowerCase()} metrics for channel between ${formattedStart} and ${formattedEnd}`;

  useEffect(() => {
    if (!ytChannel_Id) {
      if (isDynamic) {
        setError("YouTube Channel ID is required");
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/${data.apiurl}/${data.url}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tyChannelId: ytChannel_Id,
              startDate: formattedStart,
              endDate: formattedEnd,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const responseData = await response.json();

        if (
          responseData.IsSuccess === true &&
          responseData.Data === null &&
          responseData.Message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        if (data.url === "channelLifetimeLikes") {
          const likesValue = responseData.rows?.[0]?.[0] || 0;
          setDynamicValue(likesValue);
        } else {
          let metricValue = 0;
          if (responseData.items && responseData.items.length > 0) {
            const statistics = responseData.items[0].statistics;
            switch (metricType) {
              case "views":
                metricValue = parseInt(statistics.viewCount) || 0;
                break;
              case "subscribers":
                metricValue = parseInt(statistics.subscriberCount) || 0;
                break;
              case "videos":
                metricValue = parseInt(statistics.videoCount) || 0;
                break;
              default:
                metricValue = 0;
            }
          }
          setDynamicValue(metricValue);
        }

        setDynamicChange(null);
      } catch (err) {
        console.error("Error fetching YouTube statistics:", err);
        setError("Failed to load statistics data");
        setDynamicValue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    ytChannel_Id,
    apiBaseUrl,
    isDynamic,
    metricType,
    startDate,
    endDate,
    data,
  ]);

  // Render tooltip
  const renderTooltip = (props) => (
    <Tooltip id="youtube-card-tooltip" {...props}>
      {tooltipDescription}
    </Tooltip>
  );

  if (isHidden) return null;
  if (loading) return <Loader small />;

  return (
    <Card
      className="metric-card shadow-sm border-0"
      style={{ borderRadius: "0px" }}
    >
      <Card.Body className="p-3">
        <div className="d-flex align-items-center">
          <div
            className="me-3"
            style={{
              fontSize: "2.5rem",
              color: Color || "#007BFF",
              width: "60px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <h6
                className="mb-0"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                {title}
              </h6>
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
            <h4 className="mb-0" style={{ fontWeight: "600" }}>
              {error
                ? "N/A"
                : typeof value === "number"
                ? value.toLocaleString()
                : value}
            </h4>
            {error && <small className="text-danger">{error}</small>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default YoutubeCards;
