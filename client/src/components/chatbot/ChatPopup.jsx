import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const popupVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transformOrigin: "bottom right",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transformOrigin: "bottom right",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transformOrigin: "bottom right",
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const ChatPopup = ({
  messages,
  isTyping,
  input,
  onInputChange,
  onSend,
  onClose,
  onMinimize,
  onQuickSend,
  isGuest,
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={popupVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col overflow-hidden"
      style={{
        width: "clamp(300px, 85vw, 340px)",
        height: "clamp(420px, 60vh, 500px)",
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(99,102,241,0.1), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      <ChatHeader
        isTyping={isTyping}
        onClose={onClose}
        onMinimize={onMinimize}
      />

      <ChatMessages
        messages={messages}
        isTyping={isTyping}
        onQuickSend={onQuickSend}
      />

      {/* Nếu chưa đăng nhập → hiện nút đăng nhập thay input */}
      {isGuest ? (
        <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-white border-t border-gray-100">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            🔐 Đăng nhập để chat
          </button>
        </div>
      ) : (
        <ChatInput
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          disabled={isTyping}
        />
      )}
    </motion.div>
  );
};

export default ChatPopup;
