import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const FloatingButton = ({ isOpen, onClick, hasNewMsg }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => { const el = document.querySelector('.chatbot-label'); if(el) el.style.opacity = '1'; }}
      onMouseLeave={() => { const el = document.querySelector('.chatbot-label'); if(el) el.style.opacity = '0'; }}
    >
      {/* Label tooltip - chỉ hiện khi hover đúng vào nút */}
      {!isOpen && (
        <div className="chatbot-label" style={{
          position: 'absolute',
          right: '56px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(30,30,50,0.85)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}>
          Trợ lý AI
        </div>
      )}
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="relative w-11 h-11 rounded-full flex items-center justify-center focus:outline-none"
      style={{
        background: isOpen
          ? "#1a1a2e"
          : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        boxShadow: isOpen
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 8px 30px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.2)",
      }}
      aria-label={isOpen ? "Đóng chat" : "Mở chat hỗ trợ"}
    >
      {/* Pulse ring */}
      {!isOpen && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(139,92,246,0.4)" }}
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isOpen ? "x" : "msg"}
          initial={{ rotate: -80, opacity: 0, scale: 0.4 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 80, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="text-white"
        >
          {isOpen
            ? <X size={20} strokeWidth={2.5} />
            : <MessageCircle size={22} strokeWidth={1.8} fill="rgba(255,255,255,0.15)" />
          }
        </motion.span>
      </AnimatePresence>

      {/* Unread badge */}
      <AnimatePresence>
        {hasNewMsg && !isOpen && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
          >
            <span className="text-white text-[9px] font-bold">1</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
    </div>
  );
};

export default FloatingButton;
