import React, { useEffect, useState } from "react";
import Loader from "../../../Loader/Loader";
import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatDateLocal } from "../../../../utils/FormatDate";

const GoogleAdsSummary = ({ customerID, startDate, endDate, ApiData }) => {
  const [loading, setLoading] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [cost, setCost] = useState(0);
  const [costPerConversion, setCostPerConversion] = useState(0);
  const [isHidden, setIsHidden] = useState(false); // New state for hiding
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const token = localStorage.getItem("token");

  const formatPounds = (value) => {
    const num = parseFloat(value);
    if (num >= 1000) return `£${(num / 1000).toFixed(2)}K`;
    return `£${num}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setIsHidden(false); // Reset isHidden
    setClicks(0);
    setConversions(0);
    setCost(0);
    setCostPerConversion(0);

    try {
      const response = await fetch(
        `${apibaseurl}/api/${ApiData.apiurl}/${ApiData.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerID: customerID,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();

      // Check if the API indicates the data should be hidden
      if (
        result.IsSuccess === true &&
        result.Data === null &&
        result.Message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      if (result?.results?.length > 0) {
        let totalClicks = 0;
        let totalConversions = 0;
        let totalCostMicros = 0;

        result.results.forEach((item) => {
          totalClicks += parseInt(item.metrics.clicks || 0);
          totalConversions += parseFloat(item.metrics.conversions || 0);
          totalCostMicros += parseInt(item.metrics.costMicros || 0);
        });

        const costInCurrency = totalCostMicros / 1_000_000;
        const cpc =
          totalConversions > 0 ? costInCurrency / totalConversions : 0;

        setClicks(totalClicks);
        setConversions(parseFloat(totalConversions.toFixed(2)));
        setCost(costInCurrency);
        setCostPerConversion(cpc.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching Google Ads data:", error);
      setClicks(0);
      setConversions(0);
      setCost(0);
      setCostPerConversion(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerID && startDate && endDate) {
      fetchData();
    } else {
      setLoading(false);
      setIsHidden(false);
    }
  }, [customerID, startDate, endDate]);

  // Return null if the component should be hidden
  if (isHidden) return null;

  if (loading) return <Loader />;

  const renderTooltip = (text) => <Tooltip id="tooltip">{text}</Tooltip>;

  const renderCard = (title, value, tooltipText, isCurrency = false) => (
    <div className="col-12 col-md-3 mb-3">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="text-muted fw-semibold mb-0">
              {title}
              {/* {tooltipText && (
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip(tooltipText)}
                >
                  <span
                    className="ms-2 text-secondary"
                    style={{ cursor: "pointer" }}
                  >
                    <FaInfoCircle size={13} />
                  </span>
                </OverlayTrigger>
              )} */}
            </h6>
          </div>
          <div
            className="mt-auto text-center fw-bold"
            style={{ fontSize: "35px" }}
          >
            {isCurrency ? formatPounds(value) : value}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="row">
      {renderCard("Total Clicks", clicks, "Total number of ad clicks.")}
      {renderCard("Conversions", conversions, "Total number of conversions.")}
      {renderCard("Total Spend (£)", cost, "Total cost spent in Pounds.", true)}
      {renderCard(
        "Cost / Conversion (£)",
        costPerConversion,
        "Average cost per conversion.",
        true
      )}
    </div>
  );
};

export default GoogleAdsSummary;