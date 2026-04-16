import prisma from "../../config/prisma.js";

export const getAllTienIch = async () => {
  return await prisma.tienich.findMany({ orderBy: { ID: "asc" } });
};

export const createTienIch = async (data) => {
  const { TenTienIch, MoTa } = data;
  if (!TenTienIch) throw Object.assign(new Error("Thiếu TenTienIch"), { statusCode: 400 });
  return await prisma.tienich.create({ data: { TenTienIch, MoTa: MoTa || null } });
};

export const updateTienIch = async (id, data) => {
  const tienich = await prisma.tienich.findUnique({ where: { ID: Number(id) } });
  if (!tienich) throw Object.assign(new Error("Không tìm thấy tiện ích"), { statusCode: 404 });
  return await prisma.tienich.update({
    where: { ID: Number(id) },
    data: {
      ...(data.TenTienIch && { TenTienIch: data.TenTienIch }),
      ...(data.MoTa !== undefined && { MoTa: data.MoTa })
    }
  });
};

export const deleteTienIch = async (id) => {
  const tienich = await prisma.tienich.findUnique({ where: { ID: Number(id) } });
  if (!tienich) throw Object.assign(new Error("Không tìm thấy tiện ích"), { statusCode: 404 });
  await prisma.tienich.delete({ where: { ID: Number(id) } });
  return { message: "Xóa tiện ích thành công" };
};

export const ganTienIchChoCanHo = async (canhoId, tienichId) => {
  const canho = await prisma.canho.findUnique({ where: { ID: Number(canhoId) } });
  if (!canho) throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  const tienich = await prisma.tienich.findUnique({ where: { ID: Number(tienichId) } });
  if (!tienich) throw Object.assign(new Error("Không tìm thấy tiện ích"), { statusCode: 404 });

  return await prisma.canho_tienich.upsert({
    where: { CanHoID_TienIchID: { CanHoID: Number(canhoId), TienIchID: Number(tienichId) } },
    update: {},
    create: { CanHoID: Number(canhoId), TienIchID: Number(tienichId) }
  });
};

export const goTienIchKhoiCanHo = async (canhoId, tienichId) => {
  await prisma.canho_tienich.delete({
    where: { CanHoID_TienIchID: { CanHoID: Number(canhoId), TienIchID: Number(tienichId) } }
  });
  return { message: "Gỡ tiện ích thành công" };
};
