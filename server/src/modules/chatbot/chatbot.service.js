/**
 * Chatbot Service — Orchestrator
 * Điều phối toàn bộ luồng: session → intent → role dispatch → AI → lưu DB
 *
 * Architecture:
 *   Controller → Service (orchestrator)
 *                  ├── intentClassifier  (phân tích câu hỏi)
 *                  ├── roleDispatcher    (query DB theo role)
 *                  └── Gemini AI         (tạo câu trả lời)
 */
import prisma from "../../config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyIntent } from "./core/intentClassifier.js";
import { dispatchContext, buildRoleSystemPrompt } from "./core/roleDispatcher.js";

// ─── Session management ───────────────────────────────────────────────────────
export const startOrGetSession = async (userId, sessionId) => {
  if (sessionId) {
    const session = await prisma.cuoctrochuyen.findUnique({
      where: { SessionID: sessionId },
    });
    if (session && session.NguoiDungID === Number(userId)) return session;
  }

  const newSessionId = `ss_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  return await prisma.cuoctrochuyen.create({
    data: { NguoiDungID: Number(userId), SessionID: newSessionId },
  });
};

// ─── AI Response ──────────────────────────────────────────────────────────────
const AI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

const getAIResponse = async (message, history, dbContext, role) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    if (dbContext) return `Dựa trên dữ liệu hệ thống:\n\n${dbContext}`;
    return "Tôi có thể giúp bạn về căn hộ, hóa đơn, thanh toán, sự cố. Bạn cần hỗ trợ gì?";
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const chatHistory = history.slice(-8).map((msg) => ({
    role: msg.LoaiNguoiGui === "User" ? "user" : "model",
    parts: [{ text: msg.NoiDung || "" }],
  }));

  const messageWithContext = dbContext
    ? `${message}\n\n[DỮ LIỆU HỆ THỐNG - dùng để trả lời chính xác]:\n${dbContext}`
    : message;

  // Thử lần lượt các model, fallback nếu 429
  for (const modelName of AI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildRoleSystemPrompt(role),
      });
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(messageWithContext);
      return result.response.text()?.trim() || "Xin lỗi, tôi chưa thể trả lời ngay. Vui lòng thử lại.";
    } catch (error) {
      const is429 = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Too Many Requests");
      if (is429) {
        console.warn(`[Chatbot] Model ${modelName} quota exceeded, trying next...`);
        continue; // thử model tiếp theo
      }
      // Lỗi khác → dừng luôn
      console.error(`❌ Gemini error (${modelName}):`, error.message);
      break;
    }
  }

  // Tất cả model đều fail → fallback
  if (dbContext) return `Dựa trên dữ liệu hệ thống:\n\n${dbContext}`;
  return "Xin lỗi, dịch vụ AI đang tạm gián đoạn. Vui lòng thử lại sau ít phút.";
};

// ─── Send message (main flow) ─────────────────────────────────────────────────
export const sendMessage = async (userId, sessionId, message, userRole) => {
  // 1. Lấy hoặc tạo session
  const session = await startOrGetSession(userId, sessionId);

  // 2. Lấy lịch sử hội thoại
  const history = await prisma.tinnhanchatbot.findMany({
    where: { CuocTroChuyenID: session.ID },
    orderBy: { ThoiGian: "asc" },
  });

  // 3. Lưu tin nhắn user
  await prisma.tinnhanchatbot.create({
    data: { CuocTroChuyenID: session.ID, LoaiNguoiGui: "User", NoiDung: message },
  });

  // 4. Phân tích intent
  const intents = classifyIntent(message);
  console.log(`[Chatbot] Role: ${userRole} | Intents: ${intents.join(", ")}`);

  // 5. Query DB theo role + intent
  const dbContext = await dispatchContext(userRole, intents, message, userId);

  // 6. Gọi AI với context
  const aiResponse = await getAIResponse(message, history, dbContext, userRole);

  // 7. Lưu tin nhắn AI
  const aiMessageRecord = await prisma.tinnhanchatbot.create({
    data: { CuocTroChuyenID: session.ID, LoaiNguoiGui: "AI", NoiDung: aiResponse },
  });

  return { sessionId: session.SessionID, reply: aiMessageRecord };
};

// ─── Get latest session of user ──────────────────────────────────────────────
export const getLatestSession = async (userId) => {
  return await prisma.cuoctrochuyen.findFirst({
    where: { NguoiDungID: Number(userId) },
    orderBy: { ID: "desc" },
  });
};

// ─── Get chat history ─────────────────────────────────────────────────────────
export const getChatHistory = async (userId, sessionId) => {
  const session = await prisma.cuoctrochuyen.findUnique({
    where: { SessionID: sessionId },
  });

  if (!session || session.NguoiDungID !== Number(userId)) {
    throw Object.assign(new Error("Không tìm thấy cuộc trò chuyện"), { statusCode: 404 });
  }

  return await prisma.tinnhanchatbot.findMany({
    where: { CuocTroChuyenID: session.ID },
    orderBy: { ThoiGian: "asc" },
  });
};
