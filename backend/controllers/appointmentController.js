// controllers/appointmentController.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");
const NotificationService = require("../services/notificationService");

// =============================================
// ✅ HELPER FUNCTIONS
// =============================================

const normalizeConsultationMode = (mode) => {
  if (!mode) return 'In-Person';
  
  const modeMap = {
    'clinic': 'In-Person',
    'in-person': 'In-Person',
    'inperson': 'In-Person',
    'online': 'Video',
    'video': 'Video',
    'phone': 'Phone',
    'chat': 'Chat',
    'In-Person': 'In-Person',
    'Video': 'Video',
    'Phone': 'Phone',
    'Chat': 'Chat'
  };
  
  const normalized = modeMap[mode.toLowerCase()];
  return normalized || 'In-Person';
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  
  const statusMap = {
    'opening': 'Pending',
    'OPENING': 'Pending',
    'pending': 'Pending',
    'Pending': 'Pending',
    'approved': 'Approved',
    'Approved': 'Approved',
    'rejected': 'Rejected',
    'Rejected': 'Rejected',
    'completed': 'Completed',
    'Completed': 'Completed',
    'cancelled': 'Cancelled',
    'Cancelled': 'Cancelled'
  };
  
  return statusMap[status] || status;
};

// ✅ Format time helper function
const formatTime = (timeSlot) => {
  if (!timeSlot) return "Flexible";
  
  // যদি ইতিমধ্যে AM/PM থাকে
  if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
    return timeSlot;
  }
  
  // 24-hour format থেকে 12-hour format এ convert
  try {
    const parts = timeSlot.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parts[1] || '00';
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    }
    return timeSlot;
  } catch (e) {
    return timeSlot;
  }
};

