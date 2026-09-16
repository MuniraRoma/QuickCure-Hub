const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

// ✅ এই লাইনটি দিয়ে প্রতিস্থাপন করুন:
const { protect } = require("../middleware/authMiddleware");
const { isUser, isDoctor } = require("../middleware/roleMiddleware");

// =============================================
// ✅ USER APPOINTMENT ROUTES - BOTH OLD AND NEW
// =============================================

// Create Appointment
router.post("/", protect, isUser, appointmentController.createAppointment);
router.post("/book", protect, isUser, appointmentController.createAppointment);

// =============================================
// ✅ OLD ROUTES (Keep for backward compatibility)
// =============================================

// My Appointments - OLD
router.get("/my-appointments", protect, isUser, appointmentController.getMyAppointments);

// Statistics - OLD
router.get("/my-statistics", protect, isUser, appointmentController.getAppointmentStatistics);

// Cancel Appointment - OLD
router.put("/cancel/:id", protect, isUser, appointmentController.cancelAppointment);

// Prescription - OLD
router.get("/prescription/:id", protect, isUser, appointmentController.getPrescription);

// =============================================
// ✅ NEW ROUTES (For Frontend compatibility)
// =============================================

// My Appointments - NEW
router.get("/my", protect, isUser, appointmentController.getMyAppointments);

// Statistics - NEW
router.get("/statistics", protect, isUser, appointmentController.getAppointmentStatistics);

// Cancel Appointment - NEW
router.put("/:id/cancel", protect, isUser, appointmentController.cancelAppointment);

// Prescription - NEW
router.get("/:id/prescription", protect, isUser, appointmentController.getPrescription);

// =============================================
// ✅ DOCTOR ROUTES
// =============================================

// Get Doctor Appointments
router.get("/doctor", protect, isDoctor, appointmentController.getDoctorAppointments);

// Approve - OLD
router.put("/approve/:id", protect, isDoctor, appointmentController.approveAppointment);

// Approve - NEW
router.put("/:id/approve", protect, isDoctor, appointmentController.approveAppointment);

// Reject - OLD
router.put("/reject/:id", protect, isDoctor, appointmentController.rejectAppointment);

// Reject - NEW
router.put("/:id/reject", protect, isDoctor, appointmentController.rejectAppointment);

// Complete - OLD
router.put("/complete/:id", protect, isDoctor, appointmentController.completeAppointment);

// Complete - NEW
router.put("/:id/complete", protect, isDoctor, appointmentController.completeAppointment);

// =============================================
// ✅ GET APPOINTMENT BY ID - ALWAYS KEEP THIS LAST
// =============================================
router.get("/:id", protect, appointmentController.getAppointmentById);

module.exports = router;