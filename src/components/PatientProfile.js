// PatientProfile.js - Updated to show patient data from API with Health Records
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaPrescription, 
  FaArrowLeft, FaSpinner, FaFileAlt, FaHeartbeat, FaTint,
  FaWeight, FaChartLine, FaSyringe, FaMicroscope, FaStethoscope,
  FaVenusMars, FaCalendarCheck, FaUserMd, FaIdCard, FaHistory,
  FaChartBar, FaNotesMedical, FaHospital, FaClock
} from "react-icons/fa";
import axios from "axios";
import { AppContext } from "../Contexts/AppContexts";
import "../styles/PatientProfile.css";

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function PatientProfile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { darkMode, lang } = useContext(AppContext);
  
  const [patientData, setPatientData] = useState(null);
  const [reports, setReports] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [showAllRecords, setShowAllRecords] = useState(false);

  // Translation
  const t = {
    en: {
      backToPatients: "Back to Patients",
      patientProfile: "Patient Profile",
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      healthMetrics: "Health Metrics",
      medicalHistory: "Medical History & Reports",
      noHistory: "No previous medical history found.",
      age: "Age",
      gender: "Gender",
      bloodGroup: "Blood Group",
      address: "Address",
      email: "Email",
      phone: "Phone",
      years: "yrs",
      loading: "Loading patient profile...",
      error: "Error Loading Profile",
      retry: "Retry",
      visit: "Visit",
      diagnosis: "Diagnosis",
      doctorNotes: "Doctor Notes",
      date: "Date",
      bloodPressure: "Blood Pressure",
      heartRate: "Heart Rate",
      temperature: "Temperature",
      bmi: "BMI",
      cholesterol: "Cholesterol",
      bloodSugar: "Blood Sugar",
      hba1c: "HbA1c",
      height: "Height",
      weight: "Weight",
      smoking: "Smoking",
      exercise: "Exercise",
      sleep: "Sleep",
      stress: "Stress",
      alcohol: "Alcohol",
      thyroid: "Thyroid",
      kidney: "Kidney Function",
      liver: "Liver Function",
      vitamins: "Vitamins",
      iron: "Iron Profile",
      cbc: "Complete Blood Count",
      riskAssessment: "Risk Assessment",
      heartRisk: "Heart Attack Risk",
      strokeRisk: "Stroke Risk",
      noData: "No data available",
      fullName: "Full Name",
      dateOfBirth: "Date of Birth",
      emergencyContact: "Emergency Contact",
      status: "Status",
      id: "ID",
      healthRecords: "Health Records History",
      noRecords: "No health records found",
      viewAll: "View All Records",
      hideAll: "Hide Records",
      latestRecord: "Latest Record",
      recordsCount: "Total Records",
      updatedAt: "Last Updated",
      viewDetails: "View Details"
    },
    bn: {
      backToPatients: "রোগীদের ফিরে যান",
      patientProfile: "রোগীর প্রোফাইল",
      personalInfo: "ব্যক্তিগত তথ্য",
      contactInfo: "যোগাযোগের তথ্য",
      healthMetrics: "স্বাস্থ্য মেট্রিক্স",
      medicalHistory: "মেডিকেল ইতিহাস ও রিপোর্ট",
      noHistory: "কোনো পূর্ববর্তী মেডিকেল ইতিহাস পাওয়া যায়নি।",
      age: "বয়স",
      gender: "লিঙ্গ",
      bloodGroup: "রক্তের গ্রুপ",
      address: "ঠিকানা",
      email: "ইমেল",
      phone: "ফোন",
      years: "বছর",
      loading: "রোগীর প্রোফাইল লোড হচ্ছে...",
      error: "প্রোফাইল লোড করতে ত্রুটি",
      retry: "আবার চেষ্টা করুন",
      visit: "ভিজিট",
      diagnosis: "রোগ নির্ণয়",
      doctorNotes: "ডাক্তারের নোট",
      date: "তারিখ",
      bloodPressure: "রক্তচাপ",
      heartRate: "হার্ট রেট",
      temperature: "তাপমাত্রা",
      bmi: "বিএমআই",
      cholesterol: "কোলেস্টেরল",
      bloodSugar: "রক্তের শর্করা",
      hba1c: "HbA1c",
      height: "উচ্চতা",
      weight: "ওজন",
      smoking: "ধূমপান",
      exercise: "ব্যায়াম",
      sleep: "ঘুম",
      stress: "মানসিক চাপ",
      alcohol: "অ্যালকোহল",
      thyroid: "থাইরয়েড",
      kidney: "কিডনি ফাংশন",
      liver: "লিভার ফাংশন",
      vitamins: "ভিটামিন",
      iron: "আয়রন প্রোফাইল",
      cbc: "সম্পূর্ণ রক্ত গণনা",
      riskAssessment: "ঝুঁকি মূল্যায়ন",
      heartRisk: "হার্ট অ্যাটাক ঝুঁকি",
      strokeRisk: "স্ট্রোক ঝুঁকি",
      noData: "কোন তথ্য উপলব্ধ নেই",
      fullName: "পুরো নাম",
      dateOfBirth: "জন্ম তারিখ",
      emergencyContact: "জরুরি যোগাযোগ",
      status: "স্ট্যাটাস",
      id: "আইডি",
      healthRecords: "স্বাস্থ্য রেকর্ড ইতিহাস",
      noRecords: "কোন স্বাস্থ্য রেকর্ড পাওয়া যায়নি",
      viewAll: "সব রেকর্ড দেখুন",
      hideAll: "রেকর্ড লুকান",
      latestRecord: "সর্বশেষ রেকর্ড",
      recordsCount: "মোট রেকর্ড",
      updatedAt: "শেষ আপডেট",
      viewDetails: "বিস্তারিত দেখুন"
    }
  };

  const text = t[lang] || t.en;

  // Get auth token
  const getToken = () => {
    return localStorage.getItem("token") || 
           localStorage.getItem("accessToken") || 
           localStorage.getItem("doctorToken");
  };

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        
        // First try to get from localStorage (for demo/offline mode)
        const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        
        // Find patient by id or email
        let patient = allUsers.find(u => u.id == id || u.email === id || u._id === id);
        
        if (patient) {
          console.log("✅ Patient found in localStorage:", patient);
          setPatientData(patient);
        }
        
        // ✅ Try to fetch health records from API
        if (token) {
          try {
            // Try to get health records for this patient
            const email = patient?.email || id;
            
            // First, try to get user ID from email
            const userResponse = await axios.get(`${API_BASE_URL}/user/by-email/${email}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (userResponse.data.success) {
              const userId = userResponse.data.data._id;
              
              // Fetch health records for this user
              const recordsResponse = await axios.get(`${API_BASE_URL}/health-records/history?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (recordsResponse.data.success) {
                // Filter records for this specific patient
                const userRecords = recordsResponse.data.data.filter(
                  record => record.userId === userId || record.userEmail === email
                );
                
                // Sort records by date (Newest first) and save to state
                const sortedRecords = [...userRecords].sort((a, b) => 
                  new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );
                
                setHealthRecords(sortedRecords);
                console.log("✅ Health records loaded:", sortedRecords.length);

                // 🔥 Update: Set Health Metrics from the Latest Record
                if (sortedRecords.length > 0 && sortedRecords[0].metrics) {
                  setHealthMetrics(sortedRecords[0].metrics);
                } else if (patient?.healthMetrics) {
                  // Fallback to patient profile healthMetrics if no records have metrics
                  setHealthMetrics(patient.healthMetrics);
                } else {
                  setHealthMetrics(null);
                }
              }
            }
          } catch (apiErr) {
            console.log("⚠️ Could not fetch health records from API:", apiErr.message);
            // Try fallback - check localStorage
            const patientHistoryKey = `healthHistory_${patient?.id || patient?._id || id}`;
            const savedHistory = localStorage.getItem(patientHistoryKey);
            if (savedHistory) {
              const localRecords = JSON.parse(savedHistory);
              setHealthRecords(localRecords);
              
              // 🔥 Update: Try to set metrics from latest local record
              const sortedLocal = [...localRecords].sort((a, b) => 
                new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
              );
              if (sortedLocal.length > 0 && sortedLocal[0].metrics) {
                setHealthMetrics(sortedLocal[0].metrics);
              }
            }
          }
        }
        
        // If patient not found in localStorage, try API
        if (!patient) {
          try {
            const response = await axios.get(`${API_BASE_URL}/patients/${id}`, {
              headers: { Authorization: `Bearer ${token || ''}` }
            });
            
            if (response.data.success) {
              const patientData = response.data.data.patient;
              setPatientData(patientData);
              setReports(response.data.data.appointments || []);
              
              // If records didn't have metrics, fallback to patient healthMetrics
              if (!healthMetrics) {
                setHealthMetrics(patientData.healthMetrics || null);
              }
            }
          } catch (apiErr) {
            console.log("⚠️ Patient not found in API");
          }
        }
        
        // Load medical history/reports from appointments
        if (patient) {
          const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
          const patientAppointments = appointments.filter(a => 
            a.patientId === patient.id || a.patientEmail === patient.email
          );
          if (patientAppointments.length > 0) {
            setReports(patientAppointments);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching patient:", err);
        setError(err.message || "Failed to load patient profile");
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [id]);

  // Helper function to get display name
  const getDisplayName = (user) => {
    if (!user) return "Unknown Patient";
    return user.name || user.fullName || 
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) || 
      user.firstName || "Unknown Patient";
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === "bn" ? 'bn-BD' : 'en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(lang === "bn" ? 'bn-BD' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to get nested value from healthMetrics
  const getMetricValue = (path, defaultValue = "N/A") => {
    if (!healthMetrics) return defaultValue;
    const keys = path.split('.');
    let current = healthMetrics;
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue;
      current = current[key];
    }
    return current !== undefined && current !== null && current !== "" ? current : defaultValue;
  };

  // Helper to get value from a specific record's metrics
  const getRecordMetricValue = (metrics, path, defaultValue = "N/A") => {
    if (!metrics) return defaultValue;
    const keys = path.split('.');
    let current = metrics;
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue;
      current = current[key];
    }
    return current !== undefined && current !== null && current !== "" ? current : defaultValue;
  };

  // 🔥 Updated: Helper to get blood pressure display (Now checks both 'bloodPressure' and 'bp' keys)
  const getBloodPressureDisplay = () => {
    if (!healthMetrics) return "N/A";
    
    // Check standard bloodPressure object
    const bp = healthMetrics.bloodPressure;
    if (bp) {
      if (typeof bp === 'object') {
        const sys = bp.systolic || "";
        const dia = bp.diastolic || "";
        if (sys && dia) return `${sys}/${dia} mmHg`;
        if (sys) return `${sys} mmHg`;
        return "N/A";
      }
      return bp || "N/A";
    }
    
    // Fallback: Check for 'bp' key (as seen in your Record #4 screenshot)
    const bpShort = healthMetrics.bp;
    if (bpShort && typeof bpShort === 'object') {
      const sys = bpShort.systolic || "";
      const dia = bpShort.diastolic || "";
      if (sys && dia) return `${sys}/${dia} mmHg`;
    }

    return "N/A";
  };

  // Get latest health record
  const getLatestRecord = () => {
    if (!healthRecords || healthRecords.length === 0) return null;
    // Records are already sorted newest first in the useEffect, so just return the 1st one
    return healthRecords[0];
  };

  // Render Health Records Section
  const renderHealthRecords = () => {
    if (!healthRecords || healthRecords.length === 0) {
      return (
        <div className="no-records">
          <FaHistory style={{ fontSize: '2rem', color: '#a0aec0', marginBottom: '10px' }} />
          <p>{text.noRecords}</p>
        </div>
      );
    }

    const recordsToShow = showAllRecords ? healthRecords : healthRecords.slice(0, 3);
    const latestRecord = getLatestRecord();

    return (
      <div className="health-records-section">
        {latestRecord && (
          <div className="latest-record-banner" style={{
            background: darkMode ? '#2d3748' : '#ebf8ff',
            border: `1px solid ${darkMode ? '#4a5568' : '#bee3f8'}`,
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: darkMode ? '#63b3ed' : '#2b6cb0' }}>
                  <FaClock /> {text.latestRecord}
                </strong>
                <div style={{ fontSize: '0.85rem', color: darkMode ? '#a0aec0' : '#718096' }}>
                  {formatDate(latestRecord.date || latestRecord.createdAt)} at {formatTime(latestRecord.date || latestRecord.createdAt)}
                </div>
              </div>
              <span style={{ 
                background: '#00e6ff', 
                color: '#1a2332', 
                padding: '2px 12px', 
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                #{healthRecords.length} {text.recordsCount}
              </span>
            </div>
          </div>
        )}

        <div className="records-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recordsToShow.map((record, index) => {
            const metrics = record.metrics || {};
            return (
              <div key={record._id || index} className="record-item" style={{
                background: darkMode ? '#2d3748' : '#f7fafc',
                borderRadius: '10px',
                padding: '15px',
                borderLeft: `4px solid ${index === 0 ? '#00e6ff' : '#a0aec0'}`,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: darkMode ? '#e2e8f0' : '#2d3748' }}>
                    Record #{healthRecords.length - index}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                    {formatDate(record.date || record.createdAt)} {formatTime(record.date || record.createdAt)}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {metrics.bmi && <div><strong>BMI:</strong> {metrics.bmi} kg/m²</div>}
                  {metrics.bloodPressure?.systolic && (
                    <div><strong>BP:</strong> {metrics.bloodPressure.systolic}/{metrics.bloodPressure.diastolic} mmHg</div>
                  )}
                  {metrics.heartRate && <div><strong>Heart Rate:</strong> {metrics.heartRate} bpm</div>}
                  {metrics.temperature && <div><strong>Temp:</strong> {metrics.temperature} °C</div>}
                  {metrics.bloodSugar?.fasting && <div><strong>Fasting Sugar:</strong> {metrics.bloodSugar.fasting} mg/dL</div>}
                  {metrics.lipidProfile?.totalCholesterol && <div><strong>Chol:</strong> {metrics.lipidProfile.totalCholesterol} mg/dL</div>}
                  {metrics.weight && <div><strong>Weight:</strong> {metrics.weight} kg</div>}
                  {metrics.height && <div><strong>Height:</strong> {metrics.height} cm</div>}
                </div>
              </div>
            );
          })}
        </div>

        {healthRecords.length > 3 && (
          <button 
            className="toggle-records-btn"
            onClick={() => setShowAllRecords(!showAllRecords)}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: darkMode ? '#a0aec0' : '#4a5568',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem'
            }}
          >
            {showAllRecords ? text.hideAll : text.viewAll} ({healthRecords.length} {text.recordsCount})
          </button>
        )}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className={`patient-profile-container ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-state">
          <FaSpinner className="spinner-icon" />
          <p>{text.loading}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`patient-profile-container ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>{text.error}</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            {text.retry}
          </button>
        </div>
      </div>
    );
  }

  // Render Profile
  return (
    <div className={`patient-profile-container ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Back Button */}
      <button 
        className="back-button"
        onClick={() => navigate('/doctor/patients')}
      >
        <FaArrowLeft /> <span>{text.backToPatients}</span>
      </button>

      <div className="patient-profile-card">
        {/* Header with Avatar */}
        <div className="profile-header-section">
          <div className="patient-avatar-large">
            {patientData?.profileImage ? (
              <img src={patientData.profileImage} alt={getDisplayName(patientData)} />
            ) : (
              <span>{getDisplayName(patientData).charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{getDisplayName(patientData)}</h1>
            <p className="patient-id"><FaIdCard /> {text.id}: {patientData?.id || patientData?._id || "N/A"}</p>
            <div className="patient-badges">
              {patientData?.accountStatus && (
                <span className={`status-badge ${patientData.accountStatus.toLowerCase()}`}>
                  {patientData.accountStatus}
                </span>
              )}
              {patientData?.bloodGroup && (
                <span className="blood-badge">{patientData.bloodGroup}</span>
              )}
              {healthRecords.length > 0 && (
                <span className="records-badge" style={{
                  background: '#00e6ff',
                  color: '#1a2332',
                  padding: '2px 12px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  <FaHistory /> {healthRecords.length} {text.recordsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{patientData?.age || "N/A"}</span>
            <span className="stat-label">{text.age}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{patientData?.gender || "N/A"}</span>
            <span className="stat-label">{text.gender}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{patientData?.bloodGroup || "N/A"}</span>
            <span className="stat-label">{text.bloodGroup}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{healthRecords.length || 0}</span>
            <span className="stat-label">{text.recordsCount}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="profile-two-column">
          {/* Left Column - Personal & Contact Info */}
          <div className="profile-left-column">
            {/* Personal Information */}
            <div className="info-section">
              <h3><FaUser /> {text.personalInfo}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>{text.fullName}</label>
                  <p>{getDisplayName(patientData)}</p>
                </div>
                <div className="info-item">
                  <label>{text.age}</label>
                  <p>{patientData?.age || "N/A"} {text.years}</p>
                </div>
                <div className="info-item">
                  <label>{text.gender}</label>
                  <p>{patientData?.gender || "N/A"}</p>
                </div>
                <div className="info-item">
                  <label>{text.bloodGroup}</label>
                  <p>{patientData?.bloodGroup || "N/A"}</p>
                </div>
                <div className="info-item">
                  <label>{text.dateOfBirth}</label>
                  <p>{patientData?.dateOfBirth ? formatDate(patientData.dateOfBirth) : "N/A"}</p>
                </div>
                <div className="info-item">
                  <label>{text.status}</label>
                  <p>{patientData?.accountStatus || "Active"}</p>
                </div>
                <div className="info-item full-width">
                  <label>{text.address}</label>
                  <p>{patientData?.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="info-section">
              <h3><FaPhone /> {text.contactInfo}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label><FaEnvelope /> {text.email}</label>
                  <p>{patientData?.email || "N/A"}</p>
                </div>
                <div className="info-item">
                  <label><FaPhone /> {text.phone}</label>
                  <p>{patientData?.phone || "N/A"}</p>
                </div>
                {patientData?.emergencyContact && (
                  <div className="info-item full-width">
                    <label>{text.emergencyContact}</label>
                    <p>{patientData.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Health Metrics */}
          <div className="profile-right-column">
            <div className="info-section">
              <h3><FaHeartbeat /> {text.healthMetrics}</h3>
              
              {healthMetrics ? (
                <div className="health-metrics-grid">
                  {/* Basic Vitals */}
                  <div className="metric-group">
                    <h4>Vital Signs</h4>
                    <div className="metric-item">
                      <span className="metric-label">{text.bloodPressure}</span>
                      <span className="metric-value">{getBloodPressureDisplay()}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.heartRate}</span>
                      <span className="metric-value">{getMetricValue('heartRate')} bpm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.temperature}</span>
                      <span className="metric-value">{getMetricValue('temperature')} °C</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.bmi}</span>
                      <span className="metric-value">{getMetricValue('bmi')} kg/m²</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.height}</span>
                      <span className="metric-value">{getMetricValue('height')} cm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.weight}</span>
                      <span className="metric-value">{getMetricValue('weight')} kg</span>
                    </div>
                  </div>

                  {/* Diabetes & Cholesterol */}
                  <div className="metric-group">
                    <h4>Diabetes & Lipids</h4>
                    <div className="metric-item">
                      <span className="metric-label">{text.bloodSugar} (Fasting)</span>
                      <span className="metric-value">{getMetricValue('bloodSugar.fasting')} mg/dL</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.bloodSugar} (Postprandial)</span>
                      <span className="metric-value">{getMetricValue('bloodSugar.postprandial')} mg/dL</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.hba1c}</span>
                      <span className="metric-value">{getMetricValue('bloodSugar.hba1c')} %</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">{text.cholesterol} (Total)</span>
                      <span className="metric-value">{getMetricValue('lipidProfile.totalCholesterol')} mg/dL</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">HDL</span>
                      <span className="metric-value">{getMetricValue('lipidProfile.hdl')} mg/dL</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">LDL</span>
                      <span className="metric-value">{getMetricValue('lipidProfile.ldl')} mg/dL</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Triglycerides</span>
                      <span className="metric-value">{getMetricValue('lipidProfile.triglycerides')} mg/dL</span>
                    </div>
                  </div>

                  {/* Lifestyle */}
                  {healthMetrics.lifestyle && Object.values(healthMetrics.lifestyle).some(v => v) && (
                    <div className="metric-group">
                      <h4>Lifestyle</h4>
                      <div className="metric-item">
                        <span className="metric-label">{text.exercise}</span>
                        <span className="metric-value">{getMetricValue('lifestyle.exercise')}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">{text.sleep}</span>
                        <span className="metric-value">{getMetricValue('lifestyle.sleep')} hours</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">{text.stress}</span>
                        <span className="metric-value">{getMetricValue('lifestyle.stress')}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">{text.smoking}</span>
                        <span className="metric-value">{getMetricValue('lifestyle.smoking')}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">{text.alcohol}</span>
                        <span className="metric-value">{getMetricValue('lifestyle.alcohol')}</span>
                      </div>
                    </div>
                  )}

                  {/* Additional Metrics - Show if available */}
                  {healthMetrics.thyroid && Object.values(healthMetrics.thyroid).some(v => v) && (
                    <div className="metric-group">
                      <h4><FaStethoscope /> {text.thyroid}</h4>
                      {healthMetrics.thyroid.tsh && (
                        <div className="metric-item">
                          <span className="metric-label">TSH</span>
                          <span className="metric-value">{healthMetrics.thyroid.tsh} µIU/mL</span>
                        </div>
                      )}
                      {healthMetrics.thyroid.t3 && (
                        <div className="metric-item">
                          <span className="metric-label">T3</span>
                          <span className="metric-value">{healthMetrics.thyroid.t3} ng/dL</span>
                        </div>
                      )}
                      {healthMetrics.thyroid.t4 && (
                        <div className="metric-item">
                          <span className="metric-label">T4</span>
                          <span className="metric-value">{healthMetrics.thyroid.t4} µg/dL</span>
                        </div>
                      )}
                    </div>
                  )}

                  {healthMetrics.cbc && Object.values(healthMetrics.cbc).some(v => v) && (
                    <div className="metric-group">
                      <h4><FaMicroscope /> {text.cbc}</h4>
                      {healthMetrics.cbc.hemoglobin && (
                        <div className="metric-item">
                          <span className="metric-label">Hemoglobin</span>
                          <span className="metric-value">{healthMetrics.cbc.hemoglobin} g/dL</span>
                        </div>
                      )}
                      {healthMetrics.cbc.wbc && (
                        <div className="metric-item">
                          <span className="metric-label">WBC</span>
                          <span className="metric-value">{healthMetrics.cbc.wbc} ×10³/µL</span>
                        </div>
                      )}
                      {healthMetrics.cbc.platelets && (
                        <div className="metric-item">
                          <span className="metric-label">Platelets</span>
                          <span className="metric-value">{healthMetrics.cbc.platelets} ×10³/µL</span>
                        </div>
                      )}
                    </div>
                  )}

                  {healthMetrics.kidneyFunction && Object.values(healthMetrics.kidneyFunction).some(v => v) && (
                    <div className="metric-group">
                      <h4><FaTint /> {text.kidney}</h4>
                      {healthMetrics.kidneyFunction.creatinine && (
                        <div className="metric-item">
                          <span className="metric-label">Creatinine</span>
                          <span className="metric-value">{healthMetrics.kidneyFunction.creatinine} mg/dL</span>
                        </div>
                      )}
                      {healthMetrics.kidneyFunction.bun && (
                        <div className="metric-item">
                          <span className="metric-label">BUN</span>
                          <span className="metric-value">{healthMetrics.kidneyFunction.bun} mg/dL</span>
                        </div>
                      )}
                    </div>
                  )}

                  {healthMetrics.liverFunction && Object.values(healthMetrics.liverFunction).some(v => v) && (
                    <div className="metric-group">
                      <h4><FaFlask /> {text.liver}</h4>
                      {healthMetrics.liverFunction.alt && (
                        <div className="metric-item">
                          <span className="metric-label">ALT</span>
                          <span className="metric-value">{healthMetrics.liverFunction.alt} U/L</span>
                        </div>
                      )}
                      {healthMetrics.liverFunction.ast && (
                        <div className="metric-item">
                          <span className="metric-label">AST</span>
                          <span className="metric-value">{healthMetrics.liverFunction.ast} U/L</span>
                        </div>
                      )}
                    </div>
                  )}

                  {healthMetrics.vitamins && Object.values(healthMetrics.vitamins).some(v => v) && (
                    <div className="metric-group">
                      <h4><FaVial /> {text.vitamins}</h4>
                      {healthMetrics.vitamins.vitaminD && (
                        <div className="metric-item">
                          <span className="metric-label">Vitamin D</span>
                          <span className="metric-value">{healthMetrics.vitamins.vitaminD} ng/mL</span>
                        </div>
                      )}
                      {healthMetrics.vitamins.vitaminB12 && (
                        <div className="metric-item">
                          <span className="metric-label">Vitamin B12</span>
                          <span className="metric-value">{healthMetrics.vitamins.vitaminB12} pg/mL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-data">{text.noData}</p>
              )}
            </div>
          </div>
        </div>

        {/* Health Records Section */}
        <div className="info-section full-width" style={{ marginTop: '20px' }}>
          <h3><FaHistory /> {text.healthRecords}</h3>
          {renderHealthRecords()}
        </div>

        {/* Medical History Section */}
        <div className="info-section full-width">
          <h3><FaFileAlt /> {text.medicalHistory}</h3>
          
          {!reports || reports.length === 0 ? (
            <p className="no-history">{text.noHistory}</p>
          ) : (
            <div className="history-list">
              {reports.map((report, index) => (
                <div key={report._id || index} className="history-item">
                  <div className="history-header">
                    <span className="history-visit">#{reports.length - index} {text.visit}</span>
                    <span className="history-date"><FaCalendarAlt /> {formatDate(report.appointmentDate || report.date || report.createdAt)}</span>
                  </div>
                  <div className="history-body">
                    <p><strong>{text.diagnosis}:</strong> {report.diagnosis || report.reason || report.notes || report.description || 'N/A'}</p>
                    {report.doctorNotes && (
                      <p className="doctor-notes"><strong>{text.doctorNotes}:</strong> {report.doctorNotes}</p>
                    )}
                    {report.prescription && (
                      <p><strong>Prescription:</strong> {report.prescription}</p>
                    )}
                    {report.symptoms && (
                      <p><strong>Symptoms:</strong> {report.symptoms}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;