import React from "react";
import { Button, Modal } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

const DeleteListModal = ({
  isOpen,
  onClose,
  onConfirm,
  listName,
  taskCount = 0,
  isLoading = false,
}) => {
  const footer = (
    <div className="tw:px-6 tw:py-4 tw:border-t tw:border-gray-200 tw:flex tw:justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={onConfirm}
        isLoading={isLoading}
        className="tw:bg-red-600 tw:hover:bg-red-700 tw:focus:ring-red-500 tw:text-white"
      >
        Delete List
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete List"
      titleId="delete-list-title"
      footer={footer}
    >
      <p className="tw:text-sm tw:text-gray-700 tw:mb-4">
        Are you sure you want to delete <strong>{listName}</strong>?
      </p>

      <div className="tw:bg-red-50 tw:border tw:border-red-200 tw:rounded-md tw:p-4">
        <div className="tw:flex tw:items-start tw:gap-3">
          <AlertTriangle className="tw:w-4 tw:h-4 tw:text-red-500 tw:mt-0.5 tw:flex-shrink-0" />
          <div>
            <p className="tw:text-sm tw:font-medium tw:text-red-800 tw:mb-1">
              This action cannot be undone
            </p>
            <p className="tw:text-sm tw:text-red-700">
              This will permanently delete the list
              {taskCount > 0 && (
                <span>
                  {" "}
                  and all {taskCount} {taskCount === 1 ? "task" : "tasks"} in it
                </span>
              )}
              . Everything will be lost.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteListModal;
