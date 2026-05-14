import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// Parse text → tách text thường và URL
const parseLinks = (text) => {
  if (!text) return [{ type: "text", value: "" }];
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    parts.push({ type: "link", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });
  return parts.length > 0 ? parts : [{ type: "text", value: text }];
};

const MessageContent = ({ text }) => {
  const navigate = useNavigate();
  const parts = parseLinks(text);

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.type !== "link") return <span key={i}>{part.value}</span>;

        const isInternal = part.value.includes("localhost:3000") ||
          (typeof window !== "undefined" && part.value.includes(window.location.hostname));

        if (isInternal) {
          let pathname = part.value;
          try { pathname = new URL(part.value).pathname; } catch {}
          return (
            <button
              key={i}
              onClick={() => navigate(pathname)}
              className="inline-flex items-center gap-1 px-2.5 py-1 mx-0.5 my-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              🔗 {pathname}
            </button>
          );
        }

        return (
          <a key={i} href={part.value} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 mx-0.5 my-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors">
            🔗 {part.value}
          </a>
        );
      })}
    </span>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.LoaiNguoiGui === "User";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.NoiDung).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`flex items-end gap-2 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mb-0.5"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          AI
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-3 py-2 text-xs leading-relaxed shadow-sm ${
            isUser
              ? "text-white rounded-2xl rounded-br-sm"
              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
          }`}
          style={isUser ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}
        >
          <MessageContent text={message.NoiDung} />

          {/* Copy on hover */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-7 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200"
              title="Sao chép"
            >
              {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            </button>
          )}
        </div>

        <span className="text-[10px] text-gray-400 px-1">{formatTime(message.ThoiGian)}</span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
