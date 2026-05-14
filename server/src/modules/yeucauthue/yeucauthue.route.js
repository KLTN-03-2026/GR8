import express from "express";
import * as controller from "./yeucauthue.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post("/create", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.create);

router.get("/profile-check", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.checkProfile);

router.get("/my", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.getMyRequests);

// Khách hủy yêu cầu của mình
router.put("/cancel/:id", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.cancelRequest);

router.get("/", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.getAll);

router.get("/:id", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.getById);

// Quản lý duyệt trực tiếp (không cần chủ nhà)
router.put("/manager-approve/:id", protect, authorize(ROLES.QUAN_LY), controller.managerApprove);

// Đặt lịch xem căn hộ
router.put("/schedule/:id", protect, authorize(ROLES.QUAN_LY), controller.scheduleViewing);

router.put("/reject/:id", protect, authorize(ROLES.QUAN_LY), controller.reject);

export default router;
