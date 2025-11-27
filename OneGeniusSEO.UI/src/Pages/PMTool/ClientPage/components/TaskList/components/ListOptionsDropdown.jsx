import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui";

const ListOptionsDropdown = ({ onDelete, isDeleting }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
  };

  const trigger = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="tw:p-1.5 tw:text-gray-500 tw:cursor-pointer tw:hover:text-gray-800 tw:hover:bg-gray-300/70 tw:rounded-md tw:transition-colors"
      disabled={isDeleting}
      aria-label="List options"
    >
      <MoreHorizontal size={18} />
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      position="bottom"
    >
      <DropdownItem
        onClick={handleDelete}
        variant="danger"
        icon={<Trash2 size={16} />}
      >
        Delete list
      </DropdownItem>
    </Dropdown>
  );
};

export default ListOptionsDropdown;
