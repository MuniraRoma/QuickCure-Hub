const transporter = require("../config/emailConfig");
const { getEmailTemplate } = require("./templateService");

const sendEmail = async ({
  to,
  subject,
  html,
  template = null,
  templateData = {},
}) => {
  try {
    // If template name provided, generate HTML
    if (template) {
      html = getEmailTemplate(template, templateData);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Bulk email sender
const sendBulkEmails = async (recipients, subject, html) => {
  const promises = recipients.map((email) =>
    sendEmail({ to: email, subject, html })
  );
  return Promise.allSettled(promises);
};

module.exports = { sendEmail, sendBulkEmails };