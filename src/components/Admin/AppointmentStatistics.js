// src/pages/Admin/AppointmentStatistics.jsx
import React, { useState, useEffect } from 'react';
import { getAppointmentStatus } from '../../services/appointmentService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './AppointmentStatistics.css';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6B7280'];

const AppointmentStatistics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentStatus();
      const formattedData = Object.entries(response)
        .filter(([key]) => key !== 'success')
        .map(([name, value]) => ({
          name,
          value,
        }));
      setData(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="statistics-card">
        <div className="statistics-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-card">
        <p className="statistics-error">Error loading statistics</p>
      </div>
    );
  }

  return (
    <div className="statistics-card">
      <h3 className="statistics-title">📊 Appointment Status Distribution</h3>
      <div className="statistics-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentStatistics;