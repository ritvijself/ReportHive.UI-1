import React from "react";
import "../../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SideBar from "../../SideBarPage/SideBar";

import style from "./HomePageLayout.module.css";

import HomeNavbar from "../../NavbarPage/HomeNavbar/HomeNavbar";

function HomePageLayout({ children, pageTitle }) {
  return (
    <div className="d-flex">
      <div className="flex-grow-1 ">
        <HomeNavbar pageTitle={pageTitle} />
        <div className="">{children}</div>
      </div>
    </div>
  );
}

export default HomePageLayout;
