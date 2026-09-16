// src/pages/doctor/DoctorSettings.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaLock, FaMoon, FaSun, FaSave, FaTimes,
  FaArrowLeft, FaSpinner, FaEye, FaEyeSlash,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase,
  FaStethoscope, FaUserMd, FaGlobe, FaCheckCircle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import "../styles/DoctorSettings.css";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function DoctorSettings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);

  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    hospital: "",
    address: "",
    profileImage: ""
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Translation
  const text = {
    en: {
      settings: "Settings",
      backToDashboard: "Back to Dashboard",
      profileSettings: "Profile Settings",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      specialization: "Specialization",
      hospital: "Hospital / Clinic",
      address: "Address",
      saveChanges: "Save Changes",
      saving: "Saving...",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updatePassword: "Update Password",
      passwordMismatch: "New password and confirm password do not match.",
      passwordLength: "Password must be at least 6 characters.",
      profileUpdated: "Profile updated successfully!",
      passwordUpdated: "Password updated successfully!",
      errorLoading: "Failed to load profile data.",
      cancel: "Cancel"
    },
    bn: {
      settings: "সেটিংস",
      backToDashboard: "ড্যাশবোর্ডে ফিরে যান",
      profileSettings: "প্রোফাইল সেটিংস",
      personalInfo: "ব্যক্তিগত তথ্য",
      firstName: "নামের প্রথম অংশ",
      lastName: "নামের শেষ অংশ",
      email: "ইমেল ঠিকানা",
      phone: "ফোন নম্বর",
      specialization: "বিশেষত্ব",
      hospital: "হাসপাতাল / ক্লিনিক",
      address: "ঠিকানা",
      saveChanges: "পরিবর্তন সংরক্ষণ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
      currentPassword: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      updatePassword: "পাসওয়ার্ড আপডেট করুন",
      passwordMismatch: "নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।",
      passwordLength: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।",
      profileUpdated: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
      passwordUpdated: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!",
      errorLoading: "প্রোফাইল ডেটা লোড করতে ব্যর্থ।",
      cancel: "বাতিল"
    }
  };

  const t = text[lang] || text.en;

  // ============================================
  // ✅ LOAD DOCTOR PROFILE FROM API
  // ============================================
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // ✅ API Call: Get Doctor Profile - changed doctors to doctor
        const response = await axios.get(`${API_BASE_URL}/doctor/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("✅ Profile Data Loaded:", response.data);

        if (response.data.success) {
          const data = response.data.doctor;
          setDoctorData(data);
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            hospital: data.hospital || "",
            address: data.address || "",
            profileImage: data.profileImage || ""
          });
          
          // Update local storage
          localStorage.setItem("doctorData", JSON.stringify(data));
        } else {
          setError(response.data.message || t.errorLoading);
        }
      } catch (err) {
        console.error("❌ Error loading doctor profile:", err);
        
        // Fallback: Try local storage
        try {
          const localData = JSON.parse(localStorage.getItem("doctorData") || "{}");
          if (localData._id) {
            setDoctorData(localData);
            setFormData({
              firstName: localData.firstName || "",
              lastName: localData.lastName || "",
              email: localData.email || "",
              phone: localData.phone || "",
              specialization: localData.specialization || "",
              hospital: localData.hospital || "",
              address: localData.address || "",
              profileImage: localData.profileImage || ""
            });
            setError("Using cached data. Please refresh.");
          } else {
            setError(err.response?.data?.message || t.errorLoading);
          }
        } catch (e) {
          setError(t.errorLoading);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, [navigate, t.errorLoading]);

  // ============================================
  // ✅ HANDLE INPUT CHANGE
  // ============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ============================================
  // ✅ HANDLE PASSWORD CHANGE
  // ============================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // ============================================
  // ✅ TOGGLE PASSWORD VISIBILITY
  // ============================================
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ============================================
  // ✅ UPDATE PROFILE - API CALL
  // ============================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Prepare data for API (remove email as it's read-only)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        hospital: formData.hospital,
        address: formData.address
      };

      // ✅ API Call: Update Profile - changed doctors to doctor
      const response = await axios.put(
        `${API_BASE_URL}/doctor/update-profile`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Profile Update Response:", response.data);

      if (response.data.success) {
        setSuccessMessage(t.profileUpdated);
        
        // Update local storage with new data
        const updatedData = response.data.doctor;
        localStorage.setItem("doctorData", JSON.stringify(updatedData));
        setDoctorData(updatedData);
        
        // Update form data with response
        setFormData({
          firstName: updatedData.firstName || "",
          lastName: updatedData.lastName || "",
          email: updatedData.email || "",
          phone: updatedData.phone || "",
          specialization: updatedData.specialization || "",
          hospital: updatedData.hospital || "",
          address: updatedData.address || "",
          profileImage: updatedData.profileImage || ""
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("❌ Profile update error:", err);
      
      // Handle specific error cases
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || "Server error. Please try again.");
      } else if (err.request) {
        // Request made but no response
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ✅ UPDATE PASSWORD - API CALL
  // ============================================
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setError(null);
    setSuccessMessage("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.passwordLength);
      setIsChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // ✅ API Call: Change Password - changed doctors to doctor
      const response = await axios.put(
        `${API_BASE_URL}/doctor/change-password`,
        { 
          currentPassword, 
          newPassword 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Password Change Response:", response.data);

      if (response.data.success) {
        setSuccessMessage(t.passwordUpdated);
        setPasswordData({ 
          currentPassword: "", 
          newPassword: "", 
          confirmPassword: "" 
        });
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("❌ Password update error:", err);
      
      if (err.response) {
        setError(err.response.data?.message || "Current password is incorrect.");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ============================================
  // ✅ LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className={`doctor-settings ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ RENDER
  // ============================================
  return (
    <div className={`doctor-settings ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Top Bar */}
      <div className="settings-topbar">
        <div className="topbar-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/doctor-dashboard')}
          >
            <FaArrowLeft /> <span>{t.backToDashboard}</span>
          </button>
          <h2><FaUserMd /> {t.settings}</h2>
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="lang-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Error / Success Messages */}
        {error && (
          <div className="error-msg">
            <FaTimes /> {error}
          </div>
        )}
        {successMessage && (
          <div className="success-msg">
            <FaCheckCircle /> {successMessage}
          </div>
        )}

        <div className="settings-grid">
          {/* Left: Profile Settings */}
          <div className="settings-card profile-card">
            <div className="card-header">
              <FaUser /> <h3>{t.profileSettings}</h3>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>{t.firstName}</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="form-group">
                <label>{t.lastName}</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="form-group">
                <label>{t.email}</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  readOnly 
                  className="read-only"
                  title="Email cannot be changed"
                />
              </div>
              
              <div className="form-group">
                <label>{t.phone}</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label>{t.specialization}</label>
                <input 
                  type="text" 
                  name="specialization" 
                  value={formData.specialization} 
                  readOnly 
                  className="read-only"
                  title="Specialization cannot be changed"
                />
              </div>
              
              <div className="form-group">
                <label>{t.hospital}</label>
                <input 
                  type="text" 
                  name="hospital" 
                  value={formData.hospital} 
                  onChange={handleInputChange} 
                  placeholder="Enter hospital name"
                />
              </div>
              
              <div className="form-group">
                <label>{t.address}</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Enter address"
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? <FaSpinner className="spinner" /> : <FaSave />} 
                {saving ? t.saving : t.saveChanges}
              </button>
            </form>
          </div>

          {/* Right: Change Password */}
          <div className="settings-card password-card">
            <div className="card-header">
              <FaLock /> <h3>{t.changePassword}</h3>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>{t.currentPassword}</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPasswords.current ? "text" : "password"} 
                    name="currentPassword" 
                    value={passwordData.currentPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>{t.newPassword}</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPasswords.new ? "text" : "password"} 
                    name="newPassword" 
                    value={passwordData.newPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPasswords.confirm ? "text" : "password"} 
                    name="confirmPassword" 
                    value={passwordData.confirmPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    placeholder="Confirm new password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="submit-btn" disabled={isChangingPassword}>
                {isChangingPassword ? <FaSpinner className="spinner" /> : <FaLock />} 
                {isChangingPassword ? "Updating..." : t.updatePassword}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSettings;