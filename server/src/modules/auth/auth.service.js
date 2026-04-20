// server/src/modules/auth/auth.service.js
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ALL_ROLES } from "../../constants/roles.js";

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
      VaiTro: user.roles?.TenVaiTro || null,
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
  VaiTro: user.roles?.TenVaiTro || null,
  TrangThai: user.TrangThai,
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
  const { TenDangNhap, MatKhau, HoTen, Email, SoDienThoai } = userData;

  try {
    const existingUser = await prisma.nguoidung.findFirst({
      where: { OR: [{ TenDangNhap }, { Email }] }
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) throw new Error("Tên đăng nhập đã tồn tại");
      if (existingUser.Email === Email) throw new Error("Email đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(MatKhau, BCRYPT_ROUNDS);

    // RoleID mặc định = 2 (NguoiThue) — tuỳ theo seed data trong bảng roles
    const newUser = await prisma.nguoidung.create({
      data: {
        TenDangNhap,
        MatKhau: hashedPassword,
        HoTen,
        Email,
        SoDienThoai: SoDienThoai || null,
        TrangThai: "Active",
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