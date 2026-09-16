// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // 🔥 ফিরিয়ে দেওয়া হলো: 'patient' থেকে 'user'
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // ✅ Keep doctorDetails as backup
    doctorDetails: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      specialization: { type: String, default: "General" },
      profileImage: { type: String, default: "" },
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled", "OPENING"],
      default: "Pending",
    },
    consultationMode: {
      type: String,
      enum: ["In-Person", "Video", "Phone", "Chat", "clinic", "Clinic"],
      default: "In-Person",
    },
    meetingLink: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    doctorResponse: {
      type: String,
      default: "",
    },
    approvedAt: Date,
    rejectedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: {
      type: String,
      default: "",
    },
    // ✅ NEW: Prescription reference added
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Indexes for faster queries
appointmentSchema.index({ user: 1, appointmentDate: -1 }); // 🔥 'user' ফিরিয়ে দেওয়া হয়েছে
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);