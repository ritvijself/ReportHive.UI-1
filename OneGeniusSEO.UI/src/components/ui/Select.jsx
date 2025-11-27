import React from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select...",
  className = "",
  ...props
}) => {
  const selectClasses = `
    tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:border tw:border-gray-300 tw:rounded-[3px] 
    tw:focus:outline-none tw:focus:ring-1 tw:focus:ring-[#0c66e4] tw:focus:border-[#0c66e4]
    tw:transition-colors tw:duration-200 tw:appearance-none tw:pr-8
    ${
      disabled
        ? "tw:bg-gray-50 tw:text-gray-500 tw:cursor-not-allowed"
        : "tw:bg-white tw:cursor-pointer"
    }
    ${className}
  `.trim();

  return (
    <div className="tw:space-y-1">
      {label && (
        <label className="tw:block tw:text-xs tw:font-medium tw:text-gray-700">
          {label}
          {required && <span className="tw:text-red-500 tw:ml-1">*</span>}
        </label>
      )}
      <div className="tw:relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className={`tw:absolute tw:right-2 tw:top-1/2 tw:transform tw:-translate-y-1/2 tw:pointer-events-none ${
            disabled ? "tw:text-gray-400" : "tw:text-gray-600"
          }`}
        />
      </div>
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
