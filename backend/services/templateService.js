// services/templateService.js
const getEmailTemplate = (type, data) => {
  const templates = {
    // =============================================
    // 📅 APPOINTMENT TEMPLATES
    // =============================================

    // 1️⃣ New Appointment Request (ডাক্তারকে)
    appointmentRequest: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .appointment-details { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🩺 New Appointment Request</h2>
          </div>
          <div class="content">
            <p>Dear <strong>Dr. ${data.doctorName || "Doctor"}</strong>,</p>
            <p>A patient has requested a new appointment.</p>
            <div class="appointment-details">
              <p><strong>👤 Patient:</strong> ${data.patientName || "Unknown Patient"}</p>
              <p><strong>📅 Date:</strong> ${data.appointmentDate || "Not specified"}</p>
              <p><strong>⏰ Time:</strong> ${data.appointmentTime || "Flexible"}</p>
              <p><strong>📍 Location:</strong> ${data.location || "Online Consultation"}</p>
              ${data.reason ? `<p><strong>📝 Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/${data.appointmentId}" class="button">📋 Review Appointment</a>
            <p style="margin-top: 20px; color: #666;">Please review and approve or reject this appointment.</p>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 2️⃣ Appointment Confirmation (রোগীকে)
    appointmentConfirmation: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .appointment-details { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Appointment Confirmed</h2>
          </div>
          <div class="content">
            <h3>Your appointment has been confirmed!</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Your appointment with <strong>Dr. ${data.doctorName}</strong> has been confirmed.</p>
            <div class="appointment-details">
              <p><strong>📅 Date:</strong> ${data.appointmentDate}</p>
              <p><strong>⏰ Time:</strong> ${data.appointmentTime}</p>
              <p><strong>📍 Location:</strong> ${data.location || "Online Consultation"}</p>
            </div>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/${data.appointmentId}" class="button">📋 View Appointment</a>
            <p style="margin-top: 20px; color: #666;">Need to reschedule? Please contact us 24 hours before.</p>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 3️⃣ Appointment Approved (রোগীকে)
    appointmentApproved: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .appointment-details { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Appointment Approved</h2>
          </div>
          <div class="content">
            <h3>Great News!</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Your appointment request has been <strong>approved</strong> by Dr. ${data.doctorName}.</p>
            <div class="appointment-details">
              <p><strong>📅 Date:</strong> ${data.appointmentDate}</p>
              <p><strong>⏰ Time:</strong> ${data.appointmentTime}</p>
            </div>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/${data.appointmentId}" class="button">📋 View Appointment</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 4️⃣ Appointment Rejected (রোগীকে)
    appointmentRejected: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .reason-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❌ Appointment Rejected</h2>
          </div>
          <div class="content">
            <h3>We're Sorry</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Unfortunately, your appointment request has been declined.</p>
            <div class="reason-box">
              <p><strong>📝 Reason:</strong> ${data.reason || "No reason provided"}</p>
            </div>
            <p>Please try booking with another doctor or at a different time.</p>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/book" class="button">📅 Book New Appointment</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 5️⃣ Appointment Cancelled by Patient (ডাক্তারকে)
    appointmentCancelled: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .appointment-details { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔄 Appointment Cancelled by Patient</h2>
          </div>
          <div class="content">
            <p>Dear <strong>Dr. ${data.doctorName || "Doctor"}</strong>,</p>
            <p>A patient has cancelled their appointment.</p>
            <div class="appointment-details">
              <p><strong>👤 Patient:</strong> ${data.patientName || "Unknown Patient"}</p>
              <p><strong>📅 Date:</strong> ${data.appointmentDate || "Not specified"}</p>
              ${data.reason ? `<p><strong>📝 Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/${data.appointmentId}" class="button">📋 View Details</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 6️⃣ Appointment Cancelled by Doctor (রোগীকে)
    appointmentCancelledByDoctor: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .reason-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❌ Appointment Cancelled by Doctor</h2>
          </div>
          <div class="content">
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Your appointment with <strong>Dr. ${data.doctorName}</strong> has been cancelled.</p>
            ${data.reason ? `
              <div class="reason-box">
                <p><strong>📝 Reason:</strong> ${data.reason}</p>
              </div>
            ` : ''}
            <p>Please book a new appointment at your convenience.</p>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/book" class="button">📅 Book New Appointment</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 7️⃣ Consultation Completed (রোগীকে)
    consultationCompleted: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Consultation Completed</h2>
          </div>
          <div class="content">
            <h3>Your consultation is complete!</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Your consultation with <strong>Dr. ${data.doctorName}</strong> has been completed.</p>
            ${data.prescriptionId ? `
              <p>Your prescription is now available. Please click the button below to view it.</p>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/prescriptions/${data.prescriptionId}" class="button">📄 View Prescription</a>
            ` : `
              <p>Thank you for choosing QuickCure Hub. Stay healthy! 💪</p>
            `}
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 8️⃣ Prescription Available (রোগীকে)
    prescriptionAvailable: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .medicine-list { background: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .medicine-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .medicine-item:last-child { border-bottom: none; }
          .button { background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 New Prescription Available</h2>
          </div>
          <div class="content">
            <h3>Your prescription is ready!</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Dr. ${data.doctorName || "Doctor"} has issued a prescription for you.</p>
            <div class="medicine-list">
              <h4>💊 Prescribed Medicines:</h4>
              ${data.medicines && data.medicines.length > 0 ? data.medicines.map(med => `
                <div class="medicine-item">
                  <strong>${med.medicineName || med.name}</strong> - ${med.dosage} - ${med.frequency || "As prescribed"}
                  ${med.duration ? `(${med.duration})` : ''}
                </div>
              `).join('') : '<p>No medicines listed</p>'}
            </div>
            <p><strong>Diagnosis:</strong> ${data.diagnosis || "Not specified"}</p>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/prescriptions/${data.prescriptionId}" class="button">📄 View Prescription</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // 9️⃣ Follow-up Reminder (রোগীকে)
    followUpReminder: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🏥 Follow-up Reminder</h2>
          </div>
          <div class="content">
            <h3>Your follow-up is due!</h3>
            <p>Dear <strong>${data.patientName || "Patient"}</strong>,</p>
            <p>Your follow-up appointment with <strong>Dr. ${data.doctorName}</strong> is due.</p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Follow-up Date:</strong> ${data.followUpDate}</p>
            </div>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/appointments/book" class="button">📅 Schedule Follow-up</a>
          </div>
          <div class="footer">
            <p>© 2026 QuickCure Hub</p>
          </div>
        </div>
      </body>
      </html>
    `,

    // =============================================
    // 💊 MEDICINE REMINDER TEMPLATE
    // =============================================

    // 🔟 Medicine Reminder (রোগীকে)
    medicineReminder: (data) => {
      console.log("📧 [template] medicineReminder data:", JSON.stringify(data, null, 2));

      const patientName = data.patientName || "Patient";
      const medicines = data.medicines || [];
      const prescriptionId = data.prescriptionId || "";

      const medicineList = medicines.map(med => `
        <div class="medicine-item">
          <h4>💊 ${med.medicineName || med.name || "Unknown Medicine"}</h4>
          <p><strong>Dosage:</strong> ${med.dosage || "As prescribed"}</p>
          <p><strong>Frequency:</strong> ${med.frequency || "As prescribed"}</p>
          ${med.instructions ? `<p><strong>Instructions:</strong> ${med.instructions}</p>` : ''}
          <p><strong>Reminder Time:</strong> ${med.reminderTime || "Not set"}</p>
        </div>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h2 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 25px; }
            .medicine-item { background: #f5f3ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #8b5cf6; }
            .medicine-item h4 { margin: 0 0 8px 0; color: #4c1d95; }
            .medicine-item p { margin: 4px 0; color: #555; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .warning p { margin: 0; color: #92400e; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>💊 Medicine Reminder</h2>
              <p>QuickCure Hub</p>
            </div>
            <div class="content">
              <h3 style="color: #1a2332;">Time to take your medicine!</h3>
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>This is a reminder to take your prescribed medication.</p>
              
              ${medicineList || '<p>No medicines listed</p>'}

              <div class="warning">
                <p>⚠️ Please follow your doctor's prescription carefully.</p>
                <p style="margin-top: 4px;">Do not change dosage without consulting your doctor.</p>
              </div>

              <div style="text-align: center; margin-top: 25px;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/prescriptions/${prescriptionId}" class="button">📄 View Prescription</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 QuickCure Hub. All rights reserved.</p>
              <p>This is an automated reminder, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    },
  };

  // ✅ template exists কিনা check করো
  if (!templates[type]) {
    console.warn(`⚠️ Template "${type}" not found, using fallback`);
    return `<p>${data.message || "No template found"}</p>`;
  }

  return templates[type](data);
};

module.exports = { getEmailTemplate };