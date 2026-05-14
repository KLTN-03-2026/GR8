// client/src/components/ChatWidget.jsx
// Floating chat widget - chat trực tiếp giữa NguoiThue ↔ QuanLy (kiểu Zalo)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['QuanLy', 'NhanVienKyThuat', 'KeToan'];

const Avatar = ({ name = '?', size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#059669,#10b981)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: size * 0.38,
  }}>
    {name.charAt(0).toUpperCase()}
  </div>
);

const ChatWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roles?.TenVaiTro || user?.VaiTro;
  const isAdmin = ADMIN_ROLES.includes(role);
  // Nếu chưa đăng nhập → hiện nút chat nhưng redirect login khi click
  const isGuest = !user;

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Admin state
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [convView, setConvView] = useState(true); // true = danh sách, false = chat

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [myConvId, setMyConvId] = useState(null); // cho người thuê

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  // ─── Fetch unread count (poll 10s) ───────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const res = await axios.get('/tinnhanhethong/unread-count');
      setUnread(res.data.data?.unreadCount || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!user || isGuest) return;
    fetchUnread();
    const t = setInterval(fetchUnread, 10000);
    return () => clearInterval(t);
  }, [fetchUnread, user, isGuest]);

  // ─── Fetch conversations (admin) ─────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('/tinnhanhethong/conversations');
      setConversations(res.data.data || []);
    } catch { /* silent */ }
  }, []);

  // ─── Fetch my-conversation (người thuê) ──────────────────────────────────
  const fetchMyConv = useCallback(async () => {
    try {
      const res = await axios.get('/tinnhanhethong/my-conversation');
      const conv = res.data.data;
      if (conv?.ID) setMyConvId(conv.ID);
    } catch { /* silent */ }
  }, []);

  // ─── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId, scroll = false) => {
    if (!convId) return;
    try {
      const res = await axios.get(`/tinnhanhethong/${convId}/messages`);
      const list = res.data.data || [];
      setMessages(prev => {
        const newLastId = list[list.length - 1]?.ID;
        const prevLastId = prev[prev.length - 1]?.ID;
        if (newLastId !== prevLastId) {
          fetchUnread(); // cập nhật badge
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        } else if (scroll) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
        }
        if (JSON.stringify(list.map(m => m.ID)) === JSON.stringify(prev.map(m => m.ID))) return prev;
        return list;
      });
    } catch { /* silent */ }
  }, [fetchUnread]);

  // ─── Khi mở widget ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !user || isGuest) {
      clearInterval(pollRef.current);
      return;
    }
    // Reset badge ngay khi mở — người dùng đang xem rồi
    setUnread(0);
    if (isAdmin) {
      fetchConversations();
    } else {
      fetchMyConv();
    }
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // ─── Khi chọn conversation (admin) hoặc myConvId sẵn sàng ───────────────
  const activeConvId = isAdmin ? selectedConv?.ID : myConvId;

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeConvId || !open) return;

    fetchMessages(activeConvId, true);
    pollRef.current = setInterval(() => fetchMessages(activeConvId), 5000);
    return () => clearInterval(pollRef.current);
  }, [activeConvId, open, fetchMessages]);

  // ─── Khi người thuê có myConvId → tự vào chat luôn ──────────────────────
  useEffect(() => {
    if (!isAdmin && myConvId) setConvView(false);
  }, [myConvId, isAdmin]);

  // ─── Gửi tin nhắn ────────────────────────────────────────────────────────
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
      if (activeConvId) fetchMessages(activeConvId, true);
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

  // Tên hiển thị trong header chat
  const lastAdminMsg = messages.filter(m => m.LoaiNguoiGui === 'Admin').slice(-1)[0];
  const chatHeaderName = isAdmin
    ? (selectedConv?.nguoidung?.HoTen || selectedConv?.HoTen || 'Người thuê')
    : (lastAdminMsg?.NguoiGui?.HoTen || 'Ban Quản Lý');
  const chatHeaderSub = isAdmin
    ? 'Cư dân'
    : lastAdminMsg?.NguoiGui?.HoTen
      ? (() => {
          const r = lastAdminMsg.NguoiGui?.roles?.TenVaiTro;
          return r === 'QuanLy' ? 'Quản lý' : r === 'KeToan' ? 'Kế toán' : 'Nhân viên kỹ thuật';
        })()
      : 'Đang hoạt động';

  // ─── Render ───────────────────────────────────────────────────────────────
  // Luôn hiện widget với mọi người

  // Nếu chưa đăng nhập → chỉ hiện nút floating, click redirect login
  if (isGuest) {
    return (
      <>
        <div style={{
          position: 'fixed', bottom: 88, right: 24,
          zIndex: 9998,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
        }}>
          {open && (
            <div style={{
              width: 300, background: '#fff',
              borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden', border: '1px solid rgba(59,130,246,0.2)',
              animation: 'chatFadeUp 0.25s ease',
            }}>
              <div style={{
                background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>💬 Chat với quản lý</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>Đặt câu hỏi về căn hộ</p>
                </div>
                <button onClick={() => setOpen(false)} style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                  width: 28, height: 28, color: '#fff', cursor: 'pointer',
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
              <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
                <p style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: 6 }}>
                  Đăng nhập để chat
                </p>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  Bạn cần đăng nhập để liên hệ trực tiếp với ban quản lý
                </p>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(o => !o)}
            title="Chat với quản lý"
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none',
              background: open ? '#ef4444' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
          >
            {open ? '✕' : '💬'}
          </button>
        </div>
        <style>{`
          @keyframes chatFadeUp {
            from { opacity: 0; transform: translateY(16px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed', bottom: 88, right: 24,
        zIndex: 9998,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
      }}>

        {/* ── Chat Box ── */}
        {open && (
          <div style={{
            width: 320, height: 460, background: '#fff',
            borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid rgba(59,130,246,0.2)',
            animation: 'chatFadeUp 0.25s ease',
          }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {/* Back button (admin đang xem chat) */}
              {isAdmin && !convView && (
                <button onClick={() => { setConvView(true); setSelectedConv(null); setMessages([]); }}
                  style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                    width: 28, height: 28, color: '#fff', cursor: 'pointer',
                    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>←</button>
              )}

              <Avatar name={chatHeaderName} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, truncate: true }}>
                  {isAdmin && convView ? '💬 Tin nhắn' : chatHeaderName}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>
                  {isAdmin && convView ? 'Trò chuyện với cư dân' : chatHeaderSub}
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                width: 28, height: 28, color: '#fff', cursor: 'pointer',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* ── Admin: danh sách conversations ── */}
            {isAdmin && convView ? (
              <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                    <p style={{ fontSize: 13 }}>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const name = conv.nguoidung?.HoTen || conv.HoTen || 'Người thuê';
                    return (
                      <button key={conv.ID}
                        onClick={() => {
                          setSelectedConv(conv);
                          setConvView(false);
                          setMessages([]);
                          // Xóa badge đỏ của conversation này ngay lập tức
                          setConversations(prev => prev.map(c =>
                            c.ID === conv.ID ? { ...c, SoChuaDoc: 0 } : c
                          ));
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', background: 'none', border: 'none',
                          borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                          textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar name={name} size={38} />
                          {conv.SoChuaDoc > 0 && (
                            <span style={{
                              position: 'absolute', top: -2, right: -2,
                              background: '#ef4444', color: '#fff',
                              borderRadius: '50%', width: 16, height: 16,
                              fontSize: 9, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1.5px solid #fff',
                            }}>
                              {conv.SoChuaDoc > 9 ? '9+' : conv.SoChuaDoc}
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {name}
                          </p>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.TinNhanCuoi || 'Chưa có tin nhắn'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* ── Messages ── */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '12px 12px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  background: '#f8fafc',
                }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                      <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
                        Bắt đầu cuộc trò chuyện
                      </p>
                      <p style={{ fontSize: 12 }}>
                        Gửi tin nhắn để liên hệ với {isAdmin ? 'cư dân' : 'ban quản lý'}
                      </p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isAdminMsg = msg.LoaiNguoiGui === 'Admin';
                    const isMine = isAdmin ? isAdminMsg : msg.NguoiGuiID === user?.ID;
                    const senderName = msg.NguoiGui?.HoTen || (isAdminMsg ? 'Quản lý' : 'Cư dân');
                    const prevMsg = messages[idx - 1];
                    const isFirstInGroup = prevMsg?.NguoiGuiID !== msg.NguoiGuiID;

                    return (
                      <div key={msg.ID || idx} style={{
                        display: 'flex', alignItems: 'flex-end', gap: 6,
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}>
                        {/* Avatar người kia */}
                        {!isMine && (
                          <div style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
                            {isFirstInGroup
                              ? <Avatar name={senderName} size={26} />
                              : <div style={{ width: 26 }} />
                            }
                          </div>
                        )}

                        <div style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                        }}>
                          {/* Tên người gửi (chỉ tin đầu nhóm, không phải tin của mình) */}
                          {!isMine && isFirstInGroup && (
                            <span style={{
                              fontSize: 11, color: '#64748b', fontWeight: 600,
                              marginBottom: 3, paddingLeft: 2,
                            }}>
                              {senderName}
                              {isAdminMsg && (
                                <span style={{
                                  marginLeft: 4, fontSize: 10,
                                  background: '#dbeafe', color: '#2563eb',
                                  borderRadius: 4, padding: '1px 5px',
                                }}>
                                  {msg.NguoiGui?.roles?.TenVaiTro === 'QuanLy' ? 'Quản lý'
                                    : msg.NguoiGui?.roles?.TenVaiTro === 'KeToan' ? 'Kế toán'
                                    : 'Kỹ thuật'}
                                </span>
                              )}
                            </span>
                          )}

                          <div style={{
                            padding: '9px 13px',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isMine
                              ? 'linear-gradient(135deg,#2563eb,#3b82f6)'
                              : '#fff',
                            color: isMine ? '#fff' : '#1e293b',
                            fontSize: 13, lineHeight: 1.5,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          }}>
                            {msg.NoiDung}
                          </div>
                          <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, paddingLeft: 2 }}>
                            {formatTime(msg.ThoiGian)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* ── Input ── */}
                <div style={{
                  padding: '10px 12px', borderTop: '1px solid #e2e8f0',
                  background: '#fff', display: 'flex', gap: 8,
                }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    style={{
                      flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10,
                      padding: '8px 12px', fontSize: 13, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: 'none',
                      background: input.trim() && !sending
                        ? 'linear-gradient(135deg,#2563eb,#3b82f6)'
                        : '#e2e8f0',
                      color: input.trim() && !sending ? '#fff' : '#94a3b8',
                      cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                      fontSize: 16, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                    }}
                  >
                    {sending
                      ? <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'chatSpin 0.6s linear infinite' }} />
                      : '➤'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Floating Button ── */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Label tooltip - hiện khi hover đúng vào nút */}
          {!open && (
            <div className="chat-ql-label" style={{
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              opacity: 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}>
              Chat quản lý
            </div>
          )}
        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Đóng chat' : 'Chat với quản lý'}
          onMouseEnter={() => { const el = document.querySelector('.chat-ql-label'); if(el) el.style.opacity = '1'; }}
          onMouseLeave={() => { const el = document.querySelector('.chat-ql-label'); if(el) el.style.opacity = '0'; }}
          style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none',
              background: open ? '#ef4444' : 'linear-gradient(135deg,#2563eb,#3b82f6)',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', position: 'relative',
          }}
        >
          {open ? '✕' : '💬'}

          {/* Badge đỏ tin nhắn chưa đọc — chỉ hiện khi đóng */}
          {!open && unread > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: '#ef4444', color: '#fff',
              borderRadius: '50%', minWidth: 18, height: 18,
              fontSize: 10, fontWeight: 700, padding: '0 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
              animation: 'chatPulse 1.5s ease-in-out infinite',
            }}>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
        </div>
      </div>

      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.2); }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
