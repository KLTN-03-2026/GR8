import * as service from "./theguixe.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllTheGuiXe(req.query);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getMyThe = async (req, res) => {
  try {
    const data = await service.getTheGuiXeByUser(req.user.ID);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getTheGuiXeById(req.params.id);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createTheGuiXe(req.body);
    res.status(201).json({ success: true, data, message: "Cấp thẻ gửi xe thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateTheGuiXe(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteTheGuiXe(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};
