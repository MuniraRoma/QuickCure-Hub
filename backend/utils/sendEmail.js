// utils/sendEmail.js
const transporter = require("../config/emailConfig");

/**
 * Send email to single recipient
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {Array} options.attachments - File attachments (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text = null,
  attachments = [],
}) => {
  try {
    // Validation
    if (!to) {
      throw new Error("Recipient email is required");
    }
    if (!subject) {
      throw new Error("Email subject is required");
    }
    if (!html && !text) {
      throw new Error("Email content (html or text) is required");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text,
      attachments,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      to: to,
    };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send email to multiple recipients
 * @param {Array} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @returns {Promise<Array>} - Results for each recipient
 */
const sendBulkEmail = async ({
  recipients,
  subject,
  html,
  text = null,
}) => {
  try {
    const promises = recipients.map((email) =>
      sendEmail({
        to: email,
        subject,
        html,
        text,
      })
    );

    const results = await Promise.allSettled(promises);
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.status === "fulfilled").length,
      failed: results.filter(r => r.status === "rejected").length,
      details: results,
    };

    console.log(`📊 Bulk email summary: ${summary.successful}/${summary.total} sent`);
    
    return summary;
  } catch (error) {
    console.error("❌ Bulk email error:", error.message);
    throw error;
  }
};

/**
 * Send email with template (using template service)
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise<Object>} - Email send result
 */
const sendTemplateEmail = async ({
  to,
  subject,
  template,
  data = {},
}) => {
  try {
    // Dynamic import to avoid circular dependency
    const { getEmailTemplate } = require("../services/templateService");
    
    const html = getEmailTemplate(template, data);
    
    return await sendEmail({
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Template email error:", error.message);
    throw error;
  }
};

/**
 * Send appointment reminder email
 * @param {Object} options
 * @param {string} options.to - Patient email
 * @param {string} options.patientName - Patient name
 * @param {string} options.doctorName - Doctor name
 * @param {string} options.date - Appointment date
 * @param {string} options.time - Appointment time
 * @param {string} options.location - Appointment location
 * @param {string} options.appointmentId - Appointment ID
 * @returns {Promise<Object>} - Email send result
 */
const sendAppointmentReminder = async ({
  to,
  patientName,
  doctorName,
  date,
  time,
  location = "Online Consultation",
  appointmentId,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .appointment-details { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .appointment-details p { margin: 10px 0; }
        .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🩺 QuickCure Hub</h1>
        </div>
        <div class="content">
          <h2>Appointment Reminder</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>This is a reminder for your upcoming appointment.</p>
          <div class="appointment-details">
            <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
            <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>⏰ Time:</strong> ${time}</p>
            <p><strong>📍 Location:</strong> ${location}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/appointments/${appointmentId}" class="button">View Appointment</a>
          </p>
          <p style="margin-top: 20px; color: #666;">Need to reschedule? Please contact us 24 hours before.</p>
        </div>
        <div class="footer">
          <p>© 2026 QuickCure Hub. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: "Appointment Reminder - QuickCure Hub",
    html,
  });
};

/**
 * Send medicine reminder email
 * @param {Object} options
 * @param {string} options.to - Patient email
 * @param {string} options.patientName - Patient name
 * @param {Array} options.medicines - List of medicines
 * @param {string} options.prescriptionId - Prescription ID
 * @returns {Promise<Object>} - Email send result
 */
const sendMedicineReminder = async ({
  to,
  patientName,
  medicines,
  prescriptionId,
}) => {
  const medicineList = medicines.map(med => `
    <div style="background: #f5f3ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #8b5cf6;">
      <h4 style="margin: 0; color: #4c1d95;">${med.medicineName || med.name}</h4>
      <p style="margin: 5px 0;"><strong>Dosage:</strong> ${med.dosage}</p>
      <p style="margin: 5px 0;"><strong>Frequency:</strong> ${med.frequency || "As directed"}</p>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${med.duration || "7 days"}</p>
      ${med.instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${med.instructions}</p>` : ''}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 Medicine Reminder</h1>
        </div>
        <div class="content">
          <h3>Time to take your medicine!</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>This is a reminder to take your prescribed medication.</p>
          ${medicineList}
          <div class="warning">
            <p>⚠️ Please follow your doctor's prescription carefully.</p>
            <p>Do not change dosage without consulting your doctor.</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/prescriptions/${prescriptionId}" class="button">View Prescription</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 QuickCure Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: "💊 Medicine Reminder - QuickCure Hub",
    html,
  });
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendTemplateEmail,
  sendAppointmentReminder,
  sendMedicineReminder,
};