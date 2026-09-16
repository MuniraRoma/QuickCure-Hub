// services/appointmentService.js

// =============================================
// ✅ DYNAMIC API BASE URL - Localhost & Network IP both work
// =============================================

// ✅ Browser এর current URL থেকে Base URL বের করুন
const getApiBaseUrl = () => {
  // Current URL থেকে hostname বের করুন
  const hostname = window.location.hostname;
  const port = "5000"; // Backend port
  
  // যদি localhost হয় তাহলে localhost ব্যবহার করুন, নাহলে IP ব্যবহার করুন
  const baseUrl = `http://${hostname}:${port}/api`;
  
  console.log("🌐 Detected API_BASE_URL:", baseUrl);
  return baseUrl;
};

// ✅ API_BASE_URL সেট করুন - .env না থাকলে dynamic URL ব্যবহার করবে
const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

console.log("🌐 Final API_BASE_URL:", API_BASE_URL);

// =============================================
// ✅ TOKEN MANAGEMENT - FIXED
// =============================================

// Get token from localStorage with validation
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found in localStorage');
    return null;
  }
  // ✅ Token ক্লিন করুন (extra spaces remove)
  const cleanToken = token.trim();
  console.log('🔑 Token exists, length:', cleanToken.length);
  return cleanToken;
};

// Get headers with token - FIXED
const headers = () => {
  const token = getToken();
  if (!token) {
    console.warn('⚠️ No token available for headers');
    return {
      'Content-Type': 'application/json'
    };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ✅ Check if token is valid format
const isValidToken = (token) => {
  if (!token) return false;
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
};

// =============================================
// ✅ USER APPOINTMENT SERVICES (FIXED)
// =============================================

// Create Appointment
export const createAppointment = async (appointmentData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    if (!isValidToken(token)) {
      console.error('❌ Invalid token format:', token.substring(0, 20) + '...');
      // ✅ Invalid token হলে logout করুন
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      throw new Error('Invalid token format. Please login again.');
    }

    console.log('📤 Creating appointment with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to create appointment');
    }
    
    const data = await response.json();
    console.log('✅ Appointment created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    throw error;
  }
};

// Get My Appointments - FIXED URL
export const getMyAppointments = async (params = {}) => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('⚠️ No token found, redirecting to login');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('No authentication token found');
    }

    if (!isValidToken(token)) {
      console.error('❌ Invalid token format');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Invalid token format');
    }

    const queryString = new URLSearchParams(params).toString();
    // ✅ সঠিক URL - "my" এন্ডপয়েন্ট ব্যবহার করুন
    const url = queryString 
      ? `${API_BASE_URL}/appointments/my?${queryString}` 
      : `${API_BASE_URL}/appointments/my`;
    
    console.log('📤 Fetching appointments from:', url);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: headers()
    });

    // ✅ Response status check
    if (response.status === 401) {
      console.error('🔴 Unauthorized - Invalid or expired token');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Appointments fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching my appointments:', error);
    throw error;
  }
};

// Get Appointment Statistics - FIXED URL
export const getAppointmentStatistics = async () => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('⚠️ No token found for statistics');
      return { success: false, stats: { total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0, upcoming: 0, thisMonth: 0 } };
    }

    if (!isValidToken(token)) {
      console.error('❌ Invalid token format');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Invalid token format');
    }

    // ✅ সঠিক URL - "statistics" এন্ডপয়েন্ট ব্যবহার করুন
    const url = `${API_BASE_URL}/appointments/statistics`;
    
    console.log('📊 Fetching statistics from:', url);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: headers()
    });

    // ✅ Response status check
    if (response.status === 401) {
      console.error('🔴 Unauthorized - Invalid or expired token');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      return { success: false, stats: { total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0, upcoming: 0, thisMonth: 0 } };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return { success: false, stats: { total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0, upcoming: 0, thisMonth: 0 } };
    }

    const data = await response.json();
    console.log('📊 Statistics fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching appointment statistics:', error);
    // ✅ Error হলে ডিফল্ট স্ট্যাটস রিটার্ন করুন যাতে UI crash না হয়
    return { success: false, stats: { total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0, upcoming: 0, thisMonth: 0 } };
  }
};

// Get Appointment By ID - FIXED
export const getAppointmentById = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    throw error;
  }
};

