import React, { useState } from "react";
import PropTypes from "prop-types";
import { Search, Edit } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LabelItem from "./LabelItem";

const LabelSearchList = ({
  labels,
  onToggleLabel,
  onEditLabel,
  onCreateNewLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Input
        type="text"
        placeholder="Search labels..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="tw:w-full tw:mb-4"
        icon={<Search size={16} />}
      />

      <div className="tw:space-y-2 tw:max-h-48 tw:overflow-y-auto tw:mb-4">
        {filteredLabels.length > 0 ? (
          filteredLabels.map((label) => (
            <LabelItem
              key={`${label.id}-${label.checked}`}
              label={label}
              onToggle={onToggleLabel}
              onEdit={onEditLabel}
            />
          ))
        ) : (
          <p className="tw:text-gray-500 tw:text-sm">No labels found.</p>
        )}
      </div>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onCreateNewLabel();
        }}
        variant="secondary"
        className="tw:w-full"
      >
        Create a new label
      </Button>
    </div>
  );
};

LabelSearchList.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      checked: PropTypes.bool, // Optional, for selection state
    })
  ).isRequired,
  onToggleLabel: PropTypes.func.isRequired,
  onEditLabel: PropTypes.func.isRequired,
  onCreateNewLabel: PropTypes.func.isRequired,
};

export default LabelSearchList;
