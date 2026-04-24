import * as service from "./tienich.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllTienIch();
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createTienIch(req.body);
    res.status(201).json({ success: true, data, message: "Thêm tiện ích thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateTienIch(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteTienIch(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const ganTienIch = async (req, res) => {
  try {
    const data = await service.ganTienIchChoCanHo(req.params.canhoId, req.body.TienIchID);
    res.status(201).json({ success: true, data, message: "Gán tiện ích thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const goTienIch = async (req, res) => {
  try {
    const data = await service.goTienIchKhoiCanHo(req.params.canhoId, req.params.tienichId);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};
