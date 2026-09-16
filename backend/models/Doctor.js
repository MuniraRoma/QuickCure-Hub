const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    birthDate: {
      type: Date,
    },
    accountStatus: {
      type: String,
      enum: ["Active", "Blocked", "Suspended"],
      default: "Active",
    },
    // ✅ Doctor specific fields
    specialization: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    hospital: {
      type: String,
      default: "",
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    university: {
      type: String,
      default: "",
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    availableDays: {
      type: [String],
      default: [],
    },
    availableFrom: {
      type: String,
      default: "09:00",
    },
    availableTo: {
      type: String,
      default: "17:00",
    },
    languages: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    // ✅ Authentication
    refreshToken: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    // ✅ Doctor Approval System
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);