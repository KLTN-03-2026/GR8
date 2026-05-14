// server/src/modules/auth/auth.route.js
import express from "express";
import { register, login, refreshToken, logout, logoutAll, me, changePassword, forgotPassword, googleCallback, sendOtp, verifyOtp, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema } from "./auth.validation.js";
import { authLoginLimiter, authRegisterLimiter } from "./auth.rate-limit.js";
import passport from "../../config/passport.js";

const router = express.Router();

// Đăng ký tài khoản (legacy - không OTP)
router.post("/register", authRegisterLimiter, validateBody(registerSchema), register);

// Đăng ký có OTP: bước 1 - gửi OTP
router.post("/register/send-otp", authRegisterLimiter, validateBody(registerSchema), sendOtp);

// Đăng ký có OTP: bước 2 - xác thực OTP
router.post("/register/verify-otp", verifyOtp);

// Đăng nhập
router.post("/login", authLoginLimiter, validateBody(loginSchema), login);

// Làm mới access token bằng refresh token
router.post("/refresh-token", refreshToken);

// Đăng xuất (thu hồi refresh token)
router.post("/logout", logout);

// Đăng xuất khỏi tất cả thiết bị
router.post("/logout-all", protect, logoutAll);

// Lấy thông tin user hiện tại
router.get("/me", protect, me);

// Đổi mật khẩu
router.post("/change-password", protect, validateBody(changePasswordSchema), changePassword);

// Quên mật khẩu (mock legacy)
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);

// Quên mật khẩu qua OTP: bước 1 - gửi OTP
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);

// Quên mật khẩu qua OTP: bước 2 - xác thực OTP
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);

// Quên mật khẩu qua OTP: bước 3 - đặt mật khẩu mới
router.post("/forgot-password/reset", resetPassword);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`, session: false }),
  googleCallback
);

export default router;