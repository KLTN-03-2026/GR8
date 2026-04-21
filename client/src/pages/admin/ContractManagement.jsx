// client/src/pages/admin/ContractManagement.jsx
// Quản lý hợp đồng đầy đủ cho Admin

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_CONFIG = {
  ChoKy:    { label: 'Chờ ký',    color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
  DaKy:     { label: 'Đã ký',     color: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '✍️' },
  DangThue: { label: 'Đang thuê', color: 'bg-green-100 text-green-800 border-green-300',    icon: '🏠' },
  HetHan:   { label: 'Hết hạn',   color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '⚠️' },
  KetThuc:  { label: 'Kết thúc',  color: 'bg-gray-100 text-gray-800 border-gray-300',       icon: '🔚' },
  ChuyenNhuong: { label: 'Chuyển nhượng', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🔄' },
};

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', search: '' });
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, expired: 0, expiringSoon: 0 });

  // Create contract modal
  const [showCreate, setShowCreate] = useState(false);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [createForm, setCreateForm] = useState({ YeuCauThueID: '', NgayBatDau: '', NgayKetThuc: '' });

  // Detail modal
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => { fetchContracts(); }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/hopdong');
      let data = res.data.data || [];
      if (!Array.isArray(data)) data = [];

      if (filter.search) {
        const s = filter.search.toLowerCase();
        data = data.filter(c =>
          c.canho?.MaCanHo?.toLowerCase().includes(s) ||
          c.nguoidung?.HoTen?.toLowerCase().includes(s) ||
          c.nguoidung?.Email?.toLowerCase().includes(s)
        );
      }
      if (filter.TrangThai) {
        data = data.filter(c => c.TrangThai === filter.TrangThai);
      }

      setContracts(data);
      const today = new Date();
      const s = data.reduce((a, c) => {
        a.total++;
        if (c.TrangThai === 'DangThue') {
          a.active++;
          const days = Math.ceil((new Date(c.NgayKetThuc) - today) / 86400000);
          if (days > 0 && days <= 30) a.expiringSoon++;
        }
        if (c.TrangThai === 'ChoKy') a.pending++;
        if (c.TrangThai === 'HetHan') a.expired++;
        return a;
      }, { total: 0, active: 0, pending: 0, expired: 0, expiringSoon: 0 });
      setStats(s);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const res = await axios.get('/yeucauthue', { params: { TrangThai: 'DaDuyet' } });
      let data = res.data.data || [];
      if (!Array.isArray(data)) data = [];
      // Lọc những yêu cầu chưa có hợp đồng
      setApprovedRequests(data);
    } catch {}
  };

  const openCreate = () => {
    fetchApprovedRequests();
    setCreateForm({ YeuCauThueID: '', NgayBatDau: '', NgayKetThuc: '' });
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/hopdong/create', createForm);
      setSuccess('✅ Tạo hợp đồng thành công!');
      setShowCreate(false);
      fetchContracts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo hợp đồng thất bại');
    }
  };

  const handleTerminate = async (id) => {
    if (!window.confirm('Xác nhận kết thúc hợp đồng này?')) return;
    try {
      await axios.put(`/hopdong/terminate/${id}`);
      setSuccess('✅ Đã kết thúc hợp đồng!');
      fetchContracts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await axios.get(`/hopdong/${id}`);
      setSelectedContract(res.data.data);
      setShowDetail(true);
    } catch (err) {
      setError('Không thể tải chi tiết hợp đồng');
    }
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ChoKy;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
        <span className="mr-1">{cfg.icon}</span>{cfg.label}
      </span>
    );
  };

  const daysLeft = (endDate) => Math.ceil((new Date(endDate) - new Date()) / 86400000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Quản Lý Hợp Đồng</h1>
            <p className="text-gray-500 mt-1">Tổng: {stats.total} hợp đồng</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchContracts} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
              🔄 Làm mới
            </button>
            <button onClick={openCreate} className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tạo Hợp Đồng
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg text-green-800 font-medium">{success}</div>}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg flex items-center">
            <span className="text-red-800 font-medium flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-500">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Tổng', value: stats.total, color: 'border-indigo-500', text: 'text-indigo-600' },
            { label: 'Đang thuê', value: stats.active, color: 'border-green-500', text: 'text-green-600' },
            { label: 'Chờ ký', value: stats.pending, color: 'border-yellow-500', text: 'text-yellow-600' },
            { label: 'Hết hạn', value: stats.expired, color: 'border-red-500', text: 'text-red-600' },
            { label: 'Sắp hết hạn', value: stats.expiringSoon, color: 'border-orange-500', text: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.color}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Tìm mã căn hộ, tên người thuê..."
            className="flex-1 min-w-48 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
          {(filter.TrangThai || filter.search) && (
            <button onClick={() => setFilter({ TrangThai: '', search: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Xóa lọc</button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">📄</div>
            <p>Không tìm thấy hợp đồng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map(c => {
              const days = daysLeft(c.NgayKetThuc);
              const expiring = c.TrangThai === 'DangThue' && days > 0 && days <= 30;
              return (
                <div key={c.ID} className={`bg-white rounded-xl shadow hover:shadow-lg transition-all border-2 ${expiring ? 'border-orange-300' : 'border-gray-100'}`}>
                  {expiring && (
                    <div className="bg-orange-500 text-white px-5 py-2 text-sm font-bold rounded-t-xl">
                      ⚠️ Sắp hết hạn — Còn {days} ngày
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">Hợp đồng #{c.ID}</h3>
                          {getStatusBadge(c.TrangThai)}
                        </div>
                        <p className="text-sm text-gray-600">
                          🏠 <span className="font-semibold">{c.canho?.MaCanHo}</span> — Phòng {c.canho?.SoPhong} &nbsp;|&nbsp;
                          👤 <span className="font-semibold">{c.nguoidung?.HoTen}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(c.GiaThue)}<span className="text-sm font-normal text-gray-500">/tháng</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Bắt đầu</p>
                        <p className="font-semibold">{new Date(c.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Kết thúc</p>
                        <p className="font-semibold">{new Date(c.NgayKetThuc).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Tiền cọc</p>
                        <p className="font-semibold">{formatCurrency(c.TienCoc)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Đã nhận cọc</p>
                        <p className="font-semibold text-green-600">{formatCurrency(c.TienCocDaNhan || 0)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button onClick={() => openDetail(c.ID)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200">
                        👁 Chi Tiết
                      </button>
                      {['DangThue', 'ChoKy'].includes(c.TrangThai) && (
                        <button onClick={() => handleTerminate(c.ID)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200">
                          🔚 Kết Thúc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">📝 Tạo Hợp Đồng Mới</h3>
              <button onClick={() => setShowCreate(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Yêu Cầu Thuê Đã Duyệt *</label>
                <select required value={createForm.YeuCauThueID}
                  onChange={e => setCreateForm(f => ({ ...f, YeuCauThueID: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Chọn yêu cầu thuê --</option>
                  {approvedRequests.map(r => (
                    <option key={r.ID} value={r.ID}>
                      #{r.ID} — {r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen} — Căn hộ {r.canho?.MaCanHo}
                    </option>
                  ))}
                </select>
                {approvedRequests.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">⚠️ Không có yêu cầu thuê đã duyệt nào chưa có hợp đồng</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Bắt Đầu *</label>
                  <input required type="date" value={createForm.NgayBatDau}
                    onChange={e => setCreateForm(f => ({ ...f, NgayBatDau: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Kết Thúc *</label>
                  <input required type="date" value={createForm.NgayKetThuc}
                    onChange={e => setCreateForm(f => ({ ...f, NgayKetThuc: e.target.value }))}
                    min={createForm.NgayBatDau}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hợp đồng sẽ ở trạng thái "Chờ ký" sau khi tạo</li>
                  <li>Người thuê cần ký hợp đồng để kích hoạt</li>
                  <li>Giá thuê và tiền cọc lấy từ thông tin căn hộ</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Hủy</button>
                <button type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">Tạo Hợp Đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">📄 Chi Tiết Hợp Đồng #{selectedContract.ID}</h3>
              <button onClick={() => setShowDetail(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">Trạng thái:</span>
                {getStatusBadge(selectedContract.TrangThai)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">🏠 Căn Hộ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Mã:</span><span className="font-semibold">{selectedContract.canho?.MaCanHo}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Phòng:</span><span className="font-semibold">{selectedContract.canho?.SoPhong}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tầng:</span><span className="font-semibold">{selectedContract.canho?.Tang}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Diện tích:</span><span className="font-semibold">{selectedContract.canho?.DienTich} m²</span></div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">👤 Người Thuê</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Họ tên:</span><span className="font-semibold">{selectedContract.nguoidung?.HoTen}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-semibold text-xs">{selectedContract.nguoidung?.Email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">SĐT:</span><span className="font-semibold">{selectedContract.nguoidung?.SoDienThoai}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">📋 Thông Tin Hợp Đồng</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Ngày bắt đầu:</span><span className="font-semibold">{new Date(selectedContract.NgayBatDau).toLocaleDateString('vi-VN')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Ngày kết thúc:</span><span className="font-semibold">{new Date(selectedContract.NgayKetThuc).toLocaleDateString('vi-VN')}</span></div>
                  {selectedContract.NgayKy && <div className="flex justify-between"><span className="text-gray-600">Ngày ký:</span><span className="font-semibold">{new Date(selectedContract.NgayKy).toLocaleDateString('vi-VN')}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-600">Giá thuê:</span><span className="font-bold text-indigo-600">{formatCurrency(selectedContract.GiaThue)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Tiền cọc:</span><span className="font-semibold">{formatCurrency(selectedContract.TienCoc)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Đã nhận cọc:</span><span className="font-semibold text-green-600">{formatCurrency(selectedContract.TienCocDaNhan || 0)}</span></div>
                </div>
              </div>

              {selectedContract.hoadon?.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">💳 Hóa Đơn ({selectedContract.hoadon.length})</h4>
                  <div className="space-y-2">
                    {selectedContract.hoadon.slice(0, 3).map(hd => (
                      <div key={hd.ID} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
                        <span className="text-gray-600">Tháng {hd.ThangNam}</span>
                        <span className="font-semibold">{formatCurrency(hd.TongTien)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hd.TrangThai === 'DaTT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {hd.TrangThai === 'DaTT' ? 'Đã TT' : 'Chưa TT'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setShowDetail(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
