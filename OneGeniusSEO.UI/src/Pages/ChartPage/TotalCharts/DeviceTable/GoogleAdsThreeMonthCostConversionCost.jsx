import React, { useEffect, useState } from "react";
import Loader from "../../../Loader/Loader";
import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import style from "./DeviceTable.module.css";
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

const GoogleAdsThreeMonthCostConversionCost = ({
  customerID,
  startDate,
  endDate,
  ApiData,
}) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [isHidden, setIsHidden] = useState(false); // New state for hiding
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const token = localStorage.getItem("token");
  const latestMonth = uniqueMonths[uniqueMonths.length - 1];
  const previousMonth = uniqueMonths[uniqueMonths.length - 2];

  const metrics = [
    { key: "clicks", label: "Total Clicks" },
    { key: "conversions", label: "Conversions" },
    { key: "cost", label: "Total Spend (£)" },
    { key: "costPerConversion", label: "Cost / Conversion (£)" },
  ];

  const formatPounds = (value) => {
    const num = parseFloat(value);
    if (num >= 1000) return `£${(num / 1000).toFixed(2)}K`;
    return `£${num.toFixed(2)}`;
  };

  const getTooltipDescription = () => {
    return "Google Ads performance metrics summarized over the last three months.";
  };

  const renderTooltip = (props) => (
    <Tooltip id="google-ads-three-month-table-tooltip" {...props}>
      {getTooltipDescription()}
    </Tooltip>
  );

  const fetchData = async () => {
    setLoading(true);
    setIsHidden(false); // Reset isHidden
    setTableData([]);
    setUniqueMonths([]);

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

      // Check if the API indicates the data should be hidden
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
        setTableData([]);
        setUniqueMonths([]);
        setLoading(false);
        return;
      }

      const grouped = {};
      const monthsSet = new Set();

      result.results.forEach((item) => {
        let monthYear;
        if (
          item.segments?.date &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.segments.date)
        ) {
          const year = item.segments.date.slice(0, 4);
          const month = item.segments.date.slice(5, 7);
          const monthName = monthNames[month] || month;
          monthYear = `${monthName} '${year.slice(-2)}`;
        } else {
          return; // Skip invalid entries
        }

        monthsSet.add(monthYear);

        if (!grouped[monthYear]) {
          grouped[monthYear] = {
            clicks: 0,
            conversions: 0,
            totalCostMicros: 0,
            conversionCountForCPC: 0,
          };
        }

        grouped[monthYear].clicks += parseInt(item.metrics?.clicks || 0);
        grouped[monthYear].conversions += parseFloat(
          item.metrics?.conversions || 0
        );
        grouped[monthYear].totalCostMicros += parseInt(
          item.metrics?.costMicros || 0
        );
        if (parseFloat(item.metrics?.conversions) > 0) {
          grouped[monthYear].conversionCountForCPC += parseFloat(
            item.metrics.conversions
          );
        }
      });

      const monthArray = [...monthsSet]
        .sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          const dateA = new Date(`${monthA} 1, ${yearA}`);
          const dateB = new Date(`${monthB} 1, ${yearB}`);
          return dateA - dateB;
        })
        .slice(-3); // Take only the last 3 months

      setUniqueMonths(monthArray);

      const transformed = [
        {
          id: "summary",
          ...monthArray.reduce((acc, monthYear) => {
            const data = grouped[monthYear] || {
              clicks: 0,
              conversions: 0,
              totalCostMicros: 0,
              conversionCountForCPC: 0,
            };
            const costInCurrency = data.totalCostMicros / 1_000_000;
            acc[monthYear] = {
              clicks: data.clicks.toLocaleString(),
              conversions: data.conversions.toFixed(2),
              cost: formatPounds(costInCurrency),
              costPerConversion:
                data.conversionCountForCPC > 0
                  ? formatPounds(costInCurrency / data.conversionCountForCPC)
                  : "£0.00",
            };
            return acc;
          }, {}),
        },
      ];

      setTableData(transformed);
    } catch (error) {
      console.error("API Error:", error);
      setTableData([]);
      setUniqueMonths([]);
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

  // Function to parse cost per conversion for comparison
  const parseCostPerConversion = (value) => {
    if (value === "£0.00") return 0;
    const cleaned = value.replace("£", "").replace("K", "");
    const num = parseFloat(cleaned);
    return value.includes("K") ? num * 1000 : num;
  };

  // Function to determine color and arrow for cost per conversion
  const getComparisonStyle = (currentValue, previousValue) => {
    if (!previousValue) return { color: "", arrow: "" }; // No previous month to compare
    const current = parseCostPerConversion(currentValue);
    const previous = parseCostPerConversion(previousValue);
    if (current < previous && current !== 0) {
      return { color: "green", arrow: "↑" }; // Lower cost per conversion is better
    }
    if (current > previous || (current !== 0 && previous === 0)) {
      return { color: "red", arrow: "↓" }; // Higher cost per conversion is worse
    }
    return { color: "", arrow: "" };
  };

  // Return null if the component should be hidden
  if (isHidden) return null;

  if (loading) return <Loader />;

  return (
    <div className={`${style.Orgnaic_content_box} h-100 card mt-3`}>
      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              <th rowSpan={2}>Metric</th>
              {uniqueMonths.map((monthYear) => (
                <th
                  key={monthYear}
                  className={
                    monthYear === latestMonth ? style.highlightColumn : ""
                  }
                  style={{ textAlign: "center" }}
                >
                  {monthYear}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={1 + uniqueMonths.length} className="text-center">
                  No Data Found
                </td>
              </tr>
            ) : (
              metrics.map((metric) => (
                <tr key={metric.key}>
                  <td>{metric.label}</td>
                  {uniqueMonths.map((monthYear) => {
                    const isLatestMonth = monthYear === latestMonth;
                    const isCostPerConversion =
                      metric.key === "costPerConversion";
                    const { color, arrow } =
                      isLatestMonth && isCostPerConversion
                        ? getComparisonStyle(
                            tableData[0][monthYear][metric.key],
                            previousMonth
                              ? tableData[0][previousMonth][metric.key]
                              : null
                          )
                        : { color: "", arrow: "" };
                    return (
                      <td
                        key={`${metric.key}-${monthYear}`}
                        className={isLatestMonth ? style.highlightColumn : ""}
                        style={{
                          textAlign: "center",
                          color: color,
                        }}
                      >
                        {tableData[0][monthYear][metric.key]}
                        {arrow && (
                          <span style={{ marginLeft: "5px" }}>{arrow}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoogleAdsThreeMonthCostConversionCost;
