// DoctorConsultation.js - Only API Integration Changed

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/DoctorConsultation.css";
import { 
  FaMoon, FaSun, FaUserMd, FaStar, FaMapMarkerAlt,
  FaClock, FaVideo, FaPhone, FaCalendarAlt, FaFilter,
  FaPlus, FaPhoneAlt, FaMapMarkerAlt as FaMapPin, FaTimes,
  FaChevronLeft, FaStethoscope, FaAward,
  FaGraduationCap, FaLanguage, FaHeartbeat, FaSignInAlt,
  FaUserPlus, FaLock, FaHospital, FaCheckCircle,
  FaBuilding, FaSearch,
  FaStarHalfAlt, FaSpinner, FaExclamationTriangle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function DoctorConsultation() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [specialties, setSpecialties] = useState([]);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingDoctorId, setPendingDoctorId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedMode, setSelectedMode] = useState("clinic");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookingReason, setBookingReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [authError, setAuthError] = useState("");

  // ============================================
  // SIMPLE AUTH CHECK
  // ============================================
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  // Load doctors from API
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Loading doctors from API...");
        
        const response = await fetch(`${API_BASE_URL}/doctor/public`);
        const data = await response.json();
        
        console.log("API Response:", data);
        
        if (data.success) {
          const doctorList = data.doctors || [];
          setDoctors(doctorList);
          setFilteredDoctors(doctorList);
          
          const uniqueSpecialties = [...new Set(doctorList.map(d => d.specialization))];
          setSpecialties(uniqueSpecialties);
          
          console.log("Loaded", doctorList.length, "doctors");
        } else {
          setError(data.message || "Failed to load doctors");
          console.error("Error loading doctors:", data.message);
        }
      } catch (error) {
        console.error("Error loading doctors:", error);
        setError("Cannot connect to server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  // Filter doctors
  useEffect(() => {
    let filtered = doctors;
    
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(d => d.specialization === selectedSpecialty);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.firstName?.toLowerCase().includes(term) ||
        d.lastName?.toLowerCase().includes(term) ||
        d.specialization?.toLowerCase().includes(term) ||
        d.hospital?.toLowerCase().includes(term)
      );
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate time slots
  useEffect(() => {
    if (!selectedDate || selectedMode !== "clinic") {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
      return;
    }

    const slots = generateAvailableSlots(selectedDate);
    setAvailableTimeSlots(slots);
    setSelectedTimeSlot(null);
  }, [selectedDate, selectedMode, selectedDoctor]);

  const generateAvailableSlots = (date) => {
    if (!selectedDoctor) return [];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    
    const daySlots = selectedDoctor.availability?.[dayName] || [];
    
    if (daySlots.length === 0) {
      return ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    }
    
    return daySlots;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isDateAvailable = (date) => {
    if (!selectedDoctor || selectedMode !== "clinic") return true;
    return true;
  };

  const handleDoctorSelect = (doctor) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setPendingDoctorId(doctor._id);
      setShowAuthModal(true);
      return;
    }

    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedMode("clinic");
    setAvailableTimeSlots([]);
    setBookingReason("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookClick = () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setPendingDoctorId(selectedDoctor._id);
      setShowAuthModal(true);
      return;
    }

    setShowBookingModal(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  // ============================================
  // BOOK APPOINTMENT - API INTEGRATION (CHANGED ONLY THIS PART)
  // ============================================
  const handleBookAppointment = async () => {
    if (!selectedDate) {
      alert(lang === 'en' ? 'Please select a date' : 'দয়া করে একটি তারিখ নির্বাচন করুন');
      return;
    }
    
    if (selectedMode === "clinic" && !selectedTimeSlot) {
      alert(lang === 'en' ? 'Please select a time slot' : 'দয়া করে একটি সময় স্লট নির্বাচন করুন');
      return;
    }

    setIsBooking(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setShowBookingModal(false);
        setShowAuthModal(true);
        setAuthError("You need to login first");
        setIsBooking(false);
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const appointmentData = {
        doctorId: selectedDoctor._id,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        appointmentDate: formattedDate,
        timeSlot: selectedTimeSlot || "Flexible",
        reason: bookingReason || "General Consultation",
        consultationMode: selectedMode
      };

      console.log("Booking appointment:", appointmentData);

      // Create Appointment - UPDATED API ENDPOINT
      const appointmentResponse = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const appointmentResult = await appointmentResponse.json();

      if (!appointmentResult.success) {
        // Handle auth errors
        if (appointmentResult.message === "User not found" || 
            appointmentResult.message?.includes("token") || 
            appointmentResult.message?.includes("auth") ||
            appointmentResult.message?.includes("login") ||
            appointmentResult.message?.includes("session")) {
          
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setShowBookingModal(false);
          setShowAuthModal(true);
          setAuthError(appointmentResult.message || "Your session has expired. Please login again.");
          setIsBooking(false);
          return;
        }
        
        throw new Error(appointmentResult.message || "Failed to book appointment");
      }

      // Get the appointment from response
      const newAppointment = appointmentResult.appointment || appointmentResult.data;
      console.log("Appointment created:", newAppointment);

      // Show success message
      setShowBookingModal(false);
      setBookingDetails({
        bookingId: newAppointment._id || `QC${Date.now()}`,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        appointmentDate: formattedDate,
        timeSlot: selectedTimeSlot || "Flexible",
        date: formattedDate
      });
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // ============================================
  // NAVIGATE TO LOGIN/REGISTER
  // ============================================
  const goToLogin = () => {
    setShowAuthModal(false);
    setAuthError("");
    navigate("/login", { 
      state: { 
        from: location.pathname,
        pendingDoctorId: pendingDoctorId 
      } 
    });
  };

  const goToRegister = () => {
    setShowAuthModal(false);
    setAuthError("");
    navigate("/register", { 
      state: { 
        from: location.pathname,
        pendingDoctorId: pendingDoctorId 
      } 
    });
  };

  // Emergency functions
  const findHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`, "_blank");
        },
        () => {
          window.open("https://www.google.com/maps/search/hospitals+near+dhaka", "_blank");
        }
      );
    } else {
      window.open("https://www.google.com/maps/search/hospitals+near+dhaka", "_blank");
    }
    setShowEmergencyModal(false);
  };

  const callEmergency = () => {
    window.location.href = "tel:999";
    setShowEmergencyModal(false);
  };

  const formatCurrency = (amount) => {
    return lang === 'en' ? `৳${amount}` : `${amount} টাকা`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star half" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
    }
    return stars;
  };

  const consultationModes = [
    { id: "clinic", name: { en: "Clinic Visit", bn: "ক্লিনিকে ভিজিট" }, icon: <FaHospital /> },
    { id: "video", name: { en: "Video Call", bn: "ভিডিও কল" }, icon: <FaVideo /> },
    { id: "audio", name: { en: "Audio Call", bn: "অডিও কল" }, icon: <FaPhone /> },
    { id: "chat", name: { en: "Live Chat", bn: "লাইভ চ্যাট" }, icon: <FaClock /> }
  ];

  const text = {
    en: {
      title: "Doctor Consultation",
      subtitle: "Connect with verified healthcare professionals for online or in-person consultations",
      searchPlaceholder: "Search by doctor name, specialty, or hospital...",
      filterSpecialty: "Filter by Specialty",
      allSpecialties: "All Specialties",
      noDoctors: "No doctors found matching your criteria",
      loadingDoctors: "Loading doctors...",
      loadError: "Failed to load doctors. Please try again.",
      tryAgain: "Try Again",
      viewProfile: "View Profile",
      bookConsultation: "Book Consultation",
      backToList: "Back to list",
      education: "Education",
      experience: "Experience",
      languages: "Languages",
      about: "About",
      consultationMode: "Consultation Mode",
      clinicVisit: "Clinic Visit",
      videoCall: "Video Call",
      audioCall: "Audio Call",
      liveChat: "Live Chat",
      fee: "Consultation Fee",
      years: "years",
      reviews: "reviews",
      bookAppointment: "Book Appointment",
      selectDate: "Select Date",
      selectTime: "Select Time Slot",
      bookingSummary: "Booking Summary",
      confirmBooking: "Confirm Booking",
      appointmentConfirmed: "Appointment Confirmed!",
      bookingSuccess: "Your appointment has been successfully booked.",
      bookingId: "Booking ID",
      dateTime: "Date & Time",
      authRequired: "Authentication Required",
      authMessage: "You need to be logged in to view doctor details and book consultations.",
      sessionExpired: "Your session has expired. Please login again.",
      login: "Login",
      createAccount: "Create Account",
      cancel: "Cancel",
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "Emergency button activated. Please choose an action:",
      emergencyCall: "Call 999",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      reason: "Reason for Visit",
      processing: "Processing..."
    },
    bn: {
      title: "ডাক্তার পরামর্শ",
      subtitle: "বাংলাদেশের যাচাইকৃত স্বাস্থ্যসেবা পেশাদারদের সাথে অনলাইন বা ব্যক্তিগত পরামর্শের জন্য সংযুক্ত হন",
      searchPlaceholder: "ডাক্তারের নাম, বিশেষত্ব বা হাসপাতাল দিয়ে খুঁজুন...",
      filterSpecialty: "বিশেষত্ব অনুযায়ী ফিল্টার",
      allSpecialties: "সব বিশেষত্ব",
      noDoctors: "আপনার মানদণ্ডের সাথে মিলে এমন কোনো ডাক্তার পাওয়া যায়নি",
      loadingDoctors: "ডাক্তার লোড হচ্ছে...",
      loadError: "ডাক্তার লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      tryAgain: "আবার চেষ্টা করুন",
      viewProfile: "প্রোফাইল দেখুন",
      bookConsultation: "পরামর্শ বুক করুন",
      backToList: "তালিকায় ফিরে যান",
      education: "শিক্ষা",
      experience: "অভিজ্ঞতা",
      languages: "ভাষা",
      about: "সম্পর্কে",
      consultationMode: "পরামর্শের মাধ্যম",
      clinicVisit: "ক্লিনিকে ভিজিট",
      videoCall: "ভিডিও কল",
      audioCall: "অডিও কল",
      liveChat: "লাইভ চ্যাট",
      fee: "পরামর্শ ফি",
      years: "বছর",
      reviews: "রিভিউ",
      bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
      selectDate: "তারিখ নির্বাচন করুন",
      selectTime: "সময় স্লট নির্বাচন করুন",
      bookingSummary: "বুকিং সারাংশ",
      confirmBooking: "বুকিং নিশ্চিত করুন",
      appointmentConfirmed: "অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে!",
      bookingSuccess: "আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে।",
      bookingId: "বুকিং আইডি",
      dateTime: "তারিখ ও সময়",
      authRequired: "প্রমাণীকরণ প্রয়োজন",
      authMessage: "ডাক্তারের বিবরণ দেখতে এবং পরামর্শ বুক করতে আপনার লগ ইন করা প্রয়োজন।",
      sessionExpired: "আপনার সেশন শেষ হয়েছে। দয়া করে আবার লগইন করুন।",
      login: "লগইন",
      createAccount: "অ্যাকাউন্ট তৈরি করুন",
      cancel: "বাতিল করুন",
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "জরুরী বাটন সক্রিয় করা হয়েছে। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "৯৯৯ এ কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল করুন",
      reason: "পরিদর্শনের কারণ",
      processing: "প্রক্রিয়াকরণ..."
    }
  };

  const currentText = text[lang];

  // ============================================
  // AUTH MODAL
  // ============================================
  const AuthModal = () => (
    <div className="auth-modal" onClick={() => setShowAuthModal(false)}>
      <div className="auth-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h3><FaLock /> {currentText.authRequired}</h3>
          <button className="close-modal" onClick={() => setShowAuthModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="auth-body">
          {authError && (
            <div className="auth-error" style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid #ff1744',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ff1744'
            }}>
              <FaExclamationTriangle />
              <span>{authError}</span>
            </div>
          )}
          
          <p>{authError || currentText.authMessage}</p>
          
          <div className="auth-options">
            <button className="auth-login-btn" onClick={goToLogin}>
              <FaSignInAlt /> {currentText.login}
            </button>
            <button className="auth-register-btn" onClick={goToRegister}>
              <FaUserPlus /> {currentText.createAccount}
            </button>
          </div>
          
          <button className="auth-cancel-btn" onClick={() => {
            setShowAuthModal(false);
            setAuthError("");
          }}>
            {currentText.cancel}
          </button>
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className={`doctor-consultation-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>{currentText.loadingDoctors}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`doctor-consultation-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{lang === 'en' ? 'Home' : 'হোম'}</Link></li>
            <li><Link to="/about">{lang === 'en' ? 'About' : 'আমাদের সম্পর্কে'}</Link></li>
            <li><Link to="/contact">{lang === 'en' ? 'Contact' : 'যোগাযোগ'}</Link></li>
            <li><Link to="/DoctorConsultation" className="active">{lang === 'en' ? 'Consultation' : 'পরামর্শ'}</Link></li>
          </ul>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? (lang === 'en' ? 'Light Mode' : 'লাইট মোড') : (lang === 'en' ? 'Dark Mode' : 'ডার্ক মোড')}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="consultation-main">
        <div className="consultation-container">
          <div className="consultation-header">
            <h1 className="consultation-title">{currentText.title}</h1>
            <p className="consultation-subtitle">{currentText.subtitle}</p>
          </div>

          {!selectedDoctor && (
            <div className="search-filter-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={currentText.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-box">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{currentText.allSpecialties}</option>
                  {specialties.map((specialty, index) => (
                    <option key={index} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && !selectedDoctor && (
            <div className="error-container">
              <p>{currentText.loadError}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                {currentText.tryAgain}
              </button>
            </div>
          )}

          {selectedDoctor ? (
            <div className="doctor-detail">
              <button className="back-btn" onClick={() => setSelectedDoctor(null)}>
                <FaChevronLeft /> {currentText.backToList}
              </button>
              
              <div className="doctor-detail-card">
                <div className="doctor-detail-header">
                  <div className="doctor-detail-avatar">
                    <FaUserMd className="avatar-icon" />
                  </div>
                  <div className="doctor-detail-info">
                    <h2>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2>
                    <p className="doctor-specialty">
                      <FaStethoscope /> {selectedDoctor.specialization}
                    </p>
                    <div className="doctor-rating">
                      {renderStars(selectedDoctor.rating || 4.5)}
                      <span className="rating-value">{selectedDoctor.rating || 4.5}</span>
                      <span className="reviews">({selectedDoctor.reviews || 0} {currentText.reviews})</span>
                    </div>
                    <p className="doctor-fee">
                      {currentText.fee}: <span>{formatCurrency(selectedDoctor.consultationFee || 500)}</span>
                    </p>
                    {selectedDoctor.hospital && (
                      <p className="doctor-hospital">
                        <FaHospital /> {selectedDoctor.hospital}
                      </p>
                    )}
                  </div>
                </div>

                <div className="doctor-detail-body">
                  <div className="detail-section">
                    <h3><FaGraduationCap /> {currentText.education}</h3>
                    <p>{selectedDoctor.qualification || "Not specified"}</p>
                  </div>

                  <div className="detail-section">
                    <h3><FaAward /> {currentText.experience}</h3>
                    <p>{selectedDoctor.experience || 0} {currentText.years}</p>
                  </div>

                  <div className="detail-section">
                    <h3><FaLanguage /> {currentText.languages}</h3>
                    <div className="languages-list">
                      {(selectedDoctor.languages || ["English", "Bengali"]).map((language, index) => (
                        <span key={index} className="language-tag">{language}</span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3><FaHeartbeat /> {currentText.about}</h3>
                    <p>{selectedDoctor.bio || "Experienced healthcare professional dedicated to providing quality medical care."}</p>
                  </div>

                  <div className="detail-section">
                    <h3><FaVideo /> {currentText.consultationMode}</h3>
                    <div className="consultation-modes">
                      {consultationModes.map(mode => (
                        <div 
                          key={mode.id}
                          className={`mode-tag ${selectedMode === mode.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedMode(mode.id);
                            setSelectedDate(null);
                            setSelectedTimeSlot(null);
                            setAvailableTimeSlots([]);
                          }}
                        >
                          {mode.icon}
                          <span>{mode.name[lang]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="doctor-detail-footer">
                  <button className="book-consultation-btn" onClick={handleBookClick}>
                    <FaCalendarAlt />
                    {currentText.bookConsultation}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="doctors-grid">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <div 
                    key={doctor._id} 
                    className="doctor-card"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="doctor-card-header">
                      <div className="doctor-avatar">
                        <FaUserMd />
                      </div>
                      <div className="doctor-card-info">
                        <h3 className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</h3>
                        <p className="doctor-specialty">
                          <FaStethoscope /> {doctor.specialization}
                        </p>
                        <div className="doctor-rating">
                          {renderStars(doctor.rating || 4.5)}
                          <span className="rating-value">{doctor.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="doctor-card-body">
                      <p className="doctor-experience">
                        <FaClock /> {doctor.experience || 0} {currentText.years}
                      </p>
                      <p className="doctor-fee">
                        {currentText.fee}: <span>{formatCurrency(doctor.consultationFee || 500)}</span>
                      </p>
                      {doctor.hospital && (
                        <p className="doctor-hospital">
                          <FaHospital /> {doctor.hospital}
                        </p>
                      )}
                    </div>

                    <div className="doctor-card-footer">
                      <button className="view-profile-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorSelect(doctor);
                      }}>
                        {currentText.viewProfile}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-doctors">
                  <p>{currentText.noDoctors}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal - No Payment */}
      {showBookingModal && selectedDoctor && (
        <div className="booking-modal" onClick={() => setShowBookingModal(false)}>
          <div className="booking-content" onClick={(e) => e.stopPropagation()}>
            <div className="booking-header">
              <h3><FaCalendarAlt /> {currentText.bookAppointment}</h3>
              <button className="close-modal" onClick={() => setShowBookingModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="booking-doctor-info">
              <div className="booking-avatar">
                <FaUserMd />
              </div>
              <div>
                <h4>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h4>
                <p>{selectedDoctor.specialization}</p>
                <p className="booking-mode">
                  <FaHospital /> {currentText.clinicVisit}
                </p>
              </div>
            </div>

            <div className="booking-form">
              <div className="form-group">
                <label>{currentText.selectDate}</label>
                <div className="date-slots">
                  {generateDates().map((date, index) => {
                    const available = isDateAvailable(date);
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    return (
                      <div 
                        key={index}
                        className={`date-slot ${isSelected ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                        onClick={() => available && handleDateSelect(date)}
                        style={{ cursor: available ? 'pointer' : 'not-allowed' }}
                      >
                        <div className="date-day">{date.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short' })}</div>
                        <div className="date-num">{date.getDate()}</div>
                        <div className="date-month">{date.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { month: 'short' })}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDate && selectedMode === "clinic" && (
                <div className="form-group">
                  <label>{currentText.selectTime}</label>
                  <div className="time-slots">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot, index) => (
                        <div 
                          key={index}
                          className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotSelect(slot)}
                          style={{ cursor: 'pointer' }}
                        >
                          {slot}
                        </div>
                      ))
                    ) : (
                      <div className="no-slots-message">
                        {lang === 'en' ? 'No time slots available for this date' : 'এই তারিখের জন্য কোনো সময় স্লট পাওয়া যায়নি'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>{currentText.reason}</label>
                <input 
                  type="text"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder={lang === 'en' ? "Enter reason for visit..." : "পরিদর্শনের কারণ লিখুন..."}
                  className="form-input"
                />
              </div>

              <div className="booking-summary">
                <h4>{currentText.bookingSummary}</h4>
                <div className="summary-item">
                  <span>{currentText.fee}:</span>
                  <span>{formatCurrency(selectedDoctor.consultationFee || 500)}</span>
                </div>
              </div>

              <button 
                className="confirm-booking-btn"
                onClick={handleBookAppointment}
                disabled={!selectedDate || (selectedMode === "clinic" && !selectedTimeSlot) || isBooking}
              >
                {isBooking ? (
                  <>
                    <FaSpinner className="spinner" />
                    {currentText.processing}
                  </>
                ) : (
                  currentText.confirmBooking
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && bookingDetails && (
        <div className="success-modal">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h3>{currentText.appointmentConfirmed}</h3>
            <p>{currentText.bookingSuccess}</p>
            <div className="success-details">
              <p><strong>{currentText.bookingId}:</strong> {bookingDetails.bookingId}</p>
              <p><strong>{lang === 'en' ? 'Doctor' : 'ডাক্তার'}:</strong> {bookingDetails.doctorName}</p>
              <p><strong>{currentText.dateTime}:</strong> {bookingDetails.appointmentDate} {bookingDetails.timeSlot && bookingDetails.timeSlot !== "Flexible" ? `at ${bookingDetails.timeSlot}` : ''}</p>
            </div>
            <button 
              className="close-success-btn"
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedDoctor(null);
              }}
            >
              {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && <AuthModal />}

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={() => setShowEmergencyModal(true)}>
        <FaPlus />
      </button>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3><FaPhoneAlt /> {currentText.emergencyTitle}</h3>
            <p>{currentText.emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={callEmergency}>
                <FaPhoneAlt /> {currentText.emergencyCall}
              </button>
              <button className="btn-call" onClick={findHospital}>
                <FaMapMarkerAlt /> {currentText.emergencyHospital}
              </button>
              <button className="btn-cancel" onClick={() => setShowEmergencyModal(false)}>
                <FaTimes /> {currentText.emergencyCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* Footer */}
      <footer>
        <p>{lang === 'en' ? '© 2025 QuickCure Hub Bangladesh. All rights reserved.' : '© ২০২৫ কুইককিউর হাব বাংলাদেশ। সমস্ত অধিকার সংরক্ষিত।'}</p>
        <p className="tagline">{lang === 'en' ? 'Empowering Health Through Technology' : 'প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন'}</p>
      </footer>
    </div>
  );
}

export default DoctorConsultation;