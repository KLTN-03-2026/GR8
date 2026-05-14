import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FloatingButton from "./chatbot/FloatingButton";
import ChatPopup from "./chatbot/ChatPopup";
import { sendChatbotMessage, fetchChatHistory, fetchMySession } from "../services/chatbotService";
import { useAuth } from "../context/AuthContext";

const ChatbotWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem("chat_session_id") || ""
  );

  // Khi user đăng nhập mà không có sessionId → fetch session cũ từ server
  useEffect(() => {
    if (!user || sessionId) return;
    fetchMySession()
      .then((session) => {
        if (session?.SessionID) {
          localStorage.setItem("chat_session_id", session.SessionID);
          setSessionId(session.SessionID);
        }
      })
      .catch(() => {});
  }, [user]);

  // Load lịch sử khi mở lần đầu (chỉ khi đã đăng nhập và có sessionId)
  useEffect(() => {
    if (isOpen && user && sessionId && messages.length === 0) {
      fetchChatHistory(sessionId)
        .then((history) => {
          if (Array.isArray(history) && history.length > 0) {
            setMessages(history);
          }
        })
        .catch((err) => {
          // Session cũ không còn tồn tại → xóa đi
          if (err?.response?.status === 404 || err?.response?.status === 401) {
            localStorage.removeItem("chat_session_id");
            setSessionId("");
          }
        });
    }
    if (isOpen) setHasNewMsg(false);
  }, [isOpen]);

  // Đóng bằng Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    const handleToggle = () => setIsOpen(prev => !prev);
    
    window.addEventListener("keydown", handleKey);
    window.addEventListener("toggle-chatbot", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("toggle-chatbot", handleToggle);
    };
  }, [isOpen]);

  const handleSend = useCallback(
    async (text) => {
      // Chưa đăng nhập → redirect login
      if (!user) {
        navigate("/login");
        return;
      }

      // Guard: nếu text là Event object (click event) thì bỏ qua, dùng input state
      const msgText = (text && typeof text === 'string') ? text : input;
      const msg = msgText.trim();
      if (!msg) return;

      const userMsg = {
        ID: Date.now(),
        LoaiNguoiGui: "User",
        NoiDung: msg,
        ThoiGian: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const result = await sendChatbotMessage(sessionId, msg);
        const newSessionId = result.sessionId || sessionId;

        if (!sessionId && newSessionId) {
          localStorage.setItem("chat_session_id", newSessionId);
          setSessionId(newSessionId);
        }

        setMessages((prev) => [...prev, result.reply]);
        if (!isOpen) setHasNewMsg(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            ID: Date.now() + 1,
            LoaiNguoiGui: "Bot",
            NoiDung: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
            ThoiGian: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, sessionId, isOpen, user]
  );

  // Khi mở popup mà chưa đăng nhập → hiện thông báo trong chat
  const handleOpen = () => {
    setIsOpen((o) => !o);
    if (!isOpen && !user && messages.length === 0) {
      setMessages([{
        ID: "welcome-guest",
        LoaiNguoiGui: "Bot",
        NoiDung: "Xin chào! Vui lòng đăng nhập để sử dụng trợ lý AI. Nhấn vào đây để đăng nhập.",
        ThoiGian: new Date().toISOString(),
        isLoginPrompt: true,
      }]);
    }
  };
  return (
    <div
      className="fixed z-[9999] flex flex-col items-end gap-3"
      style={{ pointerEvents: "none", bottom: '152px', right: '24px' }}
    >
      {/* Chat Popup */}
      <div style={{ pointerEvents: "auto" }}>
        <AnimatePresence>
          {isOpen && (
            <ChatPopup
              messages={messages}
              isTyping={isTyping}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
              onQuickSend={handleSend}
              isGuest={!user}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floating Button */}
      <div style={{ pointerEvents: "auto" }}>
        <FloatingButton
          isOpen={isOpen}
          onClick={handleOpen}
          hasNewMsg={hasNewMsg}
        />
      </div>
    </div>
  );
};

export default ChatbotWidget;
