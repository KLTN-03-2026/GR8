import * as service from "./user.service.js";
import { userIdParamSchema } from "./user.validation.js";

export const getUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const data = await service.getAllUsers({ page, limit, search: req.query.search, roles: req.query.roles });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const data = await service.getUserById(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const data = await service.updateUserById(id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const softDeleteUserById = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const data = await service.softDeleteUserById(id);
    return res.status(200).json({
      success: true,
      message: "Xóa mềm người dùng thành công",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const data = await service.getCurrentUser(req.user.ID);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const data = await service.updateCurrentUser(req.user.ID, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const data = await service.getAllRoles();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const uploadMyAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    // Sử dụng Cloudinary URL từ req.file.path
    const avatarUrl = req.file.path;
    const data = await service.updateCurrentUser(req.user.ID, { Avatar: avatarUrl });
    return res.status(200).json({ success: true, data, avatarUrl });
  } catch (error) {
    return next(error);
  }
};

export const uploadMyCCCD = async (req, res, next) => {
  try {
    const updateData = {};

    if (req.files?.matTruoc?.[0]) {
      updateData.AnhCCCDMatTruoc = req.files.matTruoc[0].path;
    }
    if (req.files?.matSau?.[0]) {
      updateData.AnhCCCDMatSau = req.files.matSau[0].path;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ít nhất một ảnh CCCD" });
    }

    const data = await service.updateCurrentUser(req.user.ID, updateData);
    return res.status(200).json({
      success: true,
      data,
      AnhCCCDMatTruoc: updateData.AnhCCCDMatTruoc || null,
      AnhCCCDMatSau: updateData.AnhCCCDMatSau || null,
    });
  } catch (error) {
    return next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const data = await service.createStaff(req.body);
    return res.status(201).json({ success: true, message: "Tạo tài khoản nhân sự thành công", data });
  } catch (error) {
    return next(error);
  }
};