import express from "express";
import * as controller from "./hopdong.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post("/create", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.create);

router.put("/sign/:id", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.sign);

// Danh sách yêu cầu kết thúc hợp đồng (QuanLy/ChuNha xem)
router.get("/terminate-requests", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.getTerminateRequests);

router.post("/:id/request-terminate", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.requestTerminate);

router.put("/terminate/:id", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.terminate);

// Hủy yêu cầu kết thúc (QuanLy/ChuNha từ chối yêu cầu)
router.put("/reset-terminate/:id", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.resetTerminate);

router.get("/", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), controller.getAll);

router.get("/my", protect, authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.myContract);

router.get("/:id", protect, authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.getById);

export default router;
