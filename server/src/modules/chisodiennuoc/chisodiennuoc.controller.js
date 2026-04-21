// server/src/modules/chisodiennuoc/chisodiennuoc.controller.js
// Meter reading controller

import * as meterReadingService from "./chisodiennuoc.service.js";

/**
 * BƯỚC 1: Nhân viên kỹ thuật tạo chỉ số mới
 * POST /api/chisodiennuoc
 */
export const createMeterReading = async (req, res, next) => {
  try {
    const technicianId = req.user.ID;
    const reading = await meterReadingService.createMeterReading(req.body, technicianId);

    res.status(201).json({
      success: true,
      message: "Ghi chỉ số thành công, chờ kế toán duyệt",
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * BƯỚC 2: Kế toán xem danh sách chỉ số chờ duyệt
 * GET /api/chisodiennuoc/pending
 */
export const getPendingMeterReadings = async (req, res, next) => {
  try {
    const result = await meterReadingService.getPendingMeterReadings(req.query);

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
 * BƯỚC 2: Kế toán xác nhận và phát hành hóa đơn
 * POST /api/chisodiennuoc/:id/confirm
 */
export const confirmAndGenerateInvoice = async (req, res, next) => {
  try {
    const accountantId = req.user.ID;
    const result = await meterReadingService.confirmAndGenerateInvoice(
      req.params.id,
      req.body,
      accountantId
    );

    res.json({
      success: true,
      message: "Xác nhận chỉ số và phát hành hóa đơn thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get meter reading by ID
 * GET /api/chisodiennuoc/:id
 */
export const getMeterReadingById = async (req, res, next) => {
  try {
    const reading = await meterReadingService.getMeterReadingById(req.params.id);

    res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all meter readings with filters
 * GET /api/chisodiennuoc
 */
export const getAllMeterReadings = async (req, res, next) => {
  try {
    const result = await meterReadingService.getAllMeterReadings(req.query);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
