// server/src/modules/chisodiennuoc/chisodiennuoc.route.js
// Meter reading routes

import express from "express";
import * as meterReadingController from "./chisodiennuoc.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

/**
 * @route   GET /api/chisodiennuoc
 * @desc    Get all meter readings (with filters)
 * @access  Private (All authenticated users)
 */
router.get("/", authenticate, meterReadingController.getAllMeterReadings);

/**
 * @route   GET /api/chisodiennuoc/pending
 * @desc    Get pending meter readings (waiting for accountant approval)
 * @access  Private (KeToan only)
 */
router.get(
  "/pending",
  authenticate,
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  meterReadingController.getPendingMeterReadings
);

/**
 * @route   GET /api/chisodiennuoc/:id
 * @desc    Get meter reading by ID
 * @access  Private
 */
router.get("/:id", authenticate, meterReadingController.getMeterReadingById);

/**
 * @route   POST /api/chisodiennuoc
 * @desc    Create new meter reading (Technical staff)
 * @access  Private (NhanVienKyThuat, QuanLy)
 */
router.post(
  "/",
  authenticate,
  authorize(ROLES.NHAN_VIEN_KY_THUAT, ROLES.QUAN_LY),
  meterReadingController.createMeterReading
);

/**
 * @route   POST /api/chisodiennuoc/:id/confirm
 * @desc    Confirm meter reading and generate invoice (Accountant)
 * @access  Private (KeToan, QuanLy)
 */
router.post(
  "/:id/confirm",
  authenticate,
  authorize(ROLES.KE_TOAN, ROLES.QUAN_LY),
  meterReadingController.confirmAndGenerateInvoice
);

export default router;
