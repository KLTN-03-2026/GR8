import prisma from "../../config/prisma.js";

export const getAllTheGuiXe = async (filters = {}) => {
  const { TrangThai, LoaiXe, LoaiThe } = filters;
  return await prisma.theguixe.findMany({
    where: {
      is_deleted: 0,
      ...(TrangThai && { TrangThai }),
      ...(LoaiXe && { LoaiXe }),
      ...(LoaiThe && { LoaiThe })
    },
    include: {
      nguoidung: { select: { HoTen: true, SoDienThoai: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } }
    },
    orderBy: { ID: "desc" }
  });
};

export const getTheGuiXeByUser = async (userId) => {
  return await prisma.theguixe.findMany({
    where: { NguoiDungID: Number(userId), is_deleted: 0 },
    include: { canho: { select: { MaCanHo: true, SoPhong: true } } }
  });
};

export const getTheGuiXeById = async (id) => {
  const the = await prisma.theguixe.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    include: {
      nguoidung: { select: { HoTen: true, SoDienThoai: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } }
    }
  });
  if (!the) throw Object.assign(new Error("Không tìm thấy thẻ gửi xe"), { statusCode: 404 });
  return the;
};

export const createTheGuiXe = async (data) => {
  const { MaThe, NguoiDungID, CanHoID, LoaiThe, LoaiXe, BienSoXe, NgayLap, NgayHetHan, SoTienDaNop, GhiChu } = data;
  if (!MaThe || !NguoiDungID || !LoaiThe || !LoaiXe || !NgayLap)
    throw Object.assign(new Error("Thiếu thông tin bắt buộc"), { statusCode: 400 });

  return await prisma.theguixe.create({
    data: {
      MaThe, LoaiThe, LoaiXe,
      NguoiDungID: Number(NguoiDungID),
      CanHoID: CanHoID ? Number(CanHoID) : null,
      BienSoXe: BienSoXe || null,
      NgayLap: new Date(NgayLap),
      NgayHetHan: NgayHetHan ? new Date(NgayHetHan) : null,
      SoTienDaNop: SoTienDaNop ? Number(SoTienDaNop) : 0,
      TrangThai: "Active",
      GhiChu: GhiChu || null
    }
  });
};

export const updateTheGuiXe = async (id, data) => {
  const the = await prisma.theguixe.findFirst({ where: { ID: Number(id), is_deleted: 0 } });
  if (!the) throw Object.assign(new Error("Không tìm thấy thẻ gửi xe"), { statusCode: 404 });

  const { TrangThai, NgayHetHan, BienSoXe, SoTienDaNop, GhiChu } = data;
  return await prisma.theguixe.update({
    where: { ID: Number(id) },
    data: {
      ...(TrangThai && { TrangThai }),
      ...(NgayHetHan && { NgayHetHan: new Date(NgayHetHan) }),
      ...(BienSoXe !== undefined && { BienSoXe }),
      ...(SoTienDaNop !== undefined && { SoTienDaNop: Number(SoTienDaNop) }),
      ...(GhiChu !== undefined && { GhiChu })
    }
  });
};

export const deleteTheGuiXe = async (id) => {
  const the = await prisma.theguixe.findFirst({ where: { ID: Number(id), is_deleted: 0 } });
  if (!the) throw Object.assign(new Error("Không tìm thấy thẻ gửi xe"), { statusCode: 404 });
  await prisma.theguixe.update({
    where: { ID: Number(id) },
    data: { is_deleted: 1 }
  });
  return { message: "Hủy thẻ gửi xe thành công" };
};
