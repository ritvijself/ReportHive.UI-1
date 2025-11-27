import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const YouTubeChannelSelectionModal = ({
  show,
  onHide,
  channels,
  onSelectChannel,
  setErrorMessage,
  setLoading,
  handleRemoveIntegration,
  apibaseurl,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleConfirm = async () => {
    if (!selectedChannelId) {
      setLocalError("Please select a YouTube channel.");
      return;
    }

    const selectedChannel = channels.find(
      (ch) => ch.channelId === selectedChannelId
    );

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Optionally, make an API call to delete unselected channels or save the selected channel
      const response = await fetch(
        `${apibaseurl}/api/GoogleYouTube/SelectOnlyOneChannel?channelId=${encodeURIComponent(
          selectedChannelId
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
        throw new Error("Failed to process YouTube channel selection.");
      }

      onSelectChannel(selectedChannel);
      setLocalError("");
      onHide();
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to select YouTube channel. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await handleRemoveIntegration("YouTube");
      onHide();
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove YouTube integration.");
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
          Select YouTube Channel
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
            {(channels || []).map((channel, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center p-3 border rounded"
              >
                <Form.Check
                  type="radio"
                  name="youtubeChannel"
                  id={`youtube-channel-${idx}`}
                  className="me-2"
                  checked={selectedChannelId === channel.channelId}
                  onChange={() => {
                    setSelectedChannelId(channel.channelId);
                    setLocalError("");
                  }}
                />
                <label
                  htmlFor={`youtube-channel-${idx}`}
                  className="d-flex justify-content-between w-100"
                  style={{ cursor: "pointer" }}
                >
                  <span>{channel.channelName || "Unnamed Channel"}</span>
                  <small className="text-muted">{channel.channelId}</small>
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
          disabled={!selectedChannelId}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default YouTubeChannelSelectionModal;
