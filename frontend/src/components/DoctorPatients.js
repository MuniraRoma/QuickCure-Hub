// DoctorPatients.js - Complete with Dark/Light Mode and Bangla/English Support
// Connected to Backend API - Shows only registered users who booked appointments
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaUser, FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaPhone, FaEnvelope, FaCalendarAlt, FaChevronLeft,
  FaChevronRight, FaDownload, FaFilter, FaFileAlt,
  FaPrescription, FaChartLine, FaStethoscope, FaHeartbeat,
  FaUserPlus, FaCheck, FaTimes, FaEllipsisV, FaClock,
  FaMoon, FaSun, FaUsers, FaUserCheck, FaUserClock, FaUserSlash,
  FaThLarge, FaList, FaSpinner, FaArrowLeft
} from "react-icons/fa";
import { AppContext } from "../Contexts/AppContexts";
import { getDoctorPatients, searchPatients, updatePatientStatus, deletePatient } from "../services/patientService";
import "../styles/DoctorPatients.css";

function DoctorPatients() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const itemsPerPage = 6;

  // Translation object
  const text = {
    en: {
      patients: "Patients",
      totalPatients: "Total Patients",
      active: "Active",
      inactive: "Inactive",
      addPatient: "Add Patient",
      export: "Export",
      search: "Search patients...",
      all: "All",
      noPatients: "No patients found",
      adjustFilters: "Try adjusting your search or filter",
      view: "View",
      edit: "Edit",
      prescribe: "Prescribe",
      delete: "Delete",
      firstName: "First Name",
      lastName: "Last Name",
      age: "Age",
      gender: "Gender",
      phone: "Phone",
      email: "Email",
      address: "Address",
      bloodGroup: "Blood Group",
      primaryCondition: "Primary Condition",
      cancel: "Cancel",
      add: "Add Patient",
      deletePatient: "Delete Patient",
      confirmDelete: "Are you sure you want to delete",
      cannotUndo: "This action cannot be undone.",
      deleteConfirm: "Delete Patient",
      loading: "Loading patients...",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      gridView: "Grid View",
      listView: "List View",
      lastVisit: "Last visit",
      nextAppointment: "Next Appointment",
      conditions: "Conditions",
      male: "Male",
      female: "Female",
      other: "Other",
      selectGender: "Select Gender",
      years: "yrs",
      viewDetails: "View Details",
      editPatient: "Edit Patient",
      prescribeMedication: "Prescribe Medication",
      noConditions: "No conditions",
      activePatients: "Active",
      inactivePatients: "Inactive",
      total: "Total",
      doctorCannotAdd: "Doctor cannot add new patients. Only view existing patients who booked appointments.",
      noAccess: "You do not have permission to add new patients",
      update: "Update Patient",
      editPatientTitle: "Edit Patient",
      errorLoading: "Failed to load patients. Please try again.",
      retry: "Retry",
      noAppointments: "No patients have booked appointments with you yet.",
      totalVisits: "visits",
      status: "Status",
      actions: "Actions",
      patient: "Patient",
      registered: "Registered",
      lastVisitLabel: "Last Visit",
      bookedWith: "Booked with",
      visitCount: "Visit Count",
      error: "Error",
      updateSuccess: "Patient updated successfully",
      deleteSuccess: "Patient deleted successfully",
      backToDashboard: "Back to Dashboard"
    },
    bn: {
      patients: "রোগী",
      totalPatients: "মোট রোগী",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      addPatient: "রোগী যোগ করুন",
      export: "এক্সপোর্ট",
      search: "রোগী খুঁজুন...",
      all: "সব",
      noPatients: "কোন রোগী পাওয়া যায়নি",
      adjustFilters: "আপনার অনুসন্ধান বা ফিল্টার সামঞ্জস্য করুন",
      view: "দেখুন",
      edit: "সম্পাদনা করুন",
      prescribe: "প্রেসক্রিপশন দিন",
      delete: "মুছুন",
      firstName: "নামের প্রথম অংশ",
      lastName: "নামের শেষ অংশ",
      age: "বয়স",
      gender: "লিঙ্গ",
      phone: "ফোন",
      email: "ইমেল",
      address: "ঠিকানা",
      bloodGroup: "রক্তের গ্রুপ",
      primaryCondition: "প্রাথমিক অবস্থা",
      cancel: "বাতিল",
      add: "রোগী যোগ করুন",
      deletePatient: "রোগী মুছুন",
      confirmDelete: "আপনি কি নিশ্চিত যে আপনি মুছতে চান",
      cannotUndo: "এই পদক্ষেপটি পূর্বাবস্থায় ফেরানো যাবে না।",
      deleteConfirm: "রোগী মুছুন",
      loading: "রোগী লোড হচ্ছে...",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      gridView: "গ্রিড দৃশ্য",
      listView: "তালিকা দৃশ্য",
      lastVisit: "শেষ দেখা",
      nextAppointment: "পরবর্তী অ্যাপয়েন্টমেন্ট",
      conditions: "অবস্থা",
      male: "পুরুষ",
      female: "মহিলা",
      other: "অন্যান্য",
      selectGender: "লিঙ্গ নির্বাচন করুন",
      years: "বছর",
      viewDetails: "বিস্তারিত দেখুন",
      editPatient: "রোগী সম্পাদনা করুন",
      prescribeMedication: "ওষুধ প্রেসক্রিপশন দিন",
      noConditions: "কোন অবস্থা নেই",
      activePatients: "সক্রিয়",
      inactivePatients: "নিষ্ক্রিয়",
      total: "মোট",
      doctorCannotAdd: "ডাক্তার নতুন রোগী যোগ করতে পারেন না। শুধুমাত্র বিদ্যমান রোগী যারা অ্যাপয়েন্টমেন্ট বুক করেছেন তাদের দেখতে পারেন।",
      noAccess: "আপনার নতুন রোগী যোগ করার অনুমতি নেই",
      update: "রোগী আপডেট করুন",
      editPatientTitle: "রোগী সম্পাদনা করুন",
      errorLoading: "রোগী লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      retry: "আবার চেষ্টা করুন",
      noAppointments: "আপনার সাথে এখনো কোনো রোগী অ্যাপয়েন্টমেন্ট বুক করেনি।",
      totalVisits: "ভিজিট",
      status: "স্ট্যাটাস",
      actions: "অ্যাকশন",
      patient: "রোগী",
      registered: "রেজিস্টার্ড",
      lastVisitLabel: "শেষ ভিজিট",
      bookedWith: "বুক করেছেন",
      visitCount: "ভিজিট সংখ্যা",
      error: "ত্রুটি",
      updateSuccess: "রোগী সফলভাবে আপডেট হয়েছে",
      deleteSuccess: "রোগী সফলভাবে মুছে ফেলা হয়েছে",
      backToDashboard: "ড্যাশবোর্ডে ফিরে যান"
    }
  };

  // Load patients from backend
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDoctorPatients();
      if (response.data.success) {
        const { patients: patientData } = response.data.data; 
        
        setPatients(patientData);
        setFilteredPatients(patientData);
        
        // Calculate Stats Locally in Frontend
        const totalPatients = patientData.length;
        const activeCount = patientData.filter(p => p.accountStatus?.toLowerCase() === "active").length;
        const inactiveCount = patientData.filter(p => p.accountStatus?.toLowerCase() === "inactive").length;
        
        setStats({
          total: totalPatients,
          active: activeCount,
          inactive: inactiveCount
        });
      } else {
        setError(response.data.message || text[lang].errorLoading);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setError(error.response?.data?.message || text[lang].errorLoading);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with API
  const handleSearch = async (value) => {
    setSearchTerm(value);
    
    if (value.trim() === "") {
      // Reset to all patients
      applyFilter(filterStatus, patients);
      return;
    }

    try {
      const response = await searchPatients(value);
      if (response.data.success) {
        const results = response.data.data.patients;
        applyFilter(filterStatus, results);
      }
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to local search
      const filtered = patients.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = patient.phone || '';
        const searchLower = value.toLowerCase();
        return fullName.includes(searchLower) || 
               email.includes(searchLower) ||
               phone.includes(searchLower);
      });
      applyFilter(filterStatus, filtered);
    }
  };

  const applyFilter = (filter, patientList = null) => {
    const list = patientList || patients;
    setFilterStatus(filter);
    
    let filtered = list;
    if (filter === "active") {
      filtered = list.filter(p => p.accountStatus?.toLowerCase() === "active");
    } else if (filter === "inactive") {
      filtered = list.filter(p => p.accountStatus?.toLowerCase() === "inactive");
    }
    
    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  // Filter patients locally when filter changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      applyFilter(filterStatus, patients);
    }
  }, [filterStatus, patients]);

  const getStatusBadge = (status) => {
    if (status?.toLowerCase() === "active") {
      return <span className="status-badge active"><FaCheck /> {text[lang].active}</span>;
    }
    return <span className="status-badge inactive"><FaTimes /> {text[lang].inactive}</span>;
  };

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

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '??';
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePatient(selectedPatient._id);
      const updatedPatients = patients.filter(p => p._id !== selectedPatient._id);
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      setStats({
        total: updatedPatients.length,
        active: updatedPatients.filter(p => p.accountStatus?.toLowerCase() === 'active').length,
        inactive: updatedPatients.filter(p => p.accountStatus?.toLowerCase() === 'inactive').length
      });
      setShowDeleteModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert(error.response?.data?.message || "Failed to delete patient");
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      // Update patient status via API
      await updatePatientStatus(updatedPatient._id, { status: updatedPatient.accountStatus });
      
      const updatedPatients = patients.map(p => 
        p._id === updatedPatient._id ? updatedPatient : p
      );
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      setStats({
        total: updatedPatients.length,
        active: updatedPatients.filter(p => p.accountStatus?.toLowerCase() === 'active').length,
        inactive: updatedPatients.filter(p => p.accountStatus?.toLowerCase() === 'inactive').length
      });
      setShowEditModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      alert(error.response?.data?.message || "Failed to update patient");
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPatients.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className={`doctor-patients ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="loading-container">
          <FaSpinner className="spinner-icon" />
          <p>{text[lang].loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`doctor-patients ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{text[lang].error}</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadPatients}>
            {text[lang].retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`doctor-patients ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Top Bar */}
      <div className="patients-topbar">
        <div className="topbar-left">
          {/* Back Button - Navigates to Doctor Dashboard */}
          <button 
            className="back-to-dashboard-btn"
            onClick={() => navigate('/doctor-dashboard')}
            title={text[lang].backToDashboard}
          >
            <FaArrowLeft /> <span>{text[lang].backToDashboard}</span>
          </button>
          <h2><FaUsers className="page-icon" /> {text[lang].patients}</h2>
          <p className="topbar-subtitle">Manage all patient records</p>
        </div>
        <div className="topbar-right">
          <div className="view-mode-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={text[lang].gridView}
            >
              <FaThLarge /> {text[lang].gridView}
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={text[lang].listView}
            >
              <FaList /> {text[lang].listView}
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
          <div className="stat-card-icon"><FaUsers /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.total}</span>
            <span className="stat-card-label">{text[lang].total}</span>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-card-icon"><FaUserCheck /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.active}</span>
            <span className="stat-card-label">{text[lang].active}</span>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-card-icon"><FaUserClock /></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.inactive}</span>
            <span className="stat-card-label">{text[lang].inactive}</span>
          </div>
        </div>
      </div>

      {/* Warning Banner - Doctor cannot add patients */}
      <div className="warning-banner" style={{
        background: darkMode ? '#2d3748' : '#ebf8ff',
        color: darkMode ? '#63b3ed' : '#2b6cb0',
        padding: '10px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: `1px solid ${darkMode ? '#4a5568' : '#bee3f8'}`
      }}>
        <FaUserPlus style={{ fontSize: '20px' }} />
        <span style={{ fontWeight: '500' }}>{text[lang].doctorCannotAdd}</span>
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
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => handleSearch('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <div className="filter-group">
            <button 
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => applyFilter("all")}
            >
              {text[lang].all}
            </button>
            <button 
              className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
              onClick={() => applyFilter("active")}
            >
              {text[lang].active}
            </button>
            <button 
              className={`filter-btn ${filterStatus === "inactive" ? "active" : ""}`}
              onClick={() => applyFilter("inactive")}
            >
              {text[lang].inactive}
            </button>
          </div>
        </div>
        <div className="actions-right">
          <button className="btn-secondary" onClick={() => console.log('Export functionality')}>
            <FaDownload /> {text[lang].export}
          </button>
        </div>
      </div>

      {/* Patients Content */}
      <div className="patients-content">
        {currentItems.length === 0 ? (
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <h3>{searchTerm ? text[lang].noPatients : text[lang].noAppointments}</h3>
            <p>{searchTerm ? text[lang].adjustFilters : text[lang].doctorCannotAdd}</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="patients-grid">
                {currentItems.map(patient => (
                  <div key={patient._id} className="patient-card">
                    <div className="patient-card-header">
                      <div className="patient-avatar large">
                        {patient.profileImage ? (
                          <img src={patient.profileImage} alt={`${patient.firstName} ${patient.lastName}`} />
                        ) : (
                          getInitials(patient.firstName, patient.lastName)
                        )}
                      </div>
                      <div className="patient-card-info">
                        <h3>{patient.firstName} {patient.lastName}</h3>
                        <div className="patient-meta">
                          <span><FaUser /> {patient.age || 'N/A'} {text[lang].years}</span>
                          <span>{patient.gender || 'N/A'}</span>
                          <span><FaHeartbeat /> {patient.bloodGroup || 'N/A'}</span>
                        </div>
                        <div className="patient-tags">
                          <span className="tag">
                            <FaCalendarAlt /> {text[lang].lastVisit}: {formatDate(patient.lastVisit)}
                          </span>
                          {patient.totalVisits && (
                            <span className="tag">
                              {patient.totalVisits} {text[lang].totalVisits}
                            </span>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(patient.accountStatus || 'active')}
                    </div>
                    <div className="patient-card-body">
                      <div className="patient-contact-info">
                        <p><FaPhone /> {patient.phone || 'N/A'}</p>
                        <p><FaEnvelope /> {patient.email || 'N/A'}</p>
                        <p><FaPrescription /> {patient.diagnosis || text[lang].noConditions}</p>
                      </div>
                    </div>
                    <div className="patient-card-footer">
                      <div className="patient-actions">
                        <button 
                          type="button"
                          className="action-btn"
                          onClick={() => navigate(`/doctor/patient/${patient.id || patient._id}`)}
                        >
                          <FaEye /> {text[lang].view}
                        </button>
                        {/* ✅ Prescribe বাটন সম্পূর্ণ সরিয়ে ফেলা হয়েছে */}
                        <button 
                          type="button"
                          className="action-btn delete"
                          onClick={() => handleDelete(patient)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>{text[lang].patient}</th>
                      <th>{text[lang].age}</th>
                      <th>{text[lang].gender}</th>
                      <th>{text[lang].bloodGroup}</th>
                      <th>{text[lang].conditions}</th>
                      <th>{text[lang].status}</th>
                      <th>{text[lang].actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(patient => (
                      <tr key={patient._id}>
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar small">
                              {patient.profileImage ? (
                                <img src={patient.profileImage} alt={`${patient.firstName} ${patient.lastName}`} />
                              ) : (
                                getInitials(patient.firstName, patient.lastName)
                              )}
                            </div>
                            <div>
                              <div className="patient-name">{patient.firstName} {patient.lastName}</div>
                              <div className="patient-contact">
                                <FaPhone /> {patient.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{patient.age || 'N/A'} {text[lang].years}</td>
                        <td>{patient.gender || 'N/A'}</td>
                        <td>{patient.bloodGroup || 'N/A'}</td>
                        <td>
                          <div className="conditions-cell">
                            {patient.diagnosis ? (
                              <span className="condition-tag">{patient.diagnosis}</span>
                            ) : (
                              <span className="no-conditions">{text[lang].noConditions}</span>
                            )}
                          </div>
                        </td>
                        <td>{getStatusBadge(patient.accountStatus || 'active')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              type="button"
                              className="action-btn view"
                              onClick={() => navigate(`/doctor/patient/${patient.id || patient._id}`)}
                              title={text[lang].viewDetails}
                            >
                              <FaEye />
                            </button>
                            {/* ✅ Prescribe বাটন সম্পূর্ণ সরিয়ে ফেলা হয়েছে */}
                            <button 
                              type="button"
                              className="action-btn delete"
                              onClick={() => handleDelete(patient)}
                              title={text[lang].delete}
                            >
                              <FaTrash />
                            </button>
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
                <button 
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="patients-footer">
        <div className="footer-info">
          <span>Showing {currentItems.length} of {filteredPatients.length} patients</span>
          <span className="footer-divider">•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit /> {text[lang].editPatientTitle}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedPatient = {
                ...selectedPatient,
                firstName: formData.get("firstName"),
                lastName: formData.get("lastName"),
                age: parseInt(formData.get("age")),
                gender: formData.get("gender"),
                phone: formData.get("phone"),
                email: formData.get("email"),
                address: formData.get("address"),
                bloodGroup: formData.get("bloodGroup"),
                accountStatus: formData.get("status")
              };
              handleEditPatient(updatedPatient);
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].firstName} *</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    className="form-input" 
                    required 
                    defaultValue={selectedPatient.firstName || ''}
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].lastName} *</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    className="form-input" 
                    required 
                    defaultValue={selectedPatient.lastName || ''}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].age} *</label>
                  <input 
                    type="number" 
                    name="age" 
                    className="form-input" 
                    required 
                    defaultValue={selectedPatient.age || ''}
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].gender} *</label>
                  <select name="gender" className="form-input" required defaultValue={selectedPatient.gender || ''}>
                    <option value="">{text[lang].selectGender}</option>
                    <option value="Male">{text[lang].male}</option>
                    <option value="Female">{text[lang].female}</option>
                    <option value="Other">{text[lang].other}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].phone} *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-input" 
                    required 
                    defaultValue={selectedPatient.phone || ''}
                  />
                </div>
                <div className="form-group">
                  <label>{text[lang].email} *</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-input" 
                    required 
                    defaultValue={selectedPatient.email || ''}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{text[lang].address}</label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-input" 
                  defaultValue={selectedPatient.address || ''}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{text[lang].bloodGroup}</label>
                  <select name="bloodGroup" className="form-input" defaultValue={selectedPatient.bloodGroup || ''}>
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{text[lang].status}</label>
                  <select name="status" className="form-input" defaultValue={selectedPatient.accountStatus?.toLowerCase() || 'active'}>
                    <option value="active">{text[lang].active}</option>
                    <option value="inactive">{text[lang].inactive}</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  {text[lang].cancel}
                </button>
                <button type="submit" className="submit-btn">
                  {text[lang].update}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{text[lang].deletePatient}</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="delete-content">
              <FaTrash className="delete-icon" />
              <p>{text[lang].confirmDelete} <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong>?</p>
              <p className="delete-warning">{text[lang].cannotUndo}</p>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                {text[lang].cancel}
              </button>
              <button className="submit-btn danger" onClick={confirmDelete}>
                {text[lang].deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;