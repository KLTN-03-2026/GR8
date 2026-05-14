// client/src/pages/yeucausuco/IncidentList.jsx
// Quản lý sự cố - Admin / Quản lý (Tạo sự cố, phân công kỹ thuật viên)

import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/formatDate';
import axios from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const PRIORITY_CONFIG = {
  Cao:   { label: 'Cao',   color: 'bg-red-100 text-red-800 border-red-300',       dot: 'bg-red-500' },
  Trung: { label: 'Trung', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
  Thap:  { label: 'Thấp',  color: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500' },
};

const STATUS_CONFIG = {
  Moi:           { label: 'Mới',          color: 'bg-blue-100 text-blue-800',   icon: '' },
  QuanLyDaNhan:  { label: 'Đã nhận',      color: 'bg-purple-100 text-purple-800', icon: '' },
  DangXuLy:      { label: 'Đang xử lý',   color: 'bg-orange-100 text-orange-800', icon: '' },
  DaGiaiQuyet:   { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800',  icon: '' },
};

const IncidentList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', DoUuTien: '', search: '' });
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchIncidents(); }, [filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/yeucausuco', { params: filter });
      const data = res.data.data || res.data.items || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setIncidents(arr);
      setStats({
        total: arr.length,
        new: arr.filter(i => i.TrangThai === 'Moi').length,
        inProgress: arr.filter(i => i.TrangThai === 'DangXuLy').length,
        resolved: arr.filter(i => i.TrangThai === 'DaGiaiQuyet').length,
      });
    } catch (err) {
      setError('Không thể tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`/yeucausuco/${id}`, { TrangThai: status });
      fetchIncidents();
      setSelected(null);
    } catch {
      setError('Không thể cập nhật trạng thái');
    }
  };

  const statCards = [
    { label: 'Tổng sự cố', value: stats.total, color: 'border-blue-500', text: 'text-blue-600', icon: '' },
    { label: 'Mới', value: stats.new, color: 'border-red-500', text: 'text-red-600', icon: '' },
    { label: 'Đang xử lý', value: stats.inProgress, color: 'border-orange-500', text: 'text-orange-600', icon: '' },
    { label: 'Đã giải quyết', value: stats.resolved, color: 'border-green-500', text: 'text-green-600', icon: '' },
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900"> Quản Lý Sự Cố</h1>
            <p className="text-slate-500 text-sm mt-1">Theo dõi và xử lý các sự cố trong toà nhà</p>
          </div>
          <button onClick={fetchIncidents} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
             Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm">{error}</div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="Moi">Mới</option>
            <option value="DangXuLy">Đang xử lý</option>
            <option value="DaGiaiQuyet">Đã giải quyết</option>
          </select>
          <select value={filter.DoUuTien} onChange={e => setFilter(f => ({ ...f, DoUuTien: e.target.value }))}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Tất cả mức ưu tiên</option>
            <option value="Cao">Cao</option>
            <option value="Trung">Trung</option>
            <option value="Thap">Thấp</option>
          </select>
          <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Tìm theo tiêu đề, căn hộ..."
            className="flex-1 min-w-48 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-slate-400">
            <div className="text-5xl mb-3"></div>
            <p className="font-semibold">Không có sự cố nào</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incidents.map(inc => {
              const priority = PRIORITY_CONFIG[inc.DoUuTien] || PRIORITY_CONFIG.Trung;
              const status = STATUS_CONFIG[inc.TrangThai] || STATUS_CONFIG.Moi;
              return (
                <div key={inc.ID} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-100">
                  <div className="p-5 flex items-start gap-4">
                    <div className={`w-2 h-full rounded-full flex-shrink-0 mt-1 ${priority.dot}`} style={{ minHeight: 60 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{inc.TieuDe}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Phòng {inc.canho?.MaCanHo}  {inc.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || inc.NguoiThue?.HoTen || 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${priority.color}`}>{priority.label}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.icon} {status.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{inc.MoTa}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(inc)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                          Chi tiết
                        </button>
                        {inc.TrangThai === 'Moi' && (
                          <button onClick={() => handleUpdateStatus(inc.ID, 'DangXuLy')}
                            className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors">
                            Nhận xử lý
                          </button>
                        )}
                        {inc.TrangThai === 'DangXuLy' && (
                          <button onClick={() => handleUpdateStatus(inc.ID, 'DaGiaiQuyet')}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                            Đánh dấu xong
                          </button>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                          {inc.NgayBao ? new Date(inc.NgayBao).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold">🔧 Chi tiết sự cố #{selected.ID}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Thông tin cơ bản */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Tiêu đề</p>
                <p className="font-semibold text-slate-900">{selected.TieuDe}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mô tả</p>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{selected.MoTa}</p>
              </div>
              
              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Căn hộ</p>
                  <p className="font-semibold">{selected.canho?.MaCanHo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mức ưu tiên</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${(PRIORITY_CONFIG[selected.DoUuTien] || PRIORITY_CONFIG.Trung).color}`}>
                    {(PRIORITY_CONFIG[selected.DoUuTien] || PRIORITY_CONFIG.Trung).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Người báo cáo</p>
                  <p className="font-semibold">{selected.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || 'N/A'}</p>
                  <p className="text-xs text-slate-400">{selected.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.SoDienThoai || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ngày báo</p>
                  <p className="font-semibold">{selected.NgayBao ? new Date(selected.NgayBao).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
                {selected.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Kỹ thuật viên</p>
                    <p className="font-semibold">{selected.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung.HoTen}</p>
                    <p className="text-xs text-slate-400">{selected.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung.SoDienThoai || ''}</p>
                  </div>
                )}
                {selected.NgayXuLy && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày xử lý</p>
                    <p className="font-semibold">{new Date(selected.NgayXuLy).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </div>

              {/* Hình ảnh sự cố */}
              {selected.HinhAnh && Array.isArray(selected.HinhAnh) && selected.HinhAnh.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-semibold">📸 Hình ảnh sự cố ({selected.HinhAnh.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.HinhAnh.map((img, idx) => (
                      <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer" 
                         className="relative group overflow-hidden rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all">
                        <img 
                          src={resolveMediaUrl(img)} 
                          alt={`Sự cố ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">🔍 Xem</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Kết quả xử lý */}
              {selected.KetQua && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-xs text-green-700 font-semibold mb-1">✅ Kết quả xử lý</p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{selected.KetQua}</p>
                </div>
              )}

              {/* Hình ảnh hoàn thành */}
              {selected.HinhAnhHoanThanh && Array.isArray(selected.HinhAnhHoanThanh) && selected.HinhAnhHoanThanh.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-semibold">✅ Hình ảnh hoàn thành ({selected.HinhAnhHoanThanh.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.HinhAnhHoanThanh.map((img, idx) => (
                      <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                         className="relative group overflow-hidden rounded-lg border-2 border-green-200 hover:border-green-500 transition-all">
                        <img 
                          src={resolveMediaUrl(img)} 
                          alt={`Hoàn thành ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">🔍 Xem</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Đóng
                </button>
                {selected.TrangThai !== 'DaGiaiQuyet' && (
                  <button onClick={() => handleUpdateStatus(selected.ID, 'DaGiaiQuyet')}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                     ✅ Đánh dấu xong
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentList;
