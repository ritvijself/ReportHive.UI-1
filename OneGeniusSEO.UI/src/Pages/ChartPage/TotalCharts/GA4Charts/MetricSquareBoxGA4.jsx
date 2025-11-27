import React, { useEffect, useState } from "react";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const MetricSquareBoxGA4 = ({
  propertyId,
  startDate,
  endDate,
  metricType,
  SquareBox,
  title,
  sign,
  onMetricValueChange,
}) => {
  const [metricValue, setMetricValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatNumber = (value) =>
    isNaN(value) ? "-" : Number(value).toLocaleString();

  const formatPercentage = (value) => (
    <>
      {value}
      <sup>{sign || ""}</sup>
    </>
  );

  const formatSecondsToHMS = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const calculateMetric = (data, type) => {
    if (!data) return 0;
    const isArray = Array.isArray(data);
    const sum = (key) =>
      data.reduce((acc, item) => acc + parseFloat(item[key] || 0), 0);

    switch (type) {
      case "bounce":
        if (!isArray && data.bounceRate !== undefined) {
          return (parseFloat(data.bounceRate) * 100).toFixed(2);
        }
        return isArray ? (sum("bounceRate") * 100) / data.length : 0;
      case "engagementDuration":
        return isArray ? sum("userEngagementDuration") : 0;
      case "engagement":
        return isArray ? sum("engagementRate") : 0;
      case "events":
        return isArray ? sum("eventCount") : 0;
      default:
    
        return isArray && data[0]?.totalUsers
          ? parseFloat(data[0].totalUsers)
          : 0;
    }
  };

  const getApiEndpoint = (type) => {
    switch (type) {
      case "bounce":
        return "bounce-rate";
      case "engagementDuration":
        return "user-Engagement-Duration-DayByDay";
      case "users":
        return "total-users"; 
      default:
        return "devices";
    }
  };

  const fetchMetricData = async () => {
    try {
      const endpoint = getApiEndpoint(metricType);

      const response = await fetch(
        `${apibaseurl}/api/google-analytics/report/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error(`Fetch error (${metricType}):`, error);
      return metricType === "bounce" ? { bounceRate: 0 } : [];
    }
  };

  const getMetricInfo = (type, value) => {
    const formatted = {
      users: {
        title: "Total Users",
        value: formatNumber(value),
      },
      engagement: {
        title: "Engagement Rate",
        value: formatPercentage(value),
      },
      events: {
        title: "Event Count",
        value: formatNumber(value),
      },
      bounce: {
        title: "Bounce Rate",
        value: formatPercentage(value),
      },
      engagementDuration: {
        title: "Engagement Duration",
        value: formatSecondsToHMS(value),
      },
    };

    return (
      formatted[type] || {
        title: title || "Metric",
        value: formatNumber(value),
      }
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let value = 0;

        if (metricType !== "users" && SquareBox?.data) {
         
          value = calculateMetric(SquareBox.data, metricType);
        } else if (propertyId) {
        
          const data = await fetchMetricData();
          value = calculateMetric(data, metricType);
        }

        setMetricValue(value);
        onMetricValueChange?.(value);
      } catch (err) {
        console.error("Processing error:", err);
        setMetricValue(0);
        onMetricValueChange?.(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propertyId, startDate, endDate, metricType, SquareBox]);

  const metricInfo = getMetricInfo(metricType, metricValue);

  if (loading) return <Loader />;

  return (
    <div className="col-md-12 col-sm-12">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="text-muted mb-0 fw-semibold">
              {title || metricInfo.title}
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

export default MetricSquareBoxGA4;
