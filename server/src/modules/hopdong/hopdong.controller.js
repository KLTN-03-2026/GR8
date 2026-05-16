import * as service from "./hopdong.service.js";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";

export const create = async (req, res) => {
    try {
        const data = await service.createContract(req.body);
        res.status(201).json({ success: true, message: "Tạo hợp đồng thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const sign = async (req, res) => {
    try {
        const data = await service.signContract(req.params.id, req.user.ID);
        res.json({ success: true, message: "Ký hợp đồng thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const data = await service.getAll(req.query);
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

export const myContract = async (req, res) => {
    try {
        const data = await service.myContract(req.user.ID);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestTerminate = async (req, res) => {
    try {
        const data = await service.requestTerminate(req.params.id, req.user.ID, req.body.LyDo);
        res.json({ success: true, message: "Đã gửi yêu cầu kết thúc hợp đồng", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const terminate = async (req, res) => {
    try {
        const { MatKhau } = req.body;
        if (!MatKhau) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu xác nhận" });
        }

        // Kiểm tra mật khẩu của người đang thực hiện (req.user.ID)
        const user = await prisma.nguoidung.findUnique({ where: { ID: req.user.ID } });
        if (!user || !user.MatKhau) {
            return res.status(401).json({ success: false, message: "Không tìm thấy thông tin người dùng" });
        }

        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mật khẩu xác nhận không chính xác" });
        }

        const data = await service.terminateContract(req.params.id);
        res.json({ success: true, message: "Kết thúc hợp đồng thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getTerminateRequests = async (req, res) => {
    try {
        const data = await service.getAll({ yeuCauKetThuc: 'true' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetTerminate = async (req, res) => {
    try {
        const data = await service.resetTerminateRequest(req.params.id);
        res.json({ success: true, message: "Đã hủy yêu cầu kết thúc", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
