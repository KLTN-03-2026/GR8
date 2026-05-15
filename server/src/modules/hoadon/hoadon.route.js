// server/src/modules/hoadon/hoadon.route.js
// Invoice routes

import express from "express";
import * as invoiceController from "./hoadon.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { uploadThanhToanPhoto } from "../../middleware/cloudinary-upload.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/hoadon/my-invoices
 * @desc    Get tenant's own invoices
 * @access  Private (NguoiThue, KhachVangLai)
 */
router.get(
  "/my-invoices",
  authenticate,
  authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI),
  invoiceController.getMyInvoices
);

/**
 * @route   GET /api/hoadon/overdue-grouped
 * @desc    Get overdue invoices grouped by apartment
 * @access  Private (QuanLy, KeToan)
 */
router.get(
  "/overdue-grouped",
  authenticate,
  authorize(ROLES.QUAN_LY, ROLES.KE_TOAN, ROLES.CHU_NHA),
  invoiceController.getOverdueGrouped
);

/**
 * @route   GET /api/hoadon
 * @desc    Get all invoices (Manager/Accountant)
 * @access  Private (QuanLy, KeToan)
 */
router.get(
  "/",
  authenticate,
  authorize(ROLES.QUAN_LY, ROLES.KE_TOAN, ROLES.CHU_NHA),
  invoiceController.getAllInvoices
);

/**
 * @route   GET /api/hoadon/:id
 * @desc    Get invoice detail with QR code
 * @access  Private (Owner or Manager/Accountant)
 */
router.get("/:id", authenticate, invoiceController.getInvoiceById);

/**
 * @route   POST /api/hoadon/:id/mark-paid
 * @desc    Tenant marks invoice as paid
 * @access  Private (NguoiThue, KhachVangLai)
 */
router.post(
  "/:id/mark-paid",
  authenticate,
  authorize(ROLES.NGUOI_THUE, ROLES.KHACH_VANG_LAI),
  uploadThanhToanPhoto.single("minhChung"),
  invoiceController.markAsPaid
);

/**
 * @route   POST /api/hoadon/:id/confirm-payment
 * @desc    Manager/Accountant confirms payment received
 * @access  Private (QuanLy, KeToan)
 */
router.post(
  "/:id/confirm-payment",
  authenticate,
  authorize(ROLES.QUAN_LY, ROLES.KE_TOAN),
  invoiceController.confirmPayment
);

export default router;
