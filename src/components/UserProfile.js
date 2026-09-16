// UserProfile.js - Complete with My Appointments Tab & Health Records API Integration
// + ML Heart & Stroke Risk Prediction Integration - Updated with actual model features
// + Prescription Management Added

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "../styles/UserProfile.css";
import { 
  FaMoon, FaSun, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaGlobe, FaGithub, FaLinkedin, FaTwitter, FaCamera, 
  FaEdit, FaSave, FaTimes, FaSignOutAlt, FaHeart, FaComment,
  FaShare, FaBell, FaCog, FaChartLine, FaCalendarAlt,
  FaBriefcase, FaGraduationCap, FaHeartbeat, FaUserMd,
  FaRobot, FaShieldAlt, FaPlus, FaPhoneAlt, FaEye, FaEyeSlash,
  FaUserCircle, FaVenusMars, FaTint, FaRuler, FaWeight,
  FaChartBar, FaChartPie, FaDatabase, FaFlask,
  FaStethoscope, FaSyringe, FaVial, FaMicroscope, FaNotesMedical,
  FaHistory, FaDownload, FaPrint, FaArrowDown, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaSearch, FaHeartbeat as FaHeartRisk, FaBrain,
  FaPills, FaClock, FaBell as FaBellIcon, FaUserInjured, FaStethoscope as FaDoctorSteth,
  FaCalendarCheck, FaChevronRight, FaSpinner, FaFileMedicalAlt, FaVideo, 
  FaPhoneAlt as FaPhoneIcon, FaMapMarkerAlt as FaLocationIcon, FaBan, FaHourglassHalf,
  FaThermometerHalf, FaLungs, FaBone, FaEye as FaEyeIcon, FaCalculator, FaTrash,
  FaMicrochip, FaServer, FaBed, FaHeadSideVirus, FaPrescriptionBottle,
  FaFilePrescription, FaDownload as FaDownloadIcon, FaPrint as FaPrintIcon
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";
import MedicineReminder from "./MedicineReminder";
import { getMyAppointments, cancelAppointment, getAppointmentStatistics } from "../services/appointmentService";
import { 
  saveHealthRecord as saveHealthRecordAPI,
  getHealthHistory,
  getChartData,
  getHealthRecordById,
  deleteHealthRecord,
  getAvailableMetrics
} from "../services/healthRecordService";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const ML_API_URL = process.env.REACT_APP_ML_API_URL || "http://localhost:5001/api";

// ============================================
// DEFAULT DATA STRUCTURES
// ============================================
const defaultHealthMetrics = {
  gender: "",
  age: "",
  height: "",
  weight: "",
  bmi: "",
  bloodPressure: { systolic: "", diastolic: "" },
  heartRate: "",
  temperature: "",
  bloodSugar: { fasting: "", postprandial: "", hba1c: "" },
  lipidProfile: {
    totalCholesterol: "",
    hdl: "",
    ldl: "",
    triglycerides: ""
  },
  cbc: {
    hemoglobin: "",
    wbc: "",
    platelets: "",
    rbc: "",
    hematocrit: "",
    mcv: "",
    mch: "",
    mchc: "",
    rdw: ""
  },
  kidneyFunction: {
    creatinine: "",
    bun: "",
    uricAcid: "",
    egfr: ""
  },
  liverFunction: {
    alt: "",
    ast: "",
    alp: "",
    bilirubin: "",
    protein: "",
    albumin: "",
    globulin: "",
    ggt: ""
  },
  vitamins: {
    vitaminD: "",
    vitaminB12: "",
    folate: "",
    vitaminA: "",
    vitaminE: "",
    vitaminK: "",
    vitaminC: ""
  },
  ironProfile: {
    serumIron: "",
    ferritin: "",
    transferrin: "",
    tibc: "",
    ironSaturation: "",
    transferrinSaturation: ""
  },
  thyroid: {
    tsh: "",
    t3: "",
    t4: "",
    freeT3: "",
    freeT4: "",
    antiTPO: "",
    antiTG: ""
  },
  lifestyle: {
    exercise: "",
    sleep: "",
    stress: "",
    smoking: "",
    alcohol: ""
  },
  cardiovascularRisk: {
    hasChestPain: "",
    hasShortnessOfBreath: "",
    hasFatigue: "",
    hasPalpitations: "",
    hasDizziness: "",
    hasLegSwelling: "",
    hasPainArmsJawBack: "",
    hasColdSweatsNausea: "",
    hasHighBloodPressure: "",
    hasHighCholesterol: "",
    hasDiabetes: "",
    hasSmoking: "",
    hasObesity: "",
    hasSedentaryLifestyle: "",
    hasFamilyHistory: "",
    hasChronicStress: ""
  },
  strokeRisk: {
    hasChestPain: "",
    hasHighBloodPressure: "",
    hasIrregularHeartbeat: "",
    hasShortnessOfBreath: "",
    hasFatigueWeakness: "",
    hasDizziness: "",
    hasSwellingEdema: "",
    hasNeckJawPain: "",
    hasExcessiveSweating: "",
    hasPersistentCough: "",
    hasNauseaVomiting: "",
    hasChestDiscomfort: "",
    hasColdHandsFeet: "",
    hasSnoringSleepApnea: "",
    hasAnxietyDoom: "",
    strokeRiskPercentage: ""
  }
};

const defaultStats = {
  diagnoses: 0,
  appointments: 0,
  articles: 0,
  savedReports: 0
};

const defaultUserData = {
  id: Date.now(),
  name: "",
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  avatar: "https://via.placeholder.com/150",
  coverPhoto: "https://via.placeholder.com/1200x300",
  profession: "",
  company: "",
  website: "",
  joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  dateOfBirth: "",
  age: "",
  gender: "",
  bloodGroup: "",
  emergencyContact: "",
  socialLinks: {
    github: "",
    linkedin: "",
    twitter: ""
  },
  stats: { ...defaultStats },
  recentActivities: [
    { id: 1, type: 'login', description: 'Welcome to QuickCure Hub! Start by editing your profile.', date: 'Just now', icon: 'FaUser' }
  ],
  healthMetrics: JSON.parse(JSON.stringify(defaultHealthMetrics)),
  medicalNotes: "",
  prescriptions: [],
  diagnoses: []
};

// ============================================
// PRESCRIPTION COMPONENT - FIXED
// ============================================
const PrescriptionCard = ({ prescription, onViewDetails, onDownload, onPrint }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: "prescription-status-active",
      completed: "prescription-status-completed",
      expired: "prescription-status-expired",
      cancelled: "prescription-status-cancelled"
    };
    return classes[status] || "prescription-status-active";
  };

  return (
    <div className="prescription-card-item">
      <div className="prescription-card-header">
        <div className="prescription-doctor-info">
          <div className="prescription-doctor-avatar">
            <FaUserMd />
          </div>
          <div>
            <h4 className="prescription-doctor-name">{prescription.doctorName || "Unknown Doctor"}</h4>
            <span className="prescription-doctor-specialization">{prescription.doctorSpecialization || "General"}</span>
          </div>
        </div>
        <span className={`prescription-status-badge ${getStatusBadge(prescription.status)}`}>
          {prescription.status || "Active"}
        </span>
      </div>

      <div className="prescription-card-body">
        <div className="prescription-diagnosis">
          <strong>Diagnosis:</strong> {prescription.diagnosis || "Not specified"}
        </div>
        
        <div className="prescription-medications">
          <strong>Medications:</strong>
          {prescription.medicines && prescription.medicines.length > 0 ? (
            <ul className="prescription-medicine-list">
              {prescription.medicines.map((med, idx) => (
                <li key={idx}>
                  <span className="med-name">{med.medicineName || med.name}</span>
                  <span className="med-dosage">{med.dosage}</span>
                  <span className="med-frequency">{med.frequency}</span>
                  {med.duration && <span className="med-duration">({med.duration})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <span className="no-medication">No medications listed</span>
          )}
        </div>

        {prescription.notes && (
          <div className="prescription-notes">
            <strong>Notes:</strong> {prescription.notes}
          </div>
        )}

        <div className="prescription-meta">
          <span><FaCalendarAlt /> {formatDate(prescription.date)}</span>
          {prescription.followUpDate && (
            <span><FaClock /> Follow-up: {formatDate(prescription.followUpDate)}</span>
          )}
          <span>Refills: {prescription.refillsUsed || 0}/{prescription.refills || 0}</span>
        </div>
      </div>

      <div className="prescription-card-footer">
        {/* ✅ View Details - আলাদা ফাংশন */}
        <button 
          className="prescription-view-btn"
          onClick={() => onViewDetails && onViewDetails(prescription)}
          title="View Prescription Details"
        >
          <FaEye /> View Details
        </button>
        {/* ✅ Download - আলাদা ফাংশন */}
        <button 
          className="prescription-download-btn"
          onClick={() => onDownload && onDownload(prescription)}
          title="Download Prescription"
        >
          <FaDownloadIcon /> Download
        </button>
        {/* ✅ Print - আলাদা ফাংশন */}
        <button 
          className="prescription-print-btn"
          onClick={() => onPrint && onPrint(prescription)}
          title="Print Prescription"
        >
          <FaPrintIcon /> Print
        </button>
      </div>
    </div>
  );
};

function UserProfile() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [selectedHealthCategory, setSelectedHealthCategory] = useState('basicInfo');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [healthHistory, setHealthHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
  const [historyViewMode, setHistoryViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCardioRisk, setShowCardioRisk] = useState(false);
  const [showStrokeRisk, setShowStrokeRisk] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // ✅ Prescription States
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Health Records API states
  const [chartData, setChartData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('bmi');
  const [savingRecord, setSavingRecord] = useState(false);
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    upcoming: 0,
    thisMonth: 0,
  });
  const [appointmentPagination, setAppointmentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [appointmentFilters, setAppointmentFilters] = useState({
    status: "All",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  
  // Doctor access state
  const [isDoctorView, setIsDoctorView] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [canEditMedicalHistory, setCanEditMedicalHistory] = useState(false);
  
  // ============================================
  // 🆕 ML PREDICTION STATES - PURE ML API ONLY
  // ============================================
  const [mlLoading, setMlLoading] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [showMlResult, setShowMlResult] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [mlServiceAvailable, setMlServiceAvailable] = useState(true);

  // ============================================
  // USER DATA STATE WITH SAFE DEFAULTS
  // ============================================
  const [userData, setUserData] = useState(() => {
    return JSON.parse(JSON.stringify(defaultUserData));
  });
  
  const [editedData, setEditedData] = useState(() => {
    return JSON.parse(JSON.stringify(defaultUserData));
  });

  // ✅ হ্যান্ডলার ফাংশনগুলো সঠিক স্থানে
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setEditedData(prev => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks || {}), [platform]: value }
    }));
  };

  // ✅ Health Metric Change Handler
  const handleHealthMetricChange = (category, field, value) => {
    setEditedData(prev => {
      const updated = { ...prev };
      if (!updated.healthMetrics) {
        updated.healthMetrics = JSON.parse(JSON.stringify(defaultHealthMetrics));
      }
      
      if (category === 'bloodPressure') {
        if (!updated.healthMetrics.bloodPressure) {
          updated.healthMetrics.bloodPressure = { systolic: "", diastolic: "" };
        }
        updated.healthMetrics.bloodPressure[field] = value;
      } else if (category && field) {
        if (!updated.healthMetrics[category]) {
          updated.healthMetrics[category] = {};
        }
        updated.healthMetrics[category][field] = value;
      } else if (category && !field) {
        updated.healthMetrics[category] = value;
      }
      
      // Auto-calculate BMI when height or weight changes
      if ((category === 'height' || category === 'weight') || 
          (category === 'height' && field) || (category === 'weight' && field)) {
        const height = parseFloat(updated.healthMetrics.height) || 0;
        const weight = parseFloat(updated.healthMetrics.weight) || 0;
        if (height > 0 && weight > 0) {
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);
          updated.healthMetrics.bmi = Math.round(bmi * 10) / 10;
        }
      }
      
      return updated;
    });
  };

  // ============================================
  // ✅ LOAD USER PRESCRIPTIONS
  // ============================================
  const loadUserPrescriptions = async () => {
    setPrescriptionsLoading(true);
    setPrescriptionsError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPrescriptionsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/prescriptions/patient`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("📦 Prescriptions Response:", response.data);

      if (response.data.success) {
        const prescriptionsData = response.data.prescriptions || response.data.data || [];
        
        const formattedPrescriptions = prescriptionsData.map(p => ({
          id: p._id,
          _id: p._id,
          doctorName: p.doctor?.name || p.doctor?.firstName + " " + p.doctor?.lastName || "Unknown Doctor",
          doctorSpecialization: p.doctor?.specialization || "General",
          diagnosis: p.diagnosis || "",
          medicines: p.medicines || p.medications || [],
          notes: p.notes || "",
          date: p.createdAt || p.date || new Date().toISOString().split('T')[0],
          followUpDate: p.followUpDate || "",
          status: p.status || "active",
          refills: p.refills || 0,
          refillsUsed: p.refillsUsed || 0,
          appointmentId: p.appointment?._id || p.appointment
        }));
        
        setUserPrescriptions(formattedPrescriptions);
        console.log("✅ Loaded", formattedPrescriptions.length, "prescriptions");
      } else {
        setPrescriptionsError(response.data.message || "Failed to load prescriptions");
      }
    } catch (error) {
      console.error("❌ Error loading prescriptions:", error);
      setPrescriptionsError(error.message || "Failed to load prescriptions");
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  // ============================================
  // ✅ VIEW PRESCRIPTION DETAILS
  // ============================================
  const viewPrescriptionDetails = (prescription) => {
    console.log("👀 Viewing prescription details:", prescription);
    
    // Modal এ দেখানোর জন্য
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  // ============================================
  // ✅ DOWNLOAD PRESCRIPTION
  // ============================================
  const downloadPrescription = (prescription) => {
    const content = `
      ==========================================
      QUICKCURE HUB - PRESCRIPTION
      ==========================================
      
      Patient: ${userData.name || userData.fullName || "Unknown Patient"}
      Date: ${new Date(prescription.date).toLocaleDateString()}
      
      ------------------------------------------
      DIAGNOSIS:
      ${prescription.diagnosis || "Not specified"}
      
      ------------------------------------------
      MEDICATIONS:
      ${prescription.medicines && prescription.medicines.length > 0 
        ? prescription.medicines.map((med, i) => 
            `${i+1}. ${med.medicineName || med.name} - ${med.dosage} - ${med.frequency} ${med.duration ? '('+med.duration+')' : ''}`
          ).join('\n')
        : "No medications listed"}
      
      ------------------------------------------
      NOTES:
      ${prescription.notes || "No additional notes"}
      
      ------------------------------------------
      PRESCRIBED BY:
      ${prescription.doctorName || "Unknown Doctor"}
      ${prescription.doctorSpecialization ? "("+prescription.doctorSpecialization+")" : ""}
      
      ------------------------------------------
      Status: ${prescription.status || "Active"}
      Refills: ${prescription.refillsUsed || 0}/${prescription.refills || 0}
      ${prescription.followUpDate ? "Follow-up: "+new Date(prescription.followUpDate).toLocaleDateString() : ""}
      
      ==========================================
      Generated by QuickCure Hub
      ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${prescription.id || 'download'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /// ============================================
// ✅ PRINT PRESCRIPTION - FIXED
// ============================================
const printPrescription = (prescription) => {
  console.log("🖨️ Printing prescription:", prescription);
  
  // ✅ সরাসরি Print Window খোলো (Modal ছাড়া)
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) {
    alert("Please allow popups for this site to print prescriptions.");
    return;
  }
  
  const medsHtml = prescription.medicines && prescription.medicines.length > 0 
    ? prescription.medicines.map(med => `
        <div class="med-item">
          <strong>${med.medicineName || med.name}</strong> - ${med.dosage} - ${med.frequency}
          ${med.duration ? ' ('+med.duration+')' : ''}
          ${med.instructions ? '<br><em>'+med.instructions+'</em>' : ''}
        </div>
      `).join('')
    : "<p>No medications listed</p>";
  
  win.document.write(`
    <html>
      <head>
        <title>Prescription</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: auto; 
            background: #fff;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #00e6ff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #00e6ff; 
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p { 
            color: #666;
            font-size: 16px;
          }
          .section { 
            margin: 25px 0; 
            padding: 15px 0;
            border-bottom: 1px solid #eee;
          }
          .section:last-child { border-bottom: none; }
          .section-title { 
            font-weight: bold; 
            font-size: 16px; 
            color: #00e6ff;
            border-bottom: 2px solid #00e6ff;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .med-item { 
            padding: 8px 12px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #00e6ff;
          }
          .med-item strong { color: #1a2332; }
          .med-item em { color: #666; font-size: 13px; }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #999; 
            font-size: 12px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            padding: 6px 0;
          }
          .label { font-weight: bold; color: #555; }
          .status-badge { 
            display: inline-block; 
            padding: 3px 14px; 
            border-radius: 12px; 
            font-size: 13px; 
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-active { background: #4CAF50; color: white; }
          .status-completed { background: #2196F3; color: white; }
          .status-expired { background: #f44336; color: white; }
          .status-cancelled { background: #9E9E9E; color: white; }
          .prescription-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 10px;
            padding: 10px 0;
            border-top: 1px solid #eee;
          }
          .prescription-meta span {
            color: #666;
            font-size: 13px;
          }
          .doctor-specialization {
            color: #888;
            font-size: 14px;
          }
          @media print {
            body { padding: 20px; }
            .med-item { background: #f5f5f5; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🩺 QuickCure Hub</h1>
          <p>Prescription</p>
        </div>
        
        <div class="section">
          <div class="row"><span class="label">Patient:</span> <span>${userData.name || userData.fullName || "Unknown Patient"}</span></div>
          <div class="row"><span class="label">Date:</span> <span>${new Date(prescription.date).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Doctor:</span> <span>${prescription.doctorName || "Unknown Doctor"} <span class="doctor-specialization">${prescription.doctorSpecialization ? "("+prescription.doctorSpecialization+")" : ""}</span></span></div>
          <div class="row"><span class="label">Status:</span> <span class="status-badge status-${prescription.status || 'active'}">${prescription.status || 'Active'}</span></div>
        </div>
        
        <div class="section">
          <div class="section-title">📋 Diagnosis</div>
          <p style="padding: 8px 0; font-size: 15px;">${prescription.diagnosis || "Not specified"}</p>
        </div>
        
        <div class="section">
          <div class="section-title">💊 Medications</div>
          ${medsHtml}
        </div>
        
        ${prescription.notes ? `
          <div class="section">
            <div class="section-title">📝 Notes</div>
            <p style="padding: 8px 0; font-size: 14px; color: #555;">${prescription.notes}</p>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">📊 Additional Information</div>
          <div class="prescription-meta">
            <span><strong>Refills:</strong> ${prescription.refillsUsed || 0}/${prescription.refills || 0}</span>
            ${prescription.followUpDate ? `<span><strong>Follow-up:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</span>` : ''}
            <span><strong>Prescription ID:</strong> #${prescription.id || prescription._id || 'N/A'}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Generated by QuickCure Hub</p>
          <p>${new Date().toLocaleString()}</p>
          <p style="margin-top: 8px; font-size: 11px; color: #bbb;">This is a computer generated prescription. No signature required.</p>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  
  // ✅ Print Dialog Show করো
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
};

  // ============================================
  // 🆕 ML PREDICTION FUNCTIONS - PURE ML API ONLY
  // ============================================

  // ✅ Check ML Service Health
  const checkMLService = async () => {
    try {
      const response = await fetch(`${ML_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setMlServiceAvailable(true);
        return true;
      } else {
        setMlServiceAvailable(false);
        return false;
      }
    } catch (error) {
      console.error('❌ ML Service unavailable:', error);
      setMlServiceAvailable(false);
      return false;
    }
  };

  // ============================================
  // ✅ HEART ATTACK PREDICTION
  // ============================================
  const predictHeartAttack = async () => {
    const metrics = editedData.healthMetrics;
    
    const serviceOk = await checkMLService();
    if (!serviceOk) {
      setMlError('❌ ML Service is currently unavailable. Please try again later.');
      setShowMlResult(true);
      return;
    }
    
    const requiredFields = [
      'age', 'gender', 
      'cardiovascularRisk.hasChestPain',
      'cardiovascularRisk.hasShortnessOfBreath',
      'cardiovascularRisk.hasFatigue',
      'cardiovascularRisk.hasPalpitations',
      'cardiovascularRisk.hasDizziness',
      'cardiovascularRisk.hasLegSwelling',
      'cardiovascularRisk.hasPainArmsJawBack',
      'cardiovascularRisk.hasColdSweatsNausea',
      'cardiovascularRisk.hasHighBloodPressure',
      'cardiovascularRisk.hasHighCholesterol',
      'cardiovascularRisk.hasDiabetes',
      'cardiovascularRisk.hasSmoking',
      'cardiovascularRisk.hasObesity',
      'cardiovascularRisk.hasSedentaryLifestyle',
      'cardiovascularRisk.hasFamilyHistory',
      'cardiovascularRisk.hasChronicStress'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = getNestedValue(metrics, field);
      return !value && value !== 0 && value !== '0' && value !== 'No' && value !== 'Female' && value !== 'Male';
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in all Heart Risk Assessment fields before predicting.\nMissing: ${missingFields.join(', ')}`);
      setSelectedHealthCategory('cardiovascularRisk');
      return;
    }
    
    setMlLoading(true);
    setMlError(null);
    setMlResult(null);
    
    try {
      const convertYesNo = (value) => {
        if (value === 'Yes') return 1;
        if (value === 'No') return 0;
        return value;
      };
      
      const convertGender = (value) => {
        if (value === 'Male') return 1;
        if (value === 'Female') return 0;
        return parseInt(value) || 0;
      };
      
      const requestData = {
        age: parseFloat(metrics.age) || 0,
        gender: convertGender(metrics.gender),
        cp: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasChestPain')),
        shortness_of_breath: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasShortnessOfBreath')),
        fatigue: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasFatigue')),
        palpitations: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasPalpitations')),
        dizziness: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasDizziness')),
        swelling: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasLegSwelling')),
        pain_arms_jaw_back: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasPainArmsJawBack')),
        cold_sweats_nausea: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasColdSweatsNausea')),
        high_bp: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasHighBloodPressure')),
        high_cholesterol: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasHighCholesterol')),
        diabetes: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasDiabetes')),
        smoking: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasSmoking')),
        obesity: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasObesity')),
        sedentary_lifestyle: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasSedentaryLifestyle')),
        family_history: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasFamilyHistory')),
        chronic_stress: convertYesNo(getNestedValue(metrics, 'cardiovascularRisk.hasChronicStress'))
      };
      
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined || requestData[key] === null) {
          requestData[key] = 0;
        }
      });
      
      console.log('📊 Sending Heart Prediction Request:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(`${ML_API_URL}/heart/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('📊 Heart Prediction Response:', data);
      
      const prob = data.probability || 0;
      const prediction = data.prediction || 0;
      const confidence = data.confidence || Math.round(prob * 100);
      
      setMlResult({
        type: 'heart',
        prediction: prediction,
        probability: prob,
        message: data.message || (prediction === 1 ? '⚠️ Heart disease detected' : '✅ No heart disease detected'),
        score: Math.round(prob * 100),
        mode: data.mode || 'ml',
        confidence: confidence,
        confidence_level: data.confidence_level || (confidence >= 70 ? 'High' : confidence >= 50 ? 'Moderate' : 'Low'),
        risk_factors: data.risk_factors || null,
        risk_score: data.risk_score || null,
        model_used: data.model_used || 'Heart Disease Classifier'
      });
      setShowMlResult(true);
      
      const newActivity = {
        id: Date.now(),
        type: 'ml_prediction',
        description: `Heart Attack Risk Prediction: ${data.message || (prediction === 1 ? 'Risk Detected' : 'No Risk')} (${confidence}% confidence)`,
        date: 'Just now',
        icon: 'FaHeartRisk'
      };
      setUserData(prev => ({ 
        ...prev, 
        recentActivities: [newActivity, ...(prev.recentActivities || [])] 
      }));
      
    } catch (error) {
      console.error('❌ Heart Prediction Error:', error);
      setMlError(`❌ ${error.message || 'Failed to connect to ML service'}`);
      setShowMlResult(true);
    } finally {
      setMlLoading(false);
    }
  };

  // ============================================
  // ✅ STROKE PREDICTION
  // ============================================
  const predictStroke = async () => {
    const metrics = editedData.healthMetrics;
    
    const serviceOk = await checkMLService();
    if (!serviceOk) {
      setMlError('❌ ML Service is currently unavailable. Please try again later.');
      setShowMlResult(true);
      return;
    }
    
    const requiredFields = [
      'age', 'gender',
      'strokeRisk.hasChestPain',
      'strokeRisk.hasHighBloodPressure',
      'strokeRisk.hasIrregularHeartbeat',
      'strokeRisk.hasShortnessOfBreath',
      'strokeRisk.hasFatigueWeakness',
      'strokeRisk.hasDizziness',
      'strokeRisk.hasSwellingEdema',
      'strokeRisk.hasNeckJawPain',
      'strokeRisk.hasExcessiveSweating',
      'strokeRisk.hasPersistentCough',
      'strokeRisk.hasNauseaVomiting',
      'strokeRisk.hasChestDiscomfort',
      'strokeRisk.hasColdHandsFeet',
      'strokeRisk.hasSnoringSleepApnea',
      'strokeRisk.hasAnxietyDoom'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = getNestedValue(metrics, field);
      return !value && value !== 0 && value !== '0' && value !== 'No' && value !== 'Female' && value !== 'Male';
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in all Stroke Risk Assessment fields before predicting.\nMissing: ${missingFields.join(', ')}`);
      setSelectedHealthCategory('strokeRisk');
      return;
    }
    
    setMlLoading(true);
    setMlError(null);
    setMlResult(null);
    
    try {
      const convertYesNo = (value) => {
        if (value === 'Yes') return 1;
        if (value === 'No') return 0;
        return value;
      };
      
      const convertGender = (value) => {
        if (value === 'Male') return 1;
        if (value === 'Female') return 0;
        return parseInt(value) || 0;
      };
      
      const requestData = {
        age: parseFloat(metrics.age) || 0,
        gender: convertGender(metrics.gender),
        chest_pain: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasChestPain')),
        high_blood_pressure: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasHighBloodPressure')),
        irregular_heartbeat: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasIrregularHeartbeat')),
        shortness_of_breath: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasShortnessOfBreath')),
        fatigue_weakness: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasFatigueWeakness')),
        dizziness: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasDizziness')),
        swelling_edema: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasSwellingEdema')),
        neck_jaw_pain: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasNeckJawPain')),
        excessive_sweating: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasExcessiveSweating')),
        persistent_cough: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasPersistentCough')),
        nausea_vomiting: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasNauseaVomiting')),
        chest_discomfort: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasChestDiscomfort')),
        cold_hands_feet: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasColdHandsFeet')),
        snoring_sleep_apnea: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasSnoringSleepApnea')),
        anxiety_doom: convertYesNo(getNestedValue(metrics, 'strokeRisk.hasAnxietyDoom'))
      };
      
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined || requestData[key] === null) {
          requestData[key] = 0;
        }
      });
      
      console.log('📊 Sending Stroke Prediction Request:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(`${ML_API_URL}/stroke/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('📊 Stroke Prediction Response:', data);
      
      setMlResult({
        type: 'stroke',
        prediction: data.prediction,
        probability: data.probability,
        message: data.message || (data.prediction === 1 ? 'Stroke risk detected' : 'No stroke risk'),
        score: Math.round((data.probability || 0) * 100),
        mode: 'ml',
        confidence: data.confidence || Math.round((data.probability || 0) * 100),
        confidence_level: data.confidence_level || 'Moderate',
        risk_factors: data.risk_factors || null,
        risk_score: data.risk_score || null,
        model_used: data.model_used || 'Stroke Risk Classifier'
      });
      setShowMlResult(true);
      
      const newActivity = {
        id: Date.now(),
        type: 'ml_prediction',
        description: `Stroke Risk Prediction: ${data.message || (data.prediction === 1 ? 'Risk Detected' : 'No Risk')} (${Math.round((data.probability || 0) * 100)}% confidence)`,
        date: 'Just now',
        icon: 'FaBrain'
      };
      setUserData(prev => ({ 
        ...prev, 
        recentActivities: [newActivity, ...(prev.recentActivities || [])] 
      }));
      
    } catch (error) {
      console.error('❌ Stroke Prediction Error:', error);
      setMlError(`❌ ${error.message || 'Failed to connect to ML service'}`);
      setShowMlResult(true);
    } finally {
      setMlLoading(false);
    }
  };

  // ✅ Save Health Record
  const saveHealthRecord = async () => {
    try {
      setSavingRecord(true);
      
      const allMetrics = JSON.parse(JSON.stringify(editedData.healthMetrics));
      
      const recordData = {
        date: selectedDate || new Date().toISOString().split('T')[0],
        metrics: allMetrics,
        notes: medicalNote || ""
      };
      
      console.log("📊 Saving ALL health metrics:", recordData);
      
      const response = await saveHealthRecordAPI(recordData);
      
      if (response.success) {
        alert(lang === 'en' ? 'All health records saved successfully!' : 'সমস্ত স্বাস্থ্য রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে!');
        await loadHealthHistoryFromAPI();
        
        const newActivity = {
          id: Date.now(),
          type: 'health_record',
          description: 'All health records saved',
          date: 'Just now',
          icon: 'FaHeartbeat'
        };
        setUserData(prev => ({ 
          ...prev, 
          recentActivities: [newActivity, ...(prev.recentActivities || [])] 
        }));
      } else {
        alert(response.message || 'Failed to save health records');
      }
    } catch (error) {
      console.error('Error saving health record:', error);
      alert(error.message || 'Failed to save health records. Please try again.');
    } finally {
      setSavingRecord(false);
    }
  };
  
  // ✅ Load Health History from API
  const loadHealthHistoryFromAPI = async () => {
    try {
      setHistoryLoading(true);
      const response = await getHealthHistory({ limit: 100 });
      if (response.success) {
        setHealthHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading health history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // ✅ Load Chart Data from API
  const loadChartDataFromAPI = async (metric = 'bmi') => {
    try {
      const response = await getChartData(metric, 30);
      if (response.success) {
        setChartData(response.data || []);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
    }
  };
  
  // ✅ Open Chart Modal
  const openChartModal = async () => {
    await loadChartDataFromAPI(selectedMetric);
    setShowChartModal(true);
  };
  
  // ✅ Open History Modal
  const openHistoryModal = async () => {
    await loadHealthHistoryFromAPI();
    setShowHistoryModal(true);
  };

  // ✅ Delete Health Record
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this record?' : 'আপনি কি এই রেকর্ডটি মুছতে চান?')) {
      return;
    }
    
    try {
      const response = await deleteHealthRecord(recordId);
      if (response.success) {
        alert(lang === 'en' ? 'Record deleted successfully!' : 'রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!');
        await loadHealthHistoryFromAPI();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(error.message || 'Failed to delete record');
    }
  };
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [medicalNote, setMedicalNote] = useState("");

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getDisplayName = (user) => {
    if (!user) return "Guest";
    return user.name || user.fullName || user.firstName || 
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) || "User";
  };

  const safeGetStats = (obj, key, defaultValue = 0) => {
    if (!obj) return defaultValue;
    if (!obj.stats) return defaultValue;
    return obj.stats[key] !== undefined ? obj.stats[key] : defaultValue;
  };

  const safeGetHealthMetric = (obj, path, defaultValue = "") => {
    if (!obj) return defaultValue;
    if (!obj.healthMetrics) return defaultValue;
    const keys = path.split('.');
    let current = obj.healthMetrics;
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue;
      current = current[key];
    }
    return current !== undefined && current !== null ? current : defaultValue;
  };

  const getBloodPressureValue = (healthMetrics, field) => {
    if (!healthMetrics) return "";
    const bp = healthMetrics.bloodPressure;
    if (bp && typeof bp === 'object') {
      return bp[field] || "";
    }
    return "";
  };

  const getNestedValue = (obj, path, defaultValue = "") => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue;
      current = current[key];
    }
    return current !== undefined && current !== null ? current : defaultValue;
  };

  // ============================================
  // LOAD USER APPOINTMENTS FROM API
  // ============================================
  const loadUserAppointments = async (filters = appointmentFilters, page = 1) => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAppointmentsLoading(false);
        return;
      }

      const response = await getMyAppointments({
        status: filters.status,
        page: page,
        limit: appointmentPagination.limit,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
      });

      if (response.success) {
        setAppointments(response.appointments || []);
        setAppointmentStats(response.stats || appointmentStats);
        setAppointmentPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
          limit: appointmentPagination.limit,
        });
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointmentsError(error.message || "Failed to load appointments");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // ============================================
  // FIX HEALTH METRICS FUNCTION
  // ============================================
  const fixHealthMetrics = (metrics) => {
    if (!metrics) return JSON.parse(JSON.stringify(defaultHealthMetrics));
    
    const fixed = JSON.parse(JSON.stringify(metrics));
    
    if (typeof fixed.bloodPressure === 'string') {
      const parts = fixed.bloodPressure.split('/');
      fixed.bloodPressure = {
        systolic: parts[0]?.trim() || "",
        diastolic: parts[1]?.trim() || ""
      };
    }
    
    if (!fixed.bloodPressure || typeof fixed.bloodPressure !== 'object') {
      fixed.bloodPressure = { systolic: "", diastolic: "" };
    }
    
    if (!fixed.bloodSugar || typeof fixed.bloodSugar !== 'object') {
      fixed.bloodSugar = { fasting: "", postprandial: "", hba1c: "" };
    }
    
    if (!fixed.lipidProfile || typeof fixed.lipidProfile !== 'object') {
      fixed.lipidProfile = { totalCholesterol: "", hdl: "", ldl: "", triglycerides: "" };
    }
    
    if (!fixed.cbc || typeof fixed.cbc !== 'object') {
      fixed.cbc = { 
        hemoglobin: "", wbc: "", platelets: "", rbc: "", hematocrit: "",
        mcv: "", mch: "", mchc: "", rdw: "" 
      };
    }
    
    if (!fixed.liverFunction || typeof fixed.liverFunction !== 'object') {
      fixed.liverFunction = { 
        alt: "", ast: "", alp: "", bilirubin: "", protein: "",
        albumin: "", globulin: "", ggt: "" 
      };
    }
    
    if (!fixed.vitamins || typeof fixed.vitamins !== 'object') {
      fixed.vitamins = { 
        vitaminD: "", vitaminB12: "", folate: "",
        vitaminA: "", vitaminE: "", vitaminK: "", vitaminC: "" 
      };
    }
    
    if (!fixed.ironProfile || typeof fixed.ironProfile !== 'object') {
      fixed.ironProfile = { 
        serumIron: "", ferritin: "", transferrin: "", tibc: "",
        ironSaturation: "", transferrinSaturation: "" 
      };
    }
    
    if (!fixed.thyroid || typeof fixed.thyroid !== 'object') {
      fixed.thyroid = { 
        tsh: "", t3: "", t4: "", freeT3: "", freeT4: "",
        antiTPO: "", antiTG: "" 
      };
    }
    
    if (!fixed.cardiovascularRisk || typeof fixed.cardiovascularRisk !== 'object') {
      fixed.cardiovascularRisk = JSON.parse(JSON.stringify(defaultHealthMetrics.cardiovascularRisk));
    }
    
    if (!fixed.strokeRisk || typeof fixed.strokeRisk !== 'object') {
      fixed.strokeRisk = JSON.parse(JSON.stringify(defaultHealthMetrics.strokeRisk));
    }
    
    if (!fixed.stats) {
      fixed.stats = { ...defaultStats };
    }
    
    return fixed;
  };

  // ============================================
  // HEALTH CATEGORIES
  // ============================================
  const healthCategories = {
    basicInfo: {
      name: "Basic Information",
      icon: <FaUserCircle />,
      color: "#4CAF50",
      metrics: [
        { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], unit: "" },
        { key: "age", label: "Age", type: "number", unit: "years", placeholder: "Enter age" },
        { key: "height", label: "Height", type: "number", unit: "cm", placeholder: "Enter height" },
        { key: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "Enter weight" },
        { key: "bmi", label: "BMI", type: "number", unit: "kg/m²", placeholder: "Enter BMI manually or auto-calculated" }
      ]
    },
    vitalSigns: {
      name: "Vital Signs",
      icon: <FaHeartbeat />,
      color: "#f44336",
      metrics: [
        { key: "bloodPressure", label: "Blood Pressure", type: "bp", unit: "mmHg", placeholder: "Systolic/Diastolic" },
        { key: "heartRate", label: "Heart Rate", type: "number", unit: "bpm", placeholder: "Enter heart rate" },
        { key: "temperature", label: "Temperature", type: "number", unit: "°C", placeholder: "Enter temperature" }
      ]
    },
    diabetes: {
      name: "Diabetes Markers",
      icon: <FaSyringe />,
      color: "#FF9800",
      metrics: [
        { key: "bloodSugar.fasting", label: "Fasting Blood Sugar", type: "number", unit: "mg/dL", placeholder: "Enter fasting sugar" },
        { key: "bloodSugar.postprandial", label: "Postprandial Sugar", type: "number", unit: "mg/dL", placeholder: "Enter postprandial sugar" },
        { key: "bloodSugar.hba1c", label: "HbA1c", type: "number", unit: "%", placeholder: "Enter HbA1c" }
      ]
    },
    lipidProfile: {
      name: "Lipid Profile",
      icon: <FaChartLine />,
      color: "#9C27B0",
      metrics: [
        { key: "lipidProfile.totalCholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", placeholder: "Enter cholesterol" },
        { key: "lipidProfile.hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", placeholder: "Enter HDL" },
        { key: "lipidProfile.ldl", label: "LDL Cholesterol", type: "number", unit: "mg/dL", placeholder: "Enter LDL" },
        { key: "lipidProfile.triglycerides", label: "Triglycerides", type: "number", unit: "mg/dL", placeholder: "Enter triglycerides" }
      ]
    },
    cbc: {
      name: "Complete Blood Count",
      icon: <FaMicroscope />,
      color: "#2196F3",
      metrics: [
        { key: "cbc.hemoglobin", label: "Hemoglobin", type: "number", unit: "g/dL", placeholder: "Enter hemoglobin" },
        { key: "cbc.wbc", label: "WBC Count", type: "number", unit: "×10³/µL", placeholder: "Enter WBC" },
        { key: "cbc.platelets", label: "Platelets", type: "number", unit: "×10³/µL", placeholder: "Enter platelets" },
        { key: "cbc.rbc", label: "RBC Count", type: "number", unit: "×10⁶/µL", placeholder: "Enter RBC" },
        { key: "cbc.hematocrit", label: "Hematocrit", type: "number", unit: "%", placeholder: "Enter hematocrit" },
        { key: "cbc.mcv", label: "MCV", type: "number", unit: "fL", placeholder: "Enter MCV" },
        { key: "cbc.mch", label: "MCH", type: "number", unit: "pg", placeholder: "Enter MCH" },
        { key: "cbc.mchc", label: "MCHC", type: "number", unit: "g/dL", placeholder: "Enter MCHC" },
        { key: "cbc.rdw", label: "RDW", type: "number", unit: "%", placeholder: "Enter RDW" }
      ]
    },
    kidneyFunction: {
      name: "Kidney Function",
      icon: <FaTint />,
      color: "#00BCD4",
      metrics: [
        { key: "kidneyFunction.creatinine", label: "Creatinine", type: "number", unit: "mg/dL", placeholder: "Enter creatinine" },
        { key: "kidneyFunction.bun", label: "BUN", type: "number", unit: "mg/dL", placeholder: "Enter BUN" },
        { key: "kidneyFunction.uricAcid", label: "Uric Acid", type: "number", unit: "mg/dL", placeholder: "Enter uric acid" },
        { key: "kidneyFunction.egfr", label: "eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "Enter eGFR" }
      ]
    },
    liverFunction: {
      name: "Liver Function",
      icon: <FaFlask />,
      color: "#8BC34A",
      metrics: [
        { key: "liverFunction.alt", label: "ALT (SGPT)", type: "number", unit: "U/L", placeholder: "Enter ALT" },
        { key: "liverFunction.ast", label: "AST (SGOT)", type: "number", unit: "U/L", placeholder: "Enter AST" },
        { key: "liverFunction.alp", label: "ALP", type: "number", unit: "U/L", placeholder: "Enter ALP" },
        { key: "liverFunction.bilirubin", label: "Bilirubin", type: "number", unit: "mg/dL", placeholder: "Enter bilirubin" },
        { key: "liverFunction.protein", label: "Total Protein", type: "number", unit: "g/dL", placeholder: "Enter total protein" },
        { key: "liverFunction.albumin", label: "Albumin", type: "number", unit: "g/dL", placeholder: "Enter albumin" },
        { key: "liverFunction.globulin", label: "Globulin", type: "number", unit: "g/dL", placeholder: "Enter globulin" },
        { key: "liverFunction.ggt", label: "GGT", type: "number", unit: "U/L", placeholder: "Enter GGT" }
      ]
    },
    vitamins: {
      name: "Vitamin Profile",
      icon: <FaVial />,
      color: "#E91E63",
      metrics: [
        { key: "vitamins.vitaminD", label: "Vitamin D (25-Hydroxy)", type: "number", unit: "ng/mL", placeholder: "Enter Vitamin D" },
        { key: "vitamins.vitaminB12", label: "Vitamin B12", type: "number", unit: "pg/mL", placeholder: "Enter Vitamin B12" },
        { key: "vitamins.folate", label: "Folate (Vitamin B9)", type: "number", unit: "ng/mL", placeholder: "Enter Folate" },
        { key: "vitamins.vitaminA", label: "Vitamin A (Retinol)", type: "number", unit: "µg/dL", placeholder: "Enter Vitamin A" },
        { key: "vitamins.vitaminE", label: "Vitamin E (Tocopherol)", type: "number", unit: "µg/mL", placeholder: "Enter Vitamin E" },
        { key: "vitamins.vitaminK", label: "Vitamin K", type: "number", unit: "ng/mL", placeholder: "Enter Vitamin K" },
        { key: "vitamins.vitaminC", label: "Vitamin C", type: "number", unit: "mg/dL", placeholder: "Enter Vitamin C" }
      ]
    },
    ironProfile: {
      name: "Iron Profile",
      icon: <FaDatabase />,
      color: "#FF5722",
      metrics: [
        { key: "ironProfile.serumIron", label: "Serum Iron", type: "number", unit: "µg/dL", placeholder: "Enter serum iron" },
        { key: "ironProfile.ferritin", label: "Ferritin", type: "number", unit: "ng/mL", placeholder: "Enter ferritin" },
        { key: "ironProfile.transferrin", label: "Transferrin", type: "number", unit: "mg/dL", placeholder: "Enter transferrin" },
        { key: "ironProfile.tibc", label: "TIBC", type: "number", unit: "µg/dL", placeholder: "Enter TIBC" },
        { key: "ironProfile.ironSaturation", label: "Iron Saturation", type: "number", unit: "%", placeholder: "Enter iron saturation" },
        { key: "ironProfile.transferrinSaturation", label: "Transferrin Saturation", type: "number", unit: "%", placeholder: "Enter transferrin saturation" }
      ]
    },
    thyroid: {
      name: "Thyroid Profile",
      icon: <FaStethoscope />,
      color: "#3F51B5",
      metrics: [
        { key: "thyroid.tsh", label: "TSH", type: "number", unit: "µIU/mL", placeholder: "Enter TSH" },
        { key: "thyroid.t3", label: "T3", type: "number", unit: "ng/dL", placeholder: "Enter T3" },
        { key: "thyroid.t4", label: "T4", type: "number", unit: "µg/dL", placeholder: "Enter T4" },
        { key: "thyroid.freeT3", label: "Free T3", type: "number", unit: "pg/mL", placeholder: "Enter Free T3" },
        { key: "thyroid.freeT4", label: "Free T4", type: "number", unit: "ng/dL", placeholder: "Enter Free T4" },
        { key: "thyroid.antiTPO", label: "Anti-TPO", type: "number", unit: "IU/mL", placeholder: "Enter Anti-TPO" },
        { key: "thyroid.antiTG", label: "Anti-TG", type: "number", unit: "IU/mL", placeholder: "Enter Anti-TG" }
      ]
    },
    lifestyle: {
      name: "Lifestyle",
      icon: <FaNotesMedical />,
      color: "#607D8B",
      metrics: [
        { key: "lifestyle.exercise", label: "Exercise Frequency", type: "select", options: ["Daily", "3-5/week", "1-2/week", "Rarely", "Never"], unit: "" },
        { key: "lifestyle.sleep", label: "Sleep Hours", type: "number", unit: "hours", placeholder: "Enter sleep hours" },
        { key: "lifestyle.stress", label: "Stress Level", type: "select", options: ["Low", "Moderate", "High", "Very High"], unit: "" },
        { key: "lifestyle.smoking", label: "Smoking", type: "select", options: ["Never", "Former", "Current"], unit: "" },
        { key: "lifestyle.alcohol", label: "Alcohol", type: "select", options: ["Never", "Occasional", "Moderate", "Heavy"], unit: "" }
      ]
    },
    cardiovascularRisk: {
      name: "❤️ Heart Attack Risk (ML Model)",
      icon: <FaHeartRisk />,
      color: "#e91e63",
      metrics: [
        { key: "age", label: "Age (years)", type: "number", unit: "years", placeholder: "Enter age" },
        { key: "gender", label: "Gender", type: "select", options: ["Female", "Male"], unit: "" },
        { key: "cardiovascularRisk.hasChestPain", label: "Chest Pain", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasShortnessOfBreath", label: "Shortness of Breath", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasFatigue", label: "Fatigue", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasPalpitations", label: "Palpitations", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasDizziness", label: "Dizziness", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasLegSwelling", label: "Leg Swelling", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasPainArmsJawBack", label: "Pain in Arms, Jaw or Back", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasColdSweatsNausea", label: "Cold Sweats & Nausea", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasHighBloodPressure", label: "High Blood Pressure", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasHighCholesterol", label: "High Cholesterol", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasDiabetes", label: "Diabetes", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasSmoking", label: "Smoking", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasObesity", label: "Obesity", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasSedentaryLifestyle", label: "Sedentary Lifestyle", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasFamilyHistory", label: "Family History of Heart Disease", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "cardiovascularRisk.hasChronicStress", label: "Chronic Stress", type: "select", options: ["No", "Yes"], unit: "" }
      ]
    },
    strokeRisk: {
      name: "🧠 Stroke Risk (ML Model)",
      icon: <FaBrain />,
      color: "#9C27B0",
      metrics: [
        { key: "age", label: "Age (years)", type: "number", unit: "years", placeholder: "Enter age" },
        { key: "gender", label: "Gender", type: "select", options: ["Female", "Male"], unit: "" },
        { key: "strokeRisk.hasChestPain", label: "Chest Pain", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasHighBloodPressure", label: "High Blood Pressure", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasIrregularHeartbeat", label: "Irregular Heartbeat", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasShortnessOfBreath", label: "Shortness of Breath", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasFatigueWeakness", label: "Fatigue / Weakness", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasDizziness", label: "Dizziness", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasSwellingEdema", label: "Swelling / Edema", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasNeckJawPain", label: "Neck / Jaw Pain", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasExcessiveSweating", label: "Excessive Sweating", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasPersistentCough", label: "Persistent Cough", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasNauseaVomiting", label: "Nausea / Vomiting", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasChestDiscomfort", label: "Chest Discomfort", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasColdHandsFeet", label: "Cold Hands / Feet", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasSnoringSleepApnea", label: "Snoring / Sleep Apnea", type: "select", options: ["No", "Yes"], unit: "" },
        { key: "strokeRisk.hasAnxietyDoom", label: "Anxiety / Sense of Doom", type: "select", options: ["No", "Yes"], unit: "" }
      ]
    }
  };

  // ============================================
  // LOAD DATA FUNCTIONS
  // ============================================
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const urlParams = new URLSearchParams(window.location.search);
    const viewUserId = urlParams.get("userId");
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (userRole === "doctor" && viewUserId) {
      setIsDoctorView(true);
      setCanEditMedicalHistory(true);
      setViewingUserId(viewUserId);
      setDoctorInfo(currentUser);
      loadPatientData(viewUserId);
    } else {
      loadUserData();
      loadUserAppointments();
      loadHealthHistoryFromAPI();
      loadUserPrescriptions(); // ✅ Load prescriptions
    }
    
    setAvailableMetrics(getAvailableMetrics());
    checkMLService();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadUserAppointments(appointmentFilters, appointmentPagination.currentPage);
    }
  }, [appointmentFilters, appointmentPagination.currentPage, activeTab]);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      loadUserPrescriptions();
    }
  }, [activeTab]);

  const loadPatientData = (userId) => {
    setIsLoading(true);
    
    try {
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const patient = allUsers.find(u => u.id == userId || u.email === userId);
      
      if (patient) {
        if (patient.healthMetrics) {
          patient.healthMetrics = fixHealthMetrics(patient.healthMetrics);
        } else {
          patient.healthMetrics = JSON.parse(JSON.stringify(defaultHealthMetrics));
        }
        
        if (!patient.stats) {
          patient.stats = { ...defaultStats };
        }
        
        setUserData(patient);
        setEditedData(JSON.parse(JSON.stringify(patient)));
        
        const displayName = getDisplayName(patient);
        setCurrentUsername(displayName);
        
        loadHealthHistoryFromAPI();
        loadUserPrescriptions();
      } else {
        alert("Patient not found");
        navigate("/doctor/dashboard");
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = () => {
    setIsLoading(true);
    setLoadError(false);
    
    try {
      const savedUser = localStorage.getItem("currentUser");
      const storedUserName = localStorage.getItem("userName");
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const registeredUser = allUsers.find(u => u.email === localStorage.getItem("userEmail"));
      
      let parsedUser = null;

      if (registeredUser) {
        parsedUser = registeredUser;
      } else if (savedUser) {
        parsedUser = JSON.parse(savedUser);
      }

      if (parsedUser) {
        if (parsedUser.healthMetrics) {
          parsedUser.healthMetrics = fixHealthMetrics(parsedUser.healthMetrics);
        } else {
          parsedUser.healthMetrics = JSON.parse(JSON.stringify(defaultHealthMetrics));
        }
        
        if (!parsedUser.stats) {
          parsedUser.stats = { ...defaultStats };
        }
        
        let displayName = parsedUser.name;
        if (!displayName && parsedUser.fullName) {
          displayName = parsedUser.fullName;
        }
        if (!displayName && parsedUser.firstName) {
          displayName = parsedUser.firstName + (parsedUser.lastName ? " " + parsedUser.lastName : "");
        }
        if (!displayName) {
          displayName = "Guest";
        }
        
        const mergedUser = {
          ...parsedUser,
          name: displayName,
          fullName: parsedUser.fullName || displayName,
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          location: parsedUser.location || "",
          bio: parsedUser.bio || "",
          profession: parsedUser.profession || "",
          company: parsedUser.company || "",
          website: parsedUser.website || "",
          dateOfBirth: parsedUser.dateOfBirth || "",
          age: parsedUser.age || "",
          gender: parsedUser.gender || "",
          bloodGroup: parsedUser.bloodGroup || "",
          emergencyContact: parsedUser.emergencyContact || "",
          socialLinks: parsedUser.socialLinks || { github: "", linkedin: "", twitter: "" },
          healthMetrics: parsedUser.healthMetrics || defaultHealthMetrics,
          stats: parsedUser.stats || { ...defaultStats }
        };
        
        setUserData(mergedUser);
        setEditedData(JSON.parse(JSON.stringify(mergedUser)));
        
        setCurrentUsername(displayName);
        
        if (displayName && displayName !== "User" && displayName !== "Guest") {
          localStorage.setItem("userName", displayName);
        }
      } else if (storedUserName) {
        setCurrentUsername(storedUserName);
      } else {
        setCurrentUsername("Guest");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // SAVE FUNCTIONS
  // ============================================
  const saveUserData = () => {
    const displayName = getDisplayName(editedData);
    
    const updatedData = {
      ...editedData,
      name: editedData.name || editedData.fullName || "",
      fullName: editedData.fullName || editedData.name || "",
      firstName: editedData.firstName || "",
      lastName: editedData.lastName || "",
      email: editedData.email || "",
      phone: editedData.phone || "",
      location: editedData.location || "",
      bio: editedData.bio || "",
      profession: editedData.profession || "",
      company: editedData.company || "",
      website: editedData.website || "",
      dateOfBirth: editedData.dateOfBirth || "",
      age: editedData.age || "",
      gender: editedData.gender || "",
      bloodGroup: editedData.bloodGroup || "",
      emergencyContact: editedData.emergencyContact || "",
      socialLinks: editedData.socialLinks || { github: "", linkedin: "", twitter: "" },
      healthMetrics: editedData.healthMetrics || defaultHealthMetrics,
      stats: editedData.stats || { ...defaultStats }
    };

    if (isDoctorView) {
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const updatedUsers = allUsers.map(user => {
        if (user.id == viewingUserId || user.email === viewingUserId) {
          return { ...user, ...updatedData };
        }
        return user;
      });
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      
      const patientHistoryKey = `healthHistory_${viewingUserId}`;
      localStorage.setItem(patientHistoryKey, JSON.stringify(healthHistory));
      
      const doctorNote = {
        id: Date.now(),
        doctorName: doctorInfo?.name || "Doctor",
        doctorId: doctorInfo?.id || "",
        note: medicalNote,
        date: new Date().toISOString(),
        diagnosis: updatedData.medicalNotes
      };
      
      const patientNotesKey = `patient_notes_${viewingUserId}`;
      const existingNotes = JSON.parse(localStorage.getItem(patientNotesKey) || "[]");
      existingNotes.push(doctorNote);
      localStorage.setItem(patientNotesKey, JSON.stringify(existingNotes));
      
      alert("Patient medical records updated successfully!");
    } else {
      const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const email = updatedData.email;
      
      let userFound = false;
      const updatedUsers = allUsers.map(user => {
        if (user.email === email) {
          userFound = true;
          return { ...user, ...updatedData };
        }
        return user;
      });

      if (!userFound) {
        updatedUsers.push(updatedData);
      }
      
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      localStorage.setItem("currentUser", JSON.stringify(updatedData));
      localStorage.setItem("userName", displayName);
      setCurrentUsername(displayName);
      
      localStorage.setItem("healthHistory", JSON.stringify(healthHistory));
      
      const newActivity = {
        id: Date.now(),
        type: 'profile_update',
        description: 'Profile information updated',
        date: 'Just now',
        icon: 'FaEdit'
      };
      
      setUserData(prev => ({ 
        ...prev, 
        ...updatedData,
        recentActivities: [newActivity, ...(prev.recentActivities || [])] 
      }));
      
      alert("Profile updated successfully!");
    }
  };

  const handleSaveProfile = () => {
    const updatedEditedData = {
      ...editedData,
      name: editedData.name || editedData.fullName || "",
      fullName: editedData.fullName || editedData.name || "",
      firstName: editedData.firstName || "",
      lastName: editedData.lastName || "",
      email: editedData.email || "",
      phone: editedData.phone || "",
      location: editedData.location || "",
      bio: editedData.bio || "",
      profession: editedData.profession || "",
      company: editedData.company || "",
      website: editedData.website || "",
      dateOfBirth: editedData.dateOfBirth || "",
      age: editedData.age || "",
      gender: editedData.gender || "",
      bloodGroup: editedData.bloodGroup || "",
      emergencyContact: editedData.emergencyContact || "",
      socialLinks: editedData.socialLinks || { github: "", linkedin: "", twitter: "" },
      healthMetrics: editedData.healthMetrics || defaultHealthMetrics,
      stats: editedData.stats || { ...defaultStats }
    };
    
    setEditedData(updatedEditedData);
    saveUserData();
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedData(JSON.parse(JSON.stringify(userData)));
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const handleBackToDashboard = () => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "doctor") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/");
    }
  };

  // ============================================
  // APPOINTMENT HANDLER FUNCTIONS
  // ============================================
  const handleAppointmentFilterChange = (newFilters) => {
    setAppointmentFilters(newFilters);
    setAppointmentPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAppointmentPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= appointmentPagination.totalPages) {
      setAppointmentPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setCancelling(true);
    try {
      const response = await cancelAppointment(selectedAppointment._id, cancelReason);
      if (response.success) {
        alert("Appointment cancelled successfully!");
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setCancelReason("");
        loadUserAppointments(appointmentFilters, appointmentPagination.currentPage);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(error.message || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();

    if (appointmentDate < now) {
      alert("Cannot cancel past appointments");
      return;
    }

    if (appointment.status === "Cancelled" || appointment.status === "Rejected" || appointment.status === "Completed") {
      alert(`Cannot cancel ${appointment.status.toLowerCase()} appointment`);
      return;
    }

    setSelectedAppointment(appointment);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const navigateToAppointmentDetails = (appointmentId) => {
    navigate(`/user/appointment/${appointmentId}`);
  };

  // ============================================
  // PASSWORD CHANGE HANDLER
  // ============================================
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please login again.");
        navigate("/login");
        return;
      }
      
      const userRole = localStorage.getItem("userRole") || "user";
      
      const passwordDataToSend = {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword
      };
      
      let endpoint;
      
      if (userRole === 'user') {
        endpoint = `${API_BASE_URL}/auth/change-password`;
      } else if (userRole === 'doctor') {
        endpoint = `${API_BASE_URL}/doctor/change-password`;
      } else if (userRole === 'admin') {
        endpoint = `${API_BASE_URL}/admin/change-password`;
      } else {
        alert("Unknown user role. Please contact support.");
        setIsChangingPassword(false);
        return;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordDataToSend)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      const newActivity = {
        id: Date.now(),
        type: 'password_change',
        description: 'Password changed successfully',
        date: 'Just now',
        icon: 'FaLock'
      };
      setUserData(prev => ({ 
        ...prev, 
        recentActivities: [newActivity, ...(prev.recentActivities || [])] 
      }));
      
    } catch (error) {
      console.error("Password change error:", error);
      alert(error.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'FaUser': return <FaUserCircle />;
      case 'FaRobot': return <FaRobot />;
      case 'FaEdit': return <FaEdit />;
      case 'FaHeartbeat': return <FaHeartbeat />;
      case 'FaUserMd': return <FaUserMd />;
      default: return <FaUserCircle />;
    }
  };

  const [showRiskResult, setShowRiskResult] = useState(false);
  const [riskResult, setRiskResult] = useState(null);

  const handleCalculateRisk = () => {
    if (selectedHealthCategory === 'cardiovascularRisk') {
      predictHeartAttack();
    } else if (selectedHealthCategory === 'strokeRisk') {
      predictStroke();
    }
  };

  const closeRiskResult = () => {
    setShowRiskResult(false);
    setRiskResult(null);
  };

  const closeMlResult = () => {
    setShowMlResult(false);
    setMlResult(null);
    setMlError(null);
  };

  // ============================================
  // ✅ RENDER PRESCRIPTIONS TAB - UPDATED
  // ============================================
  const renderPrescriptionsTab = () => {
    return (
      <div className="prescriptions-tab-content">
        <div className="prescriptions-tab-header">
          <div>
            <h3 className="prescriptions-tab-title">
              <FaPrescriptionBottle /> My Prescriptions
            </h3>
            <p className="prescriptions-tab-subtitle">View and manage all your prescriptions in one place</p>
          </div>
        </div>

        {prescriptionsLoading ? (
          <div className="prescriptions-loading-container">
            <FaSpinner className="prescriptions-spinner" />
            <p>Loading prescriptions...</p>
          </div>
        ) : prescriptionsError ? (
          <div className="prescriptions-error-container">
            <FaExclamationTriangle className="prescriptions-error-icon" />
            <p>{prescriptionsError}</p>
            <button className="prescriptions-retry-btn" onClick={loadUserPrescriptions}>
              Retry
            </button>
          </div>
        ) : userPrescriptions.length === 0 ? (
          <div className="prescriptions-empty-state">
            <FaFilePrescription className="prescriptions-empty-icon" />
            <h3>No Prescriptions Found</h3>
            <p>You don't have any prescriptions yet. Visit a doctor to get your first prescription.</p>
          </div>
        ) : (
          <div className="prescriptions-list-container">
            {userPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription._id || prescription.id}
                prescription={prescription}
                onViewDetails={viewPrescriptionDetails}  // ✅ নতুন
                onDownload={downloadPrescription}
                onPrint={printPrescription}
              />
            ))}
          </div>
        )}

        {/* ✅ Prescription Details Modal - View Details এর জন্য */}
        {showPrescriptionModal && selectedPrescription && (
          <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
            <div className="modal-content prescription-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><FaFilePrescription /> Prescription Details</h3>
                <button className="close-btn" onClick={() => setShowPrescriptionModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body prescription-details-body">
                <div className="details-patient-info">
                  <h4>Patient: {userData.name || userData.fullName || "Unknown Patient"}</h4>
                  <p><strong>Date:</strong> {new Date(selectedPrescription.date).toLocaleDateString()}</p>
                </div>
                
                <div className="details-section">
                  <h5><FaStethoscope /> Diagnosis</h5>
                  <p>{selectedPrescription.diagnosis || "Not specified"}</p>
                </div>
                
                <div className="details-section">
                  <h5><FaPills /> Medications</h5>
                  {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                    <ul className="details-medicine-list">
                      {selectedPrescription.medicines.map((med, idx) => (
                        <li key={idx}>
                          <strong>{med.medicineName || med.name}</strong>
                          <span>{med.dosage}</span>
                          <span>{med.frequency}</span>
                          {med.duration && <span>({med.duration})</span>}
                          {med.instructions && <p className="med-instructions"><em>{med.instructions}</em></p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No medications listed</p>
                  )}
                </div>
                
                {selectedPrescription.notes && (
                  <div className="details-section">
                    <h5><FaNotesMedical /> Notes</h5>
                    <p>{selectedPrescription.notes}</p>
                  </div>
                )}
                
                <div className="details-section">
                  <h5><FaUserMd /> Prescribed By</h5>
                  <p><strong>{selectedPrescription.doctorName || "Unknown Doctor"}</strong></p>
                  <p className="doctor-specialization">{selectedPrescription.doctorSpecialization || "General"}</p>
                </div>
                
                <div className="details-meta">
                  <span><strong>Status:</strong> {selectedPrescription.status || "Active"}</span>
                  <span><strong>Refills:</strong> {selectedPrescription.refillsUsed || 0}/{selectedPrescription.refills || 0}</span>
                  {selectedPrescription.followUpDate && (
                    <span><strong>Follow-up:</strong> {new Date(selectedPrescription.followUpDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowPrescriptionModal(false)}>Close</button>
                <button className="submit-btn" onClick={() => { downloadPrescription(selectedPrescription); }}><FaDownloadIcon /> Download</button>
                <button className="submit-btn print" onClick={() => { printPrescription(selectedPrescription); }}><FaPrintIcon /> Print</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const profileDisplayName = getDisplayName(userData);

  // ============================================
  // TEXT TRANSLATIONS
  // ============================================
  const text = {
    en: {
      home: "Home", about: "About", contact: "Contact", logout: "Logout",
      darkMode: "Dark Mode", lightMode: "Light Mode", welcome: "Welcome",
      editProfile: "Edit Profile", saveChanges: "Save Changes", cancel: "Cancel",
      changePassword: "Change Password", overview: "Overview", activity: "Activity",
      health: "Health Dashboard", medicine: "Medicine Reminder", settings: "Settings", loading: "Loading profile...",
      error: "Error loading profile", retry: "Retry", about: "About Me",
      contactInfo: "Contact Information", socialLinks: "Social Links",
      personalInfo: "Personal Information", healthMetrics: "Health Metrics",
      recentActivity: "Recent Activity", diagnoses: "Diagnoses", appointments: "Appointments",
      articles: "Articles", savedReports: "Saved Reports", fullName: "Full Name",
      email: "Email Address", phone: "Phone Number", location: "Location", bio: "Bio",
      profession: "Profession", company: "Company", website: "Website",
      dateOfBirth: "Date of Birth", age: "Age", gender: "Gender", bloodGroup: "Blood Group",
      emergencyContact: "Emergency Contact", saveHealthRecord: "Save Record",
      viewChart: "View Chart", selectCategory: "Select Health Category",
      healthTrends: "Health Trends", copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology", profileUpdated: "Profile updated successfully!",
      passwordUpdated: "Password updated successfully!", emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital", emergencyCancel: "Cancel",
      emergencyTitle: "Emergency Assistance", emergencyDesc: "Please choose an action:",
      currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm Password",
      updatePassword: "Update Password", passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters", passwordsMatch: "Passwords must match",
      viewHistory: "View History", selectDate: "Select Date", loadRecord: "Load Record",
      healthHistory: "Health History", noHistory: "No health records found", deleteRecord: "Delete",
      viewDetails: "View Details", backToList: "Back to List", recordDetails: "Record Details",
      calculateHeartRisk: "Calculate Heart Attack Risk", calculateStrokeRisk: "Calculate Stroke Risk",
      heartRiskAssessment: "Heart Attack Risk Assessment", strokeRiskAssessment: "Stroke Risk Assessment",
      riskScore: "Risk Score", riskLevel: "Risk Level", recommendations: "Recommendations",
      medicineReminder: "Medicine Reminder", trackMedications: "Track your medications and never miss a dose",
      doctorView: "Doctor View", backToDashboard: "Back to Dashboard", patientName: "Patient Name",
      editMedicalRecords: "Edit Medical Records", savePatientRecords: "Save Patient Records",
      changingPassword: "Changing Password...",
      myAppointments: "My Appointments",
      noAppointments: "No appointments found",
      appointmentsTitle: "My Appointments",
      appointmentsSubtitle: "View and manage all your appointments in one place",
      noAppointmentsDesc: "You don't have any appointments yet. Book your first appointment now!",
      bookNow: "Book Appointment",
      loadingAppointments: "Loading appointments...",
      appointmentsError: "Failed to load appointments",
      cancelAppointment: "Cancel Appointment",
      cancelConfirmation: "Are you sure you want to cancel this appointment?",
      cancelReasonLabel: "Reason for cancellation",
      cancelReasonPlaceholder: "Please provide a reason for cancellation...",
      cancelling: "Cancelling...",
      cancelSuccess: "Appointment cancelled successfully",
      cancelError: "Failed to cancel appointment",
      statsTotal: "Total",
      statsPending: "Pending",
      statsApproved: "Approved",
      statsCompleted: "Completed",
      statsCancelled: "Cancelled",
      statsRejected: "Rejected",
      statsUpcoming: "Upcoming",
      statsThisMonth: "This Month",
      status: "Status",
      dateRange: "Date Range",
      search: "Search",
      clearFilters: "Clear Filters",
      page: "Page",
      of: "of",
      calculate: "Calculate Risk",
      close: "Close",
      saving: "Saving...",
      mlPredictHeart: "🔬 Predicting with ML Model...",
      mlPredictStroke: "🔬 Predicting with ML Model...",
      mlPredicting: "Predicting...",
      mlResult: "ML Prediction Result",
      mlConfidence: "Confidence",
      mlHeartRisk: "Heart Attack Risk",
      mlStrokeRisk: "Stroke Risk",
      mlNoRisk: "No Risk Detected",
      mlRiskDetected: "Risk Detected",
      mlServiceError: "ML Service Error",
      mlModel: "ML Model",
      mlNotAvailable: "ML Service Unavailable",
      mlServiceDown: "⚠️ ML Service is currently down. Please try again later.",
      prescriptions: "Prescriptions",
      noPrescriptions: "No prescriptions found",
      download: "Download",
      print: "Print",
      viewDetails: "View Details",
      prescriptionsTitle: "My Prescriptions",
      prescriptionsSubtitle: "View and manage all your prescriptions",
      loadingPrescriptions: "Loading prescriptions...",
      prescriptionsError: "Failed to load prescriptions",
      prescriptionDetails: "Prescription Details",
      patient: "Patient",
      date: "Date",
      diagnosis: "Diagnosis",
      medications: "Medications",
      notes: "Notes",
      prescribedBy: "Prescribed By",
      status: "Status",
      refills: "Refills",
      followUp: "Follow-up"
    },
    bn: {
      home: "হোম", about: "আমাদের সম্পর্কে", contact: "যোগাযোগ", logout: "লগআউট",
      darkMode: "ডার্ক মোড", lightMode: "লাইট মোড", welcome: "স্বাগতম",
      editProfile: "প্রোফাইল সম্পাদনা করুন", saveChanges: "পরিবর্তন সংরক্ষণ করুন",
      cancel: "বাতিল করুন", changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
      overview: "ওভারভিউ", activity: "কার্যকলাপ", health: "স্বাস্থ্য ড্যাশবোর্ড",
      medicine: "ঔষধ রিমাইন্ডার", settings: "সেটিংস", loading: "প্রোফাইল লোড হচ্ছে...", error: "প্রোফাইল লোড করতে ত্রুটি",
      retry: "আবার চেষ্টা করুন", about: "আমার সম্পর্কে", contactInfo: "যোগাযোগের তথ্য",
      socialLinks: "সামাজিক লিঙ্ক", personalInfo: "ব্যক্তিগত তথ্য",
      healthMetrics: "স্বাস্থ্য মেট্রিক্স", recentActivity: "সাম্প্রতিক কার্যকলাপ",
      diagnoses: "রোগ নির্ণয়", appointments: "অ্যাপয়েন্টমেন্ট", articles: "নিবন্ধ",
      savedReports: "সংরক্ষিত রিপোর্ট", fullName: "পুরো নাম", email: "ইমেল ঠিকানা",
      phone: "ফোন নম্বর", location: "অবস্থান", bio: "জীবনী", profession: "পেশা",
      company: "কোম্পানি", website: "ওয়েবসাইট", dateOfBirth: "জন্ম তারিখ",
      age: "বয়স", gender: "লিঙ্গ", bloodGroup: "রক্তের গ্রুপ", emergencyContact: "জরুরি যোগাযোগ",
      saveHealthRecord: "রেকর্ড সংরক্ষণ করুন", viewChart: "চার্ট দেখুন",
      selectCategory: "স্বাস্থ্য বিভাগ নির্বাচন করুন", healthTrends: "স্বাস্থ্য প্রবণতা",
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন", profileUpdated: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
      passwordUpdated: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!", emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন", emergencyCancel: "বাতিল করুন",
      emergencyTitle: "জরুরী সহায়তা", emergencyDesc: "দয়া করে একটি কর্ম নির্বাচন করুন:",
      currentPassword: "বর্তমান পাসওয়ার্ড", newPassword: "নতুন পাসওয়ার্ড", confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      updatePassword: "পাসওয়ার্ড আপডেট করুন", passwordRequired: "পাসওয়ার্ড প্রয়োজন",
      passwordLength: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর দীর্ঘ হতে হবে", passwordsMatch: "পাসওয়ার্ড মিলতে হবে",
      viewHistory: "ইতিহাস দেখুন", selectDate: "তারিখ নির্বাচন করুন", loadRecord: "রেকর্ড লোড করুন",
      healthHistory: "স্বাস্থ্য ইতিহাস", noHistory: "কোনো স্বাস্থ্য রেকর্ড পাওয়া যায়নি", deleteRecord: "মুছুন",
      viewDetails: "বিস্তারিত দেখুন", backToList: "তালিকায় ফিরুন", recordDetails: "রেকর্ড বিবরণ",
      calculateHeartRisk: "হার্ট অ্যাটাক ঝুঁকি গণনা করুন", calculateStrokeRisk: "স্ট্রোক ঝুঁকি গণনা করুন",
      heartRiskAssessment: "হার্ট অ্যাটাক ঝুঁকি মূল্যায়ন", strokeRiskAssessment: "স্ট্রোক ঝুঁকি মূল্যায়ন",
      riskScore: "ঝুঁকি স্কোর", riskLevel: "ঝুঁকির মাত্রা", recommendations: "পরামর্শ",
      medicineReminder: "ঔষধ রিমাইন্ডার", trackMedications: "আপনার ঔষধ ট্র্যাক করুন এবং কখনও ডোজ মিস করবেন না",
      doctorView: "ডাক্তার ভিউ", backToDashboard: "ড্যাশবোর্ডে ফিরুন", patientName: "রোগীর নাম",
      editMedicalRecords: "মেডিকেল রেকর্ড সম্পাদনা করুন", savePatientRecords: "রোগীর রেকর্ড সংরক্ষণ করুন",
      changingPassword: "পাসওয়ার্ড পরিবর্তন করা হচ্ছে...",
      myAppointments: "আমার অ্যাপয়েন্টমেন্ট",
      noAppointments: "কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি",
      appointmentsTitle: "আমার অ্যাপয়েন্টমেন্ট",
      appointmentsSubtitle: "আপনার সমস্ত অ্যাপয়েন্টমেন্ট এক জায়গায় দেখুন এবং পরিচালনা করুন",
      noAppointmentsDesc: "আপনার এখনও কোন অ্যাপয়েন্টমেন্ট নেই। এখনই আপনার প্রথম অ্যাপয়েন্টমেন্ট বুক করুন!",
      bookNow: "অ্যাপয়েন্টমেন্ট বুক করুন",
      loadingAppointments: "অ্যাপয়েন্টমেন্ট লোড হচ্ছে...",
      appointmentsError: "অ্যাপয়েন্টমেন্ট লোড করতে ব্যর্থ হয়েছে",
      cancelAppointment: "অ্যাপয়েন্টমেন্ট বাতিল করুন",
      cancelConfirmation: "আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্টটি বাতিল করতে চান?",
      cancelReasonLabel: "বাতিল করার কারণ",
      cancelReasonPlaceholder: "বাতিল করার কারণ দিন...",
      cancelling: "বাতিল করা হচ্ছে...",
      cancelSuccess: "অ্যাপয়েন্টমেন্ট সফলভাবে বাতিল করা হয়েছে",
      cancelError: "অ্যাপয়েন্টমেন্ট বাতিল করতে ব্যর্থ হয়েছে",
      statsTotal: "মোট",
      statsPending: "বিচারাধীন",
      statsApproved: "অনুমোদিত",
      statsCompleted: "সম্পূর্ণ",
      statsCancelled: "বাতিল",
      statsRejected: "প্রত্যাখ্যাত",
      statsUpcoming: "আসন্ন",
      statsThisMonth: "এই মাসে",
      status: "অবস্থা",
      dateRange: "তারিখের পরিসীমা",
      search: "অনুসন্ধান",
      clearFilters: "ফিল্টার পরিষ্কার করুন",
      page: "পৃষ্ঠা",
      of: "এর",
      calculate: "ঝুঁকি গণনা করুন",
      close: "বন্ধ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      mlPredictHeart: "🔬 এমএল মডেল দিয়ে পূর্বাভাস দেওয়া হচ্ছে...",
      mlPredictStroke: "🔬 এমএল মডেল দিয়ে পূর্বাভাস দেওয়া হচ্ছে...",
      mlPredicting: "পূর্বাভাস দেওয়া হচ্ছে...",
      mlResult: "এমএল পূর্বাভাস ফলাফল",
      mlConfidence: "আত্মবিশ্বাস",
      mlHeartRisk: "হার্ট অ্যাটাক ঝুঁকি",
      mlStrokeRisk: "স্ট্রোক ঝুঁকি",
      mlNoRisk: "কোন ঝুঁকি পাওয়া যায়নি",
      mlRiskDetected: "ঝুঁকি সনাক্ত করা হয়েছে",
      mlServiceError: "এমএল পরিষেবা ত্রুটি",
      mlModel: "এমএল মডেল",
      mlNotAvailable: "এমএল পরিষেবা উপলভ্য নয়",
      mlServiceDown: "⚠️ এমএল পরিষেবা বর্তমানে ডাউন। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
      prescriptions: "প্রেসক্রিপশন",
      noPrescriptions: "কোন প্রেসক্রিপশন পাওয়া যায়নি",
      download: "ডাউনলোড",
      print: "প্রিন্ট",
      viewDetails: "বিস্তারিত দেখুন",
      prescriptionsTitle: "আমার প্রেসক্রিপশন",
      prescriptionsSubtitle: "আপনার সমস্ত প্রেসক্রিপশন এক জায়গায় দেখুন এবং পরিচালনা করুন",
      loadingPrescriptions: "প্রেসক্রিপশন লোড হচ্ছে...",
      prescriptionsError: "প্রেসক্রিপশন লোড করতে ব্যর্থ হয়েছে",
      prescriptionDetails: "প্রেসক্রিপশনের বিবরণ",
      patient: "রোগী",
      date: "তারিখ",
      diagnosis: "রোগ নির্ণয়",
      medications: "ওষুধ",
      notes: "নোট",
      prescribedBy: "প্রেসক্রিপশন দিয়েছেন",
      status: "স্ট্যাটাস",
      refills: "রিফিল",
      followUp: "ফলো-আপ"
    }
  };

  const t = text[lang] || text.en;

  // ============================================
  // RENDER APPOINTMENTS TAB
  // ============================================
  const renderAppointmentsTab = () => {
    const renderStats = () => {
      const statItems = [
        { key: "total", value: appointmentStats.total, label: t.statsTotal, color: "#1976d2" },
        { key: "pending", value: appointmentStats.pending, label: t.statsPending, color: "#FF9800" },
        { key: "approved", value: appointmentStats.approved, label: t.statsApproved, color: "#4CAF50" },
        { key: "completed", value: appointmentStats.completed, label: t.statsCompleted, color: "#2196F3" },
        { key: "cancelled", value: appointmentStats.cancelled, label: t.statsCancelled, color: "#9E9E9E" },
        { key: "rejected", value: appointmentStats.rejected, label: t.statsRejected, color: "#F44336" },
        { key: "upcoming", value: appointmentStats.upcoming, label: t.statsUpcoming, color: "#8BC34A" },
        { key: "thisMonth", value: appointmentStats.thisMonth, label: t.statsThisMonth, color: "#FF5722" },
      ];

      return (
        <div className="appointments-stats-grid">
          {statItems.map((item) => (
            <div key={item.key} className="appointment-stat-item" style={{ borderLeftColor: item.color }}>
              <span className="appointment-stat-value">{item.value}</span>
              <span className="appointment-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      );
    };

    if (appointmentsLoading && appointments.length === 0) {
      return (
        <div className="appointments-loading-container">
          <FaSpinner className="appointments-spinner" />
          <p>{t.loadingAppointments}</p>
        </div>
      );
    }

    return (
      <div className="appointments-tab-content">
        <div className="appointments-tab-header">
          <div>
            <h3 className="appointments-tab-title">
              <FaCalendarAlt /> {t.appointmentsTitle}
            </h3>
            <p className="appointments-tab-subtitle">{t.appointmentsSubtitle}</p>
          </div>
          <button className="appointments-book-btn" onClick={() => navigate('/book-appointment')}>
            <FaUserMd /> {t.bookNow}
          </button>
        </div>

        {renderStats()}

        <div className="appointments-filter-container">
          <div className="appointments-filter-row">
            <div className="appointments-filter-group">
              <label>{t.status}</label>
              <select
                value={appointmentFilters.status}
                onChange={(e) => setAppointmentFilters(prev => ({ ...prev, status: e.target.value }))}
                className="appointments-filter-select"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="appointments-filter-group">
              <label>From</label>
              <input
                type="date"
                value={appointmentFilters.startDate}
                onChange={(e) => setAppointmentFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="appointments-filter-input"
              />
            </div>
            <div className="appointments-filter-group">
              <label>To</label>
              <input
                type="date"
                value={appointmentFilters.endDate}
                onChange={(e) => setAppointmentFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="appointments-filter-input"
              />
            </div>
            <div className="appointments-filter-group appointments-filter-search">
              <label>{t.search}</label>
              <input
                type="text"
                value={appointmentFilters.search}
                onChange={(e) => setAppointmentFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by doctor or reason..."
                className="appointments-filter-input"
              />
            </div>
            <button
              className="appointments-clear-filters-btn"
              onClick={() => {
                setAppointmentFilters({ status: "All", startDate: "", endDate: "", search: "" });
                setAppointmentPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              {t.clearFilters}
            </button>
          </div>
        </div>

        {appointmentsError && (
          <div className="appointments-error-container">
            <FaExclamationTriangle className="appointments-error-icon" />
            <p>{appointmentsError}</p>
            <button
              className="appointments-retry-btn"
              onClick={() => loadUserAppointments(appointmentFilters, appointmentPagination.currentPage)}
            >
              {t.retry}
            </button>
          </div>
        )}

        {!appointmentsError && (
          <>
            {appointments.length === 0 ? (
              <div className="appointments-empty-state">
                <FaFileMedicalAlt className="appointments-empty-icon" />
                <h3>{t.noAppointments}</h3>
                <p>{t.noAppointmentsDesc}</p>
                <button className="appointments-book-btn" onClick={() => navigate('/book-appointment')}>
                  {t.bookNow}
                </button>
              </div>
            ) : (
              <div className="appointments-list-container">
                {appointments.map((appointment) => {
                  const isUpcoming = appointment.status === "Pending" || appointment.status === "Approved" || appointment.status === "OPENING";
                  const canCancel = isUpcoming && new Date(appointment.appointmentDate) > new Date();

                  return (
                    <div
                      key={appointment._id}
                      className="appointment-card-item"
                      onClick={() => navigateToAppointmentDetails(appointment._id)}
                    >
                      <div className="appointment-card-header">
                        <div className="appointment-doctor-info">
                          {appointment.doctorImage ? (
                            <img src={appointment.doctorImage} alt={appointment.doctorName} className="appointment-doctor-avatar" />
                          ) : (
                            <div className="appointment-doctor-avatar-placeholder">
                              <FaUserMd />
                            </div>
                          )}
                          <div className="appointment-doctor-details">
                            <h4 className="appointment-doctor-name">{appointment.doctorName || "Unknown Doctor"}</h4>
                            <span className="appointment-doctor-specialization">{appointment.doctorSpecialization || "General"}</span>
                          </div>
                        </div>
                        <span className={`appointment-status-badge appointment-status-${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="appointment-card-body">
                        <div className="appointment-info-grid">
                          <div className="appointment-info-item">
                            <FaCalendarAlt className="appointment-info-icon" />
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                              month: 'short', day: 'numeric', year: 'numeric' 
                            })}</span>
                          </div>
                          <div className="appointment-info-item">
                            <FaClock className="appointment-info-icon" />
                            <span>{appointment.timeSlot || "N/A"}</span>
                          </div>
                          <div className="appointment-info-item">
                            {appointment.consultationMode === "Video" ? <FaVideo /> : 
                             appointment.consultationMode === "Phone" ? <FaPhoneIcon /> : 
                             <FaLocationIcon />}
                            <span>{appointment.consultationMode || "In-Person"}</span>
                          </div>
                          {appointment.paymentAmount > 0 && (
                            <div className="appointment-info-item">
                              <span className="appointment-payment-amount">${appointment.paymentAmount.toFixed(2)}</span>
                              <span className={`appointment-payment-status appointment-payment-${appointment.paymentStatus?.toLowerCase()}`}>
                                {appointment.paymentStatus || "Pending"}
                              </span>
                            </div>
                          )}
                        </div>

                        {appointment.reason && (
                          <div className="appointment-reason">
                            <span className="appointment-reason-label">Reason:</span>
                            <span className="appointment-reason-text">{appointment.reason}</span>
                          </div>
                        )}

                        {canCancel && appointment.meetingLink && (
                          <div className="appointment-meeting-link">
                            <FaVideo className="appointment-meeting-icon" />
                            <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="appointment-card-footer">
                        {canCancel && (
                          <button 
                            className="appointment-cancel-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancelModal(appointment);
                            }}
                          >
                            {t.cancel}
                          </button>
                        )}
                        <button className="appointment-view-details-btn" onClick={() => navigateToAppointmentDetails(appointment._id)}>
                          View Details <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {appointmentPagination.totalPages > 1 && (
              <div className="appointments-pagination">
                <button
                  onClick={() => handleAppointmentPageChange(appointmentPagination.currentPage - 1)}
                  disabled={appointmentPagination.currentPage === 1}
                  className="appointments-page-btn"
                >
                  <FaChevronLeft />
                </button>
                <span className="appointments-page-info">
                  {t.page} {appointmentPagination.currentPage} {t.of} {appointmentPagination.totalPages}
                </span>
                <button
                  onClick={() => handleAppointmentPageChange(appointmentPagination.currentPage + 1)}
                  disabled={appointmentPagination.currentPage === appointmentPagination.totalPages}
                  className="appointments-page-btn"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER CHART MODAL
  // ============================================
  const renderChartModal = () => {
    if (!showChartModal) return null;
    
    const metricsByCategory = availableMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});
    
    return (
      <div className="modal-overlay" onClick={() => setShowChartModal(false)}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3><FaChartLine /> Health Chart</h3>
            <button className="close-btn" onClick={() => setShowChartModal(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="chart-container">
            <div className="chart-selector">
              <label>Select Metric:</label>
              <select 
                value={selectedMetric} 
                onChange={async (e) => {
                  setSelectedMetric(e.target.value);
                  await loadChartDataFromAPI(e.target.value);
                }}
                className="chart-select"
              >
                {Object.keys(metricsByCategory).map(category => (
                  <optgroup key={category} label={category}>
                    {metricsByCategory[category].map(metric => (
                      <option key={metric.key} value={metric.key}>{metric.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            {chartData && chartData.length > 0 ? (
              <div>
                <div className="chart-wrapper">
                  <svg width="100%" height="300" viewBox="0 0 700 280" preserveAspectRatio="xMidYMid meet">
                    <line x1="50" y1="230" x2="680" y2="230" stroke="#e2e8f0" strokeWidth="1"/>
                    <line x1="50" y1="180" x2="680" y2="180" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4"/>
                    <line x1="50" y1="130" x2="680" y2="130" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4"/>
                    <line x1="50" y1="80" x2="680" y2="80" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4"/>
                    <line x1="50" y1="30" x2="680" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4"/>
                    
                    {(() => {
                      const data = chartData.slice(-20);
                      if (data.length < 2) {
                        return (
                          <text x="350" y="140" textAnchor="middle" fill="#a0aec0" fontSize="14">
                            Not enough data points for chart
                          </text>
                        );
                      }
                      const maxVal = Math.max(...data.map(d => d.value), 1);
                      const minVal = Math.min(...data.map(d => d.value), 0);
                      const range = maxVal - minVal || 1;
                      const padding = range * 0.1;
                      const effectiveMax = maxVal + padding;
                      const effectiveMin = minVal - padding > 0 ? minVal - padding : 0;
                      const effectiveRange = effectiveMax - effectiveMin || 1;
                      
                      let pathD = '';
                      data.forEach((item, index) => {
                        const x = 50 + (index / (data.length - 1 || 1)) * 630;
                        const y = 230 - ((item.value - effectiveMin) / effectiveRange) * 200;
                        if (index === 0) {
                          pathD = `M ${x} ${y}`;
                        } else {
                          pathD += ` L ${x} ${y}`;
                        }
                      });
                      
                      let areaD = pathD;
                      const lastX = 50 + ((data.length - 1) / (data.length - 1 || 1)) * 630;
                      areaD += ` L ${lastX} 230 L 50 230 Z`;
                      
                      return (
                        <>
                          <path d={areaD} fill="rgba(0, 230, 255, 0.15)" stroke="none"/>
                          <path d={pathD} stroke="#00e6ff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          {data.map((item, index) => {
                            const x = 50 + (index / (data.length - 1 || 1)) * 630;
                            const y = 230 - ((item.value - effectiveMin) / effectiveRange) * 200;
                            return (
                              <circle key={index} cx={x} cy={y} r="6" fill="#00e6ff" stroke="#fff" strokeWidth="2">
                                <title>{`${item.label || new Date(item.date).toLocaleDateString()}: ${item.value}`}</title>
                              </circle>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                
                <div className="chart-data-table">
                  <table className="chart-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.slice(-20).reverse().map((item, index) => (
                        <tr key={index}>
                          <td>{item.label || new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="chart-empty-state">
                <FaChartLine />
                <p>No chart data available. Save some health records first!</p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setShowChartModal(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER HISTORY MODAL
  // ============================================
  const renderHistoryModal = () => {
    if (!showHistoryModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3><FaHistory /> Health History</h3>
            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="history-content">
            {historyLoading ? (
              <div className="history-loading">
                <FaSpinner className="spinner-icon" />
                <p>Loading history...</p>
              </div>
            ) : healthHistory && healthHistory.length > 0 ? (
              <div className="history-list">
                {healthHistory.map((record, index) => {
                  const metrics = record.metrics || {};
                  return (
                    <div key={record._id || index} className="history-record-item">
                      <div className="history-record-header">
                        <strong>Record #{healthHistory.length - index}</strong>
                        <span>{new Date(record.date || record.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="history-record-metrics">
                        {metrics.age && <div><strong>Age:</strong> {metrics.age} years</div>}
                        {metrics.gender && <div><strong>Gender:</strong> {metrics.gender}</div>}
                        {metrics.height && <div><strong>Height:</strong> {metrics.height} cm</div>}
                        {metrics.weight && <div><strong>Weight:</strong> {metrics.weight} kg</div>}
                        {metrics.bmi && <div><strong>BMI:</strong> {metrics.bmi} kg/m²</div>}
                        {metrics.bloodPressure?.systolic && (
                          <div><strong>BP:</strong> {metrics.bloodPressure.systolic}/{metrics.bloodPressure.diastolic} mmHg</div>
                        )}
                        {metrics.heartRate && <div><strong>Heart Rate:</strong> {metrics.heartRate} bpm</div>}
                        {metrics.bloodSugar?.fasting && <div><strong>Fasting Sugar:</strong> {metrics.bloodSugar.fasting} mg/dL</div>}
                        {metrics.bloodSugar?.hba1c && <div><strong>HbA1c:</strong> {metrics.bloodSugar.hba1c} %</div>}
                        {metrics.lipidProfile?.totalCholesterol && <div><strong>Total Chol:</strong> {metrics.lipidProfile.totalCholesterol} mg/dL</div>}
                        {metrics.lipidProfile?.hdl && <div><strong>HDL:</strong> {metrics.lipidProfile.hdl} mg/dL</div>}
                        {metrics.lipidProfile?.ldl && <div><strong>LDL:</strong> {metrics.lipidProfile.ldl} mg/dL</div>}
                        {metrics.cbc?.hemoglobin && <div><strong>Hb:</strong> {metrics.cbc.hemoglobin} g/dL</div>}
                        {metrics.vitamins?.vitaminD && <div><strong>Vitamin D:</strong> {metrics.vitamins.vitaminD} ng/mL</div>}
                        {metrics.thyroid?.tsh && <div><strong>TSH:</strong> {metrics.thyroid.tsh} µIU/mL</div>}
                        {metrics.lifestyle?.sleep && <div><strong>Sleep:</strong> {metrics.lifestyle.sleep} hrs</div>}
                        {metrics.lifestyle?.exercise && <div><strong>Exercise:</strong> {metrics.lifestyle.exercise}</div>}
                        {metrics.lifestyle?.smoking && <div><strong>Smoking:</strong> {metrics.lifestyle.smoking}</div>}
                      </div>
                      
                      {record.notes && (
                        <div className="history-record-notes">
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                      
                      <div className="history-record-actions">
                        <button onClick={() => handleDeleteRecord(record._id)} className="delete-record-btn">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty-state">
                <FaHistory />
                <p>No health history found. Start saving your health records!</p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setShowHistoryModal(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER METRIC INPUTS
  // ============================================
  const renderMetricInputs = () => {
    const category = healthCategories[selectedHealthCategory];
    if (!category) return null;
    
    return category.metrics.map((metric, idx) => {
      const value = safeGetHealthMetric(editedData, metric.key);
      
      if (metric.type === 'select') {
        return (
          <div key={idx} className="metric-card-enhanced">
            <label>{metric.label}</label>
            <select 
              value={value}
              onChange={(e) => {
                const [category, field] = metric.key.split('.');
                handleHealthMetricChange(category, field, e.target.value);
              }}
              className="metric-select"
            >
              <option value="">Select</option>
              {metric.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      } else if (metric.type === 'bp') {
        return (
          <div key={idx} className="metric-card-enhanced">
            <label>{metric.label}</label>
            <div className="bp-input-group">
              <input 
                type="number" 
                placeholder="Systolic" 
                value={getBloodPressureValue(editedData.healthMetrics, 'systolic')}
                onChange={(e) => handleHealthMetricChange('bloodPressure', 'systolic', e.target.value)}
                className="metric-input-small" 
              />
              <span>/</span>
              <input 
                type="number" 
                placeholder="Diastolic" 
                value={getBloodPressureValue(editedData.healthMetrics, 'diastolic')}
                onChange={(e) => handleHealthMetricChange('bloodPressure', 'diastolic', e.target.value)}
                className="metric-input-small" 
              />
            </div>
            <span className="metric-unit">{metric.unit}</span>
          </div>
        );
      } else {
        return (
          <div key={idx} className="metric-card-enhanced">
            <label>{metric.label}</label>
            <input 
              type="number" 
              step="0.1"
              value={value}
              onChange={(e) => {
                const [category, field] = metric.key.split('.');
                if (field) {
                  handleHealthMetricChange(category, field, e.target.value);
                } else {
                  handleHealthMetricChange(category, '', e.target.value);
                }
              }}
              className="metric-input" 
              placeholder={metric.placeholder}
            />
            <span className="metric-unit">{metric.unit}</span>
          </div>
        );
      }
    });
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className={`profile-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="loading-container"><div className="loading-spinner"></div><p>{t.loading}</p></div>
      </div>
    );
  }

  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{t.home}</Link></li>
            <li><Link to="/about">{t.about}</Link></li>
            <li><Link to="/contact">{t.contact}</Link></li>
          </ul>
          <div className="user-info-nav">
            <FaUserCircle className="user-nav-icon" />
            <span className="user-name-nav">{currentUsername || "Guest"}</span>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? t.lightMode : t.darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          <button className="logout-btn-small" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      <main className="profile-main">
        <div className="profile-container">
          {isDoctorView && (
            <div className="doctor-view-banner">
              <div className="doctor-view-content">
                <FaDoctorSteth className="doctor-view-icon" />
                <div>
                  <strong>{t.doctorView}</strong>
                  <p>Editing medical records for {profileDisplayName}</p>
                </div>
              </div>
              <button className="doctor-view-back-btn" onClick={handleBackToDashboard}>
                <FaArrowDown /> {t.backToDashboard}
              </button>
            </div>
          )}

          <div className="profile-cover"><img src={userData.coverPhoto} alt="Cover" /></div>

          <div className="profile-header">
            <div className="profile-avatar">
              <img src={userData.avatar} alt={profileDisplayName || "Avatar"} />
            </div>
            <div className="profile-info">
              {isEditing && !isDoctorView ? (
                <input type="text" name="name" value={editedData.name || editedData.fullName || ""} onChange={handleInputChange} className="edit-input" placeholder="Enter your name" />
              ) : (
                <h1>{profileDisplayName !== "User" && profileDisplayName !== "Guest" ? profileDisplayName : "Your Name"}</h1>
              )}
              <div className="profession">
                <FaBriefcase />
                {isEditing && !isDoctorView ? (
                  <input type="text" name="profession" value={editedData.profession || ""} onChange={handleInputChange} className="edit-input" placeholder="Your profession" />
                ) : (
                  <span>{userData.profession || "Not specified"}</span>
                )}
              </div>
              <div className="location">
                <FaMapMarkerAlt />
                {isEditing && !isDoctorView ? (
                  <input type="text" name="location" value={editedData.location || ""} onChange={handleInputChange} className="edit-input" placeholder="Your location" />
                ) : (
                  <span>{userData.location || "Location not set"}</span>
                )}
              </div>
              <p className="joined-date"><FaCalendarAlt /> Joined {userData.joinedDate}</p>
            </div>
            {!isDoctorView && !isEditing ? (
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}><FaEdit /> {t.editProfile}</button>
                <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}><FaLock /> {t.changePassword}</button>
              </div>
            ) : (!isDoctorView && isEditing) && (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveProfile}><FaSave /> {t.saveChanges}</button>
                <button className="cancel-btn" onClick={handleCancelEdit}><FaTimes /> {t.cancel}</button>
              </div>
            )}
            {isDoctorView && (
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={handleSaveProfile} style={{ background: '#4CAF50' }}>
                  <FaSave /> {t.savePatientRecords}
                </button>
              </div>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{safeGetStats(userData, 'diagnoses', 0)}</span>
              <span className="stat-label">{t.diagnoses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{appointments.length || safeGetStats(userData, 'appointments', 0)}</span>
              <span className="stat-label">{t.appointments}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{safeGetStats(userData, 'articles', 0)}</span>
              <span className="stat-label">{t.articles}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{safeGetStats(userData, 'savedReports', 0)}</span>
              <span className="stat-label">{t.savedReports}</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><FaUser /> {t.overview}</button>
            <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}><FaChartLine /> {t.activity}</button>
            <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}><FaHeartbeat /> {t.health}</button>
            <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => { setActiveTab('appointments'); loadUserAppointments(); }}><FaCalendarCheck /> {t.appointments}</button>
            <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => { setActiveTab('prescriptions'); loadUserPrescriptions(); }}><FaPrescriptionBottle /> {t.prescriptions}</button>
            <button className={activeTab === 'medicine' ? 'active' : ''} onClick={() => setActiveTab('medicine')}><FaPills /> {t.medicine}</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><FaCog /> {t.settings}</button>
          </div>

          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="bio-section">
                  <h3>{t.about}</h3>
                  {isEditing && !isDoctorView ? (
                    <textarea name="bio" value={editedData.bio || ""} onChange={handleInputChange} rows="4" placeholder="Tell us about yourself..." />
                  ) : (
                    <p>{userData.bio || "No bio provided yet. Click Edit Profile to add your bio."}</p>
                  )}
                </div>
                <div className="contact-section">
                  <h3>{t.contactInfo}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <FaEnvelope />
                      <div>
                        <label>{t.email}</label>
                        {isEditing && !isDoctorView ? (
                          <input type="email" name="email" value={editedData.email || ""} onChange={handleInputChange} placeholder="your@email.com" />
                        ) : (
                          <p>{userData.email || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <FaPhone />
                      <div>
                        <label>{t.phone}</label>
                        {isEditing && !isDoctorView ? (
                          <input type="tel" name="phone" value={editedData.phone || ""} onChange={handleInputChange} placeholder="+1 234 567 8900" />
                        ) : (
                          <p>{userData.phone || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="personal-section">
                  <h3>{t.personalInfo}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <FaUser />
                      <div>
                        <label>{t.fullName}</label>
                        {isEditing && !isDoctorView ? (
                          <input type="text" name="name" value={editedData.name || editedData.fullName || ""} onChange={handleInputChange} placeholder="Full name" />
                        ) : (
                          <p>{profileDisplayName !== "User" && profileDisplayName !== "Guest" ? profileDisplayName : "Not provided"}</p>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <FaCalendarAlt />
                      <div>
                        <label>{t.dateOfBirth}</label>
                        {isEditing && !isDoctorView ? (
                          <input type="date" name="dateOfBirth" value={editedData.dateOfBirth || ""} onChange={handleInputChange} />
                        ) : (
                          <p>{userData.dateOfBirth || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <FaVenusMars />
                      <div>
                        <label>{t.gender}</label>
                        {isEditing && !isDoctorView ? (
                          <select name="gender" value={editedData.gender || ""} onChange={handleInputChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <p>{userData.gender || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <FaTint />
                      <div>
                        <label>{t.bloodGroup}</label>
                        {isEditing && !isDoctorView ? (
                          <select name="bloodGroup" value={editedData.bloodGroup || ""} onChange={handleInputChange}>
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        ) : (
                          <p>{userData.bloodGroup || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <FaRuler />
                      <div>
                        <label>{t.age}</label>
                        {isEditing && !isDoctorView ? (
                          <input type="number" name="age" value={editedData.age || ""} onChange={handleInputChange} placeholder="Enter age" />
                        ) : (
                          <p>{userData.age || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="social-section">
                  <h3>{t.socialLinks}</h3>
                  <div className="social-links">
                    <div className="social-item">
                      <FaGithub />
                      {isEditing && !isDoctorView ? (
                        <input type="url" value={editedData.socialLinks?.github || ""} onChange={(e) => handleSocialChange('github', e.target.value)} placeholder="GitHub URL" />
                      ) : (
                        <a href={userData.socialLinks?.github}>{userData.socialLinks?.github || "Not provided"}</a>
                      )}
                    </div>
                    <div className="social-item">
                      <FaLinkedin />
                      {isEditing && !isDoctorView ? (
                        <input type="url" value={editedData.socialLinks?.linkedin || ""} onChange={(e) => handleSocialChange('linkedin', e.target.value)} placeholder="LinkedIn URL" />
                      ) : (
                        <a href={userData.socialLinks?.linkedin}>{userData.socialLinks?.linkedin || "Not provided"}</a>
                      )}
                    </div>
                    <div className="social-item">
                      <FaTwitter />
                      {isEditing && !isDoctorView ? (
                        <input type="url" value={editedData.socialLinks?.twitter || ""} onChange={(e) => handleSocialChange('twitter', e.target.value)} placeholder="Twitter URL" />
                      ) : (
                        <a href={userData.socialLinks?.twitter}>{userData.socialLinks?.twitter || "Not provided"}</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="activity-content">
                <h3>{t.recentActivity}</h3>
                <div className="activity-list">
                  {userData.recentActivities && userData.recentActivities.length > 0 ? (
                    userData.recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">{getIconComponent(activity.icon)}</div>
                        <div className="activity-details">
                          <p>{activity.description}</p>
                          <span className="activity-time">{activity.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">No recent activity</div>
                  )}
                </div>
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div className="health-content-enhanced">
                <div className="health-header">
                  <h3><FaHeartbeat /> {t.healthMetrics}</h3>
                  <div className="health-actions">
                    <div className="date-picker-wrapper">
                      <label><FaCalendarAlt /> {t.selectDate}:</label>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                      />
                    </div>
                    <button 
                      className="save-record-btn" 
                      onClick={saveHealthRecord}
                      disabled={savingRecord}
                    >
                      <FaSave /> {savingRecord ? t.saving : t.saveHealthRecord}
                    </button>
                    <button className="view-chart-btn" onClick={openChartModal}>
                      <FaChartLine /> {t.viewChart}
                    </button>
                    <button className="view-history-btn" onClick={openHistoryModal}>
                      <FaHistory /> {t.viewHistory}
                    </button>
                  </div>
                </div>

                <div className="category-dropdown">
                  <label><FaInfoCircle /> {t.selectCategory}:</label>
                  <select value={selectedHealthCategory} onChange={(e) => setSelectedHealthCategory(e.target.value)} className="category-select">
                    {Object.entries(healthCategories).map(([key, category]) => (
                      <option key={key} value={key}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="category-info" style={{ borderLeftColor: healthCategories[selectedHealthCategory]?.color || '#666' }}>
                  <div className="category-icon" style={{ color: healthCategories[selectedHealthCategory]?.color || '#666' }}>
                    {healthCategories[selectedHealthCategory]?.icon}
                  </div>
                  <div className="category-name">{healthCategories[selectedHealthCategory]?.name || 'Select Category'}</div>
                </div>

                <div className="metrics-input-section">
                  <div className="metrics-grid-enhanced">
                    {renderMetricInputs()}
                    
                    {/* Heart Attack Risk - Calculate Risk Button */}
                    {selectedHealthCategory === 'cardiovascularRisk' && (
                      <div className="metric-card-enhanced ml-button-container">
                        <button 
                          className="calculate-risk-btn"
                          onClick={handleCalculateRisk}
                          disabled={mlLoading}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: mlLoading ? '#666' : 'linear-gradient(135deg, #e91e63, #c2185b)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: mlLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => {
                            if (!mlLoading) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {mlLoading ? <FaSpinner className="spinning" /> : <FaHeartRisk />} 
                          {mlLoading ? t.mlPredicting : '🧠 ML: Calculate Heart Attack Risk'}
                        </button>
                        {!mlServiceAvailable && (
                          <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                            ⚠️ {t.mlServiceDown}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stroke Risk - Calculate Risk Button */}
                    {selectedHealthCategory === 'strokeRisk' && (
                      <div className="metric-card-enhanced ml-button-container">
                        <button 
                          className="calculate-risk-btn"
                          onClick={handleCalculateRisk}
                          disabled={mlLoading}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: mlLoading ? '#666' : 'linear-gradient(135deg, #9C27B0, #6A1B9A)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: mlLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => {
                            if (!mlLoading) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 15px rgba(156, 39, 176, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {mlLoading ? <FaSpinner className="spinning" /> : <FaBrain />} 
                          {mlLoading ? t.mlPredicting : '🧠 ML: Calculate Stroke Risk'}
                        </button>
                        {!mlServiceAvailable && (
                          <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                            ⚠️ {t.mlServiceDown}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ML Result Modal */}
                {showMlResult && (
                  <div className="risk-result-modal" onClick={closeMlResult}>
                    <div className="risk-result-content" onClick={(e) => e.stopPropagation()}>
                      <button onClick={closeMlResult} className="modal-close-btn">
                        <FaTimes />
                      </button>
                      
                      {mlError ? (
                        <div className="ml-error-container">
                          <div className="ml-error-icon">❌</div>
                          <h2>{t.mlServiceError}</h2>
                          <p className="ml-error-message">{mlError}</p>
                          <button onClick={closeMlResult} className="ml-result-close-btn">
                            {t.close}
                          </button>
                        </div>
                      ) : mlResult && (
                        <>
                          <div className="ml-result-header">
                            <div className="ml-result-icon">{mlResult.type === 'heart' ? '❤️' : '🧠'}</div>
                            <h2>{mlResult.type === 'heart' ? t.mlHeartRisk : t.mlStrokeRisk}</h2>
                            <div className={`ml-result-badge ${mlResult.prediction === 1 ? 'risk-detected' : 'no-risk'}`}>
                              {mlResult.prediction === 1 ? t.mlRiskDetected : t.mlNoRisk}
                            </div>
                            {mlResult.model_used && (
                              <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '5px' }}>
                                🤖 {t.mlModel}: {mlResult.model_used}
                              </div>
                            )}
                            
                            {/* ✅ STROKE CONFIDENCE FIX STARTS HERE */}
                            {mlResult.confidence_level && (
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: mlResult.confidence_level === 'High' ? '#4caf50' : 
                                       mlResult.confidence_level === 'Moderate' ? '#ff9800' : '#f44336',
                                marginTop: '2px'
                              }}>
                                Confidence Level: {
                                  /* Check: Stroke message includes 'no symptoms' */
                                  (mlResult.message && mlResult.message.toLowerCase().includes('no symptoms')) 
                                    ? "Very Low" 
                                    : mlResult.confidence_level
                                }
                              </div>
                            )}
                            {/* ✅ STROKE CONFIDENCE FIX ENDS HERE */}
                            
                          </div>
                          
                          <div className="ml-confidence-section">
                            <div className="ml-confidence-label">
                              <span>{t.mlConfidence}:</span>
                              <span className="ml-confidence-value">{mlResult.score}%</span>
                            </div>
                            <div className="ml-confidence-bar">
                              <div className="ml-confidence-fill" style={{ width: `${mlResult.score}%` }}></div>
                            </div>
                          </div>
                          
                          <div className="ml-result-message">
                            <p>{mlResult.message}</p>
                          </div>
                          
                          {mlResult.risk_factors && mlResult.risk_factors.length > 0 && (
                            <div className="ml-risk-factors">
                              <h4>Key Risk Factors:</h4>
                              <ul>
                                {mlResult.risk_factors.slice(0, 5).map((factor, idx) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {mlResult.risk_score !== null && mlResult.risk_score !== undefined && (
                            <div className="ml-risk-score">
                              <span>Risk Score: <strong>{mlResult.risk_score}/100</strong></span>
                            </div>
                          )}
                          
                          <button onClick={closeMlResult} className="ml-result-close-btn">
                            {t.close}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="health-summary">
                  <h4>Quick Health Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <FaHeartbeat />
                      <div>
                        <small>Blood Pressure</small>
                        <strong>
                          {getBloodPressureValue(editedData.healthMetrics, 'systolic') || '--'}/
                          {getBloodPressureValue(editedData.healthMetrics, 'diastolic') || '--'} mmHg
                        </strong>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FaWeight />
                      <div>
                        <small>BMI</small>
                        <strong>{editedData.healthMetrics?.bmi || '--'} kg/m²</strong>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FaTint />
                      <div>
                        <small>Blood Sugar</small>
                        <strong>{safeGetHealthMetric(editedData, 'bloodSugar.fasting') || '--'} mg/dL</strong>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FaChartLine />
                      <div>
                        <small>Cholesterol</small>
                        <strong>{safeGetHealthMetric(editedData, 'lipidProfile.totalCholesterol') || '--'} mg/dL</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && renderAppointmentsTab()}

            {/* ✅ Prescriptions Tab */}
            {activeTab === 'prescriptions' && renderPrescriptionsTab()}

            {/* Medicine Tab */}
            {activeTab === 'medicine' && (
              <div className="medicine-tab-content">
                <div className="medicine-tab-header">
                  <h3><FaPills /> {t.medicineReminder}</h3>
                  <p>{t.trackMedications}</p>
                </div>
                <MedicineReminder />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && !isDoctorView && (
              <div className="settings-content">
                <h3>Account Settings</h3>
                <div className="settings-form">
                  <div className="setting-item">
                    <label>Language</label>
                    <select value={lang} onChange={(e) => toggleLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="bn">বাংলা</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Theme</label>
                    <select value={darkMode ? "dark" : "light"} onChange={toggleDarkMode}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <button className="save-settings-btn" onClick={() => alert("Settings saved!")}>Save Settings</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chart Modal */}
      {renderChartModal()}

      {/* History Modal */}
      {renderHistoryModal()}

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={() => setShowEmergencyModal(true)}><FaPlus /></button>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3><FaPhoneAlt /> {t.emergencyTitle}</h3>
            <p>{t.emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={() => { window.location.href = "tel:999"; setShowEmergencyModal(false); }}><FaPhoneAlt /> {t.emergencyCall}</button>
              <button className="btn-call" onClick={findHospital}><FaMapMarkerAlt /> {t.emergencyHospital}</button>
              <button className="btn-cancel" onClick={() => setShowEmergencyModal(false)}><FaTimes /> {t.emergencyCancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="cancel-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3><FaExclamationTriangle /> {t.cancelAppointment}</h3>
            <p className="cancel-modal-confirm">{t.cancelConfirmation}</p>
            <p className="cancel-appointment-info">
              <strong>Doctor:</strong> {selectedAppointment.doctorName}
              <br />
              <strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
              <br />
              <strong>Time:</strong> {selectedAppointment.timeSlot}
            </p>
            <div className="cancel-form-group">
              <label>{t.cancelReasonLabel}</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t.cancelReasonPlaceholder}
                rows="3"
                className="cancel-reason-textarea"
              />
            </div>
            <div className="cancel-modal-actions">
              <button className="cancel-modal-btn-secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
                {t.cancel}
              </button>
              <button className="cancel-modal-btn-danger" onClick={handleCancelAppointment} disabled={cancelling}>
                {cancelling ? t.cancelling : t.cancelAppointment}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && !isDoctorView && (
        <div className="password-modal" onClick={() => setShowPasswordModal(false)}>
          <div className="password-content" onClick={(e) => e.stopPropagation()}>
            <h3><FaLock /> {t.changePassword}</h3>
            <div className="password-form">
              <div className="form-group">
                <label>{t.currentPassword}</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} 
                  disabled={isChangingPassword}
                />
              </div>
              <div className="form-group">
                <label>{t.newPassword}</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} 
                  disabled={isChangingPassword}
                />
              </div>
              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                  disabled={isChangingPassword}
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="update-btn" 
                  onClick={handlePasswordChange} 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? t.changingPassword : t.updatePassword}
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }} 
                  disabled={isChangingPassword}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>{t.copyright}</p>
        <p className="tagline">{t.tagline}</p>
      </footer>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
const findHospital = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => window.open(`https://www.google.com/maps/search/hospitals/@${position.coords.latitude},${position.coords.longitude},15z`, "_blank"),
      () => window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank")
    );
  } else {
    window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
  }
};

export default UserProfile;