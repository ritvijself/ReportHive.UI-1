/**
 * Maps backend list data to frontend format
 * Backend: { name, tasks } → Frontend: { title, cards }
 */
export const mapListsToFrontend = (serverLists) => {
  return (
    serverLists?.map((list) => ({
      id: list.id,
      title: list.name, // Backend uses 'name', frontend expects 'title'
      cards:
        list.tasks?.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.isCompleted || false, // Map backend isCompleted to frontend completed
          position: task.position,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })) || [], // Backend uses 'tasks', frontend expects 'cards'
      position: list.position,
      createdAt: list.createdAt,
      clientId: list.clientId,
    })) || []
  );
};

/**
 * Maps new list response to frontend format
 */
export const mapNewListToFrontend = (listResponse) => ({
  id: listResponse.id,
  title: listResponse.name,
  cards: [],
  position: listResponse.position,
  createdAt: listResponse.createdAt,
  clientId: listResponse.clientId,
});

/**
 * Maps new task response to frontend card format
 * Backend: { id, title, description, listId, clientId, position, isCompleted, createdAt, updatedAt }
 * Frontend: { id, title, description, completed, position, createdAt, updatedAt }
 */
export const mapNewTaskToFrontend = (taskResponse) => ({
  id: taskResponse.id,
  title: taskResponse.title,
  description: taskResponse.description || "",
  completed: taskResponse.isCompleted || false, // Map backend isCompleted to frontend completed
  position: taskResponse.position,
  createdAt: taskResponse.createdAt,
  updatedAt: taskResponse.updatedAt,
});

/**
 * Maps frontend card data to backend task format for creation
 * Frontend: { title, description? } → Backend: { title, description, position }
 */
export const mapCardToBackend = (cardData, position = 0) => ({
  title: cardData.title,
  description: cardData.description || "",
  position: position,
});

/**
 * Maps frontend card completion update to backend task format
 * Frontend: { completed } → Backend: { isCompleted }
 */
export const mapCardCompletionToBackend = (cardData) => ({
  title: cardData.title,
  description: cardData.description || "",
  position: cardData.position,
  isCompleted: cardData.completed,
});
