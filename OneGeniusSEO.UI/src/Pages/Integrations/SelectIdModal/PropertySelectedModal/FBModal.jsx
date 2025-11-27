import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const FacebookPageSelectionModal = ({
  show,
  onHide,
  pages,
  onSelectPage,
  apibaseurl,
  setErrorMessage,
  setLoading,
}) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    if (!selectedPage) {
      setLocalError("Please select a page.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/FacebookInsightsPage/deleteOtherPages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pageId: selectedPage.page_Id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select Facebook page");
      }

      onSelectPage(selectedPage);
      setLocalError("");
      onHide();
    } catch (error) {
      setErrorMessage("Failed to select Facebook page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {}}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>Select a Facebook Page</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        {pages?.length > 0 ? (
          <Form>
            {pages.map((page, idx) => (
              <Form.Check
                key={idx}
                type="radio"
                label={`${page.page_Name} (${page.page_Id})`}
                name="facebookPage"
                onChange={() => {
                  setSelectedPage(page);
                  setLocalError("");
                }}
              />
            ))}
          </Form>
        ) : (
          <p className="text-muted text-center">No pages available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!selectedPage}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FacebookPageSelectionModal;
