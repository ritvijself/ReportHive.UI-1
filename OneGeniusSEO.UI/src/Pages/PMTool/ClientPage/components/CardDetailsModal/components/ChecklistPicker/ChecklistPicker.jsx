import React, { useState } from "react";
import { ChipButton } from "@/components/ui";
import { CheckSquare } from "lucide-react";
import AddChecklistPopover from "./AddChecklistPopover";

const ChecklistPicker = ({ onCreateChecklist }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <AddChecklistPopover
      isOpen={isPopoverOpen}
      onClose={() => setIsPopoverOpen(false)}
      onCreateChecklist={onCreateChecklist}
    >
      <ChipButton
        onClick={() => {
          setIsPopoverOpen(!isPopoverOpen);
        }}
        // isActive={isDateSet}
        icon={CheckSquare}
        className={`${
          isPopoverOpen
            ? "tw:bg-[#172b4d] tw:hover:bg-[#172b4d] tw:text-white tw:hover:text-white"
            : ""
        }`}
      >
        Checklist
      </ChipButton>
    </AddChecklistPopover>
  );
};

export default ChecklistPicker;
