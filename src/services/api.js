
import axios from "axios";

const api = axios.create({
  baseURL: (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, ""),
  timeout: 30000
});

api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem("anoGToken");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    if (config.data instanceof FormData) {
      config.headers.setContentType(undefined);
    } else if (config.data) {
      config.headers.setContentType("application/json");
    }

    return config;
  },
  error => Promise.reject(error)
);

export default api;
