import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createList,
  updateList,
  deleteList,
  createTask,
  updateTask,
} from "../modules/ClientPageAPI";
import {
  mapListsToFrontend,
  mapNewListToFrontend,
  mapNewTaskToFrontend,
  mapCardToBackend,
  mapCardCompletionToBackend,
} from "../utils";

export const useListManagement = (clientId, serverLists, onListAdded) => {
  const queryClient = useQueryClient();
  const [lists, setLists] = useState([]);
  const dragTimeoutRef = useRef(null);
  const lastDragPositionRef = useRef(null);

  // Update local lists when server data changes
  useEffect(() => {
    setLists(mapListsToFrontend(serverLists));
  }, [serverLists]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // Mutation for creating lists
  const createListMutation = useMutation({
    mutationFn: (listData) => createList(clientId, listData),
    onSuccess: (response) => {
      // Update the query cache with the new list
      queryClient.setQueryData(["client", clientId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          lists: [
            ...(oldData.lists || []),
            {
              ...response.list,
              tasks: [], // New lists start with no tasks
            },
          ],
        };
      });

      // Update local state with properly mapped data
      const newList = mapNewListToFrontend(response.list);
      setLists((prevLists) => [...prevLists, newList]);

      // Trigger auto-scroll callback when a new list is added
      if (onListAdded) {
        onListAdded();
      }
    },
    onError: (error) => {
      console.error("Error creating list:", error);
    },
  });

  // Mutation for updating lists
  const updateListMutation = useMutation({
    mutationFn: ({ listId, listData, reorderData }) => {
      return updateList(listId, listData, reorderData);
    },
    onMutate: async ({ listId, listData, reorderData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["client", clientId]);

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["client", clientId]);
      const previousLists = [...lists];

      // If this is a reorder operation, update all lists optimistically
      if (reorderData) {
        const newLists = reorderData
          .map((item) => {
            const existingList = lists.find((list) => list.id === item.id);
            return existingList
              ? { ...existingList, position: item.position }
              : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.position - b.position);

        // Update local state immediately
        setLists(newLists);

        // Update query cache
        queryClient.setQueryData(["client", clientId], (old) => {
          if (!old) return old;
          return {
            ...old,
            lists: newLists.map((list) => ({
              ...list,
              name: list.title, // Backend format
              tasks:
                list.cards?.map((card) => ({
                  ...card,
                  isCompleted: card.completed,
                })) || [],
            })),
          };
        });
      } else {
        // Regular update (name change)
        queryClient.setQueryData(["client", clientId], (old) => {
          if (!old) return old;
          return {
            ...old,
            lists:
              old.lists?.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      name: listData.name,
                      position: listData.position,
                    }
                  : list
              ) || [],
          };
        });
      }

      return { previousData, previousLists, reorderData };
    },
    onError: (err, variables, context) => {
      console.error("Error updating list:", err);

      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["client", clientId], context.previousData);
      }

      if (context?.previousLists) {
        setLists(context.previousLists);
      }
    },
    onSuccess: () => {
      // Success - no toast needed
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(["client", clientId]);
    },
  });

  // Mutation for deleting lists
  const deleteListMutation = useMutation({
    mutationFn: (listId) => deleteList(listId),
    onMutate: async (listId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["client", clientId]);

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["client", clientId]);

      // Optimistically update the cache
      queryClient.setQueryData(["client", clientId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists?.filter((list) => list.id !== listId) || [],
        };
      });

      // Optimistically update local state
      setLists(
        (prevLists) => prevLists?.filter((list) => list.id !== listId) || []
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["client", clientId], context.previousData);
        setLists(mapListsToFrontend(context.previousData.lists));
      }
      console.error("Error deleting list:", err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["client", clientId]);
    },
  });

  // Mutation for creating tasks
  const createTaskMutation = useMutation({
    mutationFn: ({ listId, taskData }) => createTask(listId, taskData),
    onMutate: async ({ listId, taskData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["client", clientId]);

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["client", clientId]);

      // Generate optimistic task
      const optimisticTask = {
        id: `temp-${Date.now()}`,
        title: taskData.title,
        description: taskData.description || "",
        completed: false,
        position: taskData.position,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(["client", clientId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists:
            old.lists?.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    tasks: [
                      ...(list.tasks || []),
                      { ...optimisticTask, listId, clientId },
                    ],
                  }
                : list
            ) || [],
        };
      });

      // Optimistically update local state
      setLists(
        (prevLists) =>
          prevLists?.map((list) =>
            list.id === listId
              ? { ...list, cards: [...list.cards, optimisticTask] }
              : list
          ) || []
      );

      return { previousData, optimisticTask };
    },
    onSuccess: (response, { listId }, context) => {
      // Replace optimistic task with real task
      const realTask = mapNewTaskToFrontend(response.task);

      // Update the cache with real task
      queryClient.setQueryData(["client", clientId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists:
            old.lists?.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    tasks:
                      list.tasks?.map((task) =>
                        task.id === context.optimisticTask.id
                          ? { ...response.task }
                          : task
                      ) || [],
                  }
                : list
            ) || [],
        };
      });

      // Update local state with real task
      setLists(
        (prevLists) =>
          prevLists?.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === context.optimisticTask.id ? realTask : card
                  ),
                }
              : list
          ) || []
      );
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["client", clientId], context.previousData);
        setLists(mapListsToFrontend(context.previousData.lists));
      }
      console.error("Error creating task:", err);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) => updateTask(taskId, taskData),
    onMutate: async ({ taskId, taskData }) => {
      await queryClient.cancelQueries(["client", clientId]);
      const previousClientData = queryClient.getQueryData(["client", clientId]);

      queryClient.setQueryData(["client", clientId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists?.map((list) => ({
            ...list,
            tasks: list.tasks?.map((task) =>
              task.id === taskId ? { ...task, ...taskData } : task
            ),
          })),
        };
      });

      return { previousClientData };
    },
    onError: (err, variables, context) => {
      if (context.previousClientData) {
        queryClient.setQueryData(
          ["client", clientId],
          context.previousClientData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["client", clientId]);
    },
  });

  // Handler functions
  const handleAddList = useCallback(
    (title) => {
      createListMutation.mutate({
        name: title,
        position: lists.length, // Add at the end
      });
    },
    [createListMutation, lists.length]
  );

  const handleUpdateListTitle = useCallback(
    (listId, newTitle) => {
      updateListMutation.mutate({
        listId,
        listData: {
          name: newTitle, // Backend expects 'name'
          position: lists?.find((list) => list.id === listId)?.position || 0,
        },
      });
    },
    [updateListMutation, lists]
  );

  const handleDeleteList = useCallback(
    (listId) => {
      deleteListMutation.mutate(listId);
    },
    [deleteListMutation]
  );

  const handleAddCard = useCallback(
    (listId, cardTitle) => {
      const currentList = lists?.find((list) => list.id === listId);
      const taskData = mapCardToBackend(
        { title: cardTitle },
        currentList?.cards?.length || 0
      );

      createTaskMutation.mutate({ listId, taskData });
    },
    [lists, createTaskMutation]
  );

  const handleUpdateCardCompletion = useCallback(
    (listId, cardId, completed) => {
      // Find the current card to get its data
      const currentList = lists?.find((list) => list.id === listId);
      const currentCard = currentList?.cards?.find(
        (card) => card.id === cardId
      );

      if (currentCard) {
        // Map card data to backend format with updated completion status
        const taskData = mapCardCompletionToBackend({
          ...currentCard,
          completed,
        });

        updateTaskMutation.mutate({ taskId: cardId, taskData });
      }
    },
    [lists, updateTaskMutation]
  );

  const handleMoveList = useCallback(
    (draggedListId, targetListId) => {
      console.log("=== DRAG AND DROP DEBUG ===");
      console.log("Dragged List ID:", draggedListId);
      console.log("Target List ID:", targetListId);

      // Prevent duplicate moves
      const moveKey = `${draggedListId}-${targetListId}`;
      if (lastDragPositionRef.current === moveKey) {
        console.log("Duplicate move detected, ignoring");
        return;
      }
      lastDragPositionRef.current = moveKey;

      // Clear any existing timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Find current positions by ID (this ensures we're always working with current state)
      const dragIndex = lists.findIndex((list) => list.id === draggedListId);
      const targetIndex = lists.findIndex((list) => list.id === targetListId);

      console.log("Drag Index:", dragIndex);
      console.log("Target Index:", targetIndex);
      console.log(
        "Current lists:",
        lists.map((l) => ({ id: l.id, title: l.title, position: l.position }))
      );

      // Validate that both lists exist and positions are different
      if (dragIndex === -1 || targetIndex === -1 || dragIndex === targetIndex) {
        console.log("Invalid move - returning early");
        lastDragPositionRef.current = null;
        return;
      }

      const draggedList = lists[dragIndex];
      if (!draggedList) {
        lastDragPositionRef.current = null;
        return;
      }

      // Calculate the correct insertion position
      const insertIndex = targetIndex;

      console.log("Insert Index:", insertIndex);

      // Immediately update local state with the new arrangement
      const newLists = [...lists];
      newLists.splice(dragIndex, 1);
      newLists.splice(insertIndex, 0, draggedList);

      // Update positions for all affected lists
      const updatedLists = newLists.map((list, index) => ({
        ...list,
        position: index,
      }));

      console.log(
        "New arrangement:",
        updatedLists.map((l) => ({
          id: l.id,
          title: l.title,
          position: l.position,
        }))
      );

      setLists(updatedLists);

      // Debounce the API call to prevent rapid successive calls
      dragTimeoutRef.current = setTimeout(() => {
        // Make backend API call with the target position and full reorder data
        updateListMutation.mutate({
          listId: draggedListId,
          listData: {
            name: draggedList.title, // Backend expects 'name'
            position: insertIndex,
          },
          reorderData: updatedLists.map((list) => ({
            id: list.id,
            position: list.position,
          })),
        });

        // Clear the last position after successful API call
        lastDragPositionRef.current = null;
      }, 300); // 300ms debounce

      console.log("=== END DEBUG ===");
    },
    [lists, updateListMutation]
  );

  const handleMoveCard = useCallback(
    (cardId, sourceListId, targetListId, dropPosition = null) => {
      console.log("=== CARD MOVE DEBUG ===");
      console.log("Card ID:", cardId);
      console.log("Source List ID:", sourceListId);
      console.log("Target List ID:", targetListId);
      console.log("Drop Position:", dropPosition);

      // Find the card in the source list
      const sourceList = lists.find((list) => list.id === sourceListId);
      const card = sourceList?.cards.find((card) => card.id === cardId);

      if (!card) {
        console.log("Card not found, aborting move");
        return;
      }

      const targetList = lists.find((list) => list.id === targetListId);
      if (!targetList) {
        console.log("Target list not found, aborting move");
        return;
      }

      // Calculate new position for the card
      let newPosition;
      if (sourceListId === targetListId) {
        // Same list reordering
        const currentPosition = sourceList.cards.findIndex(
          (c) => c.id === cardId
        );

        if (dropPosition !== null) {
          newPosition = dropPosition;
        } else {
          // Default to current position if no specific drop position
          newPosition = currentPosition;
        }

        // If the new position is the same as current, don't do anything
        if (newPosition === currentPosition) {
          console.log("Same position, ignoring move");
          return;
        }
      } else {
        // Moving to different list
        newPosition =
          dropPosition !== null ? dropPosition : targetList.cards.length;
      }

      console.log("New Position:", newPosition);

      // Optimistically update local state
      setLists((prevLists) => {
        return prevLists.map((list) => {
          if (list.id === sourceListId) {
            if (sourceListId === targetListId) {
              // Same list reordering
              const updatedCards = [...list.cards];
              const currentIndex = updatedCards.findIndex(
                (c) => c.id === cardId
              );

              // Remove card from current position
              const [movedCard] = updatedCards.splice(currentIndex, 1);

              // Insert at new position
              updatedCards.splice(newPosition, 0, movedCard);

              // Update positions for all cards
              const reorderedCards = updatedCards.map((card, index) => ({
                ...card,
                position: index,
              }));

              return {
                ...list,
                cards: reorderedCards,
              };
            } else {
              // Remove card from source list (different list move)
              return {
                ...list,
                cards: list.cards.filter((c) => c.id !== cardId),
              };
            }
          } else if (
            list.id === targetListId &&
            sourceListId !== targetListId
          ) {
            // Add card to target list (different list move)
            const updatedCards = [...list.cards];
            updatedCards.splice(newPosition, 0, {
              ...card,
              position: newPosition,
            });

            // Update positions for all cards after insertion
            const reorderedCards = updatedCards.map((card, index) => ({
              ...card,
              position: index,
            }));

            return {
              ...list,
              cards: reorderedCards,
            };
          }
          return list;
        });
      });

      // Update the task in the backend
      const taskData = {
        listId: targetListId,
        position: newPosition,
        // Keep other card properties
        title: card.title,
        description: card.description || "",
        isCompleted: card.completed || false,
        startDate: card.startDate || null,
        dueDate: card.dueDate || null,
      };

      updateTaskMutation.mutate(
        { taskId: cardId, taskData },
        {
          onSuccess: () => {
            console.log("Card move successful");
            // Invalidate queries to ensure data consistency
            queryClient.invalidateQueries(["client", clientId]);
          },
          onError: (error) => {
            console.error("Card move failed:", error);
            // Revert optimistic update on error
            setLists((prevLists) => {
              return prevLists.map((list) => {
                if (sourceListId === targetListId) {
                  // Revert same-list reordering
                  const revertedCards = list.cards.map((c) =>
                    c.id === cardId ? card : c
                  );
                  return { ...list, cards: revertedCards };
                } else {
                  if (list.id === targetListId) {
                    // Remove card from target list
                    return {
                      ...list,
                      cards: list.cards.filter((c) => c.id !== cardId),
                    };
                  } else if (list.id === sourceListId) {
                    // Add card back to source list
                    return {
                      ...list,
                      cards: [...list.cards, card],
                    };
                  }
                }
                return list;
              });
            });
          },
        }
      );

      console.log("=== END CARD MOVE DEBUG ===");
    },
    [lists, updateTaskMutation, queryClient, clientId]
  );

  return {
    lists,
    setLists,
    handleAddList,
    handleUpdateListTitle,
    handleDeleteList,
    handleAddCard,
    handleUpdateCardCompletion,
    handleMoveList,
    handleMoveCard, // Add the new handler
    isCreating: createListMutation.isPending,
    isUpdating: updateListMutation.isPending,
    isDeleting: deleteListMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
  };
};
