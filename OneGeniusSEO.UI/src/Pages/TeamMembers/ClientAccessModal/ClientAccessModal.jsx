import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import style from "./ClientAccessModal.module.css";

const ClientAccessModal = ({
  show,
  onHide,
  client,
  accessMatrix,
  onSave,
  featureHeaders,
  isEdit,
}) => {
  const [localAccessMatrix, setLocalAccessMatrix] = useState(
    accessMatrix || featureHeaders.map(() => false)
  );

  // Sync localAccessMatrix with prop changes
  useEffect(() => {
    setLocalAccessMatrix(accessMatrix || featureHeaders.map(() => false));
  }, [accessMatrix, featureHeaders]);

  const handleCheckboxChange = (index) => {
    const updatedMatrix = [...localAccessMatrix];
    updatedMatrix[index] = !updatedMatrix[index];
    setLocalAccessMatrix(updatedMatrix);
  };

  const handleSave = () => {
    onSave(localAccessMatrix);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit" : "Add"} Access for {client?.clientName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={style.access_container}>
          {featureHeaders.map((header, index) => (
            <div
              key={index}
              className={style.feature_row}
              onClick={() => handleCheckboxChange(index)}
              style={{ cursor: "pointer" }}
            >
              <label style={{ flex: 1, cursor: "pointer" }}>{header}</label>
              <input
                type="checkbox"
                checked={localAccessMatrix[index] || false}
                onClick={(e) => e.stopPropagation()} // Prevent row click from firing twice
                onChange={() => handleCheckboxChange(index)}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientAccessModal;
