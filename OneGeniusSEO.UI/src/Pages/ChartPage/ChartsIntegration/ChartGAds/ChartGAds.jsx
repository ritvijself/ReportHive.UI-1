import React from "react";
import { Row, Col } from "react-bootstrap";

import CampaignTable from "../../TotalCharts/GAdsTableChart/GAdsTableChart";
import GAdsCard from "../../TotalCharts/GAdsCards/GAdsCard";
import {
  FaEye,
  FaMousePointer,
  FaChartLine,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import LineChartGAds from "../../TotalCharts/GoogleAdsCharts/LineChart";

import ProgressBarGoogleAds from "../../TotalCharts/GoogleAdsCharts/ProgressBarGoogleAds";
import FunnelChartGoogleAds from "../../TotalCharts/GoogleAdsCharts/FunnelChartGoogleAds";
import WorldMapGoogleAds from "../../TotalCharts/GoogleAdsCharts/WorldMapGoogleAds";
import DoughnutGoogleAds from "../../TotalCharts/GoogleAdsCharts/DoughnutGoogleAds";
import GoogleAdsTable from "../../TotalCharts/DeviceTable/GoogleAdsTable";
import GoogleAdsSummary from "../../TotalCharts/GoogleAdsCharts/CardGoogleAds";
import GoogleAdsDeviceTable from "../../TotalCharts/DeviceTable/GoogleAdsDeviceTable";
import GoogleAdsLandingPageTable from "../../TotalCharts/DeviceTable/GoogleAdsLandingPageTable";
import GoogleAdsCampaignTable from "../../TotalCharts/DeviceTable/GoogleAdsCampaignTable";
import ActiveCampaignPerformanceTable from "../../TotalCharts/DeviceTable/ActiveCampaignPerformanceTableGAds";
import GoogleAdsThreeMonthCostConversionCost from "../../TotalCharts/DeviceTable/GoogleAdsThreeMonthCostConversionCost";
import CallPerformanceTable from "../../TotalCharts/DeviceTable/CallPerformanceTable";
const ChartGAds = ({
  googleAdsCustomerId,
  startDate,
  endDate,
  style,
  ClicksConversionCost,
}) => {
  return (
    <>
      <div className={`${style.table_heading} mb-5`}>
        {/* <h4 className="mb-0">Paid Marketing Report</h4> */}
        <p className={`${style.table_subheading}`}>
          Campaign Performance Overview
        </p>
      </div>
      {/* <Row className="mt-3">
        <Col md={6}>
          <LineChartGAds title={"Impressions"} />
        </Col>
        <Col md={6}>
          <LineChartGAds title={"Clicks"} />
        </Col>
      </Row> */}
      <Row>
        <Col md={12}>
          <GoogleAdsSummary
            customerID={googleAdsCustomerId}
            startDate={startDate}
            endDate={endDate}
            ApiData={ClicksConversionCost[0]}
            code={ClicksConversionCost[0].code}
          />
        </Col>{" "}
      </Row>

      <Row>
        <GoogleAdsThreeMonthCostConversionCost
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[6]}
        />
      </Row>

      {/* <Row className="mt-3">
        <Col md={6}>
          <ProgressBarGoogleAds title={"Clicks"} />
        </Col>
        <Col md={6}>
          <FunnelChartGoogleAds />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <ProgressBarGoogleAds title={"Clicks by Top Countries"} />
        </Col>
        <Col md={6}>
          <DoughnutGoogleAds />
        </Col>
      </Row> */}
      <Row>
        <GoogleAdsDeviceTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[1]}
        />
      </Row>

      <Row>
        <GoogleAdsTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[2]}
        />
      </Row>

      <Row>
        <GoogleAdsLandingPageTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[3]}
        />
      </Row>

      <Row>
        <GoogleAdsCampaignTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[4]}
        />
      </Row>
      <Row>
        <ActiveCampaignPerformanceTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[5]}
        />
      </Row>
      <Row>
        <CallPerformanceTable
          customerID={googleAdsCustomerId}
          startDate={startDate}
          endDate={endDate}
          ApiData={ClicksConversionCost[7]}
        />
      </Row>
    </>
  );
};

export default ChartGAds;
