import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { X, Plus } from "lucide-react";

const AddList = ({ onAddList, hasNoList, activeInput, onSetActiveInput }) => {
  const [listTitle, setListTitle] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const inputId = "add-list";
  const isAdding = activeInput === inputId;

  const handleAddList = () => {
    if (listTitle.trim()) {
      onAddList(listTitle.trim());
      setListTitle(""); // Clear the title for next list
      // Keep input active for continuous adding
    }
  };

  const handleStartAdding = () => {
    onSetActiveInput(inputId);
  };

  const handleCancel = () => {
    onSetActiveInput(null);
    // Don't clear listTitle here - retain the value
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddList();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // Handle click outside to close AddList
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        isAdding
      ) {
        onSetActiveInput(null);
        // Don't clear listTitle - retain the value
      }
    };

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding, onSetActiveInput]);

  // Use useLayoutEffect for immediate, synchronous DOM updates (eliminates flicker)
  useLayoutEffect(() => {
    if (inputRef.current && isAdding) {
      const input = inputRef.current;
      input.focus();
      // Set cursor position to end of text
      const length = listTitle.length;
      input.setSelectionRange(length, length);
    }
  }, [isAdding, listTitle]); // Runs when isAdding changes OR when listTitle changes (after clearing)

  if (isAdding) {
    return (
      <div
        ref={containerRef}
        className="tw:w-72 tw:bg-[#f1f2f4] tw:rounded-lg tw:p-2 tw:flex-shrink-0"
        style={{ cursor: "default" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="tw:w-full tw:p-2 tw:bg-white tw:border-blue-500 tw:border-2 tw:rounded-md tw:focus:outline-none tw:text-gray-800"
        />
        <div className="tw:flex tw:items-center tw:gap-2 tw:mt-2">
          <button
            onClick={handleAddList}
            className="tw:bg-blue-600 tw:cursor-pointer tw:text-white tw:px-4 tw:py-1.5 tw:rounded-md tw:text-sm tw:font-semibold tw:hover:bg-blue-700 tw:transition-colors"
          >
            Add list
          </button>
          <button
            onClick={handleCancel}
            className="tw:p-1.5 tw:cursor-pointer tw:text-gray-500 tw:hover:text-gray-800 tw:hover:bg-gray-300 tw:rounded-md tw:transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartAdding}
      className="tw:w-72 tw:cursor-pointer tw:flex-shrink-0 tw:hover:bg-gray/30 tw:text-black tw:font-semibold tw:p-3 tw:rounded-xl tw:flex tw:items-center tw:gap-2 tw:transition-colors"
      style={{ cursor: "pointer", backgroundColor: "rgb(203, 195, 195)" }}
    >
      <Plus size={16} /> {hasNoList ? "Add a list" : "Add another list"}
    </button>
  );
};

export default AddList;
