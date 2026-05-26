import axios from "axios";

const getDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:5000/api`;
};

const BASE_URL = process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl();
const API = axios.create({
  baseURL: BASE_URL,
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const getHealthData = (limit = 50, skip = 0) => 
  API.get("/health", { params: { limit, skip } });
export const createHealthData = (data) => API.post("/health", data);
export const getLatestHealthData = () => API.get("/health/latest");
export const getAlerts = (limit = 50, skip = 0, unreadOnly = false) => 
  API.get("/alerts", { params: { limit, skip, unreadOnly } });
export const createAlert = (data) => API.post("/alerts", data);
export const markAlertAsRead = (alertId) => API.put(`/alerts/${alertId}/read`);
export const resolveAlert = (alertId) => API.put(`/alerts/${alertId}/resolve`);
export const getPlans = () => API.get("/plans");
export const getUsers = (role) => API.get("/auth/users", { params: { role } });
export const getHealthHistory = (limit = 20, skip = 0) =>
  API.get("/health/history", { params: { limit, skip } });
export const getPatientHealthData = (patientId, limit = 20, skip = 0) =>
  API.get(`/health/patient/${patientId}`, { params: { limit, skip } });
export const getPendingUsers = () => API.get("/auth/pending");
export const updateUserStatus = (userId, status) => API.put(`/auth/${userId}/status`, { status });
export const deleteUser = (userId) => API.delete(`/auth/${userId}`);
export const updateUser = (userId, data) => API.put(`/auth/${userId}`, data);
export const getAllHealthRecords = (limit = 100, skip = 0) =>
  API.get("/health/all-records", { params: { limit, skip } });
export const sendChatMessage = (messages) => API.post("/chat", { messages });
