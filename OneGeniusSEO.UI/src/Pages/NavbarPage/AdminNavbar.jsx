import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaQuestionCircle, FaBell, FaUserCircle } from "react-icons/fa";
import style from "./Navbar.module.css";

function AdminNavbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("daToken");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <Navbar bg="" expand="lg" className={`${style.navbar} border-bottom`}>
      <Container fluid>
        {/* Page Title */}
        <Navbar.Brand
          role="button"
          onClick={() => navigate("/admindashboard")}
          className="d-flex align-items-center text-white text-decoration-none"
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
            alt="1GeniusSEO Logo"
            style={{ width: "10%" }}
            className="me-2"
          />
          <span className="fw-bold">1GeniusSEO</span>
        </Navbar.Brand>

        {/* Right Side Icons */}
        <Nav
          className="ms-auto d-flex align-items-center gap-3"
          style={{ flexDirection: "row" }}
        >
          {/* <Nav.Link href="#" className="text-white">
            <FaQuestionCircle size={20} />
          </Nav.Link>
          <Nav.Link href="#" className="text-white">
            <FaBell size={20} />
          </Nav.Link> */}

          {/* User Dropdown */}
          <Dropdown align="end" style={{ backgroundColor: "gray" }}>
            <Dropdown.Toggle
              variant="link"
              className="d-flex align-items-center text-white text-decoration-none"
              id="dropdown-user"
              style={{ border: "1px solid #5a5151" }}
            >
              <FaUserCircle size={22} className="me-2" />
              <span className="fw-semibold">{username}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Header>Hello, {username}!</Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={handleLogout}
                className={`${style.logout}`}
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AdminNavbar;
