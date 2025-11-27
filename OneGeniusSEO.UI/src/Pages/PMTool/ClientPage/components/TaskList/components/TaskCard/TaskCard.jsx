import React, { useState, useRef } from "react";
import { useDrag } from "react-dnd";
import { DND_TYPES } from "../../../../constants";

const TaskCard = ({ card, listId, onUpdateCompletion, onClick = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const checkboxRef = useRef(null);
  const cardRef = useRef(null);
  const isCompleted = card.completed || false;

  // Drag setup
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.CARD,
    item: () => ({
      type: DND_TYPES.CARD,
      id: card.id,
      cardId: card.id,
      listId: listId,
      title: card.title,
      originalListId: listId,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Allow dragging
    canDrag: true,
  });

  // Connect drag ref
  React.useEffect(() => {
    if (cardRef.current) {
      drag(cardRef.current);
    }
  }, [drag]);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onUpdateCompletion(!isCompleted);
  };

  const handleCheckboxKeyDown = (e) => {
    // Activate with Space or Enter key
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onUpdateCompletion(!isCompleted);
    }
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on checkbox area
    if (checkboxRef.current && checkboxRef.current.contains(e.target)) {
      return;
    }
    onClick(card);
  };

  const handleCheckboxMouseEnter = () => {
    setIsCheckboxHovered(true);
    updateTooltipPosition();
  };

  const handleCheckboxMouseLeave = () => {
    setIsCheckboxHovered(false);
  };

  const updateTooltipPosition = () => {
    if (checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 35, // 35px above the checkbox
        left: rect.left + rect.width / 2, // Center horizontally
      });
    }
  };

  const showTooltip = isCheckboxHovered;
  const showCheckbox = isHovered || isCompleted;

  return (
    <>
      <div
        ref={cardRef}
        className={`
          tw:bg-white tw:hover:bg-gray-50 tw:rounded-md tw:p-2.5 tw:shadow-sm tw:border-b tw:border-gray-200 
          tw:text-sm tw:text-gray-800 tw:cursor-pointer tw:hover:shadow-md tw:transition-all tw:duration-200 
          tw:group tw:relative
          ${
            isDragging
              ? "tw:opacity-50 tw:transform tw:rotate-2 tw:shadow-lg"
              : ""
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Task: ${card.title}. ${
          isCompleted ? "Completed" : "Not completed"
        }`}
        onKeyDown={(e) => {
          // Allow focusing the checkbox with Tab, but don't activate the card
          if (e.key === "Tab") {
            return; // Let default tab behavior work
          }
          // Handle Enter and Space for card click
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e);
          }
        }}
        onClick={handleCardClick}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        data-card-id={card.id}
      >
        <div className="tw:flex tw:items-start tw:relative">
          {/* Checkbox - positioned absolutely to not take space initially */}
          <div
            ref={checkboxRef}
            className={`
              tw:absolute tw:left-0 tw:top-1 tw:z-10
              tw:w-4 tw:h-4 tw:rounded-full tw:border-2 tw:flex tw:items-center tw:justify-center tw:cursor-pointer
              tw:transition-all tw:duration-300 tw:ease-out
              ${
                isCompleted
                  ? "tw:bg-green-500 tw:border-green-500"
                  : showCheckbox
                  ? "tw:border-gray-400 tw:bg-white tw:hover:border-gray-500"
                  : "tw:border-transparent tw:bg-transparent"
              }
              ${
                showCheckbox
                  ? "tw:opacity-100 tw:transform tw:scale-100"
                  : "tw:opacity-0 tw:transform tw:scale-75"
              }
              ${""}
            `}
            onClick={handleCheckboxClick}
            onKeyDown={handleCheckboxKeyDown}
            onMouseEnter={handleCheckboxMouseEnter}
            onMouseLeave={handleCheckboxMouseLeave}
            tabIndex={showCheckbox ? 0 : -1}
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={`${isCompleted ? "Unmark" : "Mark"} task as complete: ${
              card.title
            }`}
          >
            {/* Checkmark icon */}
            {isCompleted && (
              <svg
                className="tw:w-2.5 tw:h-2.5 tw:text-white tw:animate-in tw:zoom-in tw:duration-150"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Card content - shifts right when checkbox appears */}
          <div
            className={`
            tw:whitespace-pre-wrap tw:break-words tw:leading-relaxed tw:w-full tw:transition-all tw:duration-300 tw:ease-out
            ${
              isCompleted
                ? "tw:text-gray-500 tw:opacity-75"
                : "tw:text-gray-800"
            }
            ${showCheckbox ? "tw:ml-6" : "tw:ml-0"}
          `}
          >
            {card.title}
          </div>
        </div>
      </div>

      {/* Tooltip - positioned with fixed positioning to avoid overflow clipping */}
      {showTooltip && !isDragging && (
        <div
          className="tw:fixed tw:bg-gray-900 tw:text-white tw:text-xs tw:px-2 tw:py-1 tw:rounded tw:shadow-lg tw:whitespace-nowrap tw:z-50 tw:transform tw:-translate-x-1/2 tw:pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          {isCompleted ? "Mark incomplete" : "Mark complete"}
          <div className="tw:absolute tw:top-full tw:left-1/2 tw:transform tw:-translate-x-1/2 tw:w-0 tw:h-0 tw:border-l-2 tw:border-r-2 tw:border-t-2 tw:border-transparent tw:border-t-gray-900"></div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
