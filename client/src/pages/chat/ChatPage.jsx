// client/src/pages/chat/ChatPage.jsx
// Chat giữa Admin/QuanLy ↔ NguoiThue

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['QuanLy', 'NhanVienKyThuat', 'KeToan'];

// Avatar component dùng chung
const Avatar = ({ name = '?', size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const ChatPage = () => {
  const { user } = useAuth();
  const role = user?.roles?.TenVaiTro || user?.VaiTro;
  const isAdmin = ADMIN_ROLES.includes(role);

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const lastMsgIdRef = useRef(null); // track tin nhắn cuối để tránh scroll thừa

  // Lấy tên quản lý cuối cùng trả lời (dùng cho header phía người thuê)
  // LoaiNguoiGui = "Admin" khi backend xác định người gửi là admin
  const lastAdminReplier = messages
    .filter(m => m.LoaiNguoiGui === 'Admin')
    .slice(-1)[0]?.NguoiGui;

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/tinnhanhethong/conversations' : '/tinnhanhethong/my-conversation';
      const res = await axios.get(endpoint);
      const data = res.data.data || res.data || [];
      const list = Array.isArray(data) ? data : [data];
      setConversations(list);
      if (!isAdmin && list.length > 0 && !selectedConv) {
        setSelectedConv(list[0]);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedConv]);

  const fetchMessages = useCallback(async (convId, shouldScroll = false) => {
    try {
      const res = await axios.get(`/tinnhanhethong/${convId}/messages`);
      const data = res.data.data || res.data || [];
      const list = Array.isArray(data) ? data : [];

      setMessages(prev => {
        const newLastId = list[list.length - 1]?.ID;
        const prevLastId = prev[prev.length - 1]?.ID;

        // Chỉ scroll khi có tin mới hoặc lần đầu load
        if (newLastId !== prevLastId || shouldScroll) {
          lastMsgIdRef.current = newLastId;
          // dùng setTimeout để scroll sau khi DOM cập nhật
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: newLastId !== prevLastId ? 'smooth' : 'auto' });
          }, 50);
        }

        // Không update state nếu data không đổi (tránh re-render thừa)
        if (JSON.stringify(list.map(m => m.ID)) === JSON.stringify(prev.map(m => m.ID))) {
          return prev;
        }
        return list;
      });
    } catch (err) {
      console.error('[Chat] fetchMessages error:', err);
    }
  }, []);

  // Polling mỗi 5 giây để nhận tin nhắn mới
  useEffect(() => {
    const convId = selectedConv?.ID || selectedConv;
    if (!convId) return;

    // Lần đầu load: scroll xuống bottom
    fetchMessages(convId, true);

    pollRef.current = setInterval(() => {
      fetchMessages(convId, false); // poll: chỉ scroll nếu có tin mới
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [selectedConv, fetchMessages]);

  useEffect(() => { fetchConversations(); }, []);

  // Bỏ useEffect scroll cũ — đã xử lý trong fetchMessages

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const payload = isAdmin
        ? { NoiDung: text, CuocHoiThoaiID: selectedConv?.ID }
        : { NoiDung: text };
      await axios.post('/tinnhanhethong/send', payload);
      const convId = selectedConv?.ID || selectedConv;
      if (convId) fetchMessages(convId, true); // scroll xuống sau khi gửi
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

  // Header title & avatar cho phía người thuê
  const headerName = isAdmin
    ? (selectedConv?.nguoidung?.HoTen || selectedConv?.HoTen || 'Người thuê')
    : (lastAdminReplier?.HoTen || 'Ban Quản Lý SmartBuilding');

  const headerSubtitle = isAdmin
    ? null
    : lastAdminReplier
      ? `${lastAdminReplier.roles?.TenVaiTro === 'QuanLy' ? 'Quản lý' : lastAdminReplier.roles?.TenVaiTro === 'KeToan' ? 'Kế toán' : 'Nhân viên kỹ thuật'} đang phụ trách`
      : 'Ban quản lý sẽ phản hồi sớm';  return (
    <div className="flex bg-slate-50 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Sidebar - conversations (chỉ Admin) */}
      {isAdmin && (
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-lg">💬 Tin nhắn</h2>
            <p className="text-xs text-slate-400 mt-0.5">Trò chuyện với cư dân</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-sm">Chưa có cuộc trò chuyện</p>
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = selectedConv?.ID === conv.ID;
                const tenantName = conv.nguoidung?.HoTen || conv.HoTen || 'Người thuê';
                return (
                  <button
                    key={conv.ID}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                  >
                    <Avatar name={tenantName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">{tenantName}</p>
                        {conv.SoChuaDoc > 0 && (
                          <span className="flex-shrink-0 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.SoChuaDoc > 9 ? '9+' : conv.SoChuaDoc}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.TinNhanCuoi || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv || !isAdmin ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <Avatar name={headerName} size="lg" />
              <div>
                <p className="font-bold text-slate-900">{headerName}</p>
                <p className="text-xs text-emerald-500 mt-0.5">
                  {headerSubtitle || '● Đang hoạt động'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="font-medium text-slate-600">Bắt đầu cuộc trò chuyện</p>
                  <p className="text-sm mt-1">
                    Gửi tin nhắn để liên hệ với {isAdmin ? 'cư dân' : 'ban quản lý'}
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isAdminMsg = msg.LoaiNguoiGui === 'Admin';

                // "tin của mình" = admin xem → tin admin gửi | người thuê xem → tin mình gửi
                const isMine = isAdmin ? isAdminMsg : msg.NguoiGuiID === user?.ID;

                const senderName = msg.NguoiGui?.HoTen || (isAdminMsg ? 'Quản lý' : 'Cư dân');
                const senderRole = msg.NguoiGui?.roles?.TenVaiTro;
                const roleLabel =
                  senderRole === 'QuanLy' ? 'Quản lý' :
                  senderRole === 'KeToan' ? 'Kế toán' :
                  senderRole === 'NhanVienKyThuat' ? 'Kỹ thuật' : 
                  isAdminMsg ? 'Quản lý' : null;

                // Kiểm tra có phải tin nhắn đầu tiên của người này trong chuỗi liên tiếp không
                const prevMsg = messages[idx - 1];
                const prevSenderId = prevMsg?.NguoiGuiID;
                const isFirstInGroup = prevSenderId !== msg.NguoiGuiID;

                return (
                  <div key={msg.ID || idx} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {/* Avatar bên trái (tin của người kia) */}
                    {!isMine && (
                      <div className="flex-shrink-0 self-end mb-1">
                        {isFirstInGroup ? (
                          <Avatar name={senderName} size="sm" />
                        ) : (
                          <div className="w-7 h-7" /> // placeholder giữ layout
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'items-end' : 'items-start'}`}>
                      {/* Tên người gửi (chỉ hiện ở tin đầu nhóm, và chỉ khi không phải tin của mình) */}
                      {!isMine && isFirstInGroup && (
                        <span className="text-xs font-semibold text-slate-500 mb-1 px-1">
                          {senderName}
                          {roleLabel && (
                            <span className="ml-1 text-[10px] font-normal bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                              {roleLabel}
                            </span>
                          )}
                        </span>
                      )}

                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                      }`}>
                        {msg.NoiDung}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 px-1">
                        {formatTime(msg.ThoiGian || msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter để gửi)"
                  rows={1}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  style={{ minHeight: 44, maxHeight: 120 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl font-semibold text-slate-600">Chọn một cuộc trò chuyện</p>
              <p className="text-sm mt-2">Hoặc bắt đầu cuộc hội thoại mới từ danh sách</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
