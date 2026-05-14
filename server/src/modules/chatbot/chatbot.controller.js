import * as chatbotService from "./chatbot.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    const userRole = req.user.VaiTro || null; // Lấy role từ JWT token
    const { sessionId, message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Tin nhắn không được để trống" });
    }

    const result = await chatbotService.sendMessage(userId, sessionId, message.trim(), userRole);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMySession = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    // Lấy session mới nhất của user
    const session = await chatbotService.getLatestSession(userId);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    const { sessionId } = req.params;

    const messages = await chatbotService.getChatHistory(userId, sessionId);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
