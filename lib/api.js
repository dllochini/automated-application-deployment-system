import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:8083/api/v1/server",
});

export default api;