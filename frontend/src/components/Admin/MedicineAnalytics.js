import React from 'react';
import './MedicineAnalytics.css';

const MedicineAnalytics = ({ data, loading }) => {
  if (loading) {
    return <div className="analytics-card loading-state">Loading Medicine Analytics...</div>;
  }

  if (!data) {
    return <div className="analytics-card empty-state">No medicine data available</div>;
  }

  return (
    <div className="analytics-card">
      <div className="card-header">
        <span className="card-icon">💊</span>
        <h4>Top Medicines</h4>
      </div>
      
      <div className="card-body">
        <div className="stat-row">
          <span className="label">Unique Medicines</span>
          <span className="value">{data.totalUniqueMedicines || 0}</span>
        </div>

        {data.topPrescribedMedicines && data.topPrescribedMedicines.length > 0 && (
          <div className="sub-section">
            <p className="sub-title">Most Prescribed:</p>
            {data.topPrescribedMedicines.slice(0, 5).map((item, idx) => (
              <div key={idx} className="list-item">
                <span className="item-name">{item._id}</span>
                <span className="item-count">{item.totalPrescribed} times</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineAnalytics;