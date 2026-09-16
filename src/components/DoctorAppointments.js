// DoctorAppointments.js - Complete Fixed Version with Proper API Endpoints

import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope,
  FaVideo, FaMapMarkerAlt, FaCheck, FaTimes, FaEllipsisV,
  FaSearch, FaPlus, FaFilter, FaChevronLeft, FaChevronRight,
  FaDownload, FaPrint, FaEdit, FaTrash, FaEye, FaMoon, FaSun,
  FaUserCheck, FaUserClock, FaUserSlash, FaCalendarCheck,
  FaHistory, FaChartLine, FaArrowRight, FaBell, FaClock as FaClockIcon,
  FaStethoscope, FaSyringe, FaPills, FaFileAlt, FaExclamationTriangle,
  FaUserMd, FaBed, FaHeartbeat, FaAmbulance, FaSpinner,
  FaCheckCircle, FaTimesCircle, FaSave, FaUserEdit, FaNotesMedical,
  FaArrowLeft
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import "../styles/DoctorAppointments.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function DoctorAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  
  // State for appointments from API
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [appointmentLimit, setAppointmentLimit] = useState(10);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [apiError, setApiError] = useState(null);
  const itemsPerPage = 5;

  // =============================================
  // GET TOKEN - Check multiple storage locations
  // =============================================
  const getToken = () => {
    const token = localStorage.getItem("token") || 
                  localStorage.getItem("accessToken") || 
                  localStorage.getItem("doctorToken") ||
                  localStorage.getItem("authToken");
    
    console.log("🔑 Token found:", token ? "Yes" : "No");
    return token;
  };

  // =============================================
  // STATUS UTILITY FUNCTIONS - FIXED for "OPENING"
  // =============================================
  
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    
    // ✅ Handle ALL possible status values including "OPENING"
    const statusMap = {
      'Pending': 'pending',
      'Approved': 'confirmed',
      'Rejected': 'rejected',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'OPENING': 'pending',      // ✅ Map "OPENING" to "pending"
      'opening': 'pending',       // ✅ Map "opening" to "pending"
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'APPROVED': 'confirmed',
      'REJECTED': 'rejected',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
    };
    
    return statusMap[status] || status.toLowerCase();
  };

  const getStatusDisplay = (status) => {
    const normalized = normalizeStatus(status);
    const displayMap = {
      en: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        approved: 'Confirmed',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      bn: {
        pending: 'বিচারাধীন',
        confirmed: 'নিশ্চিত',
        approved: 'নিশ্চিত',
        rejected: 'প্রত্যাখ্যাত',
        completed: 'সম্পন্ন',
        cancelled: 'বাতিল'
      }
    };
    return displayMap[lang]?.[normalized] || normalized || 'Unknown';
  };

  const getStatusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    const classes = {
      pending: 'status-badge pending',
      confirmed: 'status-badge confirmed',
      approved: 'status-badge confirmed',
      rejected: 'status-badge rejected',
      completed: 'status-badge completed',
      cancelled: 'status-badge cancelled'
    };
    return classes[normalized] || 'status-badge';
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);
    switch(normalized) {
      case "confirmed":
      case "approved":
        return <FaCheck />;
      case "pending":
        return <FaClockIcon />;
      case "completed":
        return <FaCheck className="double" />;
      case "rejected":
      case "cancelled":
        return <FaTimes />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    const normalized = type?.toLowerCase();
    return normalized === "video" ? <FaVideo /> : <FaMapMarkerAlt />;
  };

  // =============================================
  // FORMAT DATE - FIXED
  // =============================================
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString(lang === "bn" ? 'bn-BD' : 'en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return "N/A";
    }
  };

  // =============================================
  // FORMAT TIME - COMPLETELY FIXED
  // =============================================
  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    
    console.log("⏰ Input time:", timeStr, "Type:", typeof timeStr);
    
    // Case 1: Already formatted like "10:00 AM" or "02:30 PM"
    if (typeof timeStr === 'string' && /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
      return timeStr.toUpperCase();
    }
    
    // Case 2: Time string like "10:00" or "14:30" or "10:00:00"
    if (typeof timeStr === 'string') {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          const formatted = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          console.log("✅ Formatted time:", formatted);
          return formatted;
        }
      }
    }
    
    // Case 3: Try to create a Date object (for ISO strings)
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
        console.log("✅ Formatted from Date:", formatted);
        return formatted;
      }
    } catch (e) {
      console.log("❌ Date parse error:", e);
    }
    
    // Case 4: Return as is
    console.log("⚠️ Returning original:", timeStr);
    return timeStr;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    try {
      const today = new Date().toISOString().split('T')[0];
      const aptDate = new Date(dateStr).toISOString().split('T')[0];
      return aptDate === today;
    } catch (e) {
      return false;
    }
  };

  // =============================================
  // LOAD DOCTOR APPOINTMENTS FROM API - FIXED
  // =============================================
  const loadDoctorAppointments = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const token = getToken();
      
      console.log("📥 Fetching appointments from API...");
      console.log("🔑 Token present:", !!token);
      
      if (!token) {
        console.error("❌ No token found in localStorage!");
        setApiError("You are not logged in. Please login again.");
        setIsLoading(false);
        
        const userRole = localStorage.getItem("userRole");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        
        if (userRole !== "doctor" || isAuthenticated !== "true") {
          setTimeout(() => navigate("/login"), 2000);
        }
        return;
      }

      console.log("📤 Making API request with token...");

      // ✅ FIXED: Changed from /appointment/doctor to /appointments/doctor
      const response = await fetch(`${API_BASE_URL}/appointments/doctor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 Response status:", response.status);

      // ✅ Handle 401 Unauthorized
      if (response.status === 401) {
        console.error("❌ Unauthorized - Token invalid or expired");
        localStorage.clear();
        setApiError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        const doctorAppointments = data.appointments || [];
        console.log("✅ Loaded", doctorAppointments.length, "real appointments from API");
        
        // ✅ LOG THE TIME DATA FOR DEBUGGING
        doctorAppointments.forEach((apt, index) => {
          console.log(`📋 Appointment ${index + 1}:`);
          console.log(`  - timeSlot: ${apt.timeSlot} (${typeof apt.timeSlot})`);
          console.log(`  - appointmentDate: ${apt.appointmentDate}`);
          console.log(`  - status: ${apt.status}`);
        });
        
        // Transform API data to match frontend format
        const transformedAppointments = doctorAppointments.map(apt => ({
          id: apt._id || apt.id,
          patientName: apt.patientName || apt.patient?.name || "Unknown Patient",
          patientId: apt.patientId || apt.patient?._id,
          patientEmail: apt.patientEmail || apt.patient?.email || "N/A",
          patientPhone: apt.patientPhone || apt.patient?.phone || "N/A",
          patientImage: apt.patientImage || apt.patient?.profileImage,
          date: apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : apt.date,
          time: apt.timeSlot || apt.time || "09:00 AM",
          duration: apt.duration || 30,
          type: apt.consultationMode || apt.type || "in-person",
          status: normalizeStatus(apt.status),
          reason: apt.reason || "General Checkup",
          notes: apt.doctorNotes || apt.notes || "",
          prescription: apt.prescription || "",
          doctorResponse: apt.doctorResponse || "",
          approvedAt: apt.approvedAt,
          rejectedAt: apt.rejectedAt,
          completedAt: apt.completedAt,
          createdAt: apt.createdAt,
          paymentStatus: apt.paymentStatus,
          paymentAmount: apt.paymentAmount,
          meetingLink: apt.meetingLink,
          age: apt.age || 35,
          gender: apt.gender || "Not Specified",
          diagnosis: apt.diagnosis || apt.reason || "General"
        }));

        setAppointments(transformedAppointments);
        setFilteredAppointments(transformedAppointments);
        
      } else {
        console.error("API Error:", data.message);
        setApiError(data.message || "Failed to load appointments");
        setAppointments([]);
        setFilteredAppointments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setApiError(error.message || "Network error - Please check your connection");
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================
  // APPOINTMENT ACTIONS (Approve/Reject/Complete) - FIXED
  // =============================================

  const handleApproveAppointment = async (appointmentId) => {
    try {
      setIsProcessing(true);
      const token = getToken();
      
      if (!token) {
        alert("You are not logged in. Please login again.");
        return;
      }

      console.log("📤 Approving appointment:", appointmentId);

      // ✅ FIXED: Changed from /appointment/approve to /appointments/approve
      const response = await fetch(`${API_BASE_URL}/appointments/approve/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log("📥 Approve response:", data);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment approved successfully!' : 'অ্যাপয়েন্টমেন্ট সফলভাবে অনুমোদিত হয়েছে!');
        loadDoctorAppointments();
      } else {
        alert(data.message || "Failed to approve appointment.");
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert("Failed to approve appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const reason = prompt(
      lang === 'en' 
        ? 'Please provide a reason for rejection:' 
        : 'বাতিলের কারণ লিখুন:'
    );

    if (reason === null) return;

    try {
      setIsProcessing(true);
      const token = getToken();
      
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      console.log("📤 Rejecting appointment:", appointmentId);

      // ✅ FIXED: Changed from /appointment/reject to /appointments/reject
      const response = await fetch(`${API_BASE_URL}/appointments/reject/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      console.log("📥 Reject response:", data);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment rejected.' : 'অ্যাপয়েন্টমেন্ট প্রত্যাখ্যান করা হয়েছে।');
        loadDoctorAppointments();
      } else {
        alert(data.message || "Failed to reject appointment.");
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert("Failed to reject appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ FIXED: handleCompleteAppointment - সরাসরি API কল করবে, কোনো prompt দেখাবে না
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setIsProcessing(true);
      const token = getToken();
      
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      console.log("📤 Completing appointment:", appointmentId);

      // ✅ FIXED: Changed from /appointment/complete to /appointments/complete
      const response = await fetch(`${API_BASE_URL}/appointments/complete/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prescription: "",
          doctorNotes: `Completed on ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();
      console.log("📥 Complete response:", data);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment completed!' : 'অ্যাপয়েন্টমেন্ট সম্পন্ন হয়েছে!');
        loadDoctorAppointments();
      } else {
        alert(data.message || "Failed to complete appointment.");
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert("Failed to complete appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // =============================================
  // LOAD DATA ON MOUNT
  // =============================================
  useEffect(() => {
    const loadDoctorInfo = () => {
      try {
        const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");
        setDoctorInfo(doctorData);
      } catch (e) {
        console.error("Error loading doctor info:", e);
      }
    };

    loadDoctorInfo();
    loadDoctorAppointments();
    loadAppointmentLimit();
  }, []);

  const loadAppointmentLimit = () => {
    const savedLimit = localStorage.getItem("appointmentLimit");
    if (savedLimit) {
      setAppointmentLimit(parseInt(savedLimit));
    }
  };

  // =============================================
  // FILTER APPOINTMENTS
  // =============================================
  useEffect(() => {
    let filtered = appointments;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(term) ||
        app.reason.toLowerCase().includes(term) ||
        app.diagnosis?.toLowerCase().includes(term) ||
        app.patientEmail?.toLowerCase().includes(term) ||
        app.patientPhone?.includes(term)
      );
    }
    
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [appointments, filterStatus, searchTerm]);

  // =============================================
  // NAVIGATION HELPERS
  // =============================================
  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const startConsultation = (appointment) => {
    if (appointment.type === "video") {
      navigate(`/doctor/video-call/${appointment.id}`);
    } else {
      alert(`Starting in-person consultation with ${appointment.patientName}`);
    }
  };

  // =============================================
  // PAGINATION
  // =============================================
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAppointments.slice(startIndex, endIndex);

  // =============================================
  // STATS
  // =============================================
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed" || a.status === "approved").length,
    pending: appointments.filter(a => a.status === "pending").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    rejected: appointments.filter(a => a.status === "rejected").length,
    today: appointments.filter(a => isToday(a.date)).length
  };

  // =============================================
  // TRANSLATIONS
  // =============================================
  const text = {
    en: {
      appointments: "Appointments",
      total: "Total",
      confirmed: "Confirmed",
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
      export: "Export",
      print: "Print",
      search: "Search appointments...",
      all: "All",
      patient: "Patient",
      date: "Date",
      time: "Time",
      type: "Type",
      status: "Status",
      reason: "Reason",
      actions: "Actions",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      cancel: "Cancel",
      startConsultation: "Start Consultation",
      videoCall: "Video Call",
      inPerson: "In-person",
      schedule: "Schedule",
      today: "Today",
      upcoming: "Upcoming",
      past: "Past",
      noAppointments: "No appointments found",
      adjustFilters: "Try adjusting your filters",
      loading: "Loading appointments...",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      listView: "List View",
      calendarView: "Calendar View",
      timelineView: "Timeline View",
      duration_min: "min",
      phone: "Phone",
      email: "Email",
      viewAll: "View All",
      noUpcoming: "No upcoming appointments",
      todayAppointments: "Today's Appointments",
      upcomingAppointments: "Upcoming Appointments",
      completedAppointments: "Completed",
      cancelledAppointments: "Cancelled",
      setLimit: "Set Appointment Limit",
      setDailyLimit: "Set Daily Appointment Limit",
      currentLimit: "Current Limit",
      appointmentsToday: "Appointments Today",
      limitReached: "Appointment Limit Reached!",
      limitReachedMessage: "You have reached the maximum number of appointments for today.",
      limit: "Limit",
      updateLimit: "Update Limit",
      appointmentsPerDay: "appointments per day",
      warning: "Warning",
      approve: "Approve",
      reject: "Reject",
      complete: "Complete",
      noAccess: "You do not have permission to create new appointments",
      appointmentDetails: "Appointment Details",
      patientInfo: "Patient Information",
      appointmentInfo: "Appointment Information",
      close: "Close",
      deleteAppointment: "Delete Appointment",
      confirmDelete: "Are you sure you want to delete this appointment?",
      cannotUndo: "This action cannot be undone.",
      deleteConfirm: "Delete Appointment",
      editAppointment: "Edit Appointment",
      newAppointmentTitle: "New Appointment",
      patientName: "Patient Name",
      selectPatient: "Select Patient",
      appointmentDate: "Appointment Date",
      appointmentTime: "Appointment Time",
      duration: "Duration",
      appointmentType: "Appointment Type",
      notes: "Notes",
      additionalNotes: "Additional notes...",
      create: "Create Appointment",
      update: "Update Appointment",
      doctorResponse: "Doctor's Response",
      prescription: "Prescription",
      approvedAt: "Approved At",
      completedAt: "Completed At",
      rejectedAt: "Rejected At",
      paymentStatus: "Payment Status",
      paymentAmount: "Payment Amount",
      limitSetSuccess: "Appointment limit updated successfully!",
      dailyLimit: "Daily Limit",
      backToDashboard: "Back to Dashboard"
    },
    bn: {
      appointments: "অ্যাপয়েন্টমেন্ট",
      total: "মোট",
      confirmed: "নিশ্চিত",
      pending: "বিচারাধীন",
      completed: "সম্পন্ন",
      cancelled: "বাতিল",
      rejected: "প্রত্যাখ্যাত",
      export: "এক্সপোর্ট",
      print: "প্রিন্ট",
      search: "অ্যাপয়েন্টমেন্ট খুঁজুন...",
      all: "সব",
      patient: "রোগী",
      date: "তারিখ",
      time: "সময়",
      type: "ধরন",
      status: "স্ট্যাটাস",
      reason: "কারণ",
      actions: "ক্রিয়া",
      viewDetails: "বিস্তারিত দেখুন",
      edit: "সম্পাদনা করুন",
      delete: "মুছুন",
      confirm: "নিশ্চিত করুন",
      cancel: "বাতিল করুন",
      startConsultation: "পরামর্শ শুরু করুন",
      videoCall: "ভিডিও কল",
      inPerson: "সাক্ষাৎ",
      schedule: "সময়সূচী",
      today: "আজ",
      upcoming: "আগামী",
      past: "অতীত",
      noAppointments: "কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি",
      adjustFilters: "আপনার ফিল্টার সামঞ্জস্য করুন",
      loading: "অ্যাপয়েন্টমেন্ট লোড হচ্ছে...",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      listView: "তালিকা দৃশ্য",
      calendarView: "ক্যালেন্ডার দৃশ্য",
      timelineView: "টাইমলাইন দৃশ্য",
      duration_min: "মিনিট",
      phone: "ফোন",
      email: "ইমেল",
      viewAll: "সব দেখুন",
      noUpcoming: "কোন আগামী অ্যাপয়েন্টমেন্ট নেই",
      todayAppointments: "আজকের অ্যাপয়েন্টমেন্ট",
      upcomingAppointments: "আগামী অ্যাপয়েন্টমেন্ট",
      completedAppointments: "সম্পন্ন",
      cancelledAppointments: "বাতিল",
      setLimit: "অ্যাপয়েন্টমেন্ট সীমা নির্ধারণ করুন",
      setDailyLimit: "দৈনিক অ্যাপয়েন্টমেন্ট সীমা নির্ধারণ করুন",
      currentLimit: "বর্তমান সীমা",
      appointmentsToday: "আজকের অ্যাপয়েন্টমেন্ট",
      limitReached: "অ্যাপয়েন্টমেন্ট সীমা পূর্ণ!",
      limitReachedMessage: "আপনি আজকের জন্য সর্বোচ্চ অ্যাপয়েন্টমেন্ট সংখ্যায় পৌঁছেছেন।",
      limit: "সীমা",
      updateLimit: "সীমা আপডেট করুন",
      appointmentsPerDay: "প্রতিদিন অ্যাপয়েন্টমেন্ট",
      warning: "সতর্কতা",
      approve: "অনুমোদন করুন",
      reject: "প্রত্যাখ্যান করুন",
      complete: "সম্পন্ন করুন",
      noAccess: "আপনার নতুন অ্যাপয়েন্টমেন্ট তৈরি করার অনুমতি নেই",
      appointmentDetails: "অ্যাপয়েন্টমেন্টের বিবরণ",
      patientInfo: "রোগীর তথ্য",
      appointmentInfo: "অ্যাপয়েন্টমেন্টের তথ্য",
      close: "বন্ধ করুন",
      deleteAppointment: "অ্যাপয়েন্টমেন্ট মুছুন",
      confirmDelete: "আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্টটি মুছতে চান?",
      cannotUndo: "এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।",
      deleteConfirm: "অ্যাপয়েন্টমেন্ট মুছুন",
      editAppointment: "অ্যাপয়েন্টমেন্ট সম্পাদনা করুন",
      newAppointmentTitle: "নতুন অ্যাপয়েন্টমেন্ট",
      patientName: "রোগীর নাম",
      selectPatient: "রোগী নির্বাচন করুন",
      appointmentDate: "অ্যাপয়েন্টমেন্টের তারিখ",
      appointmentTime: "অ্যাপয়েন্টমেন্টের সময়",
      duration: "সময়কাল",
      appointmentType: "অ্যাপয়েন্টমেন্টের ধরন",
      notes: "নোট",
      additionalNotes: "অতিরিক্ত নোট...",
      create: "অ্যাপয়েন্টমেন্ট তৈরি করুন",
      update: "অ্যাপয়েন্টমেন্ট আপডেট করুন",
      doctorResponse: "ডাক্তারের প্রতিক্রিয়া",
      prescription: "প্রেসক্রিপশন",
      approvedAt: "অনুমোদিত হয়েছে",
      completedAt: "সম্পন্ন হয়েছে",
      rejectedAt: "প্রত্যাখ্যান করা হয়েছে",
      paymentStatus: "পেমেন্ট স্ট্যাটাস",
      paymentAmount: "পেমেন্টের পরিমাণ",
      limitSetSuccess: "অ্যাপয়েন্টমেন্ট সীমা সফলভাবে আপডেট হয়েছে!",
      dailyLimit: "দৈনিক সীমা",
      backToDashboard: "ড্যাশবোর্ডে ফিরে যান"
    }
  };

  // =============================================
  // RENDER
  // =============================================
  if (isLoading) {
    return (
      <div className={`doctor-appointments ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{text[lang].loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`doctor-appointments ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Top Bar */}
      <div className="appointments-topbar">
        <div className="topbar-left">
          {/* Back Button - Navigates to Doctor Dashboard */}
          <button 
            className="back-to-dashboard-btn"
            onClick={() => navigate('/doctor-dashboard')}
            title={text[lang].backToDashboard}
          >
            <FaArrowLeft /> <span>{text[lang].backToDashboard}</span>
          </button>
          <h2><FaCalendarAlt className="page-icon" /> {text[lang].appointments}</h2>
          <p className="topbar-subtitle">
            {appointments.length} appointments • {stats.today} today
          </p>
        </div>
        <div className="topbar-right">
          <div className="view-mode-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={text[lang].listView}
            >
              <FaCalendarAlt /> List
            </button>
            <button 
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title={text[lang].calendarView}
            >
              <FaCalendarCheck /> Calendar
            </button>
            <button 
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title={text[lang].timelineView}
            >
              <FaClock /> Timeline
            </button>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? text[lang].lightMode : text[lang].darkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? text[lang].lightMode : text[lang].darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-card-icon"><FaCalendarAlt /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.total}</span>
            <span className="stat-card-label">{text[lang].total}</span>
          </div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-card-icon"><FaCheck /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.confirmed}</span>
            <span className="stat-card-label">{text[lang].confirmed}</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-icon"><FaClockIcon /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.pending}</span>
            <span className="stat-card-label">{text[lang].pending}</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-card-icon"><FaHistory /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.completed}</span>
            <span className="stat-card-label">{text[lang].completed}</span>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-card-icon"><FaTimes /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.rejected + stats.cancelled}</span>
            <span className="stat-card-label">{text[lang].rejected}/{text[lang].cancelled}</span>
          </div>
        </div>
        <div className="stat-card today">
          <div className="stat-card-icon"><FaCalendarCheck /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.today}</span>
            <span className="stat-card-label">{text[lang].today}</span>
            <span className="stat-card-limit">Limit: {appointmentLimit}</span>
          </div>
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="api-error-banner">
          <FaExclamationTriangle />
          <span>Error: {apiError}</span>
          <button onClick={loadDoctorAppointments}>Retry</button>
        </div>
      )}

      {/* Limit Warning Banner */}
      {stats.today >= appointmentLimit && appointmentLimit > 0 && stats.today > 0 && (
        <div className="limit-warning-banner">
          <FaExclamationTriangle />
          <span>{text[lang].limitReached}</span>
          <span>{text[lang].limitReachedMessage}</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="actions-left">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder={text[lang].search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <div className="filter-group">
            <button 
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              {text[lang].all} ({stats.total})
            </button>
            <button 
              className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
              onClick={() => setFilterStatus("pending")}
            >
              {text[lang].pending} ({stats.pending})
            </button>
            <button 
              className={`filter-btn ${filterStatus === "confirmed" ? "active" : ""}`}
              onClick={() => setFilterStatus("confirmed")}
            >
              {text[lang].confirmed} ({stats.confirmed})
            </button>
            <button 
              className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
              onClick={() => setFilterStatus("completed")}
            >
              {text[lang].completed} ({stats.completed})
            </button>
            <button 
              className={`filter-btn ${filterStatus === "rejected" ? "active" : ""}`}
              onClick={() => setFilterStatus("rejected")}
            >
              {text[lang].rejected} ({stats.rejected})
            </button>
            <button 
              className={`filter-btn ${filterStatus === "cancelled" ? "active" : ""}`}
              onClick={() => setFilterStatus("cancelled")}
            >
              {text[lang].cancelled} ({stats.cancelled})
            </button>
          </div>
        </div>
        <div className="actions-right">
          <button className="btn-secondary" onClick={() => setShowLimitModal(true)}>
            <FaUserMd /> {text[lang].setLimit}
          </button>
          <button className="btn-secondary">
            <FaDownload /> {text[lang].export}
          </button>
          <button className="btn-secondary" onClick={() => window.print()}>
            <FaPrint /> {text[lang].print}
          </button>
        </div>
      </div>

      {/* Appointments Content */}
      <div className="appointments-content">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>No Appointments Found</h3>
            <p>You don't have any appointments booked yet.</p>
            <p className="empty-sub">Patients will appear here once they book appointments with you.</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="empty-state">
            <FaSearch className="empty-icon" />
            <h3>No matching appointments</h3>
            <p>{text[lang].adjustFilters}</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="table-wrapper">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>{text[lang].patient}</th>
                      <th>{text[lang].date}</th>
                      <th>{text[lang].time}</th>
                      <th>{text[lang].type}</th>
                      <th>{text[lang].status}</th>
                      <th>{text[lang].reason}</th>
                      <th>{text[lang].actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(appointment => (
                      <tr key={appointment.id} className={isToday(appointment.date) ? "today" : ""}>
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar small">
                              {appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="patient-name">{appointment.patientName}</div>
                              <div className="patient-contact">
                                <FaPhone /> {appointment.patientPhone || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <FaCalendarAlt />
                            <span>{formatDate(appointment.date)}</span>
                            {isToday(appointment.date) && <span className="today-badge">Today</span>}
                          </div>
                        </td>
                        <td>
                          <div className="time-cell">
                            <FaClock />
                            <span>{formatTime(appointment.time)}</span>
                            <span className="duration">({appointment.duration} {text[lang].duration_min})</span>
                          </div>
                        </td>
                        <td>
                          <span className="appointment-type">
                            {getTypeIcon(appointment.type)}
                            {appointment.type === "video" ? text[lang].videoCall : text[lang].inPerson}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            {getStatusDisplay(appointment.status)}
                          </span>
                        </td>
                        <td>
                          <div className="reason-cell">
                            <span>{appointment.reason}</span>
                            <span className="diagnosis">{appointment.diagnosis}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view"
                              onClick={() => openViewModal(appointment)}
                              title={text[lang].viewDetails}
                              disabled={isProcessing}
                            >
                              <FaEye />
                            </button>

                            {appointment.status === 'pending' && (
                              <>
                                <button 
                                  className="action-btn approve"
                                  onClick={() => handleApproveAppointment(appointment.id)}
                                  disabled={isProcessing}
                                  title={text[lang].approve}
                                >
                                  <FaCheck />
                                </button>
                                <button 
                                  className="action-btn reject"
                                  onClick={() => handleRejectAppointment(appointment.id)}
                                  disabled={isProcessing}
                                  title={text[lang].reject}
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}

                            {(appointment.status === 'confirmed' || appointment.status === 'approved') && (
                              <>
                                <button 
                                  className="action-btn complete"
                                  onClick={() => handleCompleteAppointment(appointment.id)}
                                  disabled={isProcessing}
                                  title={text[lang].complete}
                                >
                                  <FaCheck />
                                </button>
                                {appointment.type === 'video' && (
                                  <button 
                                    className="action-btn video"
                                    onClick={() => startConsultation(appointment)}
                                    title={text[lang].videoCall}
                                  >
                                    <FaVideo />
                                  </button>
                                )}
                              </>
                            )}

                            <button 
                              className="action-btn delete"
                              onClick={() => openDeleteModal(appointment)}
                              title={text[lang].delete}
                              disabled={isProcessing}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="calendar-view">
                <div className="calendar-header">
                  <button className="nav-btn" onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}>
                    <FaChevronLeft />
                  </button>
                  <h3>{selectedDate.toLocaleDateString(lang === "bn" ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button className="nav-btn" onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}>
                    <FaChevronRight />
                  </button>
                  <button className="today-btn" onClick={() => setSelectedDate(new Date())}>
                    {text[lang].today}
                  </button>
                </div>
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  {(() => {
                    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startDay = firstDay.getDay();
                    const days = [];
                    
                    for (let i = 0; i < startDay; i++) {
                      days.push(null);
                    }
                    
                    for (let i = 1; i <= daysInMonth; i++) {
                      days.push(i);
                    }
                    
                    return days.map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                      }
                      
                      const dateObj = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                      const dateString = dateObj.toISOString().split('T')[0];
                      const dayAppointments = appointments.filter(a => a.date === dateString);
                      const isTodayDate = new Date().toISOString().split('T')[0] === dateString;
                      
                      return (
                        <div key={day} className={`calendar-day ${isTodayDate ? 'today' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}>
                          <div className="calendar-day-number">{day}</div>
                          {dayAppointments.length > 0 && (
                            <div className="calendar-day-appointments">
                              {dayAppointments.slice(0, 2).map(apt => (
                                <div key={apt.id} className="calendar-day-appointment" 
                                     style={{ backgroundColor: apt.status === 'confirmed' ? '#48bb78' : apt.status === 'pending' ? '#ed8936' : '#a0aec0' }}>
                                  <span className="appointment-dot"></span>
                                  <span className="appointment-time">{formatTime(apt.time)}</span>
                                </div>
                              ))}
                              {dayAppointments.length > 2 && (
                                <div className="calendar-day-more">+{dayAppointments.length - 2} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="timeline-view">
                <div className="timeline-header">
                  <h3>{text[lang].todayAppointments}</h3>
                  <span className="timeline-date">{new Date().toLocaleDateString(lang === "bn" ? 'bn-BD' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="timeline-list">
                  {currentItems
                    .filter(a => isToday(a.date))
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => (
                      <div key={appointment.id} className="timeline-item">
                        <div className="timeline-time">
                          <span className="time">{formatTime(appointment.time)}</span>
                          <span className="duration">{appointment.duration} {text[lang].duration_min}</span>
                        </div>
                        <div className="timeline-line">
                          <div className="timeline-dot" style={{ 
                            backgroundColor: appointment.status === 'confirmed' ? '#48bb78' : 
                                          appointment.status === 'pending' ? '#ed8936' : '#a0aec0' 
                          }}></div>
                          <div className="timeline-line-connector"></div>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header-content">
                            <h4>{appointment.patientName}</h4>
                            <span className={getStatusBadgeClass(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              {getStatusDisplay(appointment.status)}
                            </span>
                          </div>
                          <p className="timeline-reason">{appointment.reason}</p>
                          <div className="timeline-meta">
                            <span><FaPhone /> {appointment.patientPhone || "N/A"}</span>
                            <span>{getTypeIcon(appointment.type)} {appointment.type === "video" ? text[lang].videoCall : text[lang].inPerson}</span>
                          </div>
                          <div className="timeline-actions">
                            <button className="action-btn view" onClick={() => openViewModal(appointment)}>
                              <FaEye /> {text[lang].viewDetails}
                            </button>
                            {appointment.status === 'pending' && (
                              <>
                                <button className="action-btn approve" onClick={() => handleApproveAppointment(appointment.id)} disabled={isProcessing}>
                                  <FaCheck /> {text[lang].approve}
                                </button>
                                <button className="action-btn reject" onClick={() => handleRejectAppointment(appointment.id)} disabled={isProcessing}>
                                  <FaTimes /> {text[lang].reject}
                                </button>
                              </>
                            )}
                            {(appointment.status === 'confirmed' || appointment.status === 'approved') && (
                              <button className="action-btn complete" onClick={() => handleCompleteAppointment(appointment.id)} disabled={isProcessing}>
                                <FaCheck /> {text[lang].complete}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {currentItems.filter(a => isToday(a.date)).length === 0 && (
                    <div className="empty-state">
                      <p>{text[lang].noUpcoming}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaCalendarAlt /> {text[lang].appointmentDetails}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="details-content">
              <div className="details-header">
                <div className="patient-info-detailed">
                  <div className="patient-avatar large">
                    {selectedAppointment.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3>{selectedAppointment.patientName}</h3>
                    <p><FaPhone /> {selectedAppointment.patientPhone || "N/A"}</p>
                    <p><FaEnvelope /> {selectedAppointment.patientEmail || "N/A"}</p>
                  </div>
                </div>
                <div className="status-badge-large">
                  <span className={getStatusBadgeClass(selectedAppointment.status)}>
                    {getStatusIcon(selectedAppointment.status)}
                    {getStatusDisplay(selectedAppointment.status)}
                  </span>
                </div>
              </div>

              <div className="details-section">
                <h4><FaCalendarCheck /> {text[lang].appointmentInfo}</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">{text[lang].date}</span>
                    <span className="info-value">{formatDate(selectedAppointment.date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{text[lang].time}</span>
                    <span className="info-value">{formatTime(selectedAppointment.time)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{text[lang].duration}</span>
                    <span className="info-value">{selectedAppointment.duration} {text[lang].duration_min}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{text[lang].type}</span>
                    <span className="info-value">
                      {getTypeIcon(selectedAppointment.type)}
                      {selectedAppointment.type === "video" ? text[lang].videoCall : text[lang].inPerson}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{text[lang].paymentStatus}</span>
                    <span className="info-value">{selectedAppointment.paymentStatus || "Pending"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{text[lang].paymentAmount}</span>
                    <span className="info-value">${selectedAppointment.paymentAmount || "0"}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4><FaFileAlt /> {text[lang].reason}</h4>
                <p className="reason-text">{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.doctorResponse && (
                <div className="details-section">
                  <h4><FaStethoscope /> {text[lang].doctorResponse}</h4>
                  <p className="notes-text">{selectedAppointment.doctorResponse}</p>
                </div>
              )}

              {selectedAppointment.prescription && (
                <div className="details-section">
                  <h4><FaPills /> {text[lang].prescription}</h4>
                  <p className="notes-text">{selectedAppointment.prescription}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="details-section">
                  <h4><FaNotesMedical /> {text[lang].notes}</h4>
                  <p className="notes-text">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowDetailsModal(false)}>
                  {text[lang].close}
                </button>
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button className="submit-btn approve-btn" onClick={() => {
                      setShowDetailsModal(false);
                      handleApproveAppointment(selectedAppointment.id);
                    }}>
                      <FaCheck /> {text[lang].approve}
                    </button>
                    <button className="submit-btn reject-btn" onClick={() => {
                      setShowDetailsModal(false);
                      handleRejectAppointment(selectedAppointment.id);
                    }}>
                      <FaTimes /> {text[lang].reject}
                    </button>
                  </>
                )}
                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'approved') && (
                  <button className="submit-btn complete-btn" onClick={() => {
                    setShowDetailsModal(false);
                    handleCompleteAppointment(selectedAppointment.id);
                  }}>
                    <FaCheck /> {text[lang].complete}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{text[lang].deleteAppointment}</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="delete-content">
              <FaTrash className="delete-icon" />
              <p>{text[lang].confirmDelete}</p>
              <p className="delete-warning">{text[lang].cannotUndo}</p>
              <div className="appointment-summary">
                <span><FaUser /> {selectedAppointment.patientName}</span>
                <span><FaCalendarAlt /> {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                {text[lang].cancel}
              </button>
              <button className="submit-btn danger" onClick={() => {
                const updated = appointments.filter(a => a.id !== selectedAppointment.id);
                setAppointments(updated);
                setFilteredAppointments(updated);
                setShowDeleteModal(false);
                setSelectedAppointment(null);
              }}>
                {text[lang].deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Limit Modal */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUserMd /> {text[lang].setDailyLimit}</h3>
              <button className="close-btn" onClick={() => setShowLimitModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newLimit = parseInt(formData.get("appointmentLimit"));
              if (newLimit > 0) {
                setAppointmentLimit(newLimit);
                localStorage.setItem("appointmentLimit", newLimit.toString());
                setShowLimitModal(false);
                alert(text[lang].limitSetSuccess);
              }
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{text[lang].currentLimit}</label>
                  <div className="current-limit-display">
                    {appointmentLimit} {text[lang].appointmentsPerDay}
                  </div>
                </div>
                <div className="form-group">
                  <label>{text[lang].setLimit}</label>
                  <input 
                    type="number" 
                    name="appointmentLimit" 
                    className="form-input" 
                    required 
                    min="1"
                    max="50"
                    defaultValue={appointmentLimit}
                  />
                  <small>Min: 1, Max: 50</small>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowLimitModal(false)}>
                  {text[lang].cancel}
                </button>
                <button type="submit" className="submit-btn">
                  {text[lang].updateLimit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="appointments-footer">
        <div className="footer-info">
          <span>Showing {currentItems.length} of {filteredAppointments.length} appointments</span>
          <span className="footer-divider">•</span>
          <span>{text[lang].dailyLimit}: {appointmentLimit}</span>
          <span className="footer-divider">•</span>
          <span>{text[lang].appointmentsToday}: {stats.today}</span>
          <span className="footer-divider">•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointments;