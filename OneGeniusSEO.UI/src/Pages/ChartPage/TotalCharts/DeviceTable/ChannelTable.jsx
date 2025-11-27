import React, { useState, useEffect, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./DeviceTable.module.css";

const formatNumber = (value) => parseInt(value || 0).toLocaleString();
const formatSecondsToHMS = (seconds) => {
  if (!seconds || isNaN(seconds)) return "-";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const ChannelTable = ({
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
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const channelDataURL = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const keyEventURL = `${apibaseurl}/api/google-analytics/report/Key-event`;

  const squareBoxKey = useMemo(() => JSON.stringify(SquareBox), [SquareBox]);

  const tooltip = (
    <Tooltip id="channel-table-tooltip">
      Performance metrics by traffic source channels (e.g., Organic Search,
      Direct).
    </Tooltip>
  );

  useEffect(() => {
    if (!propertyid && !siteUrl) {
      setLoading(false);
      setError("Missing propertyid or siteUrl");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody = SquareBox.requiresSiteUrl
          ? { siteUrl, startDate: formattedStart, endDate: formattedEnd }
          : {
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            };

        const channelRes = await fetch(channelDataURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!channelRes.ok)
          throw new Error(`Channel API failed: ${channelRes.status}`);

        const channelResult = await channelRes.json();

        if (
          channelResult.isSuccess === true &&
          channelResult.data === null &&
          channelResult.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          return [];
        }

        let keyEventResult = { rows: [] };
        try {
          const keyEventRes = await fetch(keyEventURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (keyEventRes.ok) {
            keyEventResult = await keyEventRes.json();
          } else {
            console.warn(`Key Event API failed: ${keyEventRes.status}`);
          }
        } catch (err) {
          console.warn("Key Event fetch error:", err.message);
        }

        let normalizedData = [];
        if (
          Array.isArray(channelResult) &&
          channelResult[0]?.sessionDefaultChannelGroup
        ) {
          normalizedData = channelResult.map((item) => ({
            channel: item.sessionDefaultChannelGroup?.trim() || "-",
            sessions: formatNumber(item.sessions),
            totalUsers: formatNumber(item.totalUsers),
            userEngagementDuration: formatSecondsToHMS(
              item.userEngagementDuration
            ),
            screenPageViews: formatNumber(item.screenPageViews),
            eventCount: formatNumber(item.eventCount),
            ecommercePurchases: formatNumber(item.ecommercePurchases),
          }));
        }

        if (
          Array.isArray(keyEventResult.rows) &&
          keyEventResult.rows.length > 0
        ) {
          normalizedData = normalizedData.map((channelItem) => {
            const channel = (channelItem.channel ?? "").trim().toLowerCase();

            let keyEvent = keyEventResult.rows.find(
              (event) =>
                (event.sessionDefaultChannelGroup ?? "")
                  .trim()
                  .toLowerCase() === channel &&
                event.eventName === "contact_form"
            );

            if (!keyEvent) {
              keyEvent = keyEventResult.rows.find(
                (event) =>
                  (event.sessionDefaultChannelGroup ?? "")
                    .trim()
                    .toLowerCase() === channel &&
                  event.eventName === "contact_us"
              );
            }

            return {
              ...channelItem,
              keyEvents: keyEvent ? formatNumber(keyEvent.eventCount) : "0",
            };
          });
        } else {
          normalizedData = normalizedData.map((item) => ({
            ...item,
            keyEvents: "0",
          }));
        }

        setData(normalizedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
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
    channelDataURL,
    keyEventURL,
    formattedStart,
    formattedEnd,
    token,
  ]);
  if (isHidden) return null;

  const displayedData = data.slice(0, 50); // Add pagination if needed later

  return (
    <div className={`${style.Orgnaic_content_box} card shadow-sm p-3 h-100`}>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-danger">Error loading data: {error}</div>
      ) : (
        <div className={style.table_container}>
          <table className={style.metrics_table}>
            <thead>
              <tr>
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
                      <td
                        key={col.key}
                        style={{ textTransform: textTransform }}
                      >
                        {item[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-muted"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChannelTable;
