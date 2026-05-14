// server/src/modules/apartment/apartment.controller.js
import * as apartmentService from "./apartment.service.js";
import { apartmentIdParamSchema, apartmentPhotoParamsSchema } from "./apartment.validation.js";

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

export const bulkCreateRooms = async (req, res, next) => {
  try {
    const result = await apartmentService.bulkCreateRooms(req.body, req.user.ID);
    return res.status(201).json({ success: true, data: result, message: `Đã tạo ${result.created} phòng` });
  } catch (error) {
    return next(error);
  }
};

export const uploadApartmentPhoto = async (req, res, next) => {
  try {
    const { id } = apartmentIdParamSchema.parse(req.params);
    const files = req.files;
    if (!Array.isArray(files) || files.length === 0) {
      const err = new Error("Vui lòng chọn ít nhất một file ảnh");
      err.statusCode = 400;
      throw err;
    }
    // Sử dụng Cloudinary URLs từ req.file.path
    const cloudinaryUrls = files.map((f) => f.path);
    const featuredIndex = req.body?.featuredIndex;
    const result = await apartmentService.appendApartmentPhotosFromUpload(
      id,
      cloudinaryUrls,
      req.user,
      featuredIndex
    );
    return res
      .status(200)
      .json({ success: true, data: result, message: `Đã thêm ${files.length} ảnh` });
  } catch (error) {
    return next(error);
  }
};

export const clearApartmentPhoto = async (req, res, next) => {
  try {
    const { id } = apartmentIdParamSchema.parse(req.params);
    const result = await apartmentService.clearApartmentImages(id, req.user);
    return res.status(200).json({ success: true, data: result, message: "Đã xóa ảnh căn hộ" });
  } catch (error) {
    return next(error);
  }
};

export const deleteApartmentPhotoItem = async (req, res, next) => {
  try {
    const { id, mediaId } = apartmentPhotoParamsSchema.parse(req.params);
    const result = await apartmentService.deleteApartmentImageByMediaId(id, mediaId, req.user);
    return res.status(200).json({ success: true, data: result, message: "Đã xóa ảnh" });
  } catch (error) {
    return next(error);
  }
};

export const setApartmentFeaturedPhoto = async (req, res, next) => {
  try {
    const { id, mediaId } = apartmentPhotoParamsSchema.parse(req.params);
    const result = await apartmentService.setApartmentFeaturedImage(id, mediaId, req.user);
    return res.status(200).json({ success: true, data: result, message: "Đã đặt ảnh nổi bật" });
  } catch (error) {
    return next(error);
  }
};
