import React, { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaTachometerAlt,
  FaChartLine,
  FaTasks,
  FaShieldAlt,
} from "react-icons/fa";
import {
  SiGoogleads,
  SiFacebook,
  SiGoogleanalytics,
  SiShopify,
  SiHubspot,
  SiLinkedin,
  SiMysql,
  SiGooglebigquery,
  SiSnowflake,
} from "react-icons/si";
import style from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };
  const scrollToFeatures = () => {
    const navbarHeight = 80;
    const sectionTop =
      featuresRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: sectionTop - navbarHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Sticky Navigation Bar */}
      <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand
            href="/"
            className={`fw-bold fs-4  d-flex align-items-center gap-2 ${style.navbarBrand}`}
          >
            <img
              src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
              alt="1GeniusSEO Logo"
              style={{ height: "40px", width: "40px", objectFit: "contain" }}
            />
            1GeniusSEO
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center gap-4">
              <Nav.Link
                href="#products"
                className="fw-semibold text-dark"
                onClick={scrollToFeatures}
              >
                Products
              </Nav.Link>
              <Nav.Link
                onClick={handleSignIn}
                className="fw-semibold text-dark"
                style={{ cursor: "pointer" }}
              >
                Sign In
              </Nav.Link>
              <Nav.Link
                onClick={handleSignUp}
                className="fw-semibold text-dark"
                style={{ cursor: "pointer" }}
              >
                Sign Up
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Hero Section (restructured to two-column) */}
      <section className={`${style.heroSection} bg-light py-5 border-bottom`}>
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <h1 className="display-5 fw-bold mb-3">
                All-in-One Marketing & Project Management Suite
              </h1>
              <p
                className="lead text-muted mb-4 mx-auto"
                style={{ maxWidth: "700px" }}
              >
                Track SEO & PPC performance, manage client projects, and stay on
                top of leads — all from a single, intuitive dashboard.
              </p>
              <div className="d-flex justify-content-start gap-3">
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  variant="dark"
                  className={style.signupBtn}
                  style={{ background: "black", color: "white" }}
                >
                  Sign Up
                </Button>
              </div>
              <div className={style.statsBar}>
                <div className={style.statsCard}>
                  <div className={style.statNumber}>12k+</div>
                  <div className={style.statLabel}>Keywords tracked</div>
                </div>
                <div className={style.statsCard}>
                  <div className={style.statNumber}>98.9%</div>
                  <div className={style.statLabel}>Data reliability</div>
                </div>
                <div className={style.statsCard}>
                  <div className={style.statNumber}>3x</div>
                  <div className={style.statLabel}>Faster reporting</div>
                </div>
                <div className={style.statsCard}>
                  <div className={style.statNumber}>24/7</div>
                  <div className={style.statLabel}>Sync & alerts</div>
                </div>
              </div>
            </Col>
            <Col lg={5}>
              {/* Icon card to emulate Windsor-style visual focus (icons only, no new text) */}
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
                    <SiGoogleads size={30} className="text-primary" />
                    <SiFacebook size={30} className="text-primary" />
                    <SiGoogleanalytics size={30} className="text-warning" />
                    <SiShopify size={30} className="text-success" />
                    <SiHubspot size={30} className="text-danger" />
                    <SiLinkedin size={30} className="text-primary" />
                    <SiMysql size={30} className="text-secondary" />
                    <SiGooglebigquery size={30} className="text-primary" />
                    <SiSnowflake size={30} className="text-info" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Integrations icon strip (structure-only, icons without added text) */}
      <section className="py-4 border-bottom">
        <Container>
          <div className={style.marquee}>
            <div className={style.marqueeInner}>
              <div className={style.marqueeTrack}>
                <SiGoogleads size={26} />
                <SiFacebook size={26} />
                <SiGoogleanalytics size={26} />
                <SiShopify size={26} />
                <SiHubspot size={26} />
                <SiLinkedin size={26} />
                <SiMysql size={26} />
                <SiGooglebigquery size={26} />
                <SiSnowflake size={26} />
              </div>
              <div className={style.marqueeTrack} aria-hidden="true">
                <SiGoogleads size={26} />
                <SiFacebook size={26} />
                <SiGoogleanalytics size={26} />
                <SiShopify size={26} />
                <SiHubspot size={26} />
                <SiLinkedin size={26} />
                <SiMysql size={26} />
                <SiGooglebigquery size={26} />
                <SiSnowflake size={26} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5" ref={featuresRef}>
        <Container>
          <h2 className="text-center fw-bold mb-5 fs-2">
            Everything You Need to Scale Your Marketing Operations
          </h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm ">
                <Card.Body className="d-flex flex-column align-items-center">
                  <FaChartBar size={40} className="text-dark mb-3" />
                  <Card.Title>SEO & PPC Reporting</Card.Title>
                  <Card.Text>
                    Track keyword rankings, ad spend, conversions, and campaign
                    ROI.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body className="d-flex flex-column align-items-center">
                  <FaClipboardList size={40} className="text-dark mb-3" />
                  <Card.Title>Project Management</Card.Title>
                  <Card.Text>
                    Assign tasks, set deadlines, and collaborate with your team
                    or clients.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body className="d-flex flex-column align-items-center">
                  <FaUsers size={40} className="text-dark mb-3" />
                  <Card.Title>Lead Management</Card.Title>
                  <Card.Text>
                    Capture, organize, and follow up on leads with built-in CRM
                    functionality.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Benefits Section */}
      <section id="benefits" className=" bg-light py-5">
        <Container>
          <h2 className="text-center fw-bold mb-5 fs-2">
            Work Smarter, Not Harder
          </h2>
          <Row className="g-4 justify-content-center">
            <Col md={6} lg={3}>
              <Card className="h-100 text-center shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fw-semibold">
                    Centralized Dashboard
                  </Card.Title>
                  <Card.Text>
                    View all your marketing metrics in one place for easy
                    analysis.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-center shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fw-semibold">
                    White-Label Reports
                  </Card.Title>
                  <Card.Text>
                    Deliver branded reports effortlessly to impress your
                    clients.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-center shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fw-semibold">
                    Automated Workflows
                  </Card.Title>
                  <Card.Text>
                    Reduce manual tasks with powerful automation tools.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-center shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fw-semibold">
                    Real-Time Updates
                  </Card.Title>
                  <Card.Text>
                    Stay ahead with instant alerts and live performance
                    insights.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Showcase Section */}
      <section id="showcase" className="py-5">
        <Container>
          <h2 className="text-center fw-bold mb-5 fs-2">At a glance</h2>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm border-0 text-center">
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <FaTachometerAlt size={36} className="mb-3 text-dark" />
                  <Card.Title className="mb-1">Overview Dashboard</Card.Title>
                  <Card.Text className="text-muted">
                    Key metrics in one place.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm border-0 text-center">
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <FaChartLine size={36} className="mb-3 text-dark" />
                  <Card.Title className="mb-1">Performance Insights</Card.Title>
                  <Card.Text className="text-muted">
                    Trends, ROAS, CPA, and LTV.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm border-0 text-center">
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <FaTasks size={36} className="mb-3 text-dark" />
                  <Card.Title className="mb-1">Task Collaboration</Card.Title>
                  <Card.Text className="text-muted">
                    Assign, track, and deliver.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 shadow-sm border-0 text-center">
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <FaShieldAlt size={36} className="mb-3 text-dark" />
                  <Card.Title className="mb-1">Reliable Data</Card.Title>
                  <Card.Text className="text-muted">
                    Secure and consistent syncs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center text-center text-lg-start gap-4">
            {/* Left Section */}
            <div className={style.footerLeft}>
              <p className="mb-1 ">
                © {new Date().getFullYear()} 1GeniusSEO. All Rights Reserved.
              </p>
              <Link to="/terms" className="text-decoration-none text-white">
                Terms & Privacy
              </Link>
            </div>

            {/* Center CTA Section */}
            <div>
              <h2 className="fw-bold mb-3">Ready to Simplify Your Workflow?</h2>
              <p className={`mb-4 ${style.ctaText}`}>
                Start your free trial or book a personalized demo today.
              </p>
              <Button
                onClick={handleSignUp}
                size="lg"
                variant="light"
                className={style.signupBtn}
              >
                Sign Up
              </Button>
            </div>

            {/* Right Section - Contact Info */}
            <div className={`text-lg-end ${style.footerRight}`}>
              <h6 className="fw-bold mb-2 text-white">Get in Touch</h6>
              <p className="mb-1 ">
                <strong>Email:</strong> Contact@eatechnologies.net
              </p>
              <p className="mb-0 " style={{ maxWidth: "280px" }}>
                <strong>Office Address:</strong> 2206, 2nd Floor, Express Trade
                Towers – 2, Plot B – 36, Sector 132, Noida 201301, India
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
