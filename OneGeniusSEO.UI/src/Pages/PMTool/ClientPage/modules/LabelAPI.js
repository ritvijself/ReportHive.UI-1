import api from "@/utils/api";

// Utility to get taskId from URL
const getTaskIdFromUrl = () => {
  const url = window.location.pathname; // "/pmtool/clients/68fcea3c5d427f4eaebf65be/task/a8d08fe1-85b8-4084-9922-b67dec60155f"
  const parts = url.split("/"); // Split by "/"
  const taskIndex = parts.findIndex((part) => part === "task"); // Find "task" in URL
  return taskIndex !== -1 ? parts[taskIndex + 1] : null; // Return the next part
};

export const getLabels = async (clientId) => {
  const taskId = getTaskIdFromUrl(); // get taskId from URL
  console.log("Task ID being sent:", taskId);

  // Pass taskId as query parameter
  const response = await api.get(`/api/clients/${clientId}/labels`, {
    params: { taskId }, // <-- this ensures req.query.taskId is set in backend
  });

  console.log("Labels response:", response.data);
  return response.data.labels;
};

export const createLabel = async (labelData) => {
  const taskId = getTaskIdFromUrl(); // Get taskId from URL
  const payload = { ...labelData, taskId: taskId }; // Add taskId to payload

  const response = await api.post(
    `/api/clients/${labelData.clientId}/labels`,
    payload // Send payload including taskId
  );
  return response.data.label;
};

export const updateLabel = async ({ labelId, labelData, clientId }) => {
  const taskId = getTaskIdFromUrl(); // Get taskId from URL
  const payload = { ...labelData, taskId: taskId }; // Include taskId

  const response = await api.put(
    `/api/clients/${clientId}/labels/${labelId}`,
    payload
  );
  return response.data.label;
};

export const deleteLabel = async ({ labelId, clientId }) => {
  const response = await api.delete(
    `/api/clients/${clientId}/labels/${labelId}`
  );
  return response.data;
};
