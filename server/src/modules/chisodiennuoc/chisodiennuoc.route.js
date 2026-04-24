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

const router = express.Router();

// ==================== MIDDLEWARE ====================
router.use(authenticate);

// ==================== ROUTES ====================

// READ
router.get("/", validate(queryFilterSchema, "query"), meterReadingController.getAllMeterReadings);

router.get(
  "/pending",
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  meterReadingController.getPendingMeterReadings
);

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

export default router;
