// src/pages/Admin/TopPatients.jsx
import React, { useState, useEffect } from 'react';
import { getTopPatients } from '../../services/appointmentService';
import './TopPatients.css';

const TopPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTopPatients(5);
      setPatients(response.topPatients || []);
    } catch (error) {
      console.error('Error fetching top patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="top-patients-card">
        <div className="top-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      </div>
    );
  }

  const maxAppointments = patients.length > 0 ? Math.max(...patients.map(p => p.appointments)) : 1;

  return (
    <div className="top-patients-card">
      <h3 className="top-patients-title">👤 Top Patients</h3>
      {patients.length === 0 ? (
        <p className="no-data">No data available</p>
      ) : (
        <div className="patients-list">
          {patients.map((patient, index) => (
            <div key={index} className="patient-item">
              <div className="patient-info">
                <span className="patient-rank">#{index + 1}</span>
                <span className="patient-name">{patient.patientName}</span>
              </div>
              <div className="patient-bar-wrapper">
                <div 
                  className="patient-bar" 
                  style={{ 
                    width: `${(patient.appointments / maxAppointments) * 100}%`,
                    background: `hsl(${index * 40 + 300}, 70%, 50%)`
                  }}
                ></div>
                <span className="patient-count">{patient.appointments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopPatients;