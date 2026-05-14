import prisma from "../../config/prisma.js";

// Các trường bắt buộc để hồ sơ được coi là hoàn chỉnh
const REQUIRED_PROFILE_FIELDS = [
    { field: "HoTen",          label: "Họ và tên" },
    { field: "SoDienThoai",    label: "Số điện thoại" },
    { field: "CCCD",           label: "Số CCCD/CMND" },
    { field: "NgayCapCCCD",    label: "Ngày cấp CCCD" },
    { field: "NoiCapCCCD",     label: "Nơi cấp CCCD" },
    { field: "NgaySinh",       label: "Ngày sinh" },
    { field: "DiaChi",         label: "Địa chỉ thường trú" },
    { field: "AnhCCCDMatTruoc", label: "Ảnh CCCD mặt trước" },
    { field: "AnhCCCDMatSau",   label: "Ảnh CCCD mặt sau" },
];

export const checkProfileComplete = async (userId) => {
    const user = await prisma.nguoidung.findUnique({
        where: { ID: userId },
        select: {
            HoTen: true, SoDienThoai: true, CCCD: true,
            NgayCapCCCD: true, NoiCapCCCD: true, NgaySinh: true,
            DiaChi: true, AnhCCCDMatTruoc: true, AnhCCCDMatSau: true,
        },
    });
    if (!user) throw new Error("Người dùng không tồn tại");

    const missing = REQUIRED_PROFILE_FIELDS
        .filter(({ field }) => !user[field])
        .map(({ label }) => label);

    return { complete: missing.length === 0, missing };
};

export const createRequest = async (userId, data) => {
    const { CanHoID, GhiChu } = data;

    // Kiểm tra hồ sơ hoàn chỉnh
    const { complete, missing } = await checkProfileComplete(userId);
    if (!complete) {
        throw new Error(
            `Hồ sơ chưa hoàn chỉnh. Vui lòng bổ sung: ${missing.join(", ")}`
        );
    }

    const canHo = await prisma.canho.findUnique({ where: { ID: Number(CanHoID) } });
    if (!canHo) throw new Error("Căn hộ không tồn tại");
    if (canHo.TrangThai !== "Trong") throw new Error("Căn hộ không sẵn sàng cho thuê");

    const existing = await prisma.yeucauthue.findFirst({
        where: {
            NguoiYeuCauID: userId,
            CanHoID: Number(CanHoID),
            TrangThai: { in: ["ChoKiemTra", "DatLich"] }
        }
    });
    if (existing) throw new Error("Bạn đã có yêu cầu thuê đang chờ xử lý cho căn hộ này");

    return await prisma.yeucauthue.create({
        data: { NguoiYeuCauID: userId, CanHoID: Number(CanHoID), GhiChu, TrangThai: "ChoKiemTra" }
    });
};

export const getAll = async (filters = {}) => {
    const where = {};

    if (filters.TrangThai) {
        where.TrangThai = filters.TrangThai;
    }

    // Lọc những yêu cầu chưa có hợp đồng
    if (filters.chuaCoHopDong === 'true' || filters.chuaCoHopDong === true) {
        where.hopdong = { none: {} };
    }

    return await prisma.yeucauthue.findMany({
        where,
        include: {
            nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } },
            canho: { select: { ID: true, MaCanHo: true, SoPhong: true, GiaThue: true, TienCoc: true, Tang: true, DienTich: true } }
        },
        orderBy: { ID: "desc" }
    });
};

export const getById = async (id) => {
    const record = await prisma.yeucauthue.findUnique({
        where: { ID: Number(id) },
        include: {
            nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung: { select: { ID: true, HoTen: true, Email: true, SoDienThoai: true } },
            canho: true
        }
    });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    return record;
};

export const getMyRequests = async (userId) => {
    return await prisma.yeucauthue.findMany({
        where: { NguoiYeuCauID: userId },
        include: {
            canho: { select: { ID: true, MaCanHo: true, SoPhong: true, GiaThue: true, Tang: true, DienTich: true } },
            hopdong: {
                where: { is_deleted: 0 },
                select: {
                    ID: true,
                    TrangThai: true,
                    NgayBatDau: true,
                    NgayKetThuc: true,
                    NgayKy: true,
                    GiaThue: true,
                    TienCoc: true,
                    TienCocDaNhan: true,
                    GhiChu: true,
                },
                orderBy: { ID: 'desc' },
                take: 1,
            }
        },
        orderBy: { ID: "desc" }
    });
};

export const managerApprove = async (id, userId) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (!["ChoKiemTra", "DatLich"].includes(record.TrangThai))
        throw new Error("Yêu cầu không ở trạng thái có thể duyệt");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "DaDuyet", QuanLyKiemTraID: userId }
    });
};

export const scheduleViewing = async (id, userId, NgayXemDuKien) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (record.TrangThai !== "ChoKiemTra")
        throw new Error("Chỉ có thể đặt lịch cho yêu cầu đang chờ kiểm tra");
    if (!NgayXemDuKien) throw new Error("Vui lòng chọn ngày giờ xem căn hộ");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: {
            TrangThai: "DatLich",
            NgayXemDuKien: new Date(NgayXemDuKien),
            QuanLyKiemTraID: userId,
        }
    });
};

export const rejectRequest = async (id, userId, role) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (record.TrangThai === "DaDuyet") throw new Error("Không thể từ chối yêu cầu đã được duyệt");
    if (!["ChoKiemTra", "DatLich"].includes(record.TrangThai))
        throw new Error("Không thể từ chối yêu cầu ở trạng thái này");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "TuChoi" }
    });
};

export const cancelRequest = async (id, userId) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");

    // Chỉ chủ yêu cầu mới được hủy
    if (record.NguoiYeuCauID !== userId)
        throw new Error("Bạn không có quyền hủy yêu cầu này");

    // Chỉ hủy được khi đang chờ duyệt hoặc đã đặt lịch
    if (!["ChoKiemTra", "DatLich"].includes(record.TrangThai))
        throw new Error("Không thể hủy yêu cầu ở trạng thái này");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "TuChoi" }
    });
};
