import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("📤 Request URL:", config.url);
    console.log("📤 Request Method:", config.method);
    console.log("📤 Request Data:", config.data);
    
    // ✅ Ensure data is properly formatted
    if (config.data && typeof config.data === 'object') {
      // Data is already an object, axios will stringify it
      console.log("📤 Data is object, axios will handle it");
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("📥 Response Status:", response.status);
    console.log("📥 Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error);
    if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("❌ Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;