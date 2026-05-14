// server/src/modules/thanhvien/thanhvien.route.js
import express from "express";
import * as controller from "./thanhvien.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

// Xem tất cả thành viên (dành cho admin/quản lý)
router.get(
  "/",
  protect,
  authorize(ROLES.QUAN_LY),
  controller.getAllMembers
);

// Xem danh sách thành viên của căn hộ
router.get(
  "/canho/:canHoID",
  protect,
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.NGUOI_THUE),
  controller.getByCanHo
);

router.post(
  "/canho/:canHoID",
  protect,
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.NGUOI_THUE),
  controller.addMember
);

router.patch(
  "/:id",
  protect,
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.NGUOI_THUE),
  controller.updateMember
);

router.patch(
  "/:id/checkout",
  protect,
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.NGUOI_THUE),
  controller.checkOut
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA),
  controller.deleteMember
);

export default router;
