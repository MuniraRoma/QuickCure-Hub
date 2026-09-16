// src/api/doctorApi.js
import axiosInstance from "./axios";

// ✅ Define base paths
const API_PATHS = {
  DOCTOR: '/doctor',
  APPOINTMENT: '/appointment'
};

const doctorApi = {
  register: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/register`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/login`, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.DOCTOR}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put(`${API_PATHS.DOCTOR}/profile`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await axiosInstance.put(`${API_PATHS.DOCTOR}/change-password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/logout`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/refresh-token`, { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/verify-otp`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.DOCTOR}/reset-password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Appointment methods
  getAppointments: async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.APPOINTMENT}/doctor`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveAppointment: async (id) => {
    try {
      const response = await axiosInstance.put(`${API_PATHS.APPOINTMENT}/approve/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectAppointment: async (id, reason) => {
    try {
      const response = await axiosInstance.put(`${API_PATHS.APPOINTMENT}/reject/${id}`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeAppointment: async (id, data) => {
    try {
      const response = await axiosInstance.put(`${API_PATHS.APPOINTMENT}/complete/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default doctorApi;