// backend/controllers/patientController.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * @desc    Get all patients for a specific doctor
 * @route   GET /api/patients/doctor
 * @access  Private (Doctor only)
 */
exports.getDoctorPatients = async (req, res) => {
    try {
        // isDoctor middleware থেকে req.userData পাওয়া যাবে
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        console.log("🔍 Doctor ID:", doctorId);

        // Find all appointments for this doctor
        const appointments = await Appointment.find({
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        })
        .populate({
            // 🔥 BACK TO 'user': কারণ আপনার ডাটাবেসে 'user' দিয়ে ডেটা সেভ করা আছে
            path: "user",
            select: "firstName lastName email phone gender age bloodGroup profileImage accountStatus address dateOfBirth emergencyContact"
        })
        .sort({ appointmentDate: -1 });

        console.log("📋 Appointments found:", appointments.length);

        // Get unique patient IDs (রোগীরা ইউজারই)
        const patientIds = [...new Set(appointments
            .filter(a => a.user)
            .map(a => a.user._id.toString())
        )];

        console.log("👥 Unique patient IDs:", patientIds);

        // ✅ Fetch complete user data from User model directly to get accurate status
        const users = await User.find({
            _id: { $in: patientIds }
        }).select("firstName lastName email phone gender age bloodGroup profileImage accountStatus address dateOfBirth emergencyContact");

        console.log("👤 Users found from DB:", users.length);

        // Create a map of user data
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user;
            console.log(`📝 User: ${user.firstName} ${user.lastName}, Status: ${user.accountStatus}`);
        });

        // Build patient list with proper status
        const uniquePatients = [];
        const patientMap = new Map();

        appointments.forEach(appointment => {
            if (appointment.user) {
                const userId = appointment.user._id.toString();
                
                if (!patientMap.has(userId) && userMap[userId]) {
                    patientMap.set(userId, true);
                    
                    const user = userMap[userId];
                    
                    // Get all appointments count for this patient
                    const totalVisits = appointments.filter(
                        a => a.user._id.toString() === userId
                    ).length;

                    // Get last appointment date
                    const lastAppointment = appointments
                        .filter(a => a.user._id.toString() === userId)
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];

                    // ✅ Get account status directly from User model
                    let accountStatus = user.accountStatus || 'active';
                    
                    // ✅ If user has visits but status is somehow inactive, check if they have recent visits
                    if (accountStatus === 'inactive' && totalVisits > 0) {
                        // Check if user has any recent visit (last 30 days)
                        const hasRecentVisit = appointments.some(
                            a => a.user._id.toString() === userId && 
                            new Date(a.appointmentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        );
                        if (hasRecentVisit) {
                            accountStatus = 'active'; // Override if they have recent visits
                            console.log(`🔄 Overriding status to active for ${user.firstName} ${user.lastName} (recent visit)`);
                        }
                    }

                    console.log(`✅ Patient: ${user.firstName} ${user.lastName}, Final Status: ${accountStatus}`);

                    uniquePatients.push({
                        _id: user._id,
                        firstName: user.firstName || 'Unknown',
                        lastName: user.lastName || 'User',
                        email: user.email || '',
                        phone: user.phone || '',
                        gender: user.gender || 'Not specified',
                        age: user.age || 'N/A',
                        bloodGroup: user.bloodGroup || 'Unknown',
                        profileImage: user.profileImage || null,
                        accountStatus: accountStatus, // ✅ Proper status from User model
                        address: user.address || null,
                        dateOfBirth: user.dateOfBirth || null,
                        emergencyContact: user.emergencyContact || null,
                        lastVisit: lastAppointment?.appointmentDate || appointment.createdAt,
                        totalVisits: totalVisits,
                        diagnosis: appointment.diagnosis || appointment.reason || 'No diagnosis',
                        latestAppointmentStatus: appointment.status,
                        latestAppointmentId: appointment._id
                    });
                }
            }
        });

        // Calculate statistics
        const totalPatients = uniquePatients.length;
        const activePatients = uniquePatients.filter(p => p.accountStatus === 'active').length;
        const inactivePatients = uniquePatients.filter(p => p.accountStatus === 'inactive').length;

        console.log(`📊 Stats - Total: ${totalPatients}, Active: ${activePatients}, Inactive: ${inactivePatients}`);
        console.log("📋 Final patient list:", uniquePatients.map(p => ({
            name: `${p.firstName} ${p.lastName}`,
            status: p.accountStatus
        })));

        res.status(200).json({
            success: true,
            data: {
                patients: uniquePatients,
                stats: {
                    total: totalPatients,
                    active: activePatients,
                    inactive: inactivePatients
                }
            }
        });

    } catch (error) {
        console.error('❌ Error in getDoctorPatients:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch patients'
        });
    }
};

