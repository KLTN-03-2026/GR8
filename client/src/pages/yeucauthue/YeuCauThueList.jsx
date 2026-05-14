// client/src/pages/yeucauthue/YeuCauThueList.jsx
// Trang quản lý yêu cầu thuê căn hộ

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const STATUS = {
  ChoKiemTra: { label: 'Chờ duyệt',      bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  DatLich:    { label: 'Đã đặt lịch xem', bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  DaDuyet:    { label: 'Đã duyệt',        bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  TuChoi:     { label: 'Từ chối',         bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
};

const YeuCauThueList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', search: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, scheduled: 0, approved: 0, rejected: 0 });

  // Modal đặt lịch
  const [scheduleModal, setScheduleModal] = useState(null); // request object
  const [ngayXem, setNgayXem] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/yeucauthue');
      let data = response.data.data || [];
      if (!Array.isArray(data)) data = data.items || [];

      let filtered = data;
      if (filter.TrangThai) filtered = filtered.filter(r => r.TrangThai === filter.TrangThai);
      if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.canho?.MaCanHo?.toLowerCase().includes(s) ||
          r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen?.toLowerCase().includes(s)
        );
      }

      setRequests(filtered);
      setStats({
        total:     filtered.length,
        pending:   filtered.filter(r => r.TrangThai === 'ChoKiemTra').length,
        scheduled: filtered.filter(r => r.TrangThai === 'DatLich').length,
        approved:  filtered.filter(r => r.TrangThai === 'DaDuyet').length,
        rejected:  filtered.filter(r => r.TrangThai === 'TuChoi').length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn duyệt yêu cầu thuê căn hộ này?')) return;
    try {
      await axios.put(`/yeucauthue/manager-approve/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSchedule = async () => {
    if (!ngayXem) { alert('Vui lòng chọn ngày giờ xem căn hộ'); return; }
    setScheduling(true);
    try {
      await axios.put(`/yeucauthue/schedule/${scheduleModal.ID}`, { NgayXemDuKien: ngayXem });
      setScheduleModal(null);
      setNgayXem('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setScheduling(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      await axios.put(`/yeucauthue/reject/${id}`, { GhiChu: reason });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status) => {
    const s = STATUS[status] || STATUS.ChoKiemTra;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${s.bg} ${s.text} ${s.border}`}>
        {s.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Yêu Cầu Thuê Căn Hộ</h1>
        </div>
        <button onClick={fetchRequests} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Tổng',        value: stats.total,     color: 'border-l-gray-400' },
          { label: 'Chờ duyệt',   value: stats.pending,   color: 'border-l-yellow-400' },
          { label: 'Đặt lịch',    value: stats.scheduled, color: 'border-l-blue-400' },
          { label: 'Đã duyệt',    value: stats.approved,  color: 'border-l-green-400' },
          { label: 'Từ chối',     value: stats.rejected,  color: 'border-l-red-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${s.color}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          placeholder="Mã căn hộ, tên khách hàng..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        {(filter.TrangThai || filter.search) && (
          <button onClick={() => setFilter({ TrangThai: '', search: '' })}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Xóa lọc</button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">Không có yêu cầu nào</div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const nguoiThue = req.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung || req.nguoidung;
            const canAction = ['ChoKiemTra', 'DatLich'].includes(req.TrangThai);
            return (
              <div key={req.ID} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Yêu cầu #{req.ID}</h3>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <div>Căn hộ: <strong>{req.canho?.MaCanHo} — Phòng {req.canho?.SoPhong}</strong></div>
                        <div>Khách hàng: <strong>{nguoiThue?.HoTen}</strong> {nguoiThue?.Email && `(${nguoiThue.Email})`}</div>
                        <div>Ngày gửi: {req.NgayYeuCau ? new Date(req.NgayYeuCau).toLocaleDateString('vi-VN') : '—'}</div>
                        {req.TrangThai === 'DatLich' && req.NgayXemDuKien && (
                          <div className="text-blue-600 font-semibold">
                            Lịch xem: {new Date(req.NgayXemDuKien).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(req.TrangThai)}
                  </div>

                  {/* Giá thuê */}
                  <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4 flex gap-6 text-sm">
                    <div><span className="text-gray-500">Giá thuê:</span> <strong className="text-green-600">{formatCurrency(req.canho?.GiaThue)}/tháng</strong></div>
                    {req.canho?.DienTich && <div><span className="text-gray-500">Diện tích:</span> <strong>{req.canho.DienTich} m²</strong></div>}
                  </div>

                  {req.GhiChu && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 mb-4 text-sm text-gray-700">
                      <span className="font-medium">Ghi chú:</span> {req.GhiChu}
                    </div>
                  )}

                  {/* Actions */}
                  {canAction && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      {req.TrangThai === 'ChoKiemTra' && (
                        <button
                          onClick={() => { setScheduleModal(req); setNgayXem(''); }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Đặt lịch xem
                        </button>
                      )}
                      <button
                        onClick={() => handleApprove(req.ID)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Duyệt yêu cầu
                      </button>
                      <button
                        onClick={() => handleReject(req.ID)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal đặt lịch xem */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Đặt lịch xem căn hộ</h2>
              <button onClick={() => setScheduleModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                <div>Căn hộ: <strong>{scheduleModal.canho?.MaCanHo} — Phòng {scheduleModal.canho?.SoPhong}</strong></div>
                <div>Khách hàng: <strong>{(scheduleModal.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung || scheduleModal.nguoidung)?.HoTen}</strong></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày & giờ xem căn hộ *</label>
                <input
                  type="datetime-local"
                  value={ngayXem}
                  onChange={e => setNgayXem(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <p className="text-xs text-gray-400">Khách hàng sẽ thấy lịch xem này trong phần "Yêu cầu của tôi".</p>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setScheduleModal(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Hủy
                </button>
                <button onClick={handleSchedule} disabled={scheduling}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {scheduling ? 'Đang lưu...' : 'Xác nhận lịch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YeuCauThueList;
