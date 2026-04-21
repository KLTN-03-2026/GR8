// server/src/modules/apartment/apartment.service.js
import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import { ROLES } from "../../constants/roles.js";

const apartmentPublicSelect = {
  ID: true,
  MaCanHo: true,
  ToaNhaID: true,
  Tang: true,
  SoPhong: true,
  DienTich: true,
  GiaThue: true,
  TienCoc: true,
  TrangThai: true,
  MoTa: true,
  ChuNhaID: true,
  toanha: {
    select: {
      ID: true,
      TenToaNha: true,
    },
  },
  nguoidung: { 
    select: { 
      ID: true,
      HoTen: true 
    } 
  },
  hopdong: {
    where: {
      is_deleted: 0,
      TrangThai: "DangThue", // Only active contracts
    },
    select: {
      ID: true,
      NguoiThueID: true,
      NgayBatDau: true,
      NgayKetThuc: true,
      TrangThai: true,
      nguoidung: {
        select: {
          ID: true,
          HoTen: true,
        },
      },
    },
    take: 1, // Only get the current/active contract
  },
};

const assertApartmentOwnershipOrManager = (apartment, actor) => {
  if (actor?.VaiTro === ROLES.QUAN_LY) return;
  if (actor?.VaiTro === ROLES.CHU_NHA && Number(apartment.ChuNhaID) === Number(actor.ID)) return;

  const error = new Error("Bạn không có quyền thao tác căn hộ này");
  error.statusCode = 403;
  throw error;
};

export const getAllApartments = async (filters = {}) => {
  try {
    // Set default values
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 10));
    const skip = (page - 1) * limit;
    
    console.log("📋 Fetching apartments with filters:", { page, limit, skip, ...filters });
    
    const { ToaNhaID, TrangThai, minGia, maxGia, search } = filters;
    const where = {
      is_deleted: 0,
      ...(ToaNhaID && { ToaNhaID: Number(ToaNhaID) }),
      ...(TrangThai && { TrangThai }),
      ...(minGia !== undefined && { GiaThue: { gte: new Prisma.Decimal(minGia) } }),
      ...(maxGia !== undefined && {
        GiaThue: {
          ...(minGia !== undefined ? { gte: new Prisma.Decimal(minGia) } : {}),
          lte: new Prisma.Decimal(maxGia),
        },
      }),
      ...(search && {
        OR: [{ MaCanHo: { contains: search } }, { MoTa: { contains: search } }],
      }),
    };

    console.log("🔍 WHERE clause:", JSON.stringify(where, null, 2));

    const [items, total] = await prisma.$transaction([
      prisma.canho.findMany({
        where,
        skip,
        take: limit,
        select: apartmentPublicSelect,
        orderBy: { ID: "desc" },
      }),
      prisma.canho.count({ where }),
    ]);

    console.log(`✅ Successfully fetched ${items.length} apartments (total: ${total})`);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error in getAllApartments:", {
      message: error.message,
      code: error.code,
      prismaError: error.clientVersion,
    });
    throw error;
  }
};

export const getApartmentById = async (id) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: apartmentPublicSelect,
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  return apartment;
};

export const createApartment = async (data, ownerUserId) => {
  if (!data.MaCanHo) {
    throw Object.assign(new Error("Thiếu MaCanHo"), { statusCode: 400 });
  }

  const chuNhaId = Number(ownerUserId);
  const toanhaId = data.ToaNhaID ? Number(data.ToaNhaID) : null;

  // Kiểm tra Chủ nhà
  const chuNha = await prisma.nguoidung.findUnique({ where: { ID: chuNhaId } });
  if (!chuNha) {
    throw Object.assign(new Error("Chủ nhà không tồn tại"), { statusCode: 400 });
  }

  // Kiểm tra Tòa nhà nếu có
  if (toanhaId) {
    const toaNha = await prisma.toanha.findUnique({ where: { ID: toanhaId } });
    if (!toaNha) {
      throw Object.assign(new Error(`Tòa nhà ID ${toanhaId} không tồn tại`), { statusCode: 400 });
    }
  }

  const dataPayload = {
    MaCanHo: String(data.MaCanHo).trim(),
    Tang: Number(data.Tang) || 0,
    SoPhong: String(data.SoPhong || "").trim() || "N/A",
    DienTich: data.DienTich ? new Prisma.Decimal(data.DienTich) : null,
    GiaThue: new Prisma.Decimal(data.GiaThue || 0),
    TienCoc: new Prisma.Decimal(data.TienCoc || 0),
    TrangThai: data.TrangThai || "Trong",
    MoTa: data.MoTa ? String(data.MoTa).trim() : null,
    ChuNhaID: chuNhaId,
    ...(toanhaId && { ToaNhaID: toanhaId }),
  };

  return await prisma.canho.create({
    data: dataPayload,
    include: {
      toanha: true,
      nguoidung: { select: { HoTen: true } },
    },
  });
};

export const updateApartmentById = async (id, data, actor) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  const toanhaId = data.ToaNhaID ? Number(data.ToaNhaID) : null;
  if (toanhaId) {
    const toaNha = await prisma.toanha.findUnique({ where: { ID: toanhaId } });
    if (!toaNha) {
      throw Object.assign(new Error(`Tòa nhà ID ${toanhaId} không tồn tại`), { statusCode: 400 });
    }
  }

  const payload = {};
  if (data.MaCanHo !== undefined) payload.MaCanHo = String(data.MaCanHo).trim();
  if (data.Tang !== undefined) payload.Tang = Number(data.Tang);
  if (data.SoPhong !== undefined) payload.SoPhong = String(data.SoPhong).trim();
  if (data.DienTich !== undefined) payload.DienTich = data.DienTich === null ? null : new Prisma.Decimal(data.DienTich);
  if (data.GiaThue !== undefined) payload.GiaThue = new Prisma.Decimal(data.GiaThue);
  if (data.TienCoc !== undefined) payload.TienCoc = new Prisma.Decimal(data.TienCoc);
  if (data.TrangThai !== undefined) payload.TrangThai = data.TrangThai;
  if (data.MoTa !== undefined) payload.MoTa = data.MoTa ? String(data.MoTa).trim() : null;
  if (data.ToaNhaID !== undefined) payload.ToaNhaID = toanhaId;
  if (data.ChuNhaID !== undefined) delete payload.ChuNhaID;

  return prisma.canho.update({
    where: { ID: Number(id) },
    data: payload,
    select: apartmentPublicSelect,
  });
};

export const softDeleteApartmentById = async (id, actor) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  await prisma.canho.update({
    where: { ID: Number(id) },
    data: {
      is_deleted: 1,
      deleted_at: new Date(),
    },
  });

  return { deleted: true };
};