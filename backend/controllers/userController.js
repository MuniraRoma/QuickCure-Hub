const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

// =======================
// ✅ REGISTER
// =======================
exports.register = async (req, res) => {
  try {
    console.log("📥 Registration request received");
    const { firstName, lastName, email, phone, password, gender, birthDate } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      gender: gender || "Male",
      birthDate: birthDate || new Date(),
      accountStatus: "Active",
      role: "patient"
    });

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: "user",
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
      role: "user",
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birthDate: user.birthDate,
        role: user.role
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =======================
// ✅ LOGIN
// =======================
exports.login = async (req, res) => {
  try {
    console.log("📥 Login request received");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      });
    }

    if (user.accountStatus === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked"
      });
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: "user",
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
      role: "user",
    });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birthDate: user.birthDate,
        role: user.role,
        accountStatus: user.accountStatus,
        profileImage: user.profileImage
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =======================
// ✅ PROFILE (FIXED)
// =======================
exports.profile = async (req, res) => {
  try {
    console.log("👤 Profile request received");
    console.log("📋 req.user:", req.user);
    
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId)
      .select("-password -refreshToken -otp -otpExpiry -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User found:", user.email);
    
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// ✅ LOGOUT
// =======================
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// ✅ UPDATE PROFILE
// =======================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { firstName, lastName, phone, gender, birthDate, address, bloodGroup } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = birthDate;
    if (address) user.address = address;
    if (bloodGroup) user.bloodGroup = bloodGroup;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birthDate: user.birthDate,
        address: user.address,
        bloodGroup: user.bloodGroup,
        role: user.role
      },
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// ✅ CHANGE PASSWORD
// =======================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// ✅ REFRESH TOKEN
// =======================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token Required",
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Refresh Token",
      });
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      role: "user",
    });

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};