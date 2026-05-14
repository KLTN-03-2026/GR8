import prisma from "../../config/prisma.js";

export const createTransfer = async (userId, data) => {
    const { HopDongID, LyDo, ThongTinNguoiChuyenVao, GhiChu, NguoiThueMoiID } = data;

    const contract = await prisma.hopdong.findUnique({ where: { ID: Number(HopDongID) } });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    if (contract.NguoiThueID !== userId) throw new Error("Bạn không phải người thuê hiện tại");
    if (contract.TrangThai !== "DangThue") throw new Error("Chỉ có thể chuyển nhượng hợp đồng đang có hiệu lực");

    if (!LyDo?.trim()) throw new Error("Phải nhập lý do chuyển nhượng");
    if (!ThongTinNguoiChuyenVao?.trim()) throw new Error("Phải nhập thông tin người chuyển vào");

    let newTenantId = null;
    if (NguoiThueMoiID) {
        if (Number(NguoiThueMoiID) === userId) throw new Error("Không thể chuyển nhượng cho chính mình");
        const newTenant = await prisma.nguoidung.findUnique({ where: { ID: Number(NguoiThueMoiID) } });
        if (!newTenant) throw new Error("Người thuê mới không tồn tại");
        newTenantId = Number(NguoiThueMoiID);
    }

    const existing = await prisma.chuyennhuong.findFirst({
        where: { HopDongID: Number(HopDongID), TrangThai: "ChoDuyet" }
    });
    if (existing) throw new Error("Đã có yêu cầu chuyển nhượng đang chờ xử lý cho hợp đồng này");

    // Dùng $queryRawUnsafe để bypass Prisma ambiguous relation issue
    await prisma.$queryRawUnsafe(
        `INSERT INTO chuyennhuong 
            (HopDongID, NguoiThueCuID, NguoiThueMoiID, LyDo, ThongTinNguoiChuyenVao, GhiChu, TrangThai, NgayYeuCau)
         VALUES (?, ?, ?, ?, ?, ?, 'ChoDuyet', NOW())`,
        contract.ID,
        userId,
        newTenantId,
        LyDo.trim(),
        ThongTinNguoiChuyenVao.trim(),
        GhiChu?.trim() || null
    );

    // Lấy bản ghi vừa tạo
    const created = await prisma.chuyennhuong.findFirst({
        where: {
            HopDongID: contract.ID,
            NguoiThueCuID: userId,
            TrangThai: "ChoDuyet"
        },
        orderBy: { NgayYeuCau: 'desc' }
    });

    return created;
};

export const getMyTransfers = async (userId) => {
    return await prisma.chuyennhuong.findMany({
        where: { NguoiThueCuID: Number(userId) },
        include: {
            hopdong_chuyennhuong_HopDongIDTohopdong: {
                select: { ID: true, CanHoID: true, NgayBatDau: true, NgayKetThuc: true }
            },
            nguoidung_chuyennhuong_NguoiThueMoiIDTonguoidung: {
                select: { ID: true, HoTen: true, Email: true }
            }
        },
        orderBy: { ID: "desc" }
    });
};

export const getAll = async (status = null) => {
    const where = status ? { TrangThai: status } : undefined;
    return await prisma.chuyennhuong.findMany({
        where,
        include: {
            hopdong_chuyennhuong_HopDongIDTohopdong: {
                select: {
                    ID: true,
                    CanHoID: true,
                    NgayBatDau: true,
                    NgayKetThuc: true,
                    canho: { select: { MaCanHo: true } }
                }
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

export const approveTransfer = async (id, userId, meetingInfo) => {
    const request = await prisma.chuyennhuong.findUnique({
        where: { ID: Number(id) }
    });

    if (!request) throw new Error("Yêu cầu chuyển nhượng không tồn tại");
    if (request.TrangThai !== "ChoDuyet") throw new Error("Yêu cầu không ở trạng thái chờ duyệt");

    const { NgayHen, NoiDungHen } = meetingInfo;
    if (!NgayHen) throw new Error("Phải chọn ngày/giờ họp mặt");
    if (!NoiDungHen?.trim()) throw new Error("Phải nhập địa điểm hoặc ghi chú họp mặt");

    return await prisma.chuyennhuong.update({
        where: { ID: Number(id) },
        data: {
            TrangThai: "DaDuyet",
            QuanLyDuyetID: userId,
            NgayHen: new Date(NgayHen),
            NoiDungHen: NoiDungHen.trim()
        }
    });
};

export const rejectTransfer = async (id, reason) => {
    const record = await prisma.chuyennhuong.findUnique({ where: { ID: Number(id) } });
    if (!record) throw new Error("Yêu cầu chuyển nhượng không tồn tại");
    if (record.TrangThai !== "ChoDuyet") throw new Error("Yêu cầu không ở trạng thái chờ duyệt");

    return await prisma.chuyennhuong.update({
        where: { ID: Number(id) },
        data: {
            TrangThai: "TuChoi",
            LyDoTuChoi: reason?.trim() || null
        }
    });
};