// Cancel Appointment - FIXED URL
export const cancelAppointment = async (id, reason) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // ✅ সঠিক URL - ":id/cancel" ফরম্যাট
    const url = `${API_BASE_URL}/appointments/${id}/cancel`;
    console.log('📤 Cancelling appointment:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ cancellationReason: reason || "Cancelled by user" })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel appointment');
    }

    const data = await response.json();
    console.log('✅ Appointment cancelled:', data);
    return data;
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    throw error;
  }
};

// Get Prescription
export const getPrescription = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/prescription`, {
      method: 'GET',
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching prescription:', error);
    throw error;
  }
};

// =============================================
// ✅ DOCTOR APPOINTMENT SERVICES (FIXED)
// =============================================

// Get Doctor Appointments
export const getDoctorAppointments = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/doctor`, {
      method: 'GET',
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching doctor appointments:', error);
    throw error;
  }
};

// Approve Appointment - FIXED URL
export const approveAppointment = async (id, notes = '') => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/approve`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ doctorResponse: notes })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve appointment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error approving appointment:', error);
    throw error;
  }
};

// Reject Appointment - FIXED URL
export const rejectAppointment = async (id, reason = '') => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/reject`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ reason })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject appointment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error rejecting appointment:', error);
    throw error;
  }
};

// Complete Appointment - FIXED URL
export const completeAppointment = async (id, data) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/complete`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete appointment');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error completing appointment:', error);
    throw error;
  }
};

// Update Appointment - FIXED URL
export const updateAppointment = async (id, data) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update appointment');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    throw error;
  }
};

// =============================================
// ✅ ADMIN APPOINTMENT ANALYTICS SERVICES
// =============================================

// Get Appointment Dashboard Analytics
export const getAppointmentAnalytics = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching appointment analytics:', error);
    throw error;
  }
};

// Get Today's Appointments
export const getTodayAppointments = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/today`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching today appointments:', error);
    throw error;
  }
};

// Get Weekly Analytics
export const getWeeklyAppointments = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/weekly`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching weekly analytics:', error);
    throw error;
  }
};

// Get Monthly Analytics
export const getMonthlyAppointments = async (year) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = year ? `${API_BASE_URL}/admin/monthly?year=${year}` : `${API_BASE_URL}/admin/monthly`;
    const response = await fetch(url, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching monthly analytics:', error);
    throw error;
  }
};

// Get Status Analytics
export const getAppointmentStatus = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/status`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching status analytics:', error);
    throw error;
  }
};

// Get Top Doctors
export const getTopDoctors = async (limit = 5) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/top-doctors?limit=${limit}`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching top doctors:', error);
    throw error;
  }
};

// Get Top Patients
export const getTopPatients = async (limit = 5) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/top-patients?limit=${limit}`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching top patients:', error);
    throw error;
  }
};

// Get Revenue Analytics
export const getRevenueAnalytics = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/revenue`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching revenue analytics:', error);
    throw error;
  }
};

// Get Recent Appointments
export const getRecentAppointments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.status && filters.status !== 'All' && { status: filters.status }),
      ...(filters.filterDate && { filterDate: filters.filterDate }),
      ...(filters.search && { search: filters.search })
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/recent?${params}`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching recent appointments:', error);
    throw error;
  }
};

// Get Revenue Trend
export const getRevenueTrend = async (days = 30) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/revenue-trend?days=${days}`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching revenue trend:', error);
    throw error;
  }
};

// Get Appointments by Date Range
export const getAppointmentsByDateRange = async (startDate, endDate) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/date-range?startDate=${startDate}&endDate=${endDate}`, {
      headers: headers()
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching appointments by date range:', error);
    throw error;
  }
};

// =============================================
// ✅ TOKEN VALIDATION HELPER
// =============================================

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  return isValidToken(token);
};

// Logout helper
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = '/login';
};

// =============================================
// ✅ EXPORT
// =============================================

export default {
  // User
  createAppointment,
  getMyAppointments,
  getAppointmentStatistics,
  getAppointmentById,
  cancelAppointment,
  getPrescription,
  // Doctor
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  updateAppointment,
  // Admin
  getAppointmentAnalytics,
  getTodayAppointments,
  getWeeklyAppointments,
  getMonthlyAppointments,
  getAppointmentStatus,
  getTopDoctors,
  getTopPatients,
  getRevenueAnalytics,
  getRecentAppointments,
  getRevenueTrend,
  getAppointmentsByDateRange,
  // Helpers
  isAuthenticated,
  logout
};