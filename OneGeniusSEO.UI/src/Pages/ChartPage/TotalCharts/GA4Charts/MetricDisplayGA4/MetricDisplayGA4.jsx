import React, { useEffect, useState } from "react";
import Loader from "../../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../../utils/FormatDate";
import styles from "./MetricDisplayGA4.module.css";

const MetricDisplayGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  sign,
  viewType = "chart",
  code,
}) => {
  const [metricData, setMetricData] = useState(null);
  const [dataShowType, setDataShowType] = useState(viewType);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatNumber = (value) =>
    isNaN(value) ? "-" : Number(value).toLocaleString();

  const formatPercentage = (value) => (
    <>
      {isNaN(value) ? "-" : parseFloat(value).toFixed(2)}
      <sup>{sign || "%"}</sup>
    </>
  );

  const formatPercentageValue = (value) =>
    isNaN(value) ? "-" : parseFloat(value).toFixed(2);

  const getMetricInfo = (type, value) => {
    const formatted = {
      totalUsers: {
        title: "Total Users",
        value: formatNumber(value),
      },
      engagementRate: {
        title: "Engagement Rate",
        value: formatPercentage(value * 100),
      },
      eventCount: {
        title: "Event Count",
        value: formatNumber(value),
      },
      bounceRate: {
        title: "Bounce Rate",
        value: formatPercentage(value * 100),
      },
      conversions: {
        title: "Conversions",
        value: formatNumber(value),
      },
    };
    return formatted[type] || { title: "Metric", value: formatNumber(value) };
  };

  const getTrendIcon = (percent, metricKey) => {
    if (isNaN(percent)) return null;

    // Reverse logic for bounce rate
    if (metricKey === "bounceRate") {
      if (percent > 0) return "↗️"; // Increase = bad
      if (percent < 0) return "↘️"; // Decrease = good
    } else {
      // Normal logic for other metrics
      if (percent > 0) return "↗️"; // Increase = good
      if (percent < 0) return "↘️"; // Decrease = bad
    }
    return "➡️";
  };

  const getTrendClass = (percent, metricKey) => {
    if (isNaN(percent)) return "";

    // Reverse logic for bounce rate - decrease is good, increase is bad
    if (metricKey === "bounceRate") {
      if (percent > 0) return styles.negativeTrend; // Increase in bounce rate = bad (red)
      if (percent < 0) return styles.positiveTrend; // Decrease in bounce rate = good (green)
    } else {
      // Normal logic for other metrics
      if (percent > 0) return styles.positiveTrend; // Increase = good (green)
      if (percent < 0) return styles.negativeTrend; // Decrease = bad (red)
    }

    return styles.neutralTrend;
  };

  const fetchDataShowType = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/GA4CustomizeMonthApiList/get-datashowtype/${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      return data.dataShowType || viewType;
    } catch (error) {
      console.error("Fetch dataShowType error:", error);
      return viewType;
    }
  };

  const fetchMetricData = async () => {
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
            propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return null;
      }

      return result;
    } catch (error) {
      console.error("Fetch metric data error:", error);
      return null;
    }
  };

  const processTableData = (data) => {
    if (!data?.metrics) return [];

    const metrics = [
      "totalUsers",
      "engagementRate",
      "eventCount",
      "bounceRate",
      "conversions",
    ];

    return metrics.map((metricKey) => {
      const metric = data.metrics[metricKey];
      return {
        key: metricKey,
        label: getMetricInfo(metricKey, 0).title,
        current: metric.current,
        previousPeriod: metric.previousPeriod,
        previousYear: metric.previousYear,
        changeFromPreviousPeriod: metric.changeFromPreviousPeriodPercent,
        changeFromPreviousYear: metric.changeFromPreviousYearPercent,
      };
    });
  };

  const processCardData = (data) => {
    if (!data?.metrics) return [];

    const metrics = [
      "totalUsers",
      "engagementRate",
      "eventCount",
      "bounceRate",
      "conversions",
    ];

    return metrics.map((metricKey) => {
      const metric = data.metrics[metricKey];
      const metricInfo = getMetricInfo(metricKey, metric.current);

      return {
        key: metricKey,
        title: metricInfo.title,
        currentValue: metricInfo.value,
        currentRaw: metric.current,
        previousPeriod: metric.previousPeriod,
        previousYear: metric.previousYear,
        changeFromPreviousPeriod: metric.changeFromPreviousPeriodPercent,
        changeFromPreviousYear: metric.changeFromPreviousYearPercent,
      };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const showType = await fetchDataShowType();
        setDataShowType(showType);

        let data = null;
        if (SquareBox?.data) {
          data = SquareBox.data;
        } else if (propertyId) {
          data = await fetchMetricData();
        }
        setMetricData(data);
      } catch (err) {
        console.error("Processing error:", err);
        setMetricData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propertyId, startDate, endDate, SquareBox, code]);

  if (isHidden) return null;

  if (loading) return <Loader />;

  if (dataShowType === "table") {
    const tableData = processTableData(metricData?.data);

    const metricDescriptions = {
      totalUsers:
        "The overall number of unique individuals who visited your site or app during the chosen period.",
      engagementRate:
        "A higher engagement rate suggests users are finding value and interacting with your content.",
      eventCount:
        "Total number of times a specific user interaction or event occurs on a website or app.",
      bounceRate:
        "Percentage of sessions that were not engaged (under 10 seconds, no conversion, or only 1 pageview).",
      conversions:
        "Key user actions like purchases, form submissions, or signups defined as success indicators.",
    };

    return (
      <div className="card shadow-sm p-3">
        <h5
          className={styles.cardTitle}
          style={{ color: SquareBox?.color || "black" }}
        >
          {title || "Metrics Comparison Overview"}
        </h5>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className={`${styles.tableHeader}`}>Metric</th>
                <th className={`${styles.tableHeader}`}>Current</th>
                <th className={`${styles.tableHeader}`}>Previous Period</th>
                <th className={`${styles.tableHeader}`}>Previous Year</th>
                <th className={`${styles.tableHeader}`}>Change vs Prev Period</th>
                <th className={`${styles.tableHeader}`}>Change vs Prev Year</th>
                <th className={`${styles.tableHeader} ${styles.tableHeaderDesc}`}>
                  Description
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableCell}>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.label}</td>
                  <td className={styles.highlightedCell}>
                    {row.key === "engagementRate" || row.key === "bounceRate"
                      ? formatPercentage(row.current * 100)
                      : formatNumber(row.current)}
                  </td>
                  <td>
                    {row.key === "engagementRate" || row.key === "bounceRate"
                      ? formatPercentage(row.previousPeriod * 100)
                      : formatNumber(row.previousPeriod)}
                  </td>
                  <td>
                    {row.key === "engagementRate" || row.key === "bounceRate"
                      ? formatPercentage(row.previousYear * 100)
                      : formatNumber(row.previousYear)}
                  </td>
                  <td className={getTrendClass(row.changeFromPreviousPeriod, row.key)}>
                    {getTrendIcon(row.changeFromPreviousPeriod, row.key)} {formatPercentageValue(row.changeFromPreviousPeriod)}%
                  </td>
                  <td className={getTrendClass(row.changeFromPreviousYear, row.key)}>
                    {getTrendIcon(row.changeFromPreviousYear, row.key)} {formatPercentageValue(row.changeFromPreviousYear)}%
                  </td>
                  <td className={styles.descriptionCell}>
                    {metricDescriptions[row.key] || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Card view with comparison data
  const cardData = processCardData(metricData?.data);

  return (
    <div className="row">
      {cardData.length > 0 ? (
        cardData.map((metric) => (
          <div key={metric.key} className="col-md">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="text-muted mb-0 fw-semibold">
                    {metric.title}
                  </h6>
                </div>

                {/* Current Value */}
                <div className={`mt-auto text-center fw-bold ${styles.metricValue}`}>
                  {metric.currentValue}
                </div>

                {/* Comparison Data */}
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '14px' }}>
                    <small className="text-muted">Prev Month:</small>
                    <small className={getTrendClass(metric.changeFromPreviousPeriod, metric.key)}>
                      {getTrendIcon(metric.changeFromPreviousPeriod, metric.key)} {formatPercentageValue(metric.changeFromPreviousPeriod)}%
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '14px' }}>
                    <small className="text-muted">Prev Year:</small>
                    <small className={getTrendClass(metric.changeFromPreviousYear, metric.key)}>
                      {getTrendIcon(metric.changeFromPreviousYear, metric.key)} {formatPercentageValue(metric.changeFromPreviousYear)}%
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-12 text-center text-muted">No data available</div>
      )}
    </div>
  );
};

export default MetricDisplayGA4;