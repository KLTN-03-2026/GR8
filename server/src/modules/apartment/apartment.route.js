// server/src/modules/apartment/apartment.route.js
import express from "express";
import {
  getApartments,
  getApartmentDetail,
  createApartment,
  updateApartment,
  softDeleteApartment,
  bulkCreateRooms,
  uploadApartmentPhoto,
  clearApartmentPhoto,
  deleteApartmentPhotoItem,
  setApartmentFeaturedPhoto,
} from "./apartment.controller.js";

import { protect, authorize } from "../auth/auth.middleware.js";
import { validateBody, validateQuery } from "../../middleware/validate.middleware.js";
import { MAX_CANHO_PHOTOS_PER_REQUEST, uploadCanHoPhoto } from "../../middleware/cloudinary-upload.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  apartmentListQuerySchema,
  createApartmentSchema,
  updateApartmentSchema,
} from "./apartment.validation.js";

const router = express.Router();

// ==================== ROUTES PUBLIC (Ai cũng xem được) ====================
router.get("/", validateQuery(apartmentListQuerySchema), getApartments); // Xem danh sách căn hộ
router.get("/:id", getApartmentDetail);   // Xem chi tiết căn hộ - public, không cần đăng nhập

router.post(
  "/:id/photo",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  uploadCanHoPhoto.array("photos", MAX_CANHO_PHOTOS_PER_REQUEST),
  uploadApartmentPhoto
);

router.delete(
  "/:id/photo/:mediaId",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  deleteApartmentPhotoItem
);

router.patch(
  "/:id/photo/:mediaId/featured",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  setApartmentFeaturedPhoto
);

router.delete("/:id/photo", protect, authorize(ROLES.CHU_NHA, ROLES.QUAN_LY), clearApartmentPhoto);

// Chỉ người đã đăng nhập + có vai trò ChuNha hoặc QuanLy mới được tạo căn hộ
router.post(
  "/",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  validateBody(createApartmentSchema),
  createApartment
);

router.patch(
  "/:id",
  protect,
  authorize(ROLES.CHU_NHA, ROLES.QUAN_LY),
  validateBody(updateApartmentSchema),
  updateApartment
);

router.delete("/:id", protect, authorize(ROLES.CHU_NHA, ROLES.QUAN_LY), softDeleteApartment);

// Bulk create rooms from template
router.post("/bulk", protect, authorize(ROLES.CHU_NHA, ROLES.QUAN_LY), bulkCreateRooms);

export default router;