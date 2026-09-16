const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    // 👤 রোগী (Patient) - যার জন্য প্রেসক্রিপশন
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // 👨‍⚕️ ডাক্তার (Doctor) - যিনি প্রেসক্রিপশন দিয়েছেন
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    
    // 📅 অ্যাপয়েন্টমেন্ট (Appointment) - যার সাথে প্রেসক্রিপশন সংযুক্ত
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    
    // 🏥 রোগ নির্ণয় (Diagnosis)
    diagnosis: {
      type: String,
      default: "",
    },
    
    // 💊 ওষুধের তালিকা (Medicines List) - 🔥 UPDATED for Reminder
    medicines: [
      {
        medicineName: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: {
          type: String,
          default: "",
        },
        // 🆕 Reminder Time - Medicine reminder-এর জন্য
        reminderTime: {
          type: String, // Format: "08:00", "14:30", "20:00"
          default: null,
        },
        // 🆕 Medicine active status - reminder send করা হবে কিনা
        isActive: {
          type: Boolean,
          default: true,
        },
        // 🆕 শেষ কখন reminder পাঠানো হয়েছে
        lastReminderSent: {
          type: Date,
          default: null,
        },
        // 🆕 কতবার reminder পাঠানো হয়েছে
        reminderCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    
    // 📝 অতিরিক্ত নোট (Additional Notes)
    notes: {
      type: String,
      default: "",
    },
    
    // 📅 ফলো-আপ তারিখ (Follow-up Date)
    followUpDate: {
      type: Date,
      default: null,
    },

    // ✅ STATUS - প্রেসক্রিপশনের বর্তমান অবস্থা
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },

    // ✅ SOFT DELETE - ডিলিট করার জন্য
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ✅ ডিলিট করার সময়
    deletedAt: {
      type: Date,
      default: null,
    },

    // 🔄 রিফিল কাউন্ট
    refills: {
      type: Number,
      default: 0,
    },

    // ✅ ব্যবহৃত রিফিল
    refillsUsed: {
      type: Number,
      default: 0,
    },

    // 🆕 Notification tracking - কোন notifications পাঠানো হয়েছে
    notificationHistory: [
      {
        notificationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notification",
        },
        type: {
          type: String,
          enum: ["created", "reminder", "followup", "status_change", "expired"],
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🆕 Last reminder sent time (পুরো prescription-এর জন্য)
    lastReminderSentAt: {
      type: Date,
      default: null,
    },

    // 🆕 Total reminder count (পুরো prescription-এর জন্য)
    totalReminderCount: {
      type: Number,
      default: 0,
    },

    // 🆕 Next reminder time (কখন next reminder পাঠাতে হবে)
    nextReminderTime: {
      type: String, // Format: "08:00"
      default: null,
    },
  },
  {
    timestamps: true, // ✅ createdAt, updatedAt স্বয়ংক্রিয়ভাবে যোগ হবে
  }
);

// 🔍 দ্রুত খুঁজে পাওয়ার জন্য ইনডেক্স (Indexes for faster queries)
prescriptionSchema.index({ patient: 1, createdAt: -1 }); // রোগীর সব প্রেসক্রিপশন
prescriptionSchema.index({ doctor: 1, createdAt: -1 }); // ডাক্তারের সব প্রেসক্রিপশন
prescriptionSchema.index({ appointment: 1 }); // অ্যাপয়েন্টমেন্ট অনুযায়ী খোঁজ
prescriptionSchema.index({ status: 1 }); // স্ট্যাটাস অনুযায়ী খোঁজ
prescriptionSchema.index({ isDeleted: 1 }); // ডিলিট ফিল্টার

// 🆕 Reminder-এর জন্য নতুন ইনডেক্স
prescriptionSchema.index({ 
  "medicines.reminderTime": 1, 
  "medicines.isActive": 1 
}); // Reminder খোঁজার জন্য

prescriptionSchema.index({ 
  status: 1, 
  "medicines.isActive": 1,
  "medicines.reminderTime": 1 
}); // Active reminder খোঁজার জন্য

// 🆕 Follow-up reminder-এর জন্য ইনডেক্স
prescriptionSchema.index({ 
  followUpDate: 1, 
  status: 1 
});

// 🆕 Method: Get active medicines with reminder
prescriptionSchema.methods.getActiveMedicinesWithReminder = function() {
  return this.medicines.filter(
    med => med.isActive && med.reminderTime
  );
};

// 🆕 Method: Get medicines by reminder time
prescriptionSchema.methods.getMedicinesByReminderTime = function(time) {
  return this.medicines.filter(
    med => med.reminderTime === time && med.isActive
  );
};

// 🆕 Method: Update reminder count
prescriptionSchema.methods.incrementReminderCount = async function() {
  this.totalReminderCount += 1;
  this.lastReminderSentAt = new Date();
  await this.save();
  return this;
};

// 🆕 Static method: Find prescriptions with upcoming reminders
prescriptionSchema.statics.findWithUpcomingReminders = function(time) {
  return this.find({
    status: "active",
    isDeleted: false,
    "medicines.isActive": true,
    "medicines.reminderTime": time,
  }).populate("patient", "name email");
};

// 🆕 Static method: Find prescriptions with follow-up today
prescriptionSchema.statics.findWithFollowUpToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    status: "active",
    isDeleted: false,
    followUpDate: {
      $gte: today,
      $lt: tomorrow,
    },
  }).populate("patient doctor", "name email");
};

// 🆕 Virtual: Check if any medicine has reminder
prescriptionSchema.virtual("hasReminder").get(function() {
  return this.medicines.some(med => med.reminderTime && med.isActive);
});

// 🆕 Virtual: Get all reminder times
prescriptionSchema.virtual("reminderTimes").get(function() {
  const times = new Set();
  this.medicines.forEach(med => {
    if (med.reminderTime && med.isActive) {
      times.add(med.reminderTime);
    }
  });
  return Array.from(times).sort();
});

// 🆕 Virtual: Get next reminder time
prescriptionSchema.virtual("nextReminder").get(function() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const times = this.reminderTimes;
  for (const time of times) {
    if (time > currentTime) {
      return time;
    }
  }
  return times.length > 0 ? times[0] : null;
});

// Ensure virtuals are included in JSON output
prescriptionSchema.set("toJSON", { virtuals: true });
prescriptionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);