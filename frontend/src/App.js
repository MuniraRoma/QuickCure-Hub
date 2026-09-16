import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./Contexts/AppContexts";

import HomePage from "./components/HomePage";
import About from "./components/About";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";

// Doctor
import DoctorDashboard from "./components/DoctorDashboard";
import DoctorAppointments from "./components/DoctorAppointments";
import DoctorPatients from "./components/DoctorPatients";
import DoctorPrescriptions from "./components/DoctorPrescriptions";
import PatientProfile from "./components/PatientProfile";
import DoctorSettings from "./components/DoctorSettings"; // ✅ Import করা হয়েছে

// Admin
import AdminDashboard from "./components/Admin/AdminDashboard";

// User Pages
import FirstAidTips from "./components/FirstAidTips";
import DoctorConsultation from "./components/DoctorConsultation";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User */}
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute allowedRole="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/first-aid" element={<FirstAidTips />} />
          <Route path="/consultation" element={<DoctorConsultation />} />

          {/* ✅ DOCTOR ROUTES - FIXED */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPatients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/patient/:id"
            element={
              <ProtectedRoute allowedRole="doctor">
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />

          {/* 🆕 NEW: Doctor Settings Route Added */}
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;