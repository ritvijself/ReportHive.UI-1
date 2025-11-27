import { useRef, useLayoutEffect } from "react";
import { X } from "lucide-react";

const AddCard = ({ cardTitle, setCardTitle, onAddCard, onCancel }) => {
  const textareaRef = useRef(null);

  const handleAddClick = () => {
    if (cardTitle.trim()) {
      onAddCard(cardTitle.trim());
      // Don't clear cardTitle here - it will be cleared in the parent component
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleAddClick();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  // Use useLayoutEffect for immediate, synchronous DOM updates (eliminates flicker)
  useLayoutEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      // Set cursor position to end of text
      const length = cardTitle.length;
      textarea.setSelectionRange(length, length);
    }
  }, [cardTitle]); // Runs when cardTitle changes (after clearing)

  return (
    <div className="tw:mt-1">
      <div className="tw:bg-white tw:rounded-md tw:p-2.5 tw:shadow-lg tw:border-b tw:border-gray-200">
        <textarea
          ref={textareaRef}
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="tw:w-full tw:p-0 tw:bg-transparent tw:resize-none tw:focus:outline-none tw:text-gray-800"
        />
      </div>
      <div className="tw:flex tw:items-center tw:gap-2 tw:mt-2">
        <div
          onClick={handleAddClick}
          className="tw:bg-blue-600 tw:cursor-pointer tw:text-white tw:px-4 tw:py-1.5 tw:rounded-md tw:text-sm tw:font-semibold tw:hover:bg-blue-700 tw:transition-colors"
        >
          Add card
        </div>
        <div
          onClick={onCancel}
          className="tw:p-1.5 tw:cursor-pointer tw:text-gray-500 tw:hover:text-gray-800 tw:hover:bg-gray-300 tw:rounded-md tw:transition-colors"
        >
          <X size={20} />
        </div>
      </div>
    </div>
  );
};

export default AddCard;
