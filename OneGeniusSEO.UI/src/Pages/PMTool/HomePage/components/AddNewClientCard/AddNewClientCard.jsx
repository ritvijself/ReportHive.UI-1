import { Plus } from "lucide-react";
import AddNewClientPopover from "./components/AddNewClientPopover";
import { useState, useRef, useEffect } from "react";

const AddNewClientCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const [wasOpenedByKeyboard, setWasOpenedByKeyboard] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setWasOpenedByKeyboard(true);
      handleToggle();
    }
  };

  const handleClick = () => {
    setWasOpenedByKeyboard(false);
    handleToggle();
  };

  // Focus management - return focus to card when popover closes
  useEffect(() => {
    if (!isOpen && wasOpenedByKeyboard && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isOpen, wasOpenedByKeyboard]);

  return (
    <AddNewClientPopover isOpen={isOpen} setIsOpen={setIsOpen}>
      <div
        ref={cardRef}
        className={`tw:group tw:h-[162px] tw:rounded-xl tw:overflow-hidden tw:bg-white tw:border tw:border-gray-200/80 tw:transform tw:transition-all tw:duration-300 tw:ease-in-out tw:cursor-pointer tw:select-none ${
          isOpen ? "tw:shadow-lg" : "tw:shadow-sm tw:hover:shadow-lg"
        } tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-blue-500 tw:focus-visible:ring-offset-2 ${
          isOpen && wasOpenedByKeyboard
            ? "tw:ring-2 tw:ring-blue-500 tw:ring-offset-2"
            : ""
        }`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Add a new client"
        aria-expanded={isOpen}
      >
        <div
          className={`tw:h-full tw:w-full tw:bg-gradient-to-br tw:from-gray-100 tw:to-gray-200 tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-gray-500 tw:transition-colors tw:duration-300 tw:select-none ${
            isOpen ? "tw:text-gray-700" : "tw:hover:text-gray-700"
          }`}
        >
          <Plus size={24} />
          <p className="tw:mt-2 tw:font-semibold tw:text-sm tw:select-none">
            Add a New Client
          </p>
        </div>
      </div>
    </AddNewClientPopover>
  );
};

export default AddNewClientCard;
