// client/src/pages/yeucausuco/StaffWorkList.jsx
// Trang công việc cho Kỹ thuật viên

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatDateTime } from '../../utils/formatDate';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const PRIORITY_CONFIG = {
  Cao:   { label: 'Khẩn cấp',  color: 'bg-red-100 text-red-800 border-red-300',       dot: 'bg-red-500' },
  Trung: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
  Thap:  { label: 'Thấp',      color: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500' },
};

const STATUS_CONFIG = {
  DangXuLy:      { label: 'Đang xử lý',   color: 'bg-orange-100 text-orange-800' },
  DaGiaiQuyet:   { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
};

const StaffWorkList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({ KetQua: '', images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'DangXuLy', 'DaGiaiQuyet'

  useEffect(() => { fetchMyWork(); }, []);

  const fetchMyWork = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/yeucausuco/staff/my');
      const data = res.data.data || res.data.items || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setIncidents(arr);
      setStats({
        total: arr.length,
        inProgress: arr.filter(i => i.TrangThai === 'DangXuLy').length,
        completed: arr.filter(i => i.TrangThai === 'DaGiaiQuyet').length,
      });
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenComplete = (incident) => {
    setSelected(incident);
    setCompleteForm({ KetQua: incident.KetQua || '', images: [] });
    setShowCompleteModal(true);
  };

  const handleCompleteWork = async (e) => {
    e.preventDefault();
    if (!completeForm.KetQua.trim()) {
      setError('Vui lòng nhập kết quả xử lý');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('KetQua', completeForm.KetQua);
      completeForm.images.forEach(file => formData.append('images', file));
      
      await axios.post(`/yeucausuco/${selected.ID}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Hoàn thành công việc thành công!');
      setShowCompleteModal(false);
      setSelected(null);
      setCompleteForm({ KetQua: '', images: [] });
      fetchMyWork();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hoàn thành công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Tổng công việc', value: stats.total, color: 'border-blue-500', text: 'text-blue-600' },
    { label: 'Đang xử lý', value: stats.inProgress, color: 'border-orange-500', text: 'text-orange-600' },
    { label: 'Đã hoàn thành', value: stats.completed, color: 'border-green-500', text: 'text-green-600' },
  ];

  // Filter incidents based on status
  const filteredIncidents = statusFilter === 'all' 
    ? incidents 
    : incidents.filter(inc => inc.TrangThai === statusFilter);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Công Việc Của Tôi</h1>
            <p className="text-gray-500 text-sm mt-1">Danh sách sự cố được phân công xử lý</p>
          </div>
          <button onClick={fetchMyWork} 
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statCards.map(s => (
            <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className={`text-2xl font-semibold ${s.text}`}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-xl text-green-800 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Lọc theo trạng thái:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('DangXuLy')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'DangXuLy'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đang xử lý ({stats.inProgress})
              </button>
              <button
                onClick={() => setStatusFilter('DaGiaiQuyet')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'DaGiaiQuyet'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đã hoàn thành ({stats.completed})
              </button>
            </div>
          </div>
        </div>

        {/* Work List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-lg">Không có công việc nào</p>
            <p className="text-sm mt-1">
              {statusFilter === 'all' 
                ? 'Bạn chưa được phân công sự cố nào'
                : statusFilter === 'DangXuLy'
                ? 'Không có công việc đang xử lý'
                : 'Không có công việc đã hoàn thành'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredIncidents.map(inc => {
              const priority = PRIORITY_CONFIG[inc.DoUuTien] || PRIORITY_CONFIG.Trung;
              const status = STATUS_CONFIG[inc.TrangThai] || STATUS_CONFIG.DangXuLy;
              const isCompleted = inc.TrangThai === 'DaGiaiQuyet';
              
              return (
                <div key={inc.ID} className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border-2 ${isCompleted ? 'border-green-200' : 'border-orange-200'}`}>
                  <div className="p-5 flex items-start gap-4">
                    {/* Priority Indicator */}
                    <div className={`w-3 h-full rounded-full flex-shrink-0 mt-1 ${priority.dot}`} style={{ minHeight: 80 }} />
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg mb-1">{inc.TieuDe}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-semibold">{inc.canho?.MaCanHo}</span>
                            <span>•</span>
                            <span>Tầng {inc.canho?.Tang}</span>
                            <span>•</span>
                            <span>Phòng {inc.canho?.SoPhong}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priority.color}`}>
                            {priority.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{inc.MoTa}</p>

                      {/* Contact Info */}
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Người báo cáo
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {inc.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          {inc.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.SoDienThoai || 'N/A'}
                        </p>
                      </div>

                      {/* Images Preview */}
                      {inc.HinhAnh && Array.isArray(inc.HinhAnh) && inc.HinhAnh.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-2 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            Hình ảnh sự cố ({inc.HinhAnh.length})
                          </p>
                          <div className="flex gap-2 overflow-x-auto">
                            {inc.HinhAnh.slice(0, 4).map((img, idx) => (
                              <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                                 className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-all">
                                <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" 
                                     onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }} />
                              </a>
                            ))}
                            {inc.HinhAnh.length > 4 && (
                              <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                +{inc.HinhAnh.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Result (if completed) */}
                      {isCompleted && inc.KetQua && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mb-3">
                          <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Kết quả xử lý
                          </p>
                          <p className="text-sm text-green-800">{inc.KetQua}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <button onClick={() => setSelected(inc)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </button>
                        
                        {!isCompleted && (
                          <button onClick={() => handleOpenComplete(inc)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Hoàn thành
                          </button>
                        )}
                        
                        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
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
      {selected && !showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Chi tiết công việc #{selected.ID}</h3>
              <button onClick={() => setSelected(null)} className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Info */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Tiêu đề</p>
                <p className="font-bold text-slate-900 text-lg">{selected.TieuDe}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mô tả chi tiết</p>
                <p className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{selected.MoTa}</p>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Căn hộ</p>
                  <p className="font-bold text-blue-900">{selected.canho?.MaCanHo || 'N/A'}</p>
                  <p className="text-xs text-blue-700">Tầng {selected.canho?.Tang} - Phòng {selected.canho?.SoPhong}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Mức ưu tiên</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${(PRIORITY_CONFIG[selected.DoUuTien] || PRIORITY_CONFIG.Trung).color}`}>
                    {(PRIORITY_CONFIG[selected.DoUuTien] || PRIORITY_CONFIG.Trung).label}
                  </span>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Người báo cáo</p>
                  <p className="font-semibold text-orange-900">{selected.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || 'N/A'}</p>
                  <p className="text-xs text-orange-700 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {selected.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.SoDienThoai || ''}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Ngày báo</p>
                  <p className="font-semibold text-green-900">{selected.NgayBao ? new Date(selected.NgayBao).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
              </div>

              {/* Images */}
              {selected.HinhAnh && Array.isArray(selected.HinhAnh) && selected.HinhAnh.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Hình ảnh sự cố ({selected.HinhAnh.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.HinhAnh.map((img, idx) => (
                      <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer" 
                         className="relative group overflow-hidden rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all">
                        <img src={resolveMediaUrl(img)} alt={`Sự cố ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">🔍 Xem</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {selected.KetQua && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Kết quả xử lý
                  </p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{selected.KetQua}</p>
                </div>
              )}

              {/* Completion Images */}
              {selected.HinhAnhHoanThanh && Array.isArray(selected.HinhAnhHoanThanh) && selected.HinhAnhHoanThanh.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hình ảnh hoàn thành ({selected.HinhAnhHoanThanh.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.HinhAnhHoanThanh.map((img, idx) => (
                      <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                         className="relative group overflow-hidden rounded-lg border-2 border-green-200 hover:border-green-500 transition-all">
                        <img src={resolveMediaUrl(img)} alt={`Hoàn thành ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
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
                <button onClick={() => setSelected(null)} 
                  className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Đóng
                </button>
                {selected.TrangThai !== 'DaGiaiQuyet' && (
                  <button onClick={() => { setShowCompleteModal(true); }}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Hoàn thành công việc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Work Modal */}
      {showCompleteModal && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Hoàn thành công việc #{selected.ID}</h3>
              <button onClick={() => { setShowCompleteModal(false); setError(''); }} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleCompleteWork} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">{selected.TieuDe}</p>
                <p className="text-xs text-blue-700">📍 {selected.canho?.MaCanHo} - Tầng {selected.canho?.Tang}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kết quả xử lý <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completeForm.KetQua}
                  onChange={e => setCompleteForm(f => ({ ...f, KetQua: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả chi tiết công việc đã thực hiện và kết quả..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Hình ảnh hoàn thành (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setCompleteForm(f => ({ ...f, images: Array.from(e.target.files || []) }))}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200 file:font-semibold"
                />
                {completeForm.images.length > 0 && (
                  <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {completeForm.images.length} ảnh đã chọn
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-red-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t">
                <button type="button" onClick={() => { setShowCompleteModal(false); setError(''); }}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xác nhận hoàn thành
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffWorkList;
