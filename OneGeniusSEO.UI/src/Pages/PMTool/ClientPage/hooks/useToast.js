import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now() + Math.random();
      const toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message, duration) => {
      return addToast(message, "success", duration);
    },
    [addToast]
  );

  const showError = useCallback(
    (message, duration) => {
      return addToast(message, "error", duration);
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message, duration) => {
      return addToast(message, "info", duration);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
  };
};
