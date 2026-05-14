import express from "express";
import * as meterReadingController from "./chisodiennuoc.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  validate,
  createChiSoDienNuocSchema,
  updateChiSoDienNuocSchema,
  idParamSchema,
  queryFilterSchema,
} from "./chisodiennuoc.validation.js";
import { uploadDongHoPhoto } from "../../middleware/cloudinary-upload.middleware.js";

const router = express.Router();

// ==================== MIDDLEWARE ====================
router.use(authenticate);

// ==================== ROUTES ====================

// UPLOAD ảnh đồng hồ (kỹ thuật viên upload trước khi submit form)
router.post(
  "/upload-photo",
  authorize(ROLES.NHAN_VIEN_KY_THUAT, ROLES.QUAN_LY),
  uploadDongHoPhoto.fields([
    { name: "AnhDongHoDien", maxCount: 1 },
    { name: "AnhDongHoNuoc", maxCount: 1 },
  ]),
  meterReadingController.uploadMeterPhoto
);

// ==================== ROUTES ====================

// READ
router.get("/", validate(queryFilterSchema, "query"), meterReadingController.getAllMeterReadings);

router.get(
  "/pending",
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  meterReadingController.getPendingMeterReadings
);

// Lấy chỉ số cũ (tháng liền trước) cho một căn hộ + tháng cụ thể
router.get("/prev", meterReadingController.getPrevChiSo);

router.get("/:id", validate(idParamSchema, "params"), meterReadingController.getMeterReadingById);

// WRITE
router.post(
  "/",
  authorize(ROLES.NHAN_VIEN_KY_THUAT, ROLES.QUAN_LY),
  validate(createChiSoDienNuocSchema, "body"),
  meterReadingController.createMeterReading
);

router.put(
  "/:id",
  authorize(ROLES.NHAN_VIEN_KY_THUAT, ROLES.QUAN_LY),
  validate(idParamSchema, "params"),
  validate(updateChiSoDienNuocSchema, "body"),
  meterReadingController.updateMeterReading
);

router.delete(
  "/:id",
  authorize(ROLES.NHAN_VIEN_KY_THUAT, ROLES.QUAN_LY),
  validate(idParamSchema, "params"),
  meterReadingController.deleteMeterReading
);

router.post(
  "/:id/confirm",
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  validate(idParamSchema, "params"),
  meterReadingController.confirmAndGenerateInvoice
);

// Trigger thủ công phát hành hóa đơn (dùng khi cần test hoặc xử lý bù)
router.post(
  "/admin/release-invoices",
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  meterReadingController.triggerInvoiceRelease
);

export default router;
