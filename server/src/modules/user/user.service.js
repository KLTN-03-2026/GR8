import prisma from "../../config/prisma.js";

const userSelect = {
  ID: true,
  TenDangNhap: true,
  HoTen: true,
  Email: true,
  SoDienThoai: true,
  GioiTinh: true,
  NgaySinh: true,
  DiaChi: true,
  Avatar: true,
  TrangThai: true,
  NgayTao: true,
  RoleID: true,
  roles: { select: { TenVaiTro: true } },
};

export const getAllUsers = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;
  const where = {
    is_deleted: 0,
    ...(search
      ? {
          OR: [
            { HoTen: { contains: search } },
            { Email: { contains: search } },
            { TenDangNhap: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.nguoidung.findMany({
      where,
      skip,
      take: limit,
      orderBy: { ID: "desc" },
      select: userSelect,
    }),
    prisma.nguoidung.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await prisma.nguoidung.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: userSelect,
  });

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUserById = async (id, data) => {
  const existing = await prisma.nguoidung.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true },
  });

  if (!existing) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return prisma.nguoidung.update({
    where: { ID: Number(id) },
    data,
    select: userSelect,
  });
};

export const softDeleteUserById = async (id) => {
  const existing = await prisma.nguoidung.findFirst({
    where: { ID: Number(id), is_deleted: 0 },
    select: { ID: true },
  });

  if (!existing) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  await prisma.nguoidung.update({
    where: { ID: Number(id) },
    data: {
      is_deleted: 1,
      deleted_at: new Date(),
      TrangThai: "Inactive",
    },
  });

  return { deleted: true };
};

export const getCurrentUser = async (userId) => {
  return getUserById(userId);
};

export const updateCurrentUser = async (userId, data) => {
  const { RoleID: _roleIgnored, TrangThai: _statusIgnored, ...safeData } = data;
  return updateUserById(userId, safeData);
};
