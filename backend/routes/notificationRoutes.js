// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');

// ✅ authMiddleware থেকে protect ব্যবহার করো
const { protect } = require('../middleware/authMiddleware');

// ============================================
// 📌 GET ALL NOTIFICATIONS
// ============================================
// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { limit = 20, skip = 0 } = req.query;

    const result = await NotificationService.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// 📌 GET UNREAD COUNT
// ============================================
// GET /api/notifications/unread
router.get('/unread', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const Notification = require('../models/Notifications');
    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// 📌 MARK AS READ
// ============================================
// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await NotificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// 📌 MARK ALL AS READ
// ============================================
// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const result = await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// 📌 DELETE NOTIFICATION
// ============================================
// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await NotificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;