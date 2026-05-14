import * as service from "./dichvu.service.js";

// ── Danh mục dịch vụ ─────────────────────────────────────────────────────────

export const getAll = async (req, res) => {
  try {
    // QuanLy thấy tất cả, người khác chỉ thấy Active
    const onlyActive = req.user?.VaiTro !== "QuanLy";
    const data = await service.getAllDichVu(onlyActive);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createDichVu(req.body);
    res.status(201).json({ success: true, data, message: "Thêm dịch vụ thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateDichVu(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteDichVu(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

// ── Yêu cầu dịch vụ ──────────────────────────────────────────────────────────

export const getAllYeuCau = async (req, res) => {
  try {
    const data = await service.getAllYeuCau(req.query);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getMyYeuCau = async (req, res) => {
  try {
    const data = await service.getMyYeuCau(req.user.ID || req.user.id);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createYeuCau = async (req, res) => {
  try {
    const data = await service.createYeuCau(req.user.ID || req.user.id, req.body);
    res.status(201).json({ success: true, data, message: "Đặt dịch vụ thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const duyetYeuCau = async (req, res) => {
  try {
    const data = await service.duyetYeuCau(req.params.id, req.body.TrangThai);
    res.json({ success: true, data, message: "Cập nhật trạng thái thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const deleteYeuCau = async (req, res) => {
  try {
    const data = await service.deleteYeuCau(req.params.id, req.user.ID || req.user.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};
