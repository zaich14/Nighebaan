import axios from "axios";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const loginUser = (data) => api.post("/auth/login", data);
export const getAlerts = (token) =>
  api.get("/alerts", {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getPlans = () => api.get("/plans");
