const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const mongoose = require("mongoose");

// =============================================
// 📝 CREATE PRESCRIPTION (UPDATED WITH ANALYTICS - SHOW ALL)
// =============================================
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, notes, followUpDate } = req.body;
    const userId = req.user.id;

    console.log("📝 Creating prescription for appointment:", appointmentId);

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create prescription for this appointment",
      });
    }

    const existingPrescription = await Prescription.findOne({ appointment: appointmentId });
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already exists for this appointment",
      });
    }

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required",
      });
    }

    const prescription = new Prescription({
      patient: appointment.user,
      doctor: doctor._id,
      appointment: appointmentId,
      diagnosis: diagnosis || "",
      medicines: medicines || [],
      notes: notes || "",
      followUpDate: followUpDate || null,
      status: "active",
      isDeleted: false,
    });

    await prescription.save();

    appointment.prescriptionId = prescription._id;
    appointment.status = "Completed";
    await appointment.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patient", "firstName lastName email phone profileImage")
      .populate("appointment", "appointmentDate timeSlot consultationMode status");

    const doctorData = {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      hospital: doctor.hospital,
      consultationFee: doctor.consultationFee,
      profileImage: doctor.profileImage,
    };

    console.log("✅ Prescription created successfully:", prescription._id);

    // =============================================
    // 🔥 NEW: অ্যাডমিন ড্যাশবোর্ডের জন্য অ্যানালিটিক্স ডেটা প্রস্তুত করা হচ্ছে (isDeleted চেক সরানো হয়েছে)
    // =============================================
    const baseQuery = {}; // ✅ সব ডকুমেন্ট (Deleted সহ) কাউন্ট করার জন্য খালি অবজেক্ট

    const [
      totalPrescriptions,
      recentPrescriptions,
      latestPrescriptions
    ] = await Promise.all([
      // 1. মোট প্রেসক্রিপশন (Deleted সহ সব)
      Prescription.countDocuments(baseQuery),
      
      // 2. গত ৩০ দিনের প্রেসক্রিপশন (Deleted সহ সব)
      Prescription.countDocuments({
        ...baseQuery,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // 3. সর্বশেষ ৫টি প্রেসক্রিপশন (ডাক্তার ও রোগীর নামসহ, Deleted সহ সব)
      Prescription.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("patient", "firstName lastName")
        .populate("doctor", "firstName lastName")
        .lean()
    ]);

    const formattedLatest = latestPrescriptions.map((p) => ({
      patient: p.patient || { firstName: "Unknown", lastName: "Patient" },
      doctor: p.doctor || { firstName: "Unknown", lastName: "Doctor" }
    }));

    const adminAnalytics = {
      totalPrescriptions,
      recentPrescriptions,
      latestPrescriptions: formattedLatest
    };
    // =============================================

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: {
        ...populatedPrescription.toObject(),
        doctor: doctorData,
      },
      // 🔥 নতুন অ্যানালিটিক্স ডেটা ফ্রন্টএন্ডে পাঠানো হচ্ছে
      analytics: adminAnalytics 
    });

  } catch (error) {
    console.error("❌ Create prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating prescription",
      error: error.message,
    });
  }
};

// =============================================
// 📋 GET DOCTOR'S PRESCRIPTIONS (✅ UPDATED: Correct Pagination)
// =============================================
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    console.log("📋 ====== GET DOCTOR PRESCRIPTIONS ======");
    console.log("📋 User ID from token:", userId);
    console.log("📋 User role:", req.user.role);

    let doctor = await Doctor.findById(userId);
    if (!doctor) {
      console.log("❌ Doctor not found for userId:", userId);
      
      const allDoctors = await Doctor.find({}).select("_id firstName lastName email specialization").lean();
      console.log("📦 All doctors in DB:", JSON.stringify(allDoctors, null, 2));
      
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found. Please complete your doctor profile.",
        debug: {
          userId: userId,
          availableDoctors: allDoctors.map(d => ({
            id: d._id,
            name: d.firstName + " " + d.lastName,
            email: d.email
          }))
        }
      });
    }

    console.log("✅ Doctor found:");
    console.log("   - _id:", doctor._id.toString());
    console.log("   - Name:", doctor.firstName, doctor.lastName);
    console.log("   - Email:", doctor.email);

    const allPrescriptions = await Prescription.find({}).lean();
    console.log(`📦 TOTAL PRESCRIPTIONS IN DB: ${allPrescriptions.length}`);
    if (allPrescriptions.length > 0) {
      console.log("📦 All prescriptions:");
      allPrescriptions.forEach((p, i) => {
        console.log(`   ${i+1}. doctor: ${p.doctor}, patient: ${p.patient}, isDeleted: ${p.isDeleted}, status: ${p.status}`);
      });
    }

    const query = { doctor: doctor._id };
    query.$or = [
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    ];

    if (status && status !== "all") {
      query.status = status;
    }

    console.log("🔍 Query:", JSON.stringify(query, null, 2));

    // ✅ পেজিনেশন ক্যালকুলেশন (ডেটাবেস লেভেলে প্রয়োগ করা হচ্ছে)
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    console.log(`📄 Pagination: Page=${pageNum}, Limit=${limitNum}, Skip=${skip}`);

    // ✅ MongoDB ড্রাইভারের limit() এবং skip() ব্যবহার করা হচ্ছে (সব ডেটা মেমরিতে না নিয়ে সরাসরি DB থেকে আনা)
    let prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(`📦 Prescriptions found for this doctor: ${prescriptions.length}`);

    if (prescriptions.length === 0) {
      console.log("⚠️ No prescriptions found for this doctor");
      return res.status(200).json({
        success: true,
        prescriptions: [],
        pagination: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          pages: 0,
        },
        message: "No prescriptions found for this doctor",
        debug: {
          doctorId: doctor._id,
          totalPrescriptions: allPrescriptions.length,
          allPrescriptions: allPrescriptions.map(p => ({
            id: p._id,
            doctor: p.doctor,
            patient: p.patient,
            isDeleted: p.isDeleted
          }))
        }
      });
    }

    const populatedPrescriptions = await Promise.all(
      prescriptions.map(async (p) => {
        let patientData = null;
        if (p.patient) {
          patientData = await User.findById(p.patient)
            .select("firstName lastName email phone profileImage")
            .lean();
        }
        return {
          ...p,
          patient: patientData,
        };
      })
    );

    const doctorData = {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      specialization: doctor.specialization,
      profileImage: doctor.profileImage,
    };

    const formattedPrescriptions = populatedPrescriptions.map(p => {
      let patientName = "Unknown Patient";
      if (p.patient) {
        patientName = p.patient.firstName && p.patient.lastName 
          ? `${p.patient.firstName} ${p.patient.lastName}`
          : p.patient.name || "Unknown Patient";
      }

      return {
        _id: p._id,
        patient: p.patient,
        patientName: patientName,
        doctor: doctorData,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointment: p.appointment,
        diagnosis: p.diagnosis || "",
        medicines: p.medicines || [],
        notes: p.notes || "",
        followUpDate: p.followUpDate || "",
        status: p.status || "active",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        refills: p.refills || 0,
        refillsUsed: p.refillsUsed || 0,
      };
    });

    console.log(`✅ Returning ${formattedPrescriptions.length} prescriptions`);

    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      prescriptions: formattedPrescriptions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Get doctor prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// =============================================
// 👤 GET PATIENT'S PRESCRIPTIONS
// =============================================
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log("📋 Fetching prescriptions for patient:", userId);

    const query = { patient: userId };
    query.$or = [
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    ];

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const populatedPrescriptions = await Promise.all(
      prescriptions.map(async (p) => {
        let doctorData = null;
        if (p.doctor) {
          doctorData = await Doctor.findById(p.doctor)
            .select("firstName lastName specialization profileImage")
            .lean();
        }
        return {
          ...p,
          doctor: doctorData,
        };
      })
    );

    const total = await Prescription.countDocuments(query);

    console.log(`✅ Found ${populatedPrescriptions.length} prescriptions`);

    res.status(200).json({
      success: true,
      prescriptions: populatedPrescriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get patient prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// =============================================
// 👀 GET PRESCRIPTION BY ID
// =============================================
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("👀 Fetching prescription:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const prescription = await Prescription.findById(id).lean();

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    const patient = await User.findById(prescription.patient)
      .select("firstName lastName email phone profileImage birthDate gender bloodGroup address")
      .lean();

    const doctor = await Doctor.findById(prescription.doctor)
      .select("firstName lastName email phone specialization qualification experience hospital consultationFee profileImage")
      .lean();

    const appointment = await Appointment.findById(prescription.appointment)
      .select("appointmentDate timeSlot consultationMode status symptoms")
      .lean();

    const isAuthorized = patient._id.toString() === userId || doctor._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    console.log("✅ Prescription found");

    res.status(200).json({
      success: true,
      prescription: {
        ...prescription,
        patient: patient,
        doctor: doctor,
        appointment: appointment,
      },
    });
  } catch (error) {
    console.error("❌ Get prescription by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription",
      error: error.message,
    });
  }
};

