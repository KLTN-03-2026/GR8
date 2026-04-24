// server/src/modules/hoadon/hoadon.route.js
// Invoice routes

import express from "express";
import * as invoiceController from "./hoadon.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

/**
 * @route   GET /api/hoadon/my-invoices
 * @desc    Get tenant's own invoices
 * @access  Private (NguoiThue)
 */
router.get(
  "/my-invoices",
  authenticate,
  authorize(ROLES.NGUOI_THUE),
  invoiceController.getMyInvoices
);

/**
 * @route   GET /api/hoadon
 * @desc    Get all invoices (Manager/Accountant)
 * @access  Private (QuanLy, KeToan)
 */
router.get(
  "/",
  authenticate,
  authorize(ROLES.QUAN_LY, ROLES.KE_TOAN),
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
 * @access  Private (NguoiThue)
 */
router.post(
  "/:id/mark-paid",
  authenticate,
  authorize(ROLES.NGUOI_THUE),
  invoiceController.markAsPaid
);

export default router;
