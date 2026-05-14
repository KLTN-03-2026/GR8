// server/src/modules/thanhvien/thanhvien.controller.js
import * as service from "./thanhvien.service.js";

export const getAllMembers = async (req, res, next) => {
  try {
    const data = await service.getAllMembers();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const getByCanHo = async (req, res, next) => {
  try {
    const data = await service.getByCanHo(req.params.canHoID);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const addMember = async (req, res, next) => {
  try {
    const data = await service.addMember(req.params.canHoID, req.body, req.user?.ID);
    res.status(201).json({ success: true, data, message: "Thêm thành viên thành công" });
  } catch (e) { next(e); }
};

export const updateMember = async (req, res, next) => {
  try {
    const data = await service.updateMember(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { next(e); }
};

export const checkOut = async (req, res, next) => {
  try {
    const data = await service.checkOut(req.params.id);
    res.json({ success: true, data, message: "Đã đánh dấu rời đi" });
  } catch (e) { next(e); }
};

export const deleteMember = async (req, res, next) => {
  try {
    await service.deleteMember(req.params.id);
    res.json({ success: true, message: "Đã xóa thành viên" });
  } catch (e) { next(e); }
};
