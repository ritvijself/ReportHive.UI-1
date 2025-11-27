import React from "react";
import PropTypes from "prop-types";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      disabled = false,
      required = false,
      error = null,
      autoFocus = false,
      className = "",
      min,
      max,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const inputClasses = `
    tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:border tw:rounded-[3px]
    tw:focus:outline-none tw:focus:ring-1 tw:transition-colors tw:duration-200
    ${
      hasError
        ? "tw:border-red-500 tw:focus:ring-red-500 tw:focus:border-red-500"
        : "tw:border-gray-300 tw:focus:ring-[#0c66e4] tw:focus:border-[#0c66e4]"
    }
    ${
      disabled
        ? "tw:bg-gray-50 tw:text-gray-500 tw:cursor-not-allowed"
        : "tw:bg-white"
    }
    ${className}
  `.trim();

    return (
      <div className="tw:space-y-1">
        {label && (
          <label
            className={`tw:block tw:text-xs tw:font-medium ${
              hasError ? "tw:text-red-700" : "tw:text-gray-700"
            }`}
          >
            {label}
            {required && <span className="tw:text-red-500 tw:ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoFocus={autoFocus}
          className={inputClasses}
          min={min}
          max={max}
          {...props}
        />
        {hasError && (
          <div className="tw:text-red-600 tw:text-xs tw:mt-1">{error}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
};

export default Input;
