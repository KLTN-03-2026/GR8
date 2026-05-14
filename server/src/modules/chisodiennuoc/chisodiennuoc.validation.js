import { z } from "zod";

// HTML input type="month" trả về YYYY-MM (VD: 2026-04)
const thangNamRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

// ==================== SCHEMAS ====================

export const createChiSoDienNuocSchema = z.object({
  CanHoID: z.coerce.number().int().positive("CanHoID phải là số nguyên dương > 0"),
  ThangNam: z
    .string()
    .trim()
    .regex(thangNamRegex, "ThangNam phải đúng định dạng YYYY-MM (VD: 2026-04)"),
  // Cho phép ghi riêng điện hoặc nước — ít nhất 1 trong 2 phải có
  ChiSoDienMoi: z.coerce.number().nonnegative("Chỉ số điện mới phải >= 0").optional(),
  ChiSoNuocMoi: z.coerce.number().nonnegative("Chỉ số nước mới phải >= 0").optional(),
  AnhDongHoDien: z.string().optional(),
  AnhDongHoNuoc: z.string().optional(),
}).refine(
  (d) => d.ChiSoDienMoi !== undefined || d.ChiSoNuocMoi !== undefined,
  { message: "Phải nhập ít nhất chỉ số điện hoặc chỉ số nước" }
);

export const updateChiSoDienNuocSchema = z
  .object({
    ChiSoDienMoi: z.coerce.number().nonnegative("Chỉ số điện mới phải >= 0").optional(),
    ChiSoNuocMoi: z.coerce.number().nonnegative("Chỉ số nước mới phải >= 0").optional(),
    AnhDongHoDien: z.string().optional(),
    AnhDongHoNuoc: z.string().optional(),
  })
  .refine(
    (data) => data.ChiSoDienMoi !== undefined || data.ChiSoNuocMoi !== undefined,
    {
      message: "Cần cung cấp ít nhất một trường để cập nhật",
    }
  );

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID phải là số nguyên dương > 0"),
});

export const queryFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).optional().default(20),
  CanHoID: z.coerce.number().int().positive().optional(),
  ThangNam: z
    .string()
    .trim()
    .regex(thangNamRegex, "ThangNam phải đúng định dạng YYYY-MM")
    .optional(),
  TrangThai: z.string().optional(),
});

// ==================== MIDDLEWARE ====================

/**
 * Middleware validate chung bằng Zod
 * @param {z.ZodSchema} schema - Zod Schema dùng để validate
 * @param {"body" | "params" | "query"} source - Nguồn dữ liệu từ request cần validate
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const parsedData = schema.parse(req[source]);
      // req.query là getter-only, dùng Object.assign thay vì gán trực tiếp
      if (source === "query" || source === "params") {
        Object.assign(req[source], parsedData);
      } else {
        req[source] = parsedData;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        const customError = new Error(`Dữ liệu không hợp lệ - ${errorMessages}`);
        customError.statusCode = 400;
        return next(customError);
      }
      next(error);
    }
  };
};