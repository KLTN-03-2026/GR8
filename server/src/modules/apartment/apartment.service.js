// server/src/modules/apartment/apartment.service.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import { ROLES } from "../../constants/roles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(path.join(__dirname, "../../../uploads"));

async function unlinkMediaFileIfLocal(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return;
  if (!fileUrl.startsWith("/uploads/")) return;
  const relativeFromUploads = fileUrl.replace(/^\/uploads\/?/, "");
  const fullPath = path.resolve(UPLOADS_ROOT, relativeFromUploads);
  if (!fullPath.startsWith(UPLOADS_ROOT)) return;
  await fs.unlink(fullPath).catch(() => {});
}

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
  IsHot: true,
  ChuNhaID: true,
  GioiHanNguoiO: true,
  NgayTinhDien: true,
  NgayTinhNuoc: true,
  NgayTinhTienNha: true,
  toanha: {
    select: {
      ID: true,
      TenToaNha: true,
      DiaChi: true,
      Latitude: true,
      Longitude: true,
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
  canho_tienich: {
    select: {
      TienIchID: true,
      tienich: { select: { ID: true, TenTienIch: true, MoTa: true } },
    },
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
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 100)); // Changed default from 10 to 100
    const skip = (page - 1) * limit;
    
    console.log("📋 Fetching apartments with filters:", { page, limit, skip, ...filters });
    
    const { ToaNhaID, TrangThai, minGia, maxGia, search, Tang, SoPhong } = filters;
    const where = {
      is_deleted: 0,
      ...(ToaNhaID && { ToaNhaID: Number(ToaNhaID) }),
      ...(TrangThai && { TrangThai }),
      ...(Tang && { Tang: Number(Tang) }),
      ...(SoPhong && { SoPhong: String(SoPhong) }),
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

    const apartmentIds = items.map((item) => item.ID);
    let mediaMap = new Map();
    if (apartmentIds.length > 0) {
      const apartmentImages = await prisma.media.findMany({
        where: {
          LoaiEntity: "CanHo",
          EntityID: { in: apartmentIds },
          LoaiFile: "image",
        },
        orderBy: { NgayUpload: "desc" },
      });

      mediaMap = apartmentImages.reduce((acc, mediaItem) => {
        if (!acc.has(mediaItem.EntityID)) acc.set(mediaItem.EntityID, []);
        acc
          .get(mediaItem.EntityID)
      .push({ ID: mediaItem.ID, FileURL: mediaItem.FileURL, IsFeatured: !!(mediaItem.IsFeatured ?? false) });
        return acc;
      }, new Map());
    }

    const itemsWithImages = items.map((item) => ({
      ...item,
      AnhCanHo: mediaMap.get(item.ID) || [],
    }));

    console.log(`✅ Successfully fetched ${items.length} apartments (total: ${total})`);

    return {
      items: itemsWithImages,
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

  const apartmentImages = await prisma.media.findMany({
    where: {
      LoaiEntity: "CanHo",
      EntityID: Number(id),
      LoaiFile: "image",
    },
    orderBy: { NgayUpload: "desc" },
  });

  return {
    ...apartment,
    AnhCanHo: apartmentImages.map((item) => ({
      ID: item.ID,
      FileURL: item.FileURL,
      IsFeatured: !!(item.IsFeatured ?? false),
    })),
  };
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
    IsHot: data.IsHot === true || data.IsHot === 'true' ? true : false,
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

  if (data.TrangThai === "Trong") {
    const activeContract = await prisma.hopdong.findFirst({
      where: {
        CanHoID: Number(id),
        is_deleted: 0,
        TrangThai: { in: ["DangThue", "DaKy"] },
      },
      select: { ID: true, NguoiThueID: true },
    });

    if (activeContract?.NguoiThueID) {
      throw Object.assign(
        new Error("Căn hộ đang có người thuê, không thể chuyển trạng thái về Trống"),
        { statusCode: 400 }
      );
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
  if (data.IsHot !== undefined) payload.IsHot = data.IsHot === true || data.IsHot === 'true';
  if (data.ToaNhaID !== undefined) payload.ToaNhaID = toanhaId;
  if (data.ChuNhaID !== undefined) delete payload.ChuNhaID;
  // Ngày tính tiền riêng
  if (data.NgayTinhDien    !== undefined) payload.NgayTinhDien    = data.NgayTinhDien    ? Number(data.NgayTinhDien)    : null;
  if (data.NgayTinhNuoc    !== undefined) payload.NgayTinhNuoc    = data.NgayTinhNuoc    ? Number(data.NgayTinhNuoc)    : null;
  if (data.NgayTinhTienNha !== undefined) payload.NgayTinhTienNha = data.NgayTinhTienNha ? Number(data.NgayTinhTienNha) : null;
  if (data.GioiHanNguoiO  !== undefined) payload.GioiHanNguoiO   = data.GioiHanNguoiO  ? Number(data.GioiHanNguoiO)  : null;

  const apartmentId = Number(id);
  const hasApartmentImagePayload = Object.prototype.hasOwnProperty.call(data, "AnhCanHo");
  const imageUrl = hasApartmentImagePayload ? String(data.AnhCanHo || "").trim() : "";

  const updatedApartment = await prisma.$transaction(async (tx) => {
    const updated = await tx.canho.update({
      where: { ID: apartmentId },
      data: payload,
      select: apartmentPublicSelect,
    });

    if (hasApartmentImagePayload) {
      await tx.media.deleteMany({
        where: {
          LoaiEntity: "CanHo",
          EntityID: apartmentId,
          LoaiFile: "image",
        },
      });

      if (imageUrl) {
        await tx.media.create({
          data: {
            LoaiEntity: "CanHo",
            EntityID: apartmentId,
            FileURL: imageUrl,
            LoaiFile: "image",
            UploadedBy: actor?.ID ? Number(actor.ID) : null,
          },
        });
      }
    }

    return updated;
  });

  const apartmentImages = await prisma.media.findMany({
    where: {
      LoaiEntity: "CanHo",
      EntityID: apartmentId,
      LoaiFile: "image",
    },
    orderBy: { NgayUpload: "desc" },
  });

  return {
    ...updatedApartment,
    AnhCanHo: apartmentImages.map((item) => ({ ID: item.ID, FileURL: item.FileURL })),
  };
};

/**
 * Thêm một hoặc nhiều ảnh đã upload (đường dẫn public `/uploads/canho/...`), không xóa ảnh cũ.
 */
export const appendApartmentPhotosFromUpload = async (id, relativeFilePaths, actor, featuredIndex = null) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  const paths = Array.isArray(relativeFilePaths) ? relativeFilePaths.filter(Boolean) : [];
  if (!paths.length) {
    throw Object.assign(new Error("Không có file ảnh hợp lệ"), { statusCode: 400 });
  }

  const idx =
    featuredIndex === null || featuredIndex === undefined || featuredIndex === ""
      ? null
      : Number(featuredIndex);

  await prisma.$transaction(async (tx) => {
    if (idx !== null && Number.isFinite(idx)) {
      await tx.media.updateMany({
        where: { LoaiEntity: "CanHo", EntityID: Number(id), LoaiFile: "image" },
        data: { IsFeatured: false },
      });
    }

    for (let i = 0; i < paths.length; i++) {
      await tx.media.create({
        data: {
          LoaiEntity: "CanHo",
          EntityID: Number(id),
          FileURL: paths[i],
          LoaiFile: "image",
          IsFeatured: idx !== null && Number.isFinite(idx) ? i === idx : false,
          UploadedBy: actor?.ID ? Number(actor.ID) : null,
        },
      });
    }
  });

  return getApartmentById(id);
};

export const deleteApartmentImageByMediaId = async (apartmentId, mediaId, actor) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(apartmentId), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  const media = await prisma.media.findFirst({
    where: {
      ID: Number(mediaId),
      LoaiEntity: "CanHo",
      EntityID: Number(apartmentId),
      LoaiFile: "image",
    },
  });

  if (!media) {
    throw Object.assign(new Error("Không tìm thấy ảnh"), { statusCode: 404 });
  }

  await unlinkMediaFileIfLocal(media.FileURL);
  await prisma.media.delete({ where: { ID: media.ID } });

  if (media.IsFeatured) {
    const next = await prisma.media.findFirst({
      where: { LoaiEntity: "CanHo", EntityID: Number(apartmentId), LoaiFile: "image" },
      orderBy: [{ NgayUpload: "desc" }],
      select: { ID: true },
    });
    if (next?.ID) {
      await prisma.media.update({ where: { ID: next.ID }, data: { IsFeatured: true } });
    }
  }

  return getApartmentById(apartmentId);
};

export const setApartmentFeaturedImage = async (apartmentId, mediaId, actor) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(apartmentId), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  const media = await prisma.media.findFirst({
    where: {
      ID: Number(mediaId),
      LoaiEntity: "CanHo",
      EntityID: Number(apartmentId),
      LoaiFile: "image",
    },
    select: { ID: true },
  });

  if (!media) {
    throw Object.assign(new Error("Không tìm thấy ảnh"), { statusCode: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.media.updateMany({
      where: { LoaiEntity: "CanHo", EntityID: Number(apartmentId), LoaiFile: "image" },
      data: { IsFeatured: false },
    });
    await tx.media.update({ where: { ID: Number(mediaId) }, data: { IsFeatured: true } });
  });

  return getApartmentById(apartmentId);
};

export const clearApartmentImages = async (id, actor) => {
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true, ChuNhaID: true },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  assertApartmentOwnershipOrManager(apartment, actor);

  const existing = await prisma.media.findMany({
    where: {
      LoaiEntity: "CanHo",
      EntityID: Number(id),
      LoaiFile: "image",
    },
  });
  for (const m of existing) {
    await unlinkMediaFileIfLocal(m.FileURL);
  }

  await prisma.media.deleteMany({
    where: {
      LoaiEntity: "CanHo",
      EntityID: Number(id),
      LoaiFile: "image",
    },
  });

  return getApartmentById(id);
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

// Bulk create rooms from template
export const bulkCreateRooms = async (data, ownerUserId) => {
  const { ToaNhaID, Tang, SoPhong, DienTich, GiaThue, TienCoc, MoTa, Prefix } = data;

  if (!ToaNhaID || !SoPhong || !GiaThue) {
    throw Object.assign(new Error("Thiếu thông tin bắt buộc"), { statusCode: 400 });
  }

  const toanha = await prisma.toanha.findUnique({ where: { ID: Number(ToaNhaID) } });
  if (!toanha) throw Object.assign(new Error("Tòa nhà không tồn tại"), { statusCode: 404 });

  const tang = Number(Tang) || 0;
  const soPhong = Number(SoPhong);
  const prefix = Prefix || `P`;

  const rooms = [];
  for (let i = 1; i <= soPhong; i++) {
    const soPhongStr = String(i).padStart(2, '0');
    const maCanHo = tang > 0
      ? `${prefix}${tang}${soPhongStr}`
      : `${prefix}${soPhongStr}`;

    rooms.push({
      MaCanHo: maCanHo,
      ToaNhaID: Number(ToaNhaID),
      Tang: tang,
      SoPhong: soPhongStr,
      DienTich: DienTich ? new Prisma.Decimal(DienTich) : null,
      GiaThue: new Prisma.Decimal(GiaThue),
      TienCoc: new Prisma.Decimal(TienCoc || GiaThue),
      TrangThai: "Trong",
      MoTa: MoTa || null,
      ChuNhaID: Number(ownerUserId),
    });
  }

  // Skip duplicates
  const created = [];
  for (const room of rooms) {
    const exists = await prisma.canho.findFirst({
      where: { MaCanHo: room.MaCanHo, is_deleted: 0 }
    });
    if (!exists) {
      const r = await prisma.canho.create({ data: room });
      created.push(r);
    }
  }

  return { created: created.length, skipped: rooms.length - created.length };
};