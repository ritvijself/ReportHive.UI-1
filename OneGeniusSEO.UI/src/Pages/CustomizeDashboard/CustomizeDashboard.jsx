import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Accordion,
  Modal,
  Form,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import useDashboardCustomization from "./UseDashboardCustomization";
import ChartConfigurationTable from "./ChartConfigurationTable";
import styles from "./CustomizeDashboard.module.css";

const CustomizeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state || {};
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelUploadMessage, setExcelUploadMessage] = useState("");
  const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportMessageSuccess, setReportMessageSuccess] = useState(false);

  const {
    integrationOptions,
    chartConfigurations,
    errorMessage: hookErrorMessage,
    integrationChartMap,
    handleChartToggle,
    handleShowComparisonToggle,
    handleSelectAllCharts,
    handleSelectAllShowComparison,
    prepareSaveData,
    handleTableTypeToggle,
    handleChartTypeToggle,
    setErrorMessage: setHookErrorMessage,
  } = useDashboardCustomization(apibaseurl, token);

  useEffect(() => {
    if (hookErrorMessage) {
      setErrorMessage(hookErrorMessage);
      setShowErrorModal(true);
    }
  }, [hookErrorMessage]);

  const handleSave = async () => {
    if (!token) {
      setErrorMessage("Authentication token missing");
      setShowErrorModal(true);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setShowErrorModal(false);
    setShowSuccessModal(false);

    const {
      gmbApiStatuses,
      gmbMonthApiStatuses,
      gscApiStatuses,
      ga4ApiStatuses,
      gscMonthApiStatuses,
      ga4MonthApiStatuses,
      googleAdsApiStatuses,
      googleAdsMonthApiStatuses,
      youtubeApiStatuses,
      youtubeMonthApiStatuses,
      gAdsenseApiStatuses,
      gAdsenseMonthApiStatuses,
      linkedinApiStatuses,
      linkedinMonthApiStatuses,
      shopifyApiStatuses,
      shopifyMonthApiStatuses,
    } = prepareSaveData();

    try {
      const requests = [];

      if (gmbApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GMBCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gmbApiStatuses),
          })
        );
      }

      if (gmbMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GMBCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gmbMonthApiStatuses),
          })
        );
      }

      if (gscApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GSCCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gscApiStatuses),
          })
        );
      }

      if (ga4ApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GA4CustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ga4ApiStatuses),
          })
        );
      }

      if (ga4MonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GA4CustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ga4MonthApiStatuses),
          })
        );
      }

      if (gscMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GSCCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gscMonthApiStatuses),
          })
        );
      }

      if (googleAdsApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GAdsCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(googleAdsApiStatuses),
          })
        );
      }

      if (googleAdsMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GAdsCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(googleAdsMonthApiStatuses),
          })
        );
      }
      if (youtubeApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/YoutubeCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(youtubeApiStatuses),
          })
        );
      }

      if (youtubeMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/YoutubeCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(youtubeMonthApiStatuses),
          })
        );
      }
      if (gAdsenseApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GAdsenseCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gAdsenseApiStatuses),
          })
        );
      }

      if (gAdsenseMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/GAdsenseCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gAdsenseMonthApiStatuses),
          })
        );
      }

      if (linkedinApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/LinkedinCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(linkedinApiStatuses),
          })
        );
      }

      if (linkedinMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/LinkedinCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(linkedinMonthApiStatuses),
          })
        );
      }

      if (shopifyApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/ShopifyCustomizeHideApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(shopifyApiStatuses),
          })
        );
      }

      if (shopifyMonthApiStatuses.length > 0) {
        requests.push(
          fetch(`${apibaseurl}/api/ShopifyCustomizeMonthApiList/update`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(shopifyMonthApiStatuses),
          })
        );
      }

      const responses = await Promise.all(requests);
      const allSuccessful = responses.every((response) => response.ok);

      if (!allSuccessful) {
        setErrorMessage("Failed to update some API statuses");
        setShowErrorModal(true);
        return;
      }

      setSuccessMessage("Dashboard configuration saved successfully!");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setErrorMessage("Error updating API statuses");
      setShowErrorModal(true);
    }
  };

  const handleAddIntegrations = () => {
    navigate("/integrations");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
    setHookErrorMessage("");
  };

  const handleExcelModalOpen = () => {
    setShowExcelUploadModal(true);
    setSelectedFile(null);
    setExcelUploadMessage("");
    setIsUploadSuccessful(false);
    setReportMessage("");
    setReportMessageSuccess(false);
  };

  const handleExcelModalClose = () => {
    setShowExcelUploadModal(false);
    setSelectedFile(null);
    setExcelUploadMessage("");
    setIsUploadSuccessful(false);
    setReportMessage("");
    setReportMessageSuccess(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      setSelectedFile(file);
      setExcelUploadMessage("");
    } else {
      setSelectedFile(null);
      setExcelUploadMessage("Please select a valid Excel file (.xls or .xlsx)");
    }
  };

  const handleExcelUpload = async () => {
    if (!selectedFile) {
      setExcelUploadMessage("Please select an Excel file to upload");
      return;
    }

    if (!token) {
      setErrorMessage("Authentication token missing");
      setShowErrorModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${apibaseurl}/api/FetchExcelKeyword/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload Excel file");
      }

      setExcelUploadMessage("Excel file uploaded successfully!");
      setIsUploadSuccessful(true);
    } catch (err) {
      setExcelUploadMessage("Error uploading Excel file");
      setShowErrorModal(true);
      setErrorMessage(err.message || "Error uploading Excel file");
    }
  };

  const handleGenerateCustomizedReport = async () => {
    if (!token) {
      setErrorMessage("Authentication token missing");
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(
        `${apibaseurl}/api/FetchExcelKeyword/fetch-keyword`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.isSuccess) {
        setReportMessage("Keywords processed and stored successfully.");
        setReportMessageSuccess(true);
      } else {
        setReportMessage(result.message || "Failed to generate report.");
        setReportMessageSuccess(false);
      }
    } catch (err) {
      setReportMessage("Error generating customized report.");
      setReportMessageSuccess(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <h2>Customize Dashboard</h2>

      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-success">{successMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccessModal}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showErrorModal} onHide={handleCloseErrorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseErrorModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showExcelUploadModal}
        onHide={handleExcelModalClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Excel File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
              />
            </Form.Group>
          </Form>

          {excelUploadMessage && (
            <p
              className={
                excelUploadMessage.includes("successfully")
                  ? "text-success mt-2"
                  : "text-danger mt-2"
              }
            >
              {excelUploadMessage}
            </p>
          )}

          {reportMessage && (
            <p
              className={
                reportMessageSuccess ? "text-success mt-2" : "text-danger mt-2"
              }
            >
              {reportMessage}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleExcelModalClose}>
            Cancel
          </Button>
          <Button
            variant=""
            onClick={handleExcelUpload}
            disabled={!selectedFile}
            className={`flex-grow-1 flex-md-grow-0 ${styles.uploadButton}`}
          >
            Upload
          </Button>
          <Button
            variant="outline-success"
            onClick={handleGenerateCustomizedReport}
            disabled={!isUploadSuccessful}
          >
            Generate Customized Report
          </Button>
        </Modal.Footer>
      </Modal>

      {integrationOptions.length === 0 ? (
        <p>No integrations available to customize.</p>
      ) : (
        <>
          <Accordion defaultActiveKey={null}>
            {integrationOptions.map((integration, index) => {
              const charts = integrationChartMap[integration.value] || [];
              return (
                <Accordion.Item
                  eventKey={index.toString()}
                  key={integration.value}
                >
                  <Accordion.Header>{integration.label}</Accordion.Header>
                  <Accordion.Body>
                    {charts.length === 0 ? (
                      <p>No charts available for this integration.</p>
                    ) : (
                      <ChartConfigurationTable
                        integration={integration}
                        charts={charts}
                        chartConfigurations={chartConfigurations}
                        onChartToggle={handleChartToggle}
                        onShowComparisonToggle={handleShowComparisonToggle}
                        onSelectAllCharts={handleSelectAllCharts}
                        onSelectAllShowComparison={
                          handleSelectAllShowComparison
                        }
                        onTableTypeToggle={handleTableTypeToggle}
                        onChartTypeToggle={handleChartTypeToggle}
                      />
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>

          <Row className="mt-3">
            <Col>
              <Button
                variant=""
                onClick={handleSave}
                className={styles.saveButton}
              >
                Save Configuration
              </Button>
              <Button
                variant=""
                className={`${styles.addIntegrationsButton} ms-2`}
                onClick={handleAddIntegrations}
              >
                Add More Integrations
              </Button>
              <Button
                variant=""
                className={`${styles.addIntegrationsButton} ms-2`}
                onClick={handleExcelModalOpen}
                style={{ display: "none" }}
              >
                Upload Excel For Specific Keyword Ranking
              </Button>
              <Button
                variant=""
                className={`${styles.addIntegrationsButton} ms-2`}
                onClick={() => navigate(-1)}
              >
                Return to Dashboard
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default CustomizeDashboard;
