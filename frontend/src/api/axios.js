import axios from "axios";
import { getToken, logout } from "../utils/auth";

const API = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      console.warn("Sesión expirada o token inválido");

      logout();

      if (currentPath !== "/" && currentPath !== "/login") {
        window.location.replace("/?sessionExpired=1");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;