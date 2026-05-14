import { ZodError } from "zod";

export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // [{ field, message }]
  }
}

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Không tìm thấy: ${req.method} ${req.originalUrl}`, 404));
};

export const globalErrorHandler = (error, _req, res, _next) => {
  const isDev = process.env.NODE_ENV !== "production";

  // Log đầy đủ ở server, không bao giờ gửi stack ra client
  console.error("🔴 ERROR:", {
    message: error.message,
    code: error.code,
    ...(isDev ? { stack: error.stack } : {}),
  });

  // ── Zod validation error ──────────────────────────────────────────────────
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: error.issues.map((i) => ({
        field: i.path.join(".") || "general",
        message: i.message,
      })),
    });
  }

  // ── Prisma unique constraint ──────────────────────────────────────────────
  if (error?.code === "P2002") {
    const target = JSON.stringify(error.meta?.target || "");
    let field = "general";
    let message = "Dữ liệu đã tồn tại trong hệ thống";
    if (target.includes("Email")) { field = "Email"; message = "Email này đã được sử dụng"; }
    else if (target.includes("TenDangNhap")) { field = "TenDangNhap"; message = "Tên đăng nhập đã tồn tại"; }
    else if (target.includes("SoDienThoai")) { field = "SoDienThoai"; message = "Số điện thoại đã được sử dụng"; }
    else if (target.includes("CCCD")) { field = "CCCD"; message = "Số CCCD đã được sử dụng"; }

    return res.status(409).json({
      success: false,
      message,
      errors: [{ field, message }],
    });
  }

  // ── Multer ────────────────────────────────────────────────────────────────
  if (error.name === "MulterError") {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File vượt quá dung lượng cho phép (tối đa 5MB)"
        : "Lỗi upload file";
    return res.status(400).json({ success: false, message });
  }

  // ── AppError (lỗi nghiệp vụ có statusCode) ───────────────────────────────
  if (error instanceof AppError || error.statusCode) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
  }

  // ── Prisma errors khác ────────────────────────────────────────────────────
  if (error?.code?.startsWith("P")) {
    console.error("🗄️ Prisma error:", error.code);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra trên hệ thống",
    });
  }

  // ── Fallback 500 — không leak thông tin ───────────────────────────────────
  return res.status(500).json({
    success: false,
    message: "Đã có lỗi xảy ra trên hệ thống",
    ...(isDev ? { debug: error.message } : {}),
  });
};
