import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import style from "./Navbar.module.css";
import { getUserRoleFromToken } from "../../utils/Auth";

function NavbarLayout({ pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const username = localStorage.getItem("username") || "User";
  let companyName = localStorage.getItem("companyName");

  if (
    !companyName ||
    companyName.trim() === "" ||
    companyName.trim().toLowerCase() === "null"
  ) {
    companyName = username;
  }

  const [displayUsername, setDisplayUsername] = useState("");
  const [role, setRole] = useState("");

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const showClientDropdown = ["/dashboard", "/integrations"].includes(
    location.pathname
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!token) throw new Error("No authentication token found");

        let apiUrl = `${apibaseurl}/api/AgencyClient/list`;

        if (role === "TeamMember") {
          if (location.pathname === "/dashboard") {
            apiUrl = `${apibaseurl}/api/TeamMemberUser/active-Dashbord`;
          } else if (location.pathname === "/integrations") {
            apiUrl = `${apibaseurl}/api/TeamMemberUser/active-Integration`;
          }
        }

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch clients");
        }

        const result = await response.json();

        if (result.isSuccess && Array.isArray(result.data)) {
          setClients(result.data);

          if (location.pathname === "/clientdashboard") {
            setSelectedClient(null);
          } else if (showClientDropdown) {
            const clientSeqFromState = location.state?.clientSeq;
            const clientSeqFromStorage =
              localStorage.getItem("selectedClientSeq");

            let initialClient =
              result.data.find(
                (client) =>
                  client.clientSeq === clientSeqFromState ||
                  client.clientSeq === clientSeqFromStorage
              ) || null;

            if (!initialClient && result.data.length > 0) {
              initialClient = result.data[0];
              handleClientSelect(initialClient);
            }

            setSelectedClient(initialClient);
          }
        } else {
          setSelectedClient(null);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setSelectedClient(null);
      }
    };

    if (showClientDropdown) {
      fetchClients();
    }
  }, [
    apibaseurl,
    token,
    role,
    location.pathname,
    location.state,
    showClientDropdown,
  ]);

  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);

      if (userRole === "TeamMember") {
        fetch(`${apibaseurl}/api/TeamMemberUser/TeamMember-DAUserId`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.isSuccess && data.daUserId) {
              setDisplayUsername(data.daUserId);
            } else {
              setDisplayUsername("Team Member");
            }
          })
          .catch((err) => {
            console.error("Failed to fetch team member name", err);
            setDisplayUsername("Team Member");
          });
      } else {
        const storedUsername = localStorage.getItem("username") || "User";
        setDisplayUsername(storedUsername);
      }
    }
  }, [apibaseurl]);

  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    try {
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${apibaseurl}/api/AgencyClient/client-Id?request=${client.clientSeq}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch client data");

      const result = await response.json();

      if (result.token) localStorage.setItem("token", result.token);
      localStorage.setItem("selectedClientSeq", client.clientSeq);

      const targetRoute =
        location.pathname === "/integrations" ? "/integrations" : "/dashboard";

      navigate(targetRoute, {
        state: { clientSeq: client.clientSeq, message: result.message },
      });
    } catch (err) {
      console.error("Error navigating to client page:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("daToken");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("companyName");
    localStorage.removeItem("selectedClientSeq");
    navigate("/");
  };

  return (
    <>
      {/* TOP BAR */}
      <Navbar
        expand="lg"
        className={`${style.navbarTop} border-bottom`}
        style={{
          backgroundColor: "gray",
          zIndex: 1,
        }}
      >
        <Container
          fluid
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <img
              src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
              alt="1GeniusSEO Logo"
              style={{ width: 40, height: 40 }}
              className="me-2"
            />
            <span className="fw-bold text-white">1GeniusSEO</span>
          </div>

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
              <Dropdown.Item onClick={handleLogout} className={style.logout}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Navbar>

      {/* BOTTOM BAR - Company name and Client dropdown (LEFT SIDE) */}
      <div className="w-100">
        <div
          className="py-2"
          style={{
            backgroundColor: "#6b6b6b",
          }}
        >
          <Container
            fluid
            className="d-flex justify-content-start align-items-center"
          >
            <span className="fw-bold text-white me-4">{companyName}</span>

            {showClientDropdown && (
              <div
                className="d-flex align-items-center"
                style={{ paddingLeft: "60px" }}
              >
                <span className="text-white me-2 fw-semibold">Client:</span>
                <Dropdown align="start">
                  <Dropdown.Toggle
                    variant="link"
                    className="text-white text-decoration-none"
                    id="dropdown-client"
                    style={{ border: "1px solid #5a5151" }}
                  >
                    {selectedClient
                      ? selectedClient.clientName
                      : "Select Client"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <Dropdown.Item
                          key={client.clientSeq}
                          onClick={() => handleClientSelect(client)}
                        >
                          {client.clientName}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>
                        No clients available
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </Container>
        </div>
      </div>
    </>
  );
}

export default NavbarLayout;
