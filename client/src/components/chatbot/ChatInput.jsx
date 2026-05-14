import { useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const ChatInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-white border-t border-gray-100">
      <div
        className={`flex items-end gap-2 rounded-2xl px-3.5 py-2.5 border transition-all ${
          disabled
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-200 focus-within:border-indigo-400 focus-within:shadow-sm focus-within:shadow-indigo-100"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Đang xử lý..." : "Nhắn tin..."}
          rows={1}
          className="flex-1 bg-transparent text-gray-800 text-sm placeholder-gray-400 resize-none outline-none leading-relaxed py-0.5"
          style={{ maxHeight: 100, minHeight: 22 }}
          disabled={disabled}
        />

        <motion.button
          onClick={onSend}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.88 } : {}}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            canSend
              ? "text-white shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          style={canSend ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}
          aria-label="Gửi"
        >
          <ArrowUp size={15} strokeWidth={2.5} />
        </motion.button>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-1.5">
        Enter gửi · Shift+Enter xuống dòng
      </p>
    </div>
  );
};

export default ChatInput;
