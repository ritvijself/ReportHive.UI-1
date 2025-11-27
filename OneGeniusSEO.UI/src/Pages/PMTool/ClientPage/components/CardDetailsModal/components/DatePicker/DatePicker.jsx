import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./DatePicker.css";
import { Popover } from "react-tiny-popover";
import { Clock, X } from "lucide-react";
import { format, isValid, parseISO, isBefore } from "date-fns";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ChipButton from "@/components/ui/ChipButton";

const CustomDatePicker = ({
  initialStartDate,
  initialDueDate,
  onSave,
  children,
  onRemove,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [dueDateError, setDueDateError] = useState(null);

  const buttonRef = useRef(null);

  // Get today's date in YYYY-MM-DD format for minimum date validation
  const today = format(new Date(), "yyyy-MM-dd");
  const todayDate = new Date().setHours(0, 0, 0, 0);

  useEffect(() => {
    if (initialStartDate && isValid(parseISO(initialStartDate))) {
      setStartDate(parseISO(initialStartDate));
    } else {
      setStartDate(null);
    }

    if (initialDueDate && isValid(parseISO(initialDueDate))) {
      setDueDate(parseISO(initialDueDate));
    } else {
      // If no initial due date, set to current date and enable by default
      setDueDate(new Date());
    }
  }, [initialStartDate, initialDueDate]);

  // Validation function for past dates only
  const validatePastDates = (startDateToCheck, dueDateToCheck) => {
    let startError = null;
    let dueError = null;

    // Check if start date is in the past
    if (startDateToCheck && isBefore(startDateToCheck, todayDate)) {
      startError = "Start date cannot be in the past";
    }

    // Check if due date is in the past
    if (dueDateToCheck && isBefore(dueDateToCheck, todayDate)) {
      dueError = "Due date cannot be in the past";
    }

    setStartDateError(startError);
    setDueDateError(dueError);

    return !startError && !dueError;
  };

  // Check if there are any validation errors
  const hasValidationErrors = startDateError || dueDateError;

  const handleSave = () => {
    if (!startDate && !dueDate) {
      setIsPopoverOpen(false);
      return;
    }

    // Run validation before saving (only for past dates)
    const isValid = validatePastDates(startDate, dueDate);
    if (!isValid) {
      return; // Don't save if validation fails
    }

    onSave(startDate, dueDate);
    setIsPopoverOpen(false);
  };

  const handleRemove = () => {
    onRemove();
    setStartDateError(null);
    setDueDateError(null);
    setIsPopoverOpen(false);
  };

  const handleManualStartDateChange = (e) => {
    const date = parseISO(e.target.value);
    if (isValid(date)) {
      // If start date is after due date, reset due date
      if (dueDate && date > dueDate) {
        setDueDate(null);
        setDueDateError(null);
      }

      setStartDate(date);
      // Only validate for past dates
      setTimeout(() => validatePastDates(date, dueDate), 0);
    } else {
      setStartDate(null);
      setStartDateError(null);
    }
  };

  const handleManualDueDateChange = (e) => {
    const date = parseISO(e.target.value);
    if (isValid(date)) {
      // If due date is before start date, reset start date
      if (startDate && date < startDate) {
        setStartDate(null);
        setStartDateError(null);
      }

      setDueDate(date);
      // Only validate for past dates
      setTimeout(() => validatePastDates(startDate, date), 0);
    } else {
      setDueDate(null);
      setDueDateError(null);
    }
  };

  const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const formattedDueDate = dueDate ? format(dueDate, "yyyy-MM-dd") : "";

  // Calculate minimum date for due date input
  const minDueDate = startDate ? format(startDate, "yyyy-MM-dd") : today;

  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={["bottom", "left", "right"]}
      align="start"
      padding={10}
      reposition={true}
      onClickOutside={() => setIsPopoverOpen(false)}
      containerStyle={{ zIndex: 99 }}
      content={
        <div
          className="tw:bg-white tw:rounded-lg tw:shadow-xl tw:border tw:border-gray-200 tw:p-4 tw:w-[292px] tw:z-[100]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tw:flex tw:justify-between tw:items-center tw:mb-4">
            <div className="tw:text-base tw:font-semibold tw:text-gray-800">
              Dates
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="tw:p-1 tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:cursor-pointer"
            >
              <X size={18} className="tw:text-gray-500" />
            </button>
          </div>
          <div className="tw:mt-4 tw:space-y-3">
            <div>
              <label
                htmlFor="startDateInput"
                className="tw:block tw:text-xs tw:font-medium tw:text-gray-700 tw:mb-1"
              >
                Start Date
              </label>
              <Input
                type="date"
                id="startDateInput"
                value={formattedStartDate}
                onChange={handleManualStartDateChange}
                min={today}
                error={startDateError}
                className="tw:w-auto tw:px-2 tw:py-1.5 tw:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dueDateInput"
                className="tw:block tw:text-xs tw:font-medium tw:text-gray-700 tw:mb-1"
              >
                Due Date
              </label>
              <Input
                type="date"
                id="dueDateInput"
                value={formattedDueDate}
                onChange={handleManualDueDateChange}
                min={minDueDate}
                error={dueDateError}
                className="tw:w-auto tw:px-2 tw:py-1.5 tw:text-sm"
              />
            </div>
          </div>
          <div className="tw:mt-4 tw:flex tw:justify-end tw:gap-2">
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={hasValidationErrors}
              className={
                hasValidationErrors ? "tw:opacity-50 tw:cursor-not-allowed" : ""
              }
            >
              Save
            </Button>
            <Button onClick={handleRemove} variant="secondary">
              Remove
            </Button>
          </div>
        </div>
      }
    >
      {children ? (
        children
      ) : (
        <ChipButton
          ref={buttonRef}
          onClick={() => {
            setIsPopoverOpen(!isPopoverOpen);
          }}
          // isActive={isDateSet}
          icon={Clock}
          className={`${
            isPopoverOpen
              ? "tw:bg-[#172b4d] tw:hover:bg-[#172b4d] tw:text-white tw:hover:text-white"
              : ""
          }`}
        >
          Dates
        </ChipButton>
      )}
    </Popover>
  );
};

CustomDatePicker.propTypes = {
  initialStartDate: PropTypes.string,
  initialDueDate: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default CustomDatePicker;
