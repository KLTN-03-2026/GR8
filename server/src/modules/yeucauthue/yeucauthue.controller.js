import * as service from "./yeucauthue.service.js";

export const create = async (req, res) => {
    try {
        const data = await service.createRequest(req.user.ID, req.body);
        res.status(201).json({ success: true, message: "Gửi yêu cầu thuê thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

export const getMyRequests = async (req, res) => {
    try {
        const data = await service.getMyRequests(req.user.ID);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const managerApprove = async (req, res) => {
    try {
        const data = await service.managerApprove(req.params.id, req.user.ID);
        res.json({ success: true, message: "Đã duyệt yêu cầu thuê thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const reject = async (req, res) => {
    try {
        const data = await service.rejectRequest(req.params.id, req.user.ID, req.user.VaiTro);
        res.json({ success: true, message: "Đã từ chối yêu cầu thuê", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
