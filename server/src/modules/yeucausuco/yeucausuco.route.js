import express from "express";
import * as controller from "./yeucausuco.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { uploadYeuCauSuCoPhoto, MAX_YEUCAUSUCO_PHOTOS_PER_REQUEST } from "../../middleware/cloudinary-upload.middleware.js";

const router = express.Router();

router.use(authenticate);

// ⚠️ QUAN TRỌNG: Đặt route cụ thể TRƯỚC route động /:id
// Tenant + Guest access - Phải đặt trước /:id
router.get("/my", authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI), controller.getMyIncidents);
router.post("/", uploadYeuCauSuCoPhoto.array("images", MAX_YEUCAUSUCO_PHOTOS_PER_REQUEST), authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI, ROLES.QUAN_LY), controller.createIncident);

// QuanLy, NhanVienKyThuat access - Route cụ thể trước
router.get("/", authorize(ROLES.QUAN_LY, ROLES.NHAN_VIEN_KY_THUAT, ROLES.CHU_NHA), controller.getAllIncidents);
router.get("/staff/available", authorize(ROLES.QUAN_LY), controller.getAvailableStaff);
router.get("/staff/my", authorize(ROLES.NHAN_VIEN_KY_THUAT), controller.getStaffIncidents);

// Route động /:id - Phải đặt cuối cùng
router.get("/:id", authorize(ROLES.QUAN_LY, ROLES.NHAN_VIEN_KY_THUAT, ROLES.NGUOI_THUE), controller.getIncidentById);
router.post("/:id/assign", authorize(ROLES.QUAN_LY), controller.assignStaff);
router.post("/:id/auto-assign", authorize(ROLES.QUAN_LY), controller.autoAssignStaff);
router.post("/:id/complete", uploadYeuCauSuCoPhoto.array("images", MAX_YEUCAUSUCO_PHOTOS_PER_REQUEST), authorize(ROLES.NHAN_VIEN_KY_THUAT), controller.completeIncident);
router.patch("/:id", authorize(ROLES.QUAN_LY, ROLES.NHAN_VIEN_KY_THUAT), controller.updateIncidentStatus);
router.delete("/:id", authorize(ROLES.QUAN_LY), controller.deleteIncident);

export default router;
