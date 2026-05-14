import { ZodError } from "zod";

// Chuyển ZodError thành format chuẩn { field, message }
const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "general",
    message: issue.message,
  }));

export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return _res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: formatZodErrors(error),
      });
    }
    next(error);
  }
};

export const validateQuery = (schema) => (req, _res, next) => {
  try {
    const validated = schema.parse(req.query);
    Object.assign(req.query, validated);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return _res.status(400).json({
        success: false,
        message: "Query không hợp lệ",
        errors: formatZodErrors(error),
      });
    }
    next(error);
  }
};
