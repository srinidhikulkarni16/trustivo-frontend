// src/services/api.js
import axios from "axios";

// Normalize the URL: remove any trailing slashes from the Env variable
const RAW_URL = import.meta.env.VITE_API_URL || "";
const BASE_URL_CLEAN = RAW_URL.replace(/\/+$/, "");

/* AXIOS INSTANCE */
const api = axios.create({
  // Construct the base URL reliably: https://your-domain.com/api
  baseURL: `${BASE_URL_CLEAN}/api`, 
  withCredentials: true,
});

/* TOKEN ATTACH */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* AUTO LOGOUT */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // ignore network / pdf / storage errors
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const requestUrl = error.config?.url || "";

    // logout ONLY if auth endpoint fails
    const isAuthRequest =
      requestUrl.includes("/auth") ||
      requestUrl.includes("/login") ||
      requestUrl.includes("/me");

    if (status === 401 && isAuthRequest) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* DOCUMENT UPLOAD FUNCTION */
export const uploadDocument = async (formData) => {
  return api.post("/docs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;