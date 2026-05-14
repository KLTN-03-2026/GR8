import * as meterReadingService from "./chisodiennuoc.service.js";
import path from "path";

export const createMeterReading = async (req, res, next) => {
  try {
    const technicianId = req.user.ID || req.user.id;
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

export const getMeterReadingById = async (req, res, next) => {
  try {
    const result = await meterReadingService.getMeterReadingById(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeterReading = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await meterReadingService.updateMeterReading(id, req.body);

    res.json({
      success: true,
      message: "Cập nhật chỉ số điện nước thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeterReading = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await meterReadingService.deleteMeterReading(id);

    res.json({
      success: true,
      message: "Xóa chỉ số điện nước thành công"
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMeterPhoto = async (req, res, next) => {
  try {
    // req.files: { AnhDongHoDien?: [file], AnhDongHoNuoc?: [file] }
    const dienFile = req.files?.AnhDongHoDien?.[0];
    const nuocFile = req.files?.AnhDongHoNuoc?.[0];

    if (!dienFile && !nuocFile) {
      const err = new Error("Vui lòng chọn ít nhất một ảnh đồng hồ");
      err.statusCode = 400;
      throw err;
    }

    const result = {};
    // Sử dụng Cloudinary URLs từ req.file.path
    if (dienFile) result.AnhDongHoDien = dienFile.path;
    if (nuocFile) result.AnhDongHoNuoc = nuocFile.path;

    return res.status(200).json({
      success: true,
      message: "Upload ảnh đồng hồ thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrevChiSo = async (req, res, next) => {
  try {
    const { CanHoID, ThangNam } = req.query;
    if (!CanHoID || !ThangNam) {
      return res.status(400).json({ success: false, message: "Thiếu CanHoID hoặc ThangNam" });
    }
    const [year, month] = ThangNam.split("-");
    const thangNamDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const result = await meterReadingService.getPreviousChiSo(Number(CanHoID), thangNamDate);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const confirmAndGenerateInvoice = async (req, res, next) => {
  try {
    const accountantId = req.user.ID || req.user.id;
    const result = await meterReadingService.approveReading(
      req.params.id,
      req.body,
      accountantId
    );

    const msg = result.issued
      ? "Xác nhận chỉ số và phát hành hóa đơn thành công"
      : result.message;

    res.json({ success: true, message: msg, data: result });
  } catch (error) {
    next(error);
  }
};

export const triggerInvoiceRelease = async (req, res, next) => {
  try {
    const results = await meterReadingService.runDailyInvoiceRelease();
    const ok  = results.filter(r => r.success).length;
    const err = results.filter(r => !r.success).length;
    res.json({
      success: true,
      message: `Phát hành ${ok} hóa đơn thành công, ${err} lỗi`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
