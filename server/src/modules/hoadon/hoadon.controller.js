// server/src/modules/hoadon/hoadon.controller.js
// Invoice management controller

import * as invoiceService from "./hoadon.service.js";
import { ROLES } from "../../constants/roles.js";

/**
 * BƯỚC 3: Người thuê xem danh sách hóa đơn của mình
 * GET /api/hoadon/my-invoices
 */
export const getMyInvoices = async (req, res, next) => {
  try {
    const tenantId = req.user.ID;
    const result = await invoiceService.getTenantInvoices(tenantId, req.query);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * BƯỚC 3: Xem chi tiết hóa đơn với QR code
 * GET /api/hoadon/:id
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.VaiTro;
    
    const invoice = await invoiceService.getInvoiceById(req.params.id, userId);

    // Check authorization
    const isOwner = invoice.hopdong.NguoiThueID === Number(userId);
    const isManagerOrAccountant = [ROLES.QUAN_LY, ROLES.KE_TOAN].includes(userRole);

    if (!isOwner && !isManagerOrAccountant) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem hóa đơn này",
      });
    }

    // Generate VietQR URL
    const qrUrl = invoiceService.generateVietQRUrl(invoice);

    res.json({
      success: true,
      data: {
        ...invoice,
        qrUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * BƯỚC 3: Người thuê đánh dấu đã thanh toán
 * POST /api/hoadon/:id/mark-paid
 */
export const markAsPaid = async (req, res, next) => {
  try {
    const tenantId = req.user.ID;
    const paymentData = {
      ...req.body,
      AnhMinhChung: req.file ? req.file.path : null,
    };
    
    const invoice = await invoiceService.markAsPaid(
      req.params.id,
      tenantId,
      paymentData
    );

    res.json({
      success: true,
      message: "Đã xác nhận thanh toán. Kế toán sẽ kiểm tra và xác nhận.",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices (Manager/Accountant)
 * GET /api/hoadon
 */
export const getAllInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.getAllInvoices(req.query);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overdue invoices grouped by apartment (Manager/Accountant)
 * GET /api/hoadon/overdue-grouped
 */
export const getOverdueGrouped = async (req, res, next) => {
  try {
    const data = await invoiceService.getOverdueGrouped();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Manager/Accountant confirm payment
 * POST /api/hoadon/:id/confirm-payment
 */
export const confirmPayment = async (req, res, next) => {
  try {
    const accountantId = req.user.ID;
    const invoiceId = req.params.id;
    const { PhuongThuc, GhiChu } = req.body;

    const result = await invoiceService.confirmPaymentByAccountant(
      invoiceId, 
      accountantId, 
      { PhuongThuc, GhiChu }
    );

    res.json({ 
      success: true, 
      message: 'Đã xác nhận thanh toán thành công',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};
