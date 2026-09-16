// DoctorDashboard.js - Complete with Appointment Management (Approve, Reject, Complete)
// ✅ Prescription Creation Fixed - Appointment ID from Appointments
// ✅ Settings Navigation Added

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DoctorDashboard.css";
import { 
  FaMoon, FaSun, FaBars, FaTimes, FaTachometerAlt, 
  FaCalendarCheck, FaUserInjured, FaClipboardList, 
  FaCog, FaSignOutAlt, FaBell, FaSearch,
  FaPlus, FaPhoneAlt, FaMapMarkerAlt, FaVideo, FaClock,
  FaStar, FaUserMd, FaNotesMedical, FaPrescriptionBottle,
  FaChevronDown, FaUserCircle, FaFilter, FaDownload, FaEye,
  FaEdit, FaSave, FaTimesCircle, FaUserEdit, FaFilePrescription,
  FaSyringe, FaPills, FaStethoscope, FaSpinner, FaCheckCircle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import axios from "axios";

// ✅ Import appointment service functions
import {
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  cancelAppointment
} from "../services/appointmentService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const bgImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function DoctorDashboard() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Prescription Modal States
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    diagnosis: "",
    notes: ""
  });

  // Profile Edit Modal States
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    specialty: "",
    license: "",
    experience: "",
    qualification: "",
    phone: "",
    available: true
  });

  // Doctor info with proper name
  const [doctorInfo, setDoctorInfo] = useState({
    id: null,
    name: "",
    displayName: "",
    email: "",
    specialty: "",
    license: "",
    experience: "",
    qualification: "",
    phone: "",
    rating: 0,
    available: true
  });

  // Real data from localStorage and API
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    prescriptions: 0,
    averageRating: 0,
    patientLimit: 0,
    remainingSlots: 0
  });

  // Patient limit configuration
  const [patientLimitConfig, setPatientLimitConfig] = useState({
    maxPatientsPerDay: 20,
    maxPatientsPerWeek: 100,
    maxPatientsPerMonth: 400
  });

  // Loading states
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // =============================================
  // STATUS UTILITY FUNCTIONS
  // =============================================
  
  // Normalize status from backend to frontend format
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'Pending': 'pending',
      'Approved': 'confirmed',
      'Rejected': 'rejected',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    return statusMap[status] || status.toLowerCase();
  };

  // Get display text for status
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
        rejected: 'বাতিল',
        completed: 'সম্পন্ন',
        cancelled: 'বাতিল'
      }
    };
    return displayMap[lang]?.[normalized] || normalized || 'Unknown';
  };

  // Get CSS class for status badge
  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    switch(normalized) {
      case 'confirmed':
      case 'approved':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'rejected':
      case 'cancelled':
        return 'status-cancelled';
      case 'critical':
        return 'status-critical';
      case 'stable':
        return 'status-stable';
      case 'follow-up':
        return 'status-followup';
      default:
        return '';
    }
  };

  // =============================================
  // LOAD DOCTOR APPOINTMENTS FROM API
  // =============================================
  const loadDoctorAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      // ✅ Using appointment service
      const data = await getDoctorAppointments();

      if (data.success) {
        const doctorAppointments = data.appointments || [];
        setAppointments(doctorAppointments);

        // Update stats with real data
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = doctorAppointments.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === today;
        });
        
        const pendingAppts = doctorAppointments.filter(apt => normalizeStatus(apt.status) === 'pending');
        const completedAppts = doctorAppointments.filter(apt => normalizeStatus(apt.status) === 'completed');
        const cancelledAppts = doctorAppointments.filter(apt => 
          normalizeStatus(apt.status) === 'cancelled' || normalizeStatus(apt.status) === 'rejected'
        );

        // Get unique patients
        const uniquePatients = [...new Set(doctorAppointments.map(apt => apt.patientId))];
        const doctorPatients = uniquePatients.length;

        // Get recent patients (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentPatients = doctorAppointments.filter(apt => {
          const aptDate = apt.createdAt ? new Date(apt.createdAt) : new Date(apt.appointmentDate);
          return aptDate > weekAgo;
        });
        const uniqueRecentPatients = [...new Set(recentPatients.map(apt => apt.patientId))];

        const remainingSlots = patientLimitConfig.maxPatientsPerDay - todayAppts.length;

        setStats({
          totalPatients: doctorPatients,
          newPatients: uniqueRecentPatients.length,
          todayAppointments: todayAppts.length,
          completedAppointments: completedAppts.length,
          pendingAppointments: pendingAppts.length,
          cancelledAppointments: cancelledAppts.length,
          prescriptions: prescriptions.length,
          averageRating: doctorInfo.rating || 4.5,
          patientLimit: patientLimitConfig.maxPatientsPerDay,
          remainingSlots: Math.max(0, remainingSlots)
        });

        console.log("✅ Loaded", doctorAppointments.length, "appointments from API");
      } else {
        console.error("Error loading appointments:", data.message);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // =============================================
  // LOAD DOCTOR PRESCRIPTIONS FROM API
  // =============================================
  const loadDoctorPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // ✅ সরাসরি axios দিয়ে API কল করা হচ্ছে
      const response = await axios.get(`${API_BASE_URL}/prescriptions/doctor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const doctorPrescriptions = response.data.prescriptions || response.data.data || [];
        setPrescriptions(doctorPrescriptions);

        // Update prescriptions count in stats
        setStats(prevStats => ({
          ...prevStats,
          prescriptions: doctorPrescriptions.length
        }));

        console.log("✅ Loaded", doctorPrescriptions.length, "prescriptions from API");
      }
    } catch (error) {
      console.error("Error loading prescriptions:", error);
      // Fallback to localStorage if API fails
      const allPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]");
      const doctorId = doctorInfo.id || localStorage.getItem("doctorId");
      const doctorName = doctorInfo.name || localStorage.getItem("doctorName");
      const doctorPrescriptions = allPrescriptions.filter(
        pres => pres.doctorId === doctorId || pres.doctorName === doctorName
      );
      setPrescriptions(doctorPrescriptions);
    }
  };

  // =============================================
  // LOAD DOCTOR PATIENTS FROM API (FIXED - From Appointments)
  // =============================================
  const loadDoctorPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // ✅ Appointments থেকে Patients বের করো
      const response = await axios.get(`${API_BASE_URL}/appointments/doctor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📦 Appointments Response:", response.data);

      let appointmentsData = [];
      if (response.data.success) {
        appointmentsData = response.data.appointments || response.data.data || [];
      }

      // ✅ Unique Patients বের করো Appointment সহ
      const patientMap = new Map();
      
      appointmentsData.forEach(apt => {
        const patientId = apt.patientId || apt.patient?._id || apt.user;
        if (!patientId) return;

        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            _id: patientId,
            appointmentId: apt._id, // 🔥 Appointment ID সংরক্ষণ
            patientName: apt.patientName || apt.patient?.name || "Unknown Patient",
            fullName: apt.patientName || apt.patient?.name || "Unknown Patient",
            name: apt.patientName || apt.patient?.name || "Unknown Patient",
            age: apt.age || 35,
            gender: apt.gender || "Not Specified",
            phone: apt.phone || apt.patient?.phone || "N/A",
            lastVisit: apt.appointmentDate || new Date().toISOString().split('T')[0],
            condition: apt.reason || "General Checkup",
            status: apt.status || "stable"
          });
        } else {
          // ✅ Update appointmentId if newer
          const existing = patientMap.get(patientId);
          if (!existing.appointmentId) {
            existing.appointmentId = apt._id;
          }
        }
      });

      const doctorPatients = Array.from(patientMap.values());
      setPatients(doctorPatients);
      
      console.log("✅ Loaded", doctorPatients.length, "patients with appointment IDs");
      console.log("📋 First patient:", doctorPatients[0]);

    } catch (error) {
      console.error("❌ Error loading patients:", error);
      setPatients([]);
    }
  };

  // =============================================
  // APPROVE APPOINTMENT
  // =============================================
  const handleApproveAppointment = async (appointmentId) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // ✅ Using appointment service
      const data = await approveAppointment(appointmentId);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment approved successfully!' : 'অ্যাপয়েন্টমেন্ট সফলভাবে অনুমোদিত হয়েছে!');
        loadDoctorAppointments(); // Refresh list
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

  // =============================================
  // REJECT APPOINTMENT
  // =============================================
  const handleRejectAppointment = async (appointmentId) => {
    const reason = prompt(
      lang === 'en' 
        ? 'Please provide a reason for rejection:' 
        : 'বাতিলের কারণ লিখুন:'
    );

    if (reason === null) return; // User cancelled

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // ✅ Using appointment service
      const data = await rejectAppointment(appointmentId, reason);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment rejected.' : 'অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে।');
        loadDoctorAppointments(); // Refresh list
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

  // =============================================
  // COMPLETE APPOINTMENT
  // =============================================
  const handleCompleteAppointment = async (appointmentId) => {
    const prescription = prompt(
      lang === 'en' 
        ? 'Enter prescription details:' 
        : 'প্রেসক্রিপশন লিখুন:'
    );

    if (prescription === null) return; // User cancelled

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // ✅ Using appointment service
      const data = await completeAppointment(appointmentId, {
        prescription,
        doctorNotes: `Completed on ${new Date().toLocaleString()}`
      });

      if (data.success) {
        alert(lang === 'en' ? 'Appointment completed!' : 'অ্যাপয়েন্টমেন্ট সম্পন্ন হয়েছে!');
        loadDoctorAppointments(); // Refresh list
        loadDoctorPrescriptions(); // Refresh prescriptions list
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
  // CANCEL APPOINTMENT (User initiated)
  // =============================================
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to cancel this appointment?' : 'আপনি কি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?')) {
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // ✅ Using appointment service
      const data = await cancelAppointment(appointmentId);

      if (data.success) {
        alert(lang === 'en' ? 'Appointment cancelled.' : 'অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে।');
        loadDoctorAppointments(); // Refresh list
      } else {
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // =============================================
  // LOAD DOCTOR DATA
  // =============================================
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        console.log("📥 Loading Doctor Data...");

        // Check if user is authenticated and is a doctor
        const token = localStorage.getItem("token");
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        const userRole = localStorage.getItem("userRole");
        
        console.log("🔍 Auth Check:", { token: !!token, isAuthenticated, userRole });

        if (!token || !isAuthenticated || userRole !== "doctor") {
          console.log("❌ Not authorized as doctor, redirecting...");
          navigate("/login");
          return;
        }

        // Get doctor name from multiple sources
        let doctorName = "";
        let doctorEmail = "";
        let doctorSpecialty = "";
        let doctorId = "";
        let doctorPhone = "";
        let doctorLicense = "";
        let doctorExperience = "";
        let doctorQualification = "";
        let doctorRating = 4.5;
        let doctorAvailable = true;

        // SOURCE 1: doctorData from localStorage
        const doctorDataStr = localStorage.getItem("doctorData");
        console.log("📋 doctorData from localStorage:", doctorDataStr);

        if (doctorDataStr && doctorDataStr !== "null" && doctorDataStr !== "undefined") {
          try {
            const doctorData = JSON.parse(doctorDataStr);
            console.log("✅ Parsed doctorData:", doctorData);

            doctorName = doctorData.fullName || 
                         doctorData.name ||
                         doctorData.displayName ||
                         `${doctorData.firstName || ""} ${doctorData.lastName || ""}`.trim() ||
                         doctorData.doctorName ||
                         doctorData.email?.split('@')[0] ||
                         "";

            doctorEmail = doctorData.email || "";
            doctorSpecialty = doctorData.specialization || doctorData.specialty || "General Medicine";
            doctorId = doctorData.id || doctorData._id || "";
            doctorPhone = doctorData.phone || "";
            doctorLicense = doctorData.license || doctorData.licenseNumber || "Not Specified";
            doctorExperience = doctorData.experience || "";
            doctorQualification = doctorData.qualification || "MBBS";
            doctorRating = doctorData.rating || 4.5;
            doctorAvailable = doctorData.available !== undefined ? doctorData.available : true;

            console.log("✅ Name from doctorData:", doctorName);
          } catch (e) {
            console.error("❌ Error parsing doctorData:", e);
          }
        }

        // SOURCE 2: currentUser
        if (!doctorName || doctorName === "" || doctorName === "null" || doctorName === "undefined") {
          const currentUserStr = localStorage.getItem("currentUser");
          console.log("📋 currentUser from localStorage:", currentUserStr);

          if (currentUserStr && currentUserStr !== "null" && currentUserStr !== "undefined") {
            try {
              const currentUser = JSON.parse(currentUserStr);
              console.log("✅ Parsed currentUser:", currentUser);

              doctorName = currentUser.fullName || 
                           currentUser.name ||
                           `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
                           currentUser.doctorName ||
                           currentUser.email?.split('@')[0] ||
                           "";

              doctorEmail = currentUser.email || doctorEmail;
              doctorSpecialty = currentUser.specialization || currentUser.specialty || doctorSpecialty;
              doctorId = currentUser.id || currentUser._id || doctorId;
              doctorPhone = currentUser.phone || doctorPhone;
              doctorLicense = currentUser.license || currentUser.licenseNumber || doctorLicense;
              doctorExperience = currentUser.experience || doctorExperience;
              doctorQualification = currentUser.qualification || doctorQualification;
              doctorRating = currentUser.rating || doctorRating;
              doctorAvailable = currentUser.available !== undefined ? currentUser.available : doctorAvailable;

              console.log("✅ Name from currentUser:", doctorName);
            } catch (e) {
              console.error("❌ Error parsing currentUser:", e);
            }
          }
        }

        // SOURCE 3: Direct localStorage keys
        if (!doctorName || doctorName === "" || doctorName === "null" || doctorName === "undefined") {
          doctorName = localStorage.getItem("doctorName") || 
                       localStorage.getItem("userName") ||
                       localStorage.getItem("userFullName") ||
                       "";
          console.log("✅ Name from direct keys:", doctorName);
        }

        if (!doctorEmail) {
          doctorEmail = localStorage.getItem("doctorEmail") || 
                        localStorage.getItem("userEmail") || 
                        "";
        }

        if (!doctorSpecialty) {
          doctorSpecialty = localStorage.getItem("doctorSpecialty") || "General Medicine";
        }

        if (!doctorId) {
          doctorId = localStorage.getItem("doctorId") || "";
        }

        if (!doctorPhone) {
          doctorPhone = localStorage.getItem("doctorPhone") || "";
        }

        if (!doctorLicense) {
          doctorLicense = localStorage.getItem("doctorLicense") || "Not Specified";
        }

        if (!doctorExperience) {
          doctorExperience = localStorage.getItem("doctorExperience") || "";
        }

        if (!doctorQualification) {
          doctorQualification = localStorage.getItem("doctorQualification") || "MBBS";
        }

        // Fallback - if still no name, try to extract from email
        if (!doctorName || doctorName === "" || doctorName === "null" || doctorName === "undefined") {
          if (doctorEmail) {
            doctorName = doctorEmail.split('@')[0];
            doctorName = doctorName.replace(/[^a-zA-Z]/g, ' ');
            doctorName = doctorName.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            console.log("✅ Name extracted from email:", doctorName);
          }
        }

        // Final fallback
        if (!doctorName || doctorName === "" || doctorName === "null" || doctorName === "undefined") {
          doctorName = "Dr. Unknown";
          console.log("⚠️ No name found, using default:", doctorName);
        }

        // Clean up name
        if (doctorName === "undefined" || doctorName === "null" || doctorName === "") {
          doctorName = "Dr. Unknown";
        } else {
          // Capitalize first letter of each word
          doctorName = doctorName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }

        console.log("✅ FINAL Doctor Name:", doctorName);
        console.log("✅ FINAL Doctor Email:", doctorEmail);
        console.log("✅ FINAL Specialty:", doctorSpecialty);

        // Set doctor info
        const finalDoctorInfo = {
          id: doctorId || Date.now(),
          name: doctorName,
          displayName: `Dr. ${doctorName}`,
          email: doctorEmail,
          specialty: doctorSpecialty || "General Medicine",
          license: doctorLicense || "Not Specified",
          experience: doctorExperience || "Not Specified",
          qualification: doctorQualification || "MBBS",
          phone: doctorPhone || "Not Available",
          rating: doctorRating || 4.5,
          available: doctorAvailable
        };

        setDoctorInfo(finalDoctorInfo);

        // Ensure name is stored back properly
        localStorage.setItem("doctorName", doctorName);
        localStorage.setItem("userName", doctorName);
        localStorage.setItem("userFullName", doctorName);
        localStorage.setItem("doctorDisplayName", `Dr. ${doctorName}`);

        // Update doctorData
        try {
          const existingData = doctorDataStr && doctorDataStr !== "null" && doctorDataStr !== "undefined" 
            ? JSON.parse(doctorDataStr) 
            : {};
          
          const updatedDoctorData = {
            ...existingData,
            fullName: doctorName,
            name: doctorName,
            displayName: `Dr. ${doctorName}`,
            email: doctorEmail,
            specialization: doctorSpecialty,
            specialty: doctorSpecialty,
            phone: doctorPhone,
            license: doctorLicense,
            experience: doctorExperience,
            qualification: doctorQualification,
            rating: doctorRating,
            available: doctorAvailable
          };
          localStorage.setItem("doctorData", JSON.stringify(updatedDoctorData));
          console.log("✅ Updated doctorData with name:", doctorName);
        } catch (e) {
          console.error("❌ Error updating doctorData:", e);
        }

        // Load patient limit config
        const savedLimitConfig = JSON.parse(localStorage.getItem("doctorLimitConfig") || "null");
        if (savedLimitConfig) {
          setPatientLimitConfig(savedLimitConfig);
        }

        // Load appointments from API
        await loadDoctorAppointments();

        // Load prescriptions from API
        await loadDoctorPrescriptions();

        // Load patients from API
        await loadDoctorPatients();

        console.log("✅ Doctor Data Load Complete!");
        console.log("📋 Doctor Name Display:", `Dr. ${doctorName}`);

      } catch (error) {
        console.error("❌ Error loading doctor data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, [navigate]);

  // =============================================
  // NAVIGATION HANDLERS
  // =============================================
  
  const handleNewPrescription = () => {
    setShowPrescriptionModal(true);
    setSelectedPatient(null);
    setPrescriptionForm({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      diagnosis: "",
      notes: ""
    });
  };

  const handleAddPatient = () => {
    alert("Patients can only be added through the appointment booking system. Please ask the patient to book an appointment.");
  };

  const handleViewSchedule = () => {
    navigate("/doctor/appointments");
  };

  const handleViewAppointments = () => {
    navigate("/doctor/appointments");
  };

  const handleViewPatients = () => {
    navigate("/doctor/patients");
  };

  const handleViewPrescriptions = () => {
    navigate("/doctor/prescriptions");
  };

  // ✅ Settings এ নেভিগেট করার জন্য ফাংশন
  const handleSettings = () => {
    navigate("/doctor/settings");
  };

  // =============================================
  // PROFILE EDIT HANDLERS
  // =============================================
  
  const handleEditProfile = () => {
    setProfileForm({
      fullName: doctorInfo.name,
      specialty: doctorInfo.specialty,
      license: doctorInfo.license,
      experience: doctorInfo.experience,
      qualification: doctorInfo.qualification,
      phone: doctorInfo.phone,
      available: doctorInfo.available
    });
    setShowProfileEditModal(true);
  };

  const handleSaveProfile = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      
      const updatedUser = {
        ...currentUser,
        fullName: profileForm.fullName,
        name: profileForm.fullName,
        specialty: profileForm.specialty,
        license: profileForm.license,
        experience: profileForm.experience,
        qualification: profileForm.qualification,
        phone: profileForm.phone,
        available: profileForm.available
      };

      const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
        localStorage.setItem("registeredUsers", JSON.stringify(allUsers));
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update doctorInfo
      setDoctorInfo({
        ...doctorInfo,
        name: profileForm.fullName,
        displayName: `Dr. ${profileForm.fullName}`,
        specialty: profileForm.specialty,
        license: profileForm.license,
        experience: profileForm.experience,
        qualification: profileForm.qualification,
        phone: profileForm.phone,
        available: profileForm.available
      });

      // Update localStorage
      localStorage.setItem("doctorName", profileForm.fullName);
      localStorage.setItem("userName", profileForm.fullName);
      localStorage.setItem("userFullName", profileForm.fullName);
      localStorage.setItem("doctorDisplayName", `Dr. ${profileForm.fullName}`);

      // Update doctorData
      const doctorDataStr = localStorage.getItem("doctorData");
      if (doctorDataStr && doctorDataStr !== "null" && doctorDataStr !== "undefined") {
        try {
          const doctorData = JSON.parse(doctorDataStr);
          const updatedDoctorData = {
            ...doctorData,
            fullName: profileForm.fullName,
            name: profileForm.fullName,
            displayName: `Dr. ${profileForm.fullName}`,
            specialty: profileForm.specialty,
            phone: profileForm.phone,
            license: profileForm.license,
            experience: profileForm.experience,
            qualification: profileForm.qualification,
            available: profileForm.available
          };
          localStorage.setItem("doctorData", JSON.stringify(updatedDoctorData));
        } catch (e) {
          console.error("Error updating doctorData:", e);
        }
      }

      setShowProfileEditModal(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  // =============================================
  // PRESCRIPTION HANDLERS (FIXED - Using Appointment ID)
  // =============================================
  
  const handleSavePrescription = async () => {
    try {
      if (!selectedPatient) {
        alert("Please select a patient first.");
        return;
      }

      if (!prescriptionForm.medication || !prescriptionForm.dosage) {
        alert("Please fill in medication and dosage at minimum.");
        return;
      }

      // ✅ Appointment ID চেক করো
      const appointmentId = selectedPatient.appointmentId;
      console.log("🔍 Selected Patient:", selectedPatient);
      console.log("📝 Appointment ID:", appointmentId);

      if (!appointmentId) {
        alert("❌ No appointment found for this patient. Please ask the patient to book an appointment first.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // ✅ API Call with correct appointmentId
      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        {
          appointmentId: appointmentId, // 🔥 Appointment ID পাঠাচ্ছি
          diagnosis: prescriptionForm.diagnosis || "",
          medicines: [{
            medicineName: prescriptionForm.medication,
            dosage: prescriptionForm.dosage,
            frequency: prescriptionForm.frequency || "As prescribed",
            duration: prescriptionForm.duration || "As prescribed",
            instructions: prescriptionForm.instructions || "Take as directed"
          }],
          notes: prescriptionForm.notes || "",
          followUpDate: null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        const patientName = selectedPatient.patientName || 
                           selectedPatient.fullName || 
                           selectedPatient.name || 
                           "Patient";
        alert(`✅ Prescription created successfully for ${patientName}!`);
        
        // Reset form
        setPrescriptionForm({
          medication: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          diagnosis: "",
          notes: ""
        });
        setSelectedPatient(null);
        setShowPrescriptionModal(false);
        
        // Refresh
        loadDoctorPrescriptions();
        loadDoctorAppointments();
      } else {
        alert(response.data.message || "Failed to create prescription.");
      }
    } catch (error) {
      console.error("❌ Error saving prescription:", error);
      
      // ✅ Better error handling
      if (error.response) {
        console.error("Response error:", error.response.data);
        alert(`❌ ${error.response.data.message || "Server error. Please try again."}`);
      } else if (error.request) {
        alert("❌ No response from server. Please check your connection.");
      } else {
        alert("❌ Error saving prescription. Please try again.");
      }
    }
  };

  // =============================================
  // PATIENT LIMIT HANDLERS
  // =============================================
  
  const handleUpdatePatientLimit = () => {
    try {
      const newLimit = prompt("Enter maximum patients per day:", patientLimitConfig.maxPatientsPerDay);
      if (newLimit !== null && !isNaN(newLimit) && parseInt(newLimit) > 0) {
        const updatedConfig = {
          ...patientLimitConfig,
          maxPatientsPerDay: parseInt(newLimit)
        };
        setPatientLimitConfig(updatedConfig);
        localStorage.setItem("doctorLimitConfig", JSON.stringify(updatedConfig));
        
        const today = new Date().toISOString().split('T')[0];
        const todayPatientCount = appointments.filter(apt => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
          return aptDate === today;
        }).length;
        const remainingSlots = updatedConfig.maxPatientsPerDay - todayPatientCount;
        setStats({
          ...stats,
          patientLimit: updatedConfig.maxPatientsPerDay,
          remainingSlots: Math.max(0, remainingSlots)
        });
        
        alert(`Patient limit updated to ${updatedConfig.maxPatientsPerDay} patients per day.`);
      }
    } catch (error) {
      console.error("Error updating patient limit:", error);
    }
  };

  // =============================================
  // LOGOUT
  // =============================================

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("doctorData");
    localStorage.removeItem("doctorName");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  // =============================================
  // FORMAT HELPERS
  // =============================================

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const getTypeIcon = (type) => {
    const normalizedType = type?.toLowerCase();
    return normalizedType === 'video' ? <FaVideo /> : <FaUserMd />;
  };

  const handleStartConsultation = (appointment) => {
    alert(`Starting consultation with ${appointment.patientName}`);
  };

  const handleViewDetails = (item) => {
    alert(`Viewing details for ${item.patientName || item.name}`);
  };

  // =============================================
  // TRANSLATION
  // =============================================

  const text = {
    en: {
      dashboard: "Dashboard",
      appointments: "Appointments",
      patients: "Patients",
      prescriptions: "Prescriptions",
      settings: "Settings",
      logout: "Logout",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      search: "Search patients...",
      notifications: "Notifications",
      viewAll: "View All",
      markAllRead: "Mark all as read",
      totalPatients: "Total Patients",
      newPatients: "New Patients",
      todayAppointments: "Today's Appointments",
      completedAppointments: "Completed",
      pendingAppointments: "Pending",
      cancelledAppointments: "Cancelled",
      prescriptionsCount: "Prescriptions",
      averageRating: "Average Rating",
      todaysSchedule: "Today's Schedule",
      quickActions: "Quick Actions",
      newPrescription: "New Prescription",
      addPatient: "Add Patient",
      viewSchedule: "View Schedule",
      generateReport: "Generate Report",
      welcome: "Welcome",
      online: "Online",
      offline: "Offline",
      upcomingAppointments: "Upcoming Appointments",
      recentPatients: "Recent Patients",
      recentPrescriptions: "Recent Prescriptions",
      videoCall: "Video Call",
      viewDetails: "View Details",
      confirmed: "Confirmed",
      pending: "Pending",
      cancelled: "Cancelled",
      completed: "Completed",
      rejected: "Rejected",
      stable: "Stable",
      critical: "Critical",
      followUp: "Follow-up",
      active: "Active",
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "Emergency button activated. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology",
      loading: "Loading...",
      editProfile: "Edit Profile",
      patientLimit: "Patient Limit",
      remainingSlots: "Remaining Slots",
      updateLimit: "Update Limit",
      prescribeMedication: "Prescribe Medication",
      selectPatient: "Select Patient",
      medication: "Medication Name",
      dosage: "Dosage",
      frequency: "Frequency",
      duration: "Duration",
      instructions: "Instructions",
      diagnosis: "Diagnosis",
      notes: "Additional Notes",
      savePrescription: "Save Prescription",
      cancel: "Cancel",
      profileInfo: "Profile Information",
      fullName: "Full Name",
      specialty: "Specialty",
      license: "License Number",
      experience: "Experience",
      qualification: "Qualification",
      phone: "Phone Number",
      availability: "Availability",
      saveChanges: "Save Changes",
      available: "Available for appointments",
      unavailable: "Unavailable",
      noPatients: "No patients found. Patients are added through appointments only.",
      approve: "Approve",
      reject: "Reject",
      complete: "Complete",
      noAppointments: "No appointments scheduled for today",
      noUpcoming: "No upcoming appointments",
      noPrescriptions: "No prescriptions found",
      processing: "Processing..."
    },
    bn: {
      dashboard: "ড্যাশবোর্ড",
      appointments: "অ্যাপয়েন্টমেন্ট",
      patients: "রোগী",
      prescriptions: "প্রেসক্রিপশন",
      settings: "সেটিংস",
      logout: "লগআউট",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      search: "রোগী খুঁজুন...",
      notifications: "বিজ্ঞপ্তি",
      viewAll: "সব দেখুন",
      markAllRead: "সব পঠিত হিসেবে চিহ্নিত করুন",
      totalPatients: "মোট রোগী",
      newPatients: "নতুন রোগী",
      todayAppointments: "আজকের অ্যাপয়েন্টমেন্ট",
      completedAppointments: "সম্পন্ন",
      pendingAppointments: "বিচারাধীন",
      cancelledAppointments: "বাতিল",
      prescriptionsCount: "প্রেসক্রিপশন",
      averageRating: "গড় রেটিং",
      todaysSchedule: "আজকের সময়সূচী",
      quickActions: "দ্রুত ক্রিয়া",
      newPrescription: "নতুন প্রেসক্রিপশন",
      addPatient: "রোগী যোগ করুন",
      viewSchedule: "সময়সূচী দেখুন",
      generateReport: "প্রতিবেদন তৈরি করুন",
      welcome: "স্বাগতম",
      online: "অনলাইন",
      offline: "অফলাইন",
      upcomingAppointments: "আগামী অ্যাপয়েন্টমেন্ট",
      recentPatients: "সাম্প্রতিক রোগী",
      recentPrescriptions: "সাম্প্রতিক প্রেসক্রিপশন",
      videoCall: "ভিডিও কল",
      viewDetails: "বিস্তারিত দেখুন",
      confirmed: "নিশ্চিত",
      pending: "বিচারাধীন",
      cancelled: "বাতিল",
      completed: "সম্পন্ন",
      rejected: "প্রত্যাখ্যাত",
      stable: "স্থিতিশীল",
      critical: "সংকটাপন্ন",
      followUp: "ফলো-আপ",
      active: "সক্রিয়",
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "জরুরী বাটন সক্রিয় করা হয়েছে। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল",
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন",
      loading: "লোড হচ্ছে...",
      editProfile: "প্রোফাইল সম্পাদনা করুন",
      patientLimit: "রোগী সীমা",
      remainingSlots: "অবশিষ্ট স্লট",
      updateLimit: "সীমা আপডেট করুন",
      prescribeMedication: "ঔষধ প্রেসক্রাইব করুন",
      selectPatient: "রোগী নির্বাচন করুন",
      medication: "ঔষধের নাম",
      dosage: "মাত্রা",
      frequency: "কতবার নিতে হবে",
      duration: "কতদিন নিতে হবে",
      instructions: "নির্দেশনা",
      diagnosis: "রোগ নির্ণয়",
      notes: "অতিরিক্ত তথ্য",
      savePrescription: "প্রেসক্রিপশন সংরক্ষণ করুন",
      cancel: "বাতিল",
      profileInfo: "প্রোফাইল তথ্য",
      fullName: "পুরো নাম",
      specialty: "বিশেষায়ন",
      license: "লাইসেন্স নম্বর",
      experience: "অভিজ্ঞতা",
      qualification: "যোগ্যতা",
      phone: "ফোন নম্বর",
      availability: "উপলব্ধতা",
      saveChanges: "পরিবর্তন সংরক্ষণ করুন",
      available: "অ্যাপয়েন্টমেন্টের জন্য উপলব্ধ",
      unavailable: "অনুপলব্ধ",
      noPatients: "কোন রোগী পাওয়া যায়নি। রোগী কেবল অ্যাপয়েন্টমেন্টের মাধ্যমে যুক্ত হয়।",
      approve: "অনুমোদন করুন",
      reject: "প্রত্যাখ্যান করুন",
      complete: "সম্পন্ন করুন",
      noAppointments: "আজকের জন্য কোনো অ্যাপয়েন্টমেন্ট নেই",
      noUpcoming: "কোনো আগামী অ্যাপয়েন্টমেন্ট নেই",
      noPrescriptions: "কোন প্রেসক্রিপশন পাওয়া যায়নি",
      processing: "প্রক্রিয়াকরণ চলছে..."
    }
  };

  // =============================================
  // DATA FOR DISPLAY
  // =============================================

  const todaysAppointments = appointments
    .filter(apt => {
      const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
      return aptDate === selectedDate;
    })
    .map((apt, index) => ({
      id: apt._id || apt.id || index + 1,
      patientName: apt.patientName || apt.patient?.name || "Unknown Patient",
      patientId: apt.patientId || `P-${Math.floor(Math.random() * 10000)}`,
      age: apt.age || 35,
      gender: apt.gender || "Not Specified",
      time: apt.timeSlot || apt.time || "09:00 AM",
      type: apt.consultationMode || apt.type || "in-person",
      status: normalizeStatus(apt.status),
      reason: apt.reason || "General Checkup",
      phone: apt.phone || "N/A"
    }));

  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : new Date();
      return aptDate > new Date();
    })
    .slice(0, 4)
    .map((apt, index) => ({
      id: apt._id || apt.id || index + 1,
      patientName: apt.patientName || apt.patient?.name || "Unknown Patient",
      date: apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: apt.timeSlot || apt.time || "09:00 AM",
      type: apt.consultationMode || apt.type || "in-person",
      status: normalizeStatus(apt.status)
    }));

  const recentPrescriptions = prescriptions.slice(0, 3).map((pres, index) => ({
    id: pres._id || pres.id || index + 1,
    patientName: pres.patient?.name || pres.patientName || "Unknown Patient",
    date: pres.createdAt || pres.date || new Date().toISOString().split('T')[0],
    medication: pres.medicines?.[0]?.medicineName || pres.medication || "Not Specified",
    status: pres.status || "active"
  }));

  // =============================================
  // LOADING STATE
  // =============================================

  if (loading) {
    return (
      <div className={`doctor-dashboard ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{text[lang].loading}</p>
        </div>
      </div>
    );
  }

  // =============================================
  // MAIN RENDER
  // =============================================

  return (
    <div className={`doctor-dashboard ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      <div className="background-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
      <div className={`theme-overlay ${darkMode ? 'dark-overlay' : 'light-overlay'}`}></div>

      <div className="doctor-layout">
        {/* Sidebar */}
        <div className={`doctor-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">QuickCure Hub</div>
            <div className="sidebar-logo-small">QCH</div>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Doctor Profile in Sidebar */}
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <FaUserMd />
            </div>
            {sidebarOpen && (
              <>
                <h3 className="profile-name">{doctorInfo.displayName || `Dr. ${doctorInfo.name}`}</h3>
                <p className="profile-specialty">{doctorInfo.specialty}</p>
                <div className="profile-rating">
                  <FaStar className="star-icon" />
                  <span>{doctorInfo.rating?.toFixed(1)}</span>
                </div>
                <div className={`profile-status ${doctorInfo.available ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>
                  <span>{doctorInfo.available ? text[lang].online : text[lang].offline}</span>
                </div>
              </>
            )}
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaTachometerAlt className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{text[lang].dashboard}</span>}
            </button>
            <button 
              className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={handleViewAppointments}
            >
              <FaCalendarCheck className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{text[lang].appointments}</span>}
            </button>
            <button 
              className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={handleViewPatients}
            >
              <FaUserInjured className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{text[lang].patients}</span>}
            </button>
            <button 
              className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={handleViewPrescriptions}
            >
              <FaClipboardList className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{text[lang].prescriptions}</span>}
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={handleSettings}
            >
              <FaCog className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{text[lang].settings}</span>}
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              {sidebarOpen && <span>{text[lang].logout}</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`doctor-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Top Bar */}
          <div className="doctor-topbar">
            <div className="topbar-left">
              <h2>{text[lang].welcome}, {doctorInfo.displayName || `Dr. ${doctorInfo.name}`}</h2>
              <p className="topbar-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="topbar-search">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder={text[lang].search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="topbar-actions">
              <div className="notification-dropdown">
                <button 
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell />
                  <span className="notification-badge">
                    {appointments.filter(apt => normalizeStatus(apt.status) === 'pending').length}
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="notification-menu">
                    <div className="notification-header">
                      <h3>{text[lang].notifications}</h3>
                      <button className="mark-read">{text[lang].markAllRead}</button>
                    </div>
                    <div className="notification-list">
                      {appointments.filter(apt => normalizeStatus(apt.status) === 'pending').slice(0, 3).map((apt, index) => (
                        <div key={index} className="notification-item unread">
                          <p><strong>New appointment</strong> - {apt.patientName || apt.patient?.name} at {apt.timeSlot || apt.time}</p>
                          <small>{apt.appointmentDate}</small>
                        </div>
                      ))}
                      {appointments.filter(apt => normalizeStatus(apt.status) === 'pending').length === 0 && (
                        <div className="notification-item">
                          <p>No new notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="notification-footer">
                      <button className="view-all">{text[lang].viewAll}</button>
                    </div>
                  </div>
                )}
              </div>

              <button className="theme-toggle" onClick={toggleDarkMode}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              <button className="language-toggle" onClick={toggleLanguage}>
                {lang === "en" ? "বাংলা" : "English"}
              </button>

              <div className="doctor-profile" onClick={handleEditProfile} style={{ cursor: 'pointer' }}>
                <FaUserCircle className="profile-icon" />
                <div className="profile-info">
                  <span className="profile-name">{doctorInfo.displayName || `Dr. ${doctorInfo.name}`}</span>
                  <span className="profile-role">{doctorInfo.specialty}</span>
                </div>
                <FaChevronDown className="dropdown-icon" />
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card patients" onClick={handleViewPatients} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">
                  <FaUserInjured />
                </div>
                <div className="stat-info">
                  <h3>{formatNumber(stats.totalPatients)}</h3>
                  <p>{text[lang].totalPatients}</p>
                </div>
                <div className="stat-change positive">+{stats.newPatients} new</div>
              </div>

              <div className="stat-card appointments" onClick={handleViewAppointments} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">
                  <FaCalendarCheck />
                </div>
                <div className="stat-info">
                  <h3>{stats.todayAppointments}</h3>
                  <p>{text[lang].todayAppointments}</p>
                  <small>{stats.completedAppointments} completed, {stats.pendingAppointments} pending</small>
                </div>
              </div>

              <div className="stat-card prescriptions" onClick={handleViewPrescriptions} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">
                  <FaPrescriptionBottle />
                </div>
                <div className="stat-info">
                  <h3>{stats.prescriptions}</h3>
                  <p>{text[lang].prescriptionsCount}</p>
                </div>
                <div className="stat-change positive">+{prescriptions.filter(p => {
                  const presDate = new Date(p.createdAt || p.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return presDate > weekAgo;
                }).length} this week</div>
              </div>

              <div className="stat-card rating" onClick={handleUpdatePatientLimit} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">
                  <FaUserInjured />
                </div>
                <div className="stat-info">
                  <h3>{stats.patientLimit}</h3>
                  <p>{text[lang].patientLimit}</p>
                  <small>{text[lang].remainingSlots}: {stats.remainingSlots}</small>
                </div>
                <div className="stat-change positive">Click to update</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>{text[lang].quickActions}</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={handleNewPrescription}>
                  <FaPrescriptionBottle />
                  <span>{text[lang].newPrescription}</span>
                </button>
                <button className="action-btn" onClick={handleViewSchedule}>
                  <FaCalendarCheck />
                  <span>{text[lang].viewSchedule}</span>
                </button>
                <button className="action-btn" onClick={handleEditProfile}>
                  <FaUserEdit />
                  <span>{text[lang].editProfile}</span>
                </button>
                <button className="action-btn" onClick={handleUpdatePatientLimit}>
                  <FaUserInjured />
                  <span>{text[lang].updateLimit}</span>
                </button>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>{text[lang].todaysSchedule}</h3>
                  <div className="card-header-right">
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="date-picker"
                    />
                    <button className="filter-btn">
                      <FaFilter />
                    </button>
                  </div>
                </div>
                <div className="appointments-list">
                  {isLoadingAppointments ? (
                    <div className="loading-state">
                      <FaSpinner className="spinner" />
                      <p>Loading appointments...</p>
                    </div>
                  ) : todaysAppointments.length > 0 ? (
                    todaysAppointments.map(appointment => (
                      <div key={appointment.id} className="appointment-item">
                        <div className="appointment-time">
                          <FaClock />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="appointment-info">
                          <h4>{appointment.patientName}</h4>
                          <p>
                            {appointment.age} yrs, {appointment.gender} • 
                            <span className={`appointment-type ${appointment.type}`}>
                              {getTypeIcon(appointment.type)} {appointment.type}
                            </span>
                          </p>
                          <p className="appointment-reason">{appointment.reason}</p>
                        </div>
                        <div className="appointment-status">
                          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {getStatusDisplay(appointment.status)}
                          </span>
                        </div>
                        <div className="appointment-actions">
                          {/* PENDING - Show Approve/Reject */}
                          {appointment.status === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve"
                                onClick={() => handleApproveAppointment(appointment.id)}
                                disabled={isProcessing}
                                title={text[lang].approve}
                              >
                                <FaCheckCircle />
                              </button>
                              <button 
                                className="action-btn reject"
                                onClick={() => handleRejectAppointment(appointment.id)}
                                disabled={isProcessing}
                                title={text[lang].reject}
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}

                          {/* CONFIRMED/APPROVED - Show Complete */}
                          {(appointment.status === 'confirmed' || appointment.status === 'approved') && (
                            <>
                              <button 
                                className="action-btn complete"
                                onClick={() => handleCompleteAppointment(appointment.id)}
                                disabled={isProcessing}
                                title={text[lang].complete}
                              >
                                <FaCheckCircle />
                              </button>
                              {appointment.type === 'video' && (
                                <button 
                                  className="action-btn video"
                                  onClick={() => handleStartConsultation(appointment)}
                                  title={text[lang].videoCall}
                                >
                                  <FaVideo />
                                </button>
                              )}
                              <button 
                                className="action-btn view"
                                onClick={() => handleViewDetails(appointment)}
                                title={text[lang].viewDetails}
                              >
                                <FaEye />
                              </button>
                            </>
                          )}

                          {/* COMPLETED - Show View Details only */}
                          {appointment.status === 'completed' && (
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewDetails(appointment)}
                              title={text[lang].viewDetails}
                            >
                              <FaEye />
                            </button>
                          )}

                          {/* REJECTED/CANCELLED - Show View Details only */}
                          {(appointment.status === 'rejected' || appointment.status === 'cancelled') && (
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewDetails(appointment)}
                              title={text[lang].viewDetails}
                            >
                              <FaEye />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>{text[lang].noAppointments}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>{text[lang].upcomingAppointments}</h3>
                  <button className="view-all-btn" onClick={handleViewAppointments}>
                    {text[lang].viewAll}
                  </button>
                </div>
                <div className="upcoming-list">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="upcoming-item">
                        <div className="upcoming-date">
                          <span className="day">{new Date(appointment.date).getDate()}</span>
                          <span className="month">{new Date(appointment.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="upcoming-info">
                          <h4>{appointment.patientName}</h4>
                          <p>
                            <FaClock /> {appointment.time} • 
                            <span className={`appointment-type ${appointment.type}`}>
                              {getTypeIcon(appointment.type)} {appointment.type}
                            </span>
                          </p>
                          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {getStatusDisplay(appointment.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>{text[lang].noUpcoming}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Patients and Recent Prescriptions */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>{text[lang].recentPatients}</h3>
                  <button className="view-all-btn" onClick={handleViewPatients}>
                    {text[lang].viewAll}
                  </button>
                </div>
                <div className="patients-list">
                  {patients.length > 0 ? (
                    patients.slice(0, 5).map((patient, index) => (
                      <div key={patient.id || patient._id || index} className="patient-item">
                        <div className="patient-avatar">
                          <FaUserInjured />
                        </div>
                        <div className="patient-info">
                          <h4>{patient.fullName || patient.name || patient.firstName || "Unknown Patient"}</h4>
                          <p>{patient.age || 35} yrs • Last visit: {patient.lastVisit || patient.lastAppointment || "N/A"}</p>
                          <p className="patient-condition">{patient.condition || patient.diagnosis || "General"}</p>
                        </div>
                        <div className="patient-status">
                          <span className={`status-badge ${getStatusClass(patient.status)}`}>
                            {text[lang][patient.status] || patient.status || "stable"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>{text[lang].noPatients}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3>{text[lang].recentPrescriptions}</h3>
                  <button className="view-all-btn" onClick={handleViewPrescriptions}>
                    {text[lang].viewAll}
                  </button>
                </div>
                <div className="prescriptions-list">
                  {recentPrescriptions.length > 0 ? (
                    recentPrescriptions.map(prescription => (
                      <div key={prescription.id} className="prescription-item">
                        <div className="prescription-icon">
                          <FaNotesMedical />
                        </div>
                        <div className="prescription-info">
                          <h4>{prescription.patientName}</h4>
                          <p className="prescription-med">{prescription.medication}</p>
                          <p className="prescription-date">{prescription.date}</p>
                        </div>
                        <div className="prescription-status">
                          <span className={`status-badge ${prescription.status === 'active' ? 'status-active' : 'status-completed'}`}>
                            {text[lang][prescription.status] || prescription.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>{text[lang].noPrescriptions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="doctor-footer">
            <p>{text[lang].copyright}</p>
            <p>{text[lang].tagline}</p>
          </footer>
        </div>
      </div>

      {/* Prescription Modal - FIXED with Appointment ID */}
      {showPrescriptionModal && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-content prescription-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaFilePrescription /> {text[lang].prescribeMedication}</h3>
              <button className="modal-close" onClick={() => setShowPrescriptionModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{text[lang].selectPatient}</label>
                <select 
                  value={selectedPatient?.appointmentId || ""} 
                  onChange={(e) => {
                    const patient = patients.find(p => 
                      p.appointmentId && p.appointmentId.toString() === e.target.value
                    );
                    console.log("✅ Selected patient:", patient);
                    setSelectedPatient(patient);
                  }}
                  className="form-control"
                >
                  <option value="">{text[lang].selectPatient}</option>
                  {Array.isArray(patients) && patients.length > 0 ? (
                    patients.map(patient => (
                      <option key={patient.id || patient._id || Math.random()} 
                              value={patient.appointmentId || ""}>
                        {patient.patientName || patient.fullName || patient.name || "Unknown Patient"}
                        {patient.appointmentId ? " ✅" : " ❌ No Appointment"}
                      </option>
                    ))
                  ) : (
                    <option disabled>No patients found</option>
                  )}
                </select>
                {selectedPatient && !selectedPatient.appointmentId && (
                  <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                    ⚠️ This patient has no appointment. Please ask them to book an appointment first.
                  </p>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].medication} *</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                    placeholder="Enter medication name"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].dosage} *</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].frequency}</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})}
                    placeholder="e.g., 2 times daily"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].duration}</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                    placeholder="e.g., 7 days"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{text[lang].diagnosis}</label>
                <input 
                  type="text" 
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                  placeholder="Enter diagnosis"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>{text[lang].instructions}</label>
                <textarea 
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  placeholder="Enter special instructions"
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>{text[lang].notes}</label>
                <textarea 
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                  placeholder="Additional notes"
                  className="form-control"
                  rows="2"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setShowPrescriptionModal(false)}>
                <FaTimesCircle /> {text[lang].cancel}
              </button>
              <button className="btn btn-save" onClick={handleSavePrescription}>
                <FaSave /> {text[lang].savePrescription}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEditModal && (
        <div className="modal-overlay" onClick={() => setShowProfileEditModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUserEdit /> {text[lang].editProfile}</h3>
              <button className="modal-close" onClick={() => setShowProfileEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{text[lang].fullName}</label>
                <input 
                  type="text" 
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].specialty}</label>
                  <input 
                    type="text" 
                    value={profileForm.specialty}
                    onChange={(e) => setProfileForm({...profileForm, specialty: e.target.value})}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].qualification}</label>
                  <input 
                    type="text" 
                    value={profileForm.qualification}
                    onChange={(e) => setProfileForm({...profileForm, qualification: e.target.value})}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].license}</label>
                  <input 
                    type="text" 
                    value={profileForm.license}
                    onChange={(e) => setProfileForm({...profileForm, license: e.target.value})}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].experience}</label>
                  <input 
                    type="text" 
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                    className="form-control"
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].phone}</label>
                  <input 
                    type="text" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].availability}</label>
                  <select 
                    value={profileForm.available} 
                    onChange={(e) => setProfileForm({...profileForm, available: e.target.value === "true"})}
                    className="form-control"
                  >
                    <option value="true">{text[lang].available}</option>
                    <option value="false">{text[lang].unavailable}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setShowProfileEditModal(false)}>
                <FaTimesCircle /> {text[lang].cancel}
              </button>
              <button className="btn btn-save" onClick={handleSaveProfile}>
                <FaSave /> {text[lang].saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={() => setShowEmergencyModal(true)}>
        <FaPlus />
      </button>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaPhoneAlt />
              {text[lang].emergencyTitle}
            </h3>
            <p>{text[lang].emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={() => window.location.href = "tel:999"}>
                <FaPhoneAlt />
                {text[lang].emergencyCall}
              </button>
              <button className="btn-call" onClick={() => window.open("https://www.google.com/maps/search/hospitals+near+me")}>
                <FaMapMarkerAlt />
                {text[lang].emergencyHospital}
              </button>
              <button className="btn-cancel" onClick={() => setShowEmergencyModal(false)}>
                <FaTimes />
                {text[lang].emergencyCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;