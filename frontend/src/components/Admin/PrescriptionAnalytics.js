import React from 'react';
import './PrescriptionAnalytics.css';

const PrescriptionAnalytics = ({ data, loading }) => {
  if (loading) {
    return <div className="analytics-card loading-state">Loading Prescriptions...</div>;
  }

  if (!data) {
    return <div className="analytics-card empty-state">No prescription data available</div>;
  }

  return (
    <div className="analytics-card">
      <div className="card-header">
        <span className="card-icon">📝</span>
        <h4>Prescriptions</h4>
      </div>
      
      <div className="card-body">
        <div className="stat-row">
          <span className="label">Total Prescriptions</span>
          {/* 🔥 যদি data.totalPrescriptions এর মানে কনফিউশন থাকে, তবে সরাসরি latestPrescriptions.length দেখানো নিরাপদ */}
          <span className="value">{data.latestPrescriptions ? data.latestPrescriptions.length : (data.totalPrescriptions || 0)}</span>
        </div>
        <div className="stat-row">
          <span className="label">Last 30 Days</span>
          <span className="value">{data.recentPrescriptions || 0}</span>
        </div>

        {data.latestPrescriptions && data.latestPrescriptions.length > 0 && (
          <div className="sub-section">
            <p className="sub-title">Latest Prescriptions:</p>
            {/* 🔥 .slice(0, 3) সরিয়ে দেওয়া হয়েছে। এখন ব্যাকএন্ড থেকে আসা ৫টি (বা সব) প্রেসক্রিপশন দেখাবে */}
            {data.latestPrescriptions.map((item, idx) => (
              <div key={idx} className="list-item">
                <span className="patient-name">
                  {item.patient?.firstName} {item.patient?.lastName}
                </span>
                <span className="doctor-name">
                  (Dr. {item.doctor?.firstName})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionAnalytics;