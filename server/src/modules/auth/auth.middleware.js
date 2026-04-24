// server/src/modules/auth/auth.middleware.js
import jwt from "jsonwebtoken";
import { ALL_ROLES } from "../../constants/roles.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

export const protect = async (req, res, next) => {
  try {
    let token;

    // Kiểm tra token có trong header không
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.ID) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Gắn thông tin user vào request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
    });
  }
};

// Middleware kiểm tra VaiTro (phân quyền)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.VaiTro) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập"
      });
    }

    if (!ALL_ROLES.includes(req.user.VaiTro)) {
      return res.status(403).json({
        success: false,
        message: "Vai trò không hợp lệ",
      });
    }

    if (!allowedRoles.includes(req.user.VaiTro)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Chỉ dành cho: ${allowedRoles.join(", ")}`
      });
    }

    next();
  };
};

// Alias for backward compatibility
export const authenticate = protect;