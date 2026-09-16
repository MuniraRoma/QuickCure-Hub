// app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// ✅ Import Routes
const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes"); // ✅ প্রেসক্রিপশন রাউট যোগ করুন
const healthRecordsRoutes = require("./routes/healthRecords"); // ✅ হেলথ রেকর্ড রাউট

// ✅ Log route imports
console.log("✅ Routes imported:");
console.log("  - userRoutes:", typeof userRoutes);
console.log("  - doctorRoutes:", typeof doctorRoutes);
console.log("  - adminRoutes:", typeof adminRoutes);
console.log("  - appointmentRoutes:", typeof appointmentRoutes);
console.log("  - paymentRoutes:", typeof paymentRoutes);
console.log("  - patientRoutes:", typeof patientRoutes);
console.log("  - prescriptionRoutes:", typeof prescriptionRoutes); // ✅ NEW
console.log("  - healthRecordsRoutes:", typeof healthRecordsRoutes); // ✅ NEW

// ✅ Mount Routes
app.use("/api/user", userRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes); // ✅ প্রেসক্রিপশন রাউট মাউন্ট
app.use("/api/health-records", healthRecordsRoutes); // ✅ হেলথ রেকর্ড রাউট মাউন্ট

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QuickCure Hub Backend Running",
    endpoints: {
      user: "/api/user",
      doctor: "/api/doctor",
      admin: "/api/admin",
      appointments: "/api/appointments",
      payment: "/api/payment",
      patients: "/api/patients",
      prescriptions: "/api/prescriptions", // ✅ যোগ করুন
      healthRecords: "/api/health-records", // ✅ যোগ করুন
    }
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    available_endpoints: [
      "/api/user",
      "/api/doctor",
      "/api/admin",
      "/api/appointments",
      "/api/payment",
      "/api/patients",
      "/api/prescriptions",
      "/api/health-records",
    ]
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;