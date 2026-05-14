import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== CANHO UPLOAD ====================
export const CANHO_UPLOAD_SUBDIR = "canho";
export const THONGBAO_UPLOAD_SUBDIR = "thongbao";
export const DONGHO_UPLOAD_SUBDIR = "dongho";
export const YEUCAUSUCO_UPLOAD_SUBDIR = "yeucausuco";
export const AVATAR_UPLOAD_SUBDIR = "avatars";
export const CCCD_UPLOAD_SUBDIR = "cccd";

const canhoUploadRoot = path.join(__dirname, "../../uploads", CANHO_UPLOAD_SUBDIR);
const thongbaoUploadRoot = path.join(__dirname, "../../uploads", THONGBAO_UPLOAD_SUBDIR);
const donghoUploadRoot = path.join(__dirname, "../../uploads", DONGHO_UPLOAD_SUBDIR);
const yeucausucoUploadRoot = path.join(__dirname, "../../uploads", YEUCAUSUCO_UPLOAD_SUBDIR);
const avatarUploadRoot = path.join(__dirname, "../../uploads", AVATAR_UPLOAD_SUBDIR);
const cccdUploadRoot = path.join(__dirname, "../../uploads", CCCD_UPLOAD_SUBDIR);

fs.mkdirSync(canhoUploadRoot, { recursive: true });
fs.mkdirSync(thongbaoUploadRoot, { recursive: true });
fs.mkdirSync(donghoUploadRoot, { recursive: true });
fs.mkdirSync(yeucausucoUploadRoot, { recursive: true });
fs.mkdirSync(avatarUploadRoot, { recursive: true });
fs.mkdirSync(cccdUploadRoot, { recursive: true });

const imageFileFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP"));
};

// ==================== CANHO ====================
const canhoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, canhoUploadRoot),
  filename: (req, file, cb) => {
    const id = req.params?.id ?? "x";
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    const rand = Math.random().toString(36).slice(2, 10);
    cb(null, `canho-${id}-${Date.now()}-${rand}${safeExt}`);
  },
});

export const uploadCanHoPhoto = multer({
  storage: canhoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/** Field name: `photos`, tối đa 20 ảnh mỗi lần */
export const MAX_CANHO_PHOTOS_PER_REQUEST = 20;

// ==================== THONG BAO ====================
const thongbaoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, thongbaoUploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    const rand = Math.random().toString(36).slice(2, 10);
    cb(null, `thongbao-${Date.now()}-${rand}${safeExt}`);
  },
});

export const uploadThongBaoPhoto = multer({
  storage: thongbaoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const MAX_THONGBAO_PHOTOS_PER_REQUEST = 5;

// ==================== DONG HO (METER) UPLOAD ====================
const donghoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, donghoUploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    const rand = Math.random().toString(36).slice(2, 10);
    cb(null, `dongho-${Date.now()}-${rand}${safeExt}`);
  },
});

export const uploadDongHoPhoto = multer({
  storage: donghoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cho ảnh đồng hồ
});

// ==================== YEU CAU SU CO (INCIDENT) UPLOAD ====================
const yeucausucoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, yeucausucoUploadRoot),
  filename: (req, file, cb) => {
    const id = req.params?.id ?? "x";
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    const rand = Math.random().toString(36).slice(2, 10);
    cb(null, `yeucausuco-${id}-${Date.now()}-${rand}${safeExt}`);
  },
});

export const uploadYeuCauSuCoPhoto = multer({
  storage: yeucausucoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const MAX_YEUCAUSUCO_PHOTOS_PER_REQUEST = 20;

// ==================== AVATAR UPLOAD ====================
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarUploadRoot),
  filename: (req, file, cb) => {
    const userId = req.user?.ID ?? "x";
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `avatar-${userId}-${Date.now()}${safeExt}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// ==================== CCCD UPLOAD ====================
const cccdStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cccdUploadRoot),
  filename: (req, file, cb) => {
    const userId = req.user?.ID ?? "x";
    const side = file.fieldname === "matTruoc" ? "front" : "back";
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `cccd-${userId}-${side}-${Date.now()}${safeExt}`);
  },
});

export const uploadCCCD = multer({
  storage: cccdStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
