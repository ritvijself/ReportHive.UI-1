import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ChartColorPickerModal = ({ show, handleClose, chart, onSave, currentColor }) => {
  // Default color #1565c0 (aapka original color)
  const [color, setColor] = useState(currentColor || '#1565c0');

  useEffect(() => {
    // Jab bhi modal khule, chart ka current color set karein
    // Agar koi color set nahi hai, toh default color use karein
    setColor(currentColor || '#1565c0');
  }, [currentColor, show]);

  const handleSaveClick = () => {
    onSave(chart.key, color);
  };

  // Jab tak chart select nahi hota, modal render na karein
  if (!chart) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Color: {chart.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Select a new color:</p>
        
        {/* Yeh HTML ka basic color picker hai */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ 
            width: '100px', 
            height: '100px', 
            border: 'none', 
            padding: 0, 
            cursor: 'pointer' 
          }}
        />
        <p className="mt-2">Selected: <strong>{color}</strong></p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save Color
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChartColorPickerModal;