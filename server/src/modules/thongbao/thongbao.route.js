import express from "express";
import * as thongbaoController from "./thongbao.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { uploadThongBaoPhoto, MAX_THONGBAO_PHOTOS_PER_REQUEST } from "../../middleware/cloudinary-upload.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", thongbaoController.getUserNotifications);
router.get("/unread-count", thongbaoController.getUnreadCount);
router.get("/system-requests", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), thongbaoController.getSystemRequests);
router.put("/read-all", thongbaoController.markAllAsRead);
router.put("/:id/read", thongbaoController.markAsRead);

router.post(
  "/",
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA, ROLES.KE_TOAN),
  uploadThongBaoPhoto.array("images", MAX_THONGBAO_PHOTOS_PER_REQUEST),
  thongbaoController.createNotification
);

router.put(
  "/:id",
  authorize(ROLES.QUAN_LY, ROLES.CHU_NHA),
  uploadThongBaoPhoto.array("images", MAX_THONGBAO_PHOTOS_PER_REQUEST),
  thongbaoController.updateNotification
);

router.delete("/:id", authorize(ROLES.QUAN_LY, ROLES.CHU_NHA), thongbaoController.deleteNotification);

export default router;
