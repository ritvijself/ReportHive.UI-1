import React, { useState, useRef } from "react";
import { Popover, ArrowContainer } from "react-tiny-popover";

const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
  disabled = false,
  showArrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !content) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Map our position prop to react-tiny-popover positions
  const getPopoverPositions = () => {
    switch (position) {
      case "top":
        return ["top", "bottom"];
      case "bottom":
        return ["bottom", "top"];
      case "left":
        return ["left", "right"];
      case "right":
        return ["right", "left"];
      default:
        return ["top", "bottom"];
    }
  };

  return (
    <Popover
      isOpen={isVisible && !disabled && !!content}
      positions={getPopoverPositions()}
      padding={8}
      reposition={true}
      content={({ position, childRect, popoverRect }) => {
        const tooltipContent = (
          <div
            className="tw:px-2 tw:py-1.5 tw:text-xs tw:font-medium tw:text-white tw:bg-gray-700 tw:rounded tw:shadow-lg tw:pointer-events-none tw:transition-all tw:duration-200 tw:ease-in-out"
            style={{
              maxWidth: "200px",
              wordWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            {content}
          </div>
        );

        return showArrow ? (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowColor="#374151" // gray-700
            arrowSize={6}
          >
            {tooltipContent}
          </ArrowContainer>
        ) : (
          tooltipContent
        );
      }}
    >
      <div
        className={`tw:inline-block ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
    </Popover>
  );
};

export default Tooltip;
