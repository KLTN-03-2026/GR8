// Lưu OTP tạm thời trong memory
// Key: email, Value: { otp, expiresAt, userData }

const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000)); // 6 chữ số

export const saveOtp = (email, otp, userData) => {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    userData,
  });
};

export const verifyOtp = (email, inputOtp) => {
  const record = otpStore.get(email.toLowerCase());

  if (!record) return { valid: false, reason: "Mã OTP không tồn tại hoặc đã hết hạn" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: "Mã OTP đã hết hạn" };
  }
  if (record.otp !== inputOtp) {
    return { valid: false, reason: "Mã OTP không chính xác" };
  }

  return { valid: true, userData: record.userData };
};

export const deleteOtp = (email) => {
  otpStore.delete(email.toLowerCase());
};
