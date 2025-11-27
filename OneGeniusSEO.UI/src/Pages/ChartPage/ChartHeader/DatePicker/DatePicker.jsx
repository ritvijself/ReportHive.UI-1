import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "/src/App.css";
import style from "./DatePicker.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DateRangePicker = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onDateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [customRangeEnabled, setCustomRangeEnabled] = useState(false);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - i);
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(selectedYear, i, 1);
      return {
        label: monthDate.toLocaleDateString("en-US", { month: "short" }),
        start: new Date(selectedYear, i, 1),
        end: new Date(selectedYear, i + 1, 0),
        index: i,
      };
    });
  };

  const years = generateYears();
  const months = generateMonths();

  // Initialize text display
  useEffect(() => {
    updateDisplay(initialStartDate, initialEndDate);
  }, [initialStartDate, initialEndDate]);

  const updateDisplay = (start, end) => {
    setDisplayText(
      `${start.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    );
  };

  const handleMonthToggle = (monthRange) => {
    let newSelection = [...selectedMonths];
    const exists = newSelection.find((m) => m.index === monthRange.index);

    if (exists) {
      // Deselect month
      newSelection = newSelection.filter((m) => m.index !== monthRange.index);
    } else {
      if (!customRangeEnabled) {
        // In normal mode → always replace with the newly clicked month
        newSelection = [monthRange];
      } else {
        // In custom mode → allow up to 3 consecutive months
        if (newSelection.length >= 3) {
          toast.warn("You can select a maximum of 3 consecutive months", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        newSelection.push(monthRange);
        newSelection.sort((a, b) => a.index - b.index);

        // Check if consecutive
        for (let i = 1; i < newSelection.length; i++) {
          if (newSelection[i].index !== newSelection[i - 1].index + 1) {
            toast.warn("Please select only consecutive months", {
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }
        }
      }
    }

    setSelectedMonths(newSelection);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setSelectedMonths([]);
  };

  const handleCustomToggle = () => {
    const newCustomState = !customRangeEnabled;
    setCustomRangeEnabled(newCustomState);
    setSelectedMonths([]);
    toast.info(
      newCustomState
        ? "You can select more than one month"
        : "Custom range mode disabled",
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const handleSubmit = () => {
    if (selectedMonths.length === 0) {
      toast.warn("Please select at least 1 month", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Sort by index to calculate proper range
    const sorted = [...selectedMonths].sort((a, b) => a.index - b.index);

    const start = sorted[0].start;
    const end = sorted[sorted.length - 1].end;

    updateDisplay(start, end);
    setIsOpen(false);

    onDateChange(start, end);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedMonths([]);
    updateDisplay(initialStartDate, initialEndDate);
  };

  return (
    <div style={{ position: "relative" }}>
      <div className={style.toasterMessage}>
        {" "}
        <ToastContainer />
      </div>
      <input
        type="text"
        value={displayText}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        className={style.date_picker_container}
      />

      {isOpen && (
        <div className={style.date_range_picker_modal}>
          <div className={style.year_selector}>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className={style.year_dropdown}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className={style.month_grid}>
            {months.map((monthRange) => (
              <div
                key={monthRange.index}
                className={`${style.month_item} ${
                  selectedMonths.some((m) => m.index === monthRange.index)
                    ? style.selected_month_item
                    : ""
                }`}
                onClick={() => handleMonthToggle(monthRange)}
              >
                {monthRange.label}
              </div>
            ))}
          </div>

          <div className={style.button_container}>
            {/* <button
              className={`${style.view_period_button} ${
                customRangeEnabled ? style.custom_enabled : ""
              }`}
              onClick={handleCustomToggle}
            >
              {customRangeEnabled ? "Disable Months Range" : "Custom Months"}
            </button> */}
            <button className={style.view_period_button} onClick={handleSubmit}>
              VIEW PERIOD
            </button>
            <button className={style.cancel_button} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
