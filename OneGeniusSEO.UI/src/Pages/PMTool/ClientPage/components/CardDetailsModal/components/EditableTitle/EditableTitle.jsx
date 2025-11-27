import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const EditableTitle = ({
  initialTitle,
  onSave,
  isCompleted,
  isLoading,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleTitleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (title.trim() && title !== initialTitle) {
      onSave(title.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`tw:text-2xl tw:font-bold tw:text-gray-900 tw:w-full tw:bg-transparent tw:border-b-2 tw:border-blue-500 tw:outline-none ${className}`}
        autoFocus
        disabled={isLoading}
      />
    );
  }

  return (
    <div
      onClick={handleTitleClick}
      className={`tw:text-2xl tw:font-bold tw:cursor-pointer tw:transition-colors ${
        isCompleted
          ? "tw:text-gray-500"
          : "tw:text-gray-900 tw:hover:text-gray-700"
      } ${className}`}
    >
      {title}
    </div>
  );
};

EditableTitle.propTypes = {
  initialTitle: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

EditableTitle.defaultProps = {
  isCompleted: false,
  isLoading: false,
  className: "",
};

export default EditableTitle;
