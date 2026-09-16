import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/About.css";
import { 
  FaMoon, FaSun, FaUserMd, FaStethoscope, FaGlobe, 
  FaHeartbeat, FaPhone, FaHospital, FaTimes, FaPlus, 
  FaUser, FaSignOutAlt, FaUserCircle 
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";

// Import images (make sure these paths are correct)
import teamImg1 from "../images/a-cartoon-girl-with-long-hair-and-an-orange-shirt-free-png.png";
import teamImg2 from "../images/3dd1ec73fe39f4d9a16b8d6c36277e4e.jpg";
import teamImg3 from "../images/ai-generated-3d-rendering-of-a-toddler-girl-standing-and-smiling-on-transparent-background-ai-generated-png.png";
import bgImage from "../images/ai.jpg";

function AboutPage() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [counts, setCounts] = useState({
    doctors: 0,
    diagnoses: 0,
    users: 0,
    emergencies: 0
  });

  // Check login status on component mount (same as HomePage)
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
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
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
      profile: "Profile",
      logout: "Logout",
      welcome: "Welcome",
      
      // About page
      title: "About QuickCure Hub",
      description: "is a health diagnosis and medical recommendation platform designed to make healthcare smarter, faster, and more accessible. Our system enables users to input their symptoms and instantly receive disease predictions, first-aid tips, and nearby hospital suggestions using intelligent algorithms and real-time data.",
      
      // Mission
      missionTitle: "🌍 Our Mission",
      missionDesc: "To revolutionize personal healthcare by combining artificial intelligence, medical science, and accessibility. We aim to help users take early action in identifying diseases, understanding first-aid responses, and connecting with emergency support — all in one digital platform.",
      
      // Features
      featuresTitle: "💡 Key Features",
      doctorTitle: "Doctor Recommendation",
      doctorEmergency: "Emergency Button",
      doctorNotification: "Notification System",
      doctorFirstAid: "FirstAids",
      trackerTitle: "Health Tracker Integration",
      trackerAdmin: "Admin Dashboard",
      trackerTheme: "Dark/Light Mode",
      trackerLanguage: "Multi-Language Support",
      authTitle: "User Authentication",
      authPrediction: "Disease Prediction",
      authSymptom: "Symptom Checker Interface",
      authResult: "Result page",
      authAI: "AI-Powered Prediction Engine",
      authHistory: "Medical History Dashboard",
      
      // Team
      teamTitle: "👩‍⚕️ Our Team",
      teamMember1: "Wasima Khanom Munira",
      teamRole1: "Backend Developer",
      teamMember2: "Nurtaz Ahmed",
      teamRole2: "AI & Data Science Lead",
      teamMember3: "Muziba Mahmuda Mithy",
      teamRole3: "Frontend Developer",
      
      // Stats
      statsDoctors: "Verified Doctors",
      statsDiagnoses: "Accurate Diagnoses",
      statsUsers: "Active Users",
      statsEmergencies: "Emergencies Handled",
      
      // Emergency Modal
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "You've activated the emergency button. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      
      // Footer
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology"
    },
    bn: {
      // Navbar
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      login: "লগইন",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      profile: "প্রোফাইল",
      logout: "লগআউট",
      welcome: "স্বাগতম",
      
      // About page
      title: "কুইককিউর হাব সম্পর্কে",
      description: "একটি এআই-চালিত স্বাস্থ্য রোগ নির্ণয় এবং চিকিৎসা সুপারিশ প্ল্যাটফর্ম যা স্বাস্থ্যসেবাকে আরও স্মার্ট, দ্রুত এবং আরও অ্যাক্সেসযোগ্য করতে ডিজাইন করা হয়েছে। আমাদের সিস্টেম ব্যবহারকারীদের তাদের লক্ষণগুলি ইনপুট করতে এবং বুদ্ধিমান অ্যালগরিদম এবং রিয়েল-টাইম ডেটা ব্যবহার করে তাত্ক্ষণিকভাবে রোগের ভবিষ্যদ্বাণী, প্রাথমিক চিকিৎসার টিপস এবং কাছাকাছি হাসপাতালের পরামর্শ পেতে সক্ষম করে।",
      
      // Mission
      missionTitle: "🌍 আমাদের মিশন",
      missionDesc: "কৃত্রিম বুদ্ধিমত্তা, চিকিৎসা বিজ্ঞান এবং অ্যাক্সেসযোগ্যতাকে একত্রিত করে ব্যক্তিগত স্বাস্থ্যসেবায় বিপ্লব ঘটানো। আমরা ব্যবহারকারীদের রোগ সনাক্তকরণে প্রাথমিক পদক্ষেপ নিতে, প্রাথমিক চিকিৎসা প্রতিক্রিয়া বোঝার এবং জরুরী সহায়তার সাথে সংযোগ স্থাপনে সহায়তা করতে চাই — সমস্ত এক ডিজিটাল প্ল্যাটফর্মে।",
      
      // Features
      featuresTitle: "💡 মূল বৈশিষ্ট্য",
      doctorTitle: "ডাক্তার সুপারিশ",
      doctorEmergency: "জরুরী বাটন",
      doctorNotification: "বিজ্ঞপ্তি সিস্টেম",
      doctorFirstAid: "প্রাথমিক চিকিৎসা",
      trackerTitle: "স্বাস্থ্য ট্র্যাকার ইন্টিগ্রেশন",
      trackerAdmin: "অ্যাডমিন ড্যাশবোর্ড",
      trackerTheme: "ডার্ক/লাইট মোড",
      trackerLanguage: "বহু-ভাষা সমর্থন",
      authTitle: "ব্যবহারকারী প্রমাণীকরণ",
      authPrediction: "রোগ ভবিষ্যদ্বাণী",
      authSymptom: "লক্ষণ চেকার ইন্টারফেস",
      authResult: "ফলাফল পৃষ্ঠা",
      authAI: "এআই-চালিত ভবিষ্যদ্বাণী ইঞ্জিন",
      authHistory: "চিকিৎসা ইতিহাস ড্যাশবোর্ড",
      
      // Team
      teamTitle: "👩‍⚕️ আমাদের দল",
      teamMember1: "ওয়াসিমা খানম মুনিরা",
      teamRole1: "ব্যাকএন্ড ডেভেলপার",
      teamMember2: "নুরতাজ আহমেদ",
      teamRole2: "এআই ও ডেটা সায়েন্স লিড",
      teamMember3: "মুজিবা মাহমুদা মিথি",
      teamRole3: "ফ্রন্টএন্ড ডেভেলপার",
      
      // Stats
      statsDoctors: "যাচাইকৃত ডাক্তার",
      statsDiagnoses: "সঠিক রোগ নির্ণয়",
      statsUsers: "সক্রিয় ব্যবহারকারী",
      statsEmergencies: "মোকাবেলা করা জরুরী অবস্থা",
      
      // Emergency Modal
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "আপনি জরুরী বাটন সক্রিয় করেছেন। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল করুন",
      
      // Footer
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন"
    }
  };

  // Animation for statistics counters
  useEffect(() => {
    const targetCounts = {
      doctors: 250,
      diagnoses: 12500,
      users: 50000,
      emergencies: 1200
    };

    const duration = 2000;
    const steps = 60;
    const increment = {
      doctors: targetCounts.doctors / steps,
      diagnoses: targetCounts.diagnoses / steps,
      users: targetCounts.users / steps,
      emergencies: targetCounts.emergencies / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounts({
          doctors: Math.min(Math.floor(increment.doctors * currentStep), targetCounts.doctors),
          diagnoses: Math.min(Math.floor(increment.diagnoses * currentStep), targetCounts.diagnoses),
          users: Math.min(Math.floor(increment.users * currentStep), targetCounts.users),
          emergencies: Math.min(Math.floor(increment.emergencies * currentStep), targetCounts.emergencies)
        });
        currentStep++;
      } else {
        setCounts(targetCounts);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Format numbers with K suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Features data
  const features = [
    {
      id: 'doctor',
      icon: <FaUserMd />,
      title: text[lang].doctorTitle,
      items: [
        text[lang].doctorEmergency,
        text[lang].doctorNotification,
        text[lang].doctorFirstAid
      ]
    },
    {
      id: 'tracker',
      icon: <FaHeartbeat />,
      title: text[lang].trackerTitle,
      items: [
        text[lang].trackerAdmin,
        text[lang].trackerTheme,
        text[lang].trackerLanguage
      ]
    },
    {
      id: 'auth',
      icon: <FaStethoscope />,
      title: text[lang].authTitle,
      items: [
        text[lang].authPrediction,
        text[lang].authSymptom,
        text[lang].authResult,
        text[lang].authAI,
        text[lang].authHistory
      ]
    }
  ];

  // Team data
  const team = [
    { name: text[lang].teamMember1, role: text[lang].teamRole1, image: teamImg1 },
    { name: text[lang].teamMember2, role: text[lang].teamRole2, image: teamImg2 },
    { name: text[lang].teamMember3, role: text[lang].teamRole3, image: teamImg3 }
  ];

  // Stats data
  const stats = [
    { icon: <FaUserMd />, count: counts.doctors, label: text[lang].statsDoctors },
    { icon: <FaStethoscope />, count: counts.diagnoses, label: text[lang].statsDiagnoses },
    { icon: <FaGlobe />, count: counts.users, label: text[lang].statsUsers },
    { icon: <FaHeartbeat />, count: counts.emergencies, label: text[lang].statsEmergencies }
  ];

  // Emergency handlers
  const handleEmergencyCall = () => {
    alert(text[lang].emergencyCall);
    setShowEmergencyModal(false);
  };

  const handleFindHospital = () => {
    alert(text[lang].emergencyHospital);
    setShowEmergencyModal(false);
  };

  // Find nearby hospitals (same as HomePage)
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

  return (
    <div className={`about-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Background image with overlay */}
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      {/* Navbar - Same as HomePage */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{text[lang].home}</Link></li>
            <li><Link to="/about" className="active">{text[lang].about}</Link></li>
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
          
          {/* User Info (when logged in) - Same as HomePage */}
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

      {/* Main Content */}
      <main className="about-container">
        <h1 className="page-title">{text[lang].title}</h1>
        <p className="description">
          <b>QuickCure Hub</b> {text[lang].description}
        </p>

        {/* Mission Box */}
        <div className="mission-box">
          <h2>{text[lang].missionTitle}</h2>
          <p>{text[lang].missionDesc}</p>
        </div>

        {/* Statistics Section */}
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{formatNumber(stat.count)}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <h2 className="section-title">{text[lang].featuresTitle}</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <h3>
                <span className="feature-icon">{feature.icon}</span>
                {feature.title}
              </h3>
              <ul>
                {feature.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <h2 className="section-title">{text[lang].teamTitle}</h2>
        <div className="team-section">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.image} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Emergency Button - Same as HomePage */}
      <button className="emergency-btn" onClick={findHospital}>
        <FaPlus />
      </button>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaHeartbeat />
              {text[lang].emergencyTitle}
            </h3>
            <p>{text[lang].emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={handleEmergencyCall}>
                <FaPhone />
                {text[lang].emergencyCall}
              </button>
              <button className="btn-call" onClick={handleFindHospital}>
                <FaHospital />
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

      {/* Footer */}
      <footer>
        <p>{text[lang].copyright}</p>
        <p className="tagline">{text[lang].tagline}</p>
      </footer>
    </div>
  );
}

export default AboutPage;