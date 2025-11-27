import React from "react";
import PropTypes from "prop-types";
import { Edit, Pencil } from "lucide-react";

const LabelItem = ({ label, onToggle, onEdit }) => {
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:group">
      <div className="tw:flex tw:items-center tw:gap-2 tw:flex-1">
        <input
          type="checkbox"
          id={`label-checkbox-${label.id}`}
          checked={label.checked}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(label.id);
          }}
          className="tw:text-blue-600 tw:focus:ring-blue-500 tw:border-gray-300 tw:rounded"
        />
        <label
          htmlFor={`label-checkbox-${label.id}`}
          className="tw:flex-1 tw:py-1 tw:px-2 tw:rounded-sm tw:text-sm tw:font-medium tw:text-center"
          style={{
            backgroundColor: label.color,
            color: "#fff",
            textShadow: "0 0 2px rgba(0,0,0,0.5)",
          }}
        >
          {label.name}
        </label>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(label.id);
        }}
        className="tw:p-1 tw:cursor-pointer tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:ml-2"
      >
        <Pencil size={16} className="tw:text-gray-500" />
      </button>
    </div>
  );
};

LabelItem.propTypes = {
  label: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    checked: PropTypes.bool, // Optional, for selection state
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default LabelItem;
