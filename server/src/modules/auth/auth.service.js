// server/src/modules/auth/auth.service.js
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ALL_ROLES } from "../../constants/roles.js";
import { sendOtpEmail } from "../../config/mailer.js";
import { generateOtp, saveOtp, verifyOtp, deleteOtp } from "../../config/otpStore.js";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const PASSWORD_RESET_EXPIRES_IN_MINUTES = 15;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("Missing REFRESH_TOKEN_SECRET in environment variables");
}

const GENERIC_LOGIN_ERROR = "Thông tin đăng nhập không hợp lệ";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const now = () => new Date();

const signAccessToken = (user) =>
  jwt.sign(
    {
      ID: user.ID,
      TenDangNhap: user.TenDangNhap,
      Email: user.Email,
      VaiTro: user.roles?.TenVaiTro || user.VaiTro || null,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      ID: user.ID,
      tokenId: crypto.randomUUID(),
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d` }
  );

const getExpiresAt = () => {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expires;
};

const findUserById = (userId) =>
  prisma.nguoidung.findUnique({
    where: { ID: Number(userId) },
    include: { roles: { select: { TenVaiTro: true } } },
  });

const ensureUserActive = (user) => {
  if (!user) {
    const error = new Error(GENERIC_LOGIN_ERROR);
    error.statusCode = 401;
    throw error;
  }
  if (user.TrangThai !== "Active") {
    const error = new Error("Tài khoản không ở trạng thái hoạt động");
    error.statusCode = 403;
    throw error;
  }
  const userRole = user.roles?.TenVaiTro || null;
  if (!userRole || !ALL_ROLES.includes(userRole)) {
    const error = new Error("Tài khoản chưa được gán vai trò hợp lệ");
    error.statusCode = 403;
    throw error;
  }
};

const createRefreshTokenRecord = async ({ userId, refreshToken, req }) => {
  const tokenHash = hashToken(refreshToken);
  return prisma.refreshtokens.create({
    data: {
      UserID: userId,
      Token: tokenHash,
      ExpiresAt: getExpiresAt(),
      IPAddress: req.ip || null,
      UserAgent: req.get("user-agent") || null,
    },
  });
};

const sanitizeUser = (user) => ({
  ID: user.ID,
  TenDangNhap: user.TenDangNhap,
  HoTen: user.HoTen,
  Email: user.Email,
  SoDienThoai: user.SoDienThoai || null,
  CCCD: user.CCCD || null,
  NgaySinh: user.NgaySinh || null,
  DiaChi: user.DiaChi || null,
  GioiTinh: user.GioiTinh || null,
  Avatar: user.Avatar || null,
  VaiTro: user.roles?.TenVaiTro || null,
  TrangThai: user.TrangThai,
  NgayTao: user.NgayTao || null,
  isGoogleUser: user.MatKhau === "",
});

const revokeAllActiveTokensByUser = async (userId) => {
  await prisma.refreshtokens.updateMany({
    where: {
      UserID: Number(userId),
      RevokedAt: null,
      ExpiresAt: { gt: now() },
    },
    data: {
      RevokedAt: now(),
    },
  });
};

const cleanupExpiredTokensByUser = async (userId) => {
  await prisma.refreshtokens.deleteMany({
    where: {
      UserID: Number(userId),
      ExpiresAt: { lte: now() },
    },
  });
};

const cleanupExpiredPasswordResetTokensByUser = async (userId) => {
  await prisma.passwordresettokens.deleteMany({
    where: {
      UserID: Number(userId),
      ExpiresAt: { lte: now() },
    },
  });
};

export const registerUser = async (userData) => {
  const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, RoleID } = userData;

  try {
    const existingUser = await prisma.nguoidung.findFirst({
      where: { OR: [{ TenDangNhap }, { Email }] }
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) throw new Error("Tên đăng nhập đã tồn tại");
      if (existingUser.Email === Email) throw new Error("Email đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(MatKhau, BCRYPT_ROUNDS);

    // Get default role (NguoiThue hoặc KhachVangLai) nếu không có RoleID
    let finalRoleID = RoleID;
    if (!finalRoleID) {
      const defaultRole = await prisma.roles.findFirst({
        where: { TenVaiTro: { in: ["NguoiThue", "KhachVangLai"] } },
        orderBy: { ID: "asc" },
      });
      if (!defaultRole) {
        // Tự tạo role KhachVangLai nếu chưa có
        const newRole = await prisma.roles.create({
          data: { TenVaiTro: "KhachVangLai", MoTa: "Khách vãng lai" },
        });
        finalRoleID = newRole.ID;
      } else {
        finalRoleID = defaultRole.ID;
      }
    }

    const newUser = await prisma.nguoidung.create({
      data: {
        TenDangNhap,
        MatKhau: hashedPassword,
        HoTen,
        Email,
        SoDienThoai: SoDienThoai || null,
        TrangThai: "Active",
        RoleID: Number(finalRoleID),
      },
      include: { roles: { select: { TenVaiTro: true } } }
    });

    const { MatKhau: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;

  } catch (error) {
    if (error.code === 'P2002') {
      const target = JSON.stringify(error.meta?.target || '');
      if (target.includes('TenDangNhap')) throw new Error("Tên đăng nhập đã tồn tại");
      if (target.includes('Email')) throw new Error("Email đã được sử dụng");
      if (target.includes('SoDienThoai')) throw new Error("Số điện thoại đã được sử dụng");
      throw new Error("Dữ liệu đã tồn tại trong hệ thống");
    }
    throw error;
  }
};

export const loginUser = async (TenDangNhapOrEmail, MatKhau) => {
  const user = await prisma.nguoidung.findFirst({
    where: {
      OR: [
        { TenDangNhap: TenDangNhapOrEmail },
        { Email: TenDangNhapOrEmail }
      ]
    },
    include: { roles: { select: { TenVaiTro: true } } }
  });

  if (!user) {
    const error = new Error(GENERIC_LOGIN_ERROR);
    error.statusCode = 401;
    throw error;
  }

  if (user.TrangThai !== "Active") {
    const error = new Error("Tài khoản không ở trạng thái hoạt động");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(MatKhau, user.MatKhau || "");
  if (!isMatch) {
    const error = new Error(GENERIC_LOGIN_ERROR);
    error.statusCode = 401;
    throw error;
  }

  return user;
};

export const issueAuthTokens = async (user, req) => {
  await cleanupExpiredTokensByUser(user.ID);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const refreshTokenRecord = await createRefreshTokenRecord({
    userId: user.ID,
    refreshToken,
    req,
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenId: refreshTokenRecord.ID,
    user: sanitizeUser(user),
  };
};

export const refreshAccessToken = async (refreshToken, req) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch {
    const error = new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    error.statusCode = 401;
    throw error;
  }

  if (decoded.type !== "refresh") {
    const error = new Error("Refresh token không hợp lệ");
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(refreshToken);
  const existingToken = await prisma.refreshtokens.findFirst({
    where: { Token: tokenHash },
  });

  if (!existingToken || Number(existingToken.UserID) !== Number(decoded.ID)) {
    await revokeAllActiveTokensByUser(decoded.ID);
    const error = new Error("Refresh token không tồn tại");
    error.statusCode = 401;
    throw error;
  }

  if (existingToken.RevokedAt) {
    await revokeAllActiveTokensByUser(decoded.ID);
    const error = new Error("Refresh token đã bị thu hồi");
    error.statusCode = 401;
    throw error;
  }

  if (new Date(existingToken.ExpiresAt) < new Date()) {
    await prisma.refreshtokens.update({
      where: { ID: existingToken.ID },
      data: { RevokedAt: now() },
    });
    const error = new Error("Refresh token đã hết hạn");
    error.statusCode = 401;
    throw error;
  }

  const user = await findUserById(decoded.ID);
  ensureUserActive(user);
  await cleanupExpiredTokensByUser(user.ID);

  const newRefreshToken = signRefreshToken(user);
  const newTokenHash = hashToken(newRefreshToken);
  const revokedAt = now();

  await prisma.$transaction([
    prisma.refreshtokens.update({
      where: { ID: existingToken.ID },
      data: {
        RevokedAt: revokedAt,
        ReplacedByToken: newTokenHash,
      },
    }),
    prisma.refreshtokens.create({
      data: {
        UserID: user.ID,
        Token: newTokenHash,
        ExpiresAt: getExpiresAt(),
        IPAddress: req.ip || null,
        UserAgent: req.get("user-agent") || null,
      },
    }),
  ]);

  return {
    accessToken: signAccessToken(user),
    refreshToken: newRefreshToken,
    user: sanitizeUser(user),
  };
};

export const revokeRefreshToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch {
    const error = new Error("Refresh token không hợp lệ");
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(refreshToken);
  const existingToken = await prisma.refreshtokens.findFirst({
    where: { Token: tokenHash },
  });

  if (!existingToken || Number(existingToken.UserID) !== Number(decoded.ID) || existingToken.RevokedAt) {
    return { revoked: false };
  }

  await prisma.refreshtokens.update({
    where: { ID: existingToken.ID },
    data: { RevokedAt: now() },
  });

  return { revoked: true };
};

export const revokeAllUserRefreshTokens = async (userId) => {
  const result = await prisma.refreshtokens.updateMany({
    where: {
      UserID: Number(userId),
      RevokedAt: null,
      ExpiresAt: { gt: now() },
    },
    data: {
      RevokedAt: now(),
    },
  });

  return { revokedCount: result.count };
};

export const getCurrentUserProfile = async (userId) => {
  const user = await findUserById(userId);
  ensureUserActive(user);
  return sanitizeUser(user);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.nguoidung.findUnique({
    where: { ID: Number(userId) },
    include: { roles: { select: { TenVaiTro: true } } },
  });
  ensureUserActive(user);

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.MatKhau || "");
  if (!isOldPasswordValid) {
    const error = new Error("Mật khẩu cũ không chính xác");
    error.statusCode = 400;
    throw error;
  }

  const isSameAsCurrent = await bcrypt.compare(newPassword, user.MatKhau || "");
  if (isSameAsCurrent) {
    const error = new Error("Mật khẩu mới phải khác mật khẩu cũ");
    error.statusCode = 400;
    throw error;
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.nguoidung.update({
      where: { ID: Number(userId) },
      data: { MatKhau: hashedNewPassword },
    }),
    prisma.refreshtokens.updateMany({
      where: {
        UserID: Number(userId),
        RevokedAt: null,
        ExpiresAt: { gt: now() },
      },
      data: { RevokedAt: now() },
    }),
  ]);

  return { message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." };
};

export const createForgotPasswordToken = async (email) => {
  const user = await prisma.nguoidung.findUnique({
    where: { Email: String(email).trim() },
  });

  if (!user || user.TrangThai !== "Active") {
    return {
      message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
    };
  }

  await cleanupExpiredPasswordResetTokensByUser(user.ID);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(now().getTime() + PASSWORD_RESET_EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.passwordresettokens.create({
    data: {
      UserID: user.ID,
      Token: tokenHash,
      ExpiresAt: expiresAt,
    },
  });

  return {
    message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
    mockResetToken: rawToken,
    expiresAt,
  };
};

// ============================================================
// OTP REGISTRATION
// ============================================================

export const sendRegistrationOtp = async (userData) => {
  const { TenDangNhap, Email, MatKhau, HoTen, SoDienThoai } = userData;

  // Kiểm tra trùng trước khi gửi OTP
  const existing = await prisma.nguoidung.findFirst({
    where: { OR: [{ TenDangNhap }, { Email }] },
  });
  if (existing) {
    if (existing.TenDangNhap === TenDangNhap) throw Object.assign(new Error("Tên đăng nhập đã tồn tại"), { statusCode: 409 });
    if (existing.Email === Email) throw Object.assign(new Error("Email đã được sử dụng"), { statusCode: 409 });
  }

  const otp = generateOtp();
  saveOtp(Email, otp, userData);

  try {
    await sendOtpEmail(Email, otp);
  } catch (mailError) {
    console.error("❌ Gửi email OTP thất bại:", mailError.message, mailError.stack);
    deleteOtp(Email);
    throw Object.assign(new Error(`Không thể gửi email OTP: ${mailError.message}`), { statusCode: 500 });
  }

  return { message: `Mã OTP đã được gửi đến ${Email}` };
};

export const verifyOtpAndRegister = async (email, inputOtp) => {
  const result = verifyOtp(email, inputOtp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason), { statusCode: 400 });
  }

  const { userData } = result;
  
  // Validate userData has all required fields
  if (!userData || !userData.TenDangNhap || !userData.MatKhau || !userData.HoTen || !userData.Email) {
    throw Object.assign(new Error("Dữ liệu đăng ký không đầy đủ. Vui lòng thử lại."), { statusCode: 400 });
  }

  deleteOtp(email);

  // Tạo tài khoản
  try {
    const newUser = await registerUser(userData);
    return newUser;
  } catch (error) {
    console.error("❌ Lỗi khi tạo tài khoản:", error);
    // Re-throw với thông báo rõ ràng hơn
    if (error.message) {
      throw Object.assign(new Error(error.message), { statusCode: error.statusCode || 500 });
    }
    throw Object.assign(new Error("Không thể tạo tài khoản. Vui lòng thử lại."), { statusCode: 500 });
  }
};

// ============================================================
// FORGOT PASSWORD VIA OTP
// ============================================================

export const sendForgotPasswordOtp = async (email) => {
  const user = await prisma.nguoidung.findUnique({
    where: { Email: String(email).trim() },
  });

  // Không tiết lộ email có tồn tại hay không (bảo mật)
  if (!user || user.TrangThai !== "Active" || user.MatKhau === "") {
    return { message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi." };
  }

  const otp = generateOtp();
  saveOtp(`reset_${email}`, otp, { email, userID: user.ID });

  try {
    await sendOtpEmail(email, otp, "reset");
  } catch (mailError) {
    deleteOtp(`reset_${email}`);
    console.error("❌ Gửi email OTP reset thất bại:", mailError.message);
    throw Object.assign(new Error("Không thể gửi email. Vui lòng thử lại."), { statusCode: 500 });
  }

  return { message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi." };
};

export const verifyForgotPasswordOtp = async (email, inputOtp) => {
  const result = verifyOtp(`reset_${email}`, inputOtp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason), { statusCode: 400 });
  }
  // OTP đúng — trả về token tạm để bước tiếp theo dùng (không xóa OTP vội)
  return { message: "OTP hợp lệ", verified: true };
};

export const resetPasswordWithOtp = async (email, inputOtp, newPassword) => {
  const result = verifyOtp(`reset_${email}`, inputOtp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason), { statusCode: 400 });
  }

  const { userID } = result.userData;
  deleteOtp(`reset_${email}`);

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.nguoidung.update({
      where: { ID: userID },
      data: { MatKhau: hashedPassword },
    }),
    // Thu hồi tất cả refresh token cũ
    prisma.refreshtokens.updateMany({
      where: { UserID: userID, RevokedAt: null },
      data: { RevokedAt: now() },
    }),
  ]);

  return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
};
