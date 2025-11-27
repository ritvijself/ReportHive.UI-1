import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import { FaTrash, FaSearch, FaEdit } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import styles from "./ClientDashboard.module.css";
import CreateClientModal from "./ClientModals/CreateClientModal/CreateClientModal";
import DeleteClientModal from "./ClientModals/DeleteClientModal/DeleteClientModal";
import EditClientModal from "./ClientModals/EditClientModal/EditClientModal";
import { getUserRoleFromToken } from "../../utils/Auth";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [role, setRole] = useState("");

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const currentToken =
      localStorage.getItem("daToken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);
  const clearAlerts = useCallback(() => {
    const timeout = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const getClientLogoUrl = useCallback(
    (logoPath) =>
      logoPath
        ? logoPath.startsWith("http")
          ? logoPath
          : `${apibaseurl}${logoPath}`
        : "https://i.postimg.cc/gJ0FrgK1/agency-icon-16.png",
    [apibaseurl]
  );

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${apibaseurl}/api/AgencyClient/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch clients");
      }

      const { isSuccess, data } = await response.json();
      if (!isSuccess || !Array.isArray(data)) {
        throw new Error("Unexpected API response format for client list");
      }

      setProjects(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(err.message || "Failed to fetch clients");
      clearAlerts();
    } finally {
      setIsLoading(false);
    }
  }, [apibaseurl, clearAlerts]);

  const handleApiRequest = useCallback(
    async (url, method, body = null, isFileUpload = false) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const headers = isFileUpload
          ? { Authorization: `Bearer ${token}` }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            };

        const response = await fetch(url, {
          method,
          headers,
          body: isFileUpload ? body : JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed request to ${url}`);
        }

        return await response.json();
      } catch (err) {
        setError(err.message || "An error occurred");
        clearAlerts();
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearAlerts]
  );

  const handleCreateProject = useCallback(
    async (clients) => {
      const nameErrors = {};

      // Check for duplicate client names only
      clients.forEach((client) => {
        if (!client.clientName.trim()) {
          nameErrors[client.id] = "Client name is required";
        } else if (
          projects.some(
            (p) =>
              p.clientName.toLowerCase() === client.clientName.toLowerCase()
          )
        ) {
          nameErrors[
            client.id
          ] = `Client name "${client.clientName}" already exists`;
        }
      });

      if (Object.keys(nameErrors).length > 0) {
        return { errors: { nameErrors, urlErrors: {} } };
      }

      const projectData = clients.map((client) => ({
        clientName: client.clientName,
        webSiteAddress: client.webSiteAddress || "",
        clientLogo: client.clientLogo || "",
        clientExcelPath: client.clientExcelPath || "",
        clientColor: client.color || "#009485",
        reportType: client.reportType || "SEO",
        isActive: true,
        createdDate: new Date().toISOString(),
      }));

      try {
        const { isSuccess, message } = await handleApiRequest(
          `${apibaseurl}/api/AgencyClient/create`,
          "POST",
          projectData
        );

        if (!isSuccess) throw new Error(message || "Client creation failed");

        await fetchClients();
        setShowCreateModal(false);
        setSuccess(
          `Successfully created ${clients.length} client${
            clients.length > 1 ? "s" : ""
          }!`
        );
        clearAlerts();
      } catch (err) {
        console.error("Error creating clients:", err);
        setError(err.message || "Failed to create clients");
        clearAlerts();
        return { errors: {} };
      }
    },
    [apibaseurl, clearAlerts, fetchClients, projects]
  );

  const handleDeleteProject = useCallback(
    async (project) => {
      if (!project?.clientSeq) return;

      try {
        await handleApiRequest(
          `${apibaseurl}/api/AgencyClient/delete`,
          "POST",
          [project.clientSeq]
        );

        setProjects((prev) =>
          prev.filter((p) => p.clientSeq !== project.clientSeq)
        );
        setSuccess("Client deleted successfully!");
        clearAlerts();
      } catch (err) {
        console.error("Error deleting client:", err);
      } finally {
        setShowDeleteModal(false);
        setProjectToDelete(null);
      }
    },
    [apibaseurl, clearAlerts, handleApiRequest]
  );

  // const handleBulkDelete = useCallback(async () => {
  //   if (selectedProjects.length === 0) return;

  //   try {
  //     await handleApiRequest(
  //       `${apibaseurl}/api/AgencyClient/delete`,
  //       "POST",
  //       selectedProjects
  //     );

  //     setProjects((prev) =>
  //       prev.filter((p) => !selectedProjects.includes(p.clientSeq))
  //     );
  //     setSuccess(`Successfully deleted ${selectedProjects.length} project(s)!`);
  //     setSelectedProjects([]);
  //     clearAlerts();
  //   } catch (err) {
  //     console.error("Error deleting projects:", err);
  //   }
  // }, [apibaseurl, clearAlerts, handleApiRequest, selectedProjects]);

  const handleNavigation = useCallback(
    async (clientSeq, destination, forceDestination = false) => {
      if (!clientSeq) {
        setError("Client ID is missing. Please try again.");
        clearAlerts();
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        localStorage.setItem("daToken", token);

        const { token: newToken, message } = await handleApiRequest(
          `${apibaseurl}/api/AgencyClient/client-Id?request=${clientSeq}`,
          "POST"
        );

        if (newToken) {
          localStorage.setItem("token", newToken);
        }

        localStorage.setItem("selectedClientSeq", clientSeq);

        const targetRoute = forceDestination
          ? destination
          : message === "integration"
          ? "/integrations"
          : "/dashboard";

        navigate(targetRoute, {
          state: { clientSeq, message },
        });
      } catch (err) {
        console.error(`Error navigating to ${destination}:`, err);
      }
    },
    [apibaseurl, clearAlerts, navigate, handleApiRequest]
  );

  const handleUpdateClient = useCallback(
    async (updatedClient) => {
      let logoPath = updatedClient.clientLogo;

      const payload = {
        clientExcelPath: updatedClient.clientExcelPath || "",
        clientName: updatedClient.clientName,
        webSiteAddress: updatedClient.webSiteAddress || "",
        clientColor: updatedClient.clientColor || "#009485",
        reportType: updatedClient.reportType || "SEO",
        ClientLogo: logoPath || null,
      };

      try {
        await handleApiRequest(
          `${apibaseurl}/api/AgencyClient/edit?clientId=${updatedClient.clientSeq}`,
          "PUT",
          payload
        );

        setSuccess("Client updated successfully");
        clearAlerts();
        await fetchClients();
        setShowEditModal(false);
      } catch (err) {
        console.error("Error updating client:", err);
      }
    },
    [apibaseurl, clearAlerts, fetchClients, handleApiRequest]
  );

  // const handleCheckboxChange = useCallback((projectId, isChecked) => {
  //   setSelectedProjects((prev) =>
  //     isChecked ? [...prev, projectId] : prev.filter((id) => id !== projectId)
  //   );
  // }, []);

  useEffect(() => {
    localStorage.removeItem("selectedClientSeq");
    fetchClients();
  }, [fetchClients]);

  const filteredProjects = projects.filter((project) =>
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container fluid className="p-0 min-vh-100 bg-light">
      <header className={`${styles.header} bg-white py-2`}>
        <Container
          fluid
          className="d-flex justify-content-end align-items-center px-4"
        >
          {/* <div className="d-flex align-items-center fw-bold">Home</div> */}
          <div className="d-flex align-items-center gap-2">
            <InputGroup size="sm" style={{ maxWidth: "200px" }}>
              <InputGroup.Text className="bg-white border-end-0 pe-1">
                <FaSearch className="text-muted" size={14} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
            {role !== "TeamMember" && (
              <Button
                variant=""
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className={`d-flex align-items-center ${styles.addButton}`}
              >
                Add Client
              </Button>
            )}
          </div>
        </Container>
      </header>

      <Container fluid className="py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            />
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show">
            {success}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess(null)}
            />
          </div>
        )}
        {isLoading ? (
          <Row className="justify-content-center my-5">
            <Col xs="auto">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" />
                <div className="mt-2">Loading Clients...</div>
              </div>
            </Col>
          </Row>
        ) : projects.length === 0 ? (
          // 🔹 Show welcome only if there are no clients at all
          <Row className="" style={{ paddingLeft: "25px" }}>
            <Col xs={12} md={10} lg={8} className="text-muted">
              <h4 className="fw-bold text-dark">Welcome to 1Genious SEO!</h4>
              <p>
                We’re excited to have you on board! Getting started is simple —
                just set up your first client (you can add as many clients as
                you like). Each client will have their own dedicated dashboard
                where you can generate SEO/PPC reports, explore analytics, and
                keep everything organized.
              </p>
              <p>
                You’ll also be able to add team members with different roles to
                match your organization’s needs. Once your client is created,
                connecting integrations is quick and easy, so you can start
                visualizing your data right away.
              </p>
              <p>
                We’re also working on a built-in project management tool to help
                you execute SEO/PPC tasks more smoothly, and adding AI features
                to give you that extra boost. Exciting updates are on the way!
                🎉
              </p>
              <h5 className="mt-4 fw-semibold">Here’s how to get started:</h5>
              <ul
                className="text-start"
                style={{ listStyleType: "disc", paddingLeft: "20px" }}
              >
                <li>
                  Create a{" "}
                  {role !== "TeamMember" ? (
                    <a
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        cursor: "pointer",
                        color: "black",
                        textDecoration: "underline",
                      }}
                    >
                      new client (or multiple clients)
                    </a>
                  ) : (
                    <span style={{ cursor: "default" }}>
                      new client (or multiple clients)
                    </span>
                  )}{" "}
                  .
                </li>
                <li>Access a dedicated dashboard for each client.</li>
                <li>
                  Connect integrations (fast and simple!) to visualize your
                  data.
                </li>
                <li>Generate SEO/PPC reports and dive into analytics.</li>
                <li>Add team members with roles that fit your organization.</li>
              </ul>
            </Col>
          </Row>
        ) : filteredProjects.length === 0 ? (
          // 🔹 No results from search
          <Row className="justify-content-center my-5">
            <Col xs="auto" className="text-muted">
              <h5>No clients found matching your search.</h5>
            </Col>
          </Row>
        ) : (
          <div className={styles.tableWrapper}>
            {/* {selectedProjects.length > 0 && (
              <div className="p-2 d-flex align-items-center">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="me-2 d-flex align-items-center"
                >
                  <FaTrash className="me-1" /> Remove
                </Button>
                <span className={styles.selectedClientNote}>
                  {selectedProjects.length} selected
                </span>
              </div>
            )} */}
            <Table hover responsive bordered className="mb-0">
              <thead>
                <tr>
                  <th>Number of Clients</th>
                  {role !== "TeamMember" && <th>Dashboards</th>}
                  {role !== "TeamMember" && <th>Integrations</th>}
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.clientSeq}>
                    <td>
                      <div className="d-flex align-items-center">
                        {/* <Form.Check
                          type="checkbox"
                          checked={selectedProjects.includes(project.clientSeq)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              project.clientSeq,
                              e.target.checked
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="me-3"
                        /> */}
                        <img
                          src={getClientLogoUrl(project.clientLogo)}
                          alt="client logo"
                          className="me-3"
                          style={{ width: "40px", height: "40px" }}
                        />
                        {role !== "TeamMember" ? (
                          <div
                            role="button"
                            onClick={() => {
                              setClientToEdit(project);
                              setShowEditModal(true);
                            }}
                          >
                            <strong className={styles.clientName}>
                              {project.clientName}
                            </strong>
                            <br />
                            <small className={styles.clientAddress}>
                              {project.webSiteAddress}
                            </small>
                          </div>
                        ) : (
                          <div>
                            <strong
                              className={styles.clientName}
                              style={{
                                cursor: "default",
                                textDecoration: "none",
                              }}
                            >
                              {project.clientName}
                            </strong>
                            <br />
                            <small className={styles.clientAddress}>
                              {project.webSiteAddress}
                            </small>
                          </div>
                        )}
                      </div>
                    </td>
                    {role !== "TeamMember" && (
                      <td>
                        <Button
                          className={styles.viewDashboardButton}
                          variant=""
                          size="sm"
                          onClick={() =>
                            handleNavigation(
                              project.clientSeq,
                              "/dashboard",
                              true
                            )
                          }
                        >
                          View Dashboard
                        </Button>
                      </td>
                    )}

                    {role !== "TeamMember" && (
                      <td>
                        <Button
                          className={styles.viewDashboardButton}
                          variant=""
                          size="sm"
                          onClick={() =>
                            handleNavigation(
                              project.clientSeq,
                              "/integrations",
                              true
                            )
                          }
                        >
                          View Integrations
                        </Button>
                      </td>
                    )}
                    <td>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={styles.dateCreated}>
                          {new Date(project.createdDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {role !== "TeamMember" && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              as={({ children, ...props }) => (
                                <button
                                  {...props}
                                  className="btn btn-link p-0 d-flex align-items-center justify-content-center"
                                  style={{
                                    background: "#f2f3f5",
                                    borderRadius: "50%",
                                    width: 24,
                                    height: 24,
                                  }}
                                >
                                  {children}
                                </button>
                              )}
                            >
                              <BsThreeDots size={16} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                className={styles.dropdownItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectToDelete(project);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FaTrash className="me-2 text-danger" />
                                Remove
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total clients: {filteredProjects.length}</td>
                  {role !== "TeamMember" && <td></td>}
                  {role !== "TeamMember" && <td></td>}
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}
        <CreateClientModal
          show={showCreateModal}
          onHide={() => {
            setShowCreateModal(false);
            setError(null);
            setSuccess(null);
          }}
          onCreate={handleCreateProject}
          isLoading={isLoading}
        />
        <DeleteClientModal
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setError(null);
            setSuccess(null);
          }}
          projectToDelete={projectToDelete}
          onDelete={handleDeleteProject}
        />
        <EditClientModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setError(null);
            setSuccess(null);
          }}
          onUpdate={handleUpdateClient}
          isLoading={isLoading}
          error={error}
          setError={setError}
          client={clientToEdit}
        />
      </Container>
    </Container>
  );
};

ClientDashboard.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      clientSeq: PropTypes.number.isRequired,
      clientName: PropTypes.string.isRequired,
      webSiteAddress: PropTypes.string,
      clientLogo: PropTypes.string,
      clientExcelPath: PropTypes.string,
      clientColor: PropTypes.string,
      reportType: PropTypes.oneOf(["SEO", "PPC", "SEO and PPC"]),
      createdDate: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
    })
  ),
};

export default ClientDashboard;
