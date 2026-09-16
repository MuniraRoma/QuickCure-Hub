const Notification = require("../models/Notification");
const User = require("../models/User");
const Doctor = require("../models/Doctor");  // ← 🆕 Doctor Model যোগ করো
const { sendEmail: sendEmailService } = require("./emailService");

class NotificationService {
  static async createNotification({
    userId,
    title,
    message,
    type = "system",
    priority = "medium",
    link = null,
    metadata = {},
    sendEmail = false,
    emailTemplate = null,
    emailData = {},
  }) {
    try {
      // Save notification to database
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        priority,
        link,
        metadata,
      });

      // ✅ Send email if requested
      if (sendEmail) {
        // ✅ প্রথমে User-এ খোঁজো, না পেলে Doctor-এ খোঁজো
        let user = await User.findById(userId)
          .select("email firstName lastName");
        let isDoctor = false;

        if (!user) {
          // User না পেলে Doctor-এ খোঁজো
          user = await Doctor.findById(userId)
            .select("email firstName lastName");
          isDoctor = true;
        }

        if (user && user.email) {
          // ✅ ডাক্তার হলে "Dr." যোগ করো
          const displayName = isDoctor
            ? `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
            : `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Patient";

          console.log(`📧 Sending email to: ${user.email} (${isDoctor ? 'Doctor' : 'Patient'})`);

          await sendEmailService({
            to: user.email,
            subject: title,
            template: emailTemplate,
            templateData: {
              patientName: displayName,
              ...emailData,
            },
          });
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          console.log(`⚠️ No email found for user ${userId}`);
        }
      }

      return notification;
    } catch (error) {
      console.error("❌ Notification creation error:", error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 20, skip = 0) {
    try {
      const notifications = await Notification.find({
        user: userId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const unreadCount = await Notification.countDocuments({
        user: userId,
        isRead: false,
        isDeleted: false,
      });

      const total = await Notification.countDocuments({
        user: userId,
        isDeleted: false,
      });

      return {
        notifications,
        unreadCount,
        total,
      };
    } catch (error) {
      console.error("❌ Get notifications error:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("❌ Mark as read error:", error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return result;
    } catch (error) {
      console.error("❌ Mark all as read error:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("❌ Delete notification error:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;