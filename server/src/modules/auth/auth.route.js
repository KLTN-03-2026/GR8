// server/src/modules/auth/auth.route.js
import express from "express";
import { register, login } from "./auth.controller.js";

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

export default router;