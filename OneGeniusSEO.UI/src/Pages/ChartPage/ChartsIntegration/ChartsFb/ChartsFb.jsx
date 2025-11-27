import React from "react";
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
        <Col className="mb-3 mt-3 flex-grow-1">
          <GAdsCard
            pageId={pageId}
            title={totalFollowers[0].title}
            icon={<FaUsers />}
            id={totalFollowers[0].id}
            data={totalFollowers[0]}
          />
        </Col>
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
      </Row>
      {/* Unique Impressions and Daily Followers */}
      <Row className="mt-4">
        {FacebookUniqueImpressionApi.map((data) => (
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
        ))}
      </Row>

      <Row>
        <Col md={12} className="mb-3 mt-3">
          <FacebookLastFivePosts
            pageId={pageId}
            id={TopFivePost[0].id}
            data={TopFivePost[0]}
            title={TopFivePost[0].title}
          />
        </Col>
      </Row>
    </>
  );
};

export default ChartsFb;
