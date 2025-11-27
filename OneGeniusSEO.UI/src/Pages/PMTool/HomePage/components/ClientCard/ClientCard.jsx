import React, { useRef, useState, useEffect } from "react";

import {
  User,
  Link as LinkIcon,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  useTextOverflow,
  Dropdown,
  DropdownItem,
} from "@/components/ui";
import AddNewClientPopover from "../AddNewClientCard/components/AddNewClientPopover";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { decodeJWT } from "@/utils/JwtHelper";
const ClientCard = ({ client, onClick }) => {
  const textRef = useRef(null);
  const cardRef = useRef(null);
  const isOverflowing = useTextOverflow(textRef, client.name);
  const queryClient = useQueryClient();

  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [wasOpenedByKeyboard, setWasOpenedByKeyboard] = useState(false);

  const { website_url, name, project_manager } = client;
  const token = localStorage.getItem("token");
  const decodedToken = token ? decodeJWT(token) : null;
  const userId = decodedToken?.User_id || null;
  const { mutate: deleteClient, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`/api/clients/${client._id}`, {
        data: { user_id: userId }, // <-- Pass userId in body
      });
      return data;
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      // You might want to show a toast notification here
    },
    onSettled: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ["clients", userId] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
      }
    },
  });

  const handleDropdownEdit = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setWasOpenedByKeyboard(false); // Dropdown clicks are mouse interactions

    // Close all other dropdowns and popovers before opening this one
    window.dispatchEvent(
      new CustomEvent("closeAllDropdowns", {
        detail: { excludeCardId: client.id },
      })
    );

    setIsEditPopoverOpen(true);
  };

  const handleDropdownDelete = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setWasOpenedByKeyboard(false); // Dropdown clicks are mouse interactions
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteClient();
  };

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();

    // Close edit popover if it's open
    if (isEditPopoverOpen) {
      setIsEditPopoverOpen(false);
    }

    if (!isDropdownOpen) {
      // Close all other dropdowns before opening this one
      window.dispatchEvent(
        new CustomEvent("closeAllDropdowns", {
          detail: { excludeCardId: client.id },
        })
      );
    }

    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleDropdownToggle(e);
    }
  };

  // Focus management - return focus to card when popover/modal closes
  useEffect(() => {
    if (
      !isEditPopoverOpen &&
      !isDeleteModalOpen &&
      wasOpenedByKeyboard &&
      cardRef.current
    ) {
      cardRef.current.focus();
      setWasOpenedByKeyboard(false);
    }
  }, [isEditPopoverOpen, isDeleteModalOpen, wasOpenedByKeyboard]);

  // Listen for global dropdown close events
  useEffect(() => {
    const handleCloseDropdowns = (event) => {
      if (event.detail.excludeCardId !== client.id) {
        setIsDropdownOpen(false);
        // Also close edit popover when other dropdowns are opened
        setIsEditPopoverOpen(false);
      }
    };

    window.addEventListener("closeAllDropdowns", handleCloseDropdowns);

    return () => {
      window.removeEventListener("closeAllDropdowns", handleCloseDropdowns);
    };
  }, [client.id]);

  const gradients = [
    "tw:from-blue-500 tw:to-indigo-600",
    "tw:from-purple-500 tw:to-pink-600",
    "tw:from-green-400 tw:to-teal-500",
    "tw:from-yellow-400 tw:to-orange-500",
    "tw:from-red-500 tw:to-rose-600",
  ];
  // A simple way to pick a gradient based on client name length
  const gradientClass = gradients[client.name.length % gradients.length];

  const isCardActive = isEditPopoverOpen || isDeleteModalOpen;

  return (
    <div className="tw:relative">
      <div
        ref={cardRef}
        className={`tw:group tw:h-[162px] tw:rounded-md tw:overflow-hidden tw:bg-white tw:border tw:border-gray-200/80 tw:shadow-sm tw:hover:shadow-md tw:transition-shadow tw:duration-200 tw:ease-in-out tw:cursor-pointer tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-blue-500 tw:focus-visible:ring-offset-2 ${
          isCardActive && wasOpenedByKeyboard
            ? "tw:ring-2 tw:ring-blue-500 tw:ring-offset-2"
            : ""
        }`}
        onClick={onClick}
        onKeyDown={handleCardKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Open ${client.name} client details`}
      >
        {/* Three dots dropdown button */}
        <div className="tw:absolute tw:top-2 tw:right-2 tw:z-10">
          <Dropdown
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            position="bottom"
            trigger={
              <button
                className={`${
                  isDropdownOpen
                    ? "tw:opacity-100"
                    : "tw:opacity-0 tw:group-hover:opacity-100 tw:focus:opacity-100"
                } tw:cursor-pointer tw:transition-opacity tw:duration-200 tw:p-1.5 tw:rounded-md tw:bg-white/95 tw:hover:bg-white tw:shadow-sm tw:border tw:border-gray-200/70`}
                onClick={handleDropdownToggle}
                onKeyDown={handleDropdownKeyDown}
                aria-label={`More options for ${client.name}`}
              >
                <MoreHorizontal size={14} className="tw:text-gray-500" />
              </button>
            }
          >
            <DropdownItem
              onClick={handleDropdownEdit}
              icon={<Edit size={16} />}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              onClick={handleDropdownDelete}
              variant="danger"
              icon={<Trash2 size={16} />}
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>

        <div
          className={`tw:h-24 tw:w-full tw:bg-gradient-to-br ${gradientClass} tw:flex tw:items-end tw:p-3 tw:rounded-t-md`}
        >
          <Tooltip
            content={client.name}
            position="top"
            className="tw:w-full"
            disabled={!isOverflowing}
          >
            <h3
              ref={textRef}
              className="tw:font-bold tw:text-base tw:text-white tw:drop-shadow-md tw:w-full tw:line-clamp-3"
            >
              {name}
            </h3>
          </Tooltip>
        </div>
        <div className="tw:p-3 tw:space-y-2 tw:text-xs">
          {website_url ? (
            <div className="tw:flex tw:items-center tw:gap-2 tw:text-gray-600">
              <LinkIcon
                size={14}
                className="tw:text-gray-400 tw:flex-shrink-0"
              />
              <a
                href={website_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="tw:hover:text-blue-600 tw:truncate tw:no-underline tw:text-gray-600"
              >
                {website_url
                  ?.replace("https://www.", "")
                  .replace("https://", "")}
              </a>
            </div>
          ) : null}

          <div className="tw:flex tw:items-center tw:gap-2 tw:text-gray-600">
            <User size={14} className="tw:text-gray-400 tw:flex-shrink-0" />
            <span>
              {project_manager ||
                localStorage.getItem("username") ||
                "Alice Johnson"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Popover - positioned outside to avoid layout issues */}
      {isEditPopoverOpen && (
        <AddNewClientPopover
          isOpen={isEditPopoverOpen}
          setIsOpen={setIsEditPopoverOpen}
          clientData={client}
          isEditMode={true}
        >
          <div />
        </AddNewClientPopover>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          clientName={client.name}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ClientCard;
