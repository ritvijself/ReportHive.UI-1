import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const GoogleAdsAccountModal = ({
  show,
  onHide,
  accounts,
  onSelectAccount,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
  apibaseurl,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    // if (!selectedCustomerId) {
    //   setLocalError("Please select an Ads account.");
    //   return;
    // }

    const selectedAccount = accounts.find(
      (acc) => acc.customerId === selectedCustomerId
    );

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/GoogleAdsApi/Delete?_customerId=${encodeURIComponent(
          selectedCustomerId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete unselected Ads accounts.");
      }

      onSelectAccount(selectedAccount);
      setLocalError("");
      onHide();
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to select Ads account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await handleRemoveIntegration("Google Ads");
      onHide();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove integration.");
    } finally {
      setLoading(false);
    }
  };

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
          Select Google Ads Account
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        <Form>
          <div className="d-flex flex-column gap-3">
            {(accounts || []).map((account, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center p-3 border rounded"
              >
                <Form.Check
                  type="radio"
                  name="adsAccount"
                  id={`ads-account-${idx}`}
                  className="me-2"
                  checked={selectedCustomerId === account.customerId}
                  onChange={() => {
                    setSelectedCustomerId(account.customerId);
                    setLocalError("");
                  }}
                />
                <label
                  htmlFor={`ads-account-${idx}`}
                  className="d-flex justify-content-between w-100"
                  style={{ cursor: "pointer" }}
                >
                  <span>{account.customerName || "Unnamed Account"}</span>
                  <small className="text-muted">{account.customerId}</small>
                </label>
              </div>
            ))}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          className="px-4"
          disabled={!selectedCustomerId}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GoogleAdsAccountModal;
