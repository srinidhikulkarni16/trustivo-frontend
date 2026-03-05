// src/services/api.js
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
/*AXIOS INSTANCE*/
const api = axios.create({
  baseURL: `${API_URL}/api`, // dynamic backend URL
  withCredentials: true,     // keep this if you need cookies/session
});

/*TOKEN ATTACH*/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*AUTO LOGOUT*/
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

/*DOCUMENT UPLOAD FUNCTION
   USED BY Upload.jsx*/
export const uploadDocument = async (formData) => {
  return api.post("/docs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;