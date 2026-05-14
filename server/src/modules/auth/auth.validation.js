import { z } from "zod";

// ─── Reusable rules ───────────────────────────────────────────────────────────

const usernameSchema = z
  .string({ required_error: "Vui lòng nhập tên đăng nhập" })
  .trim()
  .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
  .max(20, "Tên đăng nhập không được vượt quá 20 ký tự")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_)"
  );

const emailSchema = z
  .string({ required_error: "Vui lòng nhập email" })
  .trim()
  .min(1, "Vui lòng nhập email")
  .email("Email không đúng định dạng")
  .max(100, "Email không được vượt quá 100 ký tự");

const passwordSchema = z
  .string({ required_error: "Vui lòng nhập mật khẩu" })
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(100, "Mật khẩu không được vượt quá 100 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)")
  .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$...)");

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    TenDangNhap: usernameSchema,
    MatKhau: passwordSchema,
    HoTen: z
      .string({ required_error: "Vui lòng nhập họ và tên" })
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự"),
    Email: emailSchema,
    SoDienThoai: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{8,20}$/, "Số điện thoại không hợp lệ")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Mật khẩu không được giống username
    if (
      data.MatKhau &&
      data.TenDangNhap &&
      data.MatKhau.toLowerCase().includes(data.TenDangNhap.toLowerCase())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MatKhau"],
        message: "Mật khẩu không được chứa tên đăng nhập",
      });
    }
    // Mật khẩu không được giống email
    if (
      data.MatKhau &&
      data.Email &&
      data.MatKhau.toLowerCase().includes(data.Email.split("@")[0].toLowerCase())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MatKhau"],
        message: "Mật khẩu không được chứa phần tên trong email",
      });
    }
  });

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  TenDangNhapOrEmail: z
    .string({ required_error: "Vui lòng nhập tên đăng nhập hoặc email" })
    .trim()
    .min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
  MatKhau: z
    .string({ required_error: "Vui lòng nhập mật khẩu" })
    .min(1, "Vui lòng nhập mật khẩu"),
});

// ─── Change password ──────────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Vui lòng nhập mật khẩu cũ" })
      .min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: passwordSchema,
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu cũ",
    path: ["newPassword"],
  });

// ─── Forgot password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  Email: emailSchema,
});
