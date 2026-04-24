import * as meterReadingService from "./chisodiennuoc.service.js";

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

export const confirmAndGenerateInvoice = async (req, res, next) => {
  try {
    const accountantId = req.user.ID || req.user.id;
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