// =============================================
// ✏️ UPDATE PRESCRIPTION - COMPLETE FIX
// =============================================
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, medicines, notes, followUpDate, status } = req.body;
    const userId = req.user.id;

    console.log("✏️ ====== UPDATE PRESCRIPTION ======");
    console.log("✏️ Prescription ID:", id);
    console.log("✏️ User ID:", userId);
    console.log("✏️ Request Body:", JSON.stringify(req.body, null, 2));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      console.log("❌ Doctor not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    console.log("✅ Doctor found:", doctor._id, doctor.firstName, doctor.lastName);

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      console.log("❌ Prescription not found:", id);
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    console.log("📦 Prescription found:");
    console.log("   - Doctor:", prescription.doctor);
    console.log("   - Patient:", prescription.patient);
    console.log("   - Status:", prescription.status);

    if (prescription.doctor.toString() !== doctor._id.toString()) {
      console.log("❌ Unauthorized: Doctor", doctor._id, "does not own prescription", prescription.doctor);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    let updated = false;
    
    if (diagnosis !== undefined) {
      prescription.diagnosis = diagnosis;
      updated = true;
      console.log("   - Updated diagnosis:", diagnosis);
    }
    
    if (medicines !== undefined) {
      prescription.medicines = medicines;
      updated = true;
      console.log("   - Updated medicines:", JSON.stringify(medicines));
    }
    
    if (notes !== undefined) {
      prescription.notes = notes;
      updated = true;
      console.log("   - Updated notes:", notes);
    }
    
    if (followUpDate !== undefined) {
      prescription.followUpDate = followUpDate;
      updated = true;
      console.log("   - Updated followUpDate:", followUpDate);
    }
    
    if (status !== undefined) {
      prescription.status = status;
      updated = true;
      console.log("   - Updated status:", status);
    }

    if (!updated) {
      console.log("⚠️ No fields to update");
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await prescription.save();
    console.log("✅ Prescription saved successfully");

    const updatedPrescription = await Prescription.findById(id).lean();
    const patient = await User.findById(updatedPrescription.patient)
      .select("firstName lastName email phone profileImage")
      .lean();
    const doctorData = await Doctor.findById(doctor._id)
      .select("firstName lastName email specialization profileImage")
      .lean();

    console.log("✅ Prescription updated successfully");

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription: {
        ...updatedPrescription,
        patient: patient,
        doctor: doctorData,
      },
    });
  } catch (error) {
    console.error("❌ Update prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prescription",
      error: error.message,
    });
  }
};

// =============================================
// 🗑️ DELETE PRESCRIPTION (সফট ডিলিট)
// =============================================
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("🗑️ Deleting prescription:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
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
        message: "You are not authorized to delete this prescription",
      });
    }

    prescription.isDeleted = true;
    prescription.deletedAt = new Date();
    await prescription.save();

    await Appointment.findByIdAndUpdate(
      prescription.appointment,
      { $unset: { prescriptionId: 1 }, status: "Completed" }
    );

    console.log("✅ Prescription soft deleted successfully");

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting prescription",
      error: error.message,
    });
  }
};

// =============================================
// 🔍 GET PRESCRIPTION BY APPOINTMENT
// =============================================
exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    console.log("🔍 Finding prescription for appointment:", appointmentId);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const query = { appointment: appointmentId };
    query.$or = [
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    ];

    const prescription = await Prescription.findOne(query).lean();

    let patientData = null;
    if (prescription && prescription.patient) {
      patientData = await User.findById(prescription.patient)
        .select("firstName lastName email phone profileImage")
        .lean();
    }

    const result = prescription ? {
      ...prescription,
      patient: patientData,
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        profileImage: doctor.profileImage,
      }
    } : null;

    console.log(result ? "✅ Prescription found" : "ℹ️ No prescription found");

    res.status(200).json({
      success: true,
      prescription: result,
    });
  } catch (error) {
    console.error("❌ Get prescription by appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription",
      error: error.message,
    });
  }
};

