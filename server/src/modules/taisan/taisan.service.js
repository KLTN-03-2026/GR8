import prisma from "../../config/prisma.js";

export const getAllTaiSan = async (filters = {}) => {
  const { CanHoID, TinhTrang, LoaiTaiSan } = filters;
  return await prisma.taisan.findMany({
    where: {
      is_deleted: 0,
      ...(CanHoID && { CanHoID: Number(CanHoID) }),
      ...(TinhTrang && { TinhTrang }),
      ...(LoaiTaiSan && { LoaiTaiSan })
    },
    include: {
      canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } }
    },
    orderBy: { ID: "desc" }
  });
};

export const getTaiSanById = async (id) => {
  const taisan = await prisma.taisan.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    include: {
      canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } }
    }
  });
  if (!taisan) throw Object.assign(new Error("Không tìm thấy tài sản"), { statusCode: 404 });
  return taisan;
};

export const createTaiSan = async (data) => {
  const { MaTaiSan, TenTaiSan, LoaiTaiSan, CanHoID, ViTri, SoLuong, TinhTrang, NgayMua, GiaTri, NhaCungCap, GhiChu } = data;
  
  // Validation
  if (!MaTaiSan || !TenTaiSan) {
    throw Object.assign(new Error("Thiếu MaTaiSan hoặc TenTaiSan"), { statusCode: 400 });
  }
  
  if (!CanHoID) {
    throw Object.assign(new Error("CanHoID (Căn hộ) là bắt buộc"), { statusCode: 400 });
  }

  // Validate CanHoID tồn tại
  const canho = await prisma.canho.findUnique({ where: { ID: Number(CanHoID) } });
  if (!canho) {
    throw Object.assign(new Error("Căn hộ không tồn tại"), { statusCode: 400 });
  }

  return await prisma.taisan.create({
    data: {
      MaTaiSan,
      TenTaiSan,
      LoaiTaiSan: LoaiTaiSan || "ThietBiCanHo",
      CanHoID: Number(CanHoID),
      ViTri: ViTri || null,
      SoLuong: SoLuong ? Number(SoLuong) : 1,
      TinhTrang: TinhTrang || "Tot",
      NgayMua: NgayMua ? new Date(NgayMua) : null,
      GiaTri: GiaTri ? Number(GiaTri) : 0,
      NhaCungCap: NhaCungCap || null,
      GhiChu: GhiChu || null
    },
    include: {
      canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } }
    }
  });
};

export const updateTaiSan = async (id, data) => {
  const taisan = await prisma.taisan.findFirst({ where: { ID: Number(id), is_deleted: 0 } });
  if (!taisan) throw Object.assign(new Error("Không tìm thấy tài sản"), { statusCode: 404 });

  const { MaTaiSan, TenTaiSan, LoaiTaiSan, CanHoID, ViTri, SoLuong, TinhTrang, NgayMua, GiaTri, NhaCungCap, GhiChu } = data;
  
  // Validate CanHoID nếu có cập nhật
  if (CanHoID) {
    const canho = await prisma.canho.findUnique({ where: { ID: Number(CanHoID) } });
    if (!canho) throw Object.assign(new Error("Căn hộ không tồn tại"), { statusCode: 400 });
  }

  return await prisma.taisan.update({
    where: { ID: Number(id) },
    data: {
      ...(MaTaiSan && { MaTaiSan }),
      ...(TenTaiSan && { TenTaiSan }),
      ...(LoaiTaiSan && { LoaiTaiSan }),
      ...(CanHoID && { CanHoID: Number(CanHoID) }),
      ...(ViTri !== undefined && { ViTri }),
      ...(SoLuong && { SoLuong: Number(SoLuong) }),
      ...(TinhTrang && { TinhTrang }),
      ...(NgayMua && { NgayMua: new Date(NgayMua) }),
      ...(GiaTri !== undefined && { GiaTri: Number(GiaTri) }),
      ...(NhaCungCap !== undefined && { NhaCungCap }),
      ...(GhiChu !== undefined && { GhiChu })
    },
    include: {
      canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } }
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

// Lấy tài sản theo căn hộ đang thuê của người dùng
export const getTaiSanByNguoiThue = async (userId) => {
  // Tìm hợp đồng đang thuê (DaKy hoặc DangThue) của người dùng
  const hopdong = await prisma.hopdong.findFirst({
    where: {
      NguoiThueID: userId,
      TrangThai: { in: ["DaKy", "DangThue"] },
      is_deleted: 0,
    },
    select: { CanHoID: true, canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } } },
  });

  if (!hopdong) {
    throw Object.assign(
      new Error("Bạn hiện không có hợp đồng thuê nào đang hoạt động"),
      { statusCode: 404 }
    );
  }

  const assets = await prisma.taisan.findMany({
    where: { CanHoID: hopdong.CanHoID, is_deleted: 0 },
    include: { canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } } },
    orderBy: { ID: "desc" },
  });

  return { canho: hopdong.canho, assets };
};

// Thống kê tài sản
export const getThongKeTaiSan = async () => {
  const [total, byLoai, byTinhTrang, tongGiaTri] = await Promise.all([
    // Tổng số tài sản
    prisma.taisan.count({ where: { is_deleted: 0 } }),
    
    // Thống kê theo loại
    prisma.taisan.groupBy({
      by: ['LoaiTaiSan'],
      where: { is_deleted: 0 },
      _count: { ID: true }
    }),
    
    // Thống kê theo tình trạng
    prisma.taisan.groupBy({
      by: ['TinhTrang'],
      where: { is_deleted: 0 },
      _count: { ID: true }
    }),
    
    // Tổng giá trị tài sản
    prisma.taisan.aggregate({
      where: { is_deleted: 0 },
      _sum: { GiaTri: true }
    })
  ]);

  return {
    tongSoTaiSan: total,
    theoLoai: byLoai,
    theoTinhTrang: byTinhTrang,
    tongGiaTri: tongGiaTri._sum.GiaTri || 0
  };
};
