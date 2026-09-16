// src/api/userApi.js
import axiosInstance from "./axios";

// =======================
// User API Functions - Named Exports
// =======================

export const userRegister = async (userData) => {
  try {
    console.log("📤 Sending registration data:", userData);
    // ✅ `/users/register` (প্লুরাল)
    const response = await axiosInstance.post("/users/register", userData);
    console.log("📥 Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Registration API Error:", error);
    throw error;
  }
};

export const userLogin = async (credentials) => {
  try {
    // ✅ `/users/login` (প্লুরাল)
    const response = await axiosInstance.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    console.error("❌ Login API Error:", error);
    throw error;
  }
};

export const userGetProfile = async () => {
  try {
    // ✅ `/users/profile` (প্লুরাল)
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    throw error;
  }
};

export const userUpdateProfile = async (data) => {
  try {
    // ✅ `/users/profile` (প্লুরাল)
    const response = await axiosInstance.put("/users/profile", data);
    return response.data;
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    throw error;
  }
};

export const userChangePassword = async (data) => {
  try {
    // ✅ `/users/change-password` (প্লুরাল)
    const response = await axiosInstance.put("/users/change-password", data);
    return response.data;
  } catch (error) {
    console.error("❌ Change Password Error:", error);
    throw error;
  }
};

export const userLogout = async () => {
  try {
    // ✅ `/users/logout` (প্লুরাল)
    const response = await axiosInstance.post("/users/logout");
    return response.data;
  } catch (error) {
    console.error("❌ Logout Error:", error);
    throw error;
  }
};

export const userRefreshToken = async (refreshToken) => {
  try {
    // ✅ `/users/refresh-token` (প্লুরাল)
    const response = await axiosInstance.post("/users/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    console.error("❌ Refresh Token Error:", error);
    throw error;
  }
};

// =======================
// Default Export
// =======================
const userApi = {
  register: userRegister,
  login: userLogin,
  getProfile: userGetProfile,
  updateProfile: userUpdateProfile,
  changePassword: userChangePassword,
  logout: userLogout,
  refreshToken: userRefreshToken
};

export default userApi;