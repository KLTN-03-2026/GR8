// server/src/modules/thanhvien/thanhvien.service.js
import prisma from "../../config/prisma.js";

export const getAllMembers = async () => {
  return prisma.thanh_vien_canho.findMany({
    include: {
      canho: {
        select: {
          ID: true,
          MaCanHo: true,
          Tang: true,
          SoPhong: true,
          TrangThai: true,
        },
      },
    },
    orderBy: { NgayDangKy: "desc" },
  });
};

export const getByCanHo = async (canHoID) => {
  return prisma.thanh_vien_canho.findMany({
    where: { CanHoID: Number(canHoID) },
    orderBy: { NgayDangKy: "desc" },
  });
};

export const addMember = async (canHoID, data, userId) => {
  const canho = await prisma.canho.findFirst({
    where: { ID: Number(canHoID), is_deleted: 0 },
  });
  if (!canho) throw Object.assign(new Error("Căn hộ không tồn tại"), { statusCode: 404 });

  // Kiểm tra giới hạn người ở
  if (canho.GioiHanNguoiO) {
    const currentCount = await prisma.thanh_vien_canho.count({
      where: { CanHoID: Number(canHoID), TrangThai: "DangO" },
    });
    const activeTenantCount = await prisma.hopdong.count({
      where: {
        CanHoID: Number(canHoID),
        TrangThai: "DangThue",
        is_deleted: 0,
      },
    });
    if (currentCount + activeTenantCount >= canho.GioiHanNguoiO) {
      throw Object.assign(
        new Error(`Căn hộ đã đạt giới hạn ${canho.GioiHanNguoiO} người ở`),
        { statusCode: 400 }
      );
    }
  }

  return prisma.thanh_vien_canho.create({
    data: {
      CanHoID: Number(canHoID),
      HoTen: data.HoTen,
      NgaySinh: data.NgaySinh ? new Date(data.NgaySinh) : null,
      GioiTinh: data.GioiTinh || null,
      CCCD: data.CCCD || null,
      SoDienThoai: data.SoDienThoai || null,
      QuanHe: data.QuanHe || null,
      DiaChiThuongTru: data.DiaChiThuongTru || null,
      GhiChu: data.GhiChu || null,
      TrangThai: "DangO",
      NguoiThemID: userId ? Number(userId) : null,
    },
  });
};

export const updateMember = async (id, data) => {
  const member = await prisma.thanh_vien_canho.findUnique({ where: { ID: Number(id) } });
  if (!member) throw Object.assign(new Error("Không tìm thấy thành viên"), { statusCode: 404 });

  return prisma.thanh_vien_canho.update({
    where: { ID: Number(id) },
    data: {
      HoTen: data.HoTen ?? member.HoTen,
      NgaySinh: data.NgaySinh ? new Date(data.NgaySinh) : member.NgaySinh,
      GioiTinh: data.GioiTinh ?? member.GioiTinh,
      CCCD: data.CCCD ?? member.CCCD,
      SoDienThoai: data.SoDienThoai ?? member.SoDienThoai,
      QuanHe: data.QuanHe ?? member.QuanHe,
      DiaChiThuongTru: data.DiaChiThuongTru ?? member.DiaChiThuongTru,
      GhiChu: data.GhiChu ?? member.GhiChu,
    },
  });
};

export const checkOut = async (id) => {
  const member = await prisma.thanh_vien_canho.findUnique({ where: { ID: Number(id) } });
  if (!member) throw Object.assign(new Error("Không tìm thấy thành viên"), { statusCode: 404 });
  if (member.TrangThai === "DaRoi")
    throw Object.assign(new Error("Thành viên đã rời đi trước đó"), { statusCode: 400 });

  return prisma.thanh_vien_canho.update({
    where: { ID: Number(id) },
    data: { TrangThai: "DaRoi", NgayRoi: new Date() },
  });
};

export const deleteMember = async (id) => {
  const member = await prisma.thanh_vien_canho.findUnique({ where: { ID: Number(id) } });
  if (!member) throw Object.assign(new Error("Không tìm thấy thành viên"), { statusCode: 404 });
  return prisma.thanh_vien_canho.delete({ where: { ID: Number(id) } });
};
