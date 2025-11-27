import React, { useEffect, useState } from "react";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const BounceEngagementMetricBox = ({
  propertyId,
  startDate,
  endDate,
  title,
  onMetricValueChange,
}) => {
  const [metricValue, setMetricValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatSecondsToHMS = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const calculateMetric = (data) => {
    if (!data || !Array.isArray(data)) return 0;

  
    const startMonth = new Date(startDate).getMonth() + 1; 
    const startYear = new Date(startDate).getFullYear();

 
    const filteredData = data.filter((item) => {
      const itemDate = item.date.toString();
      const itemYear = parseInt(itemDate.substring(0, 4));
      const itemMonth = parseInt(itemDate.substring(4, 6));

      return itemYear === startYear && itemMonth === startMonth;
    });

    return filteredData.reduce(
      (acc, item) => acc + parseFloat(item.userEngagementDuration || 0),
      0
    );
  };

  const fetchMetricData = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/google-analytics/report/user-Engagement-Duration-DayByDay`,
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
      const data = await response.json();

    
      if (
        data.isSuccess === true &&
        data.data === null &&
        data.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Fetch error (engagementDuration):", error);
      return [];
    }
  };

  const getMetricInfo = (value) => ({
    title: "Engagement Duration",
    value: formatSecondsToHMS(value),
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMetricData();
        const value = calculateMetric(data);
        setMetricValue(value);
        onMetricValueChange?.(value);
      } catch (err) {
        console.error("Processing error:", err);
        setMetricValue(0);
        onMetricValueChange?.(0);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [propertyId, startDate, endDate]);

  const metricInfo = getMetricInfo(metricValue);
  if (isHidden) return null;
  if (loading) return <Loader />;

  return (
    <div className="col-md-12 col-sm-12">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h6 className="text-muted mb-0 fw-semibold">
            {title || metricInfo.title}
          </h6>
          <div
            className="mt-auto text-center fw-bold"
            style={{ marginBottom: "20px", fontSize: "35px" }}
          >
            {metricInfo.value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BounceEngagementMetricBox;
