import React, { useState, useEffect, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";
import { byIso } from "country-code-lookup";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./DeviceTable.module.css";

const formatNumber = (value) => parseInt(value || 0).toLocaleString();
const formatPercentage = (value) =>
  value ? `${(value * 100).toFixed(2)}%` : "0%";
const formatPosition = (value) => (value ? Number(value).toFixed(2) : "-");
const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds)) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const formatPositionGoogleMap = (value) => {
  if (!value) return "-";
  const num = Number(value);
  if (isNaN(num)) return "-";
  const j = num % 10,
    k = num % 100;
  let suffix = "th";
  if (j === 1 && k !== 11) suffix = "st";
  else if (j === 2 && k !== 12) suffix = "nd";
  else if (j === 3 && k !== 13) suffix = "rd";
  return (
    <span>
      {num}
      <sup>{suffix}</sup>
    </span>
  );
};

const DeviceTable = ({
  propertyid,
  SquareBox,
  startDate,
  endDate,
  columns = [],
  siteUrl,
  textTransform,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const deviceDataURL = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const [isHidden, setIsHidden] = useState(false);
  const squareBoxKey = useMemo(() => JSON.stringify(SquareBox), [SquareBox]);

  const getTooltipDescription = () => {
    switch (SquareBox.url) {
      case "performance-by-device":
        return "Shows how people searched for your website using mobile, desktop, or tablet devices.";
      case "performance-by-country":
        return "Shows how your website is performing in different countries.";
      case "popular-content":
        return "Lists the most visited pages on your website.";
      case "search-queries":
        return "Search terms people used to find your website.";
      case "organic-metrics":
        return "Performance of organic search traffic.";
      case "devices":
        return "Sessions by devices (mobile, desktop, tablet).";
      default:
        return "Performance metrics for the selected data type.";
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="device-table-tooltip" {...props}>
      {getTooltipDescription()}
    </Tooltip>
  );
  useEffect(() => {
    if (!propertyid && !siteUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const requestBody = SquareBox.requiresSiteUrl
          ? { siteUrl, startDate: formattedStart, endDate: formattedEnd }
          : {
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            };

        const res = await fetch(deviceDataURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        const response = await res.json();

        if (
          response.isSuccess === true &&
          response.data === null &&
          response.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        const result =
          Array.isArray(response?.data) || typeof response?.data === "object"
            ? response.data
            : response;

        let normalizedData = [];
        if (Array.isArray(result) && result[0]?.Device) {
          normalizedData = result.map((item) => ({
            device: item.Device || "-",
            clicks: formatNumber(item.Clicks),
            impressions: formatNumber(item.Impressions),
            ctr: formatPercentage(item.CTR),
            position: formatPosition(item.Position),
          }));
        } else if (Array.isArray(result) && result[0]?.Country) {
          normalizedData = result.map((item) => ({
            country: byIso(item.Country.toUpperCase())?.country || item.Country,
            countryCode: item.Country,
            clicks: formatNumber(item.Clicks),
            impressions: formatNumber(item.Impressions),
            ctr: formatPercentage(item.CTR),
            position: formatPosition(item.Position),
          }));
        } else if (Array.isArray(result) && result[0]?.Page) {
          normalizedData = result.map((item) => ({
            page: item.Page || "-",
            clicks: formatNumber(item.Clicks),
            impressions: formatNumber(item.Impressions),
            ctr: formatPercentage(item.CTR),
            position: formatPosition(item.Position),
          }));
        } else if (Array.isArray(result) && result[0]?.pagePath) {
          normalizedData = result.map((item) => ({
            pagePath: item.pagePath || "-",
            sessions: formatNumber(item.sessions),
            totalUsers: formatNumber(item.totalUsers),
            userEngagementDuration: formatSecondsToHMS(
              item.userEngagementDuration
            ),
            screenPageViews: formatNumber(item.screenPageViews),

            eventCount: formatNumber(item.eventCount),
            ecommercePurchases: formatNumber(item.ecommercePurchases),
          }));
        } else if (
          Array.isArray(result) &&
          result[0]?.Query &&
          !result[0]?.Clicks
        ) {
          normalizedData = result.map((item) => ({
            query: item.Query || "-",
            position: formatPositionGoogleMap(item.Position),
          }));
        } else if (Array.isArray(result) && result[0]?.Query) {
          normalizedData = result.map((item) => ({
            query: item.Query || "-",
            clicks: formatNumber(item.Clicks),
            impressions: formatNumber(item.Impressions),
            ctr: formatPercentage(item.CTR),
            position: formatPosition(item.Position),
          }));
        } else if (result.channel) {
          normalizedData = [
            {
              Channel: result.channel || "-",
              session: formatNumber(result.sessions),
              averagEngagementTimePerSession:
                result.averageSessionDuration || "-",
              bounceRate: formatPercentage(result.bounceRate),
            },
          ];
        } else if (
          Array.isArray(result) &&
          result[0]?.sessionDefaultChannelGroup
        ) {
          normalizedData = result.map((item) => ({
            channel: item.sessionDefaultChannelGroup || "-",
            sessions: formatNumber(item.sessions),
            totalUsers: formatNumber(item.totalUsers),
            userEngagementDuration: formatSecondsToHMS(
              item.userEngagementDuration
            ),
            screenPageViews: formatNumber(item.screenPageViews),
            eventCount: formatNumber(item.eventCount),
            ecommercePurchases: formatNumber(item.ecommercePurchases),
          }));
        } else if (Array.isArray(result) && result[0]?.sessionCampaignName) {
          normalizedData = result.map((item) => ({
            campaign: item.sessionCampaignName || "-",
            conversions: formatNumber(item.conversions),
            newUsers: formatNumber(item.newUsers),
            totalUsers: formatNumber(item.totalUsers),
            userEngagementDuration: formatSecondsToHMS(
              item.userEngagementDuration
            ),
          }));
        } else if (Array.isArray(result)) {
          normalizedData = result.map((item) => ({
            deviceCategory: item.deviceCategory,
            sessions: formatNumber(item.sessions),
            totalUsers: formatNumber(item.totalUsers),
            userEngagementDuration: item.userEngagementDuration || "-",
            views: formatNumber(item.views),
            engagementRate: item.engagementRate
              ? Number(item.engagementRate).toFixed(2)
              : "-",
            eventCount: formatNumber(item.eventCount),
          }));
        } else if (result && typeof result === "object") {
          normalizedData = [result];
        }

        setData(normalizedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    propertyid,
    siteUrl,
    squareBoxKey,
    deviceDataURL,
    formattedStart,
    formattedEnd,
  ]);

  const firstColumnKey = columns[0]?.key?.toLowerCase() || "result";
  const isCountryTable = firstColumnKey === "country";
  const limit = isCountryTable ? 5 : 50;
  const displayedData = data.slice(0, limit);
  if (isHidden) return null;

  if (loading) {
    return (
      <div className={style.Orgnaic_content_box}>
        <div className="d-flex align-items-center mb-3">
          <h5
            className={`text-muted pt-3 pb-2 m-0 ${style.page_view_sub_heading}`}
          >
            {SquareBox.title || "Data Table"}
          </h5>
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
        <Loader />
      </div>
    );
  }

  return (
    <div className={`${style.Orgnaic_content_box} card shadow-sm p-3 h-100`}>
      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr Style={{ color: "red" }}>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.length > 0 ? (
              displayedData.map((item, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ textTransform: textTransform }}>
                      {col.key === "page" &&
                      typeof item[col.key] === "string" ? (
                        <a
                          href={item[col.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {item[col.key]}
                        </a>
                      ) : (
                        item[col.key] ?? "0"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceTable;
