import { z } from "zod";

const optionalString = (min = 1, max = 255) => z.string().trim().min(min).max(max).optional();

export const userPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserByAdminSchema = z
  .object({
    HoTen: optionalString(2, 100),
    Email: z.string().trim().email().optional(),
    SoDienThoai: optionalString(8, 20),
    DiaChi: optionalString(1, 255),
    Avatar: optionalString(1, 500),
    GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional(),
    TrangThai: z.enum(["Active", "Inactive", "Locked"]).optional(),
    RoleID: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  });

export const updateMyProfileSchema = z
  .object({
    HoTen: optionalString(2, 100),
    Email: z.string().trim().email().optional(),
    SoDienThoai: optionalString(8, 20),
    DiaChi: optionalString(1, 255),
    Avatar: optionalString(1, 500),
    GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  });

