import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const GMBPropertySelectionModal = ({
  show,
  onHide,
  properties,
  onSelectProperty,
  apibaseurl,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
}) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    if (!selectedAccount) {
      setLocalError("Please select an account.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/GoogleMyBusiness/gmb/delete-except?email=${encodeURIComponent(
          selectedAccount.email
        )}&locationNameId=${encodeURIComponent(selectedAccount.accountNameID)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select GMB account");
      }

      onSelectProperty({
        email: selectedAccount.email,
        accountNameID: selectedAccount.accountNameID,
        displayName: selectedAccount.displayName,
      });

      setLocalError("");
      onHide();
    } catch (error) {
      setErrorMessage("Failed to select GMB account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await handleRemoveIntegration("Google My Business");
      onHide();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove integration.");
    } finally {
      setLoading(false);
    }
  };

  const hasAccounts = properties && properties.length > 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      aria-labelledby="gmb-account-selection-modal"
      className="gmb-account-selection-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title
          id="gmb-account-selection-modal"
          className="fs-4 fw-bold text-primary"
        >
          Select Google My Business Account
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <Alert variant="danger" onClose={() => setLocalError("")} dismissible>
            {localError}
          </Alert>
        )}
        {hasAccounts ? (
          <Form>
            <div className="account-list d-flex flex-column gap-3">
              {properties.map((account, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center p-3 border rounded hover-bg-light"
                >
                  <Form.Check
                    type="radio"
                    id={`account-${index}`}
                    name="account"
                    onChange={() => {
                      setSelectedAccount({
                        email: account.email,
                        accountNameID: account.accountNameID,
                        displayName: account.displayName,
                      });
                      setLocalError("");
                    }}
                    className="me-2"
                  />
                  <label
                    htmlFor={`account-${index}`}
                    className="d-flex flex-grow-1 align-items-center justify-content-between"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="fw-medium me-2">
                      {account.displayName}
                    </span>
                    <small className="text-muted">
                      {account.accountNameID.split("/").pop()}
                    </small>
                  </label>
                </div>
              ))}
            </div>
          </Form>
        ) : (
          <p className="text-muted text-center mb-0">No accounts available.</p>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          Cancel
        </Button>
        {hasAccounts && (
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="px-4"
            disabled={!selectedAccount}
          >
            Confirm
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GMBPropertySelectionModal;
