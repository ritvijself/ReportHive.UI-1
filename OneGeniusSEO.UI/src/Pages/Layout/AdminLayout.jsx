import React from "react";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminNavbar from "../NavbarPage/AdminNavbar";

function AdminLayout({ children, pageTitle }) {
  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", fontFamily: " UniformBold, sans-serif" }}
    >
      <div className="flex-grow-1 " style={{ minHeight: "92%" }}>
        <AdminNavbar pageTitle={pageTitle} />
        <div className="" style={{ height: "92%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
