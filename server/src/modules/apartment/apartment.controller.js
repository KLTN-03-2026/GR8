// server/src/modules/apartment/apartment.controller.js
import * as apartmentService from "./apartment.service.js";
import { apartmentIdParamSchema } from "./apartment.validation.js";

export const getApartments = async (req, res, next) => {
  try {
    const apartments = await apartmentService.getAllApartments(req.query);
    return res.status(200).json({ success: true, data: apartments });
  } catch (error) {
    return next(error);
  }
};

export const getApartmentDetail = async (req, res, next) => {
  try {
    const { id } = apartmentIdParamSchema.parse(req.params);
    const apartment = await apartmentService.getApartmentById(id);
    return res.status(200).json({ success: true, data: apartment });
  } catch (error) {
    return next(error);
  }
};

export const createApartment = async (req, res, next) => {
  try {
    const result = await apartmentService.createApartment(req.body, req.user.ID);
    return res.status(201).json({ success: true, data: result, message: "Tạo căn hộ thành công" });
  } catch (error) {
    return next(error);
  }
};

export const updateApartment = async (req, res, next) => {
  try {
    const { id } = apartmentIdParamSchema.parse(req.params);
    const result = await apartmentService.updateApartmentById(id, req.body, req.user);
    return res.status(200).json({ success: true, data: result, message: "Cập nhật căn hộ thành công" });
  } catch (error) {
    return next(error);
  }
};

export const softDeleteApartment = async (req, res, next) => {
  try {
    const { id } = apartmentIdParamSchema.parse(req.params);
    const result = await apartmentService.softDeleteApartmentById(id, req.user);
    return res.status(200).json({ success: true, data: result, message: "Xóa mềm căn hộ thành công" });
  } catch (error) {
    return next(error);
  }
};