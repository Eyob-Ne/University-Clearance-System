const brevo = require("@getbrevo/brevo");

const sendStatusEmail = async (studentEmail, studentName, status) => {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.EMAIL_USER,
      name: "University Clearance System",
    };

    sendSmtpEmail.to = [{ email: studentEmail }];

    if (status === "approved") {
      sendSmtpEmail.subject = "🎉 Clearance Approved";
      sendSmtpEmail.htmlContent = `
        <h2>Congratulations ${studentName}!</h2>
        <p>Your clearance request has been <b style="color:green;">APPROVED</b>.</p>
        <p>You can now download your clearance certificate.</p>
      `;
    } else if (status === "rejected") {
      sendSmtpEmail.subject = "⚠ Clearance Rejected";
      sendSmtpEmail.htmlContent = `
        <h2>Hello ${studentName},</h2>
        <p>Your clearance request has been <b style="color:red;">REJECTED</b>.</p>
        <p>Please log in to your account to check details.</p>
      `;
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("📧 Status email sent:", studentEmail);

  } catch (error) {
    console.error("❌ Status email error:", error.response?.body || error);
  }
};

module.exports = sendStatusEmail;
