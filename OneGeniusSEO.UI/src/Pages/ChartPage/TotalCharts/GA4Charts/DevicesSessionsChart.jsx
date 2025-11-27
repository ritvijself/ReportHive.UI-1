import React, { useState, useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const DeviceSessionsChart = ({
  propertyId,
  title = "Sessions by Device or Country",
  startDate,
  endDate,
  height = 160,
  width = 160,
  SquareBox,
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId || !SquareBox?.apiurl || !SquareBox?.url) {
        setChartData([]);
        setLoading(false);
        return;
      }

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

        if (!response.ok)
          throw new Error(`API request failed: ${response.status}`);

        const result = await response.json();
        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          return [];
        }

       
        let data = [];
        if (result.rows && Array.isArray(result.rows)) {
         
          data = result.rows.filter(
            (row) => row.eventName === "contact_form" || "contact_us"
          );
        } else {
       
          data = Array.isArray(result) ? result : result.currentPeriod || [];
        }

        setChartData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, startDate, endDate, SquareBox]);
  if (isHidden) return null;
  if (loading) {
    return <Loader />;
  }

  const isEmpty = !chartData || chartData.length === 0;

  const isCountryData = chartData.some(
    (item) => item.country && item.eventCount
  );
  const labelKey = isCountryData ? "country" : "deviceCategory";
  const valueKey = isCountryData ? "eventCount" : "sessions";
  const centerText = isCountryData ? "Key Events" : "Sessions";

  const labels = isEmpty
    ? ["No Data"]
    : chartData.map((item) => item[labelKey] || "N/A");

  const dataValues = isEmpty
    ? [1]
    : chartData.map((item) => parseFloat(item[valueKey] || "0"));

  const total = isEmpty ? 0 : dataValues.reduce((a, b) => a + b, 0);


  const colors = [
    "#2b91b3",
    "#4aa2bd",
    "#6ab3c7",
    "#8ac5d1",
    "#aad6db",
    "#cae7e5",
    "#eaf8ef",
  ];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: isEmpty ? ["#e0e0e0"] : colors.slice(0, labels.length),
        hoverBackgroundColor: isEmpty
          ? ["#e0e0e0"]
          : colors.slice(0, labels.length),
        borderWidth: 0, 
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%", 
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="p-3 card rounded shadow-sm bg-white h-100">
      <h5
        className="mb-3"
        style={{ fontSize: "16px", fontWeight: "500", paddingBottom: "30px" }}
      >
        {title}
      </h5>
      <div className="row align-items-center" style={{ paddingBottom: "40px" }}>
        <div className="col-md-6 d-flex flex-column align-items-center">
          <div style={{ width: width, height: height, position: "relative" }}>
            <Doughnut ref={chartRef} data={data} options={options} />
            <div
              className="text-center"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div style={{ fontSize: "24px" }}>{total.toLocaleString()}</div>
              <div className="text-muted" style={{ fontSize: "14px" }}>
                {centerText}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <ul className="list-unstyled mb-0">
            {labels.map((label, i) => (
              <li key={i} className="d-flex align-items-center mb-2">
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: isEmpty
                      ? "#e0e0e0"
                      : colors[i % colors.length], 
                    marginRight: 8,
                  }}
                />
                <span className="flex-grow-1" style={{ fontSize: "14px" }}>
                  {label}
                </span>
                <span className="fw-bold" style={{ fontSize: "14px" }}>
                  {isEmpty ? 0 : dataValues[i].toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeviceSessionsChart;
