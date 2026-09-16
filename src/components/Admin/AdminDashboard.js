// AdminDashboard.js - Full Integration with Appointment Analytics (Light/Dark Mode & Bangla/English Support)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Import Appointment Analytics Components
import AppointmentStatistics from './AppointmentStatistics';
import RevenueChart from './RevenueChart';
import AppointmentChart from './AppointmentChart';
import RecentAppointments from './RecentAppointments';
import TopDoctors from './TopDoctors';
import TopPatients from './TopPatients';

// ✅ NEW: Import your new separate components
import HealthRecordAnalytics from './HealthRecordAnalytics';
import PrescriptionAnalytics from './PrescriptionAnalytics';
import MedicineAnalytics from './MedicineAnalytics';

// Import Services
import {
  getAppointmentAnalytics,
  getTodayAppointments,
  getWeeklyAppointments,
  getMonthlyAppointments,
  getAppointmentStatus,
  getTopDoctors,
  getTopPatients,
  getRevenueAnalytics,
  getRevenueTrend,
  getRecentAppointments
} from '../../services/appointmentService';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// =============================================
// TRANSLATIONS
// =============================================
const translations = {
  en: {
    // Sidebar
    admin: 'Admin',
    dashboard: 'Dashboard',
    overview: 'Overview',
    analytics: 'Analytics',
    users: 'Users',
    allDoctors: 'All Doctors',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    refreshData: 'Refresh Data',
    refreshing: 'Refreshing...',
    
    // Topbar
    dashboardOverview: 'Dashboard Overview',
    appointmentAnalytics: 'Appointment Analytics',
    userManagement: 'User Management',
    allDoctorsList: 'All Doctors',
    pendingDoctors: 'Pending Doctors',
    approvedDoctors: 'Approved Doctors',
    rejectedDoctors: 'Rejected Doctors',
    
    // Stats
    totalUsers: 'Total Users',
    totalDoctors: 'Total Doctors',
    total: 'Total',
    activeDoctors: 'Active Doctors',
    
    // Appointment Stats
    totalAppointments: 'Total Appointments',
    pendingAppointments: 'Pending',
    approvedAppointments: 'Approved',
    completedAppointments: 'Completed',
    cancelledAppointments: 'Cancelled',
    rejectedAppointments: 'Rejected',
    
    // Revenue
    todaysRevenue: "Today's Revenue",
    monthlyRevenue: 'Monthly Revenue',
    yearlyRevenue: 'Yearly Revenue',
    
    // Charts
    statusDistribution: 'Appointment Status Distribution',
    weeklyAppointments: 'Weekly Appointments',
    monthlyAppointments: 'Monthly Appointments',
    revenueTrend: 'Revenue Trend (Last 30 Days)',
    topDoctors: 'Top Doctors',
    topPatients: 'Top Patients',
    
    // Today's Appointments
    todaysAppointments: "Today's Appointments",
    patient: 'Patient',
    doctor: 'Doctor',
    time: 'Time',
    status: 'Status',
    payment: 'Payment',
    amount: 'Amount',
    noAppointmentsToday: 'No appointments today',
    
    // Recent Appointments
    recentAppointments: 'Recent Appointments',
    searchPatientDoctor: 'Search patient or doctor...',
    allStatus: 'All Status',
    allDates: 'All Dates',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    refresh: 'Refresh',
    previous: 'Previous',
    next: 'Next',
    noAppointmentsFound: 'No appointments found',
    page: 'Page',
    of: 'of',
    appts: 'appts',
    
    // Quick Stats
    quickAppointmentStats: 'Quick Appointment Stats',
    viewFullAnalytics: 'View Full Analytics →',
    
    // Actions
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
    block: 'Block',
    activate: 'Activate',
    retry: 'Retry',
    loading: 'Loading...',
    noData: 'No data available',
    noDoctorData: 'No doctor data available',
    noPatientData: 'No patient data available',
    noStatusData: 'No status data available',
    noWeeklyData: 'No weekly data available',
    noMonthlyData: 'No monthly data available',
    noRevenueData: 'No revenue data available',
    
    // Logout
    confirmLogout: 'Confirm Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    logout: 'Logout',
    
    // Errors
    errorLoading: 'Failed to load data from server:',
    errorAppointment: 'Failed to load appointment analytics:',
    noToken: 'No authentication token found',
    noAdminAccess: "You don't have admin access. Please contact support.",
    
    // Mode & Language
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    bangla: 'বাংলা',
    english: 'English'
  },
  bn: {
    // Sidebar
    admin: 'অ্যাডমিন',
    dashboard: 'ড্যাশবোর্ড',
    overview: 'ওভারভিউ',
    analytics: 'এনালিটিক্স',
    users: 'ব্যবহারকারী',
    allDoctors: 'সব ডাক্তার',
    pending: 'পেন্ডিং',
    approved: 'অ্যাপ্রুভড',
    rejected: 'রিজেক্টেড',
    refreshData: 'ডেটা রিফ্রেশ',
    refreshing: 'রিফ্রেশ হচ্ছে...',
    
    // Topbar
    dashboardOverview: 'ড্যাশবোর্ড ওভারভিউ',
    appointmentAnalytics: 'অ্যাপয়েন্টমেন্ট এনালিটিক্স',
    userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
    allDoctorsList: 'সব ডাক্তার',
    pendingDoctors: 'পেন্ডিং ডাক্তার',
    approvedDoctors: 'অ্যাপ্রুভড ডাক্তার',
    rejectedDoctors: 'রিজেক্টেড ডাক্তার',
    
    // Stats
    totalUsers: 'মোট ব্যবহারকারী',
    totalDoctors: 'মোট ডাক্তার',
    total: 'মোট',
    activeDoctors: 'সক্রিয় ডাক্তার',
    
    // Appointment Stats
    totalAppointments: 'মোট অ্যাপয়েন্টমেন্ট',
    pendingAppointments: 'পেন্ডিং',
    approvedAppointments: 'অ্যাপ্রুভড',
    completedAppointments: 'সম্পন্ন',
    cancelledAppointments: 'বাতিল',
    rejectedAppointments: 'বাতিলকৃত',
    
    // Revenue
    todaysRevenue: "আজকের আয়",
    monthlyRevenue: 'মাসিক আয়',
    yearlyRevenue: 'বার্ষিক আয়',
    
    // Charts
    statusDistribution: 'অ্যাপয়েন্টমেন্ট স্ট্যাটাস ডিস্ট্রিবিউশন',
    weeklyAppointments: 'সাপ্তাহিক অ্যাপয়েন্টমেন্ট',
    monthlyAppointments: 'মাসিক অ্যাপয়েন্টমেন্ট',
    revenueTrend: 'আয় ট্রেন্ড (গত ৩০ দিন)',
    topDoctors: 'সেরা ডাক্তার',
    topPatients: 'সেরা রোগী',
    
    // Today's Appointments
    todaysAppointments: "আজকের অ্যাপয়েন্টমেন্ট",
    patient: 'রোগী',
    doctor: 'ডাক্তার',
    time: 'সময়',
    status: 'স্ট্যাটাস',
    payment: 'পেমেন্ট',
    amount: 'টাকা',
    noAppointmentsToday: 'আজ কোনো অ্যাপয়েন্টমেন্ট নেই',
    
    // Recent Appointments
    recentAppointments: 'সাম্প্রতিক অ্যাপয়েন্টমেন্ট',
    searchPatientDoctor: 'রোগী বা ডাক্তার খুঁজুন...',
    allStatus: 'সব স্ট্যাটাস',
    allDates: 'সব তারিখ',
    today: 'আজ',
    yesterday: 'গতকাল',
    thisWeek: 'এই সপ্তাহ',
    thisMonth: 'এই মাস',
    refresh: 'রিফ্রেশ',
    previous: 'পেছনে',
    next: 'সামনে',
    noAppointmentsFound: 'কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি',
    page: 'পৃষ্ঠা',
    of: 'এর',
    appts: 'অ্যাপয়েন্টমেন্ট',
    
    // Quick Stats
    quickAppointmentStats: 'দ্রুত অ্যাপয়েন্টমেন্ট পরিসংখ্যান',
    viewFullAnalytics: 'সম্পূর্ণ এনালিটিক্স দেখুন →',
    
    // Actions
    approve: 'অ্যাপ্রুভ',
    reject: 'রিজেক্ট',
    delete: 'ডিলিট',
    block: 'ব্লক',
    activate: 'অ্যাক্টিভেট',
    retry: 'আবার চেষ্টা করুন',
    loading: 'লোড হচ্ছে...',
    noData: 'কোন ডেটা নেই',
    noDoctorData: 'কোন ডাক্তার ডেটা নেই',
    noPatientData: 'কোন রোগী ডেটা নেই',
    noStatusData: 'কোন স্ট্যাটাস ডেটা নেই',
    noWeeklyData: 'কোন সাপ্তাহিক ডেটা নেই',
    noMonthlyData: 'কোন মাসিক ডেটা নেই',
    noRevenueData: 'কোন আয় ডেটা নেই',
    
    // Logout
    confirmLogout: 'লগআউট নিশ্চিত করুন',
    logoutConfirm: 'আপনি কি লগআউট করতে চান?',
    cancel: 'বাতিল',
    logout: 'লগআউট',
    
    // Errors
    errorLoading: 'সার্ভার থেকে ডেটা লোড করতে ব্যর্থ:',
    errorAppointment: 'অ্যাপয়েন্টমেন্ট এনালিটিক্স লোড করতে ব্যর্থ:',
    noToken: 'কোন অথেনটিকেশন টোকেন পাওয়া যায়নি',
    noAdminAccess: 'আপনার অ্যাডমিন অ্যাক্সেস নেই। দয়া করে সাপোর্টে যোগাযোগ করুন।',
    
    // Mode & Language
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড',
    bangla: 'বাংলা',
    english: 'English'
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  
  // States from API
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [rejectedDoctors, setRejectedDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Appointment Analytics States
  const [appointmentStats, setAppointmentStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    rejectedAppointments: 0,
    openingAppointments: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [topDoctorsData, setTopDoctorsData] = useState([]);
  const [topPatientsData, setTopPatientsData] = useState([]);
  const [revenueData, setRevenueData] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [recentTotal, setRecentTotal] = useState(0);
  const [recentFilter, setRecentFilter] = useState({ status: 'All', filterDate: '' });
  const [recentSearch, setRecentSearch] = useState('');

  // ==============================================================
  // ✅ NEW STATES: Health Records, Prescriptions & Medicine Analytics
  // ==============================================================
  const [healthRecordsData, setHealthRecordsData] = useState({
    totalRecords: 0,
    recordsThisWeek: 0,
    diagnosisStats: []
  });
  const [prescriptionsData, setPrescriptionsData] = useState({
    totalPrescriptions: 0,
    recentPrescriptions: 0,
    latestPrescriptions: []
  });
  const [medicinesData, setMedicinesData] = useState({
    totalUniqueMedicines: 0,
    topPrescribedMedicines: []
  });

  // Get translation
  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  // Toggle Dark Mode - Fixed
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Toggle the light-mode class on the dashboard container
    const dashboardElement = document.querySelector('.admin-dashboard');
    if (dashboardElement) {
      if (newDarkMode) {
        dashboardElement.classList.remove('light-mode');
      } else {
        dashboardElement.classList.add('light-mode');
      }
    }
    
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Toggle Language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
    localStorage.setItem('language', language === 'en' ? 'bn' : 'en');
  };

  // Check Authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const adminLoggedIn = localStorage.getItem('admin_logged_in');

    console.log("🔍 Admin Dashboard Auth Check:");
    console.log("Token:", token ? "✅ Present" : "❌ Missing");
    console.log("User Role:", userRole);
    console.log("Admin Logged In:", adminLoggedIn);

    if (!token || userRole !== 'admin' || adminLoggedIn !== 'true') {
      console.log("❌ Not authorized, redirecting to login...");
      navigate('/login', { replace: true });
      return;
    }

    // Check dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setIsDarkMode(isDark);
      
      // Apply the class to the dashboard container
      const dashboardElement = document.querySelector('.admin-dashboard');
      if (dashboardElement) {
        if (!isDark) {
          dashboardElement.classList.add('light-mode');
        } else {
          dashboardElement.classList.remove('light-mode');
        }
      }
    }

    // Check language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    loadAdminData();
    loadAllData();
    loadAppointmentAnalytics();
    setLoading(false);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Load Appointment Data on tab change
  useEffect(() => {
    if (selectedTab === 'analytics') {
      loadAppointmentAnalytics();
    }
  }, [selectedTab]);

  const loadAdminData = () => {
    const adminDataStr = localStorage.getItem('admin_data');
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        setAdminName(adminData.name || 'Admin');
        setAdminEmail(adminData.email || '');
        console.log("✅ Admin Name loaded:", adminData.name);
      } catch (e) {
        console.error("❌ Error parsing admin_data:", e);
      }
    }
  };

  // Load Appointment Analytics - UPDATED with direct fetch & NEW APIs
  const loadAppointmentAnalytics = async () => {
    setAnalyticsLoading(true);
    setError('');
    
    try {
      console.log("📊 Loading appointment analytics...");
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('noToken'));
        setAnalyticsLoading(false);
        return;
      }

      console.log("🔑 Token:", token);

      // 1. Get Analytics - Direct fetch
      console.log("📊 Fetching analytics...");
      const analyticsRes = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await analyticsRes.json();
      console.log("📊 Analytics Response:", analyticsData);
      
      if (analyticsData.success) {
        setAppointmentStats(analyticsData.statistics);
        console.log("✅ Analytics Stats set:", analyticsData.statistics);
      } else {
        console.error("❌ Analytics Error:", analyticsData.message);
      }

      // 2. Get Status Data - Direct fetch
      console.log("📊 Fetching status...");
      const statusRes = await fetch(`${API_BASE_URL}/admin/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusDataRes = await statusRes.json();
      console.log("📊 Status Response:", statusDataRes);
      
      if (statusDataRes.success) {
        setStatusData(statusDataRes.status || {});
        console.log("✅ Status Data set:", statusDataRes.status);
      }

      // 3. Get Weekly Data - Direct fetch
      console.log("📊 Fetching weekly...");
      const weeklyRes = await fetch(`${API_BASE_URL}/admin/weekly`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const weeklyDataRes = await weeklyRes.json();
      console.log("📊 Weekly Response:", weeklyDataRes);
      
      if (weeklyDataRes.success) {
        setWeeklyData(weeklyDataRes.weeklyData || []);
        console.log("✅ Weekly Data set:", weeklyDataRes.weeklyData);
      }

      // 4. Get Monthly Data - Direct fetch
      console.log("📊 Fetching monthly...");
      const monthlyRes = await fetch(`${API_BASE_URL}/admin/monthly`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const monthlyDataRes = await monthlyRes.json();
      console.log("📊 Monthly Response:", monthlyDataRes);
      
      if (monthlyDataRes.success) {
        setMonthlyData(monthlyDataRes.monthlyData || []);
        console.log("✅ Monthly Data set:", monthlyDataRes.monthlyData);
      }

      // 5. Get Revenue Data
      console.log("💰 Fetching revenue...");
      const revenueRes = await fetch(`${API_BASE_URL}/admin/revenue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const revenueDataRes = await revenueRes.json();
      console.log("💰 Revenue Response:", revenueDataRes);
      
      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.revenue || {});
      }

      // 6. Get Revenue Trend
      console.log("📈 Fetching revenue trend...");
      const trendRes = await fetch(`${API_BASE_URL}/admin/revenue-trend?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const trendDataRes = await trendRes.json();
      console.log("📈 Trend Response:", trendDataRes);
      
      if (trendDataRes.success) {
        setRevenueTrend(trendDataRes.trendData || []);
      }

      // 7. Get Today's Appointments
      console.log("📅 Fetching today...");
      const todayRes = await fetch(`${API_BASE_URL}/admin/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const todayData = await todayRes.json();
      console.log("📅 Today Response:", todayData);
      
      if (todayData.success) {
        setTodayAppointments(todayData.appointments || []);
      }

      // 8. Get Top Doctors
      console.log("🏆 Fetching top doctors...");
      const topDocsRes = await fetch(`${API_BASE_URL}/admin/top-doctors?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topDocsData = await topDocsRes.json();
      console.log("🏆 Top Doctors Response:", topDocsData);
      
      if (topDocsData.success) {
        setTopDoctorsData(topDocsData.topDoctors || []);
      }

      // 9. Get Top Patients
      console.log("👤 Fetching top patients...");
      const topPatsRes = await fetch(`${API_BASE_URL}/admin/top-patients?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topPatsData = await topPatsRes.json();
      console.log("👤 Top Patients Response:", topPatsData);
      
      if (topPatsData.success) {
        setTopPatientsData(topPatsData.topPatients || []);
      }

      // 10. Get Recent Appointments
      await loadRecentAppointments();

      // ==============================================================
      // ✅ NEW: Fetch Health Records, Prescriptions & Medicine Analytics
      // ==============================================================
      console.log("📋 Fetching Health Records Analytics...");
      const healthRes = await fetch(`${API_BASE_URL}/admin/analytics/health-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const healthData = await healthRes.json();
      if (healthData.success) {
        setHealthRecordsData(healthData.data);
        console.log("✅ Health Records Data set:", healthData.data);
      }

      console.log("📝 Fetching Prescription Analytics...");
      const prescriptionRes = await fetch(`${API_BASE_URL}/admin/analytics/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prescriptionData = await prescriptionRes.json();
      if (prescriptionData.success) {
        setPrescriptionsData(prescriptionData.data);
        console.log("✅ Prescription Data set:", prescriptionData.data);
      }

      console.log("💊 Fetching Medicine Analytics...");
      const medicineRes = await fetch(`${API_BASE_URL}/admin/analytics/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const medicineData = await medicineRes.json();
      if (medicineData.success) {
        setMedicinesData(medicineData.data);
        console.log("✅ Medicine Data set:", medicineData.data);
      }

      console.log("✅ All appointment analytics loaded successfully");

    } catch (error) {
      console.error("❌ Error loading appointment analytics:", error);
      setError(t('errorAppointment') + error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load Recent Appointments with Pagination & Filters
  const loadRecentAppointments = async (page = recentPage) => {
    try {
      const token = localStorage.getItem('token');
      const { status, filterDate } = recentFilter;
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(status && status !== 'All' && { status }),
        ...(filterDate && { filterDate }),
        ...(recentSearch && { search: recentSearch })
      });

      const response = await fetch(`${API_BASE_URL}/admin/recent?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("📋 Recent Response:", data);
      if (data.success) {
        setRecentAppointments(data.appointments || []);
        setRecentTotalPages(data.pagination?.totalPages || 1);
        setRecentPage(data.pagination?.page || 1);
        setRecentTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("❌ Error loading recent appointments:", error);
    }
  };

  // Load all data from API
  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      setError('');
      
      console.log("📥 Loading all data from API...");

      // Load Users
      try {
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.users || []);
        }
      } catch (err) {
        console.error("❌ Error loading users:", err);
      }

      // Load All Doctors
      try {
        const doctorsRes = await fetch(`${API_BASE_URL}/admin/doctors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const doctorsData = await doctorsRes.json();
        if (doctorsData.success) {
          setDoctors(doctorsData.doctors || []);
        }
      } catch (err) {
        console.error("❌ Error loading doctors:", err);
        setError("Error loading doctors: " + err.message);
      }

      // Load Pending Doctors
      try {
        const pendingRes = await fetch(`${API_BASE_URL}/admin/doctors/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          setPendingDoctors(pendingData.doctors || []);
        }
      } catch (err) {
        console.error("❌ Error loading pending doctors:", err);
      }

      // Load Approved Doctors
      try {
        const approvedRes = await fetch(`${API_BASE_URL}/admin/doctors/approved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const approvedData = await approvedRes.json();
        if (approvedData.success) {
          setApprovedDoctors(approvedData.doctors || []);
        }
      } catch (err) {
        console.error("❌ Error loading approved doctors:", err);
      }

      // Load Rejected Doctors
      try {
        const rejectedRes = await fetch(`${API_BASE_URL}/admin/doctors/rejected`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rejectedData = await rejectedRes.json();
        if (rejectedData.success) {
          setRejectedDoctors(rejectedData.doctors || []);
        }
      } catch (err) {
        console.error("❌ Error loading rejected doctors:", err);
      }

    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError(t('errorLoading') + error.message);
    }
  };

  // Refresh All Data
  const refreshAllData = async () => {
    setIsLoading(true);
    setError('');
    await loadAllData();
    await loadAppointmentAnalytics();
    setIsLoading(false);
  };

  const addNotification = (message) => {
    setNotifications(prev => [{ id: Date.now(), message, time: 'Just now', type: 'system' }, ...prev]);
  };

  // Approve Doctor
  const handleApproveDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to approve this doctor?')) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        addNotification(`✅ Doctor approved successfully`);
        await loadAllData();
        alert('Doctor approved successfully!');
      } else {
        alert(data.message || 'Failed to approve doctor');
      }
    } catch (error) {
      alert('Error approving doctor');
    } finally {
      setIsLoading(false);
    }
  };

  // Reject Doctor
  const handleRejectDoctor = async (doctorId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason || 'Registration rejected by admin' })
      });
      const data = await response.json();
      
      if (data.success) {
        addNotification(`❌ Doctor rejected`);
        await loadAllData();
        alert('Doctor rejected successfully!');
      } else {
        alert(data.message || 'Failed to reject doctor');
      }
    } catch (error) {
      alert('Error rejecting doctor');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor?')) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        addNotification(`🗑️ Doctor deleted`);
        await loadAllData();
        alert('Doctor deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete doctor');
      }
    } catch (error) {
      alert('Error deleting doctor');
    } finally {
      setIsLoading(false);
    }
  };

  // Block/Activate User
  const handleUserAction = async (userId, action) => {
    const confirmMsg = action === 'block' ? 'Block this user?' : 'Activate this user?';
    if (!window.confirm(confirmMsg)) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'block' ? 'block' : 'activate';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        addNotification(`User ${action}ed successfully`);
        await loadAllData();
        alert(`User ${action}ed successfully!`);
      } else {
        alert(data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      alert(`Error ${action}ing user`);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_email');
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  // Get statistics
  const getStats = () => {
    const activeUsers = users.filter(u => u.accountStatus === 'Active').length;
    const blockedUsers = users.filter(u => u.accountStatus === 'Blocked').length;
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.accountStatus === 'Active' && d.approvalStatus === 'Approved').length;
    const pendingCount = pendingDoctors.length;
    const approvedCount = approvedDoctors.length;
    const rejectedCount = rejectedDoctors.length;
    
    return { activeUsers, blockedUsers, totalDoctors, activeDoctors, pendingCount, approvedCount, rejectedCount };
  };

  const stats = getStats();

  if (loading) {
    return <div className="loading-screen">{t('loading')}</div>;
  }

  return (
    <div className={`admin-dashboard ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ <span>{t('admin')}</span></h2>
          <p>{t('dashboard')}</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${selectedTab === 'overview' ? 'active' : ''}`} onClick={() => setSelectedTab('overview')}>
            📊 {t('overview')}
          </button>
          <button className={`nav-item ${selectedTab === 'analytics' ? 'active' : ''}`} onClick={() => setSelectedTab('analytics')}>
            📈 {t('analytics')}
          </button>
          <button className={`nav-item ${selectedTab === 'users' ? 'active' : ''}`} onClick={() => setSelectedTab('users')}>
            👥 {t('users')} <span className="badge">{users.length}</span>
          </button>
          <button className={`nav-item ${selectedTab === 'doctors' ? 'active' : ''}`} onClick={() => setSelectedTab('doctors')}>
            👨‍⚕️ {t('allDoctors')} <span className="badge">{doctors.length}</span>
          </button>
          <button className={`nav-item ${selectedTab === 'pending' ? 'active' : ''}`} onClick={() => setSelectedTab('pending')}>
            ⏳ {t('pending')} <span className="badge pending">{pendingDoctors.length}</span>
          </button>
          <button className={`nav-item ${selectedTab === 'approved' ? 'active' : ''}`} onClick={() => setSelectedTab('approved')}>
            ✅ {t('approved')} <span className="badge approved">{approvedDoctors.length}</span>
          </button>
          <button className={`nav-item ${selectedTab === 'rejected' ? 'active' : ''}`} onClick={() => setSelectedTab('rejected')}>
            ❌ {t('rejected')} <span className="badge rejected">{rejectedDoctors.length}</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="refresh-btn" onClick={refreshAllData} disabled={isLoading}>
            🔄 {isLoading ? t('refreshing') : t('refreshData')}
          </button>
          <div className="sidebar-controls">
            <button className="mode-toggle" onClick={toggleDarkMode} title={isDarkMode ? t('lightMode') : t('darkMode')}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="lang-toggle" onClick={toggleLanguage}>
              {language === 'en' ? '🇧🇩' : '🇬🇧'}
            </button>
            <span className="lang-label">{language === 'en' ? t('bangla') : t('english')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h2>
            {selectedTab === 'overview' && `📊 ${t('dashboardOverview')}`}
            {selectedTab === 'analytics' && `📈 ${t('appointmentAnalytics')}`}
            {selectedTab === 'users' && `👥 ${t('userManagement')}`}
            {selectedTab === 'doctors' && `👨‍⚕️ ${t('allDoctorsList')}`}
            {selectedTab === 'pending' && `⏳ ${t('pendingDoctors')}`}
            {selectedTab === 'approved' && `✅ ${t('approvedDoctors')}`}
            {selectedTab === 'rejected' && `❌ ${t('rejectedDoctors')}`}
          </h2>
          
          <div className="topbar-actions">
            <div className="admin-profile">
              <span className="admin-name">👋 {adminName}</span>
              <div className="avatar">{adminName?.charAt(0) || 'A'}</div>
              <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>🚪</button>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              ❌ {error}
              <button onClick={refreshAllData} disabled={isLoading}>
                {t('retry')}
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{users.length}</h3>
                    <p>{t('totalUsers')}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👨‍⚕️</div>
                  <div className="stat-info">
                    <h3>{stats.totalDoctors}</h3>
                    <p>{t('totalDoctors')}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>{stats.approvedCount}</h3>
                    <p>{t('approved')}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{stats.pendingCount}</h3>
                    <p>{t('pending')}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❌</div>
                  <div className="stat-info">
                    <h3>{stats.rejectedCount}</h3>
                    <p>{t('rejected')}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-info">
                    <h3>{stats.activeDoctors}</h3>
                    <p>{t('activeDoctors')}</p>
                  </div>
                </div>
              </div>

              {/* Quick Appointment Stats */}
              {appointmentStats && (
                <div className="appointment-quick-stats">
                  <h3>📊 {t('quickAppointmentStats')}</h3>
                  <div className="quick-stats-grid">
                    <div className="quick-stat">
                      <span className="quick-stat-label">{t('total')}</span>
                      <span className="quick-stat-value">{appointmentStats.totalAppointments || 0}</span>
                    </div>
                    <div className="quick-stat">
                      <span className="quick-stat-label">{t('pendingAppointments')}</span>
                      <span className="quick-stat-value">{appointmentStats.pendingAppointments || 0}</span>
                    </div>
                    <div className="quick-stat">
                      <span className="quick-stat-label">{t('approvedAppointments')}</span>
                      <span className="quick-stat-value">{appointmentStats.approvedAppointments || 0}</span>
                    </div>
                    <div className="quick-stat">
                      <span className="quick-stat-label">{t('completedAppointments')}</span>
                      <span className="quick-stat-value">{appointmentStats.completedAppointments || 0}</span>
                    </div>
                  </div>
                  <button 
                    className="view-analytics-btn"
                    onClick={() => setSelectedTab('analytics')}
                  >
                    {t('viewFullAnalytics')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="admin-analytics">
              {analyticsLoading ? (
                <div className="loading-screen">
                  <div className="spinner"></div>
                  <p>{t('loading')}</p>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="analytics-stats-grid">
                    <div className="analytics-stat-card blue">
                      <span className="stat-label">📅 {t('total')}</span>
                      <span className="stat-number">{appointmentStats?.totalAppointments || 0}</span>
                    </div>
                    <div className="analytics-stat-card yellow">
                      <span className="stat-label">⏳ {t('pendingAppointments')}</span>
                      <span className="stat-number">{appointmentStats?.pendingAppointments || 0}</span>
                    </div>
                    <div className="analytics-stat-card green">
                      <span className="stat-label">✅ {t('approvedAppointments')}</span>
                      <span className="stat-number">{appointmentStats?.approvedAppointments || 0}</span>
                    </div>
                    <div className="analytics-stat-card emerald">
                      <span className="stat-label">✔️ {t('completedAppointments')}</span>
                      <span className="stat-number">{appointmentStats?.completedAppointments || 0}</span>
                    </div>
                    <div className="analytics-stat-card red">
                      <span className="stat-label">❌ {t('cancelledAppointments')}</span>
                      <span className="stat-number">{appointmentStats?.cancelledAppointments || 0}</span>
                    </div>
                    <div className="analytics-stat-card gray">
                      <span className="stat-label">🚫 {t('rejectedAppointments')}</span>
                      <span className="stat-number">{appointmentStats?.rejectedAppointments || 0}</span>
                    </div>
                  </div>

                  {/* Revenue Cards */}
                  <div className="revenue-cards">
                    <div className="revenue-card today">
                      <span className="revenue-label">💰 {t('todaysRevenue')}</span>
                      <span className="revenue-amount">৳{revenueData?.todayRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="revenue-card monthly">
                      <span className="revenue-label">📈 {t('monthlyRevenue')}</span>
                      <span className="revenue-amount">৳{revenueData?.monthlyRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="revenue-card yearly">
                      <span className="revenue-label">📊 {t('yearlyRevenue')}</span>
                      <span className="revenue-amount">৳{revenueData?.yearlyRevenue?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Today's Appointments */}
                  {todayAppointments && todayAppointments.length > 0 && (
                    <div className="section-card">
                      <h3>📋 {t('todaysAppointments')} ({todayAppointments.length})</h3>
                      <div className="table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>{t('patient')}</th>
                              <th>{t('doctor')}</th>
                              <th>{t('time')}</th>
                              <th>{t('status')}</th>
                              <th>{t('payment')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayAppointments.map((apt, index) => (
                              <tr key={index}>
                                <td>{apt.patient || 'Unknown'}</td>
                                <td>{apt.doctor || 'Unknown'}</td>
                                <td>{apt.time || 'N/A'}</td>
                                <td>
                                  <span className={`status-badge ${(apt.status || '').toLowerCase()}`}>
                                    {apt.status || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge ${(apt.payment || '').toLowerCase()}`}>
                                    {apt.payment || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Charts - Row 1 */}
                  <div className="charts-grid">
                    {/* Status Distribution */}
                    <div className="chart-card">
                      <h4>📊 {t('statusDistribution')}</h4>
                      <div className="status-bars">
                        {statusData && Object.keys(statusData).length > 0 ? (
                          Object.entries(statusData).map(([key, value]) => {
                            const total = appointmentStats?.totalAppointments || 1;
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            const colorMap = {
                              'Pending': '#f39c12',
                              'Approved': '#2ecc71',
                              'Completed': '#3498db',
                              'Cancelled': '#e74c3c',
                              'Rejected': '#95a5a6',
                              'OPENING': '#1abc9c'
                            };
                            
                            return (
                              <div key={key} className="status-bar-item">
                                <span>{key}</span>
                                <div className="bar-container">
                                  <div 
                                    className="bar" 
                                    style={{ 
                                      width: `${Math.max(percentage, 2)}%`,
                                      backgroundColor: colorMap[key] || '#6c5ce7',
                                      minWidth: value > 0 ? '30px' : '0'
                                    }}
                                  >
                                    {value > 0 && value}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-data-message">
                            <span className="no-data-icon">📊</span>
                            <p>{t('noStatusData')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Weekly Appointments */}
                    <div className="chart-card">
                      <h4>📈 {t('weeklyAppointments')}</h4>
                      <div className="weekly-bars">
                        {weeklyData && weeklyData.length > 0 ? (
                          weeklyData.map((item, index) => {
                            const maxValue = Math.max(...weeklyData.map(d => d.appointments), 1);
                            const percentage = (item.appointments / maxValue) * 100;
                            
                            return (
                              <div key={index} className="weekly-item">
                                <span>{item.date}</span>
                                <div className="bar-container">
                                  <div 
                                    className="bar weekly" 
                                    style={{ 
                                      width: `${Math.max(percentage, 2)}%`,
                                      minWidth: item.appointments > 0 ? '30px' : '0'
                                    }}
                                  >
                                    {item.appointments}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-data-message">
                            <span className="no-data-icon">📈</span>
                            <p>{t('noWeeklyData')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Charts - Row 2 */}
                  <div className="charts-grid">
                    {/* Monthly Appointments */}
                    <div className="chart-card">
                      <h4>📊 {t('monthlyAppointments')}</h4>
                      <div className="monthly-bars">
                        {monthlyData && monthlyData.length > 0 ? (
                          monthlyData.map((item, index) => {
                            const maxValue = Math.max(...monthlyData.map(d => d.appointments), 1);
                            const percentage = (item.appointments / maxValue) * 100;
                            
                            return (
                              <div key={index} className="monthly-item">
                                <span>{item.month}</span>
                                <div className="bar-container">
                                  <div 
                                    className="bar monthly" 
                                    style={{ 
                                      width: `${Math.max(percentage, 2)}%`,
                                      minWidth: item.appointments > 0 ? '30px' : '0'
                                    }}
                                  >
                                    {item.appointments}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-data-message">
                            <span className="no-data-icon">📊</span>
                            <p>{t('noMonthlyData')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Revenue Trend */}
                    <div className="chart-card">
                      <h4>📉 {t('revenueTrend')}</h4>
                      {revenueTrend && revenueTrend.length > 0 ? (
                        <div className="revenue-trend">
                          <div className="trend-container">
                            {revenueTrend.map((item, index) => {
                              const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);
                              const height = Math.max((item.revenue / maxRevenue) * 80, 2);
                              
                              return (
                                <div key={index} className="trend-point">
                                  <div 
                                    className="trend-bar" 
                                    style={{ 
                                      height: `${height}px`,
                                      minHeight: item.revenue > 0 ? '10px' : '0',
                                      backgroundColor: height > 50 ? '#2ecc71' : height > 25 ? '#f39c12' : '#e74c3c'
                                    }}
                                  />
                                  <span>{item.date}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="no-data-message">
                          <span className="no-data-icon">📉</span>
                          <p>{t('noRevenueData')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ✅ NEW SECTION: Health Records, Prescriptions & Medicine Cards */}
                  {/* ============================================================== */}
                  <div className="charts-grid">
                    <HealthRecordAnalytics data={healthRecordsData} loading={analyticsLoading} />
                    <PrescriptionAnalytics data={prescriptionsData} loading={analyticsLoading} />
                    <MedicineAnalytics data={medicinesData} loading={analyticsLoading} />
                  </div>
                  {/* ============================================================== */}
                  {/* ✅ END NEW SECTION */}
                  {/* ============================================================== */}

                  {/* Top Doctors & Top Patients */}
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h4>🏆 {t('topDoctors')}</h4>
                      {topDoctorsData && topDoctorsData.length > 0 ? (
                        topDoctorsData.map((doctor, index) => (
                          <div key={index} className="top-item">
                            <span>{index + 1}. {doctor.doctorName || 'Unknown'}</span>
                            <span className="count">{doctor.appointments || 0} {t('appts')}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">
                          <span className="no-data-icon">🏆</span>
                          <p>{t('noDoctorData')}</p>
                        </div>
                      )}
                    </div>

                    <div className="chart-card">
                      <h4>👤 {t('topPatients')}</h4>
                      {topPatientsData && topPatientsData.length > 0 ? (
                        topPatientsData.map((patient, index) => (
                          <div key={index} className="top-item">
                            <span>{index + 1}. {patient.patientName || 'Unknown'}</span>
                            <span className="count">{patient.appointments || 0} {t('appts')}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-data-message">
                          <span className="no-data-icon">👤</span>
                          <p>{t('noPatientData')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  <div className="section-card">
                    <h3>📋 {t('recentAppointments')}</h3>
                    
                    {/* Filters */}
                    <div className="filters-row">
                      <div className="filter-group">
                        <input 
                          type="text" 
                          placeholder={t('searchPatientDoctor')} 
                          value={recentSearch}
                          onChange={(e) => {
                            setRecentSearch(e.target.value);
                            loadRecentAppointments(1);
                          }}
                        />
                      </div>
                      <div className="filter-group">
                        <select 
                          value={recentFilter.status} 
                          onChange={(e) => {
                            setRecentFilter({ ...recentFilter, status: e.target.value });
                            loadRecentAppointments(1);
                          }}
                        >
                          <option value="All">{t('allStatus')}</option>
                          <option value="Pending">{t('pendingAppointments')}</option>
                          <option value="Approved">{t('approvedAppointments')}</option>
                          <option value="Completed">{t('completedAppointments')}</option>
                          <option value="Cancelled">{t('cancelledAppointments')}</option>
                          <option value="Rejected">{t('rejectedAppointments')}</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <select 
                          value={recentFilter.filterDate} 
                          onChange={(e) => {
                            setRecentFilter({ ...recentFilter, filterDate: e.target.value });
                            loadRecentAppointments(1);
                          }}
                        >
                          <option value="">{t('allDates')}</option>
                          <option value="Today">{t('today')}</option>
                          <option value="Yesterday">{t('yesterday')}</option>
                          <option value="This Week">{t('thisWeek')}</option>
                          <option value="This Month">{t('thisMonth')}</option>
                        </select>
                      </div>
                      <button 
                        className="refresh-btn"
                        onClick={() => loadRecentAppointments(recentPage)}
                      >
                        🔄 {t('refresh')}
                      </button>
                    </div>

                    <div className="table-container">
                      {recentAppointments && recentAppointments.length > 0 ? (
                        <>
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>{t('patient')}</th>
                                <th>{t('doctor')}</th>
                                <th>{t('date')}</th>
                                <th>{t('time')}</th>
                                <th>{t('status')}</th>
                                <th>{t('payment')}</th>
                                <th>{t('amount')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentAppointments.map((apt) => (
                                <tr key={apt.id || apt._id}>
                                  <td>{apt.patient || 'Unknown'}</td>
                                  <td>{apt.doctor || 'Unknown'}</td>
                                  <td>{apt.date || 'N/A'}</td>
                                  <td>{apt.time || 'N/A'}</td>
                                  <td>
                                    <span className={`status-badge ${(apt.status || '').toLowerCase()}`}>
                                      {apt.status || 'N/A'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`status-badge ${(apt.payment || '').toLowerCase()}`}>
                                      {apt.payment || 'N/A'}
                                    </span>
                                  </td>
                                  <td>৳{apt.amount || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {/* Pagination */}
                          {recentTotalPages > 1 && (
                            <div className="pagination">
                              <button 
                                onClick={() => loadRecentAppointments(recentPage - 1)}
                                disabled={recentPage <= 1}
                              >
                                {t('previous')}
                              </button>
                              <span>{t('page')} {recentPage} {t('of')} {recentTotalPages}</span>
                              <button 
                                onClick={() => loadRecentAppointments(recentPage + 1)}
                                disabled={recentPage >= recentTotalPages}
                              >
                                {t('next')}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="empty-state">{t('noAppointmentsFound')}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* All Doctors */}
          {selectedTab === 'doctors' && (
            <div className="admin-doctors">
              <h3>👨‍⚕️ {t('allDoctors')} ({doctors.length})</h3>
              
              {doctors.length === 0 ? (
                <div className="empty-state">
                  <p>{t('noDoctorData')}</p>
                  <p style={{ fontSize: '0.9em', color: '#888', marginTop: '8px' }}>
                    Doctors will appear here after they register and get approved.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('name')}</th>
                        <th>Specialization</th>
                        <th>Email</th>
                        <th>Hospital</th>
                        <th>Fee</th>
                        <th>{t('status')}</th>
                        <th>Approval</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td><strong>Dr. {doctor.firstName} {doctor.lastName}</strong></td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.email}</td>
                          <td>{doctor.hospital || 'N/A'}</td>
                          <td>${doctor.consultationFee || 0}</td>
                          <td>
                            <span className={`status-badge ${doctor.accountStatus === 'Active' ? 'active' : 'inactive'}`}>
                              {doctor.accountStatus === 'Active' ? '🟢' : '🔴'} {doctor.accountStatus || 'Active'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${doctor.approvalStatus === 'Approved' ? 'active' : doctor.approvalStatus === 'Pending' ? 'pending' : 'inactive'}`}>
                              {doctor.approvalStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="action-buttons">
                            {doctor.approvalStatus === 'Pending' && (
                              <>
                                <button className="approve-btn" onClick={() => handleApproveDoctor(doctor._id)} disabled={isLoading}>
                                  ✅ {t('approve')}
                                </button>
                                <button className="reject-btn" onClick={() => handleRejectDoctor(doctor._id)} disabled={isLoading}>
                                  ❌ {t('reject')}
                                </button>
                              </>
                            )}
                            <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor._id)} disabled={isLoading}>
                              🗑️ {t('delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pending Doctors */}
          {selectedTab === 'pending' && (
            <div className="admin-doctors">
              <h3>⏳ {t('pendingDoctors')} ({pendingDoctors.length})</h3>
              {pendingDoctors.length === 0 ? (
                <div className="empty-state">✅ No pending registrations</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('name')}</th>
                        <th>Specialization</th>
                        <th>Email</th>
                        <th>Hospital</th>
                        <th>Experience</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDoctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td><strong>Dr. {doctor.firstName} {doctor.lastName}</strong></td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.email}</td>
                          <td>{doctor.hospital}</td>
                          <td>{doctor.experience} yrs</td>
                          <td className="action-buttons">
                            <button className="approve-btn" onClick={() => handleApproveDoctor(doctor._id)} disabled={isLoading}>
                              ✅ {t('approve')}
                            </button>
                            <button className="reject-btn" onClick={() => handleRejectDoctor(doctor._id)} disabled={isLoading}>
                              ❌ {t('reject')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Approved Doctors */}
          {selectedTab === 'approved' && (
            <div className="admin-doctors">
              <h3>✅ {t('approvedDoctors')} ({approvedDoctors.length})</h3>
              {approvedDoctors.length === 0 ? (
                <div className="empty-state">No approved doctors</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('name')}</th>
                        <th>Specialization</th>
                        <th>Hospital</th>
                        <th>Fee</th>
                        <th>{t('status')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedDoctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td><strong>Dr. {doctor.firstName} {doctor.lastName}</strong></td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.hospital}</td>
                          <td>${doctor.consultationFee}</td>
                          <td><span className="status-badge active">🟢 Active</span></td>
                          <td>
                            <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor._id)} disabled={isLoading}>
                              🗑️ {t('delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rejected Doctors */}
          {selectedTab === 'rejected' && (
            <div className="admin-doctors">
              <h3>❌ {t('rejectedDoctors')} ({rejectedDoctors.length})</h3>
              {rejectedDoctors.length === 0 ? (
                <div className="empty-state">No rejected doctors</div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('name')}</th>
                        <th>Specialization</th>
                        <th>Reason</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedDoctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td><strong>Dr. {doctor.firstName} {doctor.lastName}</strong></td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.rejectionReason || 'Not specified'}</td>
                          <td>
                            <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor._id)} disabled={isLoading}>
                              🗑️ {t('delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {selectedTab === 'users' && (
            <div className="admin-users">
              <h3>👥 {t('users')} ({users.length})</h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t('name')}</th>
                      <th>Email</th>
                      <th>{t('status')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user._id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status-badge ${user.accountStatus === 'Active' ? 'active' : 'inactive'}`}>
                              {user.accountStatus === 'Active' ? '🟢' : '🔴'} {user.accountStatus || 'Active'}
                            </span>
                          </td>
                          <td>
                            {user.accountStatus === 'Active' ? (
                              <button className="block-btn" onClick={() => handleUserAction(user._id, 'block')} disabled={isLoading}>
                                🚫 {t('block')}
                              </button>
                            ) : (
                              <button className="activate-btn" onClick={() => handleUserAction(user._id, 'activate')} disabled={isLoading}>
                                ✅ {t('activate')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('confirmLogout')}</h3>
            <p>{t('logoutConfirm')}</p>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>{t('cancel')}</button>
              <button className="logout-confirm-btn" onClick={handleLogout}>{t('logout')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;