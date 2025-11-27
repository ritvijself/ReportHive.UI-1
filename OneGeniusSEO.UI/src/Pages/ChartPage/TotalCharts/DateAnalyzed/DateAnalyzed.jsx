import React, { useState, useEffect } from "react";
import style from "./DateAnalyzed.module.css";
import Loader from "../../../Loader/Loader";

const DateAnalyzed = ({
  siteUrl,
  title,
  color,
  maxWidth,
  bottomMargin,
  SquareBox,
}) => {
  const [loading, setLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState("");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");


  const url = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;

  useEffect(() => {
    if (!siteUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setDisplayDate("");

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            siteUrl: siteUrl,
          }),
        });

        const result = await response.json();

        if (result && result.timestamp) {
         
          const [datePart] = result.timestamp.split("T");
          const [year, day, month] = datePart.split("-");

        
          const date = new Date(year, month - 1, day);

          const formattedDate = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          setDisplayDate(formattedDate);
        } else {
          setDisplayDate("No date available");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setDisplayDate("Error loading date");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteUrl, url, token]);
  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className={style.square_box}
      style={{
        backgroundColor: "#ffffff", 
        maxWidth,
      }}
    >
      <h5
        className={style.square_box_title}
        style={{ marginBottom: bottomMargin }}
      >
        {title.toUpperCase()}
      </h5>
      <div className={style.metric_value_container} style={{ color: color }}>
        <h3>{displayDate}</h3>
      </div>
    </div>
  );
};

export default DateAnalyzed;
