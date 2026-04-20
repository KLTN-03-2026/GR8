import * as service from "./user.service.js";
import { userIdParamSchema } from "./user.validation.js";

export const getUsers = async (req, res, next) => {
  try {
    const data = await service.getAllUsers(req.query);
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