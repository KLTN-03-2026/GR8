import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Sparkles, Zap, FileText, AlertCircle, Home } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useNavigate } from "react-router-dom";

const QUICK_QUESTIONS = [
  { icon: Home,        text: "Căn hộ còn trống nào?" },
  { icon: FileText,    text: "Hóa đơn tháng này?" },
  { icon: AlertCircle, text: "Cách báo sự cố?" },
  { icon: Zap,         text: "Hướng dẫn thanh toán" },
];

const WelcomeScreen = ({ onQuickSend }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col px-3 py-3"
  >
    {/* Bot intro */}
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
      >
        <Sparkles size={18} className="text-white" />
      </div>
      <div>
        <p className="text-gray-800 font-semibold text-xs">Tôi có thể giúp gì cho bạn?</p>
        <p className="text-gray-400 text-xs mt-0.5">Chọn câu hỏi hoặc nhập bên dưới</p>
      </div>
    </div>

    {/* Quick questions */}
    <div className="flex flex-col gap-1.5">
      {QUICK_QUESTIONS.map(({ icon: Icon, text }) => (
        <button
          key={text}
          onClick={() => onQuickSend(text)}
          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <Icon size={13} className="text-indigo-500" />
          </div>
          <span className="text-gray-700 text-xs font-medium group-hover:text-indigo-700 transition-colors">{text}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

const ChatMessages = ({ messages, isTyping, onQuickSend }) => {
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3"
      style={{
        background: "#f8f9fb",
        scrollbarWidth: "thin",
        scrollbarColor: "#e5e7eb #f8f9fb",
      }}
    >
      {messages.length === 0 ? (
        <WelcomeScreen onQuickSend={onQuickSend} />
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) =>
            msg.isLoginPrompt ? (
              <motion.div
                key={msg.ID}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2"
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  AI
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[78%]">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{msg.NoiDung}</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    <LogIn size={13} />
                    Đăng nhập ngay
                  </button>
                </div>
              </motion.div>
            ) : (
              <MessageBubble key={msg.ID} message={msg} />
            )
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {isTyping && <TypingIndicator />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
