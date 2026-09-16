// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  // ✅ Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      console.log("🔑 Token received:", token.substring(0, 20) + "...");

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded:", decoded);

      // ✅ Get role from token
      const userRole = decoded.role || decoded.userType || "user";
      
      // ✅ Try to find user based on role
      let user = null;
      
      if (userRole === "doctor") {
        user = await Doctor.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      } else if (userRole === "admin") {
        user = await Admin.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      } else {
        user = await User.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      }

      // ✅ If not found by role, try all collections
      if (!user) {
        user = await User.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      }
      if (!user) {
        user = await Doctor.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      }
      if (!user) {
        user = await Admin.findById(decoded.id || decoded.userId || decoded._id).select("-password");
      }

      if (!user) {
        console.log("❌ User not found in any collection");
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // ✅ Set user in request with role from token
      req.user = {
        id: user._id,
        _id: user._id,
        userId: user._id,
        role: userRole,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        // ✅ প্রেসক্রিপশন রিলেটেড ডেটা যোগ করা হলো
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        // ✅ ডাক্তারের জন্য অতিরিক্ত তথ্য
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
        // ✅ রোগীর জন্য অতিরিক্ত তথ্য
        dateOfBirth: user.dateOfBirth || null,
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        address: user.address || '',
      };
      
      console.log("✅ User authenticated:", req.user.email, "Role:", req.user.role);
      next();
    } catch (error) {
      console.error("❌ Auth Error:", error.message);
      
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }
      
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// =============================================
// ✅ PRESCRIPTION RELATED MIDDLEWARE FUNCTIONS
// =============================================

/**
 * 🔍 Check if user is a doctor (for prescription operations)
 * এই middleware ব্যবহার করবেন প্রেসক্রিপশন ক্রিয়েট, আপডেট, ডিলিটের জন্য
 */
const isDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only doctors can perform this action.",
      });
    }

    // ✅ ডাক্তার প্রোফাইল আছে কিনা চেক
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found. Please complete your profile.",
      });
    }

    // ✅ ডাক্তারের সম্পূর্ণ তথ্য req এ যোগ করুন
    req.doctor = {
      id: doctor._id,
      userId: doctor.userId,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
      availableTime: doctor.availableTime,
      chamberAddress: doctor.chamberAddress,
      isVerified: doctor.isVerified,
    };

    next();
  } catch (error) {
    console.error("❌ Doctor middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying doctor role",
      error: error.message,
    });
  }
};

/**
 * 👤 Check if user is a patient (for viewing prescriptions)
 */
const isPatient = async (req, res, next) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only patients can perform this action.",
      });
    }

    // ✅ রোগী প্রোফাইল আছে কিনা চেক
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    req.patient = {
      id: patient._id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      profileImage: patient.profileImage,
    };

    next();
  } catch (error) {
    console.error("❌ Patient middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying patient role",
      error: error.message,
    });
  }
};

/**
 * 🔐 Check if user is authorized to access a specific prescription
 * এই middleware ব্যবহার করবেন প্রেসক্রিপশন দেখার সময়
 */
const canAccessPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Prescription = require("../models/Prescription");

    const prescription = await Prescription.findById(id)
      .populate("patient", "_id")
      .populate({
        path: "doctor",
        populate: {
          path: "userId",
          select: "_id",
        },
      });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // ✅ চেক করুন ইউজার এই প্রেসক্রিপশন অ্যাক্সেস করতে পারে কিনা
    const isPatient = prescription.patient._id.toString() === req.user.id;
    const isDoctor = prescription.doctor.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this prescription",
      });
    }

    // ✅ প্রেসক্রিপশন ডেটা req এ যোগ করুন
    req.prescription = prescription;
    req.isPatient = isPatient;
    req.isDoctor = isDoctor;
    req.isAdmin = isAdmin;

    next();
  } catch (error) {
    console.error("❌ Prescription access middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying prescription access",
      error: error.message,
    });
  }
};

/**
 * 🔐 Check if user is the doctor who created the prescription
 * এই middleware ব্যবহার করবেন প্রেসক্রিপশন এডিট বা ডিলিটের সময়
 */
const isPrescriptionOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Prescription = require("../models/Prescription");
    const Doctor = require("../models/Doctor");

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // ✅ ডাক্তার খুঁজুন
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // ✅ চেক করুন এই ডাক্তার প্রেসক্রিপশনের মালিক কিনা
    if (prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this prescription",
      });
    }

    req.prescription = prescription;
    req.doctor = doctor;

    next();
  } catch (error) {
    console.error("❌ Prescription owner middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying prescription ownership",
      error: error.message,
    });
  }
};

/**
 * ✅ Check if prescription status allows editing
 * Completed বা Expired প্রেসক্রিপশন এডিট করা যাবে না
 */
const canEditPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Prescription = require("../models/Prescription");

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // ✅ চেক করুন স্ট্যাটাস
    if (prescription.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed prescriptions cannot be edited",
      });
    }

    if (prescription.status === "expired") {
      return res.status(400).json({
        success: false,
        message: "Expired prescriptions cannot be edited",
      });
    }

    req.prescription = prescription;
    next();
  } catch (error) {
    console.error("❌ Prescription edit check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking prescription status",
      error: error.message,
    });
  }
};

// =============================================
// 📤 EXPORT ALL MIDDLEWARES
// =============================================
module.exports = {
  protect,
  isDoctor,
  isPatient,
  canAccessPrescription,
  isPrescriptionOwner,
  canEditPrescription,
};