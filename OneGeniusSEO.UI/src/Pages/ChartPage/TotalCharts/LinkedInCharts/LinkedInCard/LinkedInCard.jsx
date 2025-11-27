import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatDateLocal } from "../../../../../utils/FormatDate";

const LinkedInCard = ({ title, value, metricType }) => {
  const getTooltipDescription = (metricType, title) => {
    switch (metricType) {
      case "followers":
        return "Total number of followers for your LinkedIn company page.";
      case "impressions":
        return "Number of times your LinkedIn content was displayed to users.";
      case "clicks":
        return "Number of clicks on your LinkedIn posts or ads.";
      case "engagementRate":
        return "Percentage of people who interacted with your content.";
      case "likes":
        return "Number of likes on your posts.";
      default:
        return title
          ? `Static LinkedIn metric: ${title}`
          : "LinkedIn metric data";
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="linkedin-tooltip" {...props}>
      {getTooltipDescription(metricType, title)}
    </Tooltip>
  );

  return (
    <div
      className="card shadow-sm h-100"
      style={{ flex: 1, minWidth: "150px" }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="text-muted fw-semibold mb-0">{title || "Metric"}</h6>
          {/* Tooltip can be enabled if needed */}
        </div>
        <div
          className="mt-auto text-center fw-bold"
          style={{ fontSize: "35px" }}
        >
          {value !== undefined && value !== null
            ? typeof value === "number"
              ? value.toLocaleString()
              : value
            : "0"}
        </div>
      </div>
    </div>
  );
};

const LinkedInDashboard = ({ linkedInUserId, startDate, endDate }) => {
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [metricsData, setMetricsData] = useState({
    followers: 0,
    totalFollowers: 0,
    uniqueImpressions: 0,
    totalImpressions: 0,
    engagement: 0,
    clicks: 0,
    likes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  // Helper to fetch metric totals
  const fetchMetric = async (endpoint) => {
    try {
      const res = await fetch(
        `${apibaseurl}/api/LinkedinPageReportApi/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: linkedInUserId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);

      const data = await res.json();
      if (!data.isSuccess) return 0;

      // Handle total-followers separately
      if (endpoint === "total-followers") return data.data?.TotalFollowers ?? 0;

      return data.data?.Total ?? 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  useEffect(() => {
    const fetchAllMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          followers,
          totalFollowers,
          uniqueImpressions,
          totalImpressions,
          engagement,
          clicks,
          likes,
        ] = await Promise.all([
          fetchMetric("followers"),
          fetchMetric("total-followers"),
          fetchMetric("unique-impressions"),
          fetchMetric("total-impressions"),
          fetchMetric("engagement"),
          fetchMetric("clicks"),
          fetchMetric("likes"),
        ]);

        setMetricsData({
          followers,
          totalFollowers,
          uniqueImpressions,
          totalImpressions,
          engagement,
          clicks,
          likes,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch metrics");
      } finally {
        setIsLoading(false);
      }
    };

    if (linkedInUserId && formattedStart && formattedEnd) {
      fetchAllMetrics();
    } else {
      setError("Missing required props: linkedInUserId, startDate, or endDate");
      setIsLoading(false);
    }
  }, [linkedInUserId, formattedStart, formattedEnd, apibaseurl]);

  const metrics = [
    {
      title: "Followers",
      value: metricsData.followers,
      metricType: "followers",
    },
    {
      title: "Lifetime Followers",
      value: metricsData.totalFollowers,
      metricType: "followers",
    },
    {
      title: "Unique Impressions",
      value: metricsData.uniqueImpressions,
      metricType: "impressions",
    },
    {
      title: "Total Impressions",
      value: metricsData.totalImpressions,
      metricType: "impressions",
    },
    {
      title: "Engagement",
      value: metricsData.engagement,
      metricType: "engagementRate",
    },
    { title: "Clicks", value: metricsData.clicks, metricType: "clicks" },
    { title: "Likes", value: metricsData.likes, metricType: "likes" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        flexWrap: "nowrap",
        overflowX: "auto",
      }}
    >
      {metrics.map((metric, idx) => (
        <LinkedInCard key={idx} {...metric} />
      ))}
    </div>
  );
};

export default LinkedInDashboard;
