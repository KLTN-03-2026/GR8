import { z } from "zod";

// Regex kiểm tra định dạng tháng năm MM-YYYY
const thangNamRegex = /^(0[1-9]|1[0-2])-\d{4}$/;

// ==================== SCHEMAS ====================

export const createChiSoDienNuocSchema = z.object({
  CanHoID: z.coerce.number().int().positive("CanHoID phải là số nguyên dương > 0"),
  ThangNam: z
    .string()
    .trim()
    .regex(thangNamRegex, "ThangNam phải đúng định dạng MM-YYYY (VD: 04-2026)"),
  ChiSoDienMoi: z.coerce.number().nonnegative("Chỉ số điện mới phải >= 0"),
  ChiSoNuocMoi: z.coerce.number().nonnegative("Chỉ số nước mới phải >= 0"),
  AnhDongHoDien: z.string().optional(),
  AnhDongHoNuoc: z.string().optional(),
});

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
      message: "Cần cung cấp ít nhất một trường để cập nhật (ChiSoDienMoi hoặc ChiSoNuocMoi)",
    }
  );

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID phải là số nguyên dương > 0"),
});

export const queryFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).optional().default(10),
  CanHoID: z.coerce.number().int().positive("CanHoID phải là số nguyên dương > 0").optional(),
  ThangNam: z
    .string()
    .trim()
    .regex(thangNamRegex, "ThangNam phải đúng định dạng MM-YYYY (VD: 04-2026)")
    .optional(),
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
      // Thực hiện parse và gán lại dữ liệu đã sanitize (coerced, default values...)
      const parsedData = schema.parse(req[source]);
      req[source] = parsedData;
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