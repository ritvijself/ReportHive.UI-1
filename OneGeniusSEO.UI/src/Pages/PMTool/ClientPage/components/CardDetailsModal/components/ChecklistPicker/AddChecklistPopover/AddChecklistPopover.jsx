import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

const AddChecklistPopover = ({
  children,
  isOpen,
  onClose,
  onCreateChecklist,
}) => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onCreateChecklist(title.trim());
      setTitle("");
      onClose();
    } catch (error) {
      console.error("Error creating checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && title.trim()) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      positions={["bottom", "left", "right"]}
      align="start"
      padding={10}
      reposition={true}
      onClickOutside={onClose}
      containerStyle={{ zIndex: 99 }}
      content={
        <div className="tw:bg-white tw:rounded-lg tw:shadow-xl tw:border tw:border-gray-200 tw:p-4 tw:w-[292px] tw:z-[100]">
          <div className="tw:flex tw:justify-between tw:items-center tw:mb-4">
            <div className="tw:text-base tw:font-semibold tw:text-gray-800">
              Add checklist
            </div>
            <button
              onClick={onClose}
              className="tw:p-1 tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:cursor-pointer"
            >
              <X size={18} className="tw:text-gray-500" />
            </button>
          </div>
          <div className="tw:mt-4 tw:space-y-3">
            <div>
              <label
                htmlFor="checklistTitleInput"
                className="tw:block tw:text-xs tw:font-medium tw:text-gray-700 tw:mb-1"
              >
                Title
              </label>
              <Input
                type="text"
                id="checklistTitleInput"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter checklist title"
                className="tw:w-full tw:px-2 tw:py-1.5 tw:text-sm"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="tw:mt-4 tw:flex tw:gap-2">
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default AddChecklistPopover;
