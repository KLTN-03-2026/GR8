import { ZodError } from "zod";

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const globalErrorHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Dữ liệu bị trùng lặp",
    });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? "Đã có lỗi xảy ra trên hệ thống" : error.message;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { details: error.details } : {}),
  });
};
