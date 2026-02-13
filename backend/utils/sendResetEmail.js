const brevo = require("@getbrevo/brevo");

const sendResetEmail = async (toEmail, otp) => {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.EMAIL_USER,
      name: "University Clearance System"
    };

    sendSmtpEmail.to = [
      {
        email: toEmail
      }
    ];

    sendSmtpEmail.subject = "Your Password Reset OTP";

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Password Reset Verification</h2>
        <p>You requested to reset your password.</p>

        <div style="
          font-size:28px;
          font-weight:bold;
          letter-spacing:6px;
          background:#f3f4f6;
          padding:15px;
          text-align:center;
          border-radius:8px;
          color:#2563eb;">
          ${otp}
        </div>

        <p style="margin-top:20px;">
          This OTP expires in <b>5 minutes</b>.
        </p>

        <p>If you did not request this, please ignore this email.</p>

        <hr />
        <p style="font-size:12px;color:#666;">
          University Clearance System
        </p>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("📧 OTP email sent successfully:", toEmail);

  } catch (error) {
    console.error("❌ Brevo email error:", error.response?.body || error);
    throw new Error("OTP email could not be sent");
  }
};

module.exports = sendResetEmail;
