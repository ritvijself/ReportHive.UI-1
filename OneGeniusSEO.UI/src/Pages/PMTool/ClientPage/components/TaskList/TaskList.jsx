import { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Plus, GripVertical, Loader2 } from "lucide-react";
import {
  TaskCard,
  AddCard,
  ListOptionsDropdown,
  DeleteListModal,
} from "./components";
import { DND_TYPES } from "../../constants";

const TaskList = ({
  list,
  onAddCard,
  onUpdateCardCompletion,
  onTaskClick,
  activeInput,
  onSetActiveInput,
  onUpdateListTitle,
  onDeleteList,
  onMoveList,
  onMoveCard, // New prop for handling card movements
  isDeleting,
  isUpdating = false,
}) => {
  // States
  const [cardTitle, setCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(list.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isValidDropTarget, setIsValidDropTarget] = useState(false);
  const [isValidCardDropTarget, setIsValidCardDropTarget] = useState(false);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(-1);
  const [dragOverPosition, setDragOverPosition] = useState("after"); // 'before' or 'after'

  // Refs
  const taskListRef = useRef(null);
  const scrollRef = useRef(null);
  const titleInputRef = useRef(null);

  const inputId = `card-${list.id}`;
  const isAddingCard = activeInput === inputId;

  // List Drag and Drop setup
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.LIST,
    item: () => ({
      type: DND_TYPES.LIST,
      id: list.id,
      listId: list.id,
      title: list.title,
      cardCount: list.cards?.length || 0,
      originalIndex: list.position,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isEditingTitle && !isAddingCard && !isUpdating,
    end: (item, monitor) => {
      // Reset the drop indicator when drag ends
      setIsValidDropTarget(false);

      // If the drop was not successful, don't do anything
      if (!monitor.didDrop()) {
        return;
      }

      const dropResult = monitor.getDropResult();
      if (!dropResult?.moved) {
        return;
      }
    },
  });

  // List Drop setup (for list reordering)
  const [{ isOver: isListOver, canDrop: canListDrop }, listDrop] = useDrop({
    accept: DND_TYPES.LIST,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (draggedItem) => {
      if (!taskListRef.current || isDragging) {
        setIsValidDropTarget(false);
        return;
      }

      const draggedListId = draggedItem.listId;
      const targetListId = list.id;

      // Don't show indicator for the item being dragged
      if (draggedListId === targetListId) {
        setIsValidDropTarget(false);
        return;
      }

      // Only show indicator when actually hovering over this target
      setIsValidDropTarget(isListOver && canListDrop);
    },
    drop: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return { moved: false };
      }

      const draggedListId = draggedItem.listId;
      const targetListId = list.id;

      // Only proceed if dragging to a different list
      if (draggedListId !== targetListId) {
        onMoveList(draggedListId, targetListId);
        setIsValidDropTarget(false);
        return { moved: true, targetId: targetListId };
      }

      setIsValidDropTarget(false);
      return { moved: false };
    },
  });

  // Card Drop setup (for card movements)
  const [{ isOver: isCardOver, canDrop: canCardDrop }, cardDrop] = useDrop({
    accept: DND_TYPES.CARD,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (draggedCard, monitor) => {
      if (!taskListRef.current) {
        setIsValidCardDropTarget(false);
        setDragOverCardIndex(-1);
        return;
      }

      // Show drop indicator when hovering over this list
      setIsValidCardDropTarget(isCardOver && canCardDrop);

      // Calculate precise drop position for both same-list and cross-list
      if (scrollRef.current) {
        const clientOffset = monitor.getClientOffset();
        if (clientOffset) {
          const scrollContainer = scrollRef.current;
          const scrollRect = scrollContainer.getBoundingClientRect();
          const relativeY =
            clientOffset.y - scrollRect.top + scrollContainer.scrollTop;

          // Get all card elements in their current DOM order
          const cardElements =
            scrollContainer.querySelectorAll("[data-card-id]");
          let closestIndex = -1;
          let closestPosition = "after";
          let minDistance = Infinity;

          cardElements.forEach((cardEl, domIndex) => {
            const cardRect = cardEl.getBoundingClientRect();
            const cardRelativeTop =
              cardRect.top - scrollRect.top + scrollContainer.scrollTop;
            const cardRelativeBottom =
              cardRect.bottom - scrollRect.top + scrollContainer.scrollTop;
            const cardMidpoint = cardRelativeTop + cardRect.height / 2;

            // Determine if we're closer to the top or bottom of this card
            if (relativeY <= cardMidpoint) {
              // Closer to top - check distance to top edge
              const distanceToTop = Math.abs(relativeY - cardRelativeTop);
              if (distanceToTop < minDistance) {
                minDistance = distanceToTop;
                closestIndex = domIndex;
                closestPosition = "before";
              }
            } else {
              // Closer to bottom - check distance to bottom edge
              const distanceToBottom = Math.abs(relativeY - cardRelativeBottom);
              if (distanceToBottom < minDistance) {
                minDistance = distanceToBottom;
                closestIndex = domIndex;
                closestPosition = "after";
              }
            }
          });

          // If we're past all cards or the list is empty, drop at the end
          if (closestIndex === -1) {
            if (cardElements.length > 0) {
              closestIndex = cardElements.length - 1;
              closestPosition = "after";
            }
          }

          setDragOverCardIndex(closestIndex);
          setDragOverPosition(closestPosition);
        }
      } else {
        setDragOverCardIndex(-1);
      }
    },
    drop: (draggedCard, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return { moved: false };
      }

      const draggedCardId = draggedCard.cardId;
      const draggedListId = draggedCard.listId;
      const targetListId = list.id;

      // Calculate drop position based on the visual indicator
      let dropPosition = list.cards.length; // Default to end

      if (dragOverCardIndex >= 0) {
        // Get the actual card at the visual index (accounting for filtered cards)
        const visibleCards = list.cards.filter((card) => {
          // For same-list moves, exclude the dragged card from position calculation
          if (draggedListId === targetListId && card.id === draggedCardId) {
            return false;
          }
          return true;
        });

        if (dragOverCardIndex < visibleCards.length) {
          const targetCard = visibleCards[dragOverCardIndex];
          const actualCardIndex = list.cards.findIndex(
            (card) => card.id === targetCard.id
          );

          if (actualCardIndex !== -1) {
            dropPosition =
              dragOverPosition === "before"
                ? actualCardIndex
                : actualCardIndex + 1;
          }
        } else {
          // Dropping at the end
          dropPosition = list.cards.length;
        }
      }

      // For same-list reordering, adjust position if needed
      if (draggedListId === targetListId) {
        const currentCardIndex = list.cards.findIndex(
          (card) => card.id === draggedCardId
        );
        if (currentCardIndex !== -1 && currentCardIndex < dropPosition) {
          dropPosition -= 1;
        }
      }

      // Handle card movement
      if (onMoveCard) {
        onMoveCard(draggedCardId, draggedListId, targetListId, dropPosition);
        setIsValidCardDropTarget(false);
        setDragOverCardIndex(-1);
        return { moved: true, targetId: targetListId };
      }

      setIsValidCardDropTarget(false);
      setDragOverCardIndex(-1);
      return { moved: false };
    },
  });

  // Connect drag and drop refs
  const connectDragDrop = (el) => {
    if (el) {
      drag(el);
      listDrop(el);
      cardDrop(el);
    }
  };

  // Reset drop target indicators when no longer hovering
  useEffect(() => {
    if (!isListOver && !isDragging) {
      setIsValidDropTarget(false);
    }
    if (!isCardOver) {
      setIsValidCardDropTarget(false);
      setDragOverCardIndex(-1);
    }
  }, [isListOver, isDragging, isCardOver]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 10);
    }
  };

  const handleAddCard = (cardTitle) => {
    onAddCard(list.id, cardTitle);
    setCardTitle(""); // Clear the title for next card
    // Keep input active for continuous adding
    scrollToBottom();
  };

  const handleStartAdding = () => {
    // Cancel title editing if active
    if (isEditingTitle) {
      setIsEditingTitle(false);
      setEditingTitle(list.title);
    }
    onSetActiveInput(inputId);
    scrollToBottom();
  };

  const handleCancel = () => {
    onSetActiveInput(null);
    // Don't clear cardTitle here - retain the value
  };

  const handleTitleClick = () => {
    // Cancel card adding if active
    if (isAddingCard) {
      onSetActiveInput(null);
    }
    setIsEditingTitle(true);
    setEditingTitle(list.title);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === "End" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Cancel card adding if active
      if (isAddingCard) {
        onSetActiveInput(null);
      }
      setIsEditingTitle(true);
      setEditingTitle(list.title);
    }
  };

  const handleTitleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSaveTitle();
    } else if (event.key === "Escape") {
      handleCancelTitleEdit();
    }
  };

  const handleSaveTitle = () => {
    const trimmedTitle = editingTitle.trim();
    if (trimmedTitle && trimmedTitle !== list.title) {
      // Call parent callback to update the title
      if (onUpdateListTitle) {
        onUpdateListTitle(list.id, trimmedTitle);
      }
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setEditingTitle(list.title);
    setIsEditingTitle(false);
  };

  const handleTitleInputBlur = () => {
    handleSaveTitle();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteList(list.id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Focus the title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle click outside to close AddCard
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        taskListRef.current &&
        !taskListRef.current.contains(event.target) &&
        isAddingCard
      ) {
        onSetActiveInput(null);
        // Don't clear cardTitle - retain the value
      }
    };

    if (isAddingCard) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingCard, onSetActiveInput]);

  // Calculate visual styles
  const opacity = isDragging ? 0.3 : 1;
  const backgroundColor = isDragging
    ? "#e5e7eb" // Gray background when being dragged
    : isValidDropTarget
    ? "#dbeafe" // Light blue when this is a valid list drop target
    : isValidCardDropTarget
    ? "#f0f9ff" // Lighter blue when this is a valid card drop target
    : "#f8fafc"; // Default background

  const borderColor = isValidDropTarget
    ? "#3b82f6"
    : isValidCardDropTarget
    ? "#0ea5e9"
    : isDragging
    ? "#6b7280"
    : "#e2e8f0";

  const shadowStyle = isValidDropTarget
    ? "0 10px 25px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.1)"
    : isValidCardDropTarget
    ? "0 8px 20px -3px rgba(14, 165, 233, 0.2), 0 4px 6px -2px rgba(14, 165, 233, 0.05)"
    : isDragging
    ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";

  const transform = "none";
  const scale = isDragging ? "1.02" : "1.0";

  return (
    <>
      <div
        ref={(el) => {
          taskListRef.current = el;
          connectDragDrop(el);
        }}
        className="tw:w-72 tw:rounded-lg tw:p-2 tw:flex-shrink-0 tw:flex tw:flex-col tw:shadow-md tw:transition-all tw:duration-200 tw:ease-out tw:relative"
        style={{
          maxHeight: "100%",
          cursor: isDragging ? "grabbing" : "default",
          opacity,
          backgroundColor,
          border: `2px solid ${borderColor}`,
          boxShadow: shadowStyle,
          transform: `${transform} scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <div
          className="tw:flex tw:justify-between tw:items-center tw:px-2 tw:pt-1 tw:mb-2 tw:relative tw:z-10"
          style={{ backgroundColor: "#cbc3c3" }}
        >
          <div className="tw:flex tw:items-center tw:flex-1 tw:gap-1">
            {/* Drag handle */}
            <div
              className={`tw:flex-shrink-0 tw:p-1 tw:rounded tw:hover:bg-gray-300/70 tw:transition-colors tw:flex tw:items-center tw:justify-center ${
                isEditingTitle || isAddingCard || isUpdating
                  ? "tw:cursor-not-allowed tw:opacity-50"
                  : "tw:cursor-grab tw:active:cursor-grabbing"
              }`}
              title={
                isEditingTitle || isAddingCard
                  ? "Cannot drag while editing"
                  : isUpdating
                  ? "Updating order..."
                  : "Drag to reorder list"
              }
            >
              {isUpdating ? (
                <Loader2
                  size={14}
                  className="tw:text-gray-500 tw:animate-spin"
                />
              ) : (
                <GripVertical size={14} className="tw:text-gray-500" />
              )}
            </div>

            {/* Title area */}
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={handleTitleInputKeyDown}
                onBlur={handleTitleInputBlur}
                className="tw:font-semibold tw:text-gray-700 tw:bg-white tw:border tw:border-blue-300 tw:rounded tw:px-2 tw:py-1 tw:text-sm tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500 tw:flex-1"
                maxLength={50}
                aria-label="Edit list title"
              />
            ) : (
              <div
                className="tw:font-semibold tw:text-gray-700 tw:cursor-pointer tw:hover:bg-gray-200/50 tw:rounded tw:px-1 tw:py-1 tw:transition-colors tw:flex-1 tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500 tw:focus:bg-gray-200/50"
                onClick={handleTitleClick}
                onKeyDown={handleTitleKeyDown}
                tabIndex={0}
                role="button"
                aria-label={`Edit list title: ${list.title}. Press Enter, Space, or End key to edit.`}
                title="Click to edit or press Enter/Space/End key"
              >
                {list.title}
              </div>
            )}
          </div>

          <ListOptionsDropdown
            onDelete={handleDeleteClick}
            isDeleting={isDeleting}
          />
        </div>
        <div
          ref={scrollRef}
          className="tw:space-y-2 tw:overflow-y-auto tw:px-1 tw:pb-2 tw:flex-1 tw:relative tw:z-10"
          style={{ minHeight: 0 }}
        >
          {list.cards.map((card) => {
            // Calculate visual index for drop indicators
            // Use the current DOM structure to determine visual position
            let visualIndex = list.cards.indexOf(card);

            if (isValidCardDropTarget && scrollRef.current) {
              const cardElements =
                scrollRef.current.querySelectorAll("[data-card-id]");
              const cardIds = Array.from(cardElements).map((el) =>
                el.getAttribute("data-card-id")
              );
              const domIndex = cardIds.indexOf(card.id);
              if (domIndex !== -1) {
                visualIndex = domIndex;
              }
            }

            const showBeforeIndicator =
              dragOverCardIndex === visualIndex &&
              dragOverPosition === "before";
            const showAfterIndicator =
              dragOverCardIndex === visualIndex && dragOverPosition === "after";

            return (
              <div key={card.id} className="relative">
                {/* Drop indicator line - show before card */}
                {showBeforeIndicator && (
                  <div className="tw:h-0.5 tw:bg-blue-500 tw:rounded-full tw:mb-2 tw:mx-1 tw:opacity-80 tw:animate-pulse" />
                )}

                <TaskCard
                  card={card}
                  onUpdateCompletion={(completed) =>
                    onUpdateCardCompletion(list.id, card.id, completed)
                  }
                  onClick={onTaskClick}
                  listId={list.id}
                />

                {/* Drop indicator line - show after card */}
                {showAfterIndicator && (
                  <div className="tw:h-0.5 tw:bg-blue-500 tw:rounded-full tw:mt-2 tw:mx-1 tw:opacity-80 tw:animate-pulse" />
                )}
              </div>
            );
          })}

          {/* Drop indicator at the end of empty lists or after all cards */}
          {dragOverCardIndex === -1 && isValidCardDropTarget && (
            <div className="tw:h-0.5 tw:bg-blue-500 tw:rounded-full tw:mx-1 tw:opacity-80 tw:animate-pulse" />
          )}

          {isAddingCard && (
            <AddCard
              cardTitle={cardTitle}
              setCardTitle={setCardTitle}
              onAddCard={handleAddCard}
              onCancel={handleCancel}
            />
          )}
        </div>

        {!isAddingCard && (
          <div
            onClick={handleStartAdding}
            className="tw:w-full tw:cursor-pointer tw:text-left tw:mt-2 tw:p-2 tw:text-gray-500 tw:hover:bg-gray-300/70 tw:hover:text-gray-800 tw:rounded-lg tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-colors tw:mx-1 tw:relative tw:z-10"
            role="button"
          >
            <Plus size={16} /> Add a card
          </div>
        )}
      </div>

      <DeleteListModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        listName={list.title}
        taskCount={list.cards?.length || 0}
        isLoading={isDeleting}
      />
    </>
  );
};

export default TaskList;
