import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Popover } from "react-tiny-popover";
import { Tag, X } from "lucide-react";
import ChipButton from "@/components/ui/ChipButton";
import LabelSearchList from "./LabelSearchList";
import LabelForm from "./LabelForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "@/Pages/PMTool/ClientPage/modules/LabelAPI";
import { useParams } from "react-router";

const LabelsPicker = ({ initialSelectedLabels = [], onSaveLabels }) => {
  const { clientId } = useParams();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [view, setView] = useState("list"); // 'list', 'create', or 'edit'
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState(initialSelectedLabels);

  const buttonRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: allLabels } = useQuery({
    queryKey: ["labels", clientId],
    queryFn: () => getLabels(clientId),
    enabled: Boolean(clientId),
  });

  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries(["labels", clientId]);
      setView("list");
    },
    onError: (error) => {
      console.error("Error creating label:", error);
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ labelId, labelData, clientId }) =>
      updateLabel({ labelId, labelData, clientId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["labels", clientId]);
      setView("list");
      setEditingLabelId(null);
    },
    onError: (error) => {
      console.error("Error updating label:", error);
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: ({ labelId, clientId }) => deleteLabel({ labelId, clientId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["labels", clientId]);
      setView("list");
      setEditingLabelId(null);
    },
    onError: (error) => {
      console.error("Error deleting label:", error);
    },
  });

  const handleToggleLabel = (labelId) => {
    setSelectedLabels((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (label) => label.id === labelId
      );
      let newSelected;
      if (isAlreadySelected) {
        newSelected = prevSelected.filter((label) => label.id !== labelId);
      } else {
        const labelToAdd = allLabels.find((label) => label.id === labelId);
        newSelected = labelToAdd ? [...prevSelected, labelToAdd] : prevSelected;
      }
      return newSelected;
    });
  };

  const handleEditLabel = (labelId) => {
    setEditingLabelId(labelId);
    setView("edit");
  };

  const handlePopoverClose = () => {
    console.log("Selection saved:", selectedLabels);
    onSaveLabels(selectedLabels.map((label) => label));
    setView("list"); // Always return to list view on close
    setEditingLabelId(null); // Clear any editing state
    setIsPopoverOpen(false);
  };

  const labelsWithCheckedState =
    allLabels?.map((label) => ({
      ...label,
      checked: selectedLabels.some((selected) => selected.id === label.id),
    })) || [];

  const editingLabel = allLabels?.find((label) => label.id === editingLabelId);

  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={["bottom", "left", "right"]}
      align="start"
      padding={10}
      reposition={true}
      onClickOutside={handlePopoverClose}
      containerStyle={{ zIndex: 99 }}
      content={
        <div className="tw:bg-white tw:rounded-lg tw:shadow-xl tw:border tw:border-gray-200 tw:p-4 tw:w-[292px] tw:z-[100]">
          {view === "list" && (
            <>
              <div className="tw:flex tw:justify-between tw:items-center tw:mb-4">
                <div className="tw:text-base tw:font-semibold tw:text-gray-800">
                  Labels
                </div>
                <button
                  onClick={handlePopoverClose}
                  className="tw:p-1 tw:rounded-sm tw:hover:bg-gray-100 tw:transition-colors tw:cursor-pointer"
                >
                  <X size={18} className="tw:text-gray-500" />
                </button>
              </div>
              <LabelSearchList
                labels={labelsWithCheckedState}
                onToggleLabel={handleToggleLabel}
                onEditLabel={handleEditLabel}
                onCreateNewLabel={() => setView("create")}
              />
            </>
          )}
          {view === "create" && (
            <LabelForm
              onBack={() => setView("list")}
              onClose={handlePopoverClose}
              onSubmit={(labelData) =>
                createLabelMutation.mutate({ ...labelData, clientId })
              }
              isLoading={createLabelMutation.isPending}
            />
          )}
          {view === "edit" && editingLabel && (
            <LabelForm
              initialLabel={editingLabel}
              onBack={() => setView("list")}
              onClose={() => setIsPopoverOpen(false)}
              onSubmit={({ id, ...labelData }) =>
                updateLabelMutation.mutate({ labelId: id, labelData, clientId })
              }
              onDelete={(labelIdFromForm) => {
                deleteLabelMutation.mutate({
                  labelId: labelIdFromForm,
                  clientId,
                });
              }}
              isLoading={updateLabelMutation.isPending}
              isDeleting={deleteLabelMutation.isPending}
            />
          )}
        </div>
      }
    >
      <ChipButton
        ref={buttonRef}
        onClick={() => {
          setIsPopoverOpen(!isPopoverOpen);
        }}
        // isActive={initialSelectedLabels.length > 0} // Active if task already has labels
        icon={Tag}
        className={`${
          isPopoverOpen
            ? "tw:bg-[#172b4d] tw:hover:bg-[#172b4d] tw:text-white tw:hover:text-white"
            : ""
        }`}
      >
        Labels
      </ChipButton>
    </Popover>
  );
};

LabelsPicker.propTypes = {
  initialSelectedLabels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ),
  onSaveLabels: PropTypes.func.isRequired,
};

export default LabelsPicker;
