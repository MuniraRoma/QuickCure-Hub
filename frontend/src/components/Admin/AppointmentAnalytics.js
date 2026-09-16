// src/pages/Admin/AppointmentAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAppointmentAnalytics, 
  getTodayAppointments,
  getRevenueAnalytics 
} from '../../services/appointmentService';
import AppointmentStatistics from './AppointmentStatistics';
import RevenueChart from './RevenueChart';
import AppointmentChart from './AppointmentChart';
import RecentAppointments from './RecentAppointments';
import TopDoctors from './TopDoctors';
import TopPatients from './TopPatients';
import './AppointmentAnalytics.css';

const AppointmentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, todayData, revenueData] = await Promise.all([
        getAppointmentAnalytics(),
        getTodayAppointments(),
        getRevenueAnalytics(),
      ]);

      setAnalytics(analyticsData.statistics);
      setTodayAppointments(todayData.appointments || []);
      setRevenue(revenueData);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Appointments',
      value: analytics?.totalAppointments || 0,
      icon: '📅',
      color: 'blue',
    },
    {
      title: 'Pending',
      value: analytics?.pendingAppointments || 0,
      icon: '⏳',
      color: 'yellow',
    },
    {
      title: 'Approved',
      value: analytics?.approvedAppointments || 0,
      icon: '✅',
      color: 'green',
    },
    {
      title: 'Completed',
      value: analytics?.completedAppointments || 0,
      icon: '✔️',
      color: 'emerald',
    },
    {
      title: 'Cancelled',
      value: analytics?.cancelledAppointments || 0,
      icon: '❌',
      color: 'red',
    },
    {
      title: 'Rejected',
      value: analytics?.rejectedAppointments || 0,
      icon: '⚠️',
      color: 'gray',
    },
  ];

  if (loading) {
    return (
      <div className="analytics-loader">
        <div className="loader-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Appointment Analytics</h1>
        <p>Real-time insights and analytics for your healthcare practice</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {revenue && (
        <div className="revenue-grid">
          <div className="revenue-card revenue-today">
            <p className="revenue-label">Today's Revenue</p>
            <p className="revenue-amount">৳{revenue.todayRevenue?.toLocaleString() || 0}</p>
          </div>
          <div className="revenue-card revenue-monthly">
            <p className="revenue-label">Monthly Revenue</p>
            <p className="revenue-amount">৳{revenue.monthlyRevenue?.toLocaleString() || 0}</p>
          </div>
          <div className="revenue-card revenue-yearly">
            <p className="revenue-label">Yearly Revenue</p>
            <p className="revenue-amount">৳{revenue.yearlyRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      <div className="charts-row">
        <AppointmentStatistics />
        <RevenueChart />
      </div>

      <div className="charts-row">
        <AppointmentChart type="weekly" />
        <AppointmentChart type="monthly" />
      </div>

      <div className="charts-row">
        <TopDoctors />
        <TopPatients />
      </div>

      <div className="recent-section">
        <RecentAppointments />
      </div>
    </div>
  );
};

export default AppointmentAnalytics;