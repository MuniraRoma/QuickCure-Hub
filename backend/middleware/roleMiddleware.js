// middleware/roleMiddleware.js
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const Prescription = require("../models/Prescription");

// ✅ IS USER MIDDLEWARE
const isUser = async (req, res, next) => {
  try {
    console.log("🔍 isUser middleware called");
    
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return res.status(403).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    console.log("✅ User verified:", user.email);
    req.role = "user";
    req.userData = user;
    next();
  } catch (error) {
    console.error("❌ isUser Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ IS DOCTOR MIDDLEWARE (Advanced Debugging Added)
const isDoctor = async (req, res, next) => {
  try {
    console.log("🔍 isDoctor middleware called");
    console.log("👤 User from token:", req.user);
    
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const userEmail = req.user?.email;

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // 🔧 1. TRY BY ID
    console.log(`🔎 Searching Doctor with _id: ${userId}`);
    let doctor = await Doctor.findById(userId);
    
    // 🔧 2. IF NOT FOUND, TRY BY userId FIELD
    if (!doctor) {
      console.log(`🔎 Not found by _id. Trying with 'userId' field: ${userId}`);
      doctor = await Doctor.findOne({ userId });
    }
    
    // 🔧 3. IF STILL NOT FOUND, TRY BY EMAIL
    if (!doctor && userEmail) {
      console.log(`🔎 Not found by ID. Trying with email: ${userEmail}`);
      doctor = await Doctor.findOne({ email: userEmail });
    }

    // 🔧 IF STILL NULL, PRINT DEBUG INFO
    if (!doctor) {
      console.log(`❌❌❌ CRITICAL ERROR: Doctor not found for userId: ${userId} OR email: ${userEmail}`);
      console.log("👉 CHECK YOUR MONGODB 'doctors' COLLECTION. Make sure a document exists!");
      return res.status(403).json({
        success: false,
        message: "Access denied. Doctor not found in database.",
      });
    }

    if (doctor.approvalStatus !== "Approved") {
      console.log("❌ Doctor not approved:", doctor.approvalStatus);
      return res.status(403).json({
        success: false,
        message: `Access denied. Account status: ${doctor.approvalStatus}`,
        approvalStatus: doctor.approvalStatus,
      });
    }

    console.log("✅ Doctor verified successfully:", doctor.email, "| ID:", doctor._id);
    req.role = "doctor";
    req.userData = doctor;
    next();
  } catch (error) {
    console.error("❌ isDoctor Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ IS ADMIN MIDDLEWARE
const isAdmin = async (req, res, next) => {
  try {
    console.log("🔍 isAdmin middleware called");
    
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin not found.",
      });
    }

    console.log("✅ Admin verified:", admin.email);
    req.role = "admin";
    req.userData = admin;
    next();
  } catch (error) {
    console.error("❌ isAdmin Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// ✅ PRESCRIPTION RELATED ROLE MIDDLEWARES
// =============================================

const isDoctorOrPatient = async (req, res, next) => {
  try {
    console.log("🔍 isDoctorOrPatient middleware called");
    
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Search for doctor first
    let doctor = await Doctor.findById(userId);
    if (!doctor) doctor = await Doctor.findOne({ userId });

    if (doctor && doctor.approvalStatus === "Approved") {
      console.log("✅ User is a verified doctor");
      req.role = "doctor";
      req.userData = doctor;
      req.isDoctor = true;
      req.isPatient = false;
      return next();
    }

    const patient = await User.findById(userId);
    if (patient) {
      console.log("✅ User is a patient");
      req.role = "patient";
      req.userData = patient;
      req.isDoctor = false;
      req.isPatient = true;
      return next();
    }

    console.log("❌ User is neither doctor nor patient");
    return res.status(403).json({
      success: false,
      message: "Access denied. Must be a doctor or patient.",
    });
  } catch (error) {
    console.error("❌ isDoctorOrPatient Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const canViewPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    console.log("🔍 Checking prescription view permission for:", id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

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

    const isPatient = prescription.patient._id.toString() === userId;
    const isDoctor = prescription.doctor.userId._id.toString() === userId;
    const isAdminUser = req.user?.role === "admin";

    if (!isPatient && !isDoctor && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    req.prescription = prescription;
    req.isPatientView = isPatient;
    req.isDoctorView = isDoctor;
    req.isAdminView = isAdminUser;
    
    console.log(`✅ Prescription view authorized`);
    next();
  } catch (error) {
    console.error("❌ canViewPrescription Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const isPrescriptionDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const userEmail = req.user?.email;

    console.log("🔍 Checking if user is prescription doctor:", id);

    let doctor = await Doctor.findById(userId);
    if (!doctor) doctor = await Doctor.findOne({ userId });
    if (!doctor && userEmail) doctor = await Doctor.findOne({ email: userEmail });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the doctor who created this prescription",
      });
    }

    req.prescription = prescription;
    req.doctor = doctor;
    
    console.log("✅ User is the prescription doctor");
    next();
  } catch (error) {
    console.error("❌ isPrescriptionDoctor Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const canModifyPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed prescriptions cannot be modified",
      });
    }

    if (prescription.status === "expired") {
      return res.status(400).json({
        success: false,
        message: "Expired prescriptions cannot be modified",
      });
    }

    req.prescription = prescription;
    next();
  } catch (error) {
    console.error("❌ canModifyPrescription Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const canDownloadPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    await canViewPrescription(req, res, () => {});

    if (req.prescription) {
      console.log("✅ User can download prescription");
      return next();
    }
  } catch (error) {
    console.error("❌ canDownloadPrescription Error:", error);
    return res.status(403).json({
      success: false,
      message: "You are not authorized to download this prescription",
    });
  }
};

// =============================================
// ✅ এখানে module.exports যোগ করুন!!!
// =============================================
module.exports = {
  // বেসিক রোল মিডলওয়্যার
  isUser,
  isDoctor,
  isAdmin,
  
  // প্রেসক্রিপশন রিলেটেড মিডলওয়্যার
  isDoctorOrPatient,
  canViewPrescription,
  isPrescriptionDoctor,
  canModifyPrescription,
  canDownloadPrescription,
};