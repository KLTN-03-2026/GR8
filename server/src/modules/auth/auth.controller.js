// server/src/modules/auth/auth.controller.js
import * as authService from "./auth.service.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// Đăng ký tài khoản
export const register = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai } = req.body;

    // Validation cơ bản
    if (!TenDangNhap || !MatKhau || !HoTen || !Email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ: Tên đăng nhập, Mật khẩu, Họ tên, Email"
      });
    }

    const newUser = await authService.registerUser({
      TenDangNhap,
      MatKhau,
      HoTen,
      Email,
      SoDienThoai
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: newUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { TenDangNhapOrEmail, MatKhau } = req.body;

    if (!TenDangNhapOrEmail || !MatKhau) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên đăng nhập/email và mật khẩu"
      });
    }

    const user = await authService.loginUser(TenDangNhapOrEmail, MatKhau);

    // Tạo JWT token
    const token = jwt.sign(
      { 
        ID: user.ID,
        TenDangNhap: user.TenDangNhap,
        Email: user.Email,
        VaiTro: user.VaiTro 
      },
      JWT_SECRET,
      { expiresIn: "7d" }   // Token hết hạn sau 7 ngày
    );

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          ID: user.ID,
          HoTen: user.HoTen,
          Email: user.Email,
          VaiTro: user.VaiTro,
          TrangThai: user.TrangThai
        },
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};