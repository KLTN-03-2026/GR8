import { z } from "zod";

export const registerSchema = z.object({
  TenDangNhap: z.string().trim().min(3).max(50),
  MatKhau: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100)
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số"),
  HoTen: z.string().trim().min(2).max(100),
  Email: z.string().trim().email(),
  SoDienThoai: z.string().trim().min(8).max(20).optional(),
});

export const loginSchema = z.object({
  TenDangNhapOrEmail: z.string().trim().min(3),
  MatKhau: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .max(100)
      .regex(/[A-Z]/, "Mật khẩu mới phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu mới phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu mới phải có ít nhất 1 chữ số"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu cũ",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  Email: z.string().trim().email("Email không hợp lệ"),
});

