import React from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, CheckIcon, FileTextIcon } from "lucide-react";

// Components
import { Modal, RichTextEditor } from "@/components/ui";
import EditableTitle from "./components/EditableTitle";
import DatePicker from "./components/DatePicker";
import TaskDateDisplay from "./components/TaskDateDisplay";
import LabelsDisplay from "./components/LabelsDisplay";
import LabelsPicker from "./components/LabelsPicker";
import ChecklistPicker from "./components/ChecklistPicker";
import ChecklistDisplay from "./components/ChecklistDisplay";
import api from "@/utils/api";
import {
  getChecklistsByTask,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../../modules/ChecklistAPI";

import CardDetailsModalWrapper from "./CardDetailsModalWrapper";

const CardDetailsModal = ({ onClose }) => {
  const decodeJWT = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  // Get token and decode it inside the component
  const getTokenData = () => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? decodeJWT(token) : null;
    return {
      token,
      decodedToken,
      userId: decodedToken?.User_id || null,
    };
  };

  const { token, decodedToken, userId } = getTokenData();

  const { taskId, clientId } = useParams();
  const queryClient = useQueryClient();

  console.debug("CardDetailsModal mounted", { taskId, clientId, userId });

  // Fetch task details from backend
  const {
    data: taskData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["task", taskId, userId],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${taskId}`, {
        params: { user_id: userId },
      });
      return response.data;
    },
    enabled: Boolean(taskId && userId),
  });

  // Fetch checklists for the task
  const { data: checklists = [], isLoading: isChecklistsLoading } = useQuery({
    queryKey: ["checklists", taskId],
    queryFn: () => getChecklistsByTask(taskId),
    enabled: Boolean(taskId),
  });

  // Mutation to update task
  const updateTaskMutation = useMutation({
    mutationFn: async (updates) => {
      const params = { user_id: userId, ...updates };
      console.debug("updateTaskMutation.mutationFn called", {
        taskId,
        updates,
      });

      const response = await api.put(`/api/tasks/${taskId}`, params);
      console.debug("updateTaskMutation response", response);
      return response.data;
    },
    onMutate: async (newUpdate) => {
      console.debug("updateTaskMutation.onMutate", { taskId, newUpdate, task });
      await queryClient.cancelQueries(["task", taskId]);
      await queryClient.cancelQueries(["client", task.clientId]);

      const previousTask = queryClient.getQueryData(["task", taskId]);
      const previousClientData = queryClient.getQueryData([
        "client",
        task.clientId,
      ]);

      queryClient.setQueryData(["task", taskId], (old) => ({
        ...old,
        task: { ...old?.task, ...newUpdate },
      }));

      queryClient.setQueryData(["client", task.clientId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists?.map((list) => ({
            ...list,
            tasks: list.tasks?.map((t) =>
              t.id === taskId ? { ...t, ...newUpdate } : t
            ),
          })),
        };
      });

      return { previousTask, previousClientData };
    },
    onError: (err, newUpdate, context) => {
      queryClient.setQueryData(["task", taskId], context.previousTask);
      queryClient.setQueryData(
        ["client", task.clientId],
        context.previousClientData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["task", taskId]);
      queryClient.invalidateQueries(["client", task.clientId]);
    },
  });

  // Checklist mutations
  const createChecklistMutation = useMutation({
    mutationFn: (title) => createChecklist(taskId, title),
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const updateChecklistMutation = useMutation({
    mutationFn: ({ checklistId, title }) => updateChecklist(checklistId, title),
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: deleteChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const createChecklistItemMutation = useMutation({
    mutationFn: ({ checklistId, title }) =>
      createChecklistItem(checklistId, title),
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const updateChecklistItemMutation = useMutation({
    mutationFn: ({ itemId, updates }) => updateChecklistItem(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const deleteChecklistItemMutation = useMutation({
    mutationFn: deleteChecklistItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["checklists", taskId]);
    },
  });

  const task = taskData?.task;

  // Get the list name from cached client data
  const getListName = () => {
    if (!task?.listId) return "Selected List";

    const clientData = queryClient.getQueryData(["client", clientId]);
    const list = clientData?.lists?.find((list) => list.id === task.listId);
    return list?.name || "Selected List";
  };

  const handleTitleSave = (newTitle) => {
    if (newTitle.trim() && newTitle !== task.title) {
      updateTaskMutation.mutate({ title: newTitle.trim() });
    }
  };

  const handleCompletionToggle = () => {
    updateTaskMutation.mutate({
      isCompleted: !task.isCompleted,
    });
  };

  const handleDateSave = (startDate, dueDate) => {
    const toUTCDate = (date) => {
      if (!date) return null;
      const adjustedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      return adjustedDate.toISOString();
    };

    updateTaskMutation.mutate({
      startDate: toUTCDate(startDate),
      dueDate: toUTCDate(dueDate),
    });
  };

  const handleDateRemove = () => {
    updateTaskMutation.mutate({
      startDate: null,
      dueDate: null,
    });
  };

  const handleLabelsSave = (labelIds) => {
    updateTaskMutation.mutate({ labelIds });
  };

  // Checklist handlers
  const handleCreateChecklist = async (title) => {
    await createChecklistMutation.mutateAsync(title);
  };

  const handleUpdateChecklist = async (checklistId, title) => {
    await updateChecklistMutation.mutateAsync({ checklistId, title });
  };

  const handleDeleteChecklist = async (checklistId) => {
    await deleteChecklistMutation.mutateAsync(checklistId);
  };

  const handleCreateChecklistItem = async (checklistId, title) => {
    await createChecklistItemMutation.mutateAsync({ checklistId, title });
  };

  const handleDeleteChecklistItem = async (checklistId, itemId) => {
    await deleteChecklistItemMutation.mutateAsync(itemId);
  };

  const handleUpdateChecklistItem = async (itemId, updates) => {
    await updateChecklistItemMutation.mutateAsync({ itemId, updates });
  };

  const handleToggleChecklistItem = async (itemId, isCompleted, title) => {
    await updateChecklistItemMutation.mutateAsync({
      itemId,
      updates: { title, isCompleted },
    });
  };

  if (!taskId) return null;

  return (
    <CardDetailsModalWrapper onClose={onClose}>
      {/* Header */}
      <div className="tw:flex tw:items-center tw:justify-between tw:py-2 tw:px-6 tw:border-b tw:border-gray-200">
        <div className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:py-1 tw:px-2 tw:rounded-sm tw:cursor-not-allowed tw:bg-gray-200">
          <div className="tw:flex tw:items-center tw:gap-0.5">
            <span>{getListName()}</span>
            <ChevronDownIcon className="tw:w-4 tw:h-4" />
          </div>
        </div>
        <div
          onClick={onClose}
          className="tw:p-2 tw:hover:bg-gray-100 tw:cursor-pointer tw:rounded-sm tw:transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="tw:w-5 tw:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="tw:flex-1 tw:overflow-y-auto tw:p-6">
        {isLoading ? (
          <div className="tw:flex tw:items-center tw:justify-center tw:py-12">
            <div className="tw:animate-spin tw:rounded-full tw:h-8 tw:w-8 tw:border-b-2 tw:border-blue-600"></div>
            <span className="tw:ml-3 tw:text-gray-600">
              Loading task details...
            </span>
          </div>
        ) : error ? (
          <div className="tw:py-8 tw:text-center">
            <div className="tw:w-16 tw:h-16 tw:mx-auto tw:mb-4 tw:bg-red-100 tw:rounded-full tw:flex tw:items-center tw:justify-center">
              <svg
                className="tw:w-8 tw:h-8 tw:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="tw:text-lg tw:font-semibold tw:text-red-600 tw:mb-2">
              Error Loading Task
            </div>
            <p className="tw:text-gray-600">
              {error?.message ||
                "Unable to load task details. Please try again."}
            </p>
          </div>
        ) : task ? (
          <div className="tw:space-y-6">
            {/* Task Title with Checkbox */}
            <div>
              <div className="tw:flex tw:items-start tw:gap-3 tw:mb-2">
                {/* Completion Checkbox */}
                <div
                  onClick={handleCompletionToggle}
                  disabled={updateTaskMutation.isPending}
                  className={`tw:mt-1 tw:w-5 tw:h-5 tw:rounded-full tw:border-2 tw:flex tw:items-center tw:justify-center tw:transition-all tw:duration-200 ${
                    task.isCompleted
                      ? "tw:bg-green-600 tw:border-green-600 tw:text-white"
                      : "tw:border-gray-300 tw:hover:border-gray-400"
                  } ${
                    updateTaskMutation.isPending
                      ? "tw:opacity-50 tw:cursor-not-allowed"
                      : "tw:cursor-pointer"
                  }`}
                >
                  {task.isCompleted && (
                    <CheckIcon className="tw:w-3 tw:h-3" strokeWidth={3} />
                  )}
                </div>

                {/* Editable Title */}
                <div className="tw:flex-1">
                  <EditableTitle
                    initialTitle={task.title}
                    onSave={handleTitleSave}
                    isCompleted={task.isCompleted}
                    isLoading={updateTaskMutation.isPending}
                  />
                </div>
              </div>
            </div>

            <div className="tw:flex tw:items-start tw:gap-2">
              {/* Labels Picker */}
              <LabelsPicker
                initialSelectedLabels={task.labels}
                onSaveLabels={handleLabelsSave}
                clientId={clientId}
              />

              {/* Date Picker */}
              <DatePicker
                initialStartDate={task.startDate}
                initialDueDate={task.dueDate}
                onSave={handleDateSave}
                onRemove={handleDateRemove}
              />

              {/* Checklist Picker */}
              <ChecklistPicker onCreateChecklist={handleCreateChecklist} />
            </div>

            <div className="tw:flex tw:gap-4">
              {/* Display labels */}
              <LabelsDisplay labels={task.labels} />

              {/* Display dates */}
              {(task.startDate || task.dueDate) && (
                <TaskDateDisplay
                  startDate={task.startDate}
                  dueDate={task.dueDate}
                  onSave={handleDateSave}
                  onRemove={handleDateRemove}
                />
              )}
            </div>

            {/* Display Task Description */}
            <div>
              <div className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:mb-3 tw:flex tw:items-center tw:gap-2">
                <FileTextIcon className="tw:w-4 tw:h-4" />
                Description
              </div>
              <RichTextEditor
                value={task.description}
                onSave={(value) => {
                  updateTaskMutation.mutate({ description: value });
                }}
              />
            </div>

            {/* Display Checklist */}
            {!isChecklistsLoading && checklists.length > 0 && (
              <ChecklistDisplay
                checklist={checklists}
                onDeleteChecklistItem={handleDeleteChecklistItem}
                onDeleteChecklist={handleDeleteChecklist}
                onUpdateChecklistItem={handleUpdateChecklistItem}
                onToggleChecklistItem={handleToggleChecklistItem}
                onCreateChecklistItem={handleCreateChecklistItem}
                onUpdateChecklist={handleUpdateChecklist}
              />
            )}

            {/* Additional Details */}
            {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Created
                </h4>
                <p className="text-sm text-gray-900">
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Last Updated
                </h4>
                <p className="text-sm text-gray-900">
                  {task.updatedAt
                    ? new Date(task.updatedAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="tw:py-8 tw:text-center">
            <div className="tw:w-16 tw:h-16 tw:mx-auto tw:mb-4 tw:bg-gray-100 tw:rounded-full tw:flex tw:items-center tw:justify-center">
              <svg
                className="tw:w-8 tw:h-8 tw:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="tw:text-lg tw:font-semibold tw:text-gray-700 tw:mb-2">
              Task Not Found
            </div>
            <p className="tw:text-gray-600">
              The requested task could not be found.
            </p>
          </div>
        )}
      </div>
    </CardDetailsModalWrapper>
  );
};

export default CardDetailsModal;

CardDetailsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
