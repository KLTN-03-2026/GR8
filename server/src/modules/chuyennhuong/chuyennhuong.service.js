import prisma from "../../config/prisma.js";

export const createTransfer = async (userId, data) => {
    const { HopDongID, NguoiThueMoiID } = data;

    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(HopDongID) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (contract.NguoiThueID !== userId) throw new Error("Bạn không phải người thuê hiện tại");
    if (contract.TrangThai !== "DangThue") throw new Error("Chỉ có thể chuyển nhượng hợp đồng đang có hiệu lực");

    if (NguoiThueMoiID === userId) throw new Error("Không thể chuyển nhượng cho chính mình");

    const newTenant = await prisma.nguoidung.findUnique({ where: { ID: Number(NguoiThueMoiID) } });
    if (!newTenant) throw new Error("Người thuê mới không tồn tại");

    const existing = await prisma.chuyennhuong.findFirst({
        where: { HopDongID: Number(HopDongID), TrangThai: "ChoDuyet" }
    });
    if (existing) throw new Error("Đã có yêu cầu chuyển nhượng đang chờ xử lý cho hợp đồng này");

    return await prisma.chuyennhuong.create({
        data: {
            HopDongID: contract.ID,
            NguoiThueCuID: userId,
            NguoiThueMoiID: Number(NguoiThueMoiID),
            TrangThai: "ChoDuyet"
        }
    });
};

export const getAll = async () => {
    return await prisma.chuyennhuong.findMany({
        include: {
            hopdong_chuyennhuong_HopDongIDTohopdong: {
                select: { ID: true, CanHoID: true, NgayBatDau: true, NgayKetThuc: true }
            },
            nguoidung_chuyennhuong_NguoiThueCuIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } },
            nguoidung_chuyennhuong_NguoiThueMoiIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } }
        },
        orderBy: { ID: "desc" }
    });
};

export const getById = async (id) => {
    const record = await prisma.chuyennhuong.findUnique({
        where: { ID: Number(id) },
        include: {
            hopdong_chuyennhuong_HopDongIDTohopdong: true,
            nguoidung_chuyennhuong_NguoiThueCuIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } },
            nguoidung_chuyennhuong_NguoiThueMoiIDTonguoidung: { select: { ID: true, HoTen: true, Email: true } }
        }
    });
    if (!record) throw new Error("Yêu cầu chuyển nhượng không tồn tại");
    return record;
};

export const approveTransfer = async (id, userId) => {
    const request = await prisma.chuyennhuong.findUnique({
        where: { ID: Number(id) },
        include: { hopdong_chuyennhuong_HopDongIDTohopdong: true }
    });

    if (!request) throw new Error("Yêu cầu chuyển nhượng không tồn tại");
    if (request.TrangThai !== "ChoDuyet") throw new Error("Yêu cầu không ở trạng thái chờ duyệt");

    const oldContract = request.hopdong_chuyennhuong_HopDongIDTohopdong;

    return await prisma.$transaction(async (tx) => {
        // Cập nhật hợp đồng cũ
        await tx.hopdong.update({
            where: { ID: request.HopDongID },
            data: { TrangThai: "DaChuyenNhuong" }
        });

        const newContract = await tx.hopdong.create({
            data: {
                CanHoID: oldContract.CanHoID,
                NguoiThueID: request.NguoiThueMoiID,
                NgayBatDau: new Date(),
                NgayKetThuc: oldContract.NgayKetThuc,
                GiaThue: oldContract.GiaThue,
                TienCoc: oldContract.TienCoc,
                TrangThai: "DangThue",
                NgayKy: new Date()
            }
        });

        return await tx.chuyennhuong.update({
            where: { ID: Number(id) },
            data: { TrangThai: "DaDuyet", ChuNhaDuyetID: userId, NewHopDongID: newContract.ID }
        });
    });
};

export const rejectTransfer = async (id) => {
    const record = await prisma.chuyennhuong.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu chuyển nhượng không tồn tại");
    if (record.TrangThai !== "ChoDuyet") throw new Error("Yêu cầu không ở trạng thái chờ duyệt");

    return await prisma.chuyennhuong.update({
        where: { ID: Number(id) },
        data: { TrangThai: "TuChoi" }
    });
};
