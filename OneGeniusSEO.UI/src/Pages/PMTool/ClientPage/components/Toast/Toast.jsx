import { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="tw:h-5 tw:w-5 tw:text-green-500" />,
    error: <AlertCircle className="tw:h-5 tw:w-5 tw:text-red-500" />,
    info: <AlertCircle className="tw:h-5 tw:w-5 tw:text-blue-500" />,
  };

  const bgColors = {
    success: "tw:bg-green-50 tw:border-green-200",
    error: "tw:bg-red-50 tw:border-red-200",
    info: "tw:bg-blue-50 tw:border-blue-200",
  };

  return (
    <div
      className={`tw:fixed tw:top-4 tw:right-4 tw:z-50 tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-3 tw:rounded-lg tw:border tw:shadow-lg tw:transition-all tw:duration-300 ${bgColors[type]}`}
    >
      {icons[type]}
      <span className="tw:text-sm tw:font-medium tw:text-gray-800">
        {message}
      </span>
      <button
        onClick={onClose}
        className="tw:ml-2 tw:text-gray-400 tw:hover:text-gray-600 tw:transition-colors"
      >
        <X className="tw:h-4 tw:w-4" />
      </button>
    </div>
  );
};

export default Toast;
