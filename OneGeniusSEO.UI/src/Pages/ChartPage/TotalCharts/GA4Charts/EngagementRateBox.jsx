import React, { useEffect, useState } from "react";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const EngagementRateBox = ({ propertyId, startDate, endDate, SquareBox }) => {
  const [metricValue, setMetricValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const calculateMetric = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const rate = parseFloat(data[0]?.engagementRate || 0);
    return (rate * 100).toFixed(2);
  };

  const fetchMetricData = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/${SquareBox?.apiurl}/${SquareBox?.url}`,
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

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching engagement rate data:", error);
      return [{ engagementRate: 0 }];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMetricData();
        const value = calculateMetric(data);
        setMetricValue(value);
      } catch (error) {
        console.error("Error processing data:", error);
        setMetricValue(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propertyId, startDate, endDate]);

  const formatPercentage = (value) => (
    <>
      {value}
      <sup>%</sup>
    </>
  );

  if (loading) return <Loader />;

  return (
    <div className="col-md-12 col-sm-12">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="text-muted mb-0 fw-semibold">Engagement Rate</h6>
          </div>
          <div
            className="mt-auto text-center fw-bold"
            style={{ marginBottom: "20px", fontSize: "35px" }}
          >
            {formatPercentage(metricValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementRateBox;
