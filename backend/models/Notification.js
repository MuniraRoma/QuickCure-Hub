const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["appointment", "medicine", "system", "admin", "doctor", "followup",],
      default: "system",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    link: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Virtual for unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ user: userId, isRead: false, isDeleted: false });
};

// Mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

module.exports = mongoose.model("Notification", notificationSchema);