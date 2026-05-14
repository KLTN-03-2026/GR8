import prisma from "../../config/prisma.js";

export const createContract = async (data) => {
    const {
        YeuCauThueID, NgayBatDau, NgayKetThuc,
        GiaThue: giaThueOverride,
        TienCoc: tienCocOverride,
        TienCocDaNhan,
        GhiChu,
    } = data;

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

    const giaThue = giaThueOverride != null ? Number(giaThueOverride) : Number(request.canho.GiaThue);
    const tienCoc = tienCocOverride != null ? Number(tienCocOverride) : Number(request.canho.TienCoc);

    return await prisma.hopdong.create({
        data: {
            YeuCauThueID: request.ID,
            CanHoID: request.CanHoID,
            NguoiThueID: request.NguoiYeuCauID,
            NgayBatDau: new Date(NgayBatDau),
            NgayKetThuc: new Date(NgayKetThuc),
            GiaThue: giaThue,
            TienCoc: tienCoc,
            TienCocDaNhan: TienCocDaNhan != null ? Number(TienCocDaNhan) : 0,
            GhiChu: GhiChu || null,
            TrangThai: "ChoKy"
        },
        include: {
            canho: { select: { MaCanHo: true, SoPhong: true } },
            nguoidung: { select: { HoTen: true, Email: true, DaKhaiBaoNgoaiTru: true } }
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

        // Nếu user đang là KhachVangLai → upgrade lên NguoiThue
        const nguoiThueRole = await tx.roles.findFirst({ where: { TenVaiTro: "NguoiThue" } });
        if (nguoiThueRole) {
            const user = await tx.nguoidung.findUnique({
                where: { ID: userId },
                select: { roles: { select: { TenVaiTro: true } } }
            });
            if (user?.roles?.TenVaiTro === "KhachVangLai") {
                await tx.nguoidung.update({
                    where: { ID: userId },
                    data: { RoleID: nguoiThueRole.ID }
                });
            }
        }

        return updated;
    });
};

export const getAll = async (filters = {}) => {
    const { canHoID, trangThai, yeuCauKetThuc } = filters;
    
    const where = { is_deleted: 0 };
    
    if (canHoID) {
        where.CanHoID = Number(canHoID);
    }
    
    if (trangThai) {
        where.TrangThai = trangThai;
    }

    if (yeuCauKetThuc === 'true' || yeuCauKetThuc === true) {
        where.YeuCauKetThuc = true;
    }
    
    return await prisma.hopdong.findMany({
        where,
        include: {
            canho: { select: { ID: true, MaCanHo: true, SoPhong: true } },
            nguoidung: { select: { ID: true, HoTen: true, Email: true, SoDienThoai: true, DaKhaiBaoNgoaiTru: true } }
        },
        orderBy: { ID: "desc" }
    });
};

export const getById = async (id) => {
    const contract = await prisma.hopdong.findUnique({
        where: { ID: Number(id) },
        include: {
            canho: {
                include: {
                    toanha: true,
                    nguoidung: { // Chủ nhà (bên A)
                        select: {
                            ID: true, HoTen: true, Email: true,
                            SoDienThoai: true, DiaChi: true,
                            NgaySinh: true, CCCD: true, SoGiayTo: true,
                            NgayCapCCCD: true, NoiCapCCCD: true,
                        }
                    }
                }
            },
            nguoidung: { // Người thuê (bên B)
                select: {
                    ID: true, HoTen: true, Email: true,
                    SoDienThoai: true, DiaChi: true,
                    NgaySinh: true, CCCD: true, SoGiayTo: true,
                    NgayCapCCCD: true, NoiCapCCCD: true,
                    DaKhaiBaoNgoaiTru: true,
                }
            },
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
        include: {
            canho: { include: { toanha: true } },
            nguoidung: {
                select: {
                    ID: true, HoTen: true, Email: true,
                    SoDienThoai: true, DiaChi: true,
                    NgaySinh: true, CCCD: true, SoGiayTo: true,
                    GioiTinh: true,
                }
            }
        },
        orderBy: { ID: "desc" }
    });
};

export const requestTerminate = async (id, userId, lyDo) => {
    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(id) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (contract.NguoiThueID !== userId) throw new Error("Bạn không phải người thuê trong hợp đồng này");
    if (!["DangThue", "HetHan"].includes(contract.TrangThai)) {
        throw new Error("Chỉ có thể yêu cầu kết thúc hợp đồng đang thuê hoặc đã hết hạn");
    }
    if (contract.YeuCauKetThuc) {
        throw new Error("Bạn đã gửi yêu cầu kết thúc hợp đồng này rồi");
    }

    return await prisma.hopdong.update({
        where: { ID: Number(id) },
        data: {
            YeuCauKetThuc: true,
            LyDoKetThuc: lyDo || "Người thuê yêu cầu kết thúc hợp đồng",
            NgayYeuCauKetThuc: new Date(),
        }
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

        await tx.thanh_vien_canho.updateMany({
            where: { CanHoID: contract.CanHoID, TrangThai: "DangO" },
            data: { TrangThai: "DaRoi", NgayRoi: new Date() }
        });

        return updated;
    });
};

export const resetTerminateRequest = async (id) => {
    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(id) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (!contract.YeuCauKetThuc) throw new Error("Hợp đồng này không có yêu cầu kết thúc");

    return await prisma.hopdong.update({
        where: { ID: Number(id) },
        data: {
            YeuCauKetThuc: false,
            LyDoKetThuc: null,
            NgayYeuCauKetThuc: null,
        }
    });
};
