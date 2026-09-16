import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Contact.css";
import { 
  FaMoon, FaSun, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, 
  FaClock, FaPaperPlane, FaChevronDown, FaPlus,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube,
  FaUserCircle
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

function Contact() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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

  // Get user display name
  const getUserDisplayName = () => {
    if (userName) return userName;
    return 'User';
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
      welcome: "Welcome",
      
      // Contact page
      title: "Get In Touch With Us",
      subtitle: "Have questions about our AI health diagnosis platform? Need support with your account? We're here to help. Reach out to our team through any of the following channels.",
      
      // Contact info
      infoTitle: "Contact Information",
      addressTitle: "Our Address",
      addressDetail: "123 Healthcare Avenue, Medical District, Dhaka 1207, Bangladesh",
      phoneTitle: "Phone Number",
      phoneDetail: "+880 1234-567890",
      emailTitle: "Email Address",
      emailDetail: "support@quickcurehub.com",
      hoursTitle: "Working Hours",
      hoursDetail: "24/7 Emergency Support | General Inquiries: 9AM – 6PM (GMT+6)",
      socialTitle: "Follow Us",
      
      // Contact form
      formTitle: "Send Us a Message",
      formName: "Your Name",
      formEmail: "Email Address",
      formSubject: "Subject",
      formMessage: "Your Message",
      formSubmit: "Send Message",
      formSuccess: "Message sent successfully! We'll get back to you soon.",
      formError: "Please fill in all fields",
      
      // FAQ
      faqTitle: "Frequently Asked Questions",
      faq1: "How accurate is the AI diagnosis?",
      faq1Answer: "Our AI diagnosis system has an accuracy rate of over 92% for common conditions. However, it's designed to assist healthcare professionals, not replace them. Always consult with a doctor for critical health decisions.",
      faq2: "Is my medical data secure?",
      faq2Answer: "Yes, we use end-to-end encryption and comply with international healthcare data protection standards. Your data is never shared with third parties without your explicit consent.",
      faq3: "How quickly will I get a response?",
      faq3Answer: "For emergency situations, we respond within minutes. For general inquiries, our team typically responds within 24 hours during business days.",
      faq4: "Do you offer telemedicine services?",
      faq4Answer: "Yes, we partner with certified healthcare providers to offer telemedicine consultations. You can connect with doctors through our platform for virtual appointments.",
      faq5: "What is the purpose of this hub?",
      faq5Answer: "QuickCure Hub is designed to provide AI-powered health diagnosis, first aid guidance, and connect users with healthcare professionals for better health outcomes.",
      faq6: "How can I contact you?",
      faq6Answer: "You can reach us through the contact form on this page, email us directly at support@quickcurehub.com, or call us at +880 1234-567890.",
      faq7: "Where can I find more information about your services?",
      faq7Answer: "Visit our About page for detailed information about our services, features, and mission.",
      faq8: "Are there any specific guidelines for using this hub?",
      faq8Answer: "Please refer to our Terms of Service and Privacy Policy for guidelines on using our platform.",
      faq9: "Is there a way to provide feedback or report issues?",
      faq9Answer: "Yes, you can use this contact form to send feedback or report any issues you encounter.",
      faq10: "Can I access this hub on my mobile device?",
      faq10Answer: "Yes, QuickCure Hub is fully responsive and can be accessed on all mobile devices, tablets, and desktops.",
      
      // Map
      mapTitle: "Find Us",
      mapDescription: "Interactive map showing our location",
      mapNote: "(Map integration would be implemented in a production environment)",
      
      // Emergency
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "You've activated the emergency button. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      
      // Footer
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology",
      
      // Windows activation
      windowsActivate: "Activate Windows",
      windowsSettings: "Go to Settings to activate Windows"
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
      welcome: "স্বাগতম",
      
      // Contact page
      title: "আমাদের সাথে যোগাযোগ করুন",
      subtitle: "আমাদের এআই স্বাস্থ্য রোগ নির্ণয় প্ল্যাটফর্ম সম্পর্কে প্রশ্ন আছে? আপনার অ্যাকাউন্টে সহায়তা দরকার? আমরা সাহায্য করতে এখানে আছি। নিম্নলিখিত যে কোনও চ্যানেলের মাধ্যমে আমাদের দলের সাথে যোগাযোগ করুন।",
      
      // Contact info
      infoTitle: "যোগাযোগের তথ্য",
      addressTitle: "আমাদের ঠিকানা",
      addressDetail: "১২৩ হেলথকেয়ার এভিনিউ, মেডিকেল ডিস্ট্রিক্ট, ঢাকা ১২০৭, বাংলাদেশ",
      phoneTitle: "ফোন নম্বর",
      phoneDetail: "+৮৮০ ১২৩৪-৫৬৭৮৯০",
      emailTitle: "ইমেল ঠিকানা",
      emailDetail: "support@quickcurehub.com",
      hoursTitle: "কাজের সময়",
      hoursDetail: "২৪/৭ জরুরী সহায়তা | সাধারণ জিজ্ঞাসা: সকাল ৯টা – সন্ধ্যা ৬টা (জিএমটি+৬)",
      socialTitle: "আমাদের অনুসরণ করুন",
      
      // Contact form
      formTitle: "আমাদের একটি বার্তা পাঠান",
      formName: "আপনার নাম",
      formEmail: "ইমেল ঠিকানা",
      formSubject: "বিষয়",
      formMessage: "আপনার বার্তা",
      formSubmit: "বার্তা পাঠান",
      formSuccess: "বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার কাছে ফিরে আসব।",
      formError: "অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন",
      
      // FAQ
      faqTitle: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
      faq1: "এআই রোগ নির্ণয় কতটা সঠিক?",
      faq1Answer: "আমাদের এআই রোগ নির্ণয় সিস্টেমের সাধারণ অবস্থার জন্য ৯২% এর বেশি নির্ভুলতা হার রয়েছে। যাইহোক, এটি স্বাস্থ্যসেবা পেশাদারদের সহায়তা করার জন্য ডিজাইন করা হয়েছে, তাদের প্রতিস্থাপন করার জন্য নয়। গুরুত্বপূর্ণ স্বাস্থ্য সিদ্ধান্তের জন্য সর্বদা একজন ডাক্তারের সাথে পরামর্শ করুন।",
      faq2: "আমার মেডিকেল ডেটা কি নিরাপদ?",
      faq2Answer: "হ্যাঁ, আমরা এন্ড-টু-এন্ড এনক্রিপশন ব্যবহার করি এবং আন্তর্জাতিক স্বাস্থ্যসেবা ডেটা সুরক্ষা মান মেনে চলি। আপনার স্পষ্ট সম্মতি ছাড়া আপনার ডেটা কখনও তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।",
      faq3: "কত দ্রুত আমি একটি প্রতিক্রিয়া পাব?",
      faq3Answer: "জরুরী পরিস্থিতির জন্য, আমরা কয়েক মিনিটের মধ্যে সাড়া দিই। সাধারণ জিজ্ঞাসার জন্য, আমাদের দল সাধারণত ব্যবসায়িক দিনগুলিতে ২৪ ঘন্টার মধ্যে সাড়া দেয়।",
      faq4: "আপনারা কি টেলিমেডিসিন পরিষেবা অফার করেন?",
      faq4Answer: "হ্যাঁ, আমরা টেলিমেডিসিন পরামর্শ দেওয়ার জন্য প্রত্যয়িত স্বাস্থ্যসেবা প্রদানকারীদের সাথে অংশীদারিত্ব করি। আপনি ভার্চুয়াল অ্যাপয়েন্টমেন্টের জন্য আমাদের প্ল্যাটফর্মের মাধ্যমে ডাক্তারদের সাথে সংযোগ করতে পারেন।",
      faq5: "এই হাবের উদ্দেশ্য কী?",
      faq5Answer: "কুইককিউর হাব এআই-চালিত স্বাস্থ্য রোগ নির্ণয়, প্রাথমিক চিকিৎসা নির্দেশিকা প্রদান এবং ব্যবহারকারীদের আরও ভাল স্বাস্থ্যের ফলাফলের জন্য স্বাস্থ্যসেবা পেশাদারদের সাথে সংযুক্ত করার জন্য ডিজাইন করা হয়েছে।",
      faq6: "আমি কিভাবে আপনার সাথে যোগাযোগ করতে পারি?",
      faq6Answer: "আপনি এই পৃষ্ঠার যোগাযোগ ফর্মের মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারেন, support@quickcurehub.com এ সরাসরি ইমেল করতে পারেন, বা +৮৮০ ১২৩৪-৫৬৭৮৯০ এ কল করতে পারেন।",
      faq7: "আমি আপনার পরিষেবা সম্পর্কে আরও তথ্য কোথায় পেতে পারি?",
      faq7Answer: "আমাদের পরিষেবা, বৈশিষ্ট্য এবং লক্ষ্য সম্পর্কে বিস্তারিত তথ্যের জন্য আমাদের 'আমাদের সম্পর্কে' পৃষ্ঠা দেখুন।",
      faq8: "এই হাব ব্যবহার করার জন্য কোন নির্দিষ্ট নির্দেশিকা আছে কি?",
      faq8Answer: "আমাদের প্ল্যাটফর্ম ব্যবহারের নির্দেশিকার জন্য আমাদের পরিষেবার শর্তাবলী এবং গোপনীয়তা নীতি দেখুন।",
      faq9: "প্রতিক্রিয়া জানানো বা সমস্যা রিপোর্ট করার কোন উপায় আছে কি?",
      faq9Answer: "হ্যাঁ, আপনি প্রতিক্রিয়া পাঠাতে বা আপনার সম্মুখীন হওয়া কোনও সমস্যা রিপোর্ট করতে এই যোগাযোগ ফর্মটি ব্যবহার করতে পারেন।",
      faq10: "আমি কি আমার মোবাইল ডিভাইসে এই হাব অ্যাক্সেস করতে পারি?",
      faq10Answer: "হ্যাঁ, কুইককিউর হাব সম্পূর্ণ প্রতিক্রিয়াশীল এবং সমস্ত মোবাইল ডিভাইস, ট্যাবলেট এবং ডেস্কটপে অ্যাক্সেস করা যেতে পারে।",
      
      // Map
      mapTitle: "আমাদের খুঁজুন",
      mapDescription: "আমাদের অবস্থান দেখাচ্ছে ইন্টারেক্টিভ মানচিত্র",
      mapNote: "(প্রোডাকশন পরিবেশে মানচিত্র ইন্টিগ্রেশন বাস্তবায়ন করা হবে)",
      
      // Emergency
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "আপনি জরুরী বাটন সক্রিয় করেছেন। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল করুন",
      
      // Footer
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন",
      
      // Windows activation
      windowsActivate: "উইন্ডোজ সক্রিয় করুন",
      windowsSettings: "উইন্ডোজ সক্রিয় করতে সেটিংসে যান"
    }
  };

  // FAQ data
  const faqs = [
    { question: text[lang].faq1, answer: text[lang].faq1Answer },
    { question: text[lang].faq2, answer: text[lang].faq2Answer },
    { question: text[lang].faq3, answer: text[lang].faq3Answer },
    { question: text[lang].faq4, answer: text[lang].faq4Answer },
    { question: text[lang].faq5, answer: text[lang].faq5Answer },
    { question: text[lang].faq6, answer: text[lang].faq6Answer },
    { question: text[lang].faq7, answer: text[lang].faq7Answer },
    { question: text[lang].faq8, answer: text[lang].faq8Answer },
    { question: text[lang].faq9, answer: text[lang].faq9Answer },
    { question: text[lang].faq10, answer: text[lang].faq10Answer }
  ];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all fields are filled
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert(text[lang].formError);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  // Toggle FAQ
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
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
    setShowEmergencyModal(false);
  };

  const callEmergency = () => {
    window.location.href = "tel:999"; // Emergency number
    setShowEmergencyModal(false);
  };

  // Contact info items
  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: text[lang].addressTitle,
      detail: text[lang].addressDetail
    },
    {
      icon: <FaPhoneAlt />,
      title: text[lang].phoneTitle,
      detail: text[lang].phoneDetail
    },
    {
      icon: <FaEnvelope />,
      title: text[lang].emailTitle,
      detail: text[lang].emailDetail
    },
    {
      icon: <FaClock />,
      title: text[lang].hoursTitle,
      detail: text[lang].hoursDetail
    }
  ];

  // Social media links
  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://facebook.com", label: "Facebook" },
    { icon: <FaTwitter />, url: "https://twitter.com", label: "Twitter" },
    { icon: <FaLinkedinIn />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <FaYoutube />, url: "https://youtube.com", label: "YouTube" }
  ];

  return (
    <div className={`contact-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Background image with overlay */}
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      {/* Navbar - Same as HomePage */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{text[lang].home}</Link></li>
            <li><Link to="/about">{text[lang].about}</Link></li>
            <li><Link to="/contact" className="active">{text[lang].contact}</Link></li>
            
            {/* Show profile link when logged in, otherwise show login */}
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
                {text[lang].welcome}, {getUserDisplayName().split(' ')[0]}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="contact-container">
        <h1 className="page-title">{text[lang].title}</h1>
        <p className="subtitle">{text[lang].subtitle}</p>

        {/* Contact Layout - Two Column */}
        <div className="contact-layout">
          {/* Left Column - Contact Information */}
          <div className="contact-info">
            <h2 className="section-title">{text[lang].infoTitle}</h2>
            
            {contactInfo.map((item, index) => (
              <div key={index} className="contact-detail">
                <div className="contact-icon">{item.icon}</div>
                <div className="contact-text">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
            
            <h3 className="social-title">{text[lang].socialTitle}</h3>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-form">
            <h2 className="section-title">{text[lang].formTitle}</h2>
            
            {submitSuccess && (
              <div className="success-message">
                <p>{text[lang].formSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">{text[lang].formName}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={text[lang].formName}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">{text[lang].formEmail}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={text[lang].formEmail}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">{text[lang].formSubject}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={text[lang].formSubject}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">{text[lang].formMessage}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="5"
                  placeholder={text[lang].formMessage}
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                <FaPaperPlane />
                <span>{isSubmitting ? "Sending..." : text[lang].formSubmit}</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="section-title">{text[lang].faqTitle}</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <div className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <FaChevronDown className={`faq-icon ${activeFaq === index ? 'rotated' : ''}`} />
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h2 className="section-title">{text[lang].mapTitle}</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <FaMapMarkerAlt className="map-icon" />
              <p>{text[lang].mapDescription}</p>
              <small>{text[lang].mapNote}</small>
            </div>
          </div>
        </div>

        {/* Windows Activation Message */}
        <div className="windows-activation">
          <p>{text[lang].windowsActivate}</p>
          <p className="activate-text">{text[lang].windowsSettings}</p>
        </div>
      </main>

      {/* Emergency Button - Circular with Plus */}
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
              <button className="btn-call" onClick={callEmergency}>
                <FaPhoneAlt />
                {text[lang].emergencyCall}
              </button>
              <button className="btn-call" onClick={findHospital}>
                <FaMapMarkerAlt />
                {text[lang].emergencyHospital}
              </button>
              <button className="btn-cancel" onClick={() => setShowEmergencyModal(false)}>
                <FaMoon />
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

export default Contact;