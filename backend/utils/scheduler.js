// utils/scheduler.js
const cron = require("node-cron");
const { sendEmail } = require("./sendEmail");

// Import services
const reminderService = require("../services/reminderService");
const notificationService = require("../services/notificationService");

/**
 * Initialize all scheduled jobs (Cleanup ছাড়া)
 */
const initializeScheduler = () => {
  console.log("⏰ Initializing scheduler...");

  // 1. Medicine Reminder - প্রতি মিনিটে চেক করবে
  scheduleMedicineReminders();

  // 2. Follow-up Reminder - প্রতিদিন সকাল ৮টায়
  scheduleFollowUpReminders();

  // 3. Appointment Reminder - প্রতিদিন সকাল ৯টায় (আগামীকালের অ্যাপয়েন্টমেন্ট)
  scheduleAppointmentReminders();

  // ❌ Database Cleanup সরিয়ে ফেলা হয়েছে

  console.log("✅ All schedulers initialized");
  console.log("   💊 Medicine Reminder: Every minute");
  console.log("   📅 Follow-up Reminder: Daily at 8:00 AM");
  console.log("   📅 Appointment Reminder: Daily at 9:00 AM");
  console.log("   ❌ Database Cleanup: DISABLED");
};

/**
 * Schedule 1: Medicine Reminder - প্রতি মিনিটে
 */
const scheduleMedicineReminders = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏰ [Medicine Reminder] Checking...", new Date().toLocaleString());
      await reminderService.checkAndSendReminders();
    } catch (error) {
      console.error("❌ Medicine reminder error:", error);
    }
  });
  console.log("✅ Medicine reminder scheduler: Every minute");
};

/**
 * Schedule 2: Follow-up Reminder - প্রতিদিন সকাল ৮টায়
 */
const scheduleFollowUpReminders = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("📅 [Follow-up Reminder] Checking...", new Date().toLocaleString());
      await reminderService.checkFollowUpReminders();
    } catch (error) {
      console.error("❌ Follow-up reminder error:", error);
    }
  });
  console.log("✅ Follow-up reminder scheduler: Daily at 8:00 AM");
};

/**
 * Schedule 3: Appointment Reminder - প্রতিদিন সকাল ৯টায় (আগামীকালের অ্যাপয়েন্টমেন্ট)
 */
const scheduleAppointmentReminders = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("📅 [Appointment Reminder] Checking...", new Date().toLocaleString());
      await sendTomorrowAppointmentReminders();
    } catch (error) {
      console.error("❌ Appointment reminder error:", error);
    }
  });
  console.log("✅ Appointment reminder scheduler: Daily at 9:00 AM");
};

/**
 * Send appointment reminders for tomorrow
 */
const sendTomorrowAppointmentReminders = async () => {
  try {
    const Appointment = require("../models/Appointment");
    const User = require("../models/User");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfter,
      },
      status: "Approved",
    })
      .populate("user", "firstName lastName email")
      .populate("doctor", "firstName lastName specialization");

    console.log(`📋 Found ${appointments.length} appointments for tomorrow`);

    for (const appointment of appointments) {
      const patientName = appointment.user 
        ? `${appointment.user.firstName} ${appointment.user.lastName}`.trim() 
        : "Patient";
      
      const doctorName = appointment.doctor
        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`.trim()
        : "Doctor";

      await sendEmail({
        to: appointment.user.email,
        subject: "Appointment Reminder - QuickCure Hub",
        html: `
          <h2>Appointment Reminder</h2>
          <p>Dear ${patientName},</p>
          <p>This is a reminder for your appointment <strong>tomorrow</strong>.</p>
          <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
            <p><strong>📅 Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>⏰ Time:</strong> ${appointment.timeSlot || "Flexible"}</p>
          </div>
          <p>Please be on time. If you need to reschedule, please contact us.</p>
          <a href="${process.env.APP_URL}/appointments/${appointment._id}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
        `,
      });

      console.log(`✅ Reminder sent to ${appointment.user.email}`);
    }
  } catch (error) {
    console.error("❌ Send appointment reminders error:", error);
  }
};

/**
 * Manual trigger - জন্য (Testing)
 */
const triggerManualReminder = async (patientId) => {
  try {
    console.log(`🔔 Manual reminder trigger for patient: ${patientId}`);
    const result = await reminderService.triggerManualReminder(patientId);
    return result;
  } catch (error) {
    console.error("❌ Manual reminder error:", error);
    throw error;
  }
};

module.exports = {
  initializeScheduler,
  triggerManualReminder,
  sendTomorrowAppointmentReminders,
  // ❌ cleanupDatabase সরিয়ে ফেলা হয়েছে
};