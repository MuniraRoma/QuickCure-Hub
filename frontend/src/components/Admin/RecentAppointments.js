// src/pages/Admin/RecentAppointments.jsx
import React, { useState, useEffect } from 'react';
import { getTodayAppointments } from '../../services/appointmentService';
import './RecentAppointments.css';

const RecentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTodayAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'Rejected': 'status-rejected',
      'OPENING': 'status-pending',
    };
    return classes[status] || 'status-default';
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="recent-appointments-card">
        <div className="recent-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-appointments-card">
      <div className="recent-header">
        <h3 className="recent-title">📋 Recent Appointments</h3>
        <div className="recent-controls">
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="no-appointments">No appointments found</p>
      ) : (
        <div className="table-responsive">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt._id}>
                  <td className="patient-cell">{apt.patient}</td>
                  <td className="doctor-cell">{apt.doctor}</td>
                  <td className="time-cell">{apt.time}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentAppointments;