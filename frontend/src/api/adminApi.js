// src/api/adminApi.js
import axiosInstance from "./axios";

const adminApi = {
  // =======================
  // Auth
  // =======================
  register: async (data) => {
    try {
      console.log("📤 Admin Register Request:", data);
      // ✅ `/admins/register` (প্লুরাল)
      const response = await axiosInstance.post("/admins/register", data);
      console.log("📥 Admin Register Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Admin Register Error:", error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log("📤 Admin Login Request:", credentials);
      // ✅ `/admins/login` (প্লুরাল)
      const response = await axiosInstance.post("/admins/login", credentials);
      console.log("📥 Admin Login Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Admin Login Error:", error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      // ✅ `/admins/profile` (প্লুরাল)
      const response = await axiosInstance.get("/admins/profile");
      return response.data;
    } catch (error) {
      console.error("❌ Get Admin Profile Error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // ✅ `/admins/logout` (প্লুরাল)
      const response = await axiosInstance.post("/admins/logout");
      return response.data;
    } catch (error) {
      console.error("❌ Admin Logout Error:", error);
      throw error;
    }
  },

  // =======================
  // Dashboard
  // =======================
  getDashboard: async () => {
    try {
      // ✅ `/admins/dashboard` (প্লুরাল)
      const response = await axiosInstance.get("/admins/dashboard");
      return response.data;
    } catch (error) {
      console.error("❌ Get Dashboard Error:", error);
      throw error;
    }
  },

  // =======================
  // User Management
  // =======================
  getUsers: async () => {
    try {
      // ✅ `/admins/users` (প্লুরাল)
      const response = await axiosInstance.get("/admins/users");
      return response.data;
    } catch (error) {
      console.error("❌ Get Users Error:", error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      // ✅ `/admins/users/${userId}/block` (প্লুরাল)
      const response = await axiosInstance.put(`/admins/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error("❌ Block User Error:", error);
      throw error;
    }
  },

  activateUser: async (userId) => {
    try {
      // ✅ `/admins/users/${userId}/activate` (প্লুরাল)
      const response = await axiosInstance.put(`/admins/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error("❌ Activate User Error:", error);
      throw error;
    }
  },

  // =======================
  // Doctor Management
  // =======================
  getDoctors: async () => {
    try {
      // ✅ `/admins/doctors` (প্লুরাল)
      const response = await axiosInstance.get("/admins/doctors");
      return response.data;
    } catch (error) {
      console.error("❌ Get Doctors Error:", error);
      throw error;
    }
  },

  getPendingDoctors: async () => {
    try {
      // ✅ `/admins/doctors/pending` (প্লুরাল)
      const response = await axiosInstance.get("/admins/doctors/pending");
      return response.data;
    } catch (error) {
      console.error("❌ Get Pending Doctors Error:", error);
      throw error;
    }
  },

  approveDoctor: async (doctorId) => {
    try {
      // ✅ `/admins/doctors/${doctorId}/approve` (প্লুরাল)
      const response = await axiosInstance.put(`/admins/doctors/${doctorId}/approve`);
      return response.data;
    } catch (error) {
      console.error("❌ Approve Doctor Error:", error);
      throw error;
    }
  },

  rejectDoctor: async (doctorId) => {
    try {
      // ✅ `/admins/doctors/${doctorId}/reject` (প্লুরাল)
      const response = await axiosInstance.put(`/admins/doctors/${doctorId}/reject`);
      return response.data;
    } catch (error) {
      console.error("❌ Reject Doctor Error:", error);
      throw error;
    }
  }
};

export default adminApi;