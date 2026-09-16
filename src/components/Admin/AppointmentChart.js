// src/pages/Admin/AppointmentChart.jsx
import React, { useState, useEffect } from 'react';
import { getWeeklyAppointments, getMonthlyAppointments } from '../../services/appointmentService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AppointmentChart.css';

const AppointmentChart = ({ type = 'weekly' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let response;
      if (type === 'weekly') {
        response = await getWeeklyAppointments();
        setData(response.weekly || []);
      } else {
        response = await getMonthlyAppointments();
        setData(response.monthly || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getConfig = () => {
    if (type === 'weekly') {
      return {
        title: '📅 Weekly Appointments',
        dataKey: 'date',
        color: '#10B981',
        ChartComponent: BarChart,
        ChartType: Bar,
      };
    }
    return {
      title: '📊 Monthly Appointments',
      dataKey: 'month',
      color: '#8B5CF6',
      ChartComponent: LineChart,
      ChartType: Line,
    };
  };

  const config = getConfig();
  const ChartComponent = config.ChartComponent;
  const ChartType = config.ChartType;

  if (loading) {
    return (
      <div className="appointment-chart-card">
        <div className="chart-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-chart-card">
      <h3 className="appointment-chart-title">{config.title}</h3>
      <div className="appointment-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.dataKey} />
            <YAxis />
            <Tooltip />
            <ChartType 
              type="monotone" 
              dataKey="appointments" 
              fill={config.color}
              stroke={config.color}
              fillOpacity={0.6}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentChart;