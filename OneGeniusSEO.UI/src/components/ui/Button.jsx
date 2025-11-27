import React from "react";
import PropTypes from "prop-types";
import { LoaderCircle } from "lucide-react";

const Button = (props) => {
  const { onClick, variant, children, isLoading, isCompact, style } = props;

  const buttonClasses = `tw:cursor-pointer tw:rounded-[3px] tw:text-sm tw:font-medium tw:transition-colors tw:duration-200 ${
    isCompact ? "tw:px-[8px] tw:py-[4px]" : "tw:px-[12px] tw:py-[6px]"
  } ${
    variant === "primary"
      ? "tw:bg-[#0c66e4] tw:hover:bg-[#0055cc] tw:text-white"
      : variant === "secondary"
      ? "tw:bg-gray-200 tw:hover:bg-gray-300 tw:text-gray-800"
      : variant === "plain"
      ? "tw:bg-transparent tw:text-gray-800 tw:hover:bg-gray-200"
      : variant === "danger"
      ? "tw:bg-red-600 tw:hover:bg-red-700 tw:text-white"
      : "tw:bg-gray-500 tw:text-white"
  }`;

  return (
    <div className={buttonClasses} onClick={onClick} style={style}>
      <span className="tw:flex tw:items-center tw:justify-center tw:gap-1">
        {isLoading ? <LoaderCircle className="tw:animate-spin" /> : children}
      </span>
    </div>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  isCompact: PropTypes.bool,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  children: PropTypes.node.isRequired,
};

export default Button;
