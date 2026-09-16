const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPrescriptionByAppointment,
  getPrescriptionStatistics,
  // ⚠️ গুরুত্বপূর্ণ: কন্ট্রোলারে এই ফাংশনটি অবশ্যই যোগ করতে হবে
  getAdminRecentPrescriptions 
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");

// =============================================
// 🔒 সব রাউটে অথেন্টিকেশন প্রয়োজন
// =============================================
router.use(protect);

// =============================================
// 📝 প্রেসক্রিপশন তৈরি (শুধুমাত্র ডাক্তার)
// =============================================
// POST /api/prescriptions
// Body: { appointmentId, diagnosis, medicines, notes, followUpDate }
router.post("/", createPrescription);

// =============================================
// 📋 প্রেসক্রিপশন তালিকা
// =============================================
// GET /api/prescriptions/doctor - ডাক্তারের সব প্রেসক্রিপশন
router.get("/doctor", getDoctorPrescriptions);

// GET /api/prescriptions/patient - রোগীর সব প্রেসক্রিপশন
router.get("/patient", getPatientPrescriptions);

// =============================================
// 📊 প্রেসক্রিপশন পরিসংখ্যান
// =============================================
// GET /api/prescriptions/statistics
router.get("/statistics", getPrescriptionStatistics);

// =============================================
// 🆕 NEW: অ্যাডমিনের জন্য সাম্প্রতিক প্রেসক্রিপশন
// =============================================
// GET /api/prescriptions/admin/recent
router.get("/admin/recent", getAdminRecentPrescriptions);

// =============================================
// 🔍 অ্যাপয়েন্টমেন্ট অনুযায়ী প্রেসক্রিপশন খোঁজ
// =============================================
// GET /api/prescriptions/appointment/:appointmentId
router.get("/appointment/:appointmentId", getPrescriptionByAppointment);

// =============================================
// 👀 একটি প্রেসক্রিপশন দেখতে, আপডেট বা ডিলিট করতে
// =============================================
// GET /api/prescriptions/:id - প্রেসক্রিপশন ডিটেইলস
router.get("/:id", getPrescriptionById);

// PUT /api/prescriptions/:id - প্রেসক্রিপশন আপডেট (শুধুমাত্র ডাক্তার)
router.put("/:id", updatePrescription);

// DELETE /api/prescriptions/:id - প্রেসক্রিপশন ডিলিট (শুধুমাত্র ডাক্তার)
router.delete("/:id", deletePrescription);

module.exports = router;