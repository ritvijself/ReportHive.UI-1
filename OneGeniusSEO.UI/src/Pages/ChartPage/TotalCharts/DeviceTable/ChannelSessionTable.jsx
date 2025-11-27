import React, { useState, useEffect, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import style from "./DeviceTable.module.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const monthNames = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  10: "October",
  11: "November",
  12: "December",
};

// Create a reverse mapping to get month number from name
const monthNumbers = Object.fromEntries(
  Object.entries(monthNames).map(([num, name]) => [name, num])
);

const ChannelSessionTable = ({ propertyId, startDate, endDate, SquareBox }) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [isHidden, setIsHidden] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const deviceDataURL = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const squareBoxKey = useMemo(() => JSON.stringify(SquareBox), [SquareBox]);
  const latestMonth = uniqueMonths[uniqueMonths.length - 1];

  const getTooltipDescription = () => {
    return "Sessions by default channel group over selected months.";
  };

  const renderTooltip = (props) => (
    <Tooltip id="channel-session-table-tooltip" {...props}>
      {getTooltipDescription()}
    </Tooltip>
  );

  useEffect(() => {
    if (!propertyId && !SquareBox.requiresSiteUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const requestBody = SquareBox.requiresSiteUrl
          ? {
              siteUrl: SquareBox.siteUrl,
              startDate: formattedStart,
              endDate: formattedEnd,
            }
          : {
              propertyId,
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

        const result = await res.json();

        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        const grouped = {};
        const monthsSet = new Set();

        result.forEach(
          ({ sessionDefaultChannelGroup, year, month, sessions }) => {
            const group = sessionDefaultChannelGroup || "-";

            const resolvedYear = new Date(startDate).getFullYear();
            const monthKey = month.padStart(2, "0");
            const monthName = monthNames[monthKey] || month;
            const monthYear = `${monthName} ${year}`;

            monthsSet.add(monthYear);

            if (!grouped[group]) grouped[group] = {};
            grouped[group][monthYear] = sessions || 0;
          }
        );

        // Fixed sorting logic
        const monthArray = [...monthsSet].sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");

          // Convert year to number for proper comparison
          const numYearA = parseInt(yearA, 10);
          const numYearB = parseInt(yearB, 10);

          // Get month numbers using our reverse mapping
          const monthNumA = parseInt(monthNumbers[monthA] || "0", 10);
          const monthNumB = parseInt(monthNumbers[monthB] || "0", 10);

          // First sort by year, then by month number
          if (numYearA !== numYearB) {
            return numYearA - numYearB;
          }
          return monthNumA - monthNumB;
        });

        setUniqueMonths(monthArray);

        const rows = Object.entries(grouped).map(([channel, monthData]) => ({
          channel,
          ...monthData,
        }));

        setTableData(rows);
      } catch (err) {
        console.error("Error fetching data:", err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    propertyId,
    SquareBox,
    squareBoxKey,
    deviceDataURL,
    formattedStart,
    formattedEnd,
  ]);

  if (isHidden) return null;
  if (loading) {
    return (
      <div className={style.Orgnaic_content_box}>
        <div className="d-flex align-items-center mb-3"></div>
        <div>Loading...</div>
      </div>
    );
  }

  if (!tableData.length) {
    return (
      <div className={`${style.Orgnaic_content_box} h-100 card`}>
        <div className="d-flex align-items-center mb-3"></div>
        <div>No data available</div>
      </div>
    );
  }

  return (
    <div className={`${style.Orgnaic_content_box} h-100 card`}>
      <div className="d-flex align-items-center "></div>
      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              <th>Source of Traffic</th> {/* Fixed typo here */}
              {uniqueMonths.map((monthYear) => (
                <th
                  key={monthYear}
                  className={
                    monthYear === latestMonth ? style.highlightColumn : ""
                  }
                >
                  {monthYear}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.channel}</td>
                {uniqueMonths.map((monthYear) => (
                  <td
                    key={monthYear}
                    className={
                      monthYear === latestMonth ? style.highlightColumn : ""
                    }
                  >
                    {row[monthYear] !== undefined
                      ? row[monthYear].toLocaleString()
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelSessionTable;
