import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const GSCPropertySelectionModal = ({
  show,
  onHide,
  properties,
  onSelectProperty,
  apibaseurl,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
}) => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    if (!selectedSite) {
      setLocalError("Please select a site.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/GoogleSearchConsole/search-console/delete-other-sites?email=${encodeURIComponent(
          properties[0].email
        )}&siteUrl=${encodeURIComponent(selectedSite.siteUrl)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select site");
      }

      onSelectProperty({
        email: properties[0].email,
        siteUrl: selectedSite.siteUrl,
        permissionLevel: selectedSite.permissionLevel,
      });

      setLocalError("");
      onHide();
    } catch (error) {
      console.error("Failed to select GSC site:", error);
      setErrorMessage("Failed to select site. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);

      await handleRemoveIntegration("Google Search Console");
      onHide();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove integration.");
    } finally {
      setLoading(false);
    }
  };

  const hasSites =
    properties && properties.length > 0 && properties[0].sites.length > 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title className="fs-4 fw-bold text-primary">
          Select Google Search Console Site
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        {hasSites ? (
          <Form>
            <div className="d-flex flex-column gap-3">
              {properties[0].sites.map((site, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center p-3 border rounded hover-bg-light"
                >
                  <Form.Check
                    type="radio"
                    id={`site-${index}`}
                    name="site"
                    onChange={() => {
                      setSelectedSite(site);
                      setLocalError("");
                    }}
                    className="me-2"
                  />
                  <label
                    htmlFor={`site-${index}`}
                    className="d-flex flex-grow-1 align-items-center justify-content-between"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="fw-medium me-2">
                      {new URL(site.siteUrl).hostname}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </Form>
        ) : (
          <p className="text-muted text-center mb-0">No sites available.</p>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          Cancel
        </Button>
        {hasSites && (
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="px-4"
            disabled={!selectedSite}
          >
            Confirm
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GSCPropertySelectionModal;
