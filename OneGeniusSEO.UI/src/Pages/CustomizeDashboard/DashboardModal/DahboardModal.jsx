import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DashboardModals = ({
  showSuccessModal,
  successMessage,
  handleCloseSuccessModal,
  showErrorModal,
  errorMessage,
  handleCloseErrorModal,
  showExcelUploadModal,
  handleExcelModalClose,
  handleFileChange,
  excelUploadMessage,
  isUploadSuccessful,
  reportMessage,
  reportMessageSuccess,
  setExcelUploadMessage,
  setIsUploadSuccessful,
  setReportMessage,
  setReportMessageSuccess,
  setErrorMessage,
  setShowErrorModal,
  apibaseurl,
  token,
  selectedFile,
}) => {
  const [uploadedFileName, setUploadedFileName] = useState(null);

 
  useEffect(() => {
    if (showExcelUploadModal && token) {
      const fetchUploadedFileName = async () => {
        try {
          const response = await fetch(
            `${apibaseurl}/api/FetchExcelKeyword/UploadFile-Name`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();
          if (result.isSuccess && result.excelFileName) {
            setUploadedFileName(result.excelFileName);
            setIsUploadSuccessful(true); 
          } else {
            setUploadedFileName(null); 
          }
        } catch (err) {
          setErrorMessage("Error fetching uploaded file name");
          setShowErrorModal(true);
        }
      };

      fetchUploadedFileName();
    }
  }, [
    showExcelUploadModal,
    token,
    apibaseurl,
    setErrorMessage,
    setShowErrorModal,
    setIsUploadSuccessful,
  ]);

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

      const result = await response.json();
      setExcelUploadMessage("Excel file uploaded successfully!");
      setIsUploadSuccessful(true);
      setUploadedFileName(selectedFile.name);
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
    <>
      {/* Success Modal */}
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

      {/* Error Modal */}
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
            {!uploadedFileName && (
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Select Excel File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                />
              </Form.Group>
            )}
          </Form>

          {uploadedFileName && (
            <p className="text-info mt-2">
              Current uploaded file: {uploadedFileName}
            </p>
          )}

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
          {!uploadedFileName && (
            <Button
              variant="primary"
              onClick={handleExcelUpload}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          )}
          <Button
            variant="outline-success"
            onClick={handleGenerateCustomizedReport}
            disabled={!isUploadSuccessful}
          >
            Generate Customized Report
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardModals;
