import React, { useState } from "react";
import PropTypes from "prop-types";
import { format, isValid, parseISO } from "date-fns";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import DatePickerPopover from "../DatePicker"; // Renamed from DatePicker

const TaskDateDisplay = ({
  startDate,
  dueDate,
  onSave,
  onRemove,
  className = "",
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const hasStartDate = startDate && isValid(parseISO(startDate));
  const hasDueDate = dueDate && isValid(parseISO(dueDate));

  let displayHeading = "";
  let displayText = "";

  if (hasStartDate && hasDueDate) {
    displayHeading = "Dates";
    displayText = `${format(parseISO(startDate), "MMM dd")} - ${format(
      parseISO(dueDate),
      "MMM dd"
    )}`;
  } else if (hasStartDate) {
    displayHeading = "Start date";
    displayText = format(parseISO(startDate), "MMM dd");
  } else if (hasDueDate) {
    displayHeading = "Due date";
    displayText = format(parseISO(dueDate), "MMM dd");
  } else {
    return null; // Should not render if no dates are set
  }

  return (
    <div className={`tw:space-y-2 ${className}`}>
      <div className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:flex tw:items-center tw:gap-2">
        {/* <ClockIcon className="w-4 h-4" /> */}
        {displayHeading}
      </div>
      <DatePickerPopover
        initialStartDate={startDate}
        initialDueDate={dueDate}
        onSave={onSave}
        onRemove={onRemove}
        isPopoverOpen={isPopoverOpen}
        setIsPopoverOpen={setIsPopoverOpen}
      >
        <div
          onClick={() => setIsPopoverOpen(true)}
          className="tw:relative tw:flex tw:items-center tw:justify-between tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-gray-100 tw:rounded-md tw:cursor-pointer tw:hover:bg-gray-200 tw:transition-colors tw:duration-200 tw:group"
        >
          <span>{displayText}</span>
          <ChevronRightIcon className="tw:w-4 tw:h-4 tw:text-gray-500 tw:group-hover:translate-x-0.5 tw:transition-transform" />
          {/* Overlay for hover effect */}
          <div className="tw:absolute tw:inset-0 tw:bg-black tw:opacity-0 tw:group-hover:opacity-5 tw:transition-opacity tw:rounded-md"></div>
        </div>
      </DatePickerPopover>
    </div>
  );
};

TaskDateDisplay.propTypes = {
  startDate: PropTypes.string,
  dueDate: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TaskDateDisplay;
