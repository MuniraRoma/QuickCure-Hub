import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./Contexts/AppContexts";

// Public Pages
import HomePage from "./components/HomePage";
import About from "./components/About";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Register from "./components/Register";

// User Pages
import UserProfile from "./components/UserProfile";
import FirstAidTips from "./components/FirstAidTips";
import DoctorConsultation from "./components/DoctorConsultation";

// Doctor Pages
import DoctorDashboard from "./components/DoctorDashboard";
import DoctorAppointments from "./components/DoctorAppointments";
import DoctorPatients from "./components/DoctorPatients";
import DoctorPrescriptions from "./components/DoctorPrescriptions";
import PatientProfile from "./components/PatientProfile";
import DoctorSettings from "./components/DoctorSettings"; // ✅ যোগ করুন

// Admin Pages
import AdminDashboard from "./components/Admin/AdminDashboard";

// ProtectedRoute কম্পোনেন্ট
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AppProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Routes */}
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/first-aid" element={<FirstAidTips />} />
        <Route path="/consultation" element={<DoctorConsultation />} />
        <Route path="/DoctorConsultation" element={<DoctorConsultation />} />
        
        {/* Doctor Routes (Protected) */}
        <Route
          path="/doctor-dashboard"
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
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorPrescriptions />
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
        
        {/* ✅ Doctor Settings Route - যোগ করুন */}
        <Route
          path="/doctor/settings"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorSettings />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      
      </Routes>
    </AppProvider>
  </BrowserRouter>
);