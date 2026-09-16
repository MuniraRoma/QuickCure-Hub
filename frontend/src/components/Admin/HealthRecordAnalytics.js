import React from 'react';
import './HealthRecordAnalytics.css';

const HealthRecordAnalytics = ({ data, loading }) => {
  if (loading) {
    return <div className="analytics-card loading-state">Loading Health Records...</div>;
  }

  if (!data) {
    return <div className="analytics-card empty-state">No health record data available</div>;
  }

  return (
    <div className="analytics-card">
      <div className="card-header">
        <span className="card-icon">📋</span>
        <h4>Health Records</h4>
      </div>
      
      <div className="card-body">
        <div className="stat-row">
          <span className="label">Total Records</span>
          <span className="value">{data.totalRecords || 0}</span>
        </div>
        <div className="stat-row">
          <span className="label">This Week</span>
          <span className="value">{data.recordsThisWeek || 0}</span>
        </div>

        {data.diagnosisStats && data.diagnosisStats.length > 0 && (
          <div className="sub-section">
            <p className="sub-title">Top Diagnoses:</p>
            {data.diagnosisStats.slice(0, 3).map((item, idx) => (
              <div key={idx} className="list-item">
                <span className="item-name">{item._id}</span>
                <span className="item-count">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecordAnalytics;