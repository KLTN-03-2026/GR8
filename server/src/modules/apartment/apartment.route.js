// server/src/modules/apartment/apartment.route.js
import express from "express";
import {
  getApartments,
  getApartmentDetail,
  createApartment,
  updateApartment,
  softDeleteApartment,
} from "./apartment.controller.js";

import { protect, authorize } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../../middleware/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  apartmentListQuerySchema,
  createApartmentSchema,
  updateApartmentSchema,
} from "./apartment.validation.js";

const router = express.Router();

// ==================== ROUTES PUBLIC (Ai cũng xem được) ====================
router.get("/", validateQuery(apartmentListQuerySchema), getApartments); // Xem danh sách căn hộ
router.get("/:id", getApartmentDetail);   // Xem chi tiết căn hộ

// Chỉ người đã đăng nhập + có vai trò ChuNha hoặc QuanLy mới được tạo căn hộ
router.post(
  "/",
  protect,                    // Bắt buộc phải có token
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),   // Chỉ Chủ nhà và Quản lý được tạo
  validateBody(createApartmentSchema),
  createApartment
);

router.patch(
  "/:id",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  validateBody(updateApartmentSchema),
  updateApartment
);

router.delete("/:id", protect, authorize(ROLES.CHU_NHA, ROLES.QUAN_LY), softDeleteApartment);

export default router;