const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

// ========================
// ✅ Register Doctor
// ========================
exports.register = async (req, res) => {
  try {
    console.log("📥 Doctor Registration request received");
    console.log("📥 Body:", req.body);

    // Check if doctor exists
    const existingDoctor = await Doctor.findOne({
      email: req.body.email,
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email.",
      });
    }

    // Normalize gender
    let gender = req.body.gender || "Male";
    const genderMap = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'Male': 'Male',
      'Female': 'Female',
      'Other': 'Other'
    };
    gender = genderMap[gender] || 'Male';

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // ✅ Create doctor with approval status Pending
    const doctor = await Doctor.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      gender: gender,
      birthDate: req.body.birthDate || new Date(),
      specialization: req.body.specialization,
      qualification: req.body.qualification,
      experience: parseInt(req.body.experience) || 0,
      hospital: req.body.hospital || "",
      consultationFee: parseFloat(req.body.consultationFee) || 0,
      licenseNumber: req.body.licenseNumber,
      address: req.body.address || "",
      university: req.body.university || "",
      graduationYear: parseInt(req.body.graduationYear) || null,
      availableDays: req.body.availableDays || [],
      availableFrom: req.body.availableFrom || "09:00",
      availableTo: req.body.availableTo || "17:00",
      languages: req.body.languages || [],
      bio: req.body.bio || "",
      isApproved: false,
      approvalStatus: "Pending",
      accountStatus: "Active"
    });

    console.log("✅ Doctor saved:", doctor.email);
    console.log("📋 Approval Status:", doctor.approvalStatus);

    // ✅ Send email notification
    try {
      await sendEmail(
        doctor.email,
        "QuickCure Hub - Registration Received",
        `Dear Dr. ${doctor.firstName},\n\nYour registration has been received and is pending admin approval.\n\nYou will receive an email once your account is approved.\n\nThank you,\nQuickCure Hub Team`
      );
    } catch (emailError) {
      console.log("⚠️ Email sending failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Doctor Registration Successful. Waiting for Admin Approval.",
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        approvalStatus: doctor.approvalStatus,
      },
    });

  } catch (error) {
    console.error("❌ Doctor Registration Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed. Please try again.",
    });
  }
};

// ========================
// ✅ Login Doctor
// ========================
exports.login = async (req, res) => {
  try {
    console.log("📥 Doctor Login request received");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // ✅ Check Approval Status
    if (doctor.approvalStatus === "Pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval.",
        approvalStatus: "Pending",
      });
    }

    if (doctor.approvalStatus === "Rejected") {
      return res.status(403).json({
        success: false,
        message: doctor.rejectionReason || "Your registration has been rejected by the admin.",
        approvalStatus: "Rejected",
      });
    }

    // ✅ Check Account Status
    if (doctor.accountStatus === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the Admin.",
        accountStatus: "Blocked",
      });
    }

    if (doctor.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact the Admin.",
        accountStatus: "Suspended",
      });
    }

    // ✅ Verify Password
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // ✅ Generate Tokens with role
    const accessToken = jwt.sign(
      {
        id: doctor._id,
        userId: doctor._id,
        email: doctor.email,
        role: "doctor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      {
        id: doctor._id,
        userId: doctor._id,
        email: doctor.email,
        role: "doctor",
      },
      process.env.JWT_REFRESH_SECRET || 'quickcurehub_refresh_secret',
      { expiresIn: "30d" }
    );

    doctor.refreshToken = refreshToken;
    await doctor.save();

    console.log("✅ Doctor logged in:", doctor.email);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      refreshToken,
      user: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
        gender: doctor.gender,
        specialization: doctor.specialization,
        isApproved: doctor.isApproved,
        approvalStatus: doctor.approvalStatus,
        hospital: doctor.hospital,
        consultationFee: doctor.consultationFee,
        profileImage: doctor.profileImage,
        role: "doctor",
      },
    });

  } catch (error) {
    console.error("❌ Doctor Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
    });
  }
};

// ========================
// ✅ Get Public Doctors (Homepage)
// ========================
exports.getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      approvalStatus: "Approved",
      accountStatus: "Active",
      isApproved: true,
    })
    .select("-password -refreshToken -otp -otpExpiry -__v")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });

  } catch (error) {
    console.error("❌ Get Public Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Doctor Profile (For Settings Page)
// ========================
exports.getProfile = async (req, res) => {
  try {
    console.log("📥 Fetching doctor profile for:", req.user.id);

    const doctor = await Doctor.findById(req.user.id)
      .select("-password -refreshToken -otp -otpExpiry -__v");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log("✅ Doctor profile fetched:", doctor.email);

    res.status(200).json({
      success: true,
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        hospital: doctor.hospital || "",
        address: doctor.address || "",
        profileImage: doctor.profileImage || "",
        gender: doctor.gender || "",
        birthDate: doctor.birthDate || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee || 0,
        licenseNumber: doctor.licenseNumber || "",
        university: doctor.university || "",
        graduationYear: doctor.graduationYear || "",
        availableDays: doctor.availableDays || [],
        availableFrom: doctor.availableFrom || "",
        availableTo: doctor.availableTo || "",
        languages: doctor.languages || [],
        bio: doctor.bio || "",
        isApproved: doctor.isApproved,
        approvalStatus: doctor.approvalStatus,
        accountStatus: doctor.accountStatus,
        rating: doctor.rating || 0,
        isOnline: doctor.isOnline || false,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

// ========================
// ✅ Update Doctor Profile (For Settings Page)
// ========================
exports.updateProfile = async (req, res) => {
  try {
    console.log("📥 Updating doctor profile for:", req.user.id);
    console.log("📥 Update data:", req.body);

    // Fields that cannot be updated from settings
    const forbiddenUpdates = [
      'password', 
      'refreshToken', 
      'otp', 
      'otpExpiry', 
      'isApproved', 
      'approvalStatus', 
      'accountStatus',
      'email', // Email should not be changeable
      '_id',
      'createdAt',
      'updatedAt'
    ];
    
    const updateData = { ...req.body };
    
    // Remove forbidden fields
    forbiddenUpdates.forEach(field => {
      delete updateData[field];
    });

    // Normalize gender if provided
    if (updateData.gender) {
      const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other',
        'Male': 'Male',
        'Female': 'Female',
        'Other': 'Other'
      };
      updateData.gender = genderMap[updateData.gender] || 'Male';
    }

    // Clean empty strings to avoid saving empty values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        updateData[key] = null;
      }
    });

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select("-password -refreshToken -otp -otpExpiry -__v");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log("✅ Doctor profile updated:", doctor.email);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        hospital: doctor.hospital || "",
        address: doctor.address || "",
        profileImage: doctor.profileImage || "",
        gender: doctor.gender || "",
        birthDate: doctor.birthDate || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee || 0,
        licenseNumber: doctor.licenseNumber || "",
        university: doctor.university || "",
        graduationYear: doctor.graduationYear || "",
        availableDays: doctor.availableDays || [],
        availableFrom: doctor.availableFrom || "",
        availableTo: doctor.availableTo || "",
        languages: doctor.languages || [],
        bio: doctor.bio || "",
        isApproved: doctor.isApproved,
        approvalStatus: doctor.approvalStatus,
        accountStatus: doctor.accountStatus,
        rating: doctor.rating || 0,
        isOnline: doctor.isOnline || false,
        updatedAt: doctor.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// ========================
// ✅ Change Password (For Settings Page)
// ========================
exports.changePassword = async (req, res) => {
  try {
    console.log("📥 Changing password for doctor:", req.user.id);
    
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find doctor with password field
    const doctor = await Doctor.findById(req.user.id).select("+password");
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, doctor.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password",
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    doctor.password = hashedPassword;
    await doctor.save();

    console.log("✅ Password changed successfully for:", doctor.email);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("❌ Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

// ========================
// ✅ Logout Doctor
// ========================
exports.logout = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.refreshToken = null;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor Logout Successful",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Forgot Password - Send OTP
// ========================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    doctor.otp = otp;
    doctor.otpExpiry = Date.now() + 10 * 60 * 1000;

    await doctor.save();

    try {
      await sendEmail(
        doctor.email,
        "QuickCure Hub - Password Reset OTP",
        `Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`
      );
    } catch (emailError) {
      console.log("Email sending failed but OTP saved:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp: otp, // For testing only - remove in production
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Verify OTP
// ========================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (doctor.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Reset Password
// ========================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    doctor.password = hashedPassword;
    doctor.otp = null;
    doctor.otpExpiry = null;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successful",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Refresh Token
// ========================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token Required",
      });
    }

    const doctor = await Doctor.findOne({ refreshToken });

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid Refresh Token",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'quickcurehub_refresh_secret'
    );

    const newAccessToken = generateAccessToken({
      _id: doctor._id,
      email: doctor.email,
      role: "doctor",
    });

    const newRefreshToken = generateRefreshToken({
      _id: doctor._id,
      email: doctor.email,
      role: "doctor",
    });

    doctor.refreshToken = newRefreshToken;
    await doctor.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Refresh Token",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Patient Profile & Medical History for Doctor View
// ========================
exports.getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    const User = require("../models/User");
    const Appointment = require("../models/Appointment");

    const patient = await User.findById(patientId)
      .select("firstName lastName email phone age gender bloodGroup address profileImage accountStatus");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const medicalHistory = await Appointment.find({
      patient: patientId,
      doctor: doctorId
    })
    .sort({ createdAt: -1 })
    .select("date status diagnosis notes prescription createdAt");

    res.status(200).json({
      success: true,
      data: {
        profile: patient,
        history: medicalHistory
      }
    });

  } catch (error) {
    console.error("❌ Error fetching patient profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error fetching patient details"
    });
  }
};