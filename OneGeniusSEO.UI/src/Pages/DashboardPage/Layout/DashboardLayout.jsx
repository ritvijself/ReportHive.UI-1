import React from "react";
import "../../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SideBar from "../../SideBarPage/SideBar";

import style from "./DashboardLayout.module.css";
import NavbarLayout from "../../NavbarPage/Navbar";

function DashboardLayout({ children, pageTitle }) {
  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", fontFamily: " UniformBold, sans-serif" }}
    >
      <SideBar />

      <div className="flex-grow-1 " style={{ minHeight: "92%" }}>
        <NavbarLayout pageTitle={pageTitle} />
        <div className="" style={{ height: "92%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
