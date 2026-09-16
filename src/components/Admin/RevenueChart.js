// src/pages/Admin/RevenueChart.jsx
import React, { useState, useEffect } from 'react';
import { getMonthlyAppointments } from '../../services/appointmentService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './RevenueChart.css';

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getMonthlyAppointments();
      setData(response.monthly || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="revenue-chart-card">
        <div className="revenue-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-chart-card">
      <h3 className="revenue-chart-title">📈 Monthly Appointment Trend</h3>
      <div className="revenue-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="appointments" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorAppointments)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;