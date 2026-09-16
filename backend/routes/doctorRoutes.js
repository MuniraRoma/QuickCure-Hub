const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');

// ========================
// ✅ Public Routes
// ========================
router.post('/register', doctorController.register);
router.post('/login', doctorController.login);
router.post('/refresh-token', doctorController.refreshToken);
router.post('/forgot-password', doctorController.forgotPassword);
router.post('/verify-otp', doctorController.verifyOTP);
router.post('/reset-password', doctorController.resetPassword);
router.get('/public', doctorController.getPublicDoctors);

// ========================
// ✅ Protected Routes
// ========================
router.use(protect); // All routes below this line are protected

// 📌 Profile Management (Settings Page)
router.get('/profile', doctorController.getProfile);          // GET: Load profile data
router.put('/update-profile', doctorController.updateProfile); // PUT: Update profile
router.put('/change-password', doctorController.changePassword); // PUT: Change password
router.post('/logout', doctorController.logout);              // POST: Logout

// 📌 Patient Management
router.get('/patient/:patientId', doctorController.getPatientProfile);

module.exports = router;