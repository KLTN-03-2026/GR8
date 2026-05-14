// server/src/modules/auth/auth.controller.js
import * as authService from "./auth.service.js";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);
const isProduction = process.env.NODE_ENV === "production";

const buildRefreshCookieOptions = () => {
  const maxAge = REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge,
  };
};

const getRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

// Đăng ký tài khoản
export const register = async (req, res, next) => {
  try {
    const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, RoleID } = req.body;

    const newUser = await authService.registerUser({
      TenDangNhap,
      MatKhau,
      HoTen,
      Email,
      SoDienThoai,
      RoleID
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: newUser
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
export const login = async (req, res, next) => {
  try {
    const { TenDangNhapOrEmail, MatKhau } = req.body;

    const user = await authService.loginUser(TenDangNhapOrEmail, MatKhau);
    const authData = await authService.issueAuthTokens(user, req);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, authData.refreshToken, buildRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: authData.user,
        accessToken: authData.accessToken
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    if (!refreshTokenValue) return res.status(401).json({ success: false, message: "Thiếu refresh token" });

    const authData = await authService.refreshAccessToken(refreshTokenValue, req);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, authData.refreshToken, buildRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Làm mới token thành công",
      data: {
        user: authData.user,
        accessToken: authData.accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    if (!refreshTokenValue) return res.status(200).json({ success: true, message: "Đăng xuất thành công" });

    const result = await authService.revokeRefreshToken(refreshTokenValue);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, buildRefreshCookieOptions());
    return res.status(200).json({
      success: true,
      message: result.revoked ? "Đăng xuất thành công" : "Token đã được thu hồi trước đó",
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const result = await authService.revokeAllUserRefreshTokens(req.user.ID);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, buildRefreshCookieOptions());
    return res.status(200).json({
      success: true,
      message: "Đã thu hồi tất cả phiên đăng nhập",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const data = await authService.getCurrentUserProfile(req.user.ID);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.ID, oldPassword, newPassword);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, buildRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { Email } = req.body;
    const result = await authService.createForgotPasswordToken(Email);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        mockResetToken: result.mockResetToken || null,
        expiresAt: result.expiresAt || null,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Google OAuth callback — redirect về FE kèm token
export const googleCallback = async (req, res, next) => {
  try {
    const user = req.user; // đã được passport gắn vào
    const authData = await authService.issueAuthTokens(user, req);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, authData.refreshToken, buildRefreshCookieOptions());

    // Redirect về FE kèm accessToken và thông tin user qua query string
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      token: authData.accessToken,
      user: JSON.stringify(authData.user),
    });

    res.redirect(`${clientUrl}/auth/google/callback?${params.toString()}`);
  } catch (error) {
    next(error);
  }
};

// Gửi OTP đăng ký
export const sendOtp = async (req, res, next) => {
  try {
    const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai } = req.body;
    const result = await authService.sendRegistrationOtp({ TenDangNhap, MatKhau, HoTen, Email, SoDienThoai });
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Xác thực OTP và hoàn tất đăng ký
export const verifyOtp = async (req, res, next) => {
  try {
    const { Email, Otp } = req.body;
    const newUser = await authService.verifyOtpAndRegister(Email, Otp);
    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// Bước 1: Gửi OTP quên mật khẩu
export const sendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { Email } = req.body;
    const result = await authService.sendForgotPasswordOtp(Email);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// Bước 2: Xác thực OTP
export const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { Email, Otp } = req.body;
    const result = await authService.verifyForgotPasswordOtp(Email, Otp);
    return res.status(200).json({ success: true, message: result.message, verified: true });
  } catch (error) {
    next(error);
  }
};

// Bước 3: Đặt mật khẩu mới
export const resetPassword = async (req, res, next) => {
  try {
    const { Email, Otp, NewPassword } = req.body;
    const result = await authService.resetPasswordWithOtp(Email, Otp, NewPassword);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
