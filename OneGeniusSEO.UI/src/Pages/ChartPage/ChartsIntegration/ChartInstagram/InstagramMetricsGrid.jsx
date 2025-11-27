import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import style from "./InstagramMetricsGrid.module.css";

const METRIC_KEYS = [
  { key: "followers", label: "Followers" },
  { key: "posts", label: "Posts" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "impressions", label: "Impressions" },
  { key: "saved", label: "Saved" },
  { key: "shares", label: "Shares" },
  { key: "reach", label: "Reach" },
];

const InstagramMetricsGrid = ({ insta_Id, startDate, endDate, data }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!insta_Id || !data) return;
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insta_Id, startDate, endDate, data]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${apiBaseUrl}/api/${data.apiurl}/${data.url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          accountId: insta_Id,
          startDate,
          endDate,
        }),
      });

      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);

      const result = await resp.json();

      // Expecting an object with keys: followers, posts, likes, comments, impressions, saved, shares, reach
      setMetrics(result || {});
    } catch (err) {
      console.error("Instagram metrics error:", err);
      setError("Failed to load Instagram metrics");
      setMetrics({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${style.Orgnaic_content_box} card shadow-sm p-3 mb-3`}>
      <div className="d-flex align-items-center mb-3">
        <h5 className={`text-muted pt-3 m-0 ${style.page_view_sub_heading}`}>
          Post Metrics By DateRange
        </h5>
      </div>

      {loading ? (
        <div className="text-center py-3">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Row>
          {METRIC_KEYS.map((m) => (
            <Col md={3} sm={6} xs={12} className="mb-3" key={m.key}>
              <div className={style.metricBox}>
                <div className={style.metricLabel}>{m.label}</div>
                <div className={style.metricValue}>
                  {(metrics && (metrics[m.key] ?? 0))?.toLocaleString?.() || 0}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default InstagramMetricsGrid;
