import React, { useState, useEffect } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import styles from "./DeviceTable.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const KeywordPositionTable = ({
  propertyid,
  siteUrl,
  startDate,
  endDate,
  SquareBox,
}) => {
  const [tableData, setTableData] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const keywordDataURL = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;

  const getTooltipDescription = () => {
    return "Average search positions for keywords by month.";
  };

  const renderTooltip = (props) => (
    <Tooltip id="keyword-position-table-tooltip" {...props}>
      {getTooltipDescription()}
    </Tooltip>
  );

  useEffect(() => {
    if (!propertyid && !siteUrl) {
      setLoading(false);
      setError("Missing propertyid or siteUrl");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody = {
          siteUrl,
          propertyId: propertyid,
          startDate: formatDateLocal(startDate),
          endDate: formatDateLocal(endDate),
        };

        const response = await fetch(keywordDataURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

      
        const months = Object.keys(result[0] || {}).filter(
          (key) => key !== "Keyword"
        );
        setUniqueMonths(months);

       
        const cleanedData = result.map((item) => {
          const row = { keyword: item.Keyword };
          months.forEach((month) => {
            const value = item[month];
            row[month] =
              value === "NA" || value === "Na" || value === "" ? "—" : value;
          });
          return row;
        });

        setTableData(cleanedData);
      } catch (err) {
        console.error("Error fetching keyword data:", err);
        setError(err.message);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyid, siteUrl, startDate, endDate, token, keywordDataURL]);

  return (
    <div className={`${styles.table_container} h-100 card`}>
      <div className="d-flex align-items-center"></div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-danger">Error loading data: {error}</div>
      ) : tableData.length === 0 ? (
        <div>No data available</div>
      ) : (
        <div className={styles.table_wrapper}>
          <table className={styles.metrics_table}>
            <thead>
              <tr>
                <th>Keywords</th>
                {uniqueMonths.map((month) => (
                  <th key={month}>{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.keyword}</td>
                  {uniqueMonths.map((month) => (
                    <td key={month}>{row[month]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KeywordPositionTable;
