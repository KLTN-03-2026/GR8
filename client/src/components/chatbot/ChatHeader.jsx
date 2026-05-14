import { X, ChevronDown, Sparkles } from "lucide-react";

const ChatHeader = ({ isTyping, onClose, onMinimize }) => {
  return (
    <div
      className="flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)",
        borderRadius: "20px 20px 0 0",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar với glow */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-purple-500"
              style={{ background: "#22c55e" }}
            />
          </div>

          <div>
            <p className="text-white font-semibold text-sm leading-tight">SmartBot AI</p>
            <p className="text-purple-100 text-xs mt-0.5">
              {isTyping ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1 h-1 bg-purple-200 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </span>
                  Đang soạn...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Trực tuyến
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
            aria-label="Thu nhỏ"
          >
            <ChevronDown size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
            aria-label="Đóng"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Intro card - đã bỏ để tăng diện tích chat */}
    </div>
  );
};

export default ChatHeader;
