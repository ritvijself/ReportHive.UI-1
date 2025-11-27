import React from "react";
import PropTypes from "prop-types";

const ColorPalette = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <div className="tw:grid tw:grid-cols-5 tw:gap-2">
      {colors.map((color) => (
        <div
          key={color}
          className={`tw:w-full tw:h-8 tw:rounded-sm tw:cursor-pointer tw:border-2 ${
            selectedColor === color
              ? "tw:border-blue-500"
              : "tw:border-transparent"
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onSelectColor(color)}
        ></div>
      ))}
    </div>
  );
};

ColorPalette.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedColor: PropTypes.string.isRequired,
  onSelectColor: PropTypes.func.isRequired,
};

export default ColorPalette;
