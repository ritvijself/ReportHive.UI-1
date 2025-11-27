import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, X, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ColorPalette from "./ColorPalette";

const LabelForm = ({
  initialLabel, // If provided, it's for editing; otherwise, for creating
  onBack,
  onClose,
  onSubmit, // Handles both create and update
  onDelete, // Only for editing mode
  isLoading = false,
  isDeleting = false,
}) => {
  const [labelName, setLabelName] = useState(initialLabel?.name || "");
  const [selectedColor, setSelectedColor] = useState(
    initialLabel?.color || "#607d8b"
  );

  const isEditing = Boolean(initialLabel);

  const colors = [
    "#607d8b", // Blue Grey
    "#f44336", // Red
    "#e91e63", // Pink
    "#9c27b0", // Purple
    "#673ab7", // Deep Purple
    "#3f51b5", // Indigo
    "#2196f3", // Blue
    "#03a9f4", // Light Blue
    "#00bcd4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8bc34a", // Light Green
    "#cddc39", // Lime
    "#ffeb3b", // Yellow
    "#ffc107", // Amber
    "#ff9800", // Orange
    "#ff5722", // Deep Orange
    "#795548", // Brown
    "#9e9e9e", // Grey
  ];

  useEffect(() => {
    if (initialLabel) {
      setLabelName(initialLabel.name);
      setSelectedColor(initialLabel.color);
    } else {
      setLabelName("");
      setSelectedColor("#607d8b");
    }
  }, [initialLabel]);

  const handleSubmit = () => {
    if (labelName.trim() && selectedColor) {
      onSubmit({
        id: initialLabel?.id, // Pass ID if editing
        name: labelName.trim(),
        color: selectedColor,
      });
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the label "${labelName}"?`
      )
    ) {
      onDelete(initialLabel.id);
    }
  };

  return (
    <div>
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="tw:p-1 tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:cursor-pointer"
        >
          <ArrowLeft size={18} className="tw:text-gray-500" />
        </div>
        <h3 className="tw:text-base tw:font-semibold tw:text-gray-800">
          {isEditing ? "Edit Label" : "Create Label"}
        </h3>
        <div
          onClick={onClose}
          className="tw:p-1 tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:cursor-pointer"
        >
          <X size={18} className="tw:text-gray-500" />
        </div>
      </div>

      <div
        className="tw:w-full tw:h-16 tw:rounded-md tw:mb-4 tw:flex tw:items-center tw:justify-center tw:text-white tw:font-semibold"
        style={{ backgroundColor: selectedColor }}
      >
        {labelName}
      </div>

      <div className="tw:mb-4">
        <label
          htmlFor="labelName"
          className="tw:block tw:text-xs tw:font-medium tw:text-gray-700 tw:mb-1"
        >
          Title
        </label>
        <Input
          id="labelName"
          type="text"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          placeholder="Enter label name"
          className="tw:w-full tw:px-2 tw:py-1.5 tw:text-sm"
        />
      </div>

      <div className="tw:mb-4">
        <div className="tw:block tw:text-xs tw:font-medium tw:text-gray-700 tw:mb-1">
          Select Color
        </div>
        <ColorPalette
          colors={colors}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      </div>

      <div className="tw:flex tw:justify-between tw:items-center tw:mt-4">
        {isEditing && (
          <Button
            onClick={handleDelete}
            variant="secondary"
            isLoading={isDeleting}
          >
            <Trash2 size={16} className="tw:mr-1" /> Delete
          </Button>
        )}
        <Button onClick={handleSubmit} variant="primary" isLoading={isLoading}>
          {isEditing ? "Save" : "Create"}
        </Button>
      </div>
    </div>
  );
};

LabelForm.propTypes = {
  initialLabel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }),
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  isDeleting: PropTypes.bool,
};

export default LabelForm;
