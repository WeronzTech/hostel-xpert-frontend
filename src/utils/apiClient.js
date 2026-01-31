import axios from "axios";
import {encryptedStorage} from "./encryptedStorage";

// Load base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// console.log(API_BASE_URL); // debug statement

// const PUBLIC_ENDPOINTS = [
//   "/client/api/client/register",
//   "/auth/tenant-login",
// ];

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = encryptedStorage.getItem("token");
    // console.log("Token", token); // debug statement

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ Logging only in development
    // if (import.meta.env.DEV) {
    //   console.log("📤 API Request:");
    //   console.log("→ URL:", config.url);
    //   console.log("→ Method:", config.method);
    //   console.log("→ Headers:", config.headers);
    //   console.log("→ Token used:", token);
    // }

    return config;
  },
  (error) => {
    // if (import.meta.env.DEV) {
    //   console.error("❌ API Request Error:", error);
    // }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // if (import.meta.env.DEV) {
    //   console.log("✅ API Response:");
    //   console.log("← URL:", response.config.url);
    //   console.log("← Status:", response.status);
    //   console.log("← Data:", response.data);
    // }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("❌ API Response Error:");
      console.error("← URL:", error.config?.url);
      console.error("← Status:", error.response?.status);
      console.error("← Data:", error.response?.data);
    }

    // Optional: Handle 401 globally
    if (error.response?.status === 401) {
      // You can dispatch logout or redirect logic here
      console.warn("🚫 Unauthorized: Token may be missing or expired");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
