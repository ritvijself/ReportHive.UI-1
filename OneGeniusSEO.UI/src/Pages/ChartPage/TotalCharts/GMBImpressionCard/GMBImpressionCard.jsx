import React, { useState, useEffect, useCallback } from "react";
import { Card, Col } from "react-bootstrap";
import style from "./GMBImpressionCard.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

const GMBImpressionCard = ({
  title,
  GMBLocation_Id,
  startDate,
  endDate,
  desktopMapData,
  GMBAccount_Id,
}) => {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const apiUrl = `${apibaseurl}/api/${desktopMapData.apiurl}/${desktopMapData.url}`;

  // Parse startDate to extract year and month
  const startDateObj = new Date(startDate);
  const startYear = startDateObj.getFullYear();
  const startMonth = startDateObj.getMonth() + 1; 

  const calculateTotalImpressions = useCallback(
    (data) => {
      if (!data?.multiDailyMetricTimeSeries?.length) return 0;

      let total = 0;
      data.multiDailyMetricTimeSeries.forEach((metricSeries) => {
        metricSeries?.dailyMetricTimeSeries?.forEach((series) => {
          series?.timeSeries?.datedValues?.forEach((item) => {
            const itemYear = item.date.year;
            const itemMonth = item.date.month;
          
            if (itemYear === startYear && itemMonth === startMonth) {
              total += parseInt(item.value, 10) || 0;
            }
          });
        });
      });
      return total;
    },
    [startYear, startMonth]
  );

  useEffect(() => {
    if (!GMBLocation_Id) {
      setShouldHide(true);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountId: GMBAccount_Id,
            locationId: GMBLocation_Id,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        });

        const result = await response.json();

      
        if (
          result.Message === "User wants to hide this API" ||
          result.Data === null
        ) {
          setShouldHide(true);
          return;
        }

        const total = calculateTotalImpressions(result);
        setValue(total);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShouldHide(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    GMBLocation_Id,
    apiUrl,
    formattedStart,
    formattedEnd,
    GMBAccount_Id,
    calculateTotalImpressions,
  ]);

  if (shouldHide) {
    return null;
  }

  if (loading) {
    return (
      <Col xs={12} md={6} lg={4} className="mt-3">
        <Card
          className="stat-card"
          style={{
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
            padding: "20px",
          }}
        >
          <div
            className={`${style.content} d-flex flex-column`}
            style={{ height: "100px" }}
          >
            <div
              className={`${style.label}`}
              style={{ fontSize: "14px", color: "#666", textAlign: "left" }}
            >
              {title}
            </div>
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <Loader small />
            </div>
          </div>
        </Card>
      </Col>
    );
  }

  return (
    <Col xs={12} md={6} lg={3} className="mt-3">
      <Card
        className="stat-card"
        style={{
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
          padding: "20px",
        }}
      >
        <div
          className={`${style.content} d-flex flex-column`}
          style={{ height: "100px" }}
        >
          <div
            className={`${style.label}`}
            style={{ fontSize: "16px", textAlign: "left" }}
          >
            {title}
          </div>
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div
              className={`${style.value}`}
              style={{ fontSize: "36px", fontWeight: "bold" }}
            >
              {value.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default React.memo(GMBImpressionCard);
