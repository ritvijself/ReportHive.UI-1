import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const LinkedInModal = ({
  show,
  onHide,
  pages,
  onSelectPage,
  apibaseurl,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
}) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    if (!selectedPage) {
      setLocalError("Please select a LinkedIn page.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Ensure we have LinkedInUserId and PageIdToKeep
      const linkedInUserId = selectedPage.linkedInUserId || selectedPage.id;
      // pageIdToKeep can be the page ID or something else from your object
      const pageIdToKeep = selectedPage.organizationId || selectedPage.page_Seq;
      console.log("Selected Page:", selectedPage);
      const response = await fetch(
        `${apibaseurl}/api/LinkedInApi/select_page`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            linkedInUserId,
            pageIdToKeep,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to select LinkedIn page");
      }

      const data = await response.json();

      onSelectPage({
        linkedInUserId,
        pageIdToKeep,
        profile: selectedPage,
      });

      setLocalError("");
      onHide();
    } catch (error) {
      console.error("Failed to select LinkedIn page:", error);
      setErrorMessage(
        error.message || "Failed to select LinkedIn page. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await handleRemoveIntegration("LinkedIn");
      onHide();
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to remove LinkedIn integration."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasPages = pages && pages.length > 0;

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
          Select LinkedIn Page
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        {hasPages ? (
          <Form>
            <div className="d-flex flex-column gap-3">
              {pages.map((page, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center p-3 border rounded hover-bg-light"
                >
                  <Form.Check
                    type="radio"
                    id={`page-${index}`}
                    name="page"
                    onChange={() => {
                      setSelectedPage(page);
                      setLocalError("");
                    }}
                    className="me-2"
                  />
                  <label
                    htmlFor={`page-${index}`}
                    className="d-flex flex-grow-1 align-items-center justify-content-between"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="fw-medium me-2">
                      {page.name || page.linkedInUserId || `Page ${index + 1}`}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </Form>
        ) : (
          <p className="text-muted text-center mb-0">
            No LinkedIn pages available.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          Cancel
        </Button>
        {hasPages && (
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="px-4"
            disabled={!selectedPage}
          >
            Confirm
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default LinkedInModal;
