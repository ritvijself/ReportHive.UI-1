import React from "react";
import style from "./DeviceTable.module.css";

const LinkedInLastFivePosts = ({ title }) => {
  // Static sample data
  const posts = [
    {
      id: 1,
      date: "Aug 10, 2025",
      post: "Excited to share our latest company update!",
      likes: 120,
      clicks: 45,
      engagementRate: "5.6%",
      impressions: 2100,
    },
    {
      id: 2,
      date: "Aug 8, 2025",
      post: "Our new product launch is here 🚀",
      likes: 200,
      clicks: 80,
      engagementRate: "6.8%",
      impressions: 3000,
    },
    {
      id: 3,
      date: "Aug 6, 2025",
      post: "Behind-the-scenes look at our team",
      likes: 90,
      clicks: 30,
      engagementRate: "4.2%",
      impressions: 1800,
    },
    {
      id: 4,
      date: "Aug 4, 2025",
      post: "Customer success story: how we made an impact",
      likes: 150,
      clicks: 60,
      engagementRate: "5.9%",
      impressions: 2500,
    },
    {
      id: 5,
      date: "Aug 2, 2025",
      post: "Tips & tricks for industry professionals",
      likes: 110,
      clicks: 50,
      engagementRate: "5.3%",
      impressions: 2000,
    },
  ];

  const columns = [
    { key: "date", label: "Date" },
    { key: "post", label: "Post" },
    { key: "likes", label: "Likes" },
    { key: "clicks", label: "Clicks" },
    { key: "engagementRate", label: "Engagement Rate" },
    { key: "impressions", label: "Impressions Per Post" },
  ];

  const renderCell = (post, column) => {
    switch (column.key) {
      case "post":
        return (
          <div style={{ maxWidth: "300px", whiteSpace: "normal" }}>
            {post.post}
          </div>
        );
      default:
        return post[column.key] || "-";
    }
  };

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
                <th key={idx} style={{ color: "red" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id}>
                  {columns.map((col, i) => (
                    <td key={i}>{renderCell(post, col)}</td>
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

export default LinkedInLastFivePosts;
