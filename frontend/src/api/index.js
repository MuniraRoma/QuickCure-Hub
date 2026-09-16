import axiosInstance from "./axios";
import userApi from "./userApi";
import doctorApi from "./doctorApi";
import adminApi from "./adminApi";

// Named exports
export { axiosInstance, userApi, doctorApi, adminApi };

// Default export
const api = {
  user: userApi,
  doctor: doctorApi,
  admin: adminApi,
  axios: axiosInstance
};

export default api;