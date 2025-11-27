import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import style from "./HomeNavbar.module.css";

export default function HomeNavbar({ onScrollToFeatures }) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand
          href="/"
          className={`fw-bold fs-4 d-flex align-items-center gap-2 ${style.navbarBrand}`}
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
              className="fw-semibold text-dark"
              style={{ cursor: "pointer" }}
              onClick={handleSignIn}
            >
              Sign In
            </Nav.Link>
            <Nav.Link
              className="fw-semibold text-dark"
              style={{ cursor: "pointer" }}
              onClick={handleSignUp}
            >
              Sign Up
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
