// DoctorPrescriptions.js - Complete Working Version with API Integration
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaPrescription, FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaUser, FaCalendarAlt, FaClock, FaDownload, FaPrint,
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes,
  FaPills, FaExclamationTriangle, FaFilter, FaFileAlt,
  FaEnvelope, FaPhone, FaUserMd, FaHospital, FaDollarSign,
  FaStethoscope, FaClipboardList, FaSyringe, FaMoon, FaSun,
  FaFilePrescription, FaHistory, FaChartPie, FaArrowRight,
  FaUserCheck, FaUserClock, FaUserSlash, FaCalendarCheck,
  FaTable, FaThLarge, FaThList, FaSpinner, FaArrowLeft
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import axios from "axios";
import "../styles/DoctorPrescriptions.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [patients, setPatients] = useState([]);
  
  // 🆕 formData-তে reminderTime যোগ করা হয়েছে
  const [formData, setFormData] = useState({
    appointmentId: "",
    patientId: "",
    patientName: "",
    diagnosis: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    quantity: "",
    refills: 2,
    status: "active",
    notes: "",
    nextReview: "",
    reminderTime: ""  // ← 🆕 reminderTime যোগ করা হয়েছে
  });
  const itemsPerPage = 5;

  // Translation object
  const text = {
    en: {
      prescriptions: "Prescriptions",
      total: "Total",
      active: "Active",
      completed: "Completed",
      expired: "Expired",
      newPrescription: "New Prescription",
      export: "Export",
      print: "Print",
      search: "Search prescriptions...",
      all: "All",
      patient: "Patient",
      medication: "Medication",
      date: "Date",
      status: "Status",
      refills: "Refills",
      actions: "Actions",
      available: "Available",
      exhausted: "Exhausted",
      noPrescriptions: "No prescriptions found",
      adjustFilters: "Try adjusting your filters or create a new prescription",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      editPrescription: "Edit Prescription",
      newPrescriptionTitle: "New Prescription",
      patientName: "Patient Name",
      selectPatient: "Select Patient",
      diagnosis: "Diagnosis",
      nextReview: "Next Review",
      medicationDetails: "Medication Details",
      medicationName: "Medication Name",
      dosage: "Dosage",
      frequency: "Frequency",
      duration: "Duration",
      instructions: "Instructions",
      quantity: "Quantity",
      refillsCount: "Refills",
      statusLabel: "Status",
      notes: "Notes",
      additionalNotes: "Additional notes...",
      cancel: "Cancel",
      create: "Create Prescription",
      update: "Update Prescription",
      prescriptionDetails: "Prescription Details",
      medicationInformation: "Medication Information",
      additionalInformation: "Additional Information",
      close: "Close",
      deletePrescription: "Delete Prescription",
      confirmDelete: "Are you sure you want to delete prescription for",
      cannotUndo: "This action cannot be undone.",
      deleteConfirm: "Delete Prescription",
      loading: "Loading prescriptions...",
      prescribedBy: "Prescribed By",
      prescriptionId: "Prescription ID",
      by: "By",
      noAdditionalNotes: "No additional notes",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      totalPatients: "Total Patients",
      activePrescriptions: "Active Prescriptions",
      completedPrescriptions: "Completed",
      expiredPrescriptions: "Expired",
      viewAll: "View All",
      table: "Table",
      grid: "Grid",
      compact: "Compact",
      noPatientsFound: "No patients found. Please ask patients to book appointments.",
      selectAppointment: "Select an appointment first",
      backToDashboard: "Back to Dashboard",
      reminderTime: "Reminder Time",
      reminderTimeHelp: "Set time for medicine reminder (e.g., 08:00 for morning dose)"
    },
    bn: {
      prescriptions: "প্রেসক্রিপশন",
      total: "মোট",
      active: "সক্রিয়",
      completed: "সম্পন্ন",
      expired: "মেয়াদোত্তীর্ণ",
      newPrescription: "নতুন প্রেসক্রিপশন",
      export: "এক্সপোর্ট",
      print: "প্রিন্ট",
      search: "প্রেসক্রিপশন খুঁজুন...",
      all: "সব",
      patient: "রোগী",
      medication: "ওষুধ",
      date: "তারিখ",
      status: "স্ট্যাটাস",
      refills: "রিফিল",
      actions: "ক্রিয়া",
      available: "উপলব্ধ",
      exhausted: "শেষ",
      noPrescriptions: "কোন প্রেসক্রিপশন পাওয়া যায়নি",
      adjustFilters: "আপনার ফিল্টার সামঞ্জস্য করুন বা একটি নতুন প্রেসক্রিপশন তৈরি করুন",
      viewDetails: "বিস্তারিত দেখুন",
      edit: "সম্পাদনা করুন",
      delete: "মুছুন",
      editPrescription: "প্রেসক্রিপশন সম্পাদনা করুন",
      newPrescriptionTitle: "নতুন প্রেসক্রিপশন",
      patientName: "রোগীর নাম",
      selectPatient: "রোগী নির্বাচন করুন",
      diagnosis: "রোগ নির্ণয়",
      nextReview: "পরবর্তী পর্যালোচনা",
      medicationDetails: "ওষুধের বিবরণ",
      medicationName: "ওষুধের নাম",
      dosage: "ডোজ",
      frequency: "ফ্রিকোয়েন্সি",
      duration: "সময়কাল",
      instructions: "নির্দেশনা",
      quantity: "পরিমাণ",
      refillsCount: "রিফিল",
      statusLabel: "স্ট্যাটাস",
      notes: "নোট",
      additionalNotes: "অতিরিক্ত নোট...",
      cancel: "বাতিল",
      create: "প্রেসক্রিপশন তৈরি করুন",
      update: "প্রেসক্রিপশন আপডেট করুন",
      prescriptionDetails: "প্রেসক্রিপশনের বিবরণ",
      medicationInformation: "ওষুধের তথ্য",
      additionalInformation: "অতিরিক্ত তথ্য",
      close: "বন্ধ করুন",
      deletePrescription: "প্রেসক্রিপশন মুছুন",
      confirmDelete: "আপনি কি নিশ্চিত যে আপনি প্রেসক্রিপশনটি মুছতে চান",
      cannotUndo: "এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।",
      deleteConfirm: "প্রেসক্রিপশন মুছুন",
      loading: "প্রেসক্রিপশন লোড হচ্ছে...",
      prescribedBy: "প্রেসক্রিপশন দিয়েছেন",
      prescriptionId: "প্রেসক্রিপশন আইডি",
      by: "দ্বারা",
      noAdditionalNotes: "কোন অতিরিক্ত নোট নেই",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      totalPatients: "মোট রোগী",
      activePrescriptions: "সক্রিয় প্রেসক্রিপশন",
      completedPrescriptions: "সম্পন্ন",
      expiredPrescriptions: "মেয়াদোত্তীর্ণ",
      viewAll: "সব দেখুন",
      table: "টেবিল",
      grid: "গ্রিড",
      compact: "সংক্ষিপ্ত",
      noPatientsFound: "কোন রোগী পাওয়া যায়নি। অনুগ্রহ করে রোগীদের অ্যাপয়েন্টমেন্ট বুক করতে বলুন।",
      selectAppointment: "প্রথমে একটি অ্যাপয়েন্টমেন্ট নির্বাচন করুন",
      backToDashboard: "ড্যাশবোর্ডে ফিরে যান",
      reminderTime: "রিমাইন্ডার সময়",
      reminderTimeHelp: "ঔষধ রিমাইন্ডারের সময় সেট করুন (যেমন: সকাল ৮টার জন্য 08:00)"
    }
  };

  // =============================================
  // LOAD PATIENTS FROM API
  // =============================================
  const loadPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let appointmentsData = [];
      if (response.data.success) {
        appointmentsData = response.data.appointments || response.data.data || [];
      }

      const patientMap = new Map();
      
      appointmentsData.forEach(apt => {
        const patientId = apt.patientId || apt.patient?._id || apt.user;
        if (!patientId) return;

        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            _id: patientId,
            appointmentId: apt._id,
            name: apt.patientName || apt.patient?.name || "Unknown Patient",
            fullName: apt.patientName || apt.patient?.name || "Unknown Patient",
            patientName: apt.patientName || apt.patient?.name || "Unknown Patient"
          });
        }
      });

      const patientList = Array.from(patientMap.values());
      setPatients(patientList);
      console.log("✅ Loaded", patientList.length, "patients with appointment IDs");

    } catch (error) {
      console.error("❌ Error loading patients:", error);
      setPatients([]);
    }
  };

  // =============================================
  // LOAD PRESCRIPTIONS FROM API
  // =============================================
  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log("📤 Fetching prescriptions from API...");
      const response = await axios.get(`${API_BASE_URL}/prescriptions/doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📦 Full API Response:", response.data);

      let prescriptionsData = [];
      
      if (response.data.success) {
        if (response.data.prescriptions && Array.isArray(response.data.prescriptions)) {
          prescriptionsData = response.data.prescriptions;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          prescriptionsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          prescriptionsData = response.data;
        }

        console.log("📦 Prescriptions Data Length:", prescriptionsData.length);

        const formattedData = prescriptionsData.map(p => {
          let patientName = "Unknown Patient";
          if (p.patient) {
            if (typeof p.patient === 'object') {
              patientName = p.patient.name || 
                           (p.patient.firstName && p.patient.lastName ? p.patient.firstName + " " + p.patient.lastName : null) ||
                           p.patient.fullName ||
                           "Unknown Patient";
            } else {
              patientName = p.patientName || "Unknown Patient";
            }
          }

          let medications = p.medicines || p.medications || [];
          if (!Array.isArray(medications)) {
            medications = [medications];
          }

          let doctorName = "Doctor";
          if (p.doctor) {
            if (typeof p.doctor === 'object') {
              if (p.doctor.userId && typeof p.doctor.userId === 'object') {
                doctorName = (p.doctor.userId.firstName || "") + " " + (p.doctor.userId.lastName || "");
              } else {
                doctorName = p.doctor.name || p.doctor.firstName + " " + p.doctor.lastName || "Doctor";
              }
            }
          }

          return {
            id: p._id,
            _id: p._id,
            patientName: patientName,
            patientId: p.patient?._id || p.patientId || "",
            date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            medications: medications,
            diagnosis: p.diagnosis || "",
            status: p.status || "active",
            refills: p.refills || 0,
            refillsUsed: p.refillsUsed || 0,
            prescribedBy: doctorName || "Doctor",
            notes: p.notes || "",
            nextReview: p.followUpDate || "",
            appointmentId: p.appointment?._id || p.appointment
          };
        });
        
        console.log("📦 Formatted Count:", formattedData.length);
        
        setPrescriptions(formattedData);
        setFilteredPrescriptions(formattedData);
        localStorage.setItem("prescriptions", JSON.stringify(formattedData));
      } else {
        console.log("❌ API Error:", response.data.message);
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("❌ Error loading prescriptions:", error);
      if (error.response) {
        console.error("Response Error:", error.response.data);
      }
      loadFromLocalStorage();
    }
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    try {
      const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]");
      if (storedPrescriptions.length > 0) {
        setPrescriptions(storedPrescriptions);
        setFilteredPrescriptions(storedPrescriptions);
      } else {
        const mockPrescriptions = generateMockPrescriptions();
        setPrescriptions(mockPrescriptions);
        setFilteredPrescriptions(mockPrescriptions);
        localStorage.setItem("prescriptions", JSON.stringify(mockPrescriptions));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      const mockPrescriptions = generateMockPrescriptions();
      setPrescriptions(mockPrescriptions);
      setFilteredPrescriptions(mockPrescriptions);
    }
  };

  const generateMockPrescriptions = () => {
    return [
      {
        id: 1,
        _id: "1",
        patientName: "Sarah Ahmed",
        patientId: 1,
        date: "2026-06-15",
        medications: [{ name: "Sertraline", dosage: "50mg", frequency: "Once daily", duration: "30 days", instructions: "Take with food", quantity: "30 tablets" }],
        notes: "Continue treatment for anxiety disorder.",
        status: "active",
        refills: 2,
        refillsUsed: 0,
        prescribedBy: "Dr. Munira Roma",
        diagnosis: "Anxiety Disorder",
        nextReview: "2026-07-15"
      },
      {
        id: 2,
        _id: "2",
        patientName: "Md. Rahman",
        patientId: 2,
        date: "2026-06-10",
        medications: [{ name: "Fluoxetine", dosage: "20mg", frequency: "Once daily", duration: "60 days", instructions: "Take in the morning", quantity: "60 tablets" }],
        notes: "Monitor for side effects.",
        status: "active",
        refills: 3,
        refillsUsed: 1,
        prescribedBy: "Dr. Munira Roma",
        diagnosis: "Depression",
        nextReview: "2026-07-10"
      }
    ];
  };

  // =============================================
  // LOAD DATA ON MOUNT
  // =============================================
  useEffect(() => {
    loadPatients();
    loadPrescriptions();
  }, []);

  // =============================================
  // CHECK FOR NAVIGATION STATE
  // =============================================
  useEffect(() => {
    if (location.state?.openNewPrescription) {
      setEditMode(false);
      setSelectedPrescription(null);
      resetForm();
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // =============================================
  // 🆕 FORM FUNCTIONS - reminderTime যোগ করা হয়েছে
  // =============================================
  const resetForm = () => {
    setFormData({
      appointmentId: "",
      patientId: "",
      patientName: "",
      diagnosis: "",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: "",
      refills: 2,
      status: "active",
      notes: "",
      nextReview: "",
      reminderTime: ""  // ← 🆕
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "patientId") {
      const selectedPatient = patients.find(p => p.id === value || p._id === value);
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev,
          patientId: value,
          patientName: selectedPatient.name || selectedPatient.fullName || selectedPatient.patientName || "",
          appointmentId: selectedPatient.appointmentId || ""
        }));
      }
    }
  };

  // =============================================
  // SEARCH FUNCTIONALITY
  // =============================================
  useEffect(() => {
    let filtered = [...prescriptions];
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const patientNameMatch = p.patientName?.toLowerCase().includes(term) || false;
        let medicationMatch = false;
        if (p.medications) {
          if (Array.isArray(p.medications)) {
            medicationMatch = p.medications.some(m => 
              (m.name || m.medicineName)?.toLowerCase().includes(term) || false
            );
          } else if (typeof p.medications === 'object') {
            medicationMatch = (p.medications.name || p.medications.medicineName)?.toLowerCase().includes(term) || false;
          }
        }
        const diagnosisMatch = p.diagnosis?.toLowerCase().includes(term) || false;
        const notesMatch = p.notes?.toLowerCase().includes(term) || false;
        return patientNameMatch || medicationMatch || diagnosisMatch || notesMatch;
      });
    }
    
    setFilteredPrescriptions(filtered);
    setCurrentPage(1);
  }, [prescriptions, filterStatus, searchTerm]);

  // =============================================
  // 🆕 API - CREATE/UPDATE PRESCRIPTION (reminderTime যোগ করা হয়েছে)
  // =============================================
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentId) {
      alert("Please select a patient with an appointment first.");
      return;
    }

    if (!formData.medication || !formData.dosage) {
      alert("Please fill in medication and dosage at minimum.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        setIsLoading(false);
        return;
      }

      const prescriptionData = {
        appointmentId: formData.appointmentId,
        diagnosis: formData.diagnosis || "",
        medicines: [{
          medicineName: formData.medication,
          dosage: formData.dosage,
          frequency: formData.frequency || "As prescribed",
          duration: formData.duration || "As prescribed",
          instructions: formData.instructions || "Take as directed",
          reminderTime: formData.reminderTime || null,  // ← 🆕 reminderTime যোগ করা হয়েছে
          isActive: true
        }],
        notes: formData.notes || "",
        followUpDate: formData.nextReview || null,
        status: formData.status || "active"
      };

      console.log("📤 Sending Data:", prescriptionData);

      let response;

      if (editMode && selectedPrescription) {
        const url = `${API_BASE_URL}/prescriptions/${selectedPrescription._id || selectedPrescription.id}`;
        console.log("📤 EDITING prescription:", url);
        
        response = await axios.put(url, prescriptionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        console.log("📤 CREATING prescription");
        response = await axios.post(
          `${API_BASE_URL}/prescriptions`,
          prescriptionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log("📦 Response:", response.data);

      if (response.data.success) {
        alert(editMode ? "✅ Prescription updated successfully!" : "✅ Prescription created successfully!");
        setShowModal(false);
        setEditMode(false);
        resetForm();
        setSelectedPrescription(null);
        
        await loadPrescriptions();
        setFilterStatus("all");
        
      } else {
        alert(response.data.message || "Failed to save prescription.");
      }
    } catch (error) {
      console.error("❌ Error saving prescription:", error);
      if (error.response) {
        console.error("Response Error:", error.response.data);
        alert(`❌ ${error.response.data.message || "Server error. Please try again."}`);
      } else if (error.request) {
        alert("❌ No response from server. Please check your connection.");
      } else {
        alert("❌ Error saving prescription. Please try again.");
      }
    }
    setIsLoading(false);
  };

  // =============================================
  // API - DELETE PRESCRIPTION
  // =============================================
  const handleDelete = async () => {
    if (!selectedPrescription) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        setIsLoading(false);
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/prescriptions/${selectedPrescription._id || selectedPrescription.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert("✅ Prescription deleted successfully!");
        setShowDeleteModal(false);
        setSelectedPrescription(null);
        await loadPrescriptions();
      } else {
        alert(response.data.message || "Failed to delete prescription.");
      }
    } catch (error) {
      console.error("❌ Error deleting prescription:", error);
      
      const updated = prescriptions.filter(p => (p._id || p.id) !== (selectedPrescription._id || selectedPrescription.id));
      setPrescriptions(updated);
      setFilteredPrescriptions(updated);
      localStorage.setItem("prescriptions", JSON.stringify(updated));
      setShowDeleteModal(false);
      setSelectedPrescription(null);
      alert("Prescription deleted locally. Server sync may have failed.");
    }
    setIsLoading(false);
  };

  // =============================================
  // UI FUNCTIONS
  // =============================================
  const getStatusBadge = (status) => {
    const classes = {
      active: "status-badge active",
      completed: "status-badge completed",
      expired: "status-badge expired",
      cancelled: "status-badge cancelled"
    };
    return classes[status] || "status-badge";
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "active": return <FaCheck />;
      case "completed": return <FaCheck className="double" />;
      case "expired": return <FaExclamationTriangle />;
      case "cancelled": return <FaTimes />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "bn" ? 'bn-BD' : 'en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // 🆕 openEditModal - reminderTime যোগ করা হয়েছে
  const openEditModal = (prescription) => {
    console.log("✏️ Opening edit modal for:", prescription);
    
    setSelectedPrescription(prescription);
    setEditMode(true);
    
    let med = {};
    if (prescription.medications && Array.isArray(prescription.medications) && prescription.medications.length > 0) {
      med = prescription.medications[0];
    } else if (prescription.medications && typeof prescription.medications === 'object') {
      med = prescription.medications;
    }

    const medName = med.medicineName || med.name || "";

    setFormData({
      appointmentId: prescription.appointmentId || "",
      patientId: prescription.patientId || "",
      patientName: prescription.patientName || "",
      diagnosis: prescription.diagnosis || "",
      medication: medName,
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      duration: med.duration || "",
      instructions: med.instructions || "",
      quantity: med.quantity || "",
      refills: prescription.refills || 0,
      status: prescription.status || "active",
      notes: prescription.notes || "",
      nextReview: prescription.nextReview || "",
      reminderTime: med.reminderTime || ""  // ← 🆕 reminderTime যোগ করা হয়েছে
    });
    
    setShowModal(true);
  };

  const openViewModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDeleteModal(true);
  };

  const handleNewPrescription = () => {
    setEditMode(false);
    setSelectedPrescription(null);
    resetForm();
    setShowModal(true);
  };

  // =============================================
  // GO BACK TO DASHBOARD
  // =============================================
  const goToDashboard = () => {
    console.log("🔙 ====== BACK BUTTON CLICKED ======");
    console.log("📍 Current path:", window.location.pathname);
    
    try {
      console.log("🔄 Trying React Router navigation...");
      navigate("/doctor/dashboard");
      console.log("✅ React Router navigation called");
      
      setTimeout(() => {
        if (window.location.pathname === "/doctor/dashboard") {
          console.log("✅ Successfully navigated to dashboard");
        } else {
          console.log("⚠️ Still on prescriptions page, trying reload...");
          window.location.href = "/doctor/dashboard";
        }
      }, 500);
      return;
    } catch (error) {
      console.log("⚠️ React Router navigation failed:", error);
    }
    
    console.log("🔄 Using window.location fallback");
    window.location.href = "/doctor/dashboard";
  };

  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPrescriptions.slice(startIndex, endIndex);

  const getMedicationName = (medications) => {
    if (!medications || medications.length === 0) return "N/A";
    const med = medications[0];
    return med.medicineName || med.name || "N/A";
  };

  const getMedicationDosage = (medications) => {
    if (!medications || medications.length === 0) return "";
    const med = medications[0];
    return med.dosage || "";
  };

  if (isLoading) {
    return (
      <div className={`doctor-prescriptions ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>{text[lang].loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`doctor-prescriptions ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Top Bar */}
      <div className="prescriptions-topbar">
        <div className="topbar-left">
          <button 
            className="back-btn" 
            onClick={goToDashboard} 
            title={text[lang].backToDashboard}
          >
            <FaArrowLeft /> {text[lang].backToDashboard}
          </button>
          <h2><FaPrescription className="page-icon" /> {text[lang].prescriptions}</h2>
          <p className="topbar-subtitle">Manage all patient prescriptions</p>
        </div>
        <div className="topbar-right">
          <div className="view-mode-toggle">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <FaTable /> {text[lang].table}
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaThLarge /> {text[lang].grid}
            </button>
            <button 
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Compact View"
            >
              <FaThList /> {text[lang].compact}
            </button>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? text[lang].lightMode : text[lang].darkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? text[lang].lightMode : text[lang].darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-card-icon"><FaFilePrescription /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{prescriptions.length}</span>
            <span className="stat-card-label">{text[lang].total}</span>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-card-icon"><FaUserCheck /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{prescriptions.filter(p => p.status === "active").length}</span>
            <span className="stat-card-label">{text[lang].active}</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-card-icon"><FaHistory /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{prescriptions.filter(p => p.status === "completed").length}</span>
            <span className="stat-card-label">{text[lang].completed}</span>
          </div>
        </div>
        <div className="stat-card expired">
          <div className="stat-card-icon"><FaUserClock /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{prescriptions.filter(p => p.status === "expired").length}</span>
            <span className="stat-card-label">{text[lang].expired}</span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="actions-left">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder={text[lang].search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={handleClearSearch}>
                <FaTimes />
              </button>
            )}
          </div>
          <div className="filter-group">
            <button className={`filter-btn ${filterStatus === "all" ? "active" : ""}`} onClick={() => setFilterStatus("all")}>{text[lang].all}</button>
            <button className={`filter-btn ${filterStatus === "active" ? "active" : ""}`} onClick={() => setFilterStatus("active")}>{text[lang].active}</button>
            <button className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`} onClick={() => setFilterStatus("completed")}>{text[lang].completed}</button>
            <button className={`filter-btn ${filterStatus === "expired" ? "active" : ""}`} onClick={() => setFilterStatus("expired")}>{text[lang].expired}</button>
          </div>
        </div>
        <div className="actions-right">
          <button className="btn-primary" onClick={handleNewPrescription}>
            <FaPlus /> {text[lang].newPrescription}
          </button>
          <button className="btn-secondary"><FaDownload /> {text[lang].export}</button>
          <button className="btn-secondary" onClick={() => window.print()}><FaPrint /> {text[lang].print}</button>
        </div>
      </div>

      {/* Prescriptions Content */}
      <div className="prescriptions-content">
        {currentItems.length === 0 ? (
          <div className="empty-state">
            <FaPrescription className="empty-icon" />
            <h3>{text[lang].noPrescriptions}</h3>
            <p>{text[lang].adjustFilters}</p>
            <button className="btn-primary" onClick={handleNewPrescription}>
              <FaPlus /> {text[lang].newPrescription}
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="prescriptions-grid">
                {currentItems.map(prescription => (
                  <div key={prescription._id || prescription.id} className="prescription-card">
                    <div className="prescription-card-header">
                      <div className="patient-info">
                        <div className="patient-avatar medium">
                          {prescription.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4>{prescription.patientName}</h4>
                          <span className="diagnosis">{prescription.diagnosis}</span>
                        </div>
                      </div>
                      <span className={getStatusBadge(prescription.status)}>
                        {getStatusIcon(prescription.status)} {prescription.status}
                      </span>
                    </div>
                    <div className="prescription-card-body">
                      <div className="medication-info">
                        <FaPills />
                        <div>
                          <strong>{getMedicationName(prescription.medications)}</strong>
                          <span className="dosage">{getMedicationDosage(prescription.medications)}</span>
                        </div>
                      </div>
                      <div className="prescription-meta">
                        <span><FaCalendarAlt /> {formatDate(prescription.date)}</span>
                        <span className="refills-info">Refills: {prescription.refillsUsed}/{prescription.refills}</span>
                      </div>
                    </div>
                    <div className="prescription-card-footer">
                      <button className="action-btn view" onClick={() => openViewModal(prescription)}><FaEye /> View</button>
                      <button className="action-btn edit" onClick={() => openEditModal(prescription)}><FaEdit /> Edit</button>
                      <button className="action-btn delete" onClick={() => openDeleteModal(prescription)}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'compact' ? (
              <div className="compact-list">
                {currentItems.map(prescription => (
                  <div key={prescription._id || prescription.id} className="compact-item">
                    <div className="compact-info">
                      <span className="compact-patient">{prescription.patientName}</span>
                      <span className="compact-medication">
                        {getMedicationName(prescription.medications)} ({getMedicationDosage(prescription.medications)})
                      </span>
                      <span className="compact-date">{formatDate(prescription.date)}</span>
                      <span className={getStatusBadge(prescription.status)}>
                        {getStatusIcon(prescription.status)} {prescription.status}
                      </span>
                    </div>
                    <div className="compact-actions">
                      <button className="action-btn view" onClick={() => openViewModal(prescription)}><FaEye /></button>
                      <button className="action-btn edit" onClick={() => openEditModal(prescription)}><FaEdit /></button>
                      <button className="action-btn delete" onClick={() => openDeleteModal(prescription)}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="prescriptions-table">
                  <thead>
                    <tr>
                      <th>{text[lang].patient}</th>
                      <th>{text[lang].medication}</th>
                      <th>{text[lang].date}</th>
                      <th>{text[lang].status}</th>
                      <th>{text[lang].refills}</th>
                      <th>{text[lang].actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(prescription => (
                      <tr key={prescription._id || prescription.id}>
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar small">
                              {prescription.patientName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="patient-name">{prescription.patientName}</div>
                              <div className="prescription-id">#RX-{String(prescription.id).padStart(4, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="medication-cell">
                            <strong>{getMedicationName(prescription.medications)}</strong>
                            <span className="dosage">{getMedicationDosage(prescription.medications)}</span>
                          </div>
                        </td>
                        <td><div className="date-cell"><FaCalendarAlt /> <span>{formatDate(prescription.date)}</span></div></td>
                        <td><span className={getStatusBadge(prescription.status)}>{getStatusIcon(prescription.status)} {prescription.status}</span></td>
                        <td>
                          <div className="refills-cell">
                            <span>{prescription.refillsUsed}/{prescription.refills}</span>
                            {prescription.refills - prescription.refillsUsed > 0 ? (
                              <span className="refills-available">{text[lang].available}</span>
                            ) : (
                              <span className="refills-exhausted">{text[lang].exhausted}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn view" onClick={() => openViewModal(prescription)} title={text[lang].viewDetails}><FaEye /></button>
                            <button className="action-btn edit" onClick={() => openEditModal(prescription)} title={text[lang].edit}><FaEdit /></button>
                            <button className="action-btn print" onClick={() => window.print()} title={text[lang].print}><FaPrint /></button>
                            <button className="action-btn delete" onClick={() => openDeleteModal(prescription)} title={text[lang].delete}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><FaChevronLeft /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><FaChevronRight /></button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="prescriptions-footer">
        <div className="footer-info">
          <span>Showing {currentItems.length} of {filteredPrescriptions.length} prescriptions</span>
          <span className="footer-divider">•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* 🆕 New/Edit Prescription Modal - reminderTime যোগ করা হয়েছে */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditMode(false); resetForm(); }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? <FaEdit /> : <FaPrescription />} {editMode ? text[lang].editPrescription : text[lang].newPrescriptionTitle}</h3>
              <button className="close-btn" onClick={() => { setShowModal(false); setEditMode(false); resetForm(); setSelectedPrescription(null); }}><FaTimes /></button>
            </div>
            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].selectPatient} *</label>
                  <select name="patientId" className="form-input" value={formData.patientId} onChange={handleInputChange} required>
                    <option value="">{text[lang].selectPatient}</option>
                    {patients.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name || p.fullName || p.patientName} {p.appointmentId ? "✅" : "⚠️ No Appointment"}
                      </option>
                    ))}
                  </select>
                  {formData.patientId && !formData.appointmentId && (
                    <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                      ⚠️ This patient has no active appointment. Please ask them to book one first.
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>{text[lang].patientName} *</label>
                  <input type="text" name="patientName" className="form-input" required value={formData.patientName} onChange={handleInputChange} placeholder={text[lang].patientName} readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].diagnosis} *</label>
                  <input type="text" name="diagnosis" className="form-input" required value={formData.diagnosis} onChange={handleInputChange} placeholder="e.g., Anxiety Disorder" />
                </div>
                <div className="form-group">
                  <label>{text[lang].nextReview}</label>
                  <input type="date" name="nextReview" className="form-input" value={formData.nextReview} onChange={handleInputChange} />
                </div>
              </div>

              {/* 🆕 Medication Details - reminderTime যোগ করা হয়েছে */}
              <div className="form-section">
                <h4><FaPills /> {text[lang].medicationDetails}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>{text[lang].medicationName} *</label>
                    <input type="text" name="medication" className="form-input" required value={formData.medication} onChange={handleInputChange} placeholder="e.g., Sertraline" />
                  </div>
                  <div className="form-group">
                    <label>{text[lang].dosage} *</label>
                    <input type="text" name="dosage" className="form-input" required value={formData.dosage} onChange={handleInputChange} placeholder="e.g., 50mg" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{text[lang].frequency} *</label>
                    <input type="text" name="frequency" className="form-input" required value={formData.frequency} onChange={handleInputChange} placeholder="e.g., Once daily" />
                  </div>
                  <div className="form-group">
                    <label>{text[lang].duration} *</label>
                    <input type="text" name="duration" className="form-input" required value={formData.duration} onChange={handleInputChange} placeholder="e.g., 30 days" />
                  </div>
                </div>
                
                {/* 🆕 reminderTime - নতুন সারি */}
                <div className="form-row">
                  <div className="form-group">
                    <label>⏰ {text[lang].reminderTime}</label>
                    <input 
                      type="time" 
                      name="reminderTime" 
                      className="form-input" 
                      value={formData.reminderTime} 
                      onChange={handleInputChange} 
                    />
                    <small style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      {text[lang].reminderTimeHelp}
                    </small>
                  </div>
                  <div className="form-group">
                    <label>{text[lang].instructions}</label>
                    <input type="text" name="instructions" className="form-input" value={formData.instructions} onChange={handleInputChange} placeholder="e.g., Take with food" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{text[lang].quantity}</label>
                    <input type="text" name="quantity" className="form-input" value={formData.quantity} onChange={handleInputChange} placeholder="e.g., 30 tablets" />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].refillsCount}</label>
                  <input type="number" name="refills" className="form-input" value={formData.refills} onChange={handleInputChange} min="0" max="5" />
                </div>
                <div className="form-group">
                  <label>{text[lang].statusLabel}</label>
                  <select name="status" className="form-input" value={formData.status} onChange={handleInputChange}>
                    <option value="active">{text[lang].active}</option>
                    <option value="completed">{text[lang].completed}</option>
                    <option value="expired">{text[lang].expired}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{text[lang].notes}</label>
                <textarea name="notes" className="form-input" rows="3" value={formData.notes} onChange={handleInputChange} placeholder={text[lang].additionalNotes}></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setEditMode(false); resetForm(); }}>{text[lang].cancel}</button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? <FaSpinner className="spinner" /> : (editMode ? text[lang].update : text[lang].create)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPrescription /> {text[lang].prescriptionDetails}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}><FaTimes /></button>
            </div>
            <div className="details-content">
              <div className="details-header">
                <div className="patient-info-detailed">
                  <div className="patient-avatar large">
                    {selectedPrescription.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3>{selectedPrescription.patientName}</h3>
                    <p><FaStethoscope /> {text[lang].diagnosis}: {selectedPrescription.diagnosis}</p>
                    <p><FaCalendarAlt /> {text[lang].date}: {formatDate(selectedPrescription.date)}</p>
                    <p><FaUserMd /> {text[lang].by}: {selectedPrescription.prescribedBy}</p>
                  </div>
                </div>
                <div className="status-badge-large">
                  <span className={getStatusBadge(selectedPrescription.status)}>
                    {getStatusIcon(selectedPrescription.status)} {selectedPrescription.status}
                  </span>
                </div>
              </div>

              <div className="details-section">
                <h4><FaPills /> {text[lang].medicationInformation}</h4>
                <div className="medication-details">
                  <div className="med-item"><span className="med-label">{text[lang].medicationName}:</span><span className="med-value">{getMedicationName(selectedPrescription.medications)}</span></div>
                  <div className="med-item"><span className="med-label">{text[lang].dosage}:</span><span className="med-value">{getMedicationDosage(selectedPrescription.medications)}</span></div>
                  <div className="med-item"><span className="med-label">{text[lang].frequency}:</span><span className="med-value">{Array.isArray(selectedPrescription.medications) ? selectedPrescription.medications[0]?.frequency : selectedPrescription.medications?.frequency}</span></div>
                  <div className="med-item"><span className="med-label">{text[lang].duration}:</span><span className="med-value">{Array.isArray(selectedPrescription.medications) ? selectedPrescription.medications[0]?.duration : selectedPrescription.medications?.duration}</span></div>
                  <div className="med-item"><span className="med-label">{text[lang].instructions}:</span><span className="med-value">{Array.isArray(selectedPrescription.medications) ? selectedPrescription.medications[0]?.instructions || "N/A" : selectedPrescription.medications?.instructions || "N/A"}</span></div>
                  <div className="med-item"><span className="med-label">{text[lang].quantity}:</span><span className="med-value">{Array.isArray(selectedPrescription.medications) ? selectedPrescription.medications[0]?.quantity || "N/A" : selectedPrescription.medications?.quantity || "N/A"}</span></div>
                </div>
              </div>

              <div className="details-section">
                <h4><FaClipboardList /> {text[lang].additionalInformation}</h4>
                <div className="info-grid">
                  <div className="info-item"><span className="info-label">{text[lang].refillsCount}</span><span className="info-value">{selectedPrescription.refillsUsed}/{selectedPrescription.refills}</span></div>
                  <div className="info-item"><span className="info-label">{text[lang].nextReview}</span><span className="info-value">{formatDate(selectedPrescription.nextReview)}</span></div>
                </div>
                <div className="notes-section">
                  <span className="info-label">{text[lang].notes}</span>
                  <p>{selectedPrescription.notes || text[lang].noAdditionalNotes}</p>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowDetailsModal(false)}>{text[lang].close}</button>
                <button className="submit-btn" onClick={() => { setShowDetailsModal(false); openEditModal(selectedPrescription); }}><FaEdit /> {text[lang].edit}</button>
                <button className="submit-btn print" onClick={() => window.print()}><FaPrint /> {text[lang].print}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrescription && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{text[lang].deletePrescription}</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
            </div>
            <div className="delete-content">
              <FaTrash className="delete-icon" />
              <p>{text[lang].confirmDelete} <strong>{selectedPrescription.patientName}</strong>?</p>
              <p className="delete-warning">{text[lang].cannotUndo}</p>
              <div className="prescription-summary">
                <span><FaPills /> {getMedicationName(selectedPrescription.medications)}</span>
                <span><FaCalendarAlt /> {formatDate(selectedPrescription.date)}</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>{text[lang].cancel}</button>
              <button className="submit-btn danger" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? <FaSpinner className="spinner" /> : text[lang].deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPrescriptions;