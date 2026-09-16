// components/MedicineReminder.js
import React, { useState, useEffect } from 'react';
import '../styles/MedicineReminder.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function MedicineReminder() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [todayMedicines, setTodayMedicines] = useState([]);
  const [upcomingMedicines, setUpcomingMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedMedicine, setExpandedMedicine] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Load prescriptions from API
  useEffect(() => {
    loadPrescriptions();
    requestNotificationPermission();
  }, []);

  // Check for reminders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, [allMedicines]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission === 'granted');
        });
      }
    }
  };

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/prescriptions/patient`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📦 Prescriptions Response:', response.data);

      if (response.data.success) {
        const prescriptionsData = response.data.prescriptions || response.data.data || [];
        setPrescriptions(prescriptionsData);
        processMedicines(prescriptionsData);
      } else {
        setError(response.data.message || 'Failed to load prescriptions');
      }
    } catch (error) {
      console.error('❌ Error loading prescriptions:', error);
      setError(error.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const processMedicines = (prescriptionsData) => {
    const allMeds = [];
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    prescriptionsData.forEach((prescription) => {
      if (prescription.status === 'active' || prescription.status === 'Active') {
        const medicines = prescription.medicines || [];
        medicines.forEach((med) => {
          if (med.isActive !== false) {
            const medData = {
              id: med._id || `${prescription._id}-${Date.now()}`,
              name: med.medicineName || med.name || 'Unknown Medicine',
              dosage: med.dosage || 'As directed',
              frequency: med.frequency || 'As directed',
              duration: med.duration || '7 days',
              instructions: med.instructions || '',
              reminderTime: med.reminderTime || null,
              prescriptionId: prescription._id,
              doctorName: prescription.doctor?.name || 
                          (prescription.doctor?.firstName + ' ' + prescription.doctor?.lastName) || 
                          'Doctor',
              doctorSpecialization: prescription.doctor?.specialization || 'General',
              diagnosis: prescription.diagnosis || '',
              prescriptionStatus: prescription.status,
              appointmentId: prescription.appointment?._id || prescription.appointment,
              createdAt: prescription.createdAt || new Date().toISOString(),
            };
            allMeds.push(medData);
          }
        });
      }
    });

    setAllMedicines(allMeds);

    // Today's medicines (যাদের reminderTime আছে এবং active)
    const today = allMeds.filter((med) => med.reminderTime);
    
    // Upcoming medicines (যাদের reminderTime current time এর পরে)
    const upcoming = allMeds.filter((med) => {
      if (!med.reminderTime) return false;
      return med.reminderTime > currentTimeStr;
    });

    setTodayMedicines(today);
    setUpcomingMedicines(upcoming);
  };

  const checkReminders = () => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    allMedicines.forEach((med) => {
      if (med.reminderTime === currentTimeStr && med.prescriptionStatus === 'active') {
        sendNotification(med.name, med.dosage);
        // Show alert for testing
        console.log(`💊 Reminder: Time to take ${med.name} - ${med.dosage}`);
      }
    });
  };

  const sendNotification = (medicineName, dosage) => {
    if (notificationPermission) {
      new Notification('💊 Medicine Reminder', {
        body: `Time to take ${medicineName} - ${dosage}`,
        icon: '/medicine-icon.png',
        requireInteraction: true,
      });
    }
    playAlertSound();
  };

  const playAlertSound = () => {
    try {
      const audio = new Audio('/Sounds/bell_tipo.mp3');
      audio.play().catch(() => console.log('Audio play failed'));
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const getTimeRemaining = (reminderTime) => {
    if (!reminderTime) return null;
    
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date(now);
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate < now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const diff = reminderDate - now;
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const getStatusBadge = (reminderTime) => {
    if (!reminderTime) return null;

    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date(now);
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate < now) {
      return <span className="reminder-status-passed">⏳ Passed</span>;
    }

    const diff = reminderDate - now;
    const diffMinutes = Math.floor(diff / (1000 * 60));

    if (diffMinutes < 30) {
      return <span className="reminder-status-urgent">🔔 Soon!</span>;
    }

    return <span className="reminder-status-upcoming">⏰ Upcoming</span>;
  };

  const toggleExpand = (id) => {
    setExpandedMedicine(expandedMedicine === id ? null : id);
  };

  // Filter medicines
  const getFilteredMedicines = () => {
    let filtered = todayMedicines;

    if (selectedFilter === 'all') {
      // সব দেখাবে
    } else if (selectedFilter === 'upcoming') {
      filtered = upcomingMedicines;
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="reminder-loading">
        <div className="loading-spinner"></div>
        <p>Loading your medicines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reminder-error">
        <div className="error-icon">❌</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadPrescriptions}>
          🔄 Retry
        </button>
      </div>
    );
  }

  const filteredMedicines = getFilteredMedicines();

  return (
    <div className="medicine-reminder-container">
      {/* Header */}
      <div className="medicine-header">
        <div>
          <h3 className="medicine-header-title">💊 Medicine Reminder</h3>
          <p className="medicine-header-subtitle">
            Your prescribed medicines from doctors
          </p>
        </div>
        <div className="header-stats">
          <span className="stat-badge">
            📋 {prescriptions.length} Prescriptions
          </span>
          <span className="stat-badge">
            💊 {todayMedicines.length} Today
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="reminder-summary-stats">
        <div className="reminder-stat-item">
          <span className="reminder-stat-value">{allMedicines.length}</span>
          <span className="reminder-stat-label">Total Medicines</span>
        </div>
        <div className="reminder-stat-item">
          <span className="reminder-stat-value">{todayMedicines.length}</span>
          <span className="reminder-stat-label">Today's Medicines</span>
        </div>
        <div className="reminder-stat-item">
          <span className="reminder-stat-value">{upcomingMedicines.length}</span>
          <span className="reminder-stat-label">Upcoming</span>
        </div>
        <div className="reminder-stat-item">
          <span className="reminder-stat-value">{prescriptions.length}</span>
          <span className="reminder-stat-label">Prescriptions</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="medicine-search-filter">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            Today
          </button>
          <button
            className={`filter-btn ${selectedFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('upcoming')}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Medicines List */}
      <div className="medicines-list">
        {filteredMedicines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>
              {selectedFilter === 'all' 
                ? 'No medicines scheduled for today' 
                : 'No upcoming medicines'}
            </p>
            {prescriptions.length === 0 && (
              <p className="empty-subtext">
                Visit a doctor to get your first prescription
              </p>
            )}
          </div>
        ) : (
          filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="medicine-item"
              style={{ borderLeftColor: '#00e6ff' }}
            >
              <div className="medicine-item-header" onClick={() => toggleExpand(medicine.id)}>
                <div className="medicine-basic-info">
                  <div className="medicine-name" style={{ color: '#00e6ff' }}>
                    {medicine.name}
                  </div>
                  <div className="medicine-dosage">{medicine.dosage}</div>
                  {medicine.frequency && (
                    <span className="medicine-frequency">{medicine.frequency}</span>
                  )}
                </div>
                <div className="medicine-header-actions">
                  <div className="next-time">
                    ⏰ {medicine.reminderTime || 'No time set'}
                  </div>
                  {getStatusBadge(medicine.reminderTime)}
                </div>
              </div>

              {expandedMedicine === medicine.id && (
                <div className="medicine-item-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>👨‍⚕️ Doctor:</strong> {medicine.doctorName}
                      {medicine.doctorSpecialization && (
                        <span className="doctor-specialization">
                          ({medicine.doctorSpecialization})
                        </span>
                      )}
                    </div>
                    <div className="detail-item">
                      <strong>📋 Diagnosis:</strong> {medicine.diagnosis || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>⏰ Reminder:</strong> {medicine.reminderTime || 'Not set'}
                      {medicine.reminderTime && (
                        <span className="time-remaining">
                          ({getTimeRemaining(medicine.reminderTime)})
                        </span>
                      )}
                    </div>
                    <div className="detail-item">
                      <strong>📅 Duration:</strong> {medicine.duration || '7 days'}
                    </div>
                    {medicine.instructions && (
                      <div className="detail-item full-width">
                        <strong>📝 Instructions:</strong> {medicine.instructions}
                      </div>
                    )}
                    <div className="detail-item full-width">
                      <strong>📌 Prescription ID:</strong> #{medicine.prescriptionId?.slice(-6) || 'N/A'}
                    </div>
                  </div>

                  <div className="medicine-footer-actions">
                    <button
                      className="view-prescription-btn"
                      onClick={() => window.location.href = `/prescriptions/${medicine.prescriptionId}`}
                    >
                      📄 View Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notification Status */}
      <div className="notification-status">
        <p>
          {notificationPermission 
            ? '🔔 Notifications enabled' 
            : '🔕 Notifications disabled. Enable for reminders.'}
        </p>
        {!notificationPermission && (
          <button 
            className="enable-notification-btn"
            onClick={requestNotificationPermission}
          >
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
}

export default MedicineReminder;