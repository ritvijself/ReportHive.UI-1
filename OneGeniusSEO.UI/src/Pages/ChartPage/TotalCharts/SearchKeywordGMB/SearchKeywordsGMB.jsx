import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./SearchKeywordsGMB.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

function SearchKeywordsGMB({
  GMBLocation_Id,
  startDate,
  endDate,
  SquareBox,
  title,
  GMBAccount_Id,
}) {
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const apiUrl = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;


  const tooltipDescription =
    "Provides the monthly impressions for search keywords that surfaced the business profile on Google Search and Maps.";

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        if (!GMBLocation_Id) {
          setLoading(false);
          setSearchData([]);
          return;
        }

        setLoading(true);
        setError(null);

        const requestBody = {
          accountId: GMBAccount_Id,
          locationId: GMBLocation_Id,
          startDate: formattedStart,
          endDate: formattedEnd,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
          const transformedData = result.data.map((item) => ({
            keyword: item.keyword,
            count: parseInt(item.value || item.threshold || "0", 10),
          }));
          setSearchData(transformedData);
        } else {
          setSearchData([]); 
        }
      } catch (err) {
        console.error("Error fetching search keywords:", err);
        setSearchData([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [GMBLocation_Id, formattedStart, formattedEnd, apiUrl]);

  const renderTooltip = (props) => (
    <Tooltip id="search-keywords-tooltip" {...props}>
      {tooltipDescription}
    </Tooltip>
  );

  if (loading) {
    return (
      <div className={`${style.page_view}`}>
        <div className={`${style.page_view_data} container mt-2 p-3`}>
          <div className="d-flex align-items-center mb-3">
            <h5
              className={`text-muted pt-3 pb-2 m-0 ${style.page_view_sub_heading}`}
            >
              {title}
            </h5>
           
          </div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.page_view}`}>
      <div className={`${style.page_view_data} container mt-2 p-3`}>
        <div className="d-flex align-items-center mb-3">
          <h5
            className={`text-muted pt-3 pb-2 m-0 ${style.page_view_sub_heading}`}
          >
            {title}
          </h5>
       
        </div>
        {searchData.length === 0 ? (
          <div className="alert ">No data available for this month</div>
        ) : (
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th className="p-0 border-bottom-0">{title}</th>
                <th className="border-bottom-0 p-0 text-center">
                  Search Impressions
                </th>
              </tr>
            </thead>
            <tbody>
              {searchData.map((item, idx) => (
                <tr key={idx}>
                  <td
                    className={`${style.path_view_path} p-0 border-bottom-0 text-muted`}
                  >
                    {item.keyword}
                  </td>
                  <td
                    className={`${style.path_view_value} p-0 border-bottom-0 text-center`}
                  >
                    {item.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SearchKeywordsGMB;
