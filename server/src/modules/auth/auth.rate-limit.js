import rateLimit from "express-rate-limit";

const baseConfig = {
  windowMs:100 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
};

export const authLoginLimiter = rateLimit({
  ...baseConfig,
  max: 1000,
  message: {
    success: false,
    message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
});

export const authRegisterLimiter = rateLimit({
  ...baseConfig,
  max: 1000,
  message: {
    success: false,
    message: "Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
});

