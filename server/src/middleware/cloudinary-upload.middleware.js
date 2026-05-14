import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageFileFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP"));
};

// ==================== CANHO UPLOAD ====================
export const CANHO_UPLOAD_SUBDIR = "canho";
const canhoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${CANHO_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadCanHoPhoto = multer({
  storage: canhoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const MAX_CANHO_PHOTOS_PER_REQUEST = 20;

// ==================== THONG BAO ====================
export const THONGBAO_UPLOAD_SUBDIR = "thongbao";
const thongbaoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${THONGBAO_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadThongBaoPhoto = multer({
  storage: thongbaoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const MAX_THONGBAO_PHOTOS_PER_REQUEST = 5;

// ==================== DONG HO (METER) UPLOAD ====================
export const DONGHO_UPLOAD_SUBDIR = "dongho";
const donghoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${DONGHO_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadDongHoPhoto = multer({
  storage: donghoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ==================== YEU CAU SU CO (INCIDENT) UPLOAD ====================
export const YEUCAUSUCO_UPLOAD_SUBDIR = "yeucausuco";
const yeucausucoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${YEUCAUSUCO_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadYeuCauSuCoPhoto = multer({
  storage: yeucausucoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const MAX_YEUCAUSUCO_PHOTOS_PER_REQUEST = 20;

// ==================== AVATAR UPLOAD ====================
export const AVATAR_UPLOAD_SUBDIR = "avatars";
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${AVATAR_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// ==================== CCCD UPLOAD ====================
export const CCCD_UPLOAD_SUBDIR = "cccd";
const cccdStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `apartment_management/${CCCD_UPLOAD_SUBDIR}`,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadCCCD = multer({
  storage: cccdStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
