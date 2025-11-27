import api from "@/utils/api";

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

const token = localStorage.getItem("token");
const decodedToken = token ? decodeJWT(token) : null;
const userId = decodedToken?.User_id || null;

const getClientById = async (clientId) => {
  const response = await api.get(`/api/clients/${clientId}`);
  return response.data;
};

const createList = async (clientId, listData) => {
  const payload = {
    ...listData,
    user_id: userId, // ✅ add userId here
  };

  const response = await api.post(
    `/api/lists/clients/${clientId}/lists`,
    payload
  );

  return response.data;
};

const updateList = async (listId, listData, reorderData) => {
  const payload = { ...listData, user_id: userId };
  if (reorderData) {
    payload.reorderData = reorderData;
  }
  const response = await api.put(`/api/lists/${listId}`, payload);
  return response.data;
};

const deleteList = async (listId) => {
  const response = await api.delete(`/api/lists/${listId}`, {
    data: { user_id: userId }, // <-- body goes here
  });
  return response.data;
};

const createTask = async (listId, taskData) => {
  const payload = { ...taskData, user_id: userId };
  const response = await api.post(`/api/tasks/lists/${listId}/tasks`, payload);
  return response.data;
};

const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/api/tasks/${taskId}`, taskData);
  return response.data;
};

export {
  getClientById,
  createList,
  updateList,
  deleteList,
  createTask,
  updateTask,
};
