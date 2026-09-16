const NotificationService = require("../services/notificationService");

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
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
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUserUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await NotificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result