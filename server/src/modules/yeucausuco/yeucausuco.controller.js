import * as service from "./yeucausuco.service.js";

export const getAllIncidents = async (req, res, next) => {
  try {
    const data = await service.getAllIncidents(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyIncidents = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    const data = await service.getMyIncidents(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createIncident = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    // Sử dụng Cloudinary URLs
    const imagePaths = Array.isArray(req.files)
      ? req.files.map((file) => file.path)
      : [];
    const payload = { ...req.body, HinhAnh: imagePaths };
    const data = await service.createIncident(userId, payload);
    res.status(201).json({ success: true, data, message: "Gửi yêu cầu xử lý sự cố thành công" });
  } catch (error) {
    next(error);
  }
};

export const updateIncidentStatus = async (req, res, next) => {
  try {
    const staffId = req.user.ID || req.user.id;
    const data = await service.updateIncidentStatus(req.params.id, req.body.TrangThai, staffId);
    res.json({ success: true, data, message: "Cập nhật trạng thái sự cố thành công" });
  } catch (error) {
    next(error);
  }
};

export const deleteIncident = async (req, res, next) => {
  try {
    await service.deleteIncident(req.params.id);
    res.json({ success: true, message: "Xóa sự cố thành công" });
  } catch (error) {
    next(error);
  }
};

// Quản lý phân công kỹ thuật viên thủ công
export const assignStaff = async (req, res, next) => {
  try {
    const managerId = req.user.ID || req.user.id;
    const data = await service.assignStaff(req.params.id, req.body, managerId);
    res.json({ success: true, data, message: "Phân công kỹ thuật viên thành công" });
  } catch (error) {
    next(error);
  }
};

// Phân công tự động
export const autoAssignStaff = async (req, res, next) => {
  try {
    const managerId = req.user.ID || req.user.id;
    const data = await service.autoAssignStaff(req.params.id, managerId);
    res.json({ success: true, data, message: "Phân công tự động thành công" });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách kỹ thuật viên
export const getAvailableStaff = async (req, res, next) => {
  try {
    const data = await service.getAvailableStaff();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Kỹ thuật viên hoàn thành công việc và upload hình
export const completeIncident = async (req, res, next) => {
  try {
    const staffId = req.user.ID || req.user.id;
    
    // Xử lý upload hình hoàn thành - sử dụng Cloudinary URLs
    const completionImages = Array.isArray(req.files)
      ? req.files.map((file) => file.path)
      : [];
    
    const payload = { 
      ...req.body, 
      HinhAnhHoanThanh: completionImages.length > 0 ? completionImages : req.body.HinhAnhHoanThanh 
    };
    
    const data = await service.completeIncident(req.params.id, payload, staffId);
    res.json({ success: true, data, message: "Hoàn thành xử lý sự cố thành công" });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách công việc của kỹ thuật viên
export const getStaffIncidents = async (req, res, next) => {
  try {
    const staffId = req.user.ID || req.user.id;
    const data = await service.getStaffIncidents(staffId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết sự cố
export const getIncidentById = async (req, res, next) => {
  try {
    const data = await service.getIncidentById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
