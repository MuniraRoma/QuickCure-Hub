// Login.js - Complete with Doctor Approval Status Handling & Name Fix + Token Fix + Dynamic API URL

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { 
  FaMoon, FaSun, FaSignInAlt, 
  FaGoogle, FaFacebookF, FaRobot, FaUserMd, FaHeartbeat, 
  FaShieldAlt, FaPlus, FaPhoneAlt, FaMapMarkerAlt, FaTimes,
  FaEye, FaEyeSlash, FaUserCog, FaUserCircle, FaChevronDown,
  FaClock, FaTimesCircle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

// =============================================
// ✅ DYNAMIC API BASE URL - Localhost & Network IP both work
// =============================================

// ✅ Browser এর current URL থেকে Base URL বের করুন
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = "5000"; // Backend port
  const baseUrl = `http://${hostname}:${port}/api`;
  console.log("🌐 Login Detected API_BASE_URL:", baseUrl);
  return baseUrl;
};

// ✅ API_BASE_URL সেট করুন - .env না থাকলে dynamic URL ব্যবহার করবে
const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

console.log("🌐 Login Final API_BASE_URL:", API_BASE_URL);

function Login() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Approval Status States
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        const userRole = localStorage.getItem("userRole");
        
        if (token && isAuthenticated && userRole) {
          if (userRole === "admin") {
            navigate("/admin");
          } else if (userRole === "doctor") {
            navigate("/doctor-dashboard");
          } else if (userRole === "user") {
            navigate("/UserProfile");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [navigate]);

  if (!authChecked) {
    return null;
  }

  const text = {
    en: {
      home: "Home",
      about: "About",
      contact: "Contact",
      login: "Login",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      title: "Welcome Back",
      subtitle: "Sign in to access your health dashboard and AI diagnosis tools",
      email: "Email Address",
      emailPlaceholder: "your@email.com",
      emailError: "Please enter a valid email address",
      password: "Password",
      passwordPlaceholder: "••••••••",
      passwordError: "Password must be at least 6 characters",
      remember: "Remember me",
      forgot: "Forgot password?",
      signin: "Sign In",
      signingIn: "Signing In...",
      or: "Or continue with",
      google: "Google",
      facebook: "Facebook",
      noAccount: "Don't have an account?",
      signup: "Sign up here",
      selectRole: "Login as:",
      userRole: "User",
      doctorRole: "Doctor",
      adminRole: "Admin",
      featuresTitle: "Why Join QuickCure Hub?",
      aiTitle: "AI-Powered Diagnostics",
      aiDesc: "Get instant health insights with our advanced AI algorithms",
      doctorsTitle: "Expert Doctors",
      doctorsDesc: "Connect with verified healthcare professionals",
      trackerTitle: "Health Tracking",
      trackerDesc: "Monitor your health progress with detailed analytics",
      securityTitle: "Secure & Private",
      securityDesc: "Your health data is protected with military-grade encryption",
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "You've activated the emergency button. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology",
      validationError: "Please fill in all required fields correctly",
      loginSuccess: "Login successful! Redirecting to your dashboard...",
      socialLogin: "login would be implemented in a production environment",
      invalidCredentials: "Invalid email or password. Please try again.",
      loginError: "Login failed. Please try again.",
      networkError: "Network error. Please check your connection and try again.",
      selectRoleMessage: "Please select your role before logging in",
      serverError: "Server error. Please check backend logs.",
      pendingTitle: "⏳ Account Pending Approval",
      pendingMessage: "Your doctor account is waiting for admin approval.",
      pendingSubMessage: "You will receive an email notification once your account is approved.",
      pendingContact: "If you have any questions, please contact the admin.",
      rejectedTitle: "❌ Account Rejected",
      rejectedMessage: "Your doctor registration has been rejected by the admin.",
      rejectedSubMessage: "Please contact the admin for more information.",
      rejectionReason: "Rejection Reason",
      goToRegister: "Register Again",
      contactAdmin: "Contact Admin",
      close: "Close"
    },
    bn: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      login: "লগইন",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      title: "আপনাকে স্বাগতম",
      subtitle: "আপনার স্বাস্থ্য ড্যাশবোর্ড এবং এআই রোগ নির্ণয় সরঞ্জামগুলি অ্যাক্সেস করতে সাইন ইন করুন",
      email: "ইমেল ঠিকানা",
      emailPlaceholder: "your@email.com",
      emailError: "দয়া করে একটি বৈধ ইমেল ঠিকানা লিখুন",
      password: "পাসওয়ার্ড",
      passwordPlaceholder: "••••••••",
      passwordError: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর দীর্ঘ হতে হবে",
      remember: "আমাকে মনে রাখুন",
      forgot: "পাসওয়ার্ড ভুলে গেছেন?",
      signin: "সাইন ইন করুন",
      signingIn: "সাইন ইন করা হচ্ছে...",
      or: "অথবা এর সাথে চালিয়ে যান",
      google: "গুগল",
      facebook: "ফেসবুক",
      noAccount: "একটি অ্যাকাউন্ট নেই?",
      signup: "এখানে সাইন আপ করুন",
      selectRole: "লগইন হিসাবে:",
      userRole: "ব্যবহারকারী",
      doctorRole: "ডাক্তার",
      adminRole: "অ্যাডমিন",
      featuresTitle: "কুইককিউর হাবে কেন যোগ দেবেন?",
      aiTitle: "এআই-চালিত রোগ নির্ণয়",
      aiDesc: "আমাদের উন্নত এআই অ্যালগরিদম দিয়ে তাত্ক্ষণিক স্বাস্থ্য অন্তর্দৃষ্টি পান",
      doctorsTitle: "বিশেষজ্ঞ ডাক্তার",
      doctorsDesc: "যাচাইকৃত স্বাস্থ্যসেবা পেশাদারদের সাথে সংযোগ স্থাপন করুন",
      trackerTitle: "স্বাস্থ্য ট্র্যাকিং",
      trackerDesc: "বিস্তারিত বিশ্লেষণ সহ আপনার স্বাস্থ্যের অগ্রগতি নিরীক্ষণ করুন",
      securityTitle: "নিরাপদ এবং ব্যক্তিগত",
      securityDesc: "আপনার স্বাস্থ্য ডেটা মিলিটারি-গ্রেড এনক্রিপশন দিয়ে সুরক্ষিত",
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "আপনি জরুরী বাটন সক্রিয় করেছেন। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল করুন",
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন",
      validationError: "দয়া করে সমস্ত প্রয়োজনীয় ক্ষেত্র সঠিকভাবে পূরণ করুন",
      loginSuccess: "লগইন সফল! আপনার ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...",
      socialLogin: "লগইন একটি প্রোডাকশন পরিবেশে বাস্তবায়ন করা হবে",
      invalidCredentials: "ভুল ইমেল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।",
      loginError: "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      networkError: "নেটওয়ার্ক সমস্যা। আপনার সংযোগ চেক করে আবার চেষ্টা করুন।",
      selectRoleMessage: "লগইন করার আগে আপনার ভূমিকা নির্বাচন করুন",
      serverError: "সার্ভার ত্রুটি। ব্যাকএন্ড লগ চেক করুন।",
      pendingTitle: "⏳ অ্যাকাউন্ট অনুমোদনের অপেক্ষায়",
      pendingMessage: "আপনার ডাক্তার অ্যাকাউন্টটি অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে।",
      pendingSubMessage: "আপনার অ্যাকাউন্ট অনুমোদিত হলে আপনি একটি ইমেল বিজ্ঞপ্তি পাবেন।",
      pendingContact: "যদি আপনার কোন প্রশ্ন থাকে, দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      rejectedTitle: "❌ অ্যাকাউন্ট প্রত্যাখ্যান করা হয়েছে",
      rejectedMessage: "আপনার ডাক্তার নিবন্ধন অ্যাডমিন দ্বারা প্রত্যাখ্যান করা হয়েছে।",
      rejectedSubMessage: "আরও তথ্যের জন্য দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      rejectionReason: "প্রত্যাখ্যানের কারণ",
      goToRegister: "আবার নিবন্ধন করুন",
      contactAdmin: "অ্যাডমিনের সাথে যোগাযোগ করুন",
      close: "বন্ধ করুন"
    }
  };

  const features = [
    {
      icon: <FaRobot />,
      title: text[lang].aiTitle,
      description: text[lang].aiDesc
    },
    {
      icon: <FaUserMd />,
      title: text[lang].doctorsTitle,
      description: text[lang].doctorsDesc
    },
    {
      icon: <FaHeartbeat />,
      title: text[lang].trackerTitle,
      description: text[lang].trackerDesc
    },
    {
      icon: <FaShieldAlt />,
      title: text[lang].securityTitle,
      description: text[lang].securityDesc
    }
  ];

  const roleOptions = [
    { value: "user", label: text[lang].userRole, icon: <FaUserCircle /> },
    { value: "doctor", label: text[lang].doctorRole, icon: <FaUserMd /> },
    { value: "admin", label: text[lang].adminRole, icon: <FaUserCog /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
    setLoginError("");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = text[lang].emailError;
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = text[lang].emailError;
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = text[lang].passwordError;
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = text[lang].passwordError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getSelectedRoleIcon = () => {
    const role = roleOptions.find(r => r.value === selectedRole);
    return role ? role.icon : <FaUserCircle />;
  };

  const getSelectedRoleLabel = () => {
    const role = roleOptions.find(r => r.value === selectedRole);
    return role ? role.label : text[lang].userRole;
  };

  // ========================
  // 🔥 MAIN LOGIN HANDLER WITH TOKEN FIX
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setShowApprovalModal(false);
    setApprovalStatus(null);
    setApprovalMessage("");
    setRejectionReason("");

    if (!validateForm()) {
      alert(text[lang].validationError);
      return;
    }

    setIsLoading(true);

    try {
      let endpoint = "";
      if (selectedRole === "user") {
        endpoint = `${API_BASE_URL}/user/login`;
      } else if (selectedRole === "doctor") {
        endpoint = `${API_BASE_URL}/doctor/login`;
      } else if (selectedRole === "admin") {
        endpoint = `${API_BASE_URL}/admin/login`;
      } else {
        alert(text[lang].selectRoleMessage);
        setIsLoading(false);
        return;
      }

      console.log("📤 Sending login request to:", endpoint);
      console.log("📤 Email:", formData.email);
      console.log("📤 Role:", selectedRole);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseText = await response.text();
      console.log("📥 Raw Response (first 200 chars):", responseText.substring(0, 200));

      if (responseText.trim().startsWith('<!DOCTYPE') || 
          responseText.trim().startsWith('<html') ||
          responseText.trim().startsWith('<?xml')) {
        console.error("❌ Server returned HTML instead of JSON");
        setLoginError("⚠️ Server error. Please check backend logs.");
        alert("⚠️ Server error. Please check if backend is running properly.");
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        setLoginError("⚠️ Invalid response from server");
        alert("⚠️ Invalid response from server. Please check backend.");
        setIsLoading(false);
        return;
      }

      console.log("📥 Response status:", response.status);
      console.log("📥 Parsed Response:", data);

      // =============================================
      // ✅ CHECK FOR APPROVAL STATUS ERRORS
      // =============================================
      if (!response.ok) {
        if (data.approvalStatus === "Pending") {
          setApprovalStatus("pending");
          setApprovalMessage(data.message || text[lang].pendingMessage);
          setShowApprovalModal(true);
          setLoginError("");
          setIsLoading(false);
          return;
        }
        
        if (data.approvalStatus === "Rejected") {
          setApprovalStatus("rejected");
          setApprovalMessage(data.message || text[lang].rejectedMessage);
          setRejectionReason(data.rejectionReason || data.message || "No reason provided");
          setShowApprovalModal(true);
          setLoginError("");
          setIsLoading(false);
          return;
        }

        if (data.accountStatus === "Blocked") {
          setLoginError("🚫 Your account has been blocked by admin.");
          alert("🚫 Your account has been blocked by admin.");
          setIsLoading(false);
          return;
        }

        if (data.accountStatus === "Suspended") {
          setLoginError("⏸️ Your account has been suspended. Please contact admin.");
          alert("⏸️ Your account has been suspended. Please contact admin.");
          setIsLoading(false);
          return;
        }

        const errorMsg = data.message || data.error || text[lang].loginError;
        setLoginError(errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      // =============================================
      // ✅ LOGIN SUCCESSFUL - TOKEN FIX (IMPROVED)
      // =============================================
      console.log("✅ Login successful!");
      console.log("📥 Full Response:", JSON.stringify(data, null, 2));

      // ✅ Find token from multiple possible sources
      let token = null;
      let tokenSource = "";

      // Check all possible token locations
      if (data.accessToken) {
        token = data.accessToken;
        tokenSource = "accessToken";
      } else if (data.token) {
        token = data.token;
        tokenSource = "token";
      } else if (data.data && data.data.token) {
        token = data.data.token;
        tokenSource = "data.token";
      } else if (data.data && data.data.accessToken) {
        token = data.data.accessToken;
        tokenSource = "data.accessToken";
      } else if (data.user && data.user.token) {
        token = data.user.token;
        tokenSource = "user.token";
      } else if (data.doctor && data.doctor.token) {
        token = data.doctor.token;
        tokenSource = "doctor.token";
      } else if (data.admin && data.admin.token) {
        token = data.admin.token;
        tokenSource = "admin.token";
      } else {
        // Last resort: check if response itself is a token
        if (typeof data === 'string' && data.length > 20) {
          token = data;
          tokenSource = "response body";
        }
      }

      if (token) {
        const cleanToken = token.trim();
        localStorage.setItem("token", cleanToken);
        console.log(`🔑 Token stored from ${tokenSource}`);
        console.log("🔑 Token length:", cleanToken.length);
        console.log("🔑 Token preview:", cleanToken.substring(0, 30) + "...");
      } else {
        console.error("❌ No token found in response!");
        console.log("📥 Response keys:", Object.keys(data));
        console.log("📥 Full response:", JSON.stringify(data, null, 2));
        alert("Login failed: No token received from server. Please check backend.");
        setIsLoading(false);
        return;
      }

      // ✅ Verify token was stored
      const savedToken = localStorage.getItem("token");
      console.log("✅ Token verification - Saved:", savedToken ? "Yes" : "No");
      console.log("✅ Saved token length:", savedToken?.length);
      console.log("✅ Saved token preview:", savedToken?.substring(0, 30) + "...");

      if (!savedToken || savedToken.length < 10) {
        console.error("❌ Token not saved properly!");
        alert("Login failed: Token not saved");
        setIsLoading(false);
        return;
      }

      // ✅ Store refresh token if available
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken.trim());
      }

      // ✅ Store authentication status
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", selectedRole);
      localStorage.setItem("userEmail", formData.email);

      // ✅ Store user data correctly
      const userData = data.user || data.doctor || data.admin || data;

      if (userData) {
        localStorage.setItem("currentUser", JSON.stringify(userData));
        
        let userName = "";
        
        if (selectedRole === "doctor") {
          userName = userData.fullName || 
                     userData.name ||
                     `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
                     userData.doctorName ||
                     userData.email?.split('@')[0] ||
                     "Doctor";
          
          if (userName === "undefined" || userName === "null" || userName === "") {
            userName = "Doctor";
          }
          
          userName = userName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          console.log("✅ Doctor Name extracted:", userName);
          
          localStorage.setItem("doctorName", userName);
          localStorage.setItem("doctorId", userData.id || userData._id || "");
          localStorage.setItem("doctorSpecialty", userData.specialization || userData.specialty || "General Medicine");
          localStorage.setItem("doctorEmail", userData.email || formData.email);
          localStorage.setItem("doctorPhone", userData.phone || "");
          localStorage.setItem("doctorHospital", userData.hospital || "");
          localStorage.setItem("doctorFee", userData.consultationFee || userData.fee || "");
          localStorage.setItem("doctorExperience", userData.experience || "");
          localStorage.setItem("doctorGender", userData.gender || "");
          localStorage.setItem("doctorBirthDate", userData.birthDate || "");
          localStorage.setItem("doctorBio", userData.bio || "");
          localStorage.setItem("doctorAddress", userData.address || "");
          localStorage.setItem("doctorUniversity", userData.university || "");
          localStorage.setItem("doctorGraduationYear", userData.graduationYear || "");
          localStorage.setItem("doctorAvailableDays", JSON.stringify(userData.availableDays || []));
          localStorage.setItem("doctorAvailableFrom", userData.availableFrom || "09:00");
          localStorage.setItem("doctorAvailableTo", userData.availableTo || "17:00");
          localStorage.setItem("doctorLanguages", JSON.stringify(userData.languages || []));
          localStorage.setItem("doctorIsApproved", userData.isApproved || false);
          localStorage.setItem("doctorApprovalStatus", userData.approvalStatus || "Pending");
          
          const doctorDataToStore = {
            ...userData,
            fullName: userName,
            name: userName,
            displayName: userName
          };
          localStorage.setItem("doctorData", JSON.stringify(doctorDataToStore));
          localStorage.setItem("userName", userName);
          localStorage.setItem("userFullName", userName);
          localStorage.setItem("userEmail", userData.email || formData.email);
          
          console.log("✅ Doctor Data Stored Successfully!");
          console.log("📋 Doctor Name:", userName);
          console.log("📋 Doctor Email:", userData.email || formData.email);
          console.log("📋 Doctor Specialty:", userData.specialization || userData.specialty);
          
        } else if (selectedRole === "user") {
          userName = userData.fullName || 
                     userData.name ||
                     `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
                     userData.email?.split('@')[0] ||
                     "User";
          
          localStorage.setItem("userName", userName);
          localStorage.setItem("userFullName", userName);
          localStorage.setItem("userId", userData.id || userData._id);
          localStorage.setItem("userEmail", userData.email || formData.email);
          
        } else if (selectedRole === "admin") {
          userName = userData.fullName || 
                     userData.name ||
                     `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
                     userData.email?.split('@')[0] ||
                     "Admin";
          
          localStorage.setItem("admin_name", userName);
          localStorage.setItem("admin_email", userData.email || formData.email);
          localStorage.setItem("admin_logged_in", "true");
          localStorage.setItem("admin_data", JSON.stringify({ 
            name: userName, 
            email: userData.email || formData.email
          }));
          localStorage.setItem("userName", userName);
        }
      }

      alert(text[lang].loginSuccess);

      setTimeout(() => {
        if (selectedRole === "admin") {
          navigate("/admin");
        } else if (selectedRole === "doctor") {
          navigate("/doctor-dashboard");
        } else if (selectedRole === "user") {
          navigate("/UserProfile");
        } else {
          navigate("/");
        }
      }, 500);

    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMsg = text[lang].networkError || text[lang].loginError;
      if (error.message === "Failed to fetch") {
        errorMsg = "⚠️ Cannot connect to server. Please make sure backend is running on port 5000";
      } else {
        errorMsg = error.message || text[lang].loginError;
      }
      
      setLoginError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} ${text[lang].socialLogin}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const findHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`, "_blank");
        },
        () => {
          window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
        }
      );
    } else {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    }
    setShowEmergencyModal(false);
  };

  const callEmergency = () => {
    window.location.href = "tel:999";
    setShowEmergencyModal(false);
  };

  return (
    <div className={`login-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{text[lang].home}</Link></li>
            <li><Link to="/about">{text[lang].about}</Link></li>
            <li><Link to="/contact">{text[lang].contact}</Link></li>
            <li><Link to="/login" className="active">{text[lang].login}</Link></li>
          </ul>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? text[lang].lightMode : text[lang].darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </nav>

      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">{text[lang].title}</h1>
              <p className="login-subtitle">{text[lang].subtitle}</p>
            </div>

            {loginError && (
              <div className="login-error-message">
                {loginError}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">{text[lang].email}</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={text[lang].emailPlaceholder}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{text[lang].password}</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={text[lang].passwordPlaceholder}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="role-dropdown-container">
                <label className="role-label">{text[lang].selectRole}</label>
                <div 
                  className={`role-dropdown-box ${isRoleDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                >
                  <div className="selected-role">
                    <span className="role-icon-small">{getSelectedRoleIcon()}</span>
                    <span className="role-text">@{getSelectedRoleLabel()}</span>
                  </div>
                  <FaChevronDown className={`dropdown-arrow ${isRoleDropdownOpen ? 'rotated' : ''}`} />
                </div>
                
                {isRoleDropdownOpen && (
                  <div className="role-dropdown-options">
                    {roleOptions.map(option => (
                      <div
                        key={option.value}
                        className={`role-option ${selectedRole === option.value ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRole(option.value);
                          setIsRoleDropdownOpen(false);
                          setLoginError("");
                        }}
                      >
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-label">@{option.label}</span>
                        {selectedRole === option.value && <span className="check-mark">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{text[lang].remember}</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  {text[lang].forgot}
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                <FaSignInAlt />
                <span>{isLoading ? text[lang].signingIn : text[lang].signin}</span>
              </button>

              <div className="divider">
                <span>{text[lang].or}</span>
              </div>

              <div className="social-login">
                <button
                  type="button"
                  className="social-btn google"
                  onClick={() => handleSocialLogin("Google")}
                >
                  <FaGoogle />
                  <span>{text[lang].google}</span>
                </button>
                <button
                  type="button"
                  className="social-btn facebook"
                  onClick={() => handleSocialLogin("Facebook")}
                >
                  <FaFacebookF />
                  <span>{text[lang].facebook}</span>
                </button>
              </div>

              <div className="signup-link">
                <span>{text[lang].noAccount}</span>
                <Link to="/register">{text[lang].signup}</Link>
              </div>
            </form>
          </div>

          <div className="features-section">
            <h2 className="features-title">{text[lang].featuresTitle}</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ============================================= */}
      {/* ✅ APPROVAL STATUS MODAL */}
      {/* ============================================= */}
      {showApprovalModal && (
        <div className="approval-modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
            {approvalStatus === "pending" ? (
              <>
                <div className="approval-icon pending">
                  <FaClock />
                </div>
                <h3 className="approval-title pending">{text[lang].pendingTitle}</h3>
                <p className="approval-message">{approvalMessage || text[lang].pendingMessage}</p>
                <p className="approval-sub-message">{text[lang].pendingSubMessage}</p>
                <p className="approval-contact">{text[lang].pendingContact}</p>
                <div className="approval-actions">
                  <button 
                    className="approval-btn primary"
                    onClick={() => {
                      setShowApprovalModal(false);
                      navigate("/register");
                    }}
                  >
                    {text[lang].goToRegister}
                  </button>
                  <button 
                    className="approval-btn secondary"
                    onClick={() => setShowApprovalModal(false)}
                  >
                    {text[lang].close}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="approval-icon rejected">
                  <FaTimesCircle />
                </div>
                <h3 className="approval-title rejected">{text[lang].rejectedTitle}</h3>
                <p className="approval-message">{approvalMessage || text[lang].rejectedMessage}</p>
                {rejectionReason && (
                  <p className="approval-reason">
                    <strong>{text[lang].rejectionReason}:</strong> {rejectionReason}
                  </p>
                )}
                <p className="approval-sub-message">{text[lang].rejectedSubMessage}</p>
                <div className="approval-actions">
                  <button 
                    className="approval-btn primary"
                    onClick={() => {
                      setShowApprovalModal(false);
                      navigate("/register");
                    }}
                  >
                    {text[lang].goToRegister}
                  </button>
                  <button 
                    className="approval-btn danger"
                    onClick={() => {
                      setShowApprovalModal(false);
                      window.location.href = "mailto:admin@quickcurehub.com";
                    }}
                  >
                    {text[lang].contactAdmin}
                  </button>
                  <button 
                    className="approval-btn secondary"
                    onClick={() => setShowApprovalModal(false)}
                  >
                    {text[lang].close}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button className="emergency-btn" onClick={() => setShowEmergencyModal(true)}>
        <FaPlus />
      </button>

      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaPhoneAlt />
              {text[lang].emergencyTitle}
            </h3>
            <p>{text[lang].emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={callEmergency}>
                <FaPhoneAlt />
                {text[lang].emergencyCall}
              </button>
              <button className="btn-call" onClick={findHospital}>
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

      <footer>
        <p>{text[lang].copyright}</p>
        <p className="tagline">{text[lang].tagline}</p>
      </footer>
    </div>
  );
}

export default Login;