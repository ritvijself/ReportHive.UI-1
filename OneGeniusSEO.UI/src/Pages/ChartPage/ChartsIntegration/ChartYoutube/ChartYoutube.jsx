import React from "react";
import { Row, Col } from "react-bootstrap";
import SubscriberTrendChart from "../../TotalCharts/YoutubeCharts/SubscriberTrendchart/SubscriberTrendChart";
import GMBDateCard from "../../TotalCharts/GMBDateCard/GMBDateCard";
import YoutubeCards from "../../TotalCharts/YoutubeCharts/SquareIconBox/YoutubeCards";
import { FaPlayCircle, FaThumbsUp, FaEye } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import SocialPostTable from "../../TotalCharts/TopPostFB/FBPostTable";
import ChannelLikesChart from "../../TotalCharts/YoutubeCharts/LineGraph/DoubleLineChart";
const ChartYoutube = ({
  startDate,
  endDate,
  ytChannel_Id,
  SubscriberGainsAndLosses,
  statistics,
  channelLifetimeLikes,
  ChannelLikesMonthly,
  engagementByCountry,
}) => {
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Youtube Reports
        </h4>{" "}
      </div>

      <Row>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <YoutubeCards
            title="Total Views"
            icon={<FaEye />}
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            data={statistics[0]}
            id={statistics[0].id}
            endDate={endDate}
            metricType="views"
          />
        </Col>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <YoutubeCards
            title="Total Videos"
            icon={<FaPlayCircle />}
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            data={statistics[0]}
            id={statistics[0].id}
            metricType="videos"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <YoutubeCards
            title="Subscribers"
            icon={<TiGroup />}
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            data={statistics[0]}
            id={statistics[0].id}
            metricType="subscribers"
          />
        </Col>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <YoutubeCards
            title={channelLifetimeLikes[0].title}
            icon={<FaThumbsUp />}
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            data={channelLifetimeLikes[0]}
            id={channelLifetimeLikes[0].id}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <SubscriberTrendChart
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            id={SubscriberGainsAndLosses[0].id}
            data={SubscriberGainsAndLosses[0]}
            title={SubscriberGainsAndLosses[0].title}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <ChannelLikesChart
            ytChannel_Id={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            id={ChannelLikesMonthly[0].id}
            data={ChannelLikesMonthly[0]}
            title={ChannelLikesMonthly[0].title}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <SocialPostTable
            platform="youtube"
            ytChannelId={ytChannel_Id}
            startDate={startDate}
            endDate={endDate}
            data={engagementByCountry[0]}
            id={engagementByCountry[0].id}
          />
        </Col>
      </Row>
    </>
  );
};

export default ChartYoutube;
