// server/src/modules/auth/auth.route.js
import express from "express";
import { register, login, refreshToken, logout, logoutAll, me, changePassword, forgotPassword } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema } from "./auth.validation.js";
import { authLoginLimiter, authRegisterLimiter } from "./auth.rate-limit.js";

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", authRegisterLimiter, validateBody(registerSchema), register);

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

// Quên mật khẩu (mock)
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);

export default router;