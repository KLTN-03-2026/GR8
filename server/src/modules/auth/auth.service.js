// server/src/modules/auth/auth.service.js
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

export const registerUser = async (userData) => {
  const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai } = userData;

  try {
    const existingUser = await prisma.nguoidung.findFirst({
      where: { OR: [{ TenDangNhap }, { Email }] }
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) throw new Error("Tên đăng nhập đã tồn tại");
      if (existingUser.Email === Email) throw new Error("Email đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    // RoleID mặc định = 2 (NguoiThue) — tuỳ theo seed data trong bảng roles
    const newUser = await prisma.nguoidung.create({
      data: {
        TenDangNhap,
        MatKhau: hashedPassword,
        HoTen,
        Email,
        SoDienThoai: SoDienThoai || null,
        TrangThai: "Active",
      },
      include: { roles: { select: { TenVaiTro: true } } }
    });

    const { MatKhau: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;

  } catch (error) {
    if (error.code === 'P2002') {
      const target = JSON.stringify(error.meta?.target || '');
      if (target.includes('TenDangNhap')) throw new Error("Tên đăng nhập đã tồn tại");
      if (target.includes('Email')) throw new Error("Email đã được sử dụng");
      if (target.includes('SoDienThoai')) throw new Error("Số điện thoại đã được sử dụng");
      throw new Error("Dữ liệu đã tồn tại trong hệ thống");
    }
    throw error;
  }
};

export const loginUser = async (TenDangNhapOrEmail, MatKhau) => {
  const user = await prisma.nguoidung.findFirst({
    where: {
      OR: [
        { TenDangNhap: TenDangNhapOrEmail },
        { Email: TenDangNhapOrEmail }
      ]
    },
    include: { roles: { select: { TenVaiTro: true } } }
  });

  if (!user) throw new Error("Tài khoản không tồn tại");
  if (user.TrangThai === "Locked") throw new Error("Tài khoản đã bị khóa");
  if (user.TrangThai === "Inactive") throw new Error("Tài khoản chưa được kích hoạt");

  const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
  if (!isMatch) throw new Error("Mật khẩu không đúng");

  return user;
};