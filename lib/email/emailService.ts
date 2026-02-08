import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize the email transporter with Google SMTP
 */
export function initializeEmailTransporter() {
  if (!transporter) {
    const emailUser = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error(
        "Email credentials not configured. Set EMAIL_FROM and EMAIL_APP_PASSWORD in .env.local",
      );
      return null;
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    console.log("Email transporter initialized");
  }

  return transporter;
}

/**
 * Get the email transporter instance
 */
export function getEmailTransporter() {
  if (!transporter) {
    return initializeEmailTransporter();
  }
  return transporter;
}

/**
 * Verify email connection
 */
export async function verifyEmailConnection() {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server verification failed:", error);
    return false;
  }
}

/**
 * Send an email
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  senderName?: string; // Optional custom sender name
}) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("Email transporter not initialized");
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const senderName = options.senderName || "Davnex Store";

  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${from}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
