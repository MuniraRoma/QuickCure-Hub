import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import { 
  FaMoon, FaSun, FaFirstAid, FaUserMd, 
  FaHeartbeat, FaStethoscope, FaUsers, FaClock, FaPlus, FaArrowRight,
  FaBook, FaNotesMedical, FaAmbulance, FaShieldAlt, FaRobot,
  FaUserCircle, FaSignOutAlt
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

function HomePage() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    diagnoses: 0,
    doctors: 0,
    users: 0,
    responseTime: 0
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const authenticated = localStorage.getItem("isAuthenticated") === "true";
      const userEmail = localStorage.getItem("userEmail");
      
      if (authenticated && userEmail) {
        // Get user data from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const currentUser = registeredUsers.find(user => user.email === userEmail);
        
        if (currentUser) {
          setIsLoggedIn(true);
          setUserName(currentUser.fullName || currentUser.firstName || "User");
        } else {
          // Fallback: check for registeredUser
          const registeredUser = JSON.parse(localStorage.getItem("registeredUser") || "null");
          if (registeredUser && registeredUser.email === userEmail) {
            setIsLoggedIn(true);
            setUserName(registeredUser.fullName || registeredUser.firstName || "User");
          } else {
            setIsLoggedIn(false);
            setUserName("");
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkLoginStatus();
    
    // Add event listener for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Translation object
  const text = {
    en: {
      // Navbar
      home: "Home",
      about: "About",
      contact: "Contact",
      login: "Login",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      logout: "Logout",
      profile: "Profile",
      
      // Hero section
      heroTitle: "QuickCure Hub",
      heroSubtitle: "Your trusted partner for AI-powered health diagnosis, first aid guidance, and expert medical consultation.",
      
      // Features
      firstAidTitle: "First Aid Tips",
      firstAidDesc: "Get quick emergency care guides for burns, bleeding, choking, and more.",
      firstAidLink: "View First Aid Guides",
      doctorTitle: "Doctor Consultation",
      doctorDesc: "Connect with verified healthcare professionals for online consultations.",
      doctorLink: "Consult Now",
      
      // Stats
      statsDiagnoses: "Accurate Diagnoses",
      statsDoctors: "Verified Doctors",
      statsUsers: "Active Users",
      statsResponse: "Avg. Response Time (sec)",
      
      // Emergency
      emergencyButton: "Emergency — Find Nearby Hospital",
      
      // Footer
      copyright: "© 2025 QuickCure Hub | Designed for AI-Driven Healthcare",
      
      // Additional Info
      ourMission: "Our Mission",
      missionText: "To revolutionize personal healthcare by combining artificial intelligence, medical science, and accessibility for everyone, anywhere.",
      
      // Welcome message
      welcome: "Welcome"
    },
    bn: {
      // Navbar
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      login: "লগইন",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      logout: "লগআউট",
      profile: "প্রোফাইল",
      
      // Hero section
      heroTitle: "কুইককিউর হাব",
      heroSubtitle: "এআই-চালিত স্বাস্থ্য রোগ নির্ণয়, প্রাথমিক চিকিৎসা নির্দেশিকা এবং বিশেষজ্ঞ ডাক্তার পরামর্শের জন্য আপনার বিশ্বস্ত সঙ্গী।",
      
      // Features
      firstAidTitle: "প্রাথমিক চিকিৎসা টিপস",
      firstAidDesc: "পোড়া, রক্তপাত, শ্বাসরোধ এবং আরও অনেক কিছুর জন্য দ্রুত জরুরী যত্ন গাইড পান।",
      firstAidLink: "প্রাথমিক চিকিৎসা গাইড দেখুন",
      doctorTitle: "ডাক্তার পরামর্শ",
      doctorDesc: "অনলাইন পরামর্শের জন্য যাচাইকৃত স্বাস্থ্যসেবা পেশাদারদের সাথে সংযুক্ত হন।",
      doctorLink: "এখনই পরামর্শ নিন",
      
      // Stats
      statsDiagnoses: "সঠিক রোগ নির্ণয়",
      statsDoctors: "যাচাইকৃত ডাক্তার",
      statsUsers: "সক্রিয় ব্যবহারকারী",
      statsResponse: "গড় প্রতিক্রিয়া সময় (সেকেন্ড)",
      
      // Emergency
      emergencyButton: "জরুরী — কাছাকাছি হাসপাতাল খুঁজুন",
      
      // Footer
      copyright: "© ২০২৫ কুইককিউর হাব | এআই-চালিত স্বাস্থ্যসেবার জন্য ডিজাইন করা হয়েছে",
      
      // Additional Info
      ourMission: "আমাদের লক্ষ্য",
      missionText: "কৃত্রিম বুদ্ধিমত্তা, চিকিৎসা বিজ্ঞান এবং সহজলভ্যতাকে একত্রিত করে সবার জন্য ব্যক্তিগত স্বাস্থ্যসেবায় বিপ্লব আনা।",
      
      // Welcome message
      welcome: "স্বাগতম"
    }
  };

  // Animation for statistics counters
  useEffect(() => {
    const targetCounts = {
      diagnoses: 12500,
      doctors: 342,
      users: 52900,
      responseTime: 28
    };

    const duration = 2000;
    const steps = 60;
    const increment = {
      diagnoses: targetCounts.diagnoses / steps,
      doctors: targetCounts.doctors / steps,
      users: targetCounts.users / steps,
      responseTime: targetCounts.responseTime / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounts({
          diagnoses: Math.min(Math.floor(increment.diagnoses * currentStep), targetCounts.diagnoses),
          doctors: Math.min(Math.floor(increment.doctors * currentStep), targetCounts.doctors),
          users: Math.min(Math.floor(increment.users * currentStep), targetCounts.users),
          responseTime: Math.min(Math.floor(increment.responseTime * currentStep), targetCounts.responseTime)
        });
        currentStep++;
      } else {
        setCounts(targetCounts);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    
    setIsLoggedIn(false);
    setUserName("");
    
    // Navigate to home page after logout
    navigate("/");
  };

  // Format numbers with K suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Find nearby hospitals
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
  };

  // Features data
  const features = [
    {
      icon: <FaFirstAid />,
      title: text[lang].firstAidTitle,
      description: text[lang].firstAidDesc,
      link: "/first-aid",
      buttonText: text[lang].firstAidLink
    },
    {
      icon: <FaUserMd />,
      title: text[lang].doctorTitle,
      description: text[lang].doctorDesc,
      link: "/consultation",
      buttonText: text[lang].doctorLink
    }
  ];

  // Stats data
  const stats = [
    { icon: <FaStethoscope />, count: counts.diagnoses, label: text[lang].statsDiagnoses },
    { icon: <FaUserMd />, count: counts.doctors, label: text[lang].statsDoctors },
    { icon: <FaUsers />, count: counts.users, label: text[lang].statsUsers },
    { icon: <FaClock />, count: counts.responseTime, label: text[lang].statsResponse }
  ];

  return (
    <div className={`home-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Background image with shaded gradient overlay baked in */}
      <div
        className="background-overlay"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10,25,41,0.75) 0%, rgba(10,25,41,0.45) 50%, rgba(10,25,41,0.8) 100%), url(${bgImage})`
        }}
      ></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/" className="active">{text[lang].home}</Link></li>
            <li><Link to="/about">{text[lang].about}</Link></li>
            <li><Link to="/contact">{text[lang].contact}</Link></li>
            {isLoggedIn ? (
              <li><Link to="/UserProfile">{text[lang].profile}</Link></li>
            ) : (
              <li><Link to="/login">{text[lang].login}</Link></li>
            )}
          </ul>
          
          {/* Theme and Language Toggles */}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? text[lang].lightMode : text[lang].darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          
          {/* User Info (when logged in) */}
          {isLoggedIn && (
            <div className="user-info-display">
              <FaUserCircle className="user-icon" />
              <span className="user-name">
                {text[lang].welcome}, {userName.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">{text[lang].heroTitle}</h1>
        <p className="hero-subtitle">{text[lang].heroSubtitle}</p>
      </section>

      {/* Features Section */}
      <section className="features two-cards">
        {features.map((feature, index) => (
          <Link to={feature.link} key={index} className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="feature-link">
                {feature.buttonText} <FaArrowRight className="arrow-icon" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="mission-box">
          <h2>{text[lang].ourMission}</h2>
          <p>{text[lang].missionText}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">{formatNumber(stat.count)}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Emergency Button - Circular with Plus */}
      <button className="emergency-btn" onClick={findHospital} title={text[lang].emergencyButton}>
        <FaPlus />
      </button>

      {/* Footer */}
      <footer>
        <p>{text[lang].copyright}</p>
      </footer>
    </div>
  );
}

export default HomePage;