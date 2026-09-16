const Admin = require("../models/Admin");
const User = require("../models/User");
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
// ✅ Admin Register
// ========================
exports.register = async (req, res) => {
  try {
    console.log("📥 Admin Registration request received");
    console.log("📥 Body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty. Please provide valid data."
      });
    }

    const { firstName, lastName, email, phone, password, gender, birthDate } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: firstName, lastName, email, phone, password"
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please login or use another email.",
      });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount >= 2) {
      return res.status(403).json({
        success: false,
        message: "Only 2 admin accounts are allowed. Please contact the system owner.",
      });
    }

    let normalizedGender = "Male";
    if (gender) {
      const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other'
      };
      normalizedGender = genderMap[gender.toLowerCase()] || gender;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      gender: normalizedGender,
      birthDate: birthDate || new Date(),
      accountStatus: "Active",
      role: "admin"
    });

    const accessToken = generateAccessToken({
      _id: admin._id,
      email: admin.email,
      role: "admin",
    });

    const refreshToken = generateRefreshToken({
      _id: admin._id,
      email: admin.email,
      role: "admin",
    });

    admin.refreshToken = refreshToken;
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin registration successful!",
      accessToken,
      refreshToken,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        gender: admin.gender,
        role: "admin"
      },
    });

  } catch (error) {
    console.error("❌ Admin Registration Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error. Please try again later."
    });
  }
};

// ========================
// ✅ Admin Login
// ========================
exports.login = async (req, res) => {
  try {
    console.log("📥 Admin Login request received");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    if (admin.accountStatus === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    const accessToken = generateAccessToken({
      _id: admin._id,
      email: admin.email,
      role: "admin",
    });

    const refreshToken = generateRefreshToken({
      _id: admin._id,
      email: admin.email,
      role: "admin",
    });

    admin.refreshToken = refreshToken;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      refreshToken,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: "admin",
      },
    });

  } catch (error) {
    console.error("❌ Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Dashboard Stats
// ========================
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: "Pending" });
    const approvedDoctors = await Doctor.countDocuments({ approvalStatus: "Approved" });
    const rejectedDoctors = await Doctor.countDocuments({ approvalStatus: "Rejected" });
    const blockedDoctors = await Doctor.countDocuments({ accountStatus: "Blocked" });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        rejectedDoctors,
        blockedDoctors,
        totalRevenue: 0,
        recentActivities: []
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get All Users
// ========================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken -otp -otpExpiry");
    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get All Doctors
// ========================
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password -refreshToken -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      doctors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Pending Doctors
// ========================
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: "Pending" })
      .select("-password -refreshToken -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Approved Doctors
// ========================
exports.getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: "Approved" })
      .select("-password -refreshToken -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Get Rejected Doctors
// ========================
exports.getRejectedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: "Rejected" })
      .select("-password -refreshToken -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Approve Doctor
// ========================
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.approvalStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Doctor is already approved",
      });
    }

    doctor.isApproved = true;
    doctor.approvalStatus = "Approved";
    doctor.approvedBy = req.user._id;
    doctor.approvedAt = new Date();
    doctor.accountStatus = "Active";
    await doctor.save();

    // ✅ Send approval email
    try {
      await sendEmail(
        doctor.email,
        "QuickCure Hub - Account Approved",
        `Dear Dr. ${doctor.firstName},\n\nYour account has been approved by the admin.\n\nYou can now login to your dashboard and start providing consultations.\n\nThank you,\nQuickCure Hub Team`
      );
    } catch (emailError) {
      console.log("⚠️ Email sending failed:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        approvalStatus: doctor.approvalStatus,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Reject Doctor
// ========================
exports.rejectDoctor = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.approvalStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Doctor is already rejected",
      });
    }

    doctor.isApproved = false;
    doctor.approvalStatus = "Rejected";
    doctor.rejectionReason = rejectionReason || "Registration rejected by admin";
    doctor.accountStatus = "Blocked";
    await doctor.save();

    // ✅ Send rejection email
    try {
      await sendEmail(
        doctor.email,
        "QuickCure Hub - Registration Update",
        `Dear Dr. ${doctor.firstName},\n\nYour registration has been reviewed and rejected.\n\nReason: ${doctor.rejectionReason}\n\nIf you have any questions, please contact the admin.\n\nThank you,\nQuickCure Hub Team`
      );
    } catch (emailError) {
      console.log("⚠️ Email sending failed:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Doctor rejected successfully",
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        approvalStatus: doctor.approvalStatus,
        rejectionReason: doctor.rejectionReason,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Delete Doctor
// ========================
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Block User
// ========================
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = "Blocked";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Activate User
// ========================
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = "Active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User activated successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Admin Profile
// ========================
exports.profile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id)
      .select("-password -refreshToken -otp -otpExpiry");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Admin Logout
// ========================
exports.logout = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.refreshToken = null;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin Logout Successful",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Update Admin Profile
// ========================
exports.updateProfile = async (req, res) => {
  try {
    const forbiddenUpdates = ['password', 'refreshToken', 'otp', 'otpExpiry', 'accountStatus', 'role'];
    const updateData = { ...req.body };
    
    forbiddenUpdates.forEach(field => {
      delete updateData[field];
    });

    const admin = await Admin.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -refreshToken -otp -otpExpiry");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin Profile Updated",
      admin,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// ✅ Admin Change Password
// ========================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password, new password, and confirm new password",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const admin = await Admin.findById(req.user._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
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

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
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

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (admin.otpExpiry < Date.now()) {
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

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

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

    const admin = await Admin.findOne({ refreshToken });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Refresh Token",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'quickcurehub_refresh_secret'
    );

    const accessToken = generateAccessToken({
      _id: admin._id,
      email: admin.email,
      role: "admin",
    });

    res.status(200).json({
      success: true,
      accessToken,
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
// ✅ Analytics Functions
// ========================

// 1. Get Analytics
exports.getAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching analytics...');
    
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find();
    
    const stats = {
      totalAppointments: appointments.length,
      pendingAppointments: 0,
      approvedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      rejectedAppointments: 0,
      openingAppointments: 0
    };

    appointments.forEach(apt => {
      const status = apt.status || 'Pending';
      if (status === 'Pending') stats.pendingAppointments++;
      else if (status === 'Approved') stats.approvedAppointments++;
      else if (status === 'Completed') stats.completedAppointments++;
      else if (status === 'Cancelled') stats.cancelledAppointments++;
      else if (status === 'Rejected') stats.rejectedAppointments++;
      else if (status === 'OPENING') stats.openingAppointments++;
    });

    res.json({ 
      success: true, 
      statistics: stats 
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 2. Get Status Distribution
exports.getStatusDistribution = async (req, res) => {
  try {
    console.log('📊 Fetching status distribution...');
    const Appointment = require('../models/Appointment');
    
    const appointments = await Appointment.find();
    const statusMap = {};

    appointments.forEach(apt => {
      const status = apt.status || 'Pending';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    res.json({ 
      success: true, 
      status: statusMap 
    });

  } catch (error) {
    console.error('❌ Status error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 3. Get Weekly Appointments
exports.getWeeklyAppointments = async (req, res) => {
  try {
    console.log('📊 Fetching weekly appointments...');
    const Appointment = require('../models/Appointment');
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await Appointment.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      weekData.push({ 
        date: days[date.getDay()], 
        appointments: count 
      });
    }

    res.json({ 
      success: true, 
      weeklyData: weekData 
    });

  } catch (error) {
    console.error('❌ Weekly error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 4. Get Monthly Appointments
exports.getMonthlyAppointments = async (req, res) => {
  try {
    console.log('📊 Fetching monthly appointments...');
    const Appointment = require('../models/Appointment');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = await Appointment.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      monthlyData.push({ 
        month: months[date.getMonth()], 
        appointments: count 
      });
    }

    res.json({ 
      success: true, 
      monthlyData: monthlyData 
    });

  } catch (error) {
    console.error('❌ Monthly error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ========================
// ✅ Revenue Functions (Disabled - No Payment Model)
// ========================

// 5. Get Revenue Data (Disabled)
exports.getRevenueData = async (req, res) => {
  try {
    console.log('💰 Revenue data requested but payment module is disabled');
    
    // Return default response without Payment model
    res.json({
      success: true,
      revenue: {
        todayRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        message: "Payment tracking is currently disabled"
      }
    });

  } catch (error) {
    console.error('❌ Revenue error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 6. Get Revenue Trend (Disabled)
exports.getRevenueTrend = async (req, res) => {
  try {
    console.log('📈 Revenue trend requested but payment module is disabled');
    
    const days = parseInt(req.query.days) || 30;
    const trendData = [];

    // Return sample data with zero values
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trendData.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: 0
      });
    }

    res.json({ 
      success: true, 
      trendData: trendData,
      message: "Payment tracking is currently disabled"
    });

  } catch (error) {
    console.error('❌ Revenue trend error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 7. Get Today's Appointments
exports.getTodayAppointments = async (req, res) => {
  try {
    console.log('📅 Fetching today\'s appointments...');
    const Appointment = require('../models/Appointment');
    
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({ date: today })
      .populate('user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .limit(10);

    const formatted = appointments.map(apt => ({
      patient: apt.user ? `${apt.user.firstName} ${apt.user.lastName}` : 'Unknown',
      doctor: apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown',
      time: apt.time || 'N/A',
      status: apt.status || 'Pending',
      payment: apt.payment || 'Unpaid'
    }));

    res.json({ 
      success: true, 
      appointments: formatted 
    });

  } catch (error) {
    console.error('❌ Today appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ========================
// ✅ 8. Get Recent Appointments (with Pagination & Filters) - FIXED DATE & TIME
// ========================
exports.getRecentAppointments = async (req, res) => {
  try {
    console.log('📋 Fetching recent appointments...');
    const Appointment = require('../models/Appointment');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, filterDate, search } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    
    if (filterDate) {
      const today = new Date();
      if (filterDate === 'Today') {
        filter.date = today.toISOString().split('T')[0];
      } else if (filterDate === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filter.date = yesterday.toISOString().split('T')[0];
      } else if (filterDate === 'This Week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filter.createdAt = { $gte: weekAgo };
      } else if (filterDate === 'This Month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filter.createdAt = { $gte: monthAgo };
      }
    }

    if (search) {
      filter.$or = [
        { patient: { $regex: search, $options: 'i' } },
        { doctor: { $regex: search, $options: 'i' } }
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);

    // 📅 ✅ তারিখ ও সময় ফরম্যাট করা (FIXED: appointmentDate & timeSlot ফিল্ড চেক করবে)
    const formatted = appointments.map(apt => ({
      id: apt._id,
      patient: apt.user ? `${apt.user.firstName} ${apt.user.lastName}` : 'Unknown',
      doctor: apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown',
      date: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }) : (apt.date || 'N/A'),
      time: apt.timeSlot || apt.time || 'N/A',
      status: apt.status || 'Pending',
      payment: apt.payment || 'Unpaid',
      amount: apt.amount || 0
    }));

    res.json({
      success: true,
      appointments: formatted,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('❌ Recent appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 9. Get Top Doctors
exports.getTopDoctors = async (req, res) => {
  try {
    console.log('🏆 Fetching top doctors...');
    const Appointment = require('../models/Appointment');
    
    const limit = parseInt(req.query.limit) || 5;

    const topDoctors = await Appointment.aggregate([
      { $match: { doctor: { $ne: null } } },
      { $group: { 
        _id: '$doctor',
        appointments: { $sum: 1 }
      }},
      { $sort: { appointments: -1 } },
      { $limit: limit },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor'
      }},
      { $unwind: '$doctor' },
      { $project: {
        doctorName: { $concat: ['Dr. ', '$doctor.firstName', ' ', '$doctor.lastName'] },
        appointments: 1
      }}
    ]);

    res.json({ 
      success: true, 
      topDoctors: topDoctors 
    });

  } catch (error) {
    console.error('❌ Top doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 10. Get Top Patients
exports.getTopPatients = async (req, res) => {
  try {
    console.log('👤 Fetching top patients...');
    const Appointment = require('../models/Appointment');
    
    const limit = parseInt(req.query.limit) || 5;

    const topPatients = await Appointment.aggregate([
      { $match: { user: { $ne: null } } },
      { $group: { 
        _id: '$user',
        appointments: { $sum: 1 }
      }},
      { $sort: { appointments: -1 } },
      { $limit: limit },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'patient'
      }},
      { $unwind: '$patient' },
      { $project: {
        patientName: { $concat: ['$patient.firstName', ' ', '$patient.lastName'] },
        appointments: 1
      }}
    ]);

    res.json({ 
      success: true, 
      topPatients: topPatients 
    });

  } catch (error) {
    console.error('❌ Top patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===================================================================
// ✅ Health Records, Prescriptions & Medicine Analytics
// ===================================================================

// 11. Get Health Record Analytics
exports.getHealthRecordAnalytics = async (req, res) => {
  try {
    console.log('📋 Fetching Health Record Analytics...');
    const HealthRecord = require('../models/HealthRecord');

    const totalRecords = await HealthRecord.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recordsThisWeek = await HealthRecord.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const diagnosisStats = await HealthRecord.aggregate([
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        recordsThisWeek,
        diagnosisStats
      }
    });

  } catch (error) {
    console.error('❌ Health Record Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================================================================
// ✅ 12. Get Prescription Analytics (UPDATED: Shows Deleted + All)
// ===================================================================
exports.getPrescriptionAnalytics = async (req, res) => {
  try {
    console.log('📝 Fetching Prescription Analytics...');
    const Prescription = require('../models/Prescription');

    // 🔥 1. মোট প্রেসক্রিপশন (Deleted সহ সব)
    const totalPrescriptions = await Prescription.countDocuments({});

    // 🔥 2. গত ৩০ দিনের প্রেসক্রিপশন (Deleted সহ সব)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 🔥 3. সর্বশেষ ৫টি প্রেসক্রিপশন (Deleted সহ সব, পপুলেট করা)
    const latestPrescriptions = await Prescription.find({}) // খালি ব্রেস = সব রেকর্ড
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalPrescriptions,
        recentPrescriptions,
        latestPrescriptions
      }
    });

  } catch (error) {
    console.error('❌ Prescription Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. Get Medicine Analytics
exports.getMedicineAnalytics = async (req, res) => {
  try {
    console.log('💊 Fetching Medicine Analytics...');
    const Prescription = require('../models/Prescription');

    const topMedicines = await Prescription.aggregate([
      { $unwind: "$medicines" },
      { 
        $group: { 
          _id: "$medicines.medicineName",
          totalPrescribed: { $sum: { $ifNull: ["$medicines.quantity", 1] } }
        } 
      },
      { $sort: { totalPrescribed: -1 } },
      { $limit: 10 }
    ]);

    const uniqueMedicines = await Prescription.distinct('medicines.medicineName');

    res.status(200).json({
      success: true,
      data: {
        totalUniqueMedicines: uniqueMedicines.length,
        topPrescribedMedicines: topMedicines
      }
    });

  } catch (error) {
    console.error('❌ Medicine Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};