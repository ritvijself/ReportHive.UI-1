
import React from "react";
import { Card } from "react-bootstrap";
import style from "./GMBDateCard.module.css";

const GMBDateCard = ({ label, startDate, endDate }) => {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

  
    if (startDate > endDate) return 0;

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const durationDays = calculateDays(startDate, endDate);

  return (
    <Card className="stat-card p-2">
      <div className={`${style.content} "d-flex align-items-center "`}>
        <div className={`${style.label}`}>{label}</div>
        <div className={`${style.duration}`}>
          {formattedStartDate} - {formattedEndDate}
        </div>
        <div className={`${style.duration}`}>
          Duration: {durationDays} {durationDays === 1 ? "day" : "days"}
        </div>
      </div>
    </Card>
  );
};

export default GMBDateCard;
