import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const PageMetricsCard = ({
  propertyId,
  startDate,
  endDate,
  metricType,
  pageData,
  title,
  SquareBox,
  sign,
}) => {
  const [metricValue, setMetricValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const calculateMetric = (data, type) => {
    if (!Array.isArray(data)) return 0;

    switch (type) {
      case "sessions":
        return data.reduce(
          (sum, item) => sum + parseInt(item.sessions || 0),
          0
        );
      case "users":
        return data.reduce(
          (sum, item) => sum + parseInt(item.totalUsers || 0),
          0
        );
      case "events":
        return data.reduce(
          (sum, item) => sum + parseInt(item.eventCount || 0),
          0
        );
      default:
        return 0;
    }
  };

  const fetchMetricData = async () => {
    setLoading(true);
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
            propertyId: propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      const data = await response.json();
      return { type: metricType, data };
    } catch (error) {
      console.error(`Error fetching ${metricType} data:`, error);
      return { type: metricType, data: [] };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (pageData?.data) {
          setMetricValue(calculateMetric(pageData.data, metricType));
        } else if (propertyId) {
          const { data } = await fetchMetricData();
          setMetricValue(calculateMetric(data, metricType));
        } else {
          setMetricValue(0);
        }
      } catch (error) {
        console.error("Error processing data:", error);
        setMetricValue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, startDate, endDate, metricType, pageData, SquareBox]);

  const formatNumber = (value) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    return numValue.toLocaleString();
  };

  const renderTooltip = (description) => (props) =>
    <Tooltip {...props}>{description}</Tooltip>;

  const getMetricInfo = () => {
    switch (metricType) {
      case "sessions":
        return {
          title: "Sessions",
          value: formatNumber(metricValue),
          description: "Total number of sessions across all pages",
          tooltip: "Sum of all sessions for the specified period",
        };
      case "users":
        return {
          title: "Total Users",
          value: formatNumber(metricValue),
          description: "Total number of unique users across all pages",
          tooltip: "Count of unique users visiting the pages",
        };
      case "events":
        return {
          title: "Event Count",
          value: formatNumber(metricValue),
          description: "Total number of events triggered across all pages",
          tooltip: "Sum of all events recorded on the pages",
        };
      default:
        return {
          title: title || "Metric",
          value: metricValue,
          description: "",
          tooltip: "",
        };
    }
  };

  const metricInfo = getMetricInfo();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="col-md-12 col-sm-12">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="text-muted mb-0 fw-semibold">
              {title || metricInfo.title}
            </h6>
          </div>
          <div
            className="mt-auto text-center fw-bold"
            style={{ marginBottom: "20px", fontSize: "35px" }}
          >
            {metricInfo.value}
            {sign && <sup>{sign}</sup>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageMetricsCard;
