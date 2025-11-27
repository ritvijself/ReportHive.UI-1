import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../../Loader/Loader";
import style from "./FacebookLastFivePost.module.css"; 

const FacebookLastFivePosts = ({ pageId, data, title }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(!!pageId);
  const [error, setError] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");


  const columns = [
    { key: "sno", label: "S.no" },
    { key: "message", label: "Caption" },
    { key: "created_time", label: "Posted On" },
    { key: "link", label: "Link" },
  ];

  useEffect(() => {
    if (!pageId) return;

    const fetchLastFivePosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/${data.apiurl}/${data.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pageId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        setPosts(result.data || []);
      } catch (err) {
        console.error("Error fetching Facebook posts:", err);
        setError("Failed to load Facebook posts");
      } finally {
        setLoading(false);
      }
    };

    fetchLastFivePosts();
  }, [pageId, apiBaseUrl, data]);

  const renderTooltip = (props) => (
    <Tooltip id="fb-tooltip" {...props}>
      Last 5 Facebook posts including caption and creation time
    </Tooltip>
  );

  const renderCell = (post, column, index) => {
    switch (column.key) {
      case "sno":
        return index + 1;
      case "message":
        return (
          <div style={{ maxWidth: "300px", whiteSpace: "normal" }}>
            {post.message || "-"}
          </div>
        );
      case "created_time":
        return post.created_time
          ? new Date(post.created_time).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-";
      case "link":
        return (
          <a
            href={`https://facebook.com/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            View Post
          </a>
        );
      default:
        return post[column.key] || "-";
    }
  };

  if (loading) {
    return (
      <div className={style.Orgnaic_content_box}>
        <div className="d-flex align-items-center mb-3">
          <h5
            className={`text-muted pt-3 pb-2 m-0 ${style.page_view_sub_heading}`}
          >
            {title}
          </h5>
        </div>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.Orgnaic_content_box}>
        <div className="alert alert-danger m-3">{error}</div>
      </div>
    );
  }

  return (
    <div className={style.Orgnaic_content_box}>
      <div className="d-flex align-items-center">
        <h5 className={`text-muted pt-3 m-0 ${style.page_view_sub_heading}`}>
          {title}
        </h5>
      </div>

      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <tr key={post.id}>
                  {columns.map((col, i) => (
                    <td key={i}>{renderCell(post, col, index)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-3">
                  No posts available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacebookLastFivePosts;
