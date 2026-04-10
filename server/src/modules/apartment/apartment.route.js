// server/src/modules/apartment/apartment.route.js
import express from "express";
import {
  getApartments,
  getApartmentDetail,
  createApartment,
} from "./apartment.controller.js";

import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

// ==================== ROUTES PUBLIC (Ai cũng xem được) ====================
router.get("/", getApartments);           // Xem danh sách căn hộ
router.get("/:id", getApartmentDetail);   // Xem chi tiết căn hộ

// Chỉ người đã đăng nhập + có vai trò ChuNha hoặc QuanLy mới được tạo căn hộ
router.post(
  "/",
  protect,                    // Bắt buộc phải có token
  authorize("ChuNha", "QuanLy"),   // Chỉ Chủ nhà và Quản lý được tạo
  createApartment
);

export default router;