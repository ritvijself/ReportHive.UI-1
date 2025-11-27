import { Modal, Button, Form, Spinner } from "react-bootstrap";
import styles from "../CreateClientModal/CreateClientModal.module.css";
import { useState, useEffect } from "react";

function EditClientModal({
  show,
  onHide,
  isLoading,
  onUpdate,
  setError,
  client,
}) {
  const DEFAULT_LOGO = "https://i.postimg.cc/gJ0FrgK1/agency-icon-16.png"; // Default logo for UI display only

  const [clientData, setClientData] = useState({
    clientName: "",
    webSiteAddress: "",
    color: "#009485",
    reportType: "SEO",
    logo: null,
    logoPreview: DEFAULT_LOGO, // Initialize with default logo for UI
  });

  const [urlError, setUrlError] = useState(null);
  const [colorError, setColorError] = useState(null);
  const [logoError, setLogoError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [reportTypeError, setReportTypeError] = useState(null);

  useEffect(() => {
    if (show && client) {
      const logoPath = client.clientLogo;
      const logoPreview = logoPath
        ? logoPath.startsWith("http")
          ? logoPath
          : `${import.meta.env.VITE_API_BASE_URL}${logoPath}`
        : DEFAULT_LOGO; // Use default logo for display if no logoPath

      setClientData({
        clientSeq: client.clientSeq,
        clientExcelPath: client.clientExcelPath || "",
        clientName: client.clientName || "",
        webSiteAddress: client.webSiteAddress || "",
        color: client.clientColor || "#009485",
        reportType: client.reportType || "SEO",
        logo: null,
        logoPreview,
      });

      setUrlError(null);
      setColorError(null);
      setLogoError(null);
      setNameError(null);
      setReportTypeError(null);
      setError(null);
    }
  }, [show, client, setError]);

  const validateUrl = (url) => {
    if (!url) return false;
    const pattern = /^https?:\/\/([^\s/$.?#]+\.)+[^\s/$.?#]{2,}(\/[^\s]*)?$/i;
    return pattern.test(url);
  };

  const validateHexColor = (color) => /^#[0-9A-Fa-f]{6}$/i.test(color);

  const validateName = (name) => /^[A-Za-z0-9\s\-]+$/.test(name.trim());

  const validateReportType = (type) =>
    ["SEO", "PPC", "SEO and PPC"].includes(type);

  const validateLogo = (file) => {
    if (!file) return true;
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type))
      return "Only PNG, JPEG, or JPG files are allowed";
    if (file.size > maxSize) return "File size must be less than 5MB";
    return true;
  };

  const handleInputChange = (field, value) => {
    setClientData((prev) => ({ ...prev, [field]: value }));

    if (field === "clientName") {
      if (!value.trim()) setNameError("Client name is required");
      else if (!validateName(value))
        setNameError("Only letters, numbers, spaces, and hyphens allowed");
      else setNameError(null);
    }

    if (field === "webSiteAddress") {
      setUrlError(
        validateUrl(value)
          ? null
          : "Please enter a valid URL starting with https:// or http://"
      );
    }

    if (field === "color") {
      setColorError(null);
    }

    if (field === "reportType") {
      setReportTypeError(
        validateReportType(value) ? null : "Please select a valid report type"
      );
    }

    setError(null);
  };

  const validateColorOnBlur = (color) => {
    if (color && !validateHexColor(color)) {
      setColorError("Please enter a valid hex color code (e.g., #009485)");
    } else {
      setColorError(null);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    const result = validateLogo(file);
    if (result === true) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientData((prev) => ({
          ...prev,
          logo: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      setLogoError(null);
    } else {
      setLogoError(result);
      setClientData((prev) => ({
        ...prev,
        logo: null,
        logoPreview: DEFAULT_LOGO,
      }));
    }
    setError(null);
  };

  const handleSubmit = async () => {
    if (!clientData.clientName.trim()) {
      setNameError("Client name is required");
      return;
    }

    if (!validateName(clientData.clientName)) {
      setNameError("Only letters, numbers, spaces, and hyphens allowed");
      return;
    }

    if (!validateUrl(clientData.webSiteAddress)) {
      setUrlError("Please enter a valid URL starting with https:// or http://");
      return;
    }

    if (!validateHexColor(clientData.color)) {
      setColorError("Please enter a valid hex color code (e.g., #009485)");
      return;
    }

    if (!validateReportType(clientData.reportType)) {
      setReportTypeError("Please select a valid report type");
      return;
    }

    let base64Logo = null; // Default to null for API payload
    try {
      if (clientData.logo) {
        // New logo uploaded by user
        base64Logo = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(clientData.logo);
        });
      } else if (
        clientData.logoPreview &&
        clientData.logoPreview !== DEFAULT_LOGO &&
        client.clientLogo
      ) {
        // Existing logo from client, only if it's not the default and clientLogo exists
        const response = await fetch(clientData.logoPreview);
        if (response.ok) {
          const blob = await response.blob();
          base64Logo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(blob);
          });
        } else {
          setLogoError("Failed to fetch existing logo");
          return;
        }
      }
    } catch (err) {
      setLogoError("Failed to process logo");
      return;
    }

    const updatedClient = {
      clientSeq: client?.clientSeq,
      clientName: clientData.clientName,
      webSiteAddress: clientData.webSiteAddress || "",
      clientColor: clientData.color || "#009485",
      reportType: clientData.reportType || "SEO",
      clientLogo: base64Logo, // Will be null if no logo or default logo
      clientExcelPath: clientData.clientExcelPath || "",
    };

    onUpdate(updatedClient);
  };

  const handleClose = () => {
    onHide();
    setClientData({
      clientName: "",
      webSiteAddress: "",
      color: "#009485",
      reportType: "SEO",
      logo: null,
      logoPreview: DEFAULT_LOGO, // Reset to default logo for UI
    });
    setNameError(null);
    setUrlError(null);
    setColorError(null);
    setLogoError(null);
    setReportTypeError(null);
    setError(null);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className={styles.modal}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>Edit Client</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${styles.modalBody} p-4`}>
        <Form noValidate>
          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>
              Client Name <span className={styles.requiredIndicator}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a company name"
              value={clientData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              isInvalid={!!nameError}
              disabled={isLoading}
            />
            <Form.Control.Feedback type="invalid">
              {nameError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>
              Website Address{" "}
              <span className={styles.requiredIndicator}>*</span>
            </Form.Label>
            <Form.Control
              type="url"
              placeholder="https://your-client.com"
              value={clientData.webSiteAddress}
              onChange={(e) =>
                handleInputChange("webSiteAddress", e.target.value)
              }
              isInvalid={!!urlError}
              disabled={isLoading}
            />
            <Form.Control.Feedback type="invalid">
              {urlError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>
              Report Type <span className={styles.requiredIndicator}>*</span>
            </Form.Label>
            <Form.Select
              value={clientData.reportType}
              onChange={(e) => handleInputChange("reportType", e.target.value)}
              isInvalid={!!reportTypeError}
              disabled={isLoading}
            >
              <option value="SEO">SEO</option>
              <option value="PPC">PPC</option>
              <option value="SEO and PPC">SEO and PPC</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {reportTypeError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>Client Color</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="#009485"
                value={clientData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                onBlur={(e) => validateColorOnBlur(e.target.value)}
                isInvalid={!!colorError}
                disabled={isLoading}
              />
              <Form.Control
                type="color"
                value={clientData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                disabled={isLoading}
                style={{ width: "3rem" }}
              />
            </div>
            <Form.Control.Feedback type="invalid">
              {colorError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>Client Logo</Form.Label>
            <div className="d-flex align-items-center gap-3 mb-2">
              <img
                src={clientData.logoPreview}
                alt="Logo Preview"
                className="rounded"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
              <Form.Control
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoChange}
                isInvalid={!!logoError}
                disabled={isLoading}
              />
            </div>
            <Form.Control.Feedback type="invalid">
              {logoError}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-start">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "Update Client"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditClientModal;
