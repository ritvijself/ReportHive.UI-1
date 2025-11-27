import { Col, Row } from "react-bootstrap";
import LinkedInCard from "../../TotalCharts/LinkedInCharts/LinkedInCard/LinkedInCard";
import LinkedInSocialActionsChart from "../../TotalCharts/LinkedInCharts/LinkedInSocialActionChart/LinekedInBarChart";
import LinkedInLineChart from "../../TotalCharts/LinkedInCharts/LikedInLineCharts/LinkedInLineChart";
import LinkedInLastFivePosts from "../../TotalCharts/DeviceTable/LinkedInPost";

const ChartsLinkedIn = ({ linkedInUserId, startDate, endDate }) => {
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          LinkedIn Reports
        </h4>{" "}
      </div>

      <Row>
        <Col className="col-12">
          <LinkedInCard
            startDate={startDate}
            endDate={endDate}
            linkedInUserId={linkedInUserId}
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <LinkedInLineChart title=" Impressions" type="impressions" />
        </Col>
        <Col md={6}>
          <LinkedInLineChart title=" Clicks" type="clicks" />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <LinkedInSocialActionsChart type="netFollowers" />
        </Col>
        <Col md={6}>
          <LinkedInSocialActionsChart type="socialActions" />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={12}>
          <LinkedInLastFivePosts />
        </Col>
      </Row>
    </>
  );
};

export default ChartsLinkedIn;
