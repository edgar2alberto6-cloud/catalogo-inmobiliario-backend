import axios from "axios";
import { getToken, logout } from "../utils/auth";

const API = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API,
});

// 🔐 Agregar token automáticamente
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

// 🚨 Manejo global de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido");

      logout(); // limpia localStorage

      // redirige a login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;