import { Modal, Button, Form, Spinner } from "react-bootstrap";
import styles from "./CreateClientModal.module.css";
import { useState, useEffect } from "react";

function CreateClientModal({ show, onHide, isLoading, onCreate }) {
  const [clients, setClients] = useState([
    {
      id: 1,
      clientName: "",
      webSiteAddress: "",
      clientLogo: null,
      color: "#009485",
      reportType: "SEO", // Default report type
    },
  ]);

  const [urlErrors, setUrlErrors] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [nameErrors, setNameErrors] = useState({});
  const [reportTypeErrors, setReportTypeErrors] = useState({});

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setClients([
      {
        id: 1,
        clientName: "",
        webSiteAddress: "",
        clientLogo: null,
        color: "#009485",
        reportType: "SEO",
      },
    ]);
    setUrlErrors({});
    setColorErrors({});
    setFileErrors({});
    setNameErrors({});
    setReportTypeErrors({});
  };

  const validateUrl = (url) => {
    if (!url) return false;
    const urlPattern =
      /^https?:\/\/([^\s/$.?#]+\.)+[^\s/$.?#]{2,}(\/[^\s]*)?$/i;
    return urlPattern.test(url);
  };

  const validateHexColor = (color) => {
    if (!color) return true;
    return /^#[0-9A-Fa-f]{6}$/i.test(color);
  };

  const validateClientName = (name) => /^[A-Za-z0-9\s-]+$/.test(name.trim());

  const validateReportType = (type) =>
    ["SEO", "PPC", "SEO and PPC"].includes(type);

  const validateFile = (file, id) => {
    if (!file) return false;
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        [id]: "Logo must be a PNG or JPEG image",
      }));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        [id]: "Logo file size must be less than 5MB",
      }));
      return false;
    }
    setFileErrors((prev) => ({ ...prev, [id]: null }));
    return true;
  };

  const updateClient = (id, field, value) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, [field]: value } : client
      )
    );

    if (field === "webSiteAddress") {
      setUrlErrors((prev) => ({
        ...prev,
        [id]: validateUrl(value)
          ? null
          : "Please enter a valid URL starting with https:// or http:// (e.g., https://example.com)",
      }));
    }

    if (field === "color") {
      setColorErrors((prev) => ({ ...prev, [id]: null }));
    }

    if (field === "clientLogo") {
      validateFile(value, id);
    }

    if (field === "clientName") {
      if (!value.trim()) {
        setNameErrors((prev) => ({
          ...prev,
          [id]: "Client name is required",
        }));
      } else if (!validateClientName(value)) {
        setNameErrors((prev) => ({
          ...prev,
          [id]: "Client name must contain only letters, numbers, spaces, or hyphens",
        }));
      } else {
        setNameErrors((prev) => ({ ...prev, [id]: null }));
      }
    }

    if (field === "reportType") {
      setReportTypeErrors((prev) => ({
        ...prev,
        [id]: validateReportType(value) ? null : "Invalid report type",
      }));
    }
  };

  const validateColorOnBlur = (id, color) => {
    setColorErrors((prev) => ({
      ...prev,
      [id]:
        color && !validateHexColor(color)
          ? "Please enter a valid hex color code (e.g., #009485)"
          : null,
    }));
  };

  const addClient = () => {
    setClients([
      ...clients,
      {
        id: clients.length + 1,
        clientName: "",
        webSiteAddress: "",
        clientLogo: null,
        color: "#009485",
        reportType: "SEO",
      },
    ]);
  };

  const removeClient = (id) => {
    setClients(clients.filter((client) => client.id !== id));
    setUrlErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setColorErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setFileErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setNameErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setReportTypeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    let hasValidationError = false;
    const newUrlErrors = {};
    const newFileErrors = {};
    const newNameErrors = {};
    const newColorErrors = {};
    const newReportTypeErrors = {};

    clients.forEach((client) => {
      if (!client.clientName.trim()) {
        newNameErrors[client.id] = "Client name is required";
        hasValidationError = true;
      } else if (!validateClientName(client.clientName)) {
        newNameErrors[client.id] =
          "Client name must contain only letters, numbers, spaces, or hyphens";
        hasValidationError = true;
      }

      if (!client.webSiteAddress.trim()) {
        newUrlErrors[client.id] = "Website address is required";
        hasValidationError = true;
      } else if (!validateUrl(client.webSiteAddress)) {
        newUrlErrors[client.id] =
          "Please enter a valid URL starting with https:// or http:// (e.g., https://example.com)";
        hasValidationError = true;
      }

      if (!validateReportType(client.reportType)) {
        newReportTypeErrors[client.id] = "Please select a valid report type";
        hasValidationError = true;
      }
    });

    setNameErrors(newNameErrors);
    setUrlErrors(newUrlErrors);
    setFileErrors(newFileErrors);
    setColorErrors(newColorErrors);
    setReportTypeErrors(newReportTypeErrors);

    if (hasValidationError) {
      return;
    }

    const updatedClients = await Promise.all(
      clients.map(async (client) => {
        let clientLogoBase64 = "";
        if (client.clientLogo) {
          clientLogoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(client.clientLogo);
          });
        }
        return {
          ...client,
          color: client.color.trim() || "#009485",
          clientLogo: clientLogoBase64,
        };
      })
    );

    const result = await onCreate(updatedClients);
    if (result?.errors) {
      setUrlErrors((prev) => ({ ...prev, ...result.errors.urlErrors }));
      setNameErrors((prev) => ({ ...prev, ...result.errors.nameErrors }));
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        onHide();
        resetForm();
      }}
      centered
      fullscreen
      className={styles.modal}
    >
      <Modal.Header closeButton className="border-0" />
      <Modal.Body
        className={`${styles.modalBody} d-flex flex-column align-items-center py-5`}
      >
        <div
          className={`${styles.container} bg-white border p-4 p-md-5 rounded`}
        >
          <h2 className="text-center fw-bold mb-4">Create New Client</h2>
          <p className="text-center text-muted mb-4">
            Fill in the details for the new client
          </p>

          <Form>
            {clients.map((client) => (
              <div className="row mb-3 align-items-start" key={client.id}>
                <div className="col-md-3 mb-3 mb-md-0">
                  <Form.Group controlId={`clientName-${client.id}`}>
                    <Form.Label className={styles.formLabel}>
                      Client Name{" "}
                      <span className={styles.requiredIndicator}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter a company name"
                      value={client.clientName}
                      onChange={(e) =>
                        updateClient(client.id, "clientName", e.target.value)
                      }
                      isInvalid={!!nameErrors[client.id]}
                      disabled={isLoading}
                      required
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className={`${styles.formFeedback}`}
                    >
                      {nameErrors[client.id]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-3 mb-3 mb-md-0">
                  <Form.Group controlId={`webSiteAddress-${client.id}`}>
                    <Form.Label className={styles.formLabel}>
                      Website Address{" "}
                      <span className={styles.requiredIndicator}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://your-client.com"
                      value={client.webSiteAddress}
                      onChange={(e) =>
                        updateClient(
                          client.id,
                          "webSiteAddress",
                          e.target.value
                        )
                      }
                      isInvalid={!!urlErrors[client.id]}
                      disabled={isLoading}
                      required
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className={`${styles.formFeedback}`}
                    >
                      {urlErrors[client.id]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-2 mb-3 mb-md-0">
                  <Form.Group controlId={`reportType-${client.id}`}>
                    <Form.Label className={styles.formLabel}>
                      Report Type{" "}
                      <span className={styles.requiredIndicator}>*</span>
                    </Form.Label>
                    <Form.Select
                      value={client.reportType}
                      onChange={(e) =>
                        updateClient(client.id, "reportType", e.target.value)
                      }
                      isInvalid={!!reportTypeErrors[client.id]}
                      disabled={isLoading}
                    >
                      <option value="SEO">SEO</option>
                      <option value="PPC">PPC</option>
                      <option value="SEO and PPC">SEO and PPC</option>
                    </Form.Select>
                    <Form.Control.Feedback
                      type="invalid"
                      className={`${styles.formFeedback}`}
                    >
                      {reportTypeErrors[client.id]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-2 mb-3 mb-md-0">
                  <Form.Group controlId={`clientLogo-${client.id}`}>
                    <Form.Label className={styles.formLabel}>
                      Client Logo{" "}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) =>
                        updateClient(client.id, "clientLogo", e.target.files[0])
                      }
                      isInvalid={!!fileErrors[client.id]}
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className={`${styles.formFeedback}`}
                    >
                      {fileErrors[client.id]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-2">
                  <Form.Group controlId={`color-${client.id}`}>
                    <Form.Label className={styles.formLabel}>
                      Client Color
                    </Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="#009485"
                        value={client.color}
                        onChange={(e) =>
                          updateClient(client.id, "color", e.target.value)
                        }
                        onBlur={(e) =>
                          validateColorOnBlur(client.id, e.target.value)
                        }
                        isInvalid={!!colorErrors[client.id]}
                        disabled={isLoading}
                        className="me-2"
                      />
                      <Form.Control
                        type="color"
                        value={client.color}
                        onChange={(e) =>
                          updateClient(client.id, "color", e.target.value)
                        }
                        disabled={isLoading}
                        style={{ width: "40px", padding: "0" }}
                      />
                    </div>
                    <Form.Control.Feedback
                      type="invalid"
                      className={`${styles.formFeedback}`}
                    >
                      {colorErrors[client.id]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {clients.length > 1 && (
                    <Button
                      variant="outline-danger"
                      onClick={() => removeClient(client.id)}
                      className="mt-3"
                      disabled={isLoading}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-3">
              <Button
                variant=""
                onClick={addClient}
                disabled={isLoading}
                className={styles.addButton}
              >
                + Add Client
              </Button>
            </div>

            <Button
              variant=""
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.createButton}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default CreateClientModal;
