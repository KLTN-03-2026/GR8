import rateLimit from "express-rate-limit";

// Login: 10 lần / 15 phút / IP
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ đếm request thất bại
  message: {
    success: false,
    message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    errors: [{ field: "general", message: "Quá nhiều lần thử. Vui lòng thử lại sau 15 phút." }],
  },
});

// Register: 5 lần / 60 phút / IP
export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
    errors: [{ field: "general", message: "Quá nhiều lần thử. Vui lòng thử lại sau 1 giờ." }],
  },
});
