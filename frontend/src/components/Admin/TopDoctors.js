// src/pages/Admin/TopDoctors.jsx
import React, { useState, useEffect } from 'react';
import { getTopDoctors } from '../../services/appointmentService';
import './TopDoctors.css';

const TopDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTopDoctors(5);
      setDoctors(response.topDoctors || []);
    } catch (error) {
      console.error('Error fetching top doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="top-doctors-card">
        <div className="top-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      </div>
    );
  }

  const maxAppointments = doctors.length > 0 ? Math.max(...doctors.map(d => d.appointments)) : 1;

  return (
    <div className="top-doctors-card">
      <h3 className="top-doctors-title">👨‍⚕️ Top Doctors</h3>
      {doctors.length === 0 ? (
        <p className="no-data">No data available</p>
      ) : (
        <div className="doctors-list">
          {doctors.map((doctor, index) => (
            <div key={index} className="doctor-item">
              <div className="doctor-info">
                <span className="doctor-rank">#{index + 1}</span>
                <span className="doctor-name">{doctor.doctorName}</span>
              </div>
              <div className="doctor-bar-wrapper">
                <div 
                  className="doctor-bar" 
                  style={{ 
                    width: `${(doctor.appointments / maxAppointments) * 100}%`,
                    background: `hsl(${index * 40 + 200}, 70%, 50%)`
                  }}
                ></div>
                <span className="doctor-count">{doctor.appointments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopDoctors;