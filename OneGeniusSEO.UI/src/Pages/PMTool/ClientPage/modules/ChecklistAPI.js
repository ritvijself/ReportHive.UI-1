import api from "@/utils/api";
import { decodeJWT } from "@/utils/JwtHelper";

const token = localStorage.getItem("token");
const decodedToken = token ? decodeJWT(token) : null;
const userId = decodedToken?.User_id || null;

// Checklist CRUD operations
export const getChecklistsByTask = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}/checklists`, {
    params: { userId: userId }, // Changed from user_id to userId
  });
  return response.data;
};

export const createChecklist = async (taskId, title) => {
  const response = await api.post("/api/checklists", {
    taskId,
    title,
    user_id: userId, // Added user_id
  });
  return response.data;
};

export const updateChecklist = async (checklistId, title) => {
  const response = await api.put(`/api/checklists/${checklistId}`, {
    title,
    user_id: userId, // Added user_id
  });
  return response.data;
};

export const deleteChecklist = async (checklistId) => {
  const response = await api.delete(`/api/checklists/${checklistId}`, {
    data: { user_id: userId }, // Added user_id in request body
  });
  return response.data;
};

// Checklist Item CRUD operations
export const createChecklistItem = async (checklistId, title) => {
  const response = await api.post(`/api/checklists/${checklistId}/items`, {
    checklistId,
    title,
    user_id: userId, // Added user_id
  });
  return response.data;
};

export const updateChecklistItem = async (itemId, { title, isCompleted }) => {
  const response = await api.put(`/api/checklists/items/${itemId}`, {
    title,
    is_completed: isCompleted,
    user_id: userId, // Added user_id
  });
  return response.data;
};

export const deleteChecklistItem = async (itemId) => {
  const response = await api.delete(`/api/checklists/items/${itemId}`, {
    data: { user_id: userId }, // Added user_id in request body
  });
  return response.data;
};
