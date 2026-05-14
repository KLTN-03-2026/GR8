import prisma from "../../config/prisma.js";

// ── Danh mục dịch vụ ─────────────────────────────────────────────────────────

export const getAllDichVu = async (onlyActive = false) => {
  return await prisma.dichvu.findMany({
    where: onlyActive ? { TrangThai: "Active" } : {},
    include: { _count: { select: { yeucaudichvu: true } } },
    orderBy: { ID: "asc" },
  });
};

export const createDichVu = async (data) => {
  const { TenDichVu, MoTa, Gia } = data;
  if (!TenDichVu) throw Object.assign(new Error("Thiếu TenDichVu"), { statusCode: 400 });
  if (Gia == null || isNaN(Number(Gia))) throw Object.assign(new Error("Gia không hợp lệ"), { statusCode: 400 });
  return await prisma.dichvu.create({
    data: { TenDichVu, MoTa: MoTa || null, Gia: Number(Gia), TrangThai: "Active" },
  });
};

export const updateDichVu = async (id, data) => {
  const dv = await prisma.dichvu.findUnique({ where: { ID: Number(id) } });
  if (!dv) throw Object.assign(new Error("Không tìm thấy dịch vụ"), { statusCode: 404 });
  return await prisma.dichvu.update({
    where: { ID: Number(id) },
    data: {
      ...(data.TenDichVu && { TenDichVu: data.TenDichVu }),
      ...(data.MoTa !== undefined && { MoTa: data.MoTa }),
      ...(data.Gia != null && { Gia: Number(data.Gia) }),
      ...(data.TrangThai && { TrangThai: data.TrangThai }),
    },
  });
};

export const deleteDichVu = async (id) => {
  const dv = await prisma.dichvu.findUnique({ where: { ID: Number(id) } });
  if (!dv) throw Object.assign(new Error("Không tìm thấy dịch vụ"), { statusCode: 404 });
  // Soft-disable thay vì xóa cứng để giữ lịch sử yêu cầu
  await prisma.dichvu.update({ where: { ID: Number(id) }, data: { TrangThai: "Inactive" } });
  return { message: "Đã vô hiệu hóa dịch vụ" };
};

// ── Yêu cầu dịch vụ ──────────────────────────────────────────────────────────

export const getAllYeuCau = async (filters = {}) => {
  const { TrangThai, DichVuID, NguoiThueID } = filters;
  return await prisma.yeucaudichvu.findMany({
    where: {
      ...(TrangThai && { TrangThai }),
      ...(DichVuID && { DichVuID: Number(DichVuID) }),
      ...(NguoiThueID && { NguoiThueID: Number(NguoiThueID) }),
    },
    include: {
      dichvu: { select: { ID: true, TenDichVu: true, Gia: true } },
      nguoidung: { select: { ID: true, HoTen: true, SoDienThoai: true, Email: true } },
      canho: { select: { ID: true, MaCanHo: true, SoPhong: true, Tang: true } },
    },
    orderBy: { ID: "desc" },
  });
};

export const getMyYeuCau = async (userId) => {
  return await prisma.yeucaudichvu.findMany({
    where: { NguoiThueID: userId },
    include: {
      dichvu: { select: { ID: true, TenDichVu: true, Gia: true } },
      canho: { select: { ID: true, MaCanHo: true, SoPhong: true } },
    },
    orderBy: { ID: "desc" },
  });
};

export const createYeuCau = async (userId, data) => {
  const { DichVuID, GhiChu, CanHoID: canHoIDFromRequest } = data;
  if (!DichVuID) throw Object.assign(new Error("Thiếu DichVuID"), { statusCode: 400 });

  // Kiểm tra dịch vụ tồn tại và đang active
  const dv = await prisma.dichvu.findUnique({ where: { ID: Number(DichVuID) } });
  if (!dv) throw Object.assign(new Error("Dịch vụ không tồn tại"), { statusCode: 404 });
  if (dv.TrangThai !== "Active") throw Object.assign(new Error("Dịch vụ hiện không khả dụng"), { statusCode: 400 });

  let canHoID;

  if (canHoIDFromRequest) {
    // Nếu client truyền CanHoID, kiểm tra người dùng có hợp đồng cho căn hộ đó không
    const hopdong = await prisma.hopdong.findFirst({
      where: { NguoiThueID: userId, CanHoID: Number(canHoIDFromRequest), TrangThai: "DangThue", is_deleted: 0 },
      select: { CanHoID: true },
    });
    if (!hopdong) throw Object.assign(new Error("Bạn không có hợp đồng thuê đang hoạt động cho căn hộ này"), { statusCode: 400 });
    canHoID = hopdong.CanHoID;
  } else {
    // Fallback: lấy hợp đồng đầu tiên đang thuê
    const hopdong = await prisma.hopdong.findFirst({
      where: { NguoiThueID: userId, TrangThai: "DangThue", is_deleted: 0 },
      select: { CanHoID: true },
    });
    if (!hopdong) throw Object.assign(new Error("Bạn không có hợp đồng thuê đang hoạt động"), { statusCode: 400 });
    canHoID = hopdong.CanHoID;
  }

  return await prisma.yeucaudichvu.create({
    data: {
      NguoiThueID: userId,
      DichVuID: Number(DichVuID),
      CanHoID: canHoID,
      GhiChu: GhiChu || null,
      TrangThai: "ChoXuLy",
    },
    include: {
      dichvu: { select: { TenDichVu: true, Gia: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } },
    },
  });
};

export const duyetYeuCau = async (id, trangThai) => {
  const yc = await prisma.yeucaudichvu.findUnique({ where: { ID: Number(id) } });
  if (!yc) throw Object.assign(new Error("Không tìm thấy yêu cầu"), { statusCode: 404 });
  const valid = ["ChoXuLy", "DaXuLy"];
  if (!valid.includes(trangThai)) throw Object.assign(new Error("Trạng thái không hợp lệ"), { statusCode: 400 });
  return await prisma.yeucaudichvu.update({
    where: { ID: Number(id) },
    data: { TrangThai: trangThai },
    include: {
      dichvu: { select: { TenDichVu: true } },
      nguoidung: { select: { HoTen: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } },
    },
  });
};

export const deleteYeuCau = async (id, userId) => {
  const yc = await prisma.yeucaudichvu.findUnique({ where: { ID: Number(id) } });
  if (!yc) throw Object.assign(new Error("Không tìm thấy yêu cầu"), { statusCode: 404 });
  if (yc.NguoiThueID !== userId) throw Object.assign(new Error("Không có quyền hủy yêu cầu này"), { statusCode: 403 });
  if (yc.TrangThai === "DaXuLy") throw Object.assign(new Error("Không thể hủy yêu cầu đã xử lý"), { statusCode: 400 });
  await prisma.yeucaudichvu.delete({ where: { ID: Number(id) } });
  return { message: "Hủy yêu cầu thành công" };
};
