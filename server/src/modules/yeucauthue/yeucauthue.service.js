import prisma from "../../config/prisma.js";

export const createRequest = async (userId, data) => {
    const { CanHoID, GhiChu } = data;

    const canHo = await prisma.canho.findUnique({ where: { ID: Number(CanHoID) } });
    if (!canHo) throw new Error("Căn hộ không tồn tại");
    if (canHo.TrangThai !== "Trong") throw new Error("Căn hộ không sẵn sàng cho thuê");

    const existing = await prisma.yeucauthue.findFirst({
        where: {
            NguoiYeuCauID: userId,
            CanHoID: Number(CanHoID),
            TrangThai: { in: ["ChoKiemTra", "ChoDuyet"] }
        }
    });
    if (existing) throw new Error("Bạn đã có yêu cầu thuê đang chờ xử lý cho căn hộ này");

    return await prisma.yeucauthue.create({
        data: { NguoiYeuCauID: userId, CanHoID: Number(CanHoID), GhiChu, TrangThai: "ChoKiemTra" }
    });
};

export const getAll = async () => {
    return await prisma.yeucauthue.findMany({
        include: {
            nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } },
            canho: { select: { ID: true, MaCanHo: true, SoPhong: true, GiaThue: true } }
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
        include: { canho: { select: { ID: true, MaCanHo: true, SoPhong: true, GiaThue: true } } },
        orderBy: { ID: "desc" }
    });
};

export const managerApprove = async (id, userId) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (record.TrangThai !== "ChoKiemTra") throw new Error("Yêu cầu không ở trạng thái chờ kiểm tra");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "ChoDuyet", QuanLyKiemTraID: userId }
    });
};

export const ownerApprove = async (id, userId) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (record.TrangThai !== "ChoDuyet") throw new Error("Yêu cầu chưa qua bước kiểm tra của quản lý");

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "DaDuyet", ChuNhaDuyetID: userId }
    });
};

export const rejectRequest = async (id, userId, role) => {
    const record = await prisma.yeucauthue.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu thuê không tồn tại");
    if (record.TrangThai === "DaDuyet") throw new Error("Không thể từ chối yêu cầu đã được duyệt");

    // Quản lý chỉ từ chối được khi đang ChoKiemTra, ChuNha từ chối khi ChoDuyet
    if (role === "QuanLy" && record.TrangThai !== "ChoKiemTra") {
        throw new Error("Quản lý chỉ có thể từ chối yêu cầu đang chờ kiểm tra");
    }
    if (role === "ChuNha" && record.TrangThai !== "ChoDuyet") {
        throw new Error("Chủ nhà chỉ có thể từ chối yêu cầu đang chờ duyệt");
    }

    return await prisma.yeucauthue.update({
        where: { ID: Number(id) },
        data: { TrangThai: "TuChoi" }
    });
};
