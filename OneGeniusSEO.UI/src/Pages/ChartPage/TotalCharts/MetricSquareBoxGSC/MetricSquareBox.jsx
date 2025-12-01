import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";
import styles from "./MetricSquareBox.module.css";

const MetricSquareBox = ({ siteUrl, startDate, endDate, SquareBox, showComparison = true, }) => {
  const [metricData, setMetricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  const formatNumber = (value) =>
    isNaN(value) ? "-" : Number(value).toLocaleString();

  const formatPercentage = (value) =>
    isNaN(value) ? "-" : parseFloat(value).toFixed(2);

  const formatCTR = (value) => {
    if (isNaN(value)) return "-";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const formatPosition = (value) => {
    if (isNaN(value)) return "-";
    return parseFloat(value).toFixed(1);
  };

  const getTrendIcon = (percent) => {
    if (isNaN(percent)) return null;
    if (percent > 0) return "↗️";
    if (percent < 0) return "↘️";
    return "➡️";
  };

  const getTrendClass = (percent, metricKey) => {
    if (isNaN(percent)) return "";

    // For position metric, lower is better (negative change is good)
    if (metricKey === "position") {
      if (percent < 0) return styles.positiveTrend; // Position improved = good (green)
      if (percent > 0) return styles.negativeTrend; // Position worsened = bad (red)
    } else {
      // For clicks, impressions, CTR - higher is better
      if (percent > 0) return styles.positiveTrend; // Increase = good (green)
      if (percent < 0) return styles.negativeTrend; // Decrease = bad (red)
    }

    return styles.neutralTrend;
  };

  const fetchData = async () => {
    if (!siteUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
            siteUrl: siteUrl,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      if (result.isSuccess && result.data) {
        setMetricData(result.data);
      } else {
        setMetricData(null);
      }
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      setMetricData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteUrl, startDate, endDate]);

  const renderTooltip = (title, description) => (props) =>
  (
    <Tooltip id={`${title}-tooltip`} {...props}>
      {description}
    </Tooltip>
  );

  const metricItems = [
    {
      key: "clicks",
      title: "Clicks",
      description: "Total clicks from Google Search",
      tooltip: renderTooltip("Clicks", "Total clicks from Google Search"),
      formatValue: formatNumber,
    },
    {
      key: "impressions",
      title: "Impressions",
      description: "Total impressions in Google Search",
      tooltip: renderTooltip(
        "Impressions",
        "Total times your site appeared in search results"
      ),
      formatValue: formatNumber,
    },
    {
      key: "ctr",
      title: "CTR",
      description: "Click-through rate",
      tooltip: renderTooltip(
        "CTR",
        "Percentage of impressions that resulted in a click"
      ),
      formatValue: formatCTR,
    },
    {
      key: "position",
      title: "Avg Position",
      description: "Average position in search results",
      tooltip: renderTooltip(
        "Avg Position",
        "Average ranking position in search results (lower is better)"
      ),
      formatValue: formatPosition,
    },
  ];

  if (isHidden) {
    return null;
  }

  if (loading) {
    return <Loader />;
  }

  if (!metricData || !metricData.summary) {
    return (
      <div className="row g-3">
        {metricItems.map((item, index) => (
          <div key={index} className="col-md-3 col-sm-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="text-muted mb-0 fw-semibold">{item.title}</h6>
                  <OverlayTrigger placement="top" overlay={item.tooltip}>
                    <span className="text-muted">
                      <FaInfoCircle size={14} />
                    </span>
                  </OverlayTrigger>
                </div>
                <div className={`mt-auto text-center fw-bold ${styles.metricValue}`}>
                  -
                </div>
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '14px' }}>
                    <small className="text-muted">Prev Month:</small>
                    <small className={styles.neutralTrend}>-</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '14px' }}>
                    <small className="text-muted">Prev Year:</small>
                    <small className={styles.neutralTrend}>-</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { summary } = metricData;

  return (
    <div className="row g-3">
      {metricItems.map((item, index) => {
        const metric = summary[item.key];
        if (!metric) return null;

        return (
          <div key={index} className="col-md-3 col-sm-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="text-muted mb-0 fw-semibold">{item.title}</h6>
                  <OverlayTrigger placement="top" overlay={item.tooltip}>
                    <span className="text-muted">
                      <FaInfoCircle size={14} />
                    </span>
                  </OverlayTrigger>
                </div>

                {/* Current Value */}
                <div className={`mt-auto text-center fw-bold ${styles.metricValue}`}>
                  {item.formatValue(metric.current)}
                </div>

                {/* Comparison Data */}             
{!showComparison && (
  <div className="mt-2">
    {/* Previous Month Comparison */}
    <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '14px' }}>
      <small className="text-muted">Prev Month:</small>
      <small className={getTrendClass(metric.changeFromPreviousMonth, item.key)}>
      {getTrendIcon(metric.prevMonth || metric.changeFromPreviousMonth)}{" "}
{formatPercentage(metric.prevMonth || metric.changeFromPreviousMonth)}%

      </small>
    </div>

    {/* Previous Year Comparison */}
    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '14px' }}>
      <small className="text-muted">Prev Year:</small>
      <small className={getTrendClass(metric.changeFromPreviousYear, item.key)}>
           {getTrendIcon(metric.prevYear || metric.changeFromPreviousYear)}{" "}
        {formatPercentage(metric.prevYear || metric.changeFromPreviousYear)}%
      </small>
    </div>
  </div>
)}           
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricSquareBox;