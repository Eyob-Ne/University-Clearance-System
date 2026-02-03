const nodemailer = require("nodemailer");

const sendResetEmail = async (toEmail, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"University Clearance System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>Click the button below to proceed:</p>

          <a href="${resetLink}"
             style="
               display:inline-block;
               padding:12px 20px;
               background:#2563eb;
               color:#ffffff;
               text-decoration:none;
               border-radius:6px;
               font-weight:bold;
             ">
            Reset Password
          </a>

          <p style="margin-top:20px;">
            ⏰ This link expires in <b>15 minutes</b>.
          </p>

          <p>If you did not request this, please ignore this email.</p>

          <hr />
          <p style="font-size:12px;color:#666;">
            University Clearance System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Reset email sent to:", toEmail);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendResetEmail;
