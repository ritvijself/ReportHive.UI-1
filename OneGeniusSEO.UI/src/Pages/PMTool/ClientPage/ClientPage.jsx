import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  TaskList,
  AddList,
  ClientPageSkeleton,
  DragLayer,
  CardDetailsModal,
} from "./components";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "./modules/ClientPageAPI";
import { useListManagement, useDragScroll } from "./hooks";

const ClientPage = () => {
  const { clientId, taskId } = useParams();
  const navigate = useNavigate();
  const [activeInput, setActiveInput] = useState(null);

  // Check if we're on a task route (modal should be open)
  const isTaskModalOpen = Boolean(taskId);

  // Fetch client data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId),
  });

  const client = data?.client;
  const serverLists = data?.lists;

  // Custom hooks for separated concerns
  const {
    scrollContainerRef,
    isDragging,
    hasScroll,
    checkScrollability,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    triggerAutoScroll,
  } = useDragScroll();

  const {
    lists,
    handleAddList,
    handleUpdateListTitle,
    handleDeleteList,
    handleAddCard,
    handleUpdateCardCompletion,
    handleMoveList,
    handleMoveCard, // Add the new handler
    isDeleting,
    isUpdating,
  } = useListManagement(clientId, serverLists, triggerAutoScroll);

  // Only check scrollability when lists change (not auto-scroll)
  useEffect(() => {
    setTimeout(checkScrollability, 100);
  }, [lists?.length, checkScrollability]);

  const handleSetActiveInput = (inputId) => {
    setActiveInput(inputId);
  };

  // Handle task card click - navigate to task route
  const handleTaskCardClick = (task) => {
    navigate(`task/${task.id}`);
  };

  // Handle modal close - navigate back to client page
  const handleModalClose = () => {
    navigate(`/pmtool/clients/${clientId}`);
  };

  // Modal will handle its own data fetching based on taskId from URL

  // Show loading skeleton
  if (isLoading) {
    return <ClientPageSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <main className="tw:px-4 tw:py-8 tw:sm:px-6 tw:lg:px-12 tw:flex-grow">
        <div className="tw:max-w-7xl tw:mx-auto">
          <div className="tw:text-2xl tw:font-bold tw:text-red-600">
            Error Loading Client
          </div>
          <p className="tw:text-gray-600 tw:mt-2">
            {error?.message ||
              "Something went wrong while loading the client data."}
          </p>
        </div>
      </main>
    );
  }

  // Show not found state
  if (!client) {
    return (
      <main className="tw:px-4 tw:py-8 tw:sm:px-6 tw:lg:px-12 tw:flex-grow">
        <div className="tw:max-w-7xl tw:mx-auto">
          <div className="tw:text-2xl tw:font-bold tw:text-red-600">
            Client Not Found
          </div>
        </div>
      </main>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="tw:flex-grow tw:flex tw:flex-col "
        style={{ height: "calc(100vh - 55px)" }}
      >
        <div className="tw:p-4">
          <div className="tw:text-2xl tw:font-bold  tw:drop-shadow-md">
            {client.name}
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="tw:flex-1 tw:p-4 tw:pb-8 tw:flex tw:items-start tw:gap-4 tw:overflow-x-auto tw:select-none"
          style={{
            height: "calc(100% - 80px)",
            cursor: hasScroll ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {lists?.map((list) => (
            <TaskList
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onUpdateCardCompletion={handleUpdateCardCompletion}
              onTaskClick={handleTaskCardClick}
              activeInput={activeInput}
              onSetActiveInput={handleSetActiveInput}
              onUpdateListTitle={handleUpdateListTitle}
              onDeleteList={handleDeleteList}
              onMoveList={handleMoveList}
              onMoveCard={handleMoveCard} // Pass the card move handler
              isDeleting={isDeleting}
              isUpdating={isUpdating}
            />
          ))}

          <AddList
            onAddList={handleAddList}
            hasNoList={lists?.length === 0}
            activeInput={activeInput}
            onSetActiveInput={handleSetActiveInput}
          />
        </div>
      </div>
      <DragLayer />
      {isTaskModalOpen && <CardDetailsModal onClose={handleModalClose} />}
    </DndProvider>
  );
};

export default ClientPage;
