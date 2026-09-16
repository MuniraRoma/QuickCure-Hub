// backend/routes/patientRoutes.js
const express = require("express");
const router = express.Router();
// ✅ আপনার patientRoutes.js এর শুরুর দিকে এই লাইনগুলো যোগ করুন:
const { protect } = require("../middleware/authMiddleware"); // {protect} দিয়ে ইমপোর্ট নিশ্চিত করুন
const { isUser } = require("../middleware/roleMiddleware");   // isUser সঠিকভাবে ইমপোর্ট হচ্ছে কিনা নিশ্চিত করুন
const {
    getDoctorPatients,
    getPatientDetails,
    searchPatients,
    getPatientAppointments,
    updatePatientStatus,
    bulkUpdatePatientStatus,
    getPatientStats
} = require("../controllers/patientController");

const { isDoctor } = require("../middleware/roleMiddleware");

// ✅ All routes are protected and only accessible by doctors

// GET /api/patients/doctor - Get all patients for logged-in doctor
router.get(
    "/doctor",
    protect,
    isDoctor,
    getDoctorPatients
);

// GET /api/patients/stats - Get patient statistics only
router.get(
    "/stats",
    protect,
    isDoctor,
    getPatientStats
);

// GET /api/patients/search?q=searchTerm - Search patients
router.get(
    "/search",
    protect,
    isDoctor,
    searchPatients
);

// GET /api/patients/:patientId - Get single patient details
router.get(
    "/:patientId",
    protect,
    isDoctor,
    getPatientDetails
);

// GET /api/patients/:patientId/appointments - Get patient's appointment history
router.get(
    "/:patientId/appointments",
    protect,
    isDoctor,
    getPatientAppointments
);

// PUT /api/patients/:patientId/status - Update patient status
router.put(
    "/:patientId/status",
    protect,
    isDoctor,
    updatePatientStatus
);

// PUT /api/patients/bulk-status - Bulk update patient statuses
router.put(
    "/bulk-status",
    protect,
    isDoctor,
    bulkUpdatePatientStatus
);

module.exports = router;