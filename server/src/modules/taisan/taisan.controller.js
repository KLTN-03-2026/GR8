import * as service from "./taisan.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllTaiSan(req.query);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getTaiSanById(req.params.id);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createTaiSan(req.body);
    res.status(201).json({ success: true, data, message: "Thêm tài sản thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateTaiSan(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteTaiSan(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const thongKe = async (req, res) => {
  try {
    const data = await service.getThongKeTaiSan();
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};
