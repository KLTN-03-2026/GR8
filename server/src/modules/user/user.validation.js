import { z } from "zod";

// ─── Reusable helpers ─────────────────────────────────────────────────────────

const optionalString = (min = 1, max = 255) =>
  z.string().trim().min(min).max(max).optional();

// Số điện thoại Việt Nam
const phoneVN = z
  .string()
  .trim()
  .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam")
  .optional()
  .or(z.literal(""));

// CCCD: đúng 12 chữ số
const cccdVN = z
  .string()
  .trim()
  .regex(/^[0-9]{12}$/, "CCCD phải gồm đúng 12 chữ số")
  .optional()
  .or(z.literal(""));

const parseISODate = (val) => {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const [y, m, day] = val.split("-").map(Number);
  if (d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) return null;
  return d;
};

const ngaySinhSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .superRefine((val, ctx) => {
    if (!val) return;
    const d = parseISODate(val);
    if (!d) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày sinh không hợp lệ" });
      return;
    }
    if (d > new Date()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày sinh không được là ngày tương lai" });
      return;
    }
    const today = new Date();
    const age = today.getFullYear() - d.getFullYear() -
      (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
    if (age < 14) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Người dùng phải từ 14 tuổi trở lên" });
    }
  });

const ngayCapCCCDSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .superRefine((val, ctx) => {
    if (!val) return;
    const d = parseISODate(val);
    if (!d) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày cấp CCCD không hợp lệ" });
      return;
    }
    if (d > new Date()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày cấp CCCD không được là ngày tương lai" });
    }
  });

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const userPaginationSchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(500).default(10), // 500 để load đủ danh sách
  search: z.string().trim().optional(),
  roles:  z.string().trim().optional(),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserByAdminSchema = z
  .object({
    HoTen:              optionalString(2, 100),
    Email:              z.string().trim().email("Email không hợp lệ").optional(),
    SoDienThoai:        phoneVN,
    DiaChi:             optionalString(1, 255),
    Avatar:             optionalString(1, 500),
    GioiTinh:           z.enum(["Nam", "Nu", "Khac"]).optional(),
    TrangThai:          z.enum(["Active", "Inactive", "Locked"]).optional(),
    RoleID:             z.coerce.number().int().positive().optional(),
    DaKhaiBaoNgoaiTru:  z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).filter(k => data[k] !== undefined).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  });

export const updateMyProfileSchema = z
  .object({
    HoTen:       optionalString(2, 100),
    Email:       z.string().trim().email("Email không hợp lệ").optional(),
    SoDienThoai: phoneVN,
    DiaChi:      optionalString(1, 255),
    Avatar:      optionalString(1, 500),
    GioiTinh:    z.enum(["Nam", "Nu", "Khac"]).optional(),
    NgaySinh:    ngaySinhSchema,
    CCCD:        cccdVN,
    NgayCapCCCD: ngayCapCCCDSchema,
    NoiCapCCCD:  optionalString(1, 255),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  });
