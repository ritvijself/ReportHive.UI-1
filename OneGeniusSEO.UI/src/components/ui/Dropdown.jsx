import React, { useState, useRef, useEffect } from "react";
import { Popover } from "react-tiny-popover";

const Dropdown = ({
  trigger,
  children,
  isOpen,
  onOpenChange,
  position = "bottom",
  className = "",
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef(null);

  const controlled = isOpen !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const setOpen = controlled ? onOpenChange : setInternalOpen;

  const positions = {
    bottom: ["bottom", "top"],
    top: ["top", "bottom"],
    left: ["left", "right"],
    right: ["right", "left"],
  };

  const handleClose = () => {
    setOpen(false);
    setFocusedIndex(0);
  };

  const childrenArray = React.Children.toArray(children);
  const validChildren = childrenArray.filter(
    (child) => React.isValidElement(child) && child.type === DropdownItem
  );

  useEffect(() => {
    if (open && validChildren.length > 0) {
      // Use a small delay to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.focus();
        }
      }, 10);

      // Reset focus to first item
      setFocusedIndex(0);

      return () => clearTimeout(timer);
    }
  }, [open, validChildren.length]);

  const handleKeyDown = (e) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = (prev + 1) % validChildren.length;
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex =
            (prev - 1 + validChildren.length) % validChildren.length;
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (validChildren[focusedIndex]) {
          const child = validChildren[focusedIndex];
          if (child.props.onClick) {
            child.props.onClick(e);
          }
          handleClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  };

  return (
    <Popover
      isOpen={open}
      positions={positions[position]}
      onClickOutside={handleClose}
      padding={8}
      reposition={true}
      containerStyle={{ zIndex: 1000 }}
      content={
        <div
          ref={dropdownRef}
          className={`tw:bg-white tw:border tw:border-gray-200 tw:rounded-md tw:shadow-md py-2 tw:min-w-[160px] ${className}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child) && child.type === DropdownItem) {
              return React.cloneElement(child, {
                key: index,
                onClick: (e) => {
                  if (child.props.onClick) {
                    child.props.onClick(e);
                  }
                  handleClose();
                },
                focused: index === focusedIndex,
                onMouseEnter: () => setFocusedIndex(index),
              });
            }
            return child;
          })}
        </div>
      }
      {...props}
    >
      <div>{trigger}</div>
    </Popover>
  );
};

const DropdownItem = ({
  children,
  onClick,
  className = "",
  variant = "default",
  icon,
  focused = false,
  onMouseEnter,
  ...props
}) => {
  const baseClasses =
    "tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2.5 tw:text-sm tw:cursor-pointer tw:transition-colors tw:duration-150 tw:outline-none";
  const variantClasses = {
    default: "tw:text-gray-700 tw:hover:bg-gray-50",
    danger: "tw:text-red-600 tw:hover:bg-red-50",
  };

  const focusedClasses = focused ? "tw:bg-gray-100" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${focusedClasses} ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      {...props}
    >
      {icon && (
        <span className="tw:w-4 tw:h-4 tw:flex-shrink-0 tw:flex tw:items-center tw:justify-center">
          {icon}
        </span>
      )}
      <span className="tw:flex-1">{children}</span>
    </div>
  );
};

export { Dropdown, DropdownItem };
export default Dropdown;
