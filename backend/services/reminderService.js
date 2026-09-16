const cron = require("node-cron");
const NotificationService = require("./notificationService");
const Prescription = require("../models/Prescription");
const User = require("../models/User");

class ReminderService {
    constructor() {
        
        this.scheduleReminders();
    }

    // ✅ scheduleReminders মেথড - ক্লাসের ভিতরে
    scheduleReminders() {
        // প্রতি মিনিটে চেক করবে
        cron.schedule("* * * * *", async () => {
            console.log("⏰ Checking reminders...", new Date().toLocaleString());
            await this.checkAndSendReminders();
        });

        // প্রতিদিন সকাল ৮টায় follow-up check করবে
        cron.schedule("0 8 * * *", async () => {
            console.log("📅 Checking follow-ups...", new Date().toLocaleString());
            await this.checkFollowUpReminders();
        });
    }

    // ✅ checkAndSendReminders মেথড - ক্লাসের ভিতরে
    async checkAndSendReminders() {
        try {
            const currentTime = this.getCurrentTime();
            
            // Prescription থেকে active medicine খুঁজি
            const prescriptions = await Prescription.find({
                status: "active",
                isDeleted: false,
                "medicines.isActive": true,
                "medicines.reminderTime": currentTime,
            }).populate("patient", "name email");

            if (prescriptions.length === 0) {
                console.log(`No reminders at ${currentTime}`);
                return;
            }

            console.log(`Found ${prescriptions.length} prescriptions with reminders`);

            for (const prescription of prescriptions) {
                // কোন medicine-গুলোর reminder time ম্যাচ করছে
                const dueMedicines = prescription.medicines.filter(
                    (med) => med.reminderTime === currentTime && med.isActive
                );

                if (dueMedicines.length === 0) continue;

                // Notification তৈরি করি
                await NotificationService.createNotification({
                    userId: prescription.patient._id,
                    title: "💊 Medicine Reminder",
                    message: `Time to take ${dueMedicines.map(m => m.medicineName).join(", ")}`,
                    type: "medicine",
                    priority: "high",
                    link: `/prescriptions/${prescription._id}`,
                    metadata: {
                        prescriptionId: prescription._id,
                        medicines: dueMedicines,
                    },
                    sendEmail: true,
                    emailTemplate: "medicineReminder",
                    emailData: {
                        patientName: prescription.patient.name,
                        medicines: dueMedicines,
                        prescriptionId: prescription._id,
                    },
                });

                // Reminder count update
                prescription.totalReminderCount = (prescription.totalReminderCount || 0) + 1;
                prescription.lastReminderSentAt = new Date();
                await prescription.save();

                console.log(`✅ Reminder sent to ${prescription.patient.email}`);
            }
        } catch (error) {
            console.error("Reminder check error:", error);
        }
    }

    // ✅ checkFollowUpReminders মেথড - ক্লাসের ভিতরে
    async checkFollowUpReminders() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Today's follow-up appointments
            const prescriptions = await Prescription.find({
                status: "active",
                isDeleted: false,
                followUpDate: {
                    $gte: today,
                    $lt: tomorrow,
                },
            }).populate("patient doctor", "name email");

            for (const prescription of prescriptions) {
                await NotificationService.createNotification({
                    userId: prescription.patient._id,
                    title: "🏥 Follow-up Reminder",
                    message: `Your follow-up appointment with Dr. ${prescription.doctor.name} is today.`,
                    type: "followup",
                    priority: "high",
                    link: `/prescriptions/${prescription._id}`,
                    metadata: {
                        prescriptionId: prescription._id,
                        followUpDate: prescription.followUpDate,
                    },
                    sendEmail: true,
                    emailTemplate: "followUpReminder",
                    emailData: {
                        patientName: prescription.patient.name,
                        doctorName: prescription.doctor.name,
                        followUpDate: prescription.followUpDate,
                    },
                });

                console.log(`📅 Follow-up reminder sent to ${prescription.patient.email}`);
            }
        } catch (error) {
            console.error("Follow-up check error:", error);
        }
    }

    // ✅ getCurrentTime মেথড - ক্লাসের ভিতরে
    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    // ✅ Manual trigger for testing - ক্লাসের ভিতরে
    async triggerManualReminder(patientId) {
        try {
            const prescriptions = await Prescription.find({
                patient: patientId,
                status: "active",
                isDeleted: false,
                "medicines.isActive": true,
            }).populate("patient", "name email");

            if (prescriptions.length === 0) {
                return { success: false, message: "No active prescriptions found" };
            }

            const allMedicines = [];
            let prescriptionId = null;

            for (const prescription of prescriptions) {
                prescription.medicines.forEach((medicine) => {
                    if (medicine.isActive) {
                        allMedicines.push(medicine);
                    }
                });
                if (!prescriptionId) {
                    prescriptionId = prescription._id;
                }
            }

            if (allMedicines.length === 0) {
                return { success: false, message: "No active medicines found" };
            }

            await NotificationService.createNotification({
                userId: patientId,
                title: "💊 Medicine Reminder (Manual)",
                message: `Time to take ${allMedicines.map(m => m.medicineName).join(", ")}`,
                type: "medicine",
                priority: "high",
                link: `/prescriptions/${prescriptionId}`,
                metadata: {
                    prescriptionId,
                    medicines: allMedicines,
                },
                sendEmail: true,
                emailTemplate: "medicineReminder",
                emailData: {
                    patientName: prescriptions[0].patient.name,
                    medicines: allMedicines,
                    prescriptionId,
                },
            });

            return { success: true, medicines: allMedicines };
        } catch (error) {
            console.error("Manual reminder error:", error);
            return { success: false, message: error.message };
        }
    }
}

// ✅ Export instance
module.exports = new ReminderService();