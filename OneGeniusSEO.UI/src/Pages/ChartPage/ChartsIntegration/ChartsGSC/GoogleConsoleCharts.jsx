import React from "react";
import { Row, Col } from "react-bootstrap";
import DeviceTable from "../../TotalCharts/DeviceTable/DeviceTable";
import BarChart from "../../TotalCharts/BarChart/BarChart";
import LineGraph from "../../TotalCharts/LineGraph/LineGraph";
import SitemapTable from "../../TotalCharts/SitemapTable/SitemapTable";
import SecurityCheckBox from "../../TotalCharts/SecurityCheckBox/SecurityCheckBox";
import GoogleLightHouse from "../ChartGoogleLightHouse/ChartGoogleLightHouse";
import ClicksLineGraph from "../../TotalCharts/ClickLineGraphGSC/ClickLineGraph";
import MetricSquareBox from "../../TotalCharts/MetricSquareBoxGSC/MetricSquareBox";
import ProgressBar from "../../TotalCharts/ProgressBar/ProgressBar";
import ChartGAds from "../ChartGAds/ChartGAds";
import KeywordPositionTable from "../../TotalCharts/DeviceTable/KeywordPositionTable";
import useDashboardCustomization from "../../../CustomizeDashboard/UseDashboardCustomization";

const GoogleConsoleCharts = ({
  propertyid,
  startDate,
  endDate,
  GoogleOrganicRanking,
  style,
  siteUrl,
  PopularContent,
  PerformanceByCountry,
  PerformanceByDevices,
  SearchClicksGsc,
  SitemapTableApi,
  SecurityCheckApi,
  SearchClicksGscOneMonth,
  ExcelSearchQueries,
  Top5SearchQueries,
  Top5Pages,
}) => {

const apibaseurl = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("token");

const { chartConfigurations } = useDashboardCustomization(apibaseurl, token);

const gscConfig = chartConfigurations?.["Google Search Console"] || {};

const metricCode = SearchClicksGscOneMonth?.[0]?.code;

const showMetricComparison =
  metricCode && gscConfig[metricCode]
    ? gscConfig[metricCode].showComparison
    : false;


  return (
    <>
      {/* GSC Charts */}
      <div className={`text-center mt-5 mb-5`}>
        {" "}
        <h4 className=" " style={{ fontSize: "25px" }}>
          Website Monitoring and Performance
        </h4>
        <p className={`${style.table_subheading}`}>
          (Data Source - Google Search Console )
        </p>
      </div>
      {/* Top Queries */}
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">Top Queries</h4>{" "}
      </div>
      <Row>
        <ClicksLineGraph
          id={SearchClicksGsc[0].id}
          SquareBox={SearchClicksGsc[0]}
          startDate={startDate}
          endDate={endDate}
          title={SearchClicksGsc[0].title}
          siteUrl={siteUrl}
        />

        <Col md={6} className="mt-3">
          <p>What people are searching for you - Top 5 Keywords</p>
          <ProgressBar
            siteUrl={siteUrl}
            Progress={Top5SearchQueries[0]}
            startDate={startDate}
            endDate={endDate}
            id={Top5SearchQueries[0].id}
            title={Top5SearchQueries[0].title}
            barColor={"#0073ed"}
            titleSize={"16px"}
          />
        </Col>
      </Row>
      <Row>
        <Col className="mb-5 g-4 mt-5" md={12}>
          <MetricSquareBox
            id={SearchClicksGscOneMonth[0].id}
            SquareBox={SearchClicksGscOneMonth[0]}
            startDate={startDate}
            endDate={endDate}
            title={SearchClicksGscOneMonth[0].title}
            siteUrl={siteUrl}
            showComparison={showMetricComparison}
          />
        </Col>
      </Row>
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">Top 50 Queries</h4>{" "}
      </div>
      <Row>
        {" "}
        <Col className="mb-5 g-4 mt-3" md={12}>
          <p>What people are searching for you - Top 50 Keywords</p>
          <DeviceTable
            siteUrl={siteUrl}
            SquareBox={GoogleOrganicRanking[0]}
            startDate={startDate}
            endDate={endDate}
            id={GoogleOrganicRanking[0].id}
            title={GoogleOrganicRanking[0].title}
            columns={[
              { key: "query", label: "Keywords" },
              { key: "clicks", label: "Clicks" },
              { key: "impressions", label: "Impressions" },
              { key: "position", label: "Avg Position" },
              { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>
      {/* Top Pages */}{" "}
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0"> Top 5 Pages Visited</h4>{" "}
      </div>
      <Row>
        <Col md={12} className="mt-3 mb-5 pb-3">
          <ProgressBar
            siteUrl={siteUrl}
            Progress={Top5Pages[0]}
            startDate={startDate}
            endDate={endDate}
            id={Top5Pages[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          />
        </Col>
      </Row>
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0"> Top 50 Pages Visited</h4>{" "}
      </div>
      <Row>
        {" "}
        <Col className="mb-5 g-4 mt-3" md={12}>
          <DeviceTable
            id={PopularContent[0].id}
            title={PopularContent[0].title}
            siteUrl={siteUrl}
            SquareBox={PopularContent[0]}
            startDate={startDate}
            endDate={endDate}
            columns={[
              { key: "page", label: "Pages" },
              { key: "clicks", label: "Clicks" },
              { key: "impressions", label: "Impressions" },
              { key: "position", label: "Avg Position" },
              { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">Performance by Devices</h4>{" "}
      </div>
      <Row>
        {" "}
        <Col className="mb-5 g-4 mt-3" md={12}>
          <DeviceTable
            siteUrl={siteUrl}
            SquareBox={PerformanceByDevices[0]}
            startDate={startDate}
            endDate={endDate}
            id={PerformanceByDevices[0].id}
            title={PerformanceByDevices[0].title}
            columns={[
              { key: "device", label: "Devices" },
              { key: "clicks", label: "Clicks" },
              { key: "impressions", label: "Impressions" },
              { key: "position", label: "Avg Position" },
              { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>
      {/* <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">
          Specific Keywords performnace report provided by <b>SPL</b> (Manual
          check - Google Search Engine, UK)
        </h4>{" "}
      </div>
      <Row></Row>
      <Row>
        <Col md={12} className="mb-4 g-4" key={ExcelSearchQueries[0].id}>
          <KeywordPositionTable
            siteUrl={siteUrl}
            SquareBox={ExcelSearchQueries[0]}
            startDate={startDate}
            endDate={endDate}
            id={ExcelSearchQueries[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          />
        </Col>
      </Row> */}
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">Security Issues</h4>{" "}
      </div>
      <Row>
        <Col md={12} className="mt-3 mb-3">
          <SecurityCheckBox
            siteUrl={siteUrl}
            startDate={startDate}
            endDate={endDate}
            SquareBox={SecurityCheckApi[0]}
          />
        </Col>
      </Row>
      <div className={`${style.organic_heading} `}>
        {" "}
        <h4 className="mb-0">Sitemap Table</h4>{" "}
      </div>
      <Row>
        {" "}
        <Col className="mb-5 g-4" md={12}>
          <SitemapTable
            propertyid={propertyid}
            siteUrl={siteUrl}
            startDate={startDate}
            endDate={endDate}
            SquareBox={SitemapTableApi[0]}
            id={SitemapTableApi[0].id}
            title={SitemapTableApi[0].title}
          />
        </Col>
      </Row>
    </>
  );
};

export default GoogleConsoleCharts;
