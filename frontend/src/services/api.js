// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // ✅ Changed 5000 → 3001
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;