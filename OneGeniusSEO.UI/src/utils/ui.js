import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./common";

/**
 * Checks if an element is overflowing (content exceeds container bounds)
 * @param {HTMLElement|React.RefObject} elementOrRef - DOM element or React ref
 * @param {Object} options - Configuration options
 * @param {boolean} options.horizontal - Check horizontal overflow (default: false)
 * @param {boolean} options.vertical - Check vertical overflow (default: true)
 * @param {number} options.threshold - Overflow threshold in pixels (default: 0)
 * @returns {boolean} True if element is overflowing
 */
export const checkElementOverflow = (elementOrRef, options = {}) => {
  const { horizontal = false, vertical = true, threshold = 0 } = options;

  // Get the actual DOM element
  const element = elementOrRef?.current || elementOrRef;

  if (!element || typeof element.scrollHeight === "undefined") {
    return false;
  }

  let isOverflowing = false;

  if (vertical) {
    isOverflowing =
      isOverflowing || element.scrollHeight > element.clientHeight + threshold;
  }

  if (horizontal) {
    isOverflowing =
      isOverflowing || element.scrollWidth > element.clientWidth + threshold;
  }

  return isOverflowing;
};

/**
 * React hook to detect element overflow with automatic updates
 * @param {React.RefObject} ref - React ref to the element
 * @param {Array} dependencies - Dependencies to watch for changes (like content)
 * @param {Object} options - Configuration options
 * @param {boolean} options.horizontal - Check horizontal overflow (default: false)
 * @param {boolean} options.vertical - Check vertical overflow (default: true)
 * @param {number} options.threshold - Overflow threshold in pixels (default: 0)
 * @param {number} options.debounceMs - Debounce resize events (default: 100)
 * @returns {boolean} True if element is overflowing
 */
export const useOverflowDetection = (ref, dependencies = [], options = {}) => {
  const {
    horizontal = false,
    vertical = true,
    threshold = 0,
    debounceMs = 100,
  } = options;

  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    if (!ref.current) return;

    // Small timeout to ensure DOM has rendered
    setTimeout(() => {
      const overflow = checkElementOverflow(ref, {
        horizontal,
        vertical,
        threshold,
      });
      setIsOverflowing(overflow);
    }, 0);
  }, [ref, horizontal, vertical, threshold]);

  // Use our improved debounce hook for resize events
  const debouncedCheckOverflow = useDebounce(checkOverflow, debounceMs, [
    checkOverflow,
  ]);

  useEffect(() => {
    checkOverflow();
  }, dependencies);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", debouncedCheckOverflow);

    return () => {
      window.removeEventListener("resize", debouncedCheckOverflow);
      // Cancel any pending debounced calls on cleanup
      if (debouncedCheckOverflow.cancel) {
        debouncedCheckOverflow.cancel();
      }
    };
  }, [checkOverflow, debouncedCheckOverflow]);

  return isOverflowing;
};

/**
 * Simple hook for common text overflow detection (vertical only)
 * @param {React.RefObject} ref - React ref to the text element
 * @param {string} content - Text content to watch for changes
 * @returns {boolean} True if text is overflowing
 */
export const useTextOverflow = (ref, content) => {
  return useOverflowDetection(ref, [content], {
    vertical: true,
    horizontal: false,
  });
};

/**
 * Gets all focusable elements within a container element
 * @param {HTMLElement|React.RefObject} containerOrRef - Container element or React ref
 * @returns {NodeList} List of focusable elements
 */
export const getFocusableElements = (containerOrRef) => {
  // Get the actual DOM element
  const container = containerOrRef?.current || containerOrRef;

  if (!container) return [];

  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    "details[open] summary",
    "audio[controls]",
    "video[controls]",
  ];

  return container.querySelectorAll(focusableSelectors.join(", "));
};
