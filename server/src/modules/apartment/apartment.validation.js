import { z } from "zod";

export const apartmentStatusEnum = z.enum(["Trong", "DaThue", "BaoTri", "DangDon"]);

export const apartmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10), // Tăng max lên 1000
  ToaNhaID: z.coerce.number().int().positive().optional(),
  TrangThai: apartmentStatusEnum.optional(),
  minGia: z.coerce.number().nonnegative().optional(),
  maxGia: z.coerce.number().nonnegative().optional(),
  search: z.string().trim().optional(),
});

export const apartmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const apartmentPhotoParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  mediaId: z.coerce.number().int().positive(),
});

export const createApartmentSchema = z.object({
  MaCanHo: z.string().trim().min(1).max(20),
  ToaNhaID: z.coerce.number().int().positive().optional(),
  Tang: z.coerce.number().int().min(0),
  SoPhong: z.string().trim().min(1).max(10),
  DienTich: z.coerce.number().positive().optional(),
  GiaThue: z.coerce.number().nonnegative(),
  TienCoc: z.coerce.number().nonnegative(),
  GioiHanNguoiO: z.coerce.number().int().min(1).max(20).optional(),
  TrangThai: apartmentStatusEnum.optional(),
  MoTa: z.string().trim().max(2000).optional(),
  IsHot: z.boolean().optional(),
  AnhCanHo: z.union([z.string().trim().url(), z.literal("")]).optional(),
  // Ngày tính tiền riêng cho từng căn hộ (1-28)
  NgayTinhDien:    z.coerce.number().int().min(1).max(28).optional().nullable(),
  NgayTinhNuoc:    z.coerce.number().int().min(1).max(28).optional().nullable(),
  NgayTinhTienNha: z.coerce.number().int().min(1).max(28).optional().nullable(),
});

export const updateApartmentSchema = createApartmentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Cần ít nhất một trường để cập nhật",
  }
);

