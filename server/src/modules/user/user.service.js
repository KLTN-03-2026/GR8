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
  AnhCCCDMatTruoc: true,
  AnhCCCDMatSau: true,
  CCCD: true,
  NgayCapCCCD: true,
  NoiCapCCCD: true,
  DaKhaiBaoNgoaiTru: true,
  TrangThai: true,
  NgayTao: true,
  RoleID: true,
  roles: { select: { TenVaiTro: true } },
};

export const getAllUsers = async ({ page, limit, search, roles }) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(500, Math.max(1, parseInt(limit) || 10));
  const skip = (p - 1) * l;

  // Parse danh sách role nếu có (vd: "NguoiThue,KhachVangLai")
  const roleFilter = roles
    ? roles.split(",").map(r => r.trim()).filter(Boolean)
    : null;

  const where = {
    is_deleted: 0,
    ...(search ? {
      OR: [
        { HoTen:       { contains: search } },
        { Email:       { contains: search } },
        { TenDangNhap: { contains: search } },
      ],
    } : {}),
    ...(roleFilter?.length ? {
      roles: { TenVaiTro: { in: roleFilter } },
    } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.nguoidung.findMany({
      where,
      skip,
      take: l,
      orderBy: { ID: "desc" },
      select: userSelect,
    }),
    prisma.nguoidung.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
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

  // Loại bỏ các field undefined để Prisma không ghi đè thành null
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  return prisma.nguoidung.update({
    where: { ID: Number(id) },
    data: cleanData,
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

  // Convert NgaySinh string "YYYY-MM-DD" sang Date object cho Prisma
  if (safeData.NgaySinh && typeof safeData.NgaySinh === "string") {
    safeData.NgaySinh = new Date(safeData.NgaySinh + "T00:00:00.000Z");
  }
  // Convert NgayCapCCCD string "YYYY-MM-DD" sang Date object cho Prisma
  if (safeData.NgayCapCCCD && typeof safeData.NgayCapCCCD === "string") {
    safeData.NgayCapCCCD = new Date(safeData.NgayCapCCCD + "T00:00:00.000Z");
  }

  try {
    return await updateUserById(userId, safeData);
  } catch (error) {
    if (error.code === "P2002") {
      const target = JSON.stringify(error.meta?.target || "");
      if (target.includes("CCCD")) throw Object.assign(new Error("Số CCCD đã được sử dụng bởi tài khoản khác"), { statusCode: 409 });
      if (target.includes("SoDienThoai")) throw Object.assign(new Error("Số điện thoại đã được sử dụng bởi tài khoản khác"), { statusCode: 409 });
      if (target.includes("Email")) throw Object.assign(new Error("Email đã được sử dụng bởi tài khoản khác"), { statusCode: 409 });
    }
    throw error;
  }
};
export const getAllRoles = async () => {
  return await prisma.roles.findMany({
    orderBy: { ID: "asc" }
  });
};

export const createStaff = async (data) => {
  const { TenDangNhap, HoTen, Email, SoDienThoai, MatKhau, VaiTro } = data;

  if (!TenDangNhap || !HoTen || !Email || !MatKhau || !VaiTro) {
    throw Object.assign(new Error("Thiếu thông tin bắt buộc"), { statusCode: 400 });
  }

  // Kiểm tra trùng username/email
  const existing = await prisma.nguoidung.findFirst({
    where: {
      is_deleted: 0,
      OR: [
        { TenDangNhap: TenDangNhap.trim() },
        { Email: Email.trim() },
      ],
    },
    select: { TenDangNhap: true, Email: true },
  });
  if (existing) {
    if (existing.TenDangNhap === TenDangNhap.trim())
      throw Object.assign(new Error("Tên đăng nhập đã tồn tại"), { statusCode: 409 });
    throw Object.assign(new Error("Email đã được sử dụng"), { statusCode: 409 });
  }

  // Lấy RoleID từ tên vai trò
  const role = await prisma.roles.findFirst({ where: { TenVaiTro: VaiTro } });
  if (!role) throw Object.assign(new Error(`Vai trò "${VaiTro}" không tồn tại`), { statusCode: 400 });

  // Hash mật khẩu
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(MatKhau, 10);

  const newUser = await prisma.nguoidung.create({
    data: {
      TenDangNhap: TenDangNhap.trim(),
      HoTen: HoTen.trim(),
      Email: Email.trim(),
      SoDienThoai: SoDienThoai?.trim() || null,
      MatKhau: hashedPassword,
      RoleID: role.ID,
      TrangThai: "Active",
    },
    select: userSelect,
  });

  return newUser;
};