// ✅ Format date helper function
const formatDate = (date) => {
  if (!date) return "Not specified";
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getAppointmentStatistics = async (userId) => {
  try {
    const allAppointments = await Appointment.find({ user: userId }).lean();

    const total = allAppointments.length;
    const pending = allAppointments.filter((a) => a.status === "Pending" || a.status === "OPENING").length;
    const approved = allAppointments.filter((a) => a.status === "Approved").length;
    const completed = allAppointments.filter((a) => a.status === "Completed").length;
    const cancelled = allAppointments.filter((a) => a.status === "Cancelled").length;
    const rejected = allAppointments.filter((a) => a.status === "Rejected").length;

    const now = new Date();
    const upcoming = allAppointments.filter(
      (a) => (a.status === "Pending" || a.status === "Approved" || a.status === "OPENING") &&
      new Date(a.appointmentDate) > now
    ).length;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = allAppointments.filter(
      (a) => new Date(a.appointmentDate) >= startOfMonth
    ).length;

    return {
      total,
      pending,
      approved,
      completed,
      cancelled,
      rejected,
      upcoming,
      thisMonth,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      upcoming: 0,
      thisMonth: 0,
    };
  }
};

// =============================================
// ✅ USER APPOINTMENT FUNCTIONS
// =============================================

// ✅ GET MY APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { status, page = 1, limit = 10, startDate, endDate, search } = req.query;

    const filter = { user: userId };

    if (status && status !== "All") {
      filter.status = normalizeStatus(status);
    }

    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { "doctorDetails.name": { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { "doctorDetails.specialization": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'firstName lastName email phone specialization profileImage')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Appointment.countDocuments(filter);
    const stats = await getAppointmentStatistics(userId);

    const formattedAppointments = appointments.map((apt) => {
      let doctorName = "Unknown Doctor";
      let doctorSpecialization = "General";
      let doctorImage = "";
      let doctorEmail = "";
      let doctorPhone = "";

      if (apt.doctor) {
        const doc = apt.doctor;
        doctorName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || doc.email || "Doctor";
        doctorSpecialization = doc.specialization || "General";
        doctorImage = doc.profileImage || "";
        doctorEmail = doc.email || "";
        doctorPhone = doc.phone || "";
      } else if (apt.doctorDetails) {
        doctorName = apt.doctorDetails.name || "Unknown Doctor";
        doctorSpecialization = apt.doctorDetails.specialization || "General";
        doctorImage = apt.doctorDetails.profileImage || "";
        doctorEmail = apt.doctorDetails.email || "";
        doctorPhone = apt.doctorDetails.phone || "";
      }

      return {
        _id: apt._id,
        doctorName: doctorName,
        doctorId: apt.doctor?._id || apt.doctor,
        doctorSpecialization: doctorSpecialization,
        doctorImage: doctorImage,
        doctorEmail: doctorEmail,
        doctorPhone: doctorPhone,
        appointmentDate: apt.appointmentDate,
        timeSlot: apt.timeSlot,
        reason: apt.reason,
        status: apt.status,
        consultationMode: apt.consultationMode,
        meetingLink: apt.meetingLink,
        prescription: apt.prescription,
        doctorNotes: apt.doctorNotes,
        doctorResponse: apt.doctorResponse,
        approvedAt: apt.approvedAt,
        rejectedAt: apt.rejectedAt,
        completedAt: apt.completedAt,
        cancelledAt: apt.cancelledAt,
        cancellationReason: apt.cancellationReason,
        createdAt: apt.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: parseInt(page),
      appointments: formattedAppointments,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Get My Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET APPOINTMENT STATISTICS
exports.getAppointmentStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const stats = await getAppointmentStatistics(userId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ Get Statistics Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET APPOINTMENT BY ID
exports.getAppointmentById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const appointmentId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    })
    .populate('doctor', 'firstName lastName email phone specialization profileImage')
    .lean();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    let doctorName = "Unknown Doctor";
    let doctorSpecialization = "General";
    let doctorImage = "";
    let doctorEmail = "";
    let doctorPhone = "";

    if (appointment.doctor) {
      const doc = appointment.doctor;
      doctorName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || doc.email || "Doctor";
      doctorSpecialization = doc.specialization || "General";
      doctorImage = doc.profileImage || "";
      doctorEmail = doc.email || "";
      doctorPhone = doc.phone || "";
    } else if (appointment.doctorDetails) {
      doctorName = appointment.doctorDetails.name || "Unknown Doctor";
      doctorSpecialization = appointment.doctorDetails.specialization || "General";
      doctorImage = appointment.doctorDetails.profileImage || "";
      doctorEmail = appointment.doctorDetails.email || "";
      doctorPhone = appointment.doctorDetails.phone || "";
    }

    const formattedAppointment = {
      _id: appointment._id,
      doctorName: doctorName,
      doctorId: appointment.doctor?._id || appointment.doctor,
      doctorSpecialization: doctorSpecialization,
      doctorImage: doctorImage,
      doctorEmail: doctorEmail,
      doctorPhone: doctorPhone,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      reason: appointment.reason,
      status: appointment.status,
      consultationMode: appointment.consultationMode,
      meetingLink: appointment.meetingLink,
      prescription: appointment.prescription,
      doctorNotes: appointment.doctorNotes,
      doctorResponse: appointment.doctorResponse,
      approvedAt: appointment.approvedAt,
      rejectedAt: appointment.rejectedAt,
      completedAt: appointment.completedAt,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    res.status(200).json({
      success: true,
      appointment: formattedAppointment,
    });
  } catch (error) {
    console.error("❌ Get Appointment By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CANCEL APPOINTMENT
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const appointmentId = req.params.id;
    const { cancellationReason } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const normalizedStatus = normalizeStatus(appointment.status);
    if (!["Pending", "Approved"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status: ${appointment.status}`,
      });
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past appointments",
      });
    }

    appointment.status = "Cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = cancellationReason || "Cancelled by user";
    await appointment.save();

    // Send notification to doctor
    try {
      await NotificationService.createNotification({
        userId: appointment.doctor,
        title: "Appointment Cancelled by Patient",
        message: `Patient has cancelled the appointment scheduled for ${appointment.appointmentDate}`,
        type: "appointment",
        priority: "high",
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          cancelledBy: "patient",
        },
        sendEmail: true,
        emailTemplate: "appointmentCancelled",
        emailData: {
          patientName: "Patient",
          doctorName: "Doctor",
          appointmentDate: appointment.appointmentDate,
          appointmentId: appointment._id,
        },
      });
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        cancelledAt: appointment.cancelledAt,
        cancellationReason: appointment.cancellationReason,
      },
    });
  } catch (error) {
    console.error("❌ Cancel Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET PRESCRIPTION
exports.getPrescription = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const appointmentId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    }).lean();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!appointment.prescription) {
      return res.status(404).json({
        success: false,
        message: "No prescription available",
      });
    }

    res.status(200).json({
      success: true,
      prescription: appointment.prescription,
      appointment: {
        _id: appointment._id,
        doctorName: appointment.doctorDetails?.name || "Unknown Doctor",
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
      },
    });
  } catch (error) {
    console.error("❌ Get Prescription Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE APPOINTMENT - Email Notification সহ
exports.createAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    
    console.log("📝 Request body:", req.body);
    console.log("👤 User ID:", userId);

    const {
      doctorId,
      doctorName,
      appointmentDate,
      timeSlot,
      reason,
      consultationMode
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    if (!appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Appointment date is required"
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: appointmentDate,
      timeSlot: timeSlot,
      status: { $in: ["Pending", "Approved"] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked"
      });
    }

    const normalizedMode = normalizeConsultationMode(consultationMode);

    const appointment = new Appointment({
      user: userId,
      doctor: doctorId,
      doctorDetails: {
        name: doctorName || `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.specialization || "General",
        profileImage: doctor.profileImage || "",
      },
      appointmentDate: new Date(appointmentDate),
      timeSlot: timeSlot || "Flexible",
      reason: reason || "General Consultation",
      consultationMode: normalizedMode,
      status: "Pending"
    });

    await appointment.save();

    console.log("✅ Appointment created successfully:", appointment._id);

    // Send email to doctor
    try {
      const patientName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Patient";
      const doctorFullName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.email || "Doctor";
      const formattedDate = formatDate(appointmentDate);

      console.log(`📧 Sending email to doctor: ${doctor.email}`);

      await NotificationService.createNotification({
        userId: doctorId,
        title: "🩺 New Appointment Request",
        message: `Patient ${patientName} has requested an appointment on ${formattedDate}`,
        type: "appointment",
        priority: "high",
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          patientId: userId,
        },
        sendEmail: true,
        emailTemplate: "appointmentRequest",
        emailData: {
          patientName: patientName,
          doctorName: doctorFullName,
          appointmentDate: formattedDate,
          appointmentTime: formatTime(timeSlot),
          appointmentId: appointment._id,
          location: normalizedMode || "Online Consultation",
          reason: reason || "General Consultation"
        },
      });

      console.log(`✅ Notification & Email sent to doctor: ${doctor.email}`);

    } catch (notificationError) {
      console.error("❌ Doctor notification error:", notificationError);
    }

    // Send confirmation email to patient
    try {
      const patientName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Patient";
      const doctorFullName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.email || "Doctor";
      const formattedDate = formatDate(appointmentDate);

      console.log(`📧 Sending confirmation email to patient: ${user.email}`);

      await NotificationService.createNotification({
        userId: userId,
        title: "📋 Appointment Request Submitted",
        message: `Your appointment request with Dr. ${doctorFullName} has been submitted successfully.`,
        type: "appointment",
        priority: "medium",
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: doctorId,
        },
        sendEmail: true,
        emailTemplate: "appointmentConfirmation",
        emailData: {
          patientName: patientName,
          doctorName: doctorFullName,
          appointmentDate: formattedDate,
          appointmentTime: formatTime(timeSlot),
          appointmentId: appointment._id,
          location: normalizedMode || "Online Consultation",
        },
      });

      console.log(`✅ Notification & Email sent to patient: ${user.email}`);

    } catch (notificationError) {
      console.error("❌ Patient notification error:", notificationError);
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
      appointment: appointment
    });

  } catch (error) {
    console.error("❌ Create Appointment Error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// =============================================
// ✅ DOCTOR APPOINTMENT FUNCTIONS
// =============================================

// ✅ GET DOCTOR APPOINTMENTS
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user?.id || req.user?.userId || req.user?._id;

    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('user', 'firstName lastName email phone profileImage')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    const formattedAppointments = appointments.map(apt => {
      let patientName = "Unknown Patient";
      let patientEmail = "";
      let patientPhone = "";
      let patientImage = "";

      if (apt.user) {
        const user = apt.user;
        patientName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Patient";
        patientEmail = user.email || "";
        patientPhone = user.phone || "";
        patientImage = user.profileImage || "";
      }

      return {
        _id: apt._id,
        patientName: patientName,
        patientId: apt.user?._id || apt.user,
        patientEmail: patientEmail,
        patientPhone: patientPhone,
        patientImage: patientImage,
        appointmentDate: apt.appointmentDate,
        timeSlot: apt.timeSlot,
        reason: apt.reason,
        status: apt.status,
        consultationMode: apt.consultationMode,
        meetingLink: apt.meetingLink,
        prescription: apt.prescription,
        doctorNotes: apt.doctorNotes,
        doctorResponse: apt.doctorResponse,
        approvedAt: apt.approvedAt,
        rejectedAt: apt.rejectedAt,
        completedAt: apt.completedAt,
        createdAt: apt.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("❌ Get Doctor Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ APPROVE APPOINTMENT - ✅ User Email-এ Time যোগ করা হয়েছে
exports.approveAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'firstName lastName email')
      .populate('doctor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.doctor._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const normalizedStatus = normalizeStatus(appointment.status);
    if (!["Pending", "Approved"].includes(normalizedStatus) && normalizedStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve appointment with status: ${appointment.status}`,
      });
    }

    if (normalizedStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Appointment already approved",
      });
    }

    const normalizedMode = normalizeConsultationMode(appointment.consultationMode);

    appointment.status = "Approved";
    appointment.approvedAt = new Date();
    appointment.consultationMode = normalizedMode;
    appointment.doctorResponse = req.body.notes || req.body.doctorResponse || "Appointment approved by doctor";

    await appointment.save();

    console.log("✅ Appointment approved successfully");

    // ✅ ফরম্যাট করা Date এবং Time
    const formattedDate = formatDate(appointment.appointmentDate);
    const formattedTime = formatTime(appointment.timeSlot);

    console.log(`📧 Sending email with Date: ${formattedDate}, Time: ${formattedTime}`);

    // ✅ Send notification to patient (User) - appointmentTime যোগ করা হয়েছে!
    try {
      await NotificationService.createNotification({
        userId: appointment.user._id,
        title: "✅ Appointment Approved",
        message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been approved`,
        type: "appointment",
        priority: "high",
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: userId,
        },
        sendEmail: true,
        emailTemplate: "appointmentApproved",
        emailData: {
          patientName: `${appointment.user.firstName} ${appointment.user.lastName}`,
          doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,  // ← ✅ এটা যোগ করো!!!
          appointmentId: appointment._id,
        },
      });
      console.log(`✅ Email sent to user: ${appointment.user.email} with Time: ${formattedTime}`);
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Appointment approved successfully",
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        approvedAt: appointment.approvedAt,
        consultationMode: appointment.consultationMode,
        doctorResponse: appointment.doctorResponse,
      },
    });
  } catch (error) {
    console.error("❌ Approve Appointment Error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ REJECT APPOINTMENT
exports.rejectAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const { reason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'firstName lastName email')
      .populate('doctor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.doctor._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const normalizedStatus = normalizeStatus(appointment.status);
    if (!["Pending", "Approved"].includes(normalizedStatus) && normalizedStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject appointment with status: ${appointment.status}`,
      });
    }

    const normalizedMode = normalizeConsultationMode(appointment.consultationMode);

    appointment.status = "Rejected";
    appointment.rejectedAt = new Date();
    appointment.consultationMode = normalizedMode;
    appointment.doctorResponse = reason || "Appointment rejected by doctor";

    await appointment.save();

    console.log("✅ Appointment rejected successfully");

    // Send notification to patient
    try {
      await NotificationService.createNotification({
        userId: appointment.user._id,
        title: "❌ Appointment Rejected",
        message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been rejected`,
        type: "appointment",
        priority: "high",
        link: `/appointments/${appointment._id}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: userId,
          reason: reason || "No reason provided",
        },
        sendEmail: true,
        emailTemplate: "appointmentRejected",
        emailData: {
          patientName: `${appointment.user.firstName} ${appointment.user.lastName}`,
          doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          reason: reason || "No reason provided",
          appointmentId: appointment._id,
        },
      });
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        rejectedAt: appointment.rejectedAt,
        doctorResponse: appointment.doctorResponse,
      },
    });
  } catch (error) {
    console.error("❌ Reject Appointment Error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ COMPLETE APPOINTMENT
exports.completeAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const { prescription, doctorNotes, diagnosis, medicines, followUpDate } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'firstName lastName email')
      .populate('doctor', 'firstName lastName email specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.doctor._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const normalizedStatus = normalizeStatus(appointment.status);
    if (normalizedStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete appointment with status: ${appointment.status}. Only Approved appointments can be completed.`,
      });
    }

    const normalizedMode = normalizeConsultationMode(appointment.consultationMode);

    appointment.status = "Completed";
    appointment.completedAt = new Date();
    appointment.consultationMode = normalizedMode;
    if (prescription) appointment.prescription = prescription;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;

    await appointment.save();

    console.log("✅ Appointment completed successfully");

    // Create prescription if medicines provided
    let createdPrescription = null;
    if (medicines && medicines.length > 0) {
      try {
        const prescriptionMedicines = medicines.map(med => ({
          medicineName: med.name || med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency || "As directed",
          duration: med.duration || "7 days",
          instructions: med.instructions || "",
          reminderTime: med.reminderTime || null,
          isActive: true,
        }));

        createdPrescription = await Prescription.create({
          patient: appointment.user._id,
          doctor: appointment.doctor._id,
          appointment: appointment._id,
          diagnosis: diagnosis || "Consultation completed",
          medicines: prescriptionMedicines,
          notes: doctorNotes || "",
          followUpDate: followUpDate || null,
          status: "active",
        });

        console.log("✅ Prescription created:", createdPrescription._id);

        // Send prescription notification
        await NotificationService.createNotification({
          userId: appointment.user._id,
          title: "📋 New Prescription Available",
          message: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has issued a prescription for you.`,
          type: "medical",
          priority: "high",
          link: `/prescriptions/${createdPrescription._id}`,
          metadata: {
            prescriptionId: createdPrescription._id,
            appointmentId: appointment._id,
            doctorId: userId,
          },
          sendEmail: true,
          emailTemplate: "prescriptionAvailable",
          emailData: {
            patientName: `${appointment.user.firstName} ${appointment.user.lastName}`,
            doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            prescriptionId: createdPrescription._id,
            medicines: prescriptionMedicines,
            diagnosis: diagnosis || "Consultation completed",
          },
        });

        // Consultation complete notification
        await NotificationService.createNotification({
          userId: appointment.user._id,
          title: "✅ Consultation Completed",
          message: `Your consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been completed.`,
          type: "appointment",
          priority: "medium",
          link: `/appointments/${appointment._id}`,
          metadata: {
            appointmentId: appointment._id,
            prescriptionId: createdPrescription._id,
          },
          sendEmail: true,
          emailTemplate: "consultationCompleted",
          emailData: {
            patientName: `${appointment.user.firstName} ${appointment.user.lastName}`,
            doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            appointmentId: appointment._id,
            prescriptionId: createdPrescription._id,
          },
        });

      } catch (prescriptionError) {
        console.error("❌ Prescription creation error:", prescriptionError);
      }
    } else {
      // Consultation complete notification without prescription
      try {
        await NotificationService.createNotification({
          userId: appointment.user._id,
          title: "✅ Consultation Completed",
          message: `Your consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been completed.`,
          type: "appointment",
          priority: "medium",
          link: `/appointments/${appointment._id}`,
          metadata: {
            appointmentId: appointment._id,
          },
          sendEmail: true,
          emailTemplate: "consultationCompleted",
          emailData: {
            patientName: `${appointment.user.firstName} ${appointment.user.lastName}`,
            doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            appointmentId: appointment._id,
          },
        });
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        completedAt: appointment.completedAt,
        prescription: appointment.prescription,
        doctorNotes: appointment.doctorNotes,
      },
      prescription: createdPrescription,
    });
  } catch (error) {
    console.error("❌ Complete Appointment Error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// ✅ EXPORT ALL FUNCTIONS
// =============================================

module.exports = {
  getMyAppointments: exports.getMyAppointments,
  getAppointmentStatistics: exports.getAppointmentStatistics,
  getAppointmentById: exports.getAppointmentById,
  createAppointment: exports.createAppointment,
  cancelAppointment: exports.cancelAppointment,
  getPrescription: exports.getPrescription,
  getDoctorAppointments: exports.getDoctorAppointments,
  approveAppointment: exports.approveAppointment,
  rejectAppointment: exports.rejectAppointment,
  completeAppointment: exports.completeAppointment,
};