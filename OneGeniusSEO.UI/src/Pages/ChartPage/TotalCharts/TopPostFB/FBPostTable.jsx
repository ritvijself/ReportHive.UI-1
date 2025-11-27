import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Image,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";
import { FaInfoCircle } from "react-icons/fa";

const apiData = {
  facebook: {
    posts: [
      {
        id: 1,
        imageUrl: "https://via.placeholder.com/100/",
        postLink: "https://facebook.com/post/1",
        caption: "Check out our new product launch! #excited #newproduct",
        likes: 1245,
        comments: 342,
        shares: 156,
      },
    ],
    columns: ["Post", "Link", "Caption", "Likes", "Comments", "Shares"],
    platformName: "Facebook",
    platformColor: "red",
  },
  instagram: {
    posts: [],
    columns: ["Post", "Caption", "Type", "Posted On", "Likes"],
    platformName: "Instagram",
    platformColor: "#ff0000",
  },
  youtube: {
    posts: [],
    columns: [],
    platformName: "YouTube",
    platformColor: "#ff0000",
  },
};

const getTooltipDescription = (platform) => {
  switch (platform) {
    case "facebook":
      return "Top posts from your Facebook account, including engagement metrics";
    case "instagram":
      return "Returns all posts within the selected date range, including post details like caption, type, likes, and media.";
    case "youtube":
      return "YouTube engagement metrics by country for the selected period";
    default:
      return "Social media post metrics";
  }
};

const SocialPostTable = ({
  platform = "facebook",
  ytChannelId,
  insta_Id,
  startDate,
  endDate,
  data,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const [platformData, setPlatformData] = useState(
    apiData[platform] || apiData.facebook
  );

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (platform === "youtube" && ytChannelId) {
      fetchYouTubeData();
    } else if (platform === "instagram" && insta_Id) {
      fetchInstagramData();
    } else {
      setPlatformData(apiData[platform] || apiData.facebook);
    }
  }, [platform, ytChannelId, insta_Id, startDate, endDate]);

  const fetchInstagramData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStart = formatDateLocal(startDate);
      const formattedEnd = formatDateLocal(endDate);

      const requestBody = {
        pageId: insta_Id,
        startDate: formattedStart,
        endDate: formattedEnd,
      };

      const response = await fetch(
        `${apibaseurl}/api/${data.apiurl}/${data.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (
        result.IsSuccess === true &&
        result.Data === null &&
        result.Message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      const transformedData = {
        posts:
          result.posts?.map((post) => ({
            id: post.id,
            imageUrl: post.media_url,
            caption: post.caption,
            mediaType: post.media_type,
            timestamp: post.timestamp,
            likes: post.like_count,
          })) || [],
        columns: ["Post", "Caption", "Type", "Posted On", "Likes"],
        platformName: "Instagram",
      };

      setPlatformData(transformedData);
    } catch (err) {
      console.error("Error fetching Instagram data:", err);
      setError("Failed to load Instagram data");
      setPlatformData(apiData.instagram);
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStart = formatDateLocal(startDate);
      const formattedEnd = formatDateLocal(endDate);

      const requestBody = {
        tyChannelId: ytChannelId,
        startDate: formattedStart,
        endDate: formattedEnd,
      };

      const response = await fetch(
        `${apibaseurl}/api/${data.apiurl}/${data.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (
        result.IsSuccess === true &&
        result.Data === null &&
        result.Message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      const transformedData = {
        posts:
          result.rows?.map((row, index) => ({
            id: index + 1,
            country: row[0],
            views: row[1],
            likes: row[2],
            subscribersGained: row[3],
          })) || [],
        columns: result.columnHeaders?.map((header) => {
          const name = header.name;
          return (
            name.charAt(0).toUpperCase() +
            name.slice(1).replace(/([A-Z])/g, " $1")
          );
        }) || ["Country", "Views", "Likes", "Subscribers Gained"],
        platformName: "YouTube",
      };

      setPlatformData(transformedData);
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
      setError("Failed to load YouTube data");
      setPlatformData({
        ...apiData.youtube,
        columns: ["Country", "Views", "Likes", "Subscribers Gained"],
      });
    } finally {
      setLoading(false);
    }
  };

  const { posts, columns, platformName, platformColor } = platformData;

  const renderCell = (post, column) => {
    const columnKey = column.toLowerCase().replace(/\s+/g, "");

    switch (columnKey) {
      case "post":
        return (
          <Image
            src={
              post.imageUrl ||
              post.media_url ||
              `https://via.placeholder.com/100/${platformColor.slice(1)}`
            }
            alt="Post thumbnail"
            thumbnail
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
            }}
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
          ? new Date(post.timestamp).toLocaleDateString()
          : "-";
      case "likes":
        return post.likes?.toLocaleString() || "0";
      default:
        return "-";
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="platform-tooltip" {...props}>
      {getTooltipDescription(platform)}
    </Tooltip>
  );

  if (isHidden) return null;
  if (loading) return <Loader small />;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center">
          <Card.Title style={{ color: platformColor }}>
            {platform === "youtube"
              ? "YouTube Engagement by Country"
              : `Top ${platformName} Posts`}{" "}
            {posts.length > 0 && <Badge bg="secondary">{posts.length}</Badge>}
          </Card.Title>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <Table hover responsive>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id}>
                  {columns.map((column, index) => (
                    <td key={index}>{renderCell(post, column)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No data available for the selected period
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default SocialPostTable;
