// utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g. smtp.gmail.com
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === "true", // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password or SMTP password
  },
});

/**
 * sendCredentialsEmail
 * @param {string} to - recipient email
 * @param {string} name - recipient name
 * @param {string} role - 'admin' | 'freelancer'
 * @param {string} password - plain password (one-time)
 */
export async function sendCredentialsEmail({ to, name, role, emailFromName = "MyPlatform", password }) {
  if (!to) throw new Error("Missing recipient email for credential mail.");

  const subject = `Your ${role === "freelancer" ? "Freelancer" : "Salon Owner"} account credentials`;
  const html = `
    <p>Hi ${name || ""},</p>
    <p>Your account has been created and approved on <strong>${process.env.APP_NAME || "Platform"}</strong>.</p>
    <p><strong>Login details:</strong></p>
    <ul>
      <li>Email: <strong>${to}</strong></li>
      <li>Password: <strong>${password}</strong> (please change after first login)</li>
    </ul>
    <p>Login here: <a href="${process.env.APP_URL || "#"}">${process.env.APP_URL || "Login"}</a></p>
    <p>If you didn't expect this email, contact support.</p>
    <p>Thanks,<br/>${emailFromName}</p>
  `;

  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || emailFromName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}
