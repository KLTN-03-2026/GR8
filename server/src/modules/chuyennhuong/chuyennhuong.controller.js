import * as service from "./chuyennhuong.service.js";

export const create = async (req, res) => {
    try {
        const data = await service.createTransfer(req.user.ID, req.body);
        res.status(201).json({ success: true, message: "Gửi yêu cầu chuyển nhượng thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const status = req.query.TrangThai || req.query.status || null;
        const data = await service.getAll(status);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyTransfers = async (req, res) => {
    try {
        const data = await service.getMyTransfers(req.user.ID);
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

export const approve = async (req, res) => {
    try {
        const payload = {
            NgayHen: req.body.NgayHen,
            NoiDungHen: req.body.NoiDungHen,
        };
        const data = await service.approveTransfer(req.params.id, req.user.ID, payload);
        res.json({ success: true, message: "Đã đồng ý và lên lịch gặp mặt", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const reject = async (req, res) => {
    try {
        const data = await service.rejectTransfer(req.params.id, req.body.LyDoTuChoi);
        res.json({ success: true, message: "Đã từ chối yêu cầu chuyển nhượng", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
