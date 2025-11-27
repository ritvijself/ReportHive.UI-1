import axios from "axios";

// Use environment variable or fallback to relative path for production
const getBaseURL = () => {
  return "https://workflow.1geniusseo.com";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export default api;
