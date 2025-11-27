import React, { useEffect, useRef } from "react";
import { getFocusableElements } from "../../utils/ui";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
  titleId,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle keyboard events and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element before opening modal
    previousFocusRef.current = document.activeElement;

    // Focus the last focusable element (typically the primary action button)
    const focusableElements = getFocusableElements(modalRef);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Handle focus trapping with Tab key
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements(modalRef);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="tw:fixed tw:inset-0 tw:bg-gray-900/50 tw:bg-opacity-50 tw:flex tw:items-center tw:justify-center tw:z-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`tw:bg-white tw:rounded-lg tw:shadow-xl tw:w-96 tw:max-w-md tw:mx-4 tw:border tw:border-gray-200 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200">
            <div className="tw:flex tw:items-center tw:gap-3">
              <h3
                id={titleId}
                className="tw:text-lg tw:font-semibold tw:text-gray-900"
              >
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="tw:px-6 tw:py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="tw:px-6tw:py-4 tw:border-t tw:border-gray-200 tw:flex tw:justify-end tw:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
