import * as service from "./hopdong.service.js";

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

export const myContract = async (req, res) => {
    try {
        const data = await service.myContract(req.user.ID);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const terminate = async (req, res) => {
    try {
        const data = await service.terminateContract(req.params.id);
        res.json({ success: true, message: "Kết thúc hợp đồng thành công", data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
