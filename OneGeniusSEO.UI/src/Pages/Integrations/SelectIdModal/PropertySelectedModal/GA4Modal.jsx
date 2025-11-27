import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const GA4PropertySelectionModal = ({
  show,
  onHide,
  properties,
  onSelectProperty,
  apibaseurl,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
}) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    // if (!selectedProperty) {
    //   setLocalError("Please select a property.");
    //   return;
    // }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/GoogleAnalytics4Api/deletePropertyId?displayName=${encodeURIComponent(
          selectedProperty.displayName
        )}&propertyId=${encodeURIComponent(selectedProperty.propertyId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select property");
      }

      onSelectProperty({
        email: properties[0].email,
        propertyId: selectedProperty.propertyId,
        displayName: selectedProperty.displayName,
      });

      setLocalError("");
      onHide();
    } catch (error) {
      setErrorMessage("Failed to select property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await handleRemoveIntegration("Google Analytics 4");
      onHide();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove integration.");
    } finally {
      setLoading(false);
    }
  };

  const hasProperties =
    properties && properties.length > 0 && properties[0].properties.length > 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      aria-labelledby="property-selection-modal"
      className="property-selection-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title
          id="property-selection-modal"
          className="fs-4 fw-bold text-primary"
        >
          Select Google Analytics 4 Property
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        {hasProperties ? (
          <Form>
            <div className="property-list d-flex flex-column gap-3">
              {properties[0].properties.map((property, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center p-3 border rounded hover-bg-light"
                >
                  <Form.Check
                    type="radio"
                    id={`property-${index}`}
                    name="property"
                    onChange={() => {
                      setSelectedProperty(property);
                      setLocalError("");
                    }}
                    className="me-2"
                  />
                  <label
                    htmlFor={`property-${index}`}
                    className="d-flex flex-grow-1 align-items-center justify-content-between"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="fw-medium me-2">
                      {property.displayName}
                    </span>
                    <small className="text-muted">
                      {property.propertyId.split("/").pop()}
                    </small>
                  </label>
                </div>
              ))}
            </div>
          </Form>
        ) : (
          <p className="text-muted text-center mb-0">
            No properties available.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          Cancel
        </Button>
        {hasProperties && (
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="px-4"
            disabled={!selectedProperty}
          >
            Confirm
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GA4PropertySelectionModal;
