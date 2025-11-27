import React, { useState, useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import { FaHome, FaFileAlt, FaPlug, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiFillCalendar } from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi2";
import style from "./SideBar.module.css";
import { getUserRoleFromToken } from "../../utils/Auth";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [role, setRole] = useState("");
  const [hasActiveDashboard, setHasActiveDashboard] = useState(false);
  const [hasActiveIntegrations, setHasActiveIntegrations] = useState(false);
  const navigate = useNavigate();

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    const fetchTeamMemberData = async () => {
      if (role !== "TeamMember" || !token) return;

      try {
        // Fetch active dashboards
        const dashboardResponse = await fetch(
          `${apibaseurl}/api/TeamMemberUser/active-Dashbord`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch active dashboards");
        }

        const dashboardResult = await dashboardResponse.json();
        setHasActiveDashboard(
          dashboardResult.isSuccess &&
            Array.isArray(dashboardResult.data) &&
            dashboardResult.data.length > 0
        );

        // Fetch active integrations
        const integrationResponse = await fetch(
          `${apibaseurl}/api/TeamMemberUser/active-Integration`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!integrationResponse.ok) {
          throw new Error("Failed to fetch active integrations");
        }

        const integrationResult = await integrationResponse.json();
        setHasActiveIntegrations(
          integrationResult.isSuccess &&
            Array.isArray(integrationResult.data) &&
            integrationResult.data.length > 0
        );
      } catch (err) {
        console.error("Error fetching team member data:", err);
        setHasActiveDashboard(false);
        setHasActiveIntegrations(false);
      }
    };

    if (role === "TeamMember") {
      fetchTeamMemberData();
    }
  }, [role, apibaseurl, token]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    if (path === "/dashboard" || path === "/integrations") {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.setItem("daToken", token);
      }
    }

    if (path === "/clientdashboard") {
      localStorage.removeItem("selectedClientSeq");

      const daToken = localStorage.getItem("daToken");
      if (daToken) {
        localStorage.setItem("token", daToken);
      } else {
        console.warn("No Da token found in localStorage");
      }
    }

    if (path) {
      navigate(path);
    }
  };

  const menuItems = [
    { icon: <FaHome />, label: "Home", path: "/clientdashboard" },
    {
      icon: <FaFileAlt />,
      label: "Dashboard",
      path: "/dashboard",
      hiddenForTeamMember: !hasActiveDashboard, // Hide if no active dashboards
    },
    {
      icon: <FaPlug />,
      label: "Integrations",
      path: "/integrations",
      hiddenForTeamMember: !hasActiveIntegrations, // Hide if no active integrations
    },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
    { icon: <AiFillCalendar />, label: "PM Tool", path: "/pmtool" },
    {
      icon: <HiUserGroup />,
      label: "Team Members",
      path: "/teammembers",
      hiddenFor: ["TeamMember"], // Hide for TeamMember role
    },
  ];

  // Filter out items based on role and active dashboard/integration status
  const filteredMenu = menuItems.filter((item) => {
    if (item.hiddenFor && item.hiddenFor.includes(role)) {
      return false; // Hide items explicitly marked for the role
    }
    if (role === "TeamMember" && item.hiddenForTeamMember) {
      return false; // Hide items for TeamMember if no active data
    }
    return true;
  });

  return (
    <div
      className={`${
        isOpen ? style.sidebar : style.sidebarClosed
      } d-flex flex-column text-white`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-grow-1 d-flex flex-column">
        <ListGroup variant="flush" className="mb-4">
          {filteredMenu.map((item, index) => (
            <ListGroup.Item
              key={index}
              action
              className={`${style.sidebarItem} text-white border-0 d-flex align-items-center`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className={`${style.fixedIcon} me-2`}>{item.icon}</span>
              <span
                className={`${style.sidebarLabel} ${
                  isOpen ? "d-inline" : "d-none"
                }`}
              >
                {item.label}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default Sidebar;
