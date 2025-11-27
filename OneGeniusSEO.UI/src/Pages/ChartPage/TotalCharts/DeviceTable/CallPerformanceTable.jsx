import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./CallPerformanceTable.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

const monthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const formatCountryCode = (code) => {
  if (!code || code === "N/A") return "N/A";
  return code.startsWith("+") ? code : `+${code}`;
};

const CallPerformanceTable = ({ customerID, startDate, endDate, ApiData }) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [uniquePeriods, setUniquePeriods] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [isSingleMonth, setIsSingleMonth] = useState(false); // Track single-month data
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const token = localStorage.getItem("token");
  const latestPeriod = uniquePeriods[uniquePeriods.length - 1];

  const metrics = [
    { key: "totalCalls", label: "Total Calls" },
    { key: "avgDuration", label: "Avg Call Duration (s)" },
    { key: "callTrackingDisplayLocation", label: "Display Location" },
  ];

  // Helper function to get the most frequent value in an array
  const getMostFrequent = (arr) => {
    if (!arr || arr.length === 0) return "N/A";
    const frequency = {};
    let maxFreq = 0;
    let mostFrequent = arr[0];
    arr.forEach((item) => {
      if (item && item !== "N/A") {
        frequency[item] = (frequency[item] || 0) + 1;
        if (frequency[item] > maxFreq) {
          maxFreq = frequency[item];
          mostFrequent = item;
        }
      }
    });
    return mostFrequent || "N/A";
  };

  // Helper function to get date range for a given date
  const getDateRange = (date) => {
    const day = date.getDate();
    if (day >= 1 && day <= 10) return "1-10";
    if (day >= 11 && day <= 20) return "11-20";
    const lastDayOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    return `21-${lastDayOfMonth}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setIsHidden(false);
    setTableData([]);
    setUniquePeriods([]);
    setIsSingleMonth(false);

    try {
      const response = await fetch(
        `${apibaseurl}/api/${ApiData.apiurl}/${ApiData.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerID,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (
        result.IsSuccess === true &&
        result.Data === null &&
        result.Message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      if (!result?.results?.length) {
        console.warn("No results in API response");
        setTableData([]);
        setUniquePeriods([]);
        setLoading(false);
        return;
      }

      const grouped = {};
      const periodsSet = new Set();

      // Check if data spans only one month
      const dates = result.results
        .filter((item) => item.callView?.startCallDateTime)
        .map((item) => new Date(item.callView.startCallDateTime));
      const months = [
        ...new Set(
          dates.map((date) => `${date.getFullYear()}-${date.getMonth() + 1}`)
        ),
      ];
      setIsSingleMonth(months.length === 1);

      // Group data by campaign and period (month or date range)
      result.results.forEach((item) => {
        const campaignName = item.campaign?.name || "N/A";
        let periodKey;

        if (
          item.callView?.startCallDateTime &&
          /^\d{4}-\d{2}-\d{2}/.test(item.callView.startCallDateTime)
        ) {
          const date = new Date(item.callView.startCallDateTime);
          const [year, month] = item.callView.startCallDateTime.split("-");
          const monthName = monthNames[month] || month;

          if (months.length === 1) {
            // Group by date range with month and year
            const dateRange = getDateRange(date);
            periodKey = `${dateRange} ${monthName} '${year.slice(-2)}`;
          } else {
            // Group by month
            periodKey = `${monthName} '${year.slice(-2)}`;
          }
        } else {
          console.warn(
            "Skipping invalid date:",
            item.callView?.startCallDateTime
          );
          return;
        }

        periodsSet.add(periodKey);

        if (!grouped[campaignName]) {
          grouped[campaignName] = {};
        }
        if (!grouped[campaignName][periodKey]) {
          grouped[campaignName][periodKey] = {
            totalCalls: 0,
            totalDuration: 0,
            callerCountryCode: [],
            callerAreaCode: [],
            callTrackingDisplayLocation: [],
            types: [],
          };
        }

        // Populate metrics
        grouped[campaignName][periodKey].totalCalls += 1;
        grouped[campaignName][periodKey].totalDuration += parseInt(
          item.callView?.callDurationSeconds || 0
        );
        grouped[campaignName][periodKey].callerCountryCode.push(
          item.callView?.callerCountryCode || "N/A"
        );
        grouped[campaignName][periodKey].callerAreaCode.push(
          item.callView?.callerAreaCode || "N/A"
        );
        grouped[campaignName][periodKey].callTrackingDisplayLocation.push(
          item.callView?.callTrackingDisplayLocation || "N/A"
        );
        grouped[campaignName][periodKey].types.push(
          item.callView?.type || "N/A"
        );
      });

      const periodArray = [...periodsSet].sort((a, b) => {
        if (months.length === 1) {
          // Sort date ranges: 1-10, 11-20, 21-end
          const order = ["1-10", "11-20"];
          const lastDayOfMonth = new Date(
            dates[0].getFullYear(),
            dates[0].getMonth() + 1,
            0
          ).getDate();
          order.push(`21-${lastDayOfMonth}`);
          return order.indexOf(a) - order.indexOf(b);
        } else {
          // Sort months chronologically
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          const dateA = new Date(`${monthA} 1, ${yearA}`);
          const dateB = new Date(`${monthB} 1, ${yearB}`);
          return dateA - dateB;
        }
      });

      setUniquePeriods(periodArray);

      // Transform grouped data into table format
      const transformed = Object.entries(grouped).map(
        ([campaignName, periodData]) => {
          const row = { campaignName };
          periodArray.forEach((periodKey) => {
            const data = periodData[periodKey] || {
              totalCalls: 0,
              totalDuration: 0,
              callerCountryCode: [],
              callerAreaCode: [],
              callTrackingDisplayLocation: [],
              types: [],
            };
            row[periodKey] = {
              totalCalls: data.totalCalls.toLocaleString(),
              avgDuration:
                data.totalCalls > 0
                  ? (data.totalDuration / data.totalCalls).toFixed(1)
                  : "0.0",
              callerCountryCode: formatCountryCode(
                getMostFrequent(data.callerCountryCode)
              ),
              callerAreaCode: getMostFrequent(data.callerAreaCode),
              callTrackingDisplayLocation: getMostFrequent(
                data.callTrackingDisplayLocation
              ),
              type: getMostFrequent(data.types),
            };
          });
          return row;
        }
      );

      setTableData(transformed);
    } catch (error) {
      console.error("API Error:", error);
      setTableData([]);
      setUniquePeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerID && startDate && endDate) {
      fetchData();
    } else {
      setLoading(false);
      setIsHidden(false);
    }
  }, [customerID, startDate, endDate]);

  if (isHidden) return null;

  if (loading) return <Loader />;

  return (
    <div
      className={`${style.Orgnaic_content_box} mt-3 chart shadow-sm p-3 h-100`}
    >
      <div className={style.table_container}>
        <table className={style.metrics_table} style={{ fontSize: "12px" }}>
          <thead>
            <tr style={{ color: "blue" }}>
              <th rowSpan={2}>Campaign Name</th>
              {metrics.map((metric) => (
                <th
                  key={metric.key}
                  colSpan={uniquePeriods.length}
                  className="text-center"
                >
                  {metric.label}
                </th>
              ))}
            </tr>
            <tr>
              {metrics.map((metric) =>
                uniquePeriods.map((periodKey) => (
                  <th
                    key={`${metric.key}-${periodKey}`}
                    className={
                      periodKey === latestPeriod ? style.highlightColumn : ""
                    }
                    style={{ textAlign: "center" }}
                  >
                    {periodKey}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + metrics.length * uniquePeriods.length}
                  className="text-center"
                >
                  No Data Found
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.campaignName}</td>
                  {metrics.map((metric) =>
                    uniquePeriods.map((periodKey) => (
                      <td
                        key={`${metric.key}-${periodKey}`}
                        className={`${
                          periodKey === latestPeriod
                            ? style.highlightColumn
                            : ""
                        } ${metric.key === "type" ? style.callTypeCell : ""}`}
                        style={{ textAlign: "center" }}
                      >
                        {row[periodKey]?.[metric.key] || "N/A"}
                      </td>
                    ))
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallPerformanceTable;