/**
 * @desc    Get single patient details with complete information
 * @route   GET /api/patients/:patientId
 * @access  Private (Doctor only)
 */
exports.getPatientDetails = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID"
            });
        }

        // Find patient details
        const patient = await User.findById(patientId)
            .select("firstName lastName email phone gender age bloodGroup profileImage accountStatus address dateOfBirth emergencyContact medicalHistory createdAt updatedAt");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        console.log(`📝 Patient details: ${patient.firstName} ${patient.lastName}, Status: ${patient.accountStatus}`);

        // Get all appointments for this patient with this doctor
        const appointments = await Appointment.find({
            doctor: doctorId,
            user: patientId
        })
        .populate({
            path: "doctor",
            select: "firstName lastName specialization profileImage"
        })
        .sort({ appointmentDate: -1 });

        // Check if this patient has any appointment with this doctor
        if (appointments.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this patient's records"
            });
        }

        // Get patient statistics
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

        // Get last visit and next appointment
        const lastVisit = appointments[0]?.appointmentDate || null;
        const nextAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');

        // Get unique doctors this patient has seen
        const uniqueDoctors = [...new Set(appointments.map(a => a.doctor?._id?.toString()))];

        res.status(200).json({
            success: true,
            data: {
                patient: {
                    ...patient.toObject(),
                    password: undefined
                },
                statistics: {
                    totalAppointments,
                    completedAppointments,
                    upcomingAppointments,
                    cancelledAppointments,
                    uniqueDoctors: uniqueDoctors.length
                },
                appointments,
                lastVisit,
                nextAppointment: nextAppointment || null
            }
        });

    } catch (error) {
        console.error('❌ Error in getPatientDetails:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch patient details'
        });
    }
};

/**
 * @desc    Search patients for a doctor
 * @route   GET /api/patients/search?q=searchTerm
 * @access  Private (Doctor only)
 */
exports.searchPatients = async (req, res) => {
    try {
        const { q } = req.query;
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Get all patient IDs from appointments for this doctor
        const appointments = await Appointment.find({
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        }).populate({
            // 🔥 BACK TO 'user'
            path: "user",
            select: "firstName lastName email phone gender age bloodGroup profileImage accountStatus"
        });

        // Filter patients based on search query
        const searchTerm = q.toLowerCase().trim();
        const matchedPatients = [];
        const patientMap = new Map();

        appointments.forEach(app => {
            if (app.user && !patientMap.has(app.user._id.toString())) {
                const user = app.user;
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                const email = (user.email || '').toLowerCase();
                const phone = user.phone || '';
                
                if (fullName.includes(searchTerm) || 
                    email.includes(searchTerm) ||
                    phone.includes(searchTerm)) {
                    
                    patientMap.set(user._id.toString(), true);
                    matchedPatients.push({
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        gender: user.gender,
                        age: user.age,
                        bloodGroup: user.bloodGroup,
                        profileImage: user.profileImage,
                        accountStatus: user.accountStatus || 'active',
                        lastVisit: app.appointmentDate
                    });
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                patients: matchedPatients,
                total: matchedPatients.length,
                searchTerm: q
            }
        });

    } catch (error) {
        console.error('❌ Error in searchPatients:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search patients'
        });
    }
};

