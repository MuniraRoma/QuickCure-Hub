// Register.js - Complete Backend Integration

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { 
  FaMoon, FaSun, FaUser, FaEnvelope, FaPhone, FaLock, 
  FaCalendar, FaVenusMars, FaUserPlus, FaGoogle, FaFacebookF,
  FaBrain, FaChartLine, FaUserMd, FaShieldAlt, FaPlus,
  FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaEye, FaEyeSlash,
  FaChevronDown, FaUserCircle, FaUserCog, FaStethoscope,
  FaCheckCircle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Register() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: ""
  });
  
  const [doctorData, setDoctorData] = useState({
    specialty: "",
    license: "",
    experience: "",
    qualification: "",
    university: "",
    graduationYear: "",
    hospital: "",
    consultationFee: "",
    availableDays: [],
    availableFrom: "09:00",
    availableTo: "17:00",
    bio: "",
    languages: []
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("user");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  // ✅ New States for Registration Status
  const [registrationStatus, setRegistrationStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "bengali", label: "Bengali" },
    { value: "hindi", label: "Hindi" },
    { value: "arabic", label: "Arabic" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" }
  ];

  const specialtyOptions = [
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "dermatology", label: "Dermatology" },
    { value: "gynecology", label: "Gynecology" },
    { value: "psychiatry", label: "Psychiatry" },
    { value: "ophthalmology", label: "Ophthalmology" },
    { value: "ent", label: "ENT" },
    { value: "dentistry", label: "Dentistry" },
    { value: "general", label: "General Medicine" },
    { value: "other", label: "Other" }
  ];

  const text = {
    en: {
      home: "Home",
      about: "About",
      contact: "Contact",
      login: "Login",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      title: "Create Account",
      subtitle: "Join QuickCure Hub to access AI-powered health diagnosis",
      step1: "Personal",
      step2: "Health",
      step3: "Account",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      emailPlaceholder: "your@email.com",
      phone: "Phone Number",
      password: "Password",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirm Password",
      birthDate: "Date of Birth",
      gender: "Gender",
      selectGender: "Select Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      preferNot: "Prefer not to say",
      agree: "I agree to the",
      terms: "Terms of Service",
      and: "and",
      privacy: "Privacy Policy",
      create: "Sign Up",
      creating: "Creating Account...",
      or: "Or sign up with",
      google: "Google",
      facebook: "Facebook",
      haveAccount: "Already have an account?",
      loginHere: "Login here",
      selectRole: "Register as:",
      userRole: "User",
      doctorRole: "Doctor",
      adminRole: "Admin",
      specialty: "Specialty",
      selectSpecialty: "Select Specialty",
      license: "Medical License Number",
      licensePlaceholder: "e.g., BMC-12345",
      experience: "Years of Experience",
      experiencePlaceholder: "e.g., 5",
      qualification: "Qualification",
      qualificationPlaceholder: "e.g., MBBS, MD",
      university: "Medical University",
      universityPlaceholder: "e.g., Dhaka Medical College",
      graduationYear: "Graduation Year",
      hospital: "Current Hospital/Clinic",
      hospitalPlaceholder: "e.g., City Hospital",
      consultationFee: "Consultation Fee (BDT)",
      feePlaceholder: "e.g., 500",
      availableDays: "Available Days",
      availableFrom: "Available From",
      availableTo: "Available To",
      bio: "Professional Bio",
      bioPlaceholder: "Tell patients about yourself...",
      languages: "Languages Spoken",
      benefitsTitle: "Why Join QuickCure Hub?",
      aiTitle: "AI Health Assistant",
      aiDesc: "Get instant symptom analysis and health recommendations",
      trackingTitle: "Health Tracking",
      trackingDesc: "Monitor your health metrics and progress over time",
      doctorsTitle: "Doctor Connect",
      doctorsDesc: "Connect with verified healthcare professionals",
      privacyTitle: "Data Privacy",
      privacyDesc: "Your health information is secure and confidential",
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "You've activated the emergency button. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology",
      required: "This field is required",
      passwordMatch: "Passwords do not match",
      passwordLength: "Password must be at least 8 characters long",
      termsRequired: "You must agree to the terms and conditions",
      emailInvalid: "Please enter a valid email address",
      phoneInvalid: "Please enter a valid phone number",
      success: "Registration successful!",
      emailExists: "This email is already registered.",
      registrationError: "Registration failed. Please try again.",
      networkError: "Cannot connect to server.",
      // ✅ New Messages
      pendingTitle: "Registration Pending!",
      pendingMessage: "Your registration has been submitted successfully. Please wait for admin approval.",
      pendingSubMessage: "You will receive an email once your account is approved.",
      goToLogin: "Go to Login",
      registrationComplete: "Account Created Successfully!",
      welcomeMessage: "Welcome to QuickCure Hub.",
      redirecting: "Redirecting to login page..."
    },
    bn: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      login: "লগইন",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      title: "অ্যাকাউন্ট তৈরি করুন",
      subtitle: "এআই-চালিত স্বাস্থ্য রোগ নির্ণয় অ্যাক্সেস করতে কুইককিউর হাবে যোগ দিন",
      step1: "ব্যক্তিগত",
      step2: "স্বাস্থ্য",
      step3: "অ্যাকাউন্ট",
      firstName: "নামের প্রথম অংশ",
      lastName: "নামের শেষ অংশ",
      email: "ইমেল ঠিকানা",
      emailPlaceholder: "your@email.com",
      phone: "ফোন নম্বর",
      password: "পাসওয়ার্ড",
      passwordPlaceholder: "••••••••",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      birthDate: "জন্ম তারিখ",
      gender: "লিঙ্গ",
      selectGender: "লিঙ্গ নির্বাচন করুন",
      male: "পুরুষ",
      female: "মহিলা",
      other: "অন্যান্য",
      preferNot: "বলতে পছন্দ করি না",
      agree: "আমি সম্মত হচ্ছি",
      terms: "সেবার শর্তাবলী",
      and: "এবং",
      privacy: "গোপনীয়তা নীতি",
      create: "অ্যাকাউন্ট তৈরি করুন",
      creating: "অ্যাকাউন্ট তৈরি হচ্ছে...",
      or: "অথবা দিয়ে সাইন আপ করুন",
      google: "গুগল",
      facebook: "ফেসবুক",
      haveAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
      loginHere: "এখানে লগইন করুন",
      selectRole: "নিবন্ধন হিসাবে:",
      userRole: "ব্যবহারকারী",
      doctorRole: "ডাক্তার",
      adminRole: "অ্যাডমিন",
      specialty: "বিশেষত্ব",
      selectSpecialty: "বিশেষত্ব নির্বাচন করুন",
      license: "মেডিকেল লাইসেন্স নম্বর",
      licensePlaceholder: "যেমন, BMC-12345",
      experience: "অভিজ্ঞতার বছর",
      experiencePlaceholder: "যেমন, ৫",
      qualification: "যোগ্যতা",
      qualificationPlaceholder: "যেমন, MBBS, MD",
      university: "মেডিকেল বিশ্ববিদ্যালয়",
      universityPlaceholder: "যেমন, ঢাকা মেডিকেল কলেজ",
      graduationYear: "পাসের বছর",
      hospital: "বর্তমান হাসপাতাল/ক্লিনিক",
      hospitalPlaceholder: "যেমন, সিটি হাসপাতাল",
      consultationFee: "পরামর্শ ফি (বিডিটি)",
      feePlaceholder: "যেমন, ৫০০",
      availableDays: "সাপ্তাহিক ছুটির দিন",
      availableFrom: "উপলব্ধ থেকে",
      availableTo: "উপলব্ধ পর্যন্ত",
      bio: "পেশাগত জীবনবৃত্তান্ত",
      bioPlaceholder: "আপনার সম্পর্কে রোগীদের বলুন...",
      languages: "ভাষা",
      benefitsTitle: "কুইককিউর হাবে কেন যোগ দেবেন?",
      aiTitle: "এআই স্বাস্থ্য সহকারী",
      aiDesc: "তাৎক্ষণিক লক্ষণ বিশ্লেষণ এবং স্বাস্থ্য সুপারিশ পান",
      trackingTitle: "স্বাস্থ্য ট্র্যাকিং",
      trackingDesc: "সময়ের সাথে সাথে আপনার স্বাস্থ্য মেট্রিক্স এবং অগ্রগতি নিরীক্ষণ করুন",
      doctorsTitle: "ডাক্তার সংযোগ",
      doctorsDesc: "যাচাইকৃত স্বাস্থ্যসেবা পেশাদারদের সাথে সংযোগ স্থাপন করুন",
      privacyTitle: "ডেটা গোপনীয়তা",
      privacyDesc: "আপনার স্বাস্থ্য তথ্য সুরক্ষিত এবং গোপনীয়",
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "আপনি জরুরী বাটন সক্রিয় করেছেন। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল",
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন",
      required: "এই ক্ষেত্রটি প্রয়োজনীয়",
      passwordMatch: "পাসওয়ার্ড মেলে না",
      passwordLength: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর দীর্ঘ হতে হবে",
      termsRequired: "আপনাকে শর্তাবলী এবং নিয়মাবলী মেনে নিতে হবে",
      emailInvalid: "দয়া করে একটি বৈধ ইমেল ঠিকানা লিখুন",
      phoneInvalid: "দয়া করে একটি বৈধ ফোন নম্বর লিখুন",
      success: "নিবন্ধন সফল!",
      emailExists: "এই ইমেলটি ইতিমধ্যে নিবন্ধিত।",
      registrationError: "নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      networkError: "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।",
      // ✅ New Messages
      pendingTitle: "নিবন্ধন pending!",
      pendingMessage: "আপনার নিবন্ধন সফলভাবে জমা দেওয়া হয়েছে। দয়া করে অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।",
      pendingSubMessage: "আপনার অ্যাকাউন্ট অনুমোদিত হলে আপনি একটি ইমেল পাবেন।",
      goToLogin: "লগইন পৃষ্ঠায় যান",
      registrationComplete: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      welcomeMessage: "কুইককিউর হাবে স্বাগতম।",
      redirecting: "লগইন পৃষ্ঠায় রিডাইরেক্ট করা হচ্ছে..."
    }
  };

  const benefits = [
    { icon: <FaBrain />, title: text[lang].aiTitle, description: text[lang].aiDesc },
    { icon: <FaChartLine />, title: text[lang].trackingTitle, description: text[lang].trackingDesc },
    { icon: <FaUserMd />, title: text[lang].doctorsTitle, description: text[lang].doctorsDesc },
    { icon: <FaShieldAlt />, title: text[lang].privacyTitle, description: text[lang].privacyDesc }
  ];

  const roleOptions = [
    { value: "user", label: text[lang].userRole, icon: <FaUserCircle /> },
    { value: "doctor", label: text[lang].doctorRole, icon: <FaUserMd /> },
    { value: "admin", label: text[lang].adminRole, icon: <FaUserCog /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDoctorChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'availableDays') {
      setDoctorData(prev => ({
        ...prev,
        availableDays: checked 
          ? [...prev.availableDays, value]
          : prev.availableDays.filter(day => day !== value)
      }));
    } else if (type === 'checkbox' && name === 'languages') {
      setDoctorData(prev => ({
        ...prev,
        languages: checked 
          ? [...prev.languages, value]
          : prev.languages.filter(lang => lang !== value)
      }));
    } else {
      setDoctorData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[\d\s\+\-\(\)]{10,}$/.test(phone);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = text[lang].required;
    if (!formData.lastName.trim()) newErrors.lastName = text[lang].required;
    if (!formData.email.trim()) newErrors.email = text[lang].required;
    else if (!validateEmail(formData.email)) newErrors.email = text[lang].emailInvalid;
    if (!formData.phone.trim()) newErrors.phone = text[lang].required;
    else if (!validatePhone(formData.phone)) newErrors.phone = text[lang].phoneInvalid;
    if (!formData.password) newErrors.password = text[lang].required;
    else if (formData.password.length < 8) newErrors.password = text[lang].passwordLength;
    if (!formData.confirmPassword) newErrors.confirmPassword = text[lang].required;
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = text[lang].passwordMatch;
    if (!formData.birthDate) newErrors.birthDate = text[lang].required;
    if (!formData.gender) newErrors.gender = text[lang].required;

    if (selectedRole === "doctor") {
      if (!doctorData.specialty) newErrors.specialty = text[lang].required;
      if (!doctorData.license.trim()) newErrors.license = text[lang].required;
      if (!doctorData.experience) newErrors.experience = text[lang].required;
      if (!doctorData.qualification.trim()) newErrors.qualification = text[lang].required;
      if (!doctorData.university.trim()) newErrors.university = text[lang].required;
      if (!doctorData.graduationYear) newErrors.graduationYear = text[lang].required;
      if (doctorData.availableDays.length === 0) newErrors.availableDays = text[lang].required;
      if (doctorData.languages.length === 0) newErrors.languages = text[lang].required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  // 🔥 REGISTRATION HANDLER
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    if (!termsAccepted) {
      alert(text[lang].termsRequired);
      return;
    }

    setIsLoading(true);
    setRegistrationStatus(null);
    setRegistrationMessage("");

    try {
      let endpoint = "";
      let payload = {};

      if (selectedRole === "user") {
        endpoint = `${API_BASE_URL}/user/register`;
        payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          gender: formData.gender,
          birthDate: formData.birthDate
        };
      } else if (selectedRole === "doctor") {
        endpoint = `${API_BASE_URL}/doctor/register`;
        payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          gender: formData.gender,
          birthDate: formData.birthDate,
          specialization: doctorData.specialty,
          qualification: doctorData.qualification.trim(),
          experience: parseInt(doctorData.experience) || 0,
          hospital: doctorData.hospital.trim(),
          licenseNumber: doctorData.license.trim(),
          consultationFee: parseFloat(doctorData.consultationFee) || 0,
          university: doctorData.university.trim(),
          graduationYear: parseInt(doctorData.graduationYear) || 0,
          availableDays: doctorData.availableDays,
          availableFrom: doctorData.availableFrom,
          availableTo: doctorData.availableTo,
          languages: doctorData.languages,
          bio: doctorData.bio.trim()
        };
      } else if (selectedRole === "admin") {
        endpoint = `${API_BASE_URL}/admin/register`;
        payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          gender: formData.gender,
          birthDate: formData.birthDate
        };
      }

      console.log("📤 Sending to:", endpoint);
      console.log("📤 Payload:", payload);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (!response.ok) {
        let errorMsg = data.message || text[lang].registrationError;
        if (response.status === 400 && errorMsg.includes("email")) {
          errorMsg = text[lang].emailExists;
        }
        setRegistrationMessage(errorMsg);
        alert(`❌ ${errorMsg}`);
        setIsLoading(false);
        return;
      }

      // ✅ Registration Successful
      setApiResponse(data);
      setRegistrationSuccess(true);

      // ✅ Check if Doctor - Show Pending Status
      if (selectedRole === "doctor" && data.doctor) {
        setRegistrationStatus("pending");
        setRegistrationMessage(text[lang].pendingMessage);
        
        // ✅ Doctor Registration Pending - Show Modal
        alert(`✅ ${text[lang].pendingTitle}\n\n${text[lang].pendingMessage}\n\n${text[lang].pendingSubMessage}`);
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        // User or Admin - Direct Success
        setRegistrationStatus("approved");
        setRegistrationMessage(text[lang].success);
        alert(`✅ ${text[lang].registrationComplete}\n\n${text[lang].welcomeMessage}\n\n${text[lang].redirecting}`);
        
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }

    } catch (error) {
      console.error("❌ Registration error:", error);
      let errorMsg = text[lang].networkError;
      if (error.message === "Failed to fetch") {
        errorMsg = "⚠️ Cannot connect to server. Please make sure backend is running on port 5000";
      }
      setRegistrationMessage(errorMsg);
      alert(`⚠️ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    alert(`${provider} ${text[lang].social || "registration would be implemented in a production environment"}`);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Find nearby hospitals
  const findHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`, "_blank");
        },
        () => window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank")
      );
    } else {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    }
  };

  const callEmergency = () => {
    window.location.href = "tel:999";
  };

  const steps = [
    { number: 1, label: text[lang].step1 },
    { number: 2, label: text[lang].step2 },
    { number: 3, label: text[lang].step3 }
  ];

  return (
    <div className={`register-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      <div className="background-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
      <div className={`theme-overlay ${darkMode ? 'dark-overlay' : 'light-overlay'}`}></div>

      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{text[lang].home}</Link></li>
            <li><Link to="/about">{text[lang].about}</Link></li>
            <li><Link to="/contact">{text[lang].contact}</Link></li>
            <li><Link to="/login">{text[lang].login}</Link></li>
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

      <main className="register-main">
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <h1 className="register-title">{text[lang].title}</h1>
              <p className="register-subtitle">{text[lang].subtitle}</p>
            </div>

            {/* ✅ Doctor Pending Status Message */}
            {registrationStatus === "pending" && (
              <div className="pending-message" style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                border: '1px solid #ffc107'
              }}>
                <FaCheckCircle style={{ fontSize: '48px', color: '#ffc107', marginBottom: '10px' }} />
                <h3>⏳ {text[lang].pendingTitle}</h3>
                <p>{text[lang].pendingMessage}</p>
                <p style={{ fontSize: '14px', marginTop: '10px', color: '#6c757d' }}>
                  {text[lang].pendingSubMessage}
                </p>
                <Link to="/login" className="login-link-btn" style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  padding: '10px 30px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  borderRadius: '5px',
                  textDecoration: 'none'
                }}>
                  {text[lang].goToLogin}
                </Link>
              </div>
            )}

            {/* ✅ Success Message */}
            {registrationSuccess && registrationStatus !== "pending" && (
              <div className="success-message" style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                border: '1px solid #c3e6cb'
              }}>
                <FaCheckCircle style={{ fontSize: '48px', color: '#28a745', marginBottom: '10px' }} />
                <h3>✅ {text[lang].registrationComplete}</h3>
                <p>{text[lang].welcomeMessage}</p>
                <p style={{ fontSize: '14px', marginTop: '10px', color: '#6c757d' }}>
                  {text[lang].redirecting}
                </p>
              </div>
            )}

            {/* Show form only if not pending */}
            {registrationStatus !== "pending" && !registrationSuccess && (
              <>
                <div className="progress-indicator">
                  {steps.map((step) => (
                    <div key={step.number} className={`progress-step ${currentStep === step.number ? 'active' : ''}`}>
                      <div className="step-number">{step.number}</div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  ))}
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                  {currentStep === 1 && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="firstName">{text[lang].firstName}</label>
                          <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder="John" disabled={isLoading} />
                          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName">{text[lang].lastName}</label>
                          <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder="Doe" disabled={isLoading} />
                          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">{text[lang].email}</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder={text[lang].emailPlaceholder} className={`form-input ${errors.email ? 'error' : ''}`} disabled={isLoading} />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">{text[lang].phone}</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="01712345678" disabled={isLoading} />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="password">{text[lang].password}</label>
                          <div className="input-wrapper">
                            <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} placeholder={text[lang].passwordPlaceholder} className={`form-input ${errors.password ? 'error' : ''}`} disabled={isLoading} />
                            <button type="button" className="password-toggle" onClick={togglePasswordVisibility} disabled={isLoading}>
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                          <label htmlFor="confirmPassword">{text[lang].confirmPassword}</label>
                          <div className="input-wrapper">
                            <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={text[lang].passwordPlaceholder} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} disabled={isLoading} />
                            <button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility} disabled={isLoading}>
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                      </div>

                      <div className="role-dropdown-container">
                        <label className="role-label">{text[lang].selectRole}</label>
                        <div className={`role-dropdown-box ${isRoleDropdownOpen ? 'open' : ''}`} onClick={() => !isLoading && setIsRoleDropdownOpen(!isRoleDropdownOpen)}>
                          <div className="selected-role">
                            <span className="role-icon-small">{getSelectedRoleIcon()}</span>
                            <span className="role-text">@{getSelectedRoleLabel()}</span>
                          </div>
                          <FaChevronDown className={`dropdown-arrow ${isRoleDropdownOpen ? 'rotated' : ''}`} />
                        </div>
                        {isRoleDropdownOpen && !isLoading && (
                          <div className="role-dropdown-options">
                            {roleOptions.map(option => (
                              <div key={option.value} className={`role-option ${selectedRole === option.value ? 'active' : ''}`} onClick={() => { setSelectedRole(option.value); setIsRoleDropdownOpen(false); }}>
                                <span className="option-icon">{option.icon}</span>
                                <span className="option-label">@{option.label}</span>
                                {selectedRole === option.value && <span className="check-mark">✓</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div className="form-group">
                        <label htmlFor="birthDate">{text[lang].birthDate}</label>
                        <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`form-input ${errors.birthDate ? 'error' : ''}`} disabled={isLoading} />
                        {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="gender">{text[lang].gender}</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`form-input ${errors.gender ? 'error' : ''}`} disabled={isLoading}>
                          <option value="">{text[lang].selectGender}</option>
                          <option value="male">{text[lang].male}</option>
                          <option value="female">{text[lang].female}</option>
                          <option value="other">{text[lang].other}</option>
                          <option value="preferNot">{text[lang].preferNot}</option>
                        </select>
                        {errors.gender && <span className="error-message">{errors.gender}</span>}
                      </div>

                      {selectedRole === "doctor" && (
                        <div className="doctor-fields">
                          <h3 className="section-subtitle">Professional Information</h3>
                          
                          <div className="form-group">
                            <label htmlFor="specialty">{text[lang].specialty}</label>
                            <select id="specialty" name="specialty" value={doctorData.specialty} onChange={handleDoctorChange} className={`form-input ${errors.specialty ? 'error' : ''}`} disabled={isLoading}>
                              <option value="">{text[lang].selectSpecialty}</option>
                              {specialtyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            {errors.specialty && <span className="error-message">{errors.specialty}</span>}
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="license">{text[lang].license}</label>
                              <input type="text" id="license" name="license" value={doctorData.license} onChange={handleDoctorChange} placeholder={text[lang].licensePlaceholder} className={`form-input ${errors.license ? 'error' : ''}`} disabled={isLoading} />
                              {errors.license && <span className="error-message">{errors.license}</span>}
                            </div>
                            <div className="form-group">
                              <label htmlFor="experience">{text[lang].experience}</label>
                              <input type="number" id="experience" name="experience" value={doctorData.experience} onChange={handleDoctorChange} placeholder={text[lang].experiencePlaceholder} className={`form-input ${errors.experience ? 'error' : ''}`} min="0" max="60" disabled={isLoading} />
                              {errors.experience && <span className="error-message">{errors.experience}</span>}
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="qualification">{text[lang].qualification}</label>
                              <input type="text" id="qualification" name="qualification" value={doctorData.qualification} onChange={handleDoctorChange} placeholder={text[lang].qualificationPlaceholder} className={`form-input ${errors.qualification ? 'error' : ''}`} disabled={isLoading} />
                              {errors.qualification && <span className="error-message">{errors.qualification}</span>}
                            </div>
                            <div className="form-group">
                              <label htmlFor="university">{text[lang].university}</label>
                              <input type="text" id="university" name="university" value={doctorData.university} onChange={handleDoctorChange} placeholder={text[lang].universityPlaceholder} className={`form-input ${errors.university ? 'error' : ''}`} disabled={isLoading} />
                              {errors.university && <span className="error-message">{errors.university}</span>}
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="graduationYear">{text[lang].graduationYear}</label>
                              <input type="number" id="graduationYear" name="graduationYear" value={doctorData.graduationYear} onChange={handleDoctorChange} placeholder="2020" min="1950" max={new Date().getFullYear()} className={`form-input ${errors.graduationYear ? 'error' : ''}`} disabled={isLoading} />
                              {errors.graduationYear && <span className="error-message">{errors.graduationYear}</span>}
                            </div>
                            <div className="form-group">
                              <label htmlFor="hospital">{text[lang].hospital}</label>
                              <input type="text" id="hospital" name="hospital" value={doctorData.hospital} onChange={handleDoctorChange} placeholder={text[lang].hospitalPlaceholder} className={`form-input ${errors.hospital ? 'error' : ''}`} disabled={isLoading} />
                              {errors.hospital && <span className="error-message">{errors.hospital}</span>}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="consultationFee">{text[lang].consultationFee}</label>
                            <input type="number" id="consultationFee" name="consultationFee" value={doctorData.consultationFee} onChange={handleDoctorChange} placeholder={text[lang].feePlaceholder} min="0" className={`form-input ${errors.consultationFee ? 'error' : ''}`} disabled={isLoading} />
                            {errors.consultationFee && <span className="error-message">{errors.consultationFee}</span>}
                          </div>

                          <div className="form-group">
                            <label>{text[lang].availableDays}</label>
                            <div className="checkbox-group">
                              {weekDays.map(day => (
                                <label key={day.value} className="checkbox-item">
                                  <input type="checkbox" name="availableDays" value={day.value} checked={doctorData.availableDays.includes(day.value)} onChange={handleDoctorChange} disabled={isLoading} />
                                  <span>{day.label}</span>
                                </label>
                              ))}
                            </div>
                            {errors.availableDays && <span className="error-message">{errors.availableDays}</span>}
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="availableFrom">{text[lang].availableFrom}</label>
                              <input type="time" id="availableFrom" name="availableFrom" value={doctorData.availableFrom} onChange={handleDoctorChange} className="form-input" disabled={isLoading} />
                            </div>
                            <div className="form-group">
                              <label htmlFor="availableTo">{text[lang].availableTo}</label>
                              <input type="time" id="availableTo" name="availableTo" value={doctorData.availableTo} onChange={handleDoctorChange} className="form-input" disabled={isLoading} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>{text[lang].languages}</label>
                            <div className="checkbox-group">
                              {languageOptions.map(lang => (
                                <label key={lang.value} className="checkbox-item">
                                  <input type="checkbox" name="languages" value={lang.value} checked={doctorData.languages.includes(lang.value)} onChange={handleDoctorChange} disabled={isLoading} />
                                  <span>{lang.label}</span>
                                </label>
                              ))}
                            </div>
                            {errors.languages && <span className="error-message">{errors.languages}</span>}
                          </div>

                          <div className="form-group">
                            <label htmlFor="bio">{text[lang].bio}</label>
                            <textarea id="bio" name="bio" value={doctorData.bio} onChange={handleDoctorChange} placeholder={text[lang].bioPlaceholder} rows="4" className="form-input" disabled={isLoading} />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div className="terms-section">
                        <h3>Terms and Conditions</h3>
                        <div className="terms-content">
                          <p>By creating an account, you agree to:</p>
                          <ul>
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account</li>
                            <li>Accept our privacy policy and data handling practices</li>
                            <li>Use the service for lawful purposes only</li>
                          </ul>
                        </div>
                      </div>

                      <div className="form-options">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={isLoading} />
                          <span>
                            {text[lang].agree}{" "}
                            <Link to="/terms" className="terms-link">{text[lang].terms}</Link>{" "}
                            {text[lang].and}{" "}
                            <Link to="/privacy" className="terms-link">{text[lang].privacy}</Link>
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="form-navigation">
                    {currentStep > 1 && (
                      <button type="button" className="nav-btn prev-btn" onClick={() => setCurrentStep(currentStep - 1)} disabled={isLoading}>
                        Previous
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button type="button" className="nav-btn next-btn" onClick={() => {
                        // Step validation
                        if (currentStep === 1) {
                          const step1Errors = {};
                          if (!formData.firstName.trim()) step1Errors.firstName = text[lang].required;
                          if (!formData.lastName.trim()) step1Errors.lastName = text[lang].required;
                          if (!formData.email.trim()) step1Errors.email = text[lang].required;
                          else if (!validateEmail(formData.email)) step1Errors.email = text[lang].emailInvalid;
                          if (!formData.phone.trim()) step1Errors.phone = text[lang].required;
                          if (!formData.password) step1Errors.password = text[lang].required;
                          else if (formData.password.length < 8) step1Errors.password = text[lang].passwordLength;
                          if (!formData.confirmPassword) step1Errors.confirmPassword = text[lang].required;
                          else if (formData.password !== formData.confirmPassword) step1Errors.confirmPassword = text[lang].passwordMatch;
                          if (Object.keys(step1Errors).length > 0) {
                            setErrors(step1Errors);
                            alert("Please fill in all required fields in Step 1 correctly.");
                            return;
                          }
                        }
                        if (currentStep === 2) {
                          const step2Errors = {};
                          if (!formData.birthDate) step2Errors.birthDate = text[lang].required;
                          if (!formData.gender) step2Errors.gender = text[lang].required;
                          if (selectedRole === "doctor") {
                            if (!doctorData.specialty) step2Errors.specialty = text[lang].required;
                            if (!doctorData.license.trim()) step2Errors.license = text[lang].required;
                            if (!doctorData.experience) step2Errors.experience = text[lang].required;
                            if (!doctorData.qualification.trim()) step2Errors.qualification = text[lang].required;
                            if (!doctorData.university.trim()) step2Errors.university = text[lang].required;
                            if (!doctorData.graduationYear) step2Errors.graduationYear = text[lang].required;
                            if (doctorData.availableDays.length === 0) step2Errors.availableDays = text[lang].required;
                            if (doctorData.languages.length === 0) step2Errors.languages = text[lang].required;
                          }
                          if (Object.keys(step2Errors).length > 0) {
                            setErrors(step2Errors);
                            alert("Please fill in all required fields in Step 2.");
                            return;
                          }
                        }
                        setCurrentStep(currentStep + 1);
                      }} disabled={isLoading}>
                        Next
                      </button>
                    ) : (
                      <button type="submit" className="submit-btn" disabled={isLoading}>
                        <FaUserPlus />
                        <span>{isLoading ? text[lang].creating : text[lang].create}</span>
                      </button>
                    )}
                  </div>

                  <div className="divider"><span>{text[lang].or}</span></div>

                  <div className="social-register">
                    <button type="button" className="social-btn google" onClick={() => handleSocialRegister("Google")} disabled={isLoading}>
                      <FaGoogle /><span>{text[lang].google}</span>
                    </button>
                    <button type="button" className="social-btn facebook" onClick={() => handleSocialRegister("Facebook")} disabled={isLoading}>
                      <FaFacebookF /><span>{text[lang].facebook}</span>
                    </button>
                  </div>

                  <div className="login-link">
                    <span>{text[lang].haveAccount}</span>
                    <Link to="/login">{text[lang].loginHere}</Link>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Benefits Section */}
          {registrationStatus !== "pending" && !registrationSuccess && (
            <div className="benefits-section">
              <h2 className="benefits-title">{text[lang].benefitsTitle}</h2>
              <div className="benefits-grid">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-card">
                    <div className="benefit-icon">{benefit.icon}</div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <button className="emergency-btn" onClick={() => {}}>
        <FaPlus />
      </button>

      <footer>
        <p>{text[lang].copyright}</p>
        <p className="tagline">{text[lang].tagline}</p>
      </footer>
    </div>
  );
}

export default Register;