const axios = require("axios");

const sendResetEmail = async (toEmail, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Debre Birhan University",
          email: "eyoba8315@gmail.com",
        },
        to: [{ email: toEmail }],
        subject: "Your Password Reset OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#111;">
            <h2>Password Reset Verification</h2>
            <p>You requested to reset your password.</p>

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
              ⏰ OTP expires in <b>15 minutes</b>.
            </p>

            <hr />
            <p style="font-size:12px;color:#666;">
              University Clearance System
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📧 OTP email sent via Brevo API to:", toEmail);
  } catch (error) {
    console.error(
      "❌ OTP email sending failed:",
      error.response?.data || error.message
    );
    throw new Error("OTP email could not be sent");
  }
};

module.exports = sendResetEmail;
