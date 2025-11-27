import { Col, Row } from "react-bootstrap";
import KPICards from "../../TotalCharts/ShopifyCharts/ShopifyCards/ShopifyCards";
import TrafficLineChart from "../../TotalCharts/ShopifyCharts/TrafficLineChart/TrafficLineChart";
import SalesBarChart from "../../TotalCharts/ShopifyCharts/SalesBarChart/SalesBarChart";
import ProductPerformanceChart from "../../TotalCharts/ShopifyCharts/ProductPerformanceChart/ProductPersformanceChart";
import CustomerLocationPie from "../../TotalCharts/ShopifyCharts/CustomerLocationPie/CustomerLocationPie";
import OrdersTableShopify from "../../TotalCharts/DeviceTable/OrdersTableShopify";
import ShopifyTopProducts from "../../TotalCharts/ShopifyCharts/ProgressBar/ShopifyTopProducts";

const ChartShopify = ({ shopifyId, startDate, endDate, ShopifyReports }) => {
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Shopify Reports
        </h4>{" "}
      </div>
      <Row className="mt-3">
        <Col>
          <KPICards
            shopifyId={shopifyId}
            startDate={startDate}
            endDate={endDate}
            ShopifyReports={ShopifyReports}
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <ProductPerformanceChart />
        </Col>
        <Col md={6}>
          <SalesBarChart />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <TrafficLineChart />
        </Col>
        <Col md={6}>
          <CustomerLocationPie />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <ShopifyTopProducts chartType="topProducts" />
        </Col>
        <Col md={6}>
          <ShopifyTopProducts chartType="byType" />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={12}>
          <OrdersTableShopify />
        </Col>
      </Row>
    </>
  );
};

export default ChartShopify;
