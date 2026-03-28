import axios, { AxiosError, type AxiosInstance } from "axios";
import env from "env.config";

const BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network/Unknown Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
