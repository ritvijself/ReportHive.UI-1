import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const ConversionData = ({ propertyId, startDate, endDate, SquareBox }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [totalConversions, setTotalConversions] = useState(0);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const fetchData = async () => {
    if (!propertyId || !SquareBox?.apiurl || !SquareBox?.url) {
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

      const result = await response.json();
      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      if (Array.isArray(result) && result.length > 0) {
   
        const start = new Date(startDate);
        const startYear = start.getFullYear();
        const startMonth = String(start.getMonth() + 1).padStart(2, "0");
        const startYearMonth = `${startYear}${startMonth}`;

        
        const filteredData = result.filter(
          (item) => item.date && item.date.startsWith(startYearMonth)
        );

        const sortedData = [...filteredData].sort((a, b) =>
          (a.date || a.dimension).localeCompare(b.date || b.dimension)
        );

        const conversionsData = sortedData.map((item) =>
          parseInt(item.conversions || item.metric || 0)
        );

        setTotalConversions(conversionsData.reduce((acc, val) => acc + val, 0));

        setChartData({
          labels: sortedData.map(() => ""), 
          datasets: [
            {
              data: conversionsData,
              borderColor: "#007bff", 
              backgroundColor: "transparent", 
              fill: false, 
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        });
      } else {
        setTotalConversions(0);
        setChartData({ labels: [], datasets: [] });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTotalConversions(0);
      setChartData({ labels: [], datasets: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, SquareBox]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, 
      },
    },
    scales: {
      x: {
        display: false, 
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        display: false, 
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0, 
        hoverRadius: 0,
      },
    },
  };
  if (isHidden) return null;
  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className="card h-100 shadow-sm"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        position: "relative",
      }}
    >
    
      <div
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Conversions
      </div>

      <div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {totalConversions}
      </div>

    
      <div
        style={{
          height: "40px",
          width: "100%",
          position: "absolute",
          bottom: "10px",
          padding: "0 30px",
        }}
      >
        <Line data={chartData} options={options} height={40} />
      </div>
    </div>
  );
};

export default ConversionData;
