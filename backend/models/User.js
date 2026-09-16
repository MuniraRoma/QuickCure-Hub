const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
    accountStatus: {
      type: String,
      enum: ["Active", "Blocked", "Suspended"],
      default: "Active",
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"], // ✅ সব option যোগ করো
      default: "Male",
    },
    birthDate: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);