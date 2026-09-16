const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Public Routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Only keep these if they exist in adminController
if (adminController.refreshToken)
  router.post('/refresh-token', adminController.refreshToken);

if (adminController.forgotPassword)
  router.post('/forgot-password', adminController.forgotPassword);

if (adminController.verifyOTP)
  router.post('/verify-otp', adminController.verifyOTP);

if (adminController.resetPassword)
  router.post('/reset-password', adminController.resetPassword);

// Protected Routes
router.get('/profile', protect, adminController.profile);
router.put('/profile', protect, adminController.updateProfile);
router.post('/logout', protect, adminController.logout);
router.put('/change-password', protect, adminController.changePassword);

// Dashboard
router.get('/dashboard', protect, adminController.getDashboard);
router.get('/users', protect, adminController.getUsers);

// Doctors
router.get('/doctors', protect, adminController.getDoctors);
router.get('/doctors/pending', protect, adminController.getPendingDoctors);
router.get('/doctors/approved', protect, adminController.getApprovedDoctors);
router.get('/doctors/rejected', protect, adminController.getRejectedDoctors);

router.put('/doctors/:id/approve', protect, adminController.approveDoctor);
router.put('/doctors/:id/reject', protect, adminController.rejectDoctor);
router.delete('/doctors/:id', protect, adminController.deleteDoctor);

// Users
router.put('/users/:id/block', protect, adminController.blockUser);
router.put('/users/:id/activate', protect, adminController.activateUser);

// Analytics
if (adminController.getAnalytics)
  router.get('/analytics', protect, adminController.getAnalytics);

if (adminController.getStatusDistribution)
  router.get('/status', protect, adminController.getStatusDistribution);

if (adminController.getWeeklyAppointments)
  router.get('/weekly', protect, adminController.getWeeklyAppointments);

if (adminController.getMonthlyAppointments)
  router.get('/monthly', protect, adminController.getMonthlyAppointments);

// Revenue
if (adminController.getRevenueData)
  router.get('/revenue', protect, adminController.getRevenueData);

if (adminController.getRevenueTrend)
  router.get('/revenue-trend', protect, adminController.getRevenueTrend);

// Appointments
if (adminController.getTodayAppointments)
  router.get('/today', protect, adminController.getTodayAppointments);

if (adminController.getRecentAppointments)
  router.get('/recent', protect, adminController.getRecentAppointments);

// Top Lists
if (adminController.getTopDoctors)
  router.get('/top-doctors', protect, adminController.getTopDoctors);

if (adminController.getTopPatients)
  router.get('/top-patients', protect, adminController.getTopPatients);


// ==========================================================
// ✅ NEWLY ADDED: Health Records, Prescriptions & Medicine Routes
// ==========================================================
if (adminController.getHealthRecordAnalytics)
  router.get('/analytics/health-records', protect, adminController.getHealthRecordAnalytics);

if (adminController.getPrescriptionAnalytics)
  router.get('/analytics/prescriptions', protect, adminController.getPrescriptionAnalytics);

if (adminController.getMedicineAnalytics)
  router.get('/analytics/medicines', protect, adminController.getMedicineAnalytics);


// Refresh
router.post('/refresh', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard data refreshed successfully',
    timestamp: new Date().toISOString()
  });
});

// Test Route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes working'
  });
});

module.exports = router;