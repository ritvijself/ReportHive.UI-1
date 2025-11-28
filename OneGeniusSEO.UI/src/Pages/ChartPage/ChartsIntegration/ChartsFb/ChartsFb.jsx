import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import LineChartFb from "../../TotalCharts/DailyLineChartFb/LineChartFb";
import FacebookInsights from "../../TotalCharts/FacebookDemoCharts/FacebookInsights";
import GAdsCard from "../../TotalCharts/GAdsCards/GAdsCard";
import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaComments,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import PieChart from "../../TotalCharts/PieChart/PieChart";
import AudienceDemographicsChart from "../../TotalCharts/BarFBChart/BarFBChart";
import FBPostTable from "../../TotalCharts/TopPostFB/FBPostTable";
import FacebookLastFivePosts from "../../TotalCharts/FBCharts/FacebookLastFivePost/FacebookLastFivePost";

const ChartsFb = ({
  startDate,
  endDate,
  pageId,
  FacebookUniqueImpressionApi,
  totalFollowers,
  totalPageLikes,
  totalPost_Like_cmnt_share,
  TopFivePost,
}) => {
  const [hiddenCodes, setHiddenCodes] = useState(new Set());
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const codeFor = (item) => (item && (item.url || item.apiurl || item.title)) || "";

  useEffect(() => {
    let mounted = true;

    const nullSafeSplit = (value, delimiter = ",") =>
      String(value || "")
        .split(delimiter)
        .map((s) => s.trim())
        .filter(Boolean);

    const parseResponse = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) {
        return data
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") return item;
            return item.apiUniqueName || item.code || item.url || item.title || null;
          })
          .filter(Boolean);
      }
      return nullSafeSplit(data?.apiUniqueName);
    };

    const fetchHidden = async () => {
      if (!apibaseurl || !token) return;
      try {
        const resp = await fetch(`${apibaseurl}/api/FacebookCustomizeHideApiList/get`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const list = parseResponse(data);
        if (!mounted) return;
        setHiddenCodes(new Set(list));
      } catch (e) {
        console.warn("Failed to fetch Facebook hide list", e);
      }
    };

    fetchHidden();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Facebook Insights Reports
        </h4>{" "}
      </div>
      {/* Post likes and comments share  */}
      <Row>
        {Array.isArray(totalPageLikes) && codeFor(totalPageLikes[0]) && !hiddenCodes.has(codeFor(totalPageLikes[0])) && (
          <Col className="mb-3 mt-3 flex-grow-1">
            <GAdsCard
              pageId={pageId}
              title={totalPageLikes[0].title}
              id={totalPageLikes[0].id}
              data={totalPageLikes[0]}
              icon={<FaThumbsUp />}
              change={0}
            />
          </Col>
        )}

        {Array.isArray(totalFollowers) && codeFor(totalFollowers[0]) && !hiddenCodes.has(codeFor(totalFollowers[0])) && (
          <Col className="mb-3 mt-3 flex-grow-1">
            <GAdsCard
              pageId={pageId}
              title={totalFollowers[0].title}
              icon={<FaUsers />}
              id={totalFollowers[0].id}
              data={totalFollowers[0]}
            />
          </Col>
        )}

        {Array.isArray(totalPost_Like_cmnt_share) && codeFor(totalPost_Like_cmnt_share[0]) && !hiddenCodes.has(codeFor(totalPost_Like_cmnt_share[0])) && (
          <Col className="mb-3 mt-3 flex-grow-1">
            <GAdsCard
              title="Total Posts Likes"
              pageId={pageId}
              icon={<FaRegThumbsUp />}
              id={totalPost_Like_cmnt_share[0].id}
              data={totalPost_Like_cmnt_share[0]}
              metricType="likeCount"
            />
          </Col>
        )}

        {Array.isArray(totalPost_Like_cmnt_share) && codeFor(totalPost_Like_cmnt_share[0]) && !hiddenCodes.has(codeFor(totalPost_Like_cmnt_share[0])) && (
          <Col className="mb-3 mt-3 flex-grow-1">
            <GAdsCard
              title="Total Posts Comments"
              pageId={pageId}
              icon={<FaComments />}
              id={totalPost_Like_cmnt_share[0].id}
              data={totalPost_Like_cmnt_share[0]}
              metricType="commentCount"
            />
          </Col>
        )}

        {Array.isArray(totalPost_Like_cmnt_share) && codeFor(totalPost_Like_cmnt_share[0]) && !hiddenCodes.has(codeFor(totalPost_Like_cmnt_share[0])) && (
          <Col className="mb-3 mt-3 flex-grow-1">
            <GAdsCard
              title="Total Posts Shares"
              pageId={pageId}
              icon={<FaChartLine />}
              id={totalPost_Like_cmnt_share[0].id}
              data={totalPost_Like_cmnt_share[0]}
              metricType="shareCount"
            />
          </Col>
        )}
      </Row>
      {/* Unique Impressions and Daily Followers */}
      <Row className="mt-4">
        {Array.isArray(FacebookUniqueImpressionApi) && FacebookUniqueImpressionApi.map((data) => {
          const code = codeFor(data);
          if (!code || hiddenCodes.has(code)) return null;
          return (
            <Col md={6} className="mb-4 g-4 mt-0" key={data.id}>
              <LineChartFb
                startDate={startDate}
                endDate={endDate}
                pageId={pageId}
                id={data.id}
                title={data.title}
                data={data}
              />
            </Col>
          );
        })}
      </Row>

      <Row>
        {Array.isArray(TopFivePost) && codeFor(TopFivePost[0]) && !hiddenCodes.has(codeFor(TopFivePost[0])) && (
          <Col md={12} className="mb-3 mt-3">
            <FacebookLastFivePosts
              pageId={pageId}
              id={TopFivePost[0].id}
              data={TopFivePost[0]}
              title={TopFivePost[0].title}
            />
          </Col>
        )}
      </Row>
    </>
  );
};

export default ChartsFb;
