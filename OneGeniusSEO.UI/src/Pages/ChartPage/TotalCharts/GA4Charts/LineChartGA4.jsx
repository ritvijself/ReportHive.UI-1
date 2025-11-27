import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2"; // Bar aur Pie import karein
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const LineChartGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height,
  totalUsers,
  chartType = "line", // Prop receive hoga
  chartColor = "#1565c0" // Prop receive hoga
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [apiData, setApiData] = useState(null); // Raw data ke liye state
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const generateDayLabels = () => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  };

  const formatNumber = (val) => {
    if (typeof val !== "number") return val;
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toLocaleString("en-US");
  };

  // 1. YEH useEffect SIRF DATA FETCH KAREGA
  useEffect(() => {
    const fetchData = async () => {
      const labels = generateDayLabels();
      if (!propertyId || !token || !SquareBox) {
        setApiData({ labels, data: Array(31).fill(0), metricKey: "No Data" });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
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

        if (!res.ok) throw new Error("API error");
        const result = await res.json();

        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          return;
        }

        const metricKey =
          SquareBox.metric ||
          (result[0] &&
            Object.keys(result[0]).find(
              (k) => k !== "date" && !isNaN(parseFloat(result[0][k]))
            )) ||
          "metric";

        // Yahan 'result' ko process nahi karna hai
        // Agar data multi-month hai (jaisa aapke 'result' mein hai)
        // toh humein use single dataset mein convert karna hoga
        
        // Check karein ki data kaisa hai. Agar 'date' hai, toh use karein
        let data;
        if (Array.isArray(result) && result.length > 0 && result[0].date) {
             // Maan lete hain ki yeh 31 din ka data hai
            const dayData = Array(31).fill(0);
            result.forEach((item) => {
                const day = parseInt(item.date.slice(6, 8), 10) - 1;
                if (day >= 0 && day < 31) {
                    // Agar data pehle se hai, toh add karein (multi-month data ko merge karein)
                    dayData[day] += parseFloat(item[metricKey]) || 0;
                }
            });
            data = dayData;
        } else if (Array.isArray(result) && result.length > 0) {
            // Agar 'date' nahi hai, toh simple mapping
             data = result.map((item) => parseFloat(item[metricKey]) || 0);
        } else {
            // Failsafe
            data = Array(31).fill(0);
        }

        setApiData({ data, labels, metricKey });

      } catch (error) {
        console.error("Error fetching data:", error);
        setApiData({ labels, data: Array(31).fill(0), metricKey: "Error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, startDate, endDate, token, SquareBox, apibaseurl, formattedStart, formattedEnd]); // chartColor aur chartType yahan se hata diya

  // 2. YEH NAYA useEffect CHART DATA BANAYEGA
  useEffect(() => {
    if (!apiData) return; // Jab tak data nahi, kuch mat karo

    setChartData({
      labels: apiData.labels,
      datasets: [
        {
          label: apiData.metricKey,
          data: apiData.data,
          borderColor: chartColor, // Prop se color use karein
          backgroundColor: chartColor + "33", // Prop se color use karein
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    });

  }, [apiData, chartColor]); // Yeh ab apiData aur chartColor par depend karega


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: formatNumber },
      },
      x: {
        title: { display: true, text: "Day of Month" },
        grid: { display: false },
      },
    },
  };

  if (isHidden) return null;
  if (loading) return <Loader />;

  // 3. RENDER LOGIC ADD KAREIN
  const renderChart = () => {
    
    // Pie/Bar ke liye data format karein
    const pieBarChartData = {
      labels: chartData.labels,
      datasets: chartData.datasets.map(ds => ({
        ...ds,
        // Bar/Pie ke liye single color/multiple colors
        backgroundColor: (chartType === 'pie') 
          ? [ // Pie ke liye multiple colors
              '#4285F4', '#DB4437', '#F4B400', '#0F9D58',
              '#AB47BC', '#00ACC1', '#FF7043', '#9E9D24',
              '#5C6BC0', '#7E57C2', '#26A69A', '#FFCA28',
            ]
          : ds.borderColor, // Bar ke liye wahi color jo prop se aaya
        borderColor: (chartType === 'pie') ? '#ffffff' : ds.borderColor,
      })),
    };

    if (chartType === "pie") {
      return <Pie data={pieBarChartData} options={options} />;
    }

    if (chartType === "bar") {
      return <Bar data={pieBarChartData} options={options} />;
    }

    // Default 'line' chart
    return <Line data={chartData} options={options} />;
  };
  
  const totalValue =
    totalUsers ||
    chartData.datasets.reduce(
      (acc, dataset) =>
        acc + dataset.data.reduce((sum, val) => sum + (val || 0), 0),
      0
    ) ||
    0;

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center">
        <h5 style={{ fontSize: "16px", margin: 0 }}>{title}</h5>
        <span>{formatNumber(totalValue)}</span>
      </div>
      <div style={{ height: "100%" , width:"100%" , position: "relative"  }}> 
          {renderChart()} {/* Yahan renderChart() call karein */}
      </div>
    </div>
  );
};

export default LineChartGA4;