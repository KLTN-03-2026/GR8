// Node.js v18+ có fetch built-in, không cần node-fetch

if (process.env.BREVO_API_KEY) {
  console.log("✅ Mailer ready: Brevo HTTP API");
} else {
  console.warn("⚠️  BREVO_API_KEY chưa được set");
}

export const sendOtpEmail = async (toEmail, otp, type = "register") => {
  const isReset = type === "reset";

  const subject = isReset
    ? "Mã OTP đặt lại mật khẩu - SmartBuilding"
    : "Mã xác thực OTP đăng ký - SmartBuilding";

  const headerColor = isReset ? "#dc2626" : "#059669";
  const desc = isReset
    ? "Bạn vừa yêu cầu đặt lại mật khẩu. Đây là mã OTP của bạn:"
    : "Xin chào! Đây là mã OTP để xác thực đăng ký tài khoản của bạn:";
  const note = isReset
    ? "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này."
    : "Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: ${headerColor}; margin-bottom: 8px;">SmartBuilding</h2>
      <p style="color: #374151; margin-bottom: 24px;">${desc}</p>
      <div style="background: #f9fafb; border: 2px dashed ${headerColor}; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: ${headerColor};">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">⏱ Mã có hiệu lực trong <strong>5 phút</strong>.</p>
      <p style="color: #6b7280; font-size: 14px;">${note}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 SmartBuilding. All rights reserved.</p>
    </div>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "SmartBuilding", email: process.env.BREVO_SENDER || "no-reply@smartbuilding.app" },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Brevo API error: ${response.status}`);
  }
};

export default { sendOtpEmail };