/**
 * @desc    Get all appointments for a specific patient
 * @route   GET /api/patients/:patientId/appointments
 * @access  Private (Doctor only)
 */
exports.getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID"
            });
        }

        // Check if patient exists
        const patient = await User.findById(patientId).select("firstName lastName accountStatus");
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Get all appointments
        const appointments = await Appointment.find({
            doctor: doctorId,
            user: patientId
        })
        .populate({
            path: "doctor",
            select: "firstName lastName specialization"
        })
        .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            data: {
                patient,
                appointments,
                total: appointments.length
            }
        });

    } catch (error) {
        console.error('❌ Error in getPatientAppointments:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch patient appointments'
        });
    }
};

/**
 * @desc    Update patient account status (active/inactive)
 * @route   PUT /api/patients/:patientId/status
 * @access  Private (Doctor only)
 */
exports.updatePatientStatus = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status } = req.body;
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID"
            });
        }

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'active' or 'inactive'"
            });
        }

        // Check if patient has appointments with this doctor
        const appointmentExists = await Appointment.findOne({
            doctor: doctorId,
            user: patientId
        });

        if (!appointmentExists) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this patient"
            });
        }

        // Update patient status
        const patient = await User.findByIdAndUpdate(
            patientId,
            { accountStatus: status },
            { new: true, runValidators: true }
        ).select("firstName lastName email accountStatus");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        console.log(`✅ Patient ${patient.firstName} ${patient.lastName} status updated to: ${status}`);

        res.status(200).json({
            success: true,
            message: `Patient status updated to ${status}`,
            data: patient
        });

    } catch (error) {
        console.error('❌ Error in updatePatientStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update patient status'
        });
    }
};

/**
 * @desc    Update multiple patient statuses (bulk update)
 * @route   PUT /api/patients/bulk-status
 * @access  Private (Doctor only)
 */
exports.bulkUpdatePatientStatus = async (req, res) => {
    try {
        const { patientIds, status } = req.body;
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Patient IDs array is required"
            });
        }

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'active' or 'inactive'"
            });
        }

        // Check if all patients have appointments with this doctor
        const appointments = await Appointment.find({
            doctor: doctorId,
            user: { $in: patientIds }
        });

        const validPatientIds = [...new Set(appointments.map(a => a.user.toString()))];
        
        if (validPatientIds.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to these patients"
            });
        }

        // Update all patients
        const result = await User.updateMany(
            { _id: { $in: validPatientIds } },
            { accountStatus: status }
        );

        console.log(`✅ Bulk update: ${result.modifiedCount} patients updated to ${status}`);

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} patients updated to ${status}`,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            }
        });

    } catch (error) {
        console.error('❌ Error in bulkUpdatePatientStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update patients'
        });
    }
};

/**
 * @desc    Get patient statistics only
 * @route   GET /api/patients/stats
 * @access  Private (Doctor only)
 */
exports.getPatientStats = async (req, res) => {
    try {
        const doctorId = req.userData?._id || req.user?.id || req.user?._id;

        // Get all appointments for this doctor
        const appointments = await Appointment.find({
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        }).populate({
            // 🔥 BACK TO 'user'
            path: "user",
            select: "accountStatus"
        });

        // Get unique patients
        const patientMap = new Map();
        appointments.forEach(app => {
            if (app.user) {
                const userId = app.user._id.toString();
                if (!patientMap.has(userId)) {
                    patientMap.set(userId, {
                        id: userId,
                        status: app.user.accountStatus || 'active'
                    });
                }
            }
        });

        const patients = Array.from(patientMap.values());
        const total = patients.length;
        const active = patients.filter(p => p.status === 'active').length;
        const inactive = patients.filter(p => p.status === 'inactive').length;

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    total,
                    active,
                    inactive
                }
            }
        });

    } catch (error) {
        console.error('❌ Error in getPatientStats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch patient statistics'
        });
    }
};