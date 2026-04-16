import prisma from "../../config/prisma.js";

export const getAllTaiSan = async (filters = {}) => {
  const { ToaNhaID, CanHoID, TinhTrang, LoaiTaiSan } = filters;
  return await prisma.taisan.findMany({
    where: {
      is_deleted: 0,
      ...(ToaNhaID && { ToaNhaID: Number(ToaNhaID) }),
      ...(CanHoID && { CanHoID: Number(CanHoID) }),
      ...(TinhTrang && { TinhTrang }),
      ...(LoaiTaiSan && { LoaiTaiSan })
    },
    include: {
      toanha: { select: { TenToaNha: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } }
    },
    orderBy: { ID: "desc" }
  });
};

export const getTaiSanById = async (id) => {
  const taisan = await prisma.taisan.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    include: {
      toanha: { select: { TenToaNha: true } },
      canho: { select: { MaCanHo: true, SoPhong: true } }
    }
  });
  if (!taisan) throw Object.assign(new Error("Không tìm thấy tài sản"), { statusCode: 404 });
  return taisan;
};

export const createTaiSan = async (data) => {
  const { MaTaiSan, TenTaiSan, LoaiTaiSan, ToaNhaID, CanHoID, ViTri, SoLuong, TinhTrang, NgayMua, GiaTri, NhaCungCap, GhiChu } = data;
  if (!MaTaiSan || !TenTaiSan) throw Object.assign(new Error("Thiếu MaTaiSan hoặc TenTaiSan"), { statusCode: 400 });

  return await prisma.taisan.create({
    data: {
      MaTaiSan, TenTaiSan,
      LoaiTaiSan: LoaiTaiSan || "ThietBiChung",
      ToaNhaID: ToaNhaID ? Number(ToaNhaID) : null,
      CanHoID: CanHoID ? Number(CanHoID) : null,
      ViTri: ViTri || null,
      SoLuong: SoLuong ? Number(SoLuong) : 1,
      TinhTrang: TinhTrang || "Tot",
      NgayMua: NgayMua ? new Date(NgayMua) : null,
      GiaTri: GiaTri ? Number(GiaTri) : 0,
      NhaCungCap: NhaCungCap || null,
      GhiChu: GhiChu || null
    }
  });
};

export const updateTaiSan = async (id, data) => {
  const taisan = await prisma.taisan.findFirst({ where: { ID: Number(id), is_deleted: 0 } });
  if (!taisan) throw Object.assign(new Error("Không tìm thấy tài sản"), { statusCode: 404 });

  const { MaTaiSan, TenTaiSan, LoaiTaiSan, ToaNhaID, CanHoID, ViTri, SoLuong, TinhTrang, NgayMua, GiaTri, NhaCungCap, GhiChu } = data;
  return await prisma.taisan.update({
    where: { ID: Number(id) },
    data: {
      ...(MaTaiSan && { MaTaiSan }),
      ...(TenTaiSan && { TenTaiSan }),
      ...(LoaiTaiSan && { LoaiTaiSan }),
      ...(ToaNhaID !== undefined && { ToaNhaID: ToaNhaID ? Number(ToaNhaID) : null }),
      ...(CanHoID !== undefined && { CanHoID: CanHoID ? Number(CanHoID) : null }),
      ...(ViTri !== undefined && { ViTri }),
      ...(SoLuong && { SoLuong: Number(SoLuong) }),
      ...(TinhTrang && { TinhTrang }),
      ...(NgayMua && { NgayMua: new Date(NgayMua) }),
      ...(GiaTri !== undefined && { GiaTri: Number(GiaTri) }),
      ...(NhaCungCap !== undefined && { NhaCungCap }),
      ...(GhiChu !== undefined && { GhiChu })
    }
  });
};

export const deleteTaiSan = async (id) => {
  const taisan = await prisma.taisan.findFirst({ where: { ID: Number(id), is_deleted: 0 } });
  if (!taisan) throw Object.assign(new Error("Không tìm thấy tài sản"), { statusCode: 404 });
  await prisma.taisan.update({
    where: { ID: Number(id) },
    data: { is_deleted: 1, deleted_at: new Date() }
  });
  return { message: "Xóa tài sản thành công" };
};
