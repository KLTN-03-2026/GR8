// server/src/modules/activitylog/activitylog.controller.js

import * as service from "./activitylog.service.js";

export const getLogs = async (req, res) => {
  try {
    const data = await service.getLogs(req.query);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const data = await service.getStats();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const undoLog = async (req, res) => {
  try {
    const message = await service.undoLog(req.params.id, req.user.ID);
    res.json({ success: true, message });
  } catch (e) {
    res.status(e.statusCode || 400).json({ success: false, message: e.message });
  }
};
