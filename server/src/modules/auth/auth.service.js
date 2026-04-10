// server/src/modules/auth/auth.service.js
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

export const registerUser = async (userData) => {
  const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, VaiTro = "NguoiThue" } = userData;

  try {
    // Kiểm tra tồn tại TenDangNhap và Email (giữ lại)
    const existingUser = await prisma.nguoidung.findFirst({
      where: {
        OR: [
          { TenDangNhap },
          { Email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) throw new Error("Tên đăng nhập đã tồn tại");
      if (existingUser.Email === Email) throw new Error("Email đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    const newUser = await prisma.nguoidung.create({
      data: {
        TenDangNhap,
        MatKhau: hashedPassword,
        HoTen,
        Email,
        SoDienThoai: SoDienThoai || null,     // Cho phép null tạm thời
        VaiTro,
        TrangThai: "Active"
      }
    });

    const { MatKhau: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;

  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || '';
      if (field.includes('TenDangNhap')) throw new Error("Tên đăng nhập đã tồn tại");
      if (field.includes('Email')) throw new Error("Email đã được sử dụng");
      if (field.includes('SoDienThoai')) throw new Error("Số điện thoại đã được sử dụng");
    }
    throw error;
  }
};