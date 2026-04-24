import prisma from "../../config/prisma.js";

export const getAllToaNha = async () => {
  return await prisma.toanha.findMany({
    include: { nguoidung: { select: { HoTen: true, Email: true } }, _count: { select: { canho: true } } },
    orderBy: { ID: "desc" }
  });
};

export const getToaNhaById = async (id) => {
  const toanha = await prisma.toanha.findUnique({
    where: { ID: Number(id) },
    include: {
      nguoidung: { select: { HoTen: true, Email: true, SoDienThoai: true } },
      canho: { select: { ID: true, MaCanHo: true, Tang: true, SoPhong: true, GiaThue: true, TrangThai: true } }
    }
  });
  if (!toanha) throw Object.assign(new Error("Không tìm thấy tòa nhà"), { statusCode: 404 });
  return toanha;
};

export const createToaNha = async (data) => {
  const { TenToaNha, DiaChi, SoTang, ChuNhaID } = data;
  if (!TenToaNha || !DiaChi || !SoTang || !ChuNhaID)
    throw Object.assign(new Error("Thiếu thông tin bắt buộc"), { statusCode: 400 });

  const chuNha = await prisma.nguoidung.findUnique({ where: { ID: Number(ChuNhaID) } });
  if (!chuNha) throw Object.assign(new Error("Chủ nhà không tồn tại"), { statusCode: 400 });

  return await prisma.toanha.create({
    data: { TenToaNha, DiaChi, SoTang: Number(SoTang), ChuNhaID: Number(ChuNhaID) },
    include: { nguoidung: { select: { HoTen: true } } }
  });
};

export const updateToaNha = async (id, data) => {
  const toanha = await prisma.toanha.findUnique({ where: { ID: Number(id) } });
  if (!toanha) throw Object.assign(new Error("Không tìm thấy tòa nhà"), { statusCode: 404 });

  return await prisma.toanha.update({
    where: { ID: Number(id) },
    data: {
      ...(data.TenToaNha && { TenToaNha: data.TenToaNha }),
      ...(data.DiaChi && { DiaChi: data.DiaChi }),
      ...(data.SoTang && { SoTang: Number(data.SoTang) })
    }
  });
};

export const deleteToaNha = async (id) => {
  const toanha = await prisma.toanha.findUnique({ where: { ID: Number(id) } });
  if (!toanha) throw Object.assign(new Error("Không tìm thấy tòa nhà"), { statusCode: 404 });
  await prisma.toanha.delete({ where: { ID: Number(id) } });
  return { message: "Xóa tòa nhà thành công" };
};
