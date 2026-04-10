import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  return await prisma.nguoidung.findMany({
    where: { is_deleted: 0 },
    select: {
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
      roles: { select: { TenVaiTro: true } }
    }
  });
};

export const createUser = async (userData) => {
  const { MatKhau, ...rest } = userData;
  const hashedPassword = await bcrypt.hash(MatKhau, 10);

  return await prisma.nguoidung.create({
    data: { ...rest, MatKhau: hashedPassword },
    select: {
      ID: true,
      TenDangNhap: true,
      HoTen: true,
      Email: true,
      TrangThai: true,
      roles: { select: { TenVaiTro: true } }
    }
  });
};
