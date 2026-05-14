import * as service from "./toanha.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllToaNha();
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getToaNhaById(req.params.id);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createToaNha(req.body);
    res.status(201).json({ success: true, data, message: "Tạo tòa nhà thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateToaNha(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteToaNha(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};
