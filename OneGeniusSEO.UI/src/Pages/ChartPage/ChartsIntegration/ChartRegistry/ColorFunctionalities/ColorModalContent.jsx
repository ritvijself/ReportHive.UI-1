import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { FaArrowLeft } from 'react-icons/fa';

const ColorModalContent = ({ initialColor, onSave, onBack, onClose }) => {
  
  // Color ki state ab is component ke andar hai
  const [color, setColor] = useState('#ffffff');

  // useEffect se shuruaati color set hoga
  useEffect(() => {
    setColor(initialColor || '#ffffff');
  }, [initialColor]);

  // Save button click hone par yeh function call hoga
  const handleSaveClick = () => {
    onSave(color);
  };

  return (
    <>
      <div className="modal-header">
        <button onClick={onBack} className="back-button"><FaArrowLeft /></button>
        <h3>Change Chart Color</h3>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      <div className="modal-body color-picker-body">
        <ChromePicker
          color={color}
          onChange={(selectedColor) => setColor(selectedColor.hex)}
          disableAlpha={true}
        />
        <button onClick={handleSaveClick} className="modal-button save-button">Save Color</button>
      </div>
    </>
  );
};

export default ColorModalContent;