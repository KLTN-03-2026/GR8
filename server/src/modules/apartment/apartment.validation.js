import { z } from "zod";

export const apartmentStatusEnum = z.enum(["Trong", "DaThue", "BaoTri", "DangDon"]);

export const apartmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  ToaNhaID: z.coerce.number().int().positive().optional(),
  TrangThai: apartmentStatusEnum.optional(),
  minGia: z.coerce.number().nonnegative().optional(),
  maxGia: z.coerce.number().nonnegative().optional(),
  search: z.string().trim().optional(),
});

export const apartmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createApartmentSchema = z.object({
  MaCanHo: z.string().trim().min(1).max(20),
  ToaNhaID: z.coerce.number().int().positive().optional(),
  Tang: z.coerce.number().int().min(0),
  SoPhong: z.string().trim().min(1).max(10),
  DienTich: z.coerce.number().positive().optional(),
  GiaThue: z.coerce.number().nonnegative(),
  TienCoc: z.coerce.number().nonnegative(),
  TrangThai: apartmentStatusEnum.optional(),
  MoTa: z.string().trim().max(2000).optional(),
});

export const updateApartmentSchema = createApartmentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Cần ít nhất một trường để cập nhật",
  }
);

