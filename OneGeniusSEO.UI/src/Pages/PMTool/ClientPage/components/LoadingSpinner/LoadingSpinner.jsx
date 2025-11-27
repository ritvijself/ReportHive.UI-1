import React from "react";

const LoadingSpinner = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "tw:h-4 tw:w-4",
    medium: "tw:h-6 tw:w-6",
    large: "tw:h-8 tw:w-8",
  };

  return (
    <div
      className={`tw:inline-block tw:animate-spin tw:rounded-full tw:border-2 tw:border-solid tw:border-current tw:border-r-transparent tw:align-[-0.125em] tw:motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
    >
      <span className="!tw:absolute !tw:-m-px !tw:h-px !tw:w-px !tw:overflow-hidden !tw:whitespace-nowrap !tw:border-0 !tw:p-0 !tw:[clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
