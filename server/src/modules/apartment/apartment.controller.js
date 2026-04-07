// server/src/modules/apartment/apartment.controller.js
import * as apartmentService from "./apartment.service.js";

export const getApartments = async (req, res) => {
  try {
    const filters = {
      ToaNhaID: req.query.ToaNhaID,
      TrangThai: req.query.TrangThai,
      minGia: req.query.minGia,
      maxGia: req.query.maxGia,
      search: req.query.search,
    };

    const apartments = await apartmentService.getAllApartments(filters);
    res.status(200).json({ success: true, data: apartments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApartmentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await apartmentService.getApartmentById(id);
    res.status(200).json({ success: true, data: apartment });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const createApartment = async (req, res) => {
  try {
    const result = await apartmentService.createApartment(req.body);
    res.status(201).json({ success: true, data: result, message: "Tạo căn hộ thành công" });
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};