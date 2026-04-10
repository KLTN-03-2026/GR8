// server/src/modules/apartment/apartment.service.js
import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

export const getAllApartments = async (filters = {}) => {
  const { ToaNhaID, TrangThai, minGia, maxGia, search } = filters;

  return await prisma.canho.findMany({
    where: {
      ...(ToaNhaID && { ToaNhaID: Number(ToaNhaID) }),
      ...(TrangThai && { TrangThai }),
      ...(minGia && { GiaThue: { gte: new Prisma.Decimal(minGia) } }),
      ...(maxGia && { GiaThue: { lte: new Prisma.Decimal(maxGia) } }),
      ...(search && {
        OR: [
          { MaCanHo: { contains: search } },
          { MoTa: { contains: search } },
        ],
      }),
    },
    include: {
      toanha: true,
      nguoidung: { select: { HoTen: true, Email: true } },
    },
    orderBy: { ID: "desc" },
  });
};

export const getApartmentById = async (id) => {
  const apartment = await prisma.canho.findUnique({
    where: { ID: Number(id) },
    include: {
      toanha: true,
      nguoidung: { select: { HoTen: true, Email: true, SoDienThoai: true } },
    },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }
  return apartment;
};

export const createApartment = async (data) => {
  if (!data.MaCanHo || !data.ChuNhaID) {
    throw Object.assign(new Error("Thiếu MaCanHo hoặc ChuNhaID"), { statusCode: 400 });
  }

  const chuNhaId = Number(data.ChuNhaID);
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