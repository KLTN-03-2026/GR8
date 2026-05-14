// server/src/modules/yeucaudichvu/yeucaudichvu.service.js
import prisma from "../../config/prisma.js";

export const getYeuCauDichVu = async (filters = {}) => {
  const where = {};

  if (filters.CanHoID) {
    where.CanHoID = Number(filters.CanHoID);
  }

  if (filters.TrangThai) {
    where.TrangThai = filters.TrangThai;
  }

  // Filter HoaDonID = null (chưa tính vào hóa đơn nào)
  if (filters.HoaDonID === 'null') {
    where.HoaDonID = null;
  } else if (filters.HoaDonID) {
    where.HoaDonID = Number(filters.HoaDonID);
  }

  const items = await prisma.yeucaudichvu.findMany({
    where,
    include: {
      dichvu: {
        select: {
          ID: true,
          TenDichVu: true,
          Gia: true,
        },
      },
      nguoidung: {
        select: {
          ID: true,
          HoTen: true,
        },
      },
      canho: {
        select: {
          ID: true,
          MaCanHo: true,
          SoPhong: true,
        },
      },
    },
    orderBy: { NgayYeuCau: "desc" },
  });

  return { items };
};
