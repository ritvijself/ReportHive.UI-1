import React, { useState, useEffect } from "react";
import Loader from "../../../Loader/Loader";
import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const GAdsCard = ({
  title,
  value: propValue,
  change: propChange,
  pageId,
  data,

  metricType,
}) => {
  const [loading, setLoading] = useState(!!pageId);
  const [dynamicValue, setDynamicValue] = useState(0);
  const [dynamicChange, setDynamicChange] = useState(null);
  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const isDynamic = !!pageId;
  const value = isDynamic ? dynamicValue : propValue;
  const change = isDynamic ? dynamicChange : propChange;

  const getTooltipDescription = (metricType, title) => {
    switch (metricType) {
      case "fan_count":
        return "Total number of fans for the selected page";
      case "followers_count":
        return "Shows the total number of followers for a Facebook page.";
      case "likeCount":
        return "Shows the total number of Post Likes for a Facebook page.";
      default:
        return title
          ? `Calculates the total ${title} from all posts on the Facebook page.`
          : "Social media metric data";
    }
  };

  useEffect(() => {
    if (!pageId) {
      if (isDynamic) {
        setError("Page ID is required");
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
            body: JSON.stringify({ pageId }),
          }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const responseData = await response.json();

        let count = 0;
        if (responseData.fan_count !== undefined)
          count = responseData.fan_count;
        else if (responseData.followers_count !== undefined)
          count = responseData.followers_count;
        else if (responseData.likeCount !== undefined)
          count = responseData[metricType] || 0;

        setDynamicValue(count || 0);
        setDynamicChange(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data");
        setDynamicValue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, apiBaseUrl, isDynamic, data, metricType]);

  const renderTooltip = (props) => (
    <Tooltip id="metric-tooltip" {...props}>
      {getTooltipDescription(metricType, title)}
    </Tooltip>
  );

  if (loading) return <Loader small />;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="text-muted fw-semibold mb-0">{title || "Metric"}</h6>
        </div>
        <div
          className="mt-auto text-center fw-bold "
          style={{ fontSize: "35px" }}
        >
          {error || value === undefined || value === null
            ? "0"
            : typeof value === "number"
            ? value.toLocaleString()
            : value}
        </div>
      </div>
    </div>
  );
};

export default GAdsCard;
