import React from "react";
import PropTypes from "prop-types";

const ChipButton = React.forwardRef(
  (
    {
      onClick,
      isActive,
      icon: IconComponent,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`tw:cursor-pointer tw:flex tw:items-center tw:gap-2 tw:py-1 tw:px-1.5 tw:pr-2 tw:rounded-sm tw:text-sm tw:font-medium tw:transition-colors tw:border tw:border-[#091e4224] tw:text-[#626f86] tw:hover:border-[#091e4224] tw:hover:bg-[#091e420f] tw:hover:text-[#172b4d]
          ${
            isActive
              ? "tw:bg-blue-100 tw:text-blue-800 tw:hover:bg-blue-200"
              : ""
          }
          ${className}
        `}
        {...props}
      >
        {IconComponent && <IconComponent size={16} />}
        {children}
      </div>
    );
  }
);

ChipButton.displayName = "ChipButton";

ChipButton.propTypes = {
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ChipButton;
