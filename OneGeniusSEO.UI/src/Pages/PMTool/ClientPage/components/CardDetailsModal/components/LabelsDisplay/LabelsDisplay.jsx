import React from "react";
import { TagIcon } from "lucide-react";

const LabelsDisplay = (props) => {
  const { labels } = props;

  if (labels?.length === 0) return null;

  return (
    <div className="tw:space tw:y-2">
      <div className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:flex tw:items-center tw:gap-2 tw:mb-2">
        {/* <TagIcon className="w-4 h-4" /> */}
        Labels
      </div>
      <div className="tw:flex tw:gap-2">
        {labels.map((label) => (
          <div
            key={label.id}
            className={`tw:px-3 tw:py-2 ${
              !label.color ? "tw:bg-gray-100" : ""
            } tw:rounded-sm tw:text-sm tw:font-medium tw:text-white tw:cursor-pointer`}
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelsDisplay;