// =============================================
// 📊 GET PRESCRIPTION STATISTICS
// =============================================
exports.getPrescriptionStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("📊 Getting prescription statistics for doctor:", userId);

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctor._id;

    const query = { doctor: doctorId };
    query.$or = [
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    ];

    const [
      total,
      todayCount,
      lastWeekCount,
      lastMonthCount,
      uniquePatients,
      statusCounts,
    ] = await Promise.all([
      Prescription.countDocuments(query),
      Prescription.countDocuments({
        ...query,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Prescription.countDocuments({
        ...query,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Prescription.countDocuments({
        ...query,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      Prescription.distinct("patient", query),
      Prescription.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = {};
    statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });

    console.log("✅ Statistics calculated successfully");

    res.status(200).json({
      success: true,
      statistics: {
        total,
        today: todayCount,
        lastWeek: lastWeekCount,
        lastMonth: lastMonthCount,
        uniquePatients: uniquePatients.length,
        active: statusMap.active || 0,
        completed: statusMap.completed || 0,
        expired: statusMap.expired || 0,
      },
    });
  } catch (error) {
    console.error("❌ Get prescription statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// =============================================
// 🆕 NEW - ডাক্তারের সাম্প্রতিক প্রেসক্রিপশন (UPDATED: Shows ALL including deleted)
// =============================================
exports.getRecentPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // ✅ isDeleted কন্ডিশন সরিয়ে ফেলা হয়েছে, তাই ডিলিট করা প্রেসক্রিপশনও আসবে
    const query = { doctor: doctor._id };

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const populatedPrescriptions = await Promise.all(
      prescriptions.map(async (p) => {
        let patientData = null;
        if (p.patient) {
          patientData = await User.findById(p.patient)
            .select("firstName lastName email profileImage")
            .lean();
        }
        return {
          ...p,
          patient: patientData,
        };
      })
    );

    const doctorData = {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      profileImage: doctor.profileImage,
    };

    const prescriptionsWithDoctor = populatedPrescriptions.map(prescription => ({
      ...prescription,
      doctor: doctorData,
    }));

    res.status(200).json({
      success: true,
      prescriptions: prescriptionsWithDoctor,
    });
  } catch (error) {
    console.error("❌ Get recent prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent prescriptions",
      error: error.message,
    });
  }
};

// =============================================
// 🔄 NEW - প্রেসক্রিপশনের স্ট্যাটাস পরিবর্তন
// =============================================
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !["active", "completed", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, completed, or expired',
      });
    }

    const doctor = await Doctor.findById(userId);
    if (!doctor) {
      return res.status(404).json({
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
        message: "You are not authorized",
      });
    }

    prescription.status = status;
    await prescription.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      prescription: {
        id: prescription._id,
        status: prescription.status,
      },
    });
  } catch (error) {
    console.error("❌ Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};

// =============================================
// 🆕 NEW - অ্যাডমিনের জন্য সাম্প্রতিক প্রেসক্রিপশন (Deleted সহ সব)
// =============================================
exports.getAdminRecentPrescriptions = async (req, res) => {
  try {
    // ✅ অ্যাডমিনের জন্য কোনো ডাক্তার আইডি চেক করা হবে না, সরাসরি ডেটাবেস থেকে পড়বে
    const prescriptions = await Prescription.find({}) // খালি কোয়েরি = সব রেকর্ড
      .sort({ createdAt: -1 })
      .limit(10) // সর্বশেষ ১০টি দেখাবে (প্রয়োজনে ৫ বা ২০ করুন)
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName")
      .lean();

    const formattedLatest = prescriptions.map((p) => ({
      patient: p.patient || { firstName: "Unknown", lastName: "Patient" },
      doctor: p.doctor || { firstName: "Unknown", lastName: "Doctor" },
      createdAt: p.createdAt
    }));

    res.status(200).json({
      success: true,
      latestPrescriptions: formattedLatest,
      totalPrescriptions: await Prescription.countDocuments({}) // ✅ সব কাউন্ট করবে (Deleted সহ)
    });
  } catch (error) {
    console.error("❌ Get admin recent prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin prescriptions",
      error: error.message,
    });
  }
};