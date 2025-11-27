import { useCallback, useRef, useEffect, useState } from "react";
import { z } from "zod";

/**
 * Creates a debounced version of a function
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Object} options - Additional options
 * @param {boolean} options.leading - Execute on the leading edge (default: false)
 * @param {boolean} options.trailing - Execute on the trailing edge (default: true)
 * @param {number} options.maxWait - Maximum time to wait before execution
 * @returns {Function} The debounced function with cancel and flush methods
 */
export const debounce = (func, delay, options = {}) => {
  const { leading = false, trailing = true, maxWait } = options;

  let timeoutId;
  let maxTimeoutId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let lastArgs;
  let lastThis;
  let result;

  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time) => {
    timeoutId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  };

  const cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastThis = lastCallTime = timeoutId = maxTimeoutId = undefined;
  };

  const flush = () => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  const pending = () => {
    return timeoutId !== undefined;
  };

  const debounced = function (...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  };

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
};

/**
 * Creates a throttled version of a function
 * @param {Function} func - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @param {Object} options - Additional options
 * @returns {Function} The throttled function
 */
export const throttle = (func, delay, options = {}) => {
  return debounce(func, delay, {
    leading: true,
    trailing: true,
    maxWait: delay,
    ...options,
  });
};

/**
 * React hook for debouncing a callback function
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Array} dependencies - Dependencies array (like useCallback)
 * @param {Object} options - Debounce options
 * @returns {Function} The debounced callback with cancel and flush methods
 */
export const useDebounce = (
  callback,
  delay,
  dependencies = [],
  options = {}
) => {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function
  const debouncedCallback = useCallback(() => {
    if (debouncedRef.current) {
      debouncedRef.current.cancel();
    }

    debouncedRef.current = debounce(
      (...args) => callbackRef.current(...args),
      delay,
      options
    );

    return debouncedRef.current;
  }, [delay, options.leading, options.trailing, options.maxWait]);

  // Update debounced function when dependencies change
  const memoizedDebouncedCallback = useCallback(
    debouncedCallback(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedCallback, ...dependencies]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedRef.current) {
        debouncedRef.current.cancel();
      }
    };
  }, []);

  return memoizedDebouncedCallback;
};

/**
 * React hook for debouncing a value
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {*} The debounced value
 */
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Validates a URL format with comprehensive domain checking
 * @param {string} url - The URL to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateURL = (url) => {
  if (!url || url.trim() === "") {
    return null; // URL is optional, so empty is valid
  }

  const trimmedUrl = url.trim();

  // Define comprehensive URL schema with Zod
  const urlSchema = z
    .string()
    .url({
      message: "Please enter a valid URL",
    })
    .refine(
      (val) => {
        try {
          const urlObj = new URL(val);

          // Check if URL starts with http:// or https://
          if (!val.startsWith("http://") && !val.startsWith("https://")) {
            return false;
          }

          // Check for valid domain structure
          const hostname = urlObj.hostname.toLowerCase();

          // Must have at least one dot (domain.tld)
          if (!hostname.includes(".")) {
            return false;
          }

          // Extract TLD from hostname
          const parts = hostname.split(".");
          const tld = parts[parts.length - 1];

          // Check if TLD exists and is not empty
          if (!tld || tld.length === 0) {
            return false;
          }

          // Additional checks for domain structure
          // Must have at least domain.tld (minimum 2 parts)
          if (parts.length < 2) {
            return false;
          }

          // Each part must not be empty and contain valid characters
          for (const part of parts) {
            if (!part || part.length === 0) {
              return false;
            }
            // Domain parts can contain letters, numbers, and hyphens
            // But cannot start or end with hyphen
            if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
              return false;
            }
          }

          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          "Please enter a valid URL with a proper domain (e.g., https://example.com)",
      }
    );

  try {
    urlSchema.parse(trimmedUrl);
    return null; // Valid URL
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first validation error message
      return error.errors[0]?.message || "Please enter a valid URL";
    }
    return "Please enter a valid URL";
  }
};
