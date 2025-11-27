import React, { useState, useRef, useEffect } from "react";
import { CheckSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

const ChecklistDisplay = (props) => {
  const {
    checklist,
    onDeleteChecklistItem,
    onDeleteChecklist,
    onUpdateChecklistItem,
    onToggleChecklistItem,
    onCreateChecklistItem,
    onUpdateChecklist,
  } = props;
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedTitles, setEditedTitles] = useState({});
  const [addingToChecklistId, setAddingToChecklistId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editedChecklistTitle, setEditedChecklistTitle] = useState("");
  const editRefs = useRef({});
  const addItemRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editRefs.current?.[editingItemId] &&
        !editRefs.current?.[editingItemId].contains(event.target)
      ) {
        setEditingItemId(null);
      }

      // Handle click outside for add item input
      if (
        addItemRef.current &&
        !addItemRef.current.contains(event.target) &&
        addingToChecklistId
      ) {
        handleCancelAddItem();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingItemId, addingToChecklistId]);

  if (!checklist || checklist.length === 0) return null;

  // Calculate checklist completion
  const getChecklistProgress = (checklistItem) => {
    if (!checklistItem.items || checklistItem.items.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = checklistItem.items.filter(
      (item) => item.is_completed
    ).length;
    const total = checklistItem.items.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  // Checklist title editing handlers
  const handleChecklistTitleClick = (checklistId, title) => {
    setEditingChecklistId(checklistId);
    setEditedChecklistTitle(title);
  };

  const handleSaveChecklistTitle = async (checklistId) => {
    const newTitle = editedChecklistTitle.trim();
    if (!newTitle) return;

    try {
      await onUpdateChecklist(checklistId, newTitle);
      setEditingChecklistId(null);
    } catch (error) {
      console.error("Error updating checklist title:", error);
    }
  };

  const handleCancelChecklistEdit = () => {
    setEditingChecklistId(null);
    setEditedChecklistTitle("");
  };

  const handleChecklistTitleKeyDown = (event, checklistId) => {
    if (event.key === "Enter") {
      handleSaveChecklistTitle(checklistId);
    } else if (event.key === "Escape") {
      handleCancelChecklistEdit();
    }
  };

  // Item editing handlers
  const handleItemClick = (item) => {
    setEditingItemId(item.id);
    setEditedTitles((prev) => ({
      ...prev,
      [item.id]: prev[item.id] || item.title,
    }));
  };

  const handleSave = async (itemId) => {
    const newTitle = editedTitles[itemId]?.trim();
    if (!newTitle) return;

    try {
      await onUpdateChecklistItem(itemId, { title: newTitle });
      setEditingItemId(null);
    } catch (error) {
      console.error("Error updating checklist item:", error);
    }
  };

  const handleCancel = () => {
    setEditingItemId(null);
    setEditedTitles((prev) => {
      const newState = { ...prev };
      delete newState[editingItemId];
      return newState;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave(editingItemId);
    } else if (event.key === "Escape") {
      handleCancel();
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      // Pass both the completion status and the title to avoid null constraint error
      await onToggleChecklistItem(item.id, !item.is_completed, item.title);
    } catch (error) {
      console.error("Error toggling checklist item:", error);
    }
  };

  // Add item handlers
  const handleStartAddItem = (checklistId) => {
    setAddingToChecklistId(checklistId);
    setNewItemTitle("");
  };

  const handleSaveNewItem = async (checklistId) => {
    const title = newItemTitle.trim();
    if (!title) return;

    try {
      await onCreateChecklistItem(checklistId, title);
      setAddingToChecklistId(null);
      setNewItemTitle("");
    } catch (error) {
      console.error("Error creating checklist item:", error);
    }
  };

  const handleCancelAddItem = () => {
    setAddingToChecklistId(null);
    setNewItemTitle("");
  };

  const handleAddItemKeyDown = (event, checklistId) => {
    if (event.key === "Enter") {
      handleSaveNewItem(checklistId);
    } else if (event.key === "Escape") {
      handleCancelAddItem();
    }
  };

  return checklist.map((checklistItem) => {
    const isAddingToThisChecklist = addingToChecklistId === checklistItem.id;
    const isEditingThisTitle = editingChecklistId === checklistItem.id;
    const progress = getChecklistProgress(checklistItem);

    return (
      <div key={checklistItem.id} className="tw:flex tw:flex-col tw:gap-3">
        {/* Header with title and delete button */}
        <header className="tw:flex tw:justify-between tw:items-center">
          <div className="tw:flex tw:items-center tw:gap-2">
            <CheckSquare className="tw:w-4 tw:h-4" />
            {isEditingThisTitle ? (
              <input
                type="text"
                value={editedChecklistTitle}
                onChange={(e) => setEditedChecklistTitle(e.target.value)}
                onBlur={() => handleSaveChecklistTitle(checklistItem.id)}
                onKeyDown={(e) =>
                  handleChecklistTitleKeyDown(e, checklistItem.id)
                }
                className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:bg-transparent tw:border-b-2 tw:border-blue-500 tw:outline-none"
                autoFocus
              />
            ) : (
              <div
                onClick={() =>
                  handleChecklistTitleClick(
                    checklistItem.id,
                    checklistItem.title
                  )
                }
                className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:cursor-pointer tw:hover:text-gray-900 tw:transition-colors"
              >
                {checklistItem.title}
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => onDeleteChecklist(checklistItem.id)}
          >
            Delete
          </Button>
        </header>

        {/* Progress bar */}
        {progress.total > 0 && (
          <div className="tw:flex tw:items-center tw:gap-3">
            <div className="tw:text-sm tw:font-medium tw:text-gray-700">
              {progress.percentage}%
            </div>
            <div className="tw:flex-1 tw:h-2 tw:bg-gray-200 tw:rounded-full tw:overflow-hidden">
              <div
                className="tw:h-full tw:bg-blue-600 tw:transition-all tw:duration-300 tw:rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="tw:flex tw:flex-col tw:gap-1">
          {checklistItem.items?.map((item) => (
            <div
              key={item.id}
              className={`tw:flex tw:items-center tw:gap-3 tw:px-0 py-1 tw:rounded tw:cursor-pointer ${
                editingItemId === item.id ? "tw:items-start tw:gap-2" : ""
              }`}
            >
              <input
                type="checkbox"
                id={`label-checkbox-${item.id}`}
                checked={item.is_completed || false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(item);
                }}
                className="tw:w-4 tw:h-4 tw:text-blue-600 tw:focus:ring-blue-500 tw:border-gray-300 tw:rounded tw:cursor-pointer"
              />

              {/* Edit mode */}
              {editingItemId === item.id ? (
                <div
                  ref={(el) => (editRefs.current[item.id] = el)}
                  className="tw:flex tw:flex-col tw:gap-2 tw:w-full tw:p-3 tw:rounded-md tw:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editedTitles[item.id] || ""}
                    onChange={(e) =>
                      setEditedTitles((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    onKeyDown={handleKeyDown}
                    className="tw:border tw:rounded tw:p-2 tw:w-full tw:text-sm"
                    autoFocus
                  />
                  <div className="tw:flex tw:items-center tw:justify-between">
                    <div className="tw:flex tw:gap-2">
                      <Button
                        onClick={() => handleSave(item.id)}
                        size="sm"
                        variant="primary"
                      >
                        Save
                      </Button>
                      <Button onClick={handleCancel} size="sm" variant="plain">
                        Cancel
                      </Button>
                    </div>

                    <div
                      className="tw:hover:bg-gray-200 tw:rounded-md tw:p-1 tw:cursor-pointer"
                      onClick={() =>
                        onDeleteChecklistItem(checklistItem.id, item.id)
                      }
                    >
                      <Trash2 className="tw:w-4 tw:h-4 tw:text-red-500" />
                    </div>
                  </div>
                </div>
              ) : (
                // Preview mode
                <div
                  className={`tw:flex-1 tw:py-1 tw:px-2 tw:rounded-md tw:hover:bg-gray-100 tw:text-sm tw:cursor-pointer ${
                    item.is_completed ? "tw:line-through tw:text-gray-500" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {item.title}
                </div>
              )}
            </div>
          ))}

          {/* Add new item section */}
          {isAddingToThisChecklist ? (
            <div
              ref={addItemRef}
              className="tw:flex tw:flex-col tw:gap-2 tw:ml-7 tw:p-3 tw:rounded-md tw:bg-gray-100"
            >
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => handleAddItemKeyDown(e, checklistItem.id)}
                placeholder="Enter item title..."
                className="tw:border tw:rounded tw:p-2 tw:w-full tw:text-sm"
                autoFocus
              />
              <div className="tw:flex tw:gap-2">
                <Button
                  onClick={() => handleSaveNewItem(checklistItem.id)}
                  size="sm"
                  variant="primary"
                  disabled={!newItemTitle.trim()}
                >
                  Add
                </Button>
                <Button onClick={handleCancelAddItem} size="sm" variant="plain">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="tw:flex tw:ml-7">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStartAddItem(checklistItem.id)}
              >
                Add an Item
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  });
};

export default ChecklistDisplay;
