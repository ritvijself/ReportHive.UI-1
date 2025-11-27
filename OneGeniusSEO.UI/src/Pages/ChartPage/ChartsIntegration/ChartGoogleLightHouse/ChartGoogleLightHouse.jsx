import React from "react";
import { Row, Col } from "react-bootstrap";
import TestsChart from "../../TotalCharts/TestsChart/TestsChart";
import ScoreChart from "../../TotalCharts/ScoreChart/ScoreChart";
import PageDepthChart from "../../TotalCharts/PageDepthChart/PageDepthChart";
import DateAnalyzed from "../../TotalCharts/DateAnalyzed/DateAnalyzed";

const GoogleLightHouse = ({
  lighthouseurl,
  startDate,
  endDate,

  LighthouseScoreApi,
}) => {
  return (
    <>
      {/* Google Lighthouse */}
      <div className={`text-center mt-3 mb-5`}>
        {" "}
        <h4 className="" style={{ fontSize: "25px" }}>
          Quality and Performance of Web Pages
        </h4>
        <p className="table_subheading">(Data Source - Google Lighthouse )</p>
      </div>

      <Row>
        {/* <Col md={6} lg={2}>
          <Col md={12} className="mb-4 g-4">
            <TestsChart
              siteUrl={siteUrl}
              startDate={startDate}
              endDate={endDate}
            />
          </Col>{" "}
          <Col md={12} lg={12} className="mb-4 g-4 ">
            <DateAnalyzed
              siteUrl={lighthouseurl}
              id={LighthouseScoreApi[0]}
              SquareBox={LighthouseScoreApi[0]}
              title="Date Analyzed"
              maxWidth="100%"
            />
          </Col>
        </Col> */}
        <Col md={6} lg={4}>
          <Row>
            {LighthouseScoreApi.map((box) => (
              <Col md={6} className="mb-4 g-4 mt-0" key={box.id}>
                <ScoreChart
                  siteUrl={lighthouseurl}
                  metric="performance"
                  id={box.id}
                  SquareBox={box}
                  startDate={startDate}
                  endDate={endDate}
                  title="Performance"
                  widthDoughnut="80px"
                  heightDoughnut="80px"
                  margintopbottom="15px"
                />
              </Col>
            ))}
            {LighthouseScoreApi.map((box) => (
              <Col md={6} className="mb-4 g-4 mt-0" key={box.id}>
                <ScoreChart
                  siteUrl={lighthouseurl}
                  metric="seo"
                  id={box.id}
                  SquareBox={box}
                  startDate={startDate}
                  endDate={endDate}
                  title="SEO"
                  widthDoughnut="80px"
                  heightDoughnut="80px"
                  margintopbottom="15px"
                />
              </Col>
            ))}
            {LighthouseScoreApi.map((box) => (
              <Col md={6} className="mb-4 g-4 mt-0" key={box.id}>
                <ScoreChart
                  siteUrl={lighthouseurl}
                  metric="accessibility"
                  id={box.id}
                  SquareBox={box}
                  startDate={startDate}
                  endDate={endDate}
                  title="Accessibility"
                  widthDoughnut="80px"
                  heightDoughnut="80px"
                  margintopbottom="15px"
                />
              </Col>
            ))}
            {LighthouseScoreApi.map((box) => (
              <Col md={6} className="mb-4 g-4 mt-0" key={box.id}>
                <ScoreChart
                  siteUrl={lighthouseurl}
                  metric="best-practices"
                  id={box.id}
                  SquareBox={box}
                  startDate={startDate}
                  endDate={endDate}
                  title="Best Practices"
                  widthDoughnut="80px"
                  heightDoughnut="80px"
                  margintopbottom="15px"
                />
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={12} lg={6}>
          {" "}
          <Col md={12}>
            <PageDepthChart
              siteUrl={lighthouseurl}
              id={LighthouseScoreApi[0]}
              SquareBox={LighthouseScoreApi[0]}
              title="Load Time (seconds)"
              heightchart="347px"
            />
          </Col>
        </Col>
      </Row>
    </>
  );
};

export default GoogleLightHouse;
