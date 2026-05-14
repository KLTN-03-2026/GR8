// Tin nhan he thong controller
// Chat trực tiếp giữa NguoiThue và QuanLy/NhanVien

import * as service from "./tinnhanhethong.service.js";

/**
 * GET /api/tinnhanhethong/conversations
 * Admin xem danh sách tất cả cuộc hội thoại
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await service.getConversations();
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("❌ getConversations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/tinnhanhethong/my-conversation
 * Người thuê xem cuộc hội thoại của mình
 */
export const getMyConversation = async (req, res) => {
  try {
    const userId = req.user.ID;
    const conversation = await service.getMyConversation(userId);
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("❌ getMyConversation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/tinnhanhethong/:convId/messages
 * Lấy tất cả tin nhắn trong cuộc hội thoại
 * convId = ID của người thuê
 */
export const getMessages = async (req, res) => {
  try {
    const { convId } = req.params;
    const requesterId = req.user.ID;
    const requesterRole = req.user.VaiTro;

    const messages = await service.getMessages(convId, requesterId, requesterRole);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ getMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/tinnhanhethong/send
 * Gửi tin nhắn
 * Body: { NoiDung, CuocHoiThoaiID? } (CuocHoiThoaiID chỉ cần khi admin gửi)
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.ID;
    const senderRole = req.user.VaiTro;

    const message = await service.sendMessage(senderId, senderRole, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    const status = error.message.includes("không tồn tại") ? 404
      : error.message.includes("Thiếu") || error.message.includes("trống") ? 400
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/tinnhanhethong/unread-count
 * Đếm tin nhắn chưa đọc (dùng cho badge)
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.VaiTro;

    const result = await service.getUnreadCount(userId, userRole);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ getUnreadCount error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
