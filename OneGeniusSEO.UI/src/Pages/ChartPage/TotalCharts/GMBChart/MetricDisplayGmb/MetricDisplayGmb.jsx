import React, { useEffect, useState } from "react";
import Loader from "../../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../../utils/FormatDate";
import styles from "./MetricDisplayGmb.module.css";

const MetricDisplayGMB = ({
  accountId,
  locationId,
  startDate,
  endDate,
  SquareBox,
  title,
  viewType = "chart",
  code,
}) => {
  const [metricData, setMetricData] = useState([]);
  const [dataShowType, setDataShowType] = useState(viewType);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatNumber = (value) =>
    isNaN(value) ? "-" : Number(value).toLocaleString();

  const getMetricInfo = (type, value) => {
    const formatted = {
      CALL_CLICKS: { title: "Call Clicks", value: formatNumber(value) },
      WEBSITE_CLICKS: { title: "Website Clicks", value: formatNumber(value) },
      BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: {
        title: "Desktop Search Impressions",
        value: formatNumber(value),
      },
      BUSINESS_IMPRESSIONS_MOBILE_SEARCH: {
        title: "Mobile Search Impressions",
        value: formatNumber(value),
      },
      BUSINESS_DIRECTION_REQUESTS: {
        title: "Direction Requests",
        value: formatNumber(value),
      },
      BUSINESS_IMPRESSIONS_MOBILE_MAPS: {
        title: "Mobile Maps Impressions",
        value: formatNumber(value),
      },
      BUSINESS_IMPRESSIONS_DESKTOP_MAPS: {
        title: "Desktop Maps Impressions",
        value: formatNumber(value),
      },
    };
    return (
      formatted[type] || {
        title: type.replace(/_/g, " "),
        value: formatNumber(value),
      }
    );
  };

  const getMonthLabel = (year, month) => {
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const fetchDataShowType = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/GMBCustomizeMonthApiList/get-datashowtype/${code}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
            accountId,
            locationId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Fetch metric data error:", error);
      return { multiDailyMetricTimeSeries: [] };
    }
  };

  const processTableData = (data) => {
    const timeSeries =
      data?.multiDailyMetricTimeSeries?.[0]?.dailyMetricTimeSeries;
    if (!timeSeries) return [];

    const monthlyData = {};
    timeSeries.forEach((metric) => {
      metric.timeSeries.datedValues.forEach((item) => {
        const monthKey = `${item.date.year}-${item.date.month}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            year: item.date.year,
            month: item.date.month,
            metrics: {},
          };
        }
        monthlyData[monthKey].metrics[metric.dailyMetric] =
          (monthlyData[monthKey].metrics[metric.dailyMetric] || 0) +
          (parseFloat(item.value) || 0);
      });
    });

    return Object.entries(monthlyData)
      .map(([monthKey, data]) => ({
        date: getMonthLabel(data.year, data.month),
        dateKey: monthKey,
        ...data.metrics,
      }))
      .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
  };

  const processCardData = (data) => {
    const timeSeries =
      data?.multiDailyMetricTimeSeries?.[0]?.dailyMetricTimeSeries;
    if (!timeSeries) return {};

    const monthlyTotals = {};
    timeSeries.forEach((metric) => {
      const monthlySums = {};
      metric.timeSeries.datedValues.forEach((item) => {
        const monthKey = `${item.date.year}-${item.date.month}`;
        monthlySums[monthKey] =
          (monthlySums[monthKey] || 0) + (parseFloat(item.value) || 0);
      });
      const latestMonth = Object.keys(monthlySums).sort((a, b) =>
        b.localeCompare(a)
      )[0];
      monthlyTotals[metric.dailyMetric] = monthlySums[latestMonth] || 0;
    });

    return monthlyTotals;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const showType = await fetchDataShowType();
        setDataShowType(showType);

        let data = [];
        if (SquareBox?.data) {
          data = SquareBox.data;
        } else if (accountId && locationId) {
          const response = await fetchMetricData();
          if (
            response.IsSuccess === true &&
            response.Data === null &&
            response.Message === "User wants to hide this API"
          ) {
            setIsHidden(true);
            return;
          }
          data = response;
        }
        setMetricData(data);
      } catch (err) {
        console.error("Processing error:", err);
        setMetricData({ multiDailyMetricTimeSeries: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accountId, locationId, startDate, endDate, SquareBox, code]);

  if (loading) return <Loader />;
  if (isHidden) return null;

  if (dataShowType === "table") {
    const tableData = processTableData(metricData);
    const latestDateKey =
      tableData.length > 0 ? tableData[tableData.length - 1].dateKey : null;

    const metrics = [
      "CALL_CLICKS",
      "WEBSITE_CLICKS",
      "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
      "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
      "BUSINESS_DIRECTION_REQUESTS",
      "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
      "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    ];

    const descriptions = {
      CALL_CLICKS: "Number of calls made via business listing.",
      WEBSITE_CLICKS: "Number of website clicks via GMB.",
      BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: "Desktop search impressions.",
      BUSINESS_IMPRESSIONS_MOBILE_SEARCH: "Mobile search impressions.",
      BUSINESS_DIRECTION_REQUESTS: "Directions requested from Maps.",
      BUSINESS_IMPRESSIONS_MOBILE_MAPS: "Impressions from mobile maps.",
      BUSINESS_IMPRESSIONS_DESKTOP_MAPS: "Impressions from desktop maps.",
    };

    const rowData = metrics.map((metricKey) => ({
      key: metricKey,
      label: getMetricInfo(metricKey, 0).title,
      values: tableData.map((m) => formatNumber(m[metricKey])),
      description: descriptions[metricKey] || "-",
    }));

    return (
      <div className="card shadow-sm p-3">
        <h5 className={`mb-3 ${styles.cardTitle}`}>
          {title || "Monthly Metrics Overview"}
        </h5>
        <div className="table-responsive">
          <table
            className="table table-sm"
            style={{ border: "1px solid black" }}
          >
            <thead>
              <tr>
                <th
                  className={`${styles.tableHeader} ${styles.tableHeaderMetric}`}
                >
                  Metric
                </th>
                {tableData.map((item, idx) => (
                  <th
                    key={idx}
                    className={`${styles.tableHeader} ${styles.tableHeaderDate}`}
                  >
                    {item.date}
                  </th>
                ))}
                <th
                  className={`${styles.tableHeader} ${styles.tableHeaderDescription}`}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {rowData.map((row, idx) => (
                <tr key={idx}>
                  <td className={styles.tableCell}>{row.label}</td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className={`${styles.tableCell} ${
                        tableData[i].dateKey === latestDateKey
                          ? styles.highlight
                          : ""
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                  <td
                    className={`${styles.tableCell} ${styles.descriptionCell}`}
                  >
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const totals = processCardData(metricData);
  const metrics = totals
    ? Object.keys(totals).map((key) => ({
        key,
        ...getMetricInfo(key, totals[key]),
      }))
    : [];

  return (
    <div className="row">
      {metrics.length > 0 ? (
        metrics.map((metric) => (
          <div key={metric.key} className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="text-muted mb-0 fw-semibold">
                    {metric.title}
                  </h6>
                </div>
                <div
                  className="mt-auto text-center fw-bold"
                  style={{ marginBottom: "20px", fontSize: "35px" }}
                >
                  {metric.value}
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

export default MetricDisplayGMB;
