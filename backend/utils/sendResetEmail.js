const nodemailer = require("nodemailer");

const sendResetEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // required for port 587
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    const mailOptions = {
      from: `"Debre Birhan  University" <eyoba8315@gmail.com>`,
      to: toEmail,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#111;">
          <h2>Password Reset Verification</h2>
          <p>You requested to reset your password.</p>

          <p style="margin: 20px 0;">Use the OTP below to continue:</p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            background: #f3f4f6;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            color: #2563eb;
          ">
            ${otp}
          </div>

          <p style="margin-top:20px;">
            ⏰ This OTP expires in <b>15 minutes</b>.
          </p>

          <p>If you did not request this, please ignore this email.</p>

          <hr />
          <p style="font-size:12px;color:#666;">
            University Clearance System
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 OTP email sent via Brevo to:", toEmail);
  } catch (error) {
    console.error("❌ OTP email sending failed:", error);
    throw new Error("OTP email could not be sent");
  }
};

module.exports = sendResetEmail;
