import React from "react";
import { Row, Col } from "react-bootstrap";
import FollowerCount from "../../TotalCharts/InstagramCharts/InstaFollowerCount/InstaFollowerCount";
import CountryChart from "../../TotalCharts/BarChart/BarChart";
import LineGraph from "../../TotalCharts/LineGraph/LineGraph";
import { Follower } from "../../../../api/InstagramApis";
import InstagramMetricsGrid from "./InstagramMetricsGrid";
import FBPostTable from "../../TotalCharts/TopPostFB/FBPostTable";
import InstagramPostTable from "../../TotalCharts/InstagramCharts/InstagramPostTable/InstagramPostTable";

const ChartInstagram = ({
  insta_Id,
  startDate,
  endDate,
  TotalFollowers,
  GetPostsByDateRange,
  GetPostsDetailsByDateRange,
}) => {
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Instagram Report
        </h4>{" "}
      </div>
      {/* 
      Static Charts */}
      <Row>
        {TotalFollowers.map((instadata) => (
          <Col md={4} className="mb-4">
            <FollowerCount
              insta_id={insta_Id}
              instadata={instadata}
              id={instadata.id}
              title={instadata.title}
              metricType={instadata.metricType}
            />
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={12} className="mb-3 mt-3">
          {GetPostsDetailsByDateRange && GetPostsDetailsByDateRange[0] && (
            <InstagramMetricsGrid
              insta_Id={insta_Id}
              startDate={startDate}
              endDate={endDate}
              data={GetPostsDetailsByDateRange[0]}
            />
          )}

          <InstagramPostTable
            insta_Id={insta_Id}
            startDate={startDate}
            endDate={endDate}
            platform="instagram"
            data={GetPostsByDateRange[0]}
            id={GetPostsByDateRange[0].id}
            title={GetPostsByDateRange[0].title}
          />
        </Col>
      </Row>
    </>
  );
};

export default ChartInstagram;
