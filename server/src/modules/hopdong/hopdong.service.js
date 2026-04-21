import prisma from "../../config/prisma.js";

export const createContract = async (data) => {
    const { YeuCauThueID, NgayBatDau, NgayKetThuc } = data;

    const request = await prisma.yeucauthue.findUnique({
        where: { ID: Number(YeuCauThueID) },
        include: { canho: true }
    });

    if (!request) throw new Error("Yêu cầu thuê không tồn tại");
    if (request.TrangThai !== "DaDuyet") throw new Error("Yêu cầu thuê chưa được duyệt");

    const existed = await prisma.hopdong.findFirst({ where: { YeuCauThueID: request.ID } });
    if (existed) throw new Error("Hợp đồng cho yêu cầu này đã được tạo");

    if (new Date(NgayBatDau) >= new Date(NgayKetThuc)) {
        throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
    }

    return await prisma.hopdong.create({
        data: {
            YeuCauThueID: request.ID,
            CanHoID: request.CanHoID,
            NguoiThueID: request.NguoiYeuCauID,
            NgayBatDau: new Date(NgayBatDau),
            NgayKetThuc: new Date(NgayKetThuc),
            GiaThue: request.canho.GiaThue,
            TienCoc: request.canho.TienCoc,
            TrangThai: "ChoKy"
        }
    });
};

export const signContract = async (id, userId) => {
    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(id) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (contract.TrangThai !== "ChoKy") throw new Error("Hợp đồng không ở trạng thái chờ ký");

    if (contract.NguoiThueID !== userId) throw new Error("Bạn không phải người thuê trong hợp đồng này");

    return await prisma.$transaction(async (tx) => {
        const updated = await tx.hopdong.update({
            where: { ID: Number(id) },
            data: { TrangThai: "DangThue", NgayKy: new Date() }
        });

        await tx.canho.update({
            where: { ID: contract.CanHoID },
            data: { TrangThai: "DaThue" }
        });

        return updated;
    });
};

export const getAll = async () => {
    return await prisma.hopdong.findMany({
        where: { is_deleted: 0 },
        include: {
            canho: { select: { ID: true, MaCanHo: true, SoPhong: true } },
            nguoidung: { select: { ID: true, HoTen: true, Email: true, SoDienThoai: true } }
        },
        orderBy: { ID: "desc" }
    });
};

export const getById = async (id) => {
    const contract = await prisma.hopdong.findUnique({
        where: { ID: Number(id) },
        include: {
            canho: true,
            nguoidung: { select: { ID: true, HoTen: true, Email: true, SoDienThoai: true } },
            yeucauthue: true,
            hoadon: { orderBy: { ID: "desc" } }
        }
    });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    return contract;
};

export const myContract = async (userId) => {
    return await prisma.hopdong.findMany({
        where: { NguoiThueID: userId, is_deleted: 0 },
        include: { canho: true },
        orderBy: { ID: "desc" }
    });
};

export const terminateContract = async (id) => {
    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(id) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (!["DangThue", "ChoKy"].includes(contract.TrangThai)) {
        throw new Error("Không thể kết thúc hợp đồng ở trạng thái hiện tại");
    }

    return await prisma.$transaction(async (tx) => {
        const updated = await tx.hopdong.update({
            where: { ID: Number(id) },
            data: { TrangThai: "KetThuc" }
        });

        await tx.canho.update({
            where: { ID: contract.CanHoID },
            data: { TrangThai: "Trong" }
        });

        return updated;
    });
};
