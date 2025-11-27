import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./ProgressBar.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds)) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const ProgressBar = ({
  propertyid,
  Progress,
  title,
  startDate,
  endDate,
  barColor,
  siteUrl,
  height,
  titleSize,
}) => {
  const [loading, setLoading] = useState(true);
  const [queriesData, setQueriesData] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  const url = `${apibaseurl}/api/${Progress.apiurl}/${Progress.url}`;

  const getTooltipDescription = () => {
    switch (Progress.url) {
      case "traffic-source":
        return "Shows where your website visitors are coming from (e.g. Google, Facebook).";
      case "conversions-by-source":
        return "Shows conversions broken down by traffic source.";
      case "country-engagement":
        return "Shows user engagement duration by country.";
      case "event-by-device":
        return `Shows event counts for "${
          queriesData[0]?.eventName || "specific events"
        }" by device category.`;
      default:
        return "Metrics for your site or Google My Business data";
    }
  };

  useEffect(() => {
    if (!propertyid && !siteUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setQueriesData([]);

      try {
        const requestBody = Progress.requiresSiteUrl
          ? {
              siteUrl: siteUrl,
              startDate: formattedStart,
              endDate: formattedEnd,
            }
          : {
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        let rawResult = await response.json();

        if (
          rawResult.isSuccess === true &&
          rawResult.data === null &&
          rawResult.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        let result =
          Array.isArray(rawResult?.data) || typeof rawResult?.data === "object"
            ? rawResult.data
            : rawResult;

        let formattedData = [];
        let topItemsCount = 5;

        if (Array.isArray(result)) {
          if (
            result.length > 0 &&
            result[0].deviceCategory !== undefined &&
            result[0].eventName !== undefined &&
            result[0].eventCount !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.deviceCategory || "N/A",
              click: Number(row.eventCount) || 0,
              eventName: row.eventName || "N/A",
              isDuration: false,
            }));
            topItemsCount = 3;
          } else if (
            result.length > 0 &&
            result[0].deviceCategory !== undefined &&
            result[0].eventCount !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.deviceCategory || "N/A",
              click: Number(row.eventCount) || 0,
              isDuration: false,
            }));
            topItemsCount = 3;
          } else if (
            result.length > 0 &&
            result[0].deviceCategory !== undefined &&
            result[0].engagementRate !== undefined
          ) {
            formattedData = result.map((row) => {
              const engagementRate = Number(row.engagementRate) || 0;
              return {
                label: row.deviceCategory || "N/A",
                click: engagementRate,
                displayValue: (engagementRate * 100).toFixed(2) + "%",
                isDuration: false,
                isPercentage: true,
              };
            });
            topItemsCount = 3;
          } else if (
            result.length > 0 &&
            result[0].deviceCategory !== undefined &&
            result[0].engagedSessions !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.deviceCategory || "N/A",
              click: Number(row.engagedSessions) || 0,
              isDuration: false,
            }));
            topItemsCount = 3;
          } else if (
            result.length > 0 &&
            result[0].pagePath !== undefined &&
            result[0].screenPageViews !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.pagePath || "N/A",
              click: Number(row.screenPageViews) || 0,
              fullUrl: row.pagePath,
              isDuration: false,
            }));
            topItemsCount = 5;
          } else if (
            result.length > 0 &&
            result[0].pagePath !== undefined &&
            result[0].totalUsers !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.pagePath || "N/A",
              click: Number(row.totalUsers) || 0,
              fullUrl: row.pagePath,
              isDuration: false,
            }));
            topItemsCount = 5;
          } else if (
            result.length > 0 &&
            result[0].country !== undefined &&
            result[0].totalUsers !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.country || "N/A",
              click: Number(row.totalUsers) || 0,
              isDuration: false,
            }));
            topItemsCount = 6;
          } else if (
            result.length > 0 &&
            result[0].city !== undefined &&
            result[0].totalUsers !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.city || "N/A",
              click: Number(row.totalUsers) || 0,
              isDuration: false,
            }));
            topItemsCount = 6;
          } else if (
            result.length > 0 &&
            result[0].language !== undefined &&
            result[0].totalUsers !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.language || "N/A",
              click: Number(row.totalUsers) || 0,
              isDuration: false,
            }));
            topItemsCount = 4;
          } else if (
            result.length > 0 &&
            result[0].Query !== undefined &&
            result[0].Clicks !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.Query || "N/A",
              click: Number(row.Clicks) || 0,
              isDuration: false,
            }));
          } else if (
            result.length > 0 &&
            result[0].Page !== undefined &&
            result[0].Clicks !== undefined
          ) {
            formattedData = result.map((row) => ({
              label: row.Page || "N/A",
              click: Number(row.Clicks) || 0,
              fullUrl: row.Page,
              isDuration: false,
            }));
          } else {
            formattedData = result.map((row) => ({
              label: row.dimension || row.query || "N/A",
              click: Number(row.metric) || 0,
              isDuration: false,
            }));
          }
        } else if (result.rows && Array.isArray(result.rows)) {
          if (
            result.dimensionHeaders?.some(
              (header) => header.name === "country"
            ) &&
            result.metricHeaders?.some(
              (header) => header.name === "userEngagementDuration"
            )
          ) {
            formattedData = result.rows.map((row) => ({
              label: row.country || "N/A",
              click: Number(row.userEngagementDuration) || 0,
              isDuration: true,
            }));
            topItemsCount = 4;
          }
        } else if (result && typeof result === "object") {
          formattedData = [
            {
              label:
                result.Query ||
                result.Page ||
                result.dimension ||
                result.query ||
                title ||
                "Total",
              click: Number(result.Clicks || result.metric) || 0,
              ...(result.Page ? { fullUrl: result.Page } : {}),
              isDuration: false,
            },
          ];
        }

        formattedData.sort((a, b) => b.click - a.click);
        formattedData = formattedData.slice(0, topItemsCount);

        const defaultColor = "#FFA500";
        const colorToUse = barColor || defaultColor;
        const coloredData = formattedData.map((item) => ({
          ...item,
          color: colorToUse,
        }));

        setQueriesData(coloredData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setQueriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    propertyid,
    siteUrl,
    url,
    formattedStart,
    formattedEnd,
    Progress.requiresSiteUrl,
    barColor,
    title,
  ]);
  if (isHidden) return null;

  if (loading) {
    return (
      <div className={style.progressbar_box} style={{ height: height }}>
        <div className="d-flex align-items-center mb-3">
          <div className={style.progressbar_title}>{title}</div>
        </div>
        <Loader />
      </div>
    );
  }

  const totalClicks = queriesData.reduce((sum, item) => sum + item.click, 0);

  return (
    <div
      className={`${style.progressbar_box} card shadow-sm p-3 h-100`}
      style={{ height: height }}
    >
      <div className="d-flex align-items-center mb-3 ">
        <div
          className={style.progressbar_title}
          style={{ fontSize: titleSize }}
        >
          {title}
        </div>
      </div>
      {queriesData.length > 0 ? (
        queriesData.map((item, index) => {
          const pct = totalClicks > 0 ? (item.click / totalClicks) * 100 : 0;
          return (
            <div key={index} className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontSize: 11, fontWeight: 500, color: "#444" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      marginRight: 6,
                    }}
                  ></span>{" "}
                  <span
                    className={style.truncateText}
                    style={{ textTransform: "capitalize" }}
                  >
                    {item.label}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: "bold" }}>
                  {item.isPercentage && item.displayValue
                    ? item.displayValue
                    : item.isDuration
                    ? formatSecondsToHMS(item.click)
                    : item.click.toLocaleString()}
                </div>
              </div>
              <div
                className="progress"
                style={{
                  height: 8,
                  backgroundColor: "#f0f0f5",
                  borderRadius: 4,
                  marginTop: 4,
                }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                    borderRadius: 4,
                  }}
                  aria-valuenow={pct}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-muted text-center">No data available</p>
      )}
    </div>
  );
};

export default ProgressBar;
