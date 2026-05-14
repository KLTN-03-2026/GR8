// client/src/pages/thongbao/Notifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const TYPE_CONFIG = {
  Chung:   { label: 'Chung',     color: 'bg-sky-100 text-sky-700',      dot: 'bg-sky-500',    border: 'border-l-sky-400' },
  Rieng:   { label: 'Riêng',     color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', border: 'border-l-violet-400' },
  NhacNo:  { label: 'Nhắc nợ',   color: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    border: 'border-l-red-400' },
  SuCo:    { label: 'Sự cố',     color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', border: 'border-l-orange-400' },
  HopDong: { label: 'Hợp đồng',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', border: 'border-l-emerald-400' },
};

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
    <path d={d} />
  </svg>
);

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const Notifications = () => {
  const { user } = useAuth();
  const role = user?.roles?.TenVaiTro || user?.VaiTro || '';
  const isManager = role === 'QuanLy' || role === 'ChuNha';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Form state
  const [form, setForm] = useState({ title: '', message: '' });
  const [images, setImages] = useState([]);       // File[]
  const [previews, setPreviews] = useState([]);   // string[] (object URLs)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', ok: false });
  const fileInputRef = useRef(null);

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { imgs: string[], idx: number }

  // Detail & Edit Modals
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => { fetchNotifications(); }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/thongbao');
      const data = res.data.data || res.data.items || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/thongbao/${id}/read`);
      setNotifications(prev => prev.map(n =>
        (n.ThongBaoID === id || n.ID === id) ? { ...n, DaDoc: true } : n
      ));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.put('/thongbao/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, DaDoc: true })));
    } catch {}
  };

  // ── Image handling ──────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });
    const remaining = MAX_IMAGES - images.length;
    const toAdd = valid.slice(0, remaining);
    setImages(prev => [...prev, ...toAdd]);
    setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setFormMsg({ text: 'Vui lòng nhập tiêu đề và nội dung.', ok: false });
      return;
    }
    try {
      setIsSubmitting(true);
      setFormMsg({ text: '', ok: false });

      const fd = new FormData();
      fd.append('TieuDe', form.title.trim());
      fd.append('NoiDung', form.message.trim());
      fd.append('Loai', 'Chung');
      images.forEach(img => fd.append('images', img));

      await axios.post('/thongbao', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setForm({ title: '', message: '' });
      previews.forEach(URL.revokeObjectURL);
      setImages([]);
      setPreviews([]);
      setFormMsg({ text: 'Đã gửi thông báo đến toàn bộ cư dân.', ok: true });
      fetchNotifications();
      setFilter('Chung');
    } catch {
      setFormMsg({ text: 'Không thể gửi thông báo. Vui lòng thử lại.', ok: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleItemClick = (n, id, isUnread) => {
    if (isUnread) markAsRead(id);
    const notif = n.thongbao || n;
    setSelectedDetail(notif);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.TieuDe.trim() || !editForm.NoiDung.trim()) {
      alert("Tiêu đề và nội dung không được để trống.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append('TieuDe', editForm.TieuDe.trim());
      fd.append('NoiDung', editForm.NoiDung.trim());
      
      if (editForm.existingImages && editForm.existingImages.length > 0) {
        editForm.existingImages.forEach(img => fd.append('existingImages', img));
      } else {
        fd.append('existingImages', ''); // Gửi chuỗi rỗng để báo backend không giữ lại ảnh nào
      }

      if (editForm.newImages && editForm.newImages.length > 0) {
        editForm.newImages.forEach(img => fd.append('images', img));
      }

      await axios.put(`/thongbao/${editForm.ID}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditForm(null);
      fetchNotifications();
    } catch {
      alert("Không thể cập nhật thông báo.");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      await axios.delete(`/thongbao/${id}`);
      fetchNotifications();
    } catch {
      alert("Không thể xóa thông báo.");
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.DaDoc)
    : notifications.filter(n => (n.thongbao?.Loai || n.Loai) === filter);

  const unreadCount = notifications.filter(n => !n.DaDoc).length;

  // ── Lightbox helpers ────────────────────────────────────────────────────
  const openLightbox = (imgs, idx) => setLightbox({ imgs, idx });
  const closeLightbox = () => setLightbox(null);
  const prevImg = () => setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.imgs.length) % lb.imgs.length }));
  const nextImg = () => setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.imgs.length }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Manager: Send notification form ── */}
      {isManager && (
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-neutral-900">Gửi thông báo chung</h2>
            <p className="text-sm text-neutral-500 mt-1">Thông báo sẽ được gửi đến toàn bộ cư dân đang hoạt động.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
                className="w-full px-4 py-2.5 text-sm border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Hình ảnh đính kèm
                <span className="text-neutral-400 font-normal ml-1">(tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ {MAX_SIZE_MB}MB)</span>
              </label>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-neutral-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <Icon d="M6 18L18 6M6 6l12 12" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {images.length < MAX_IMAGES && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 rounded-xl text-sm text-neutral-600 hover:text-primary-600 transition-all"
                  >
                    <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    Thêm ảnh {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
                  </button>
                </>
              )}
            </div>

            {/* Feedback */}
            {formMsg.text && (
              <p className={`text-sm font-medium px-4 py-2.5 rounded-xl ${formMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {formMsg.text}
              </p>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Icon d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" className="w-4 h-4" />
                    Gửi thông báo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            Thông báo
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white rounded-full text-sm font-bold">{unreadCount}</span>
            )}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">{notifications.length} thông báo</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 border-2 border-primary-200 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="bg-white rounded-2xl border-2 border-neutral-200 p-1.5 flex gap-1 flex-wrap">
        {[
          { key: 'all',     label: 'Tất cả' },
          { key: 'unread',  label: `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          { key: 'Chung',   label: 'Chung' },
          { key: 'NhacNo',  label: 'Nhắc nợ' },
          { key: 'HopDong', label: 'Hợp đồng' },
          { key: 'SuCo',    label: 'Sự cố' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-16 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Không có thông báo</h3>
          <p className="text-neutral-500 text-sm">
            {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, idx) => {
            const notif = n.thongbao || n;
            const cfg = TYPE_CONFIG[notif.Loai] || TYPE_CONFIG.Chung;
            const isUnread = !n.DaDoc;
            const id = n.ThongBaoID || n.ID;
            const imgs = Array.isArray(notif.HinhAnh) ? notif.HinhAnh : [];

            return (
              <div
                key={id || idx}
                onClick={() => handleItemClick(n, id, isUnread)}
                className={`
                  bg-white rounded-2xl border-2 border-l-4 ${cfg.border}
                  ${isUnread ? 'border-neutral-200 bg-sky-50/30' : 'border-neutral-200'}
                  p-5 hover:shadow-hover transition-all cursor-pointer
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Dot indicator */}
                  <div className="mt-1.5 flex-shrink-0">
                    {isUnread
                      ? <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                      : <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className={`font-semibold text-base ${isUnread ? 'text-neutral-900' : 'text-neutral-700'}`}>
                        {notif.TieuDe}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{notif.NoiDung}</p>

                    {/* Images */}
                    {imgs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2" onClick={e => e.stopPropagation()}>
                        {imgs.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => openLightbox(imgs.map(resolveMediaUrl), i)}
                            className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neutral-200 hover:border-primary-400 transition-colors flex-shrink-0"
                          >
                            <img
                              src={resolveMediaUrl(src)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Meta & Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-neutral-400">
                        {notif.NgayGui ? new Date(notif.NgayGui).toLocaleString('vi-VN') : ''}
                        {notif.nguoidung?.HoTen && ` · ${notif.nguoidung.HoTen}`}
                      </p>
                      
                      {isManager && notif.Loai === 'Chung' && (
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setEditForm({
                              ...notif,
                              existingImages: notif.HinhAnh || [],
                              newImages: [],
                              newPreviews: []
                            })}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, notif.ID)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">{selectedDetail.TieuDe}</h2>
                <p className="text-sm text-neutral-500">
                  {new Date(selectedDetail.NgayGui).toLocaleString('vi-VN')}
                  {selectedDetail.nguoidung?.HoTen && ` · ${selectedDetail.nguoidung.HoTen}`}
                </p>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <Icon d="M6 18L18 6M6 6l12 12" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed mb-6">
                {selectedDetail.NoiDung}
              </div>
              
              {selectedDetail.HinhAnh && selectedDetail.HinhAnh.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedDetail.HinhAnh.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(selectedDetail.HinhAnh.map(resolveMediaUrl), i)}
                      className="rounded-xl overflow-hidden border-2 border-neutral-200 hover:border-primary-400 transition-colors aspect-video"
                    >
                      <img src={resolveMediaUrl(src)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditForm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-neutral-900">Sửa thông báo</h2>
              <button onClick={() => setEditForm(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <Icon d="M6 18L18 6M6 6l12 12" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tiêu đề</label>
                <input
                  value={editForm.TieuDe}
                  onChange={e => setEditForm(p => ({ ...p, TieuDe: e.target.value }))}
                  className="w-full px-4 py-2 text-sm border-2 border-neutral-200 rounded-xl focus:border-blue-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nội dung</label>
                <textarea
                  value={editForm.NoiDung}
                  onChange={e => setEditForm(p => ({ ...p, NoiDung: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 text-sm border-2 border-neutral-200 rounded-xl focus:border-blue-400 outline-none resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Hình ảnh đính kèm</label>
                <div className="flex flex-wrap gap-2">
                  {editForm.existingImages?.map((src, i) => (
                    <div key={`old-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-neutral-200">
                      <img src={resolveMediaUrl(src)} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setEditForm(p => ({ ...p, existingImages: p.existingImages.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">×</button>
                    </div>
                  ))}
                  {editForm.newPreviews?.map((src, i) => (
                    <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-green-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        setEditForm(p => {
                          const nImages = [...p.newImages]; nImages.splice(i, 1);
                          const nPreviews = [...p.newPreviews];
                          URL.revokeObjectURL(nPreviews[i]); // clean up
                          nPreviews.splice(i, 1);
                          return { ...p, newImages: nImages, newPreviews: nPreviews };
                        });
                      }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">×</button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer bg-neutral-50 transition-colors">
                    <span className="text-2xl font-light">+</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setEditForm(p => ({
                          ...p,
                          newImages: [...(p.newImages || []), ...files],
                          newPreviews: [...(p.newPreviews || []), ...files.map(f => URL.createObjectURL(f))]
                        }));
                      }
                      e.target.value = null;
                    }} />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setEditForm(null)} className="px-4 py-2 rounded-xl border border-neutral-200 font-medium hover:bg-neutral-50 text-sm">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 text-sm">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.imgs[lightbox.idx]}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
            </button>

            {/* Prev / Next */}
            {lightbox.imgs.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon d="M15 19l-7-7 7-7" className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon d="M9 5l7 7-7 7" className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  {lightbox.idx + 1} / {lightbox.imgs.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
