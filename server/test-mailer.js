import "dotenv/config";
import nodemailer from "nodemailer";

console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS length:", process.env.MAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Kết nối thất bại:", error.message);
    console.error("Chi tiết:", error);
  } else {
    console.log("✅ Kết nối Gmail thành công!");
    
    // Gửi email test
    transporter.sendMail({
      from: `"SmartBuilding Test" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // gửi cho chính mình
      subject: "Test OTP Email",
      text: "Mã OTP test: 123456",
    }, (err, info) => {
      if (err) {
        console.error("❌ Gửi email thất bại:", err.message);
      } else {
        console.log("✅ Email đã gửi:", info.messageId);
      }
      process.exit(0);
    });
  }
});
