const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
      required: true,  // ← এই লাইন যোগ করো
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",  // ← এই লাইন যোগ করো
    },
    birthDate: {
      type: Date,  // ← এই লাইন যোগ করো
    },
    accountStatus: {
      type: String,
      enum: ["Active", "Blocked", "Suspended"],
      default: "Active",  // ← এই লাইন যোগ করো
    },
    role: {
      type: String,
      default: "admin",  // ← এই লাইন যোগ করো
    },
    profileImage: {
      type: String,
      default: "",
    },
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema);