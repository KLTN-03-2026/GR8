// Tin nhan he thong routes
// Chat trực tiếp giữa NguoiThue và QuanLy/NhanVien

import express from "express";
import { protect, authorize } from "../auth/auth.middleware.js";
import * as controller from "./tinnhanhethong.controller.js";

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

// Đếm tin nhắn chưa đọc (tất cả role)
router.get("/unread-count", controller.getUnreadCount);

// Admin/QuanLy: xem danh sách tất cả cuộc hội thoại
router.get(
  "/conversations",
  authorize("QuanLy", "NhanVienKyThuat", "KeToan"),
  controller.getConversations
);

// Người thuê / khách vãng lai: xem cuộc hội thoại của mình
router.get(
  "/my-conversation",
  authorize("NguoiThue", "ChuNha", "KhachVangLai"),
  controller.getMyConversation
);

// Lấy tin nhắn theo convId (= tenantId)
router.get("/:convId/messages", controller.getMessages);

// Gửi tin nhắn (tất cả role đã đăng nhập)
router.post("/send", controller.sendMessage);

export default router;
