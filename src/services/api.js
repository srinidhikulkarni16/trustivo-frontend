import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    // FIXED: Added template literal backticks
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid redirecting if we are already on the login page
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* DOCUMENT APIs */
export const uploadDocument = (formData) => api.post("/document/upload", formData); 
// Note: Axios sets "Content-Type": "multipart/form-data" automatically for FormData

export const getMyDocuments = () => api.get("/document/my-documents");

export default api;