import React, { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip, Image } from "react-bootstrap";
import Loader from "../../../../Loader/Loader";
import { formatDateLocal } from "../../../../../utils/FormatDate";
import { FaInfoCircle } from "react-icons/fa";
import style from "./InstagramPostTable.module.css";

const INSTAGRAM_COLUMNS = ["Post", "Caption", "Type", "Posted On", "Likes"];

const InstagramPostTable = ({
  insta_Id,
  startDate,
  endDate,
  data,
  title = "Instagram Posts",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [columns] = useState(INSTAGRAM_COLUMNS);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (insta_Id) {
      fetchInstagramData();
    }
  }, [insta_Id, startDate, endDate]);

  const fetchInstagramData = async () => {
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
          body: JSON.stringify({
            accountId: insta_Id
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      // Server-driven hide: backend may return this special object
      if (result && result.isSuccess === true && (result.data === null) && typeof result.message === "string" && result.message.includes("User wants to hide")) {
        setIsHidden(true);
        setPosts([]);
        setLoading(false);
        return;
      }

      // ----------- FIXED RESPONSE HANDLING -------------
      const rawPosts = Array.isArray(result)
        ? result
        : result.posts || [];

      const transformedPosts = rawPosts.map((post) => ({
        id: post.id,
        imageUrl: post.media_url,
        caption: post.caption,
        mediaType: post.media_type,
        timestamp: post.timestamp,
        likes: post.like_count,
      }));

      // ---------------------------------------------------

      setPosts(transformedPosts);
    } catch (err) {
      console.error("Error fetching Instagram data:", err);
      setError("Failed to load Instagram data");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="insta-tooltip" {...props}>
      Returns Instagram posts with caption, type, likes, and media in selected
      date range.
    </Tooltip>
  );

  const renderCell = (post, column) => {
    const key = column.toLowerCase().replace(/\s+/g, "");
    switch (key) {
      case "post":
        return (
          <Image
            src={post.imageUrl || "https://via.placeholder.com/100/fc4f4f"}
            alt="Post"
            thumbnail
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        );
      case "caption":
        return (
          <div style={{ maxWidth: "300px", whiteSpace: "normal" }}>
            {post.caption || "-"}
          </div>
        );
      case "type":
        return post.mediaType || "-";
      case "postedon":
        return post.timestamp
          ? new Date(post.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-";
      case "likes":
        return post.likes?.toLocaleString() || "0";
      default:
        return "-";
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

  if (isHidden) return null;

  return (
    <div className={style.Orgnaic_content_box}>
      <div className="d-flex align-items-center mb-3">
        <h5 className={`text-muted pt-3 m-0 ${style.page_view_sub_heading}`}>
          {title}
        </h5>
      </div>

      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id}>
                  {columns.map((col, idx) => (
                    <td key={idx}>{renderCell(post, col)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-3">
                  No Instagram posts available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstagramPostTable;
