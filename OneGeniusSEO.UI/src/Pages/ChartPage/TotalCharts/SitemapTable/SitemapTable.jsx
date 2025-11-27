import React, { useState, useEffect, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./SitemapTable.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

const SitemapTable = ({
  propertyid,
  SquareBox,
  startDate,
  endDate,
  siteUrl,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const sitemapDataURL = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const [isHidden, setIsHidden] = useState(false);
  const squareBoxKey = useMemo(() => JSON.stringify(SquareBox), [SquareBox]);

  const tooltipDescription =
    "Shows a list of sitemaps submitted for the website and their current status.";

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!propertyid && !siteUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const requestBody = SquareBox.requiresSiteUrl
          ? { siteUrl, startDate: formattedStart, endDate: formattedEnd }
          : {
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            };

        const res = await fetch(sitemapDataURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        const result = await res.json();

        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        const normalizedData = result.map((item) => {
          const totalDiscovered =
            item.contents?.reduce((sum, content) => {
              return sum + (content.submitted || 0);
            }, 0) || 0;
          const totalIndexed =
            item.contents?.reduce((sum, content) => {
              return sum + (content.indexed || 0);
            }, 0) || 0;

          return {
            path: item.path,
            type: item.path.endsWith("_index.xml")
              ? "Sitemap Index"
              : "Sitemap",
            submitted: formatDisplayDate(item.lastSubmitted),
            lastRead: formatDisplayDate(item.lastDownloaded),
            status: item.isPending ? "Pending" : "Success",
            discoveredPages: totalDiscovered,
            indexedPages: totalIndexed,
          };
        });

        setData(normalizedData);
      } catch (err) {
        console.error("Error fetching sitemap data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    propertyid,
    siteUrl,
    squareBoxKey,
    sitemapDataURL,
    formattedStart,
    formattedEnd,
  ]);

  const renderTooltip = (props) => (
    <Tooltip id="sitemap-table-tooltip" {...props}>
      {tooltipDescription}
    </Tooltip>
  );
  if (isHidden) return null;
  if (loading) {
    return (
      <div className={style.Orgnaic_content_box}>
        <div className="d-flex align-items-center mb-3">
          <h5
            className={`text-muted pt-3 pb-2 m-0 ${style.page_view_sub_heading}`}
          >
            Sitemap Data
          </h5>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <span className="ms-2">
              <FaInfoCircle size={14} />
            </span>
          </OverlayTrigger>
        </div>
        <Loader />
      </div>
    );
  }

  return (
    <div className={`${style.Orgnaic_content_box} card shadow-sm p-3 h-100`}>
      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              <th>Sitemap</th>
              <th>Type</th>
              <th>Submitted</th>
              <th>Last read</th>
              <th>Status</th>
              <th>Indexed</th>
              <th>URLs</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {item.path.replace(/^https?:\/\/[^/]+/, "")}
                    </a>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.submitted}</td>
                  <td>{item.lastRead}</td>
                  <td
                    className={
                      item.status === "Success"
                        ? style.status_success
                        : style.status_pending
                    }
                  >
                    {item.status}
                  </td>
                  <td>{item.indexedPages}</td>
                  <td>{item.discoveredPages}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No sitemap data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SitemapTable;
