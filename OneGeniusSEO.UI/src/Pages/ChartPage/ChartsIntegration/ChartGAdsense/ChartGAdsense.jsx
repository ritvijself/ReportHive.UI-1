import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import { formatDateLocal } from "../../../../utils/FormatDate";

const ChartGAdsense = ({
  startDate,
  endDate,
  style,
  gAdsensePublisherId,
  ApiData,
}) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const formattedStart = formatDateLocal(startDate);
        const formattedEnd = formatDateLocal(endDate);

        const response = await fetch(
          `${apibaseurl}/api/${ApiData.apiurl}/${ApiData.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              AccountName: gAdsensePublisherId?.startsWith("accounts/")
                ? gAdsensePublisherId
                : `accounts/${gAdsensePublisherId}`,
              startDate: formattedStart,
              endDate: formattedEnd,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        // Support hide flag format (for customization)
        if (
          result?.isSuccess === true &&
          result?.data === null &&
          result?.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setReportData([]);
          setLoading(false);
          return;
        }

        // Normalize rows from multiple possible shapes
        let rows = [];
        if (Array.isArray(result)) {
          rows = result;
        } else if (Array.isArray(result?.results)) {
          rows = result.results;
        } else if (Array.isArray(result?.data?.rows)) {
          rows = result.data.rows; // Handle nested rows in lowercase 'data'
        } else if (Array.isArray(result?.Data?.rows)) {
          rows = result.Data.rows; // Handle nested rows in uppercase 'Data'
        } else if (Array.isArray(result?.data)) {
          rows = result.data;
        } else if (Array.isArray(result?.Data)) {
          rows = result.Data;
        }

        setIsHidden(false);
        setReportData(rows);
      } catch (err) {
        console.error("Adsense fetch error:", err);
        setError("Failed to load Adsense report data.");
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    if (gAdsensePublisherId && startDate && endDate && ApiData) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [gAdsensePublisherId, startDate, endDate, ApiData, apibaseurl, token]);

  if (loading) {
    return <div className={style.loading}>Loading Adsense Data...</div>;
  }

  if (isHidden) return null;

  if (error) {
    return <div className={style.error}>{error}</div>;
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className={style.noData}>
        No Adsense data available for the selected period.
      </div>
    );
  }

  // Normalize fields from backend shape (handle nested cells)
  const chartData = [
    ["Date", "Revenue", "Impressions", "Clicks"],
    ...reportData.map((item) => {
      // If item has cells (from API structure), extract values accordingly
      if (item.cells && Array.isArray(item.cells)) {
        return [
          item.cells[0]?.value || "", // Date
          Number(item.cells[1]?.value ?? 0), // ESTIMATED_EARNINGS
          Number(item.cells[3]?.value ?? 0), // IMPRESSIONS (index 3 based on headers)
          Number(item.cells[2]?.value ?? 0), // CLICKS (index 2)
        ];
      }
      // Fallback to original flat structure
      return [
        item.date || item.day || item.reportDate || "",
        Number(item.revenue ?? item.earnings ?? item.estimatedEarnings ?? 0),
        Number(item.impressions ?? item.estimatedImpressions ?? 0),
        Number(item.clicks ?? 0),
      ];
    }),
  ];

  const chartOptions = {
    title: "Adsense Performance",
    curveType: "function",
    legend: { position: "bottom" },
    hAxis: { title: "Date" },
    vAxis: { title: "Value" },
    series: {
      0: { targetAxisIndex: 0 },
      1: { targetAxisIndex: 1 },
      2: { targetAxisIndex: 1 },
    },
  };

  return (
    <div className={style.chartSection}>
      <div className={style.table_heading}>
        <h4 className="mb-0">Adsense Performance Overview</h4>
        <p className={style.table_subheading}>(Data Source - Google Adsense)</p>
      </div>
      <Chart
        chartType="LineChart"
        width="100%"
        height="400px"
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
};

export default ChartGAdsense;
