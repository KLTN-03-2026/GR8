import * as chisodiennuocService from "./chisodiennuoc.service.js";
import { returnResponse } from "../../utils/response.js";

export const createChiSoDienNuoc = async (req, res, next) => {
  try {
    const nguoiGhiId = req.user.id; // check lại field này
    const data = req.body;

    const result = await chisodiennuocService.createChiSoDienNuoc(data, nguoiGhiId);

    return returnResponse(res, result, "Tạo chỉ số điện nước thành công");
  } catch (error) {
    next(error);
  }
};

export const getAllChiSoDienNuoc = async (req, res, next) => {
  try {
    const { page, limit, CanHoID, ThangNam } = req.query;

    const filters = {};
    if (CanHoID) filters.CanHoID = CanHoID;
    if (ThangNam) filters.ThangNam = ThangNam;

    const pagination = { page, limit };

    const result = await chisodiennuocService.getAllChiSoDienNuoc(filters, pagination);

    return returnResponse(res, result, "Lấy danh sách chỉ số điện nước thành công");
  } catch (error) {
    next(error);
  }
};

export const getChiSoDienNuocById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const result = await chisodiennuocService.getChiSoDienNuocById(id);

    return returnResponse(res, result, "Lấy chi tiết chỉ số điện nước thành công");
  } catch (error) {
    next(error);
  }
};

export const updateChiSoDienNuoc = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const result = await chisodiennuocService.updateChiSoDienNuoc(id, data);

    return returnResponse(res, result, "Cập nhật chỉ số điện nước thành công");
  } catch (error) {
    next(error);
  }
};

export const deleteChiSoDienNuoc = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await chisodiennuocService.deleteChiSoDienNuoc(id);

    return returnResponse(res, { success: true }, "Xóa chỉ số điện nước thành công");
  } catch (error) {
    next(error);
  }
};