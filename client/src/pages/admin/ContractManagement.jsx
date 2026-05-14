// client/src/pages/admin/ContractManagement.jsx
// Quản lý hợp đồng đầy đủ cho Admin

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import HopDongPreview from '../../components/HopDongPreview';

const STATUS_CONFIG = {
  ChoKy:    { label: 'Chờ ký',    color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '' },
  DaKy:     { label: 'Đã ký',     color: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '' },
  DangThue: { label: 'Đang thuê', color: 'bg-green-100 text-green-800 border-green-300',    icon: '' },
  HetHan:   { label: 'Hết hạn',   color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '' },
  KetThuc:  { label: 'Kết thúc',  color: 'bg-gray-100 text-gray-800 border-gray-300',       icon: '' },
  ChuyenNhuong: { label: 'Chuyển nhượng', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '' },
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
  const [selectedRequest, setSelectedRequest] = useState(null); // request đã chọn để hiện thông tin
  const [createForm, setCreateForm] = useState({
    YeuCauThueID: '',
    NgayBatDau: '',
    NgayKetThuc: '',
    GiaThue: '',
    TienCoc: '',
    TienCocDaNhan: '0',
    GhiChu: '',
    ThoiHanThang: '12', // tháng, để tự tính NgayKetThuc
  });
  const [creating, setCreating] = useState(false);

  // Detail modal
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Tờ hợp đồng pháp lý

  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const terminationRequests = contracts.filter(c => c.YeuCauKetThuc && c.TrangThai !== 'KetThuc');

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showTerminations') === 'true') {
      setShowTerminationModal(true);
    }
  }, [location]);

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
      const res = await axios.get('/yeucauthue', {
        params: { TrangThai: 'DaDuyet', chuaCoHopDong: 'true' }
      });
      let data = res.data.data || [];
      if (!Array.isArray(data)) data = [];
      setApprovedRequests(data);
    } catch {}
  };

  const openCreate = () => {
    fetchApprovedRequests();
    setCreateForm({
      YeuCauThueID: '', NgayBatDau: '', NgayKetThuc: '',
      GiaThue: '', TienCoc: '', TienCocDaNhan: '0',
      GhiChu: '', ThoiHanThang: '12',
    });
    setSelectedRequest(null);
    setShowCreate(true);
  };

  // Khi chọn yêu cầu thuê → tự điền giá thuê, tiền cọc
  const handleSelectRequest = (yeuCauID) => {
    const req = approvedRequests.find(r => String(r.ID) === String(yeuCauID));
    setSelectedRequest(req || null);
    setCreateForm(f => ({
      ...f,
      YeuCauThueID: yeuCauID,
      GiaThue: req?.canho?.GiaThue ? String(req.canho.GiaThue) : '',
      TienCoc: req?.canho?.TienCoc ? String(req.canho.TienCoc) : '',
    }));
  };

  // Khi đổi ngày bắt đầu hoặc thời hạn → tự tính ngày kết thúc
  const calcEndDate = (startDate, months) => {
    if (!startDate || !months) return '';
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + Number(months));
    return d.toISOString().slice(0, 10);
  };

  const setF = (key, val) => {
    setCreateForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'NgayBatDau' || key === 'ThoiHanThang') {
        next.NgayKetThuc = calcEndDate(
          key === 'NgayBatDau' ? val : f.NgayBatDau,
          key === 'ThoiHanThang' ? val : f.ThoiHanThang
        );
      }
      return next;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post('/hopdong/create', {
        YeuCauThueID: createForm.YeuCauThueID,
        NgayBatDau: createForm.NgayBatDau,
        NgayKetThuc: createForm.NgayKetThuc,
        GiaThue: createForm.GiaThue,
        TienCoc: createForm.TienCoc,
        TienCocDaNhan: createForm.TienCocDaNhan,
        GhiChu: createForm.GhiChu,
      });
      setSuccess('Tạo hợp đồng thành công!');
      setShowCreate(false);
      fetchContracts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo hợp đồng thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleTerminate = async (id) => {
    if (!window.confirm('Xác nhận kết thúc hợp đồng này?')) return;
    try {
      await axios.put(`/hopdong/terminate/${id}`);
      setSuccess(' Đã kết thúc hợp đồng!');
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Hợp Đồng</h1>
            <p className="text-gray-500 mt-1">Tổng: {stats.total} hợp đồng</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTerminationModal(true)} className="relative flex items-center px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium rounded-lg transition-colors border border-rose-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Yêu cầu kết thúc
              {terminationRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {terminationRequests.length}
                </span>
              )}
            </button>
            <button onClick={fetchContracts} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
              Làm mới
            </button>
            <button onClick={openCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
            <button onClick={() => setError('')} className="text-red-500"></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Tổng', value: stats.total, color: 'border-l-blue-500', text: 'text-blue-600' },
            { label: 'Đang thuê', value: stats.active, color: 'border-l-green-500', text: 'text-green-600' },
            { label: 'Chờ ký', value: stats.pending, color: 'border-l-yellow-500', text: 'text-yellow-600' },
            { label: 'Hết hạn', value: stats.expired, color: 'border-l-red-500', text: 'text-red-600' },
            { label: 'Sắp hết hạn', value: stats.expiringSoon, color: 'border-l-orange-500', text: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${s.color}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Tìm mã căn hộ, tên người thuê..."
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
            <div className="text-5xl mb-3"></div>
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
                       Sắp hết hạn  Còn {days} ngày
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
                           <span className="font-semibold">{c.canho?.MaCanHo}</span>  Phòng {c.canho?.SoPhong} &nbsp;|&nbsp;
                           <span className="font-semibold">{c.nguoidung?.HoTen}</span>
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
                         Chi Tiết
                      </button>
                      <button onClick={async () => {
                          try {
                            const res = await axios.get(`/hopdong/${c.ID}`);
                            setSelectedContract(res.data.data);
                            setShowPreview(true);
                          } catch { setError('Không thể tải hợp đồng'); }
                        }}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200">
                        📄 Xem hợp đồng
                      </button>
                      {['DangThue', 'ChoKy'].includes(c.TrangThai) && (
                        <button onClick={() => handleTerminate(c.ID)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200">
                           Kết Thúc
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">Tạo Hợp Đồng Mới</h3>
              <button onClick={() => setShowCreate(false)} className="text-white hover:bg-white/20 rounded-full p-1 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">

              {/* Section: Chọn yêu cầu thuê */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Khách thuê</p>
                  <p className="text-xs text-gray-400 mb-3">Chọn từ danh sách yêu cầu đã duyệt</p>
                  <select required value={createForm.YeuCauThueID}
                    onChange={e => handleSelectRequest(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm">
                    <option value="">-- Chọn yêu cầu thuê đã duyệt --</option>
                    {approvedRequests.map(r => (
                      <option key={r.ID} value={r.ID}>
                        #{r.ID} — {r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen} — Căn hộ {r.canho?.MaCanHo} (P.{r.canho?.SoPhong})
                      </option>
                    ))}
                  </select>
                  {approvedRequests.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Không có yêu cầu thuê đã duyệt nào</p>
                  )}
                  {selectedRequest && (
                    <div className="mt-3 bg-green-50 rounded-xl p-3 text-sm grid grid-cols-2 gap-2">
                      <div><span className="text-gray-500">Người thuê:</span> <strong>{selectedRequest.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen}</strong></div>
                      <div><span className="text-gray-500">Căn hộ:</span> <strong>{selectedRequest.canho?.MaCanHo} — P.{selectedRequest.canho?.SoPhong}</strong></div>
                      <div><span className="text-gray-500">Tầng:</span> <strong>{selectedRequest.canho?.Tang}</strong></div>
                      <div><span className="text-gray-500">Diện tích:</span> <strong>{selectedRequest.canho?.DienTich} m²</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Thời hạn hợp đồng */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Thời hạn hợp đồng</p>
                  <p className="text-xs text-gray-400 mb-3">Dùng xác định ngày vào ở, văn bản hợp đồng...</p>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Thời hạn hợp đồng</label>
                    <select value={createForm.ThoiHanThang} onChange={e => setF('ThoiHanThang', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,18,24,36].map(m => (
                        <option key={m} value={m}>{m} tháng</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ngày vào ở <span className="text-red-500">*</span></label>
                      <input required type="date" value={createForm.NgayBatDau}
                        onChange={e => setF('NgayBatDau', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ngày đến hạn hợp đồng</label>
                      <input type="date" value={createForm.NgayKetThuc}
                        onChange={e => setF('NgayKetThuc', e.target.value)}
                        min={createForm.NgayBatDau}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Thông tin giá trị hợp đồng */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Thông tin giá trị hợp đồng</p>
                  <p className="text-xs text-gray-400 mb-3">Giá tiền phòng và mức tiền cọc sẽ thu</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Giá thuê (đ) <span className="text-red-500">*</span></label>
                      <input required type="number" min="0" value={createForm.GiaThue}
                        onChange={e => setF('GiaThue', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                        placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiền cọc (đ) <span className="text-red-500">*</span></label>
                      <input required type="number" min="0" value={createForm.TienCoc}
                        onChange={e => setF('TienCoc', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                        placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiền cọc đã nhận (đ)</label>
                      <input type="number" min="0" value={createForm.TienCocDaNhan}
                        onChange={e => setF('TienCocDaNhan', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                        placeholder="0" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Ghi chú</label>
                    <textarea rows={3} value={createForm.GhiChu}
                      onChange={e => setF('GhiChu', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                      placeholder="Ghi chú thêm về hợp đồng..." />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Hợp đồng sẽ ở trạng thái <strong>Chờ ký</strong> sau khi tạo</li>
                  <li>Người thuê cần ký hợp đồng để kích hoạt</li>
                  <li>Giá thuê và tiền cọc có thể chỉnh sửa khác với mặc định căn hộ</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold">
                  Hủy
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:opacity-60">
                  {creating ? 'Đang tạo...' : 'Tạo Hợp Đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Chi Tiết Hợp Đồng #{selectedContract.ID}</h3>
              <button onClick={() => setShowDetail(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">Trạng thái:</span>
                {getStatusBadge(selectedContract.TrangThai)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3"> Căn Hộ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Mã:</span><span className="font-semibold">{selectedContract.canho?.MaCanHo}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Phòng:</span><span className="font-semibold">{selectedContract.canho?.SoPhong}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tầng:</span><span className="font-semibold">{selectedContract.canho?.Tang}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Diện tích:</span><span className="font-semibold">{selectedContract.canho?.DienTich} m</span></div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3"> Người Thuê</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Họ tên:</span><span className="font-semibold">{selectedContract.nguoidung?.HoTen}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-semibold text-xs">{selectedContract.nguoidung?.Email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">SĐT:</span><span className="font-semibold">{selectedContract.nguoidung?.SoDienThoai}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3"> Thông Tin Hợp Đồng</h4>
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
                  <h4 className="font-bold text-gray-900 mb-3"> Hóa Đơn ({selectedContract.hoadon.length})</h4>
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

      {/* Tờ hợp đồng pháp lý */}
      {showPreview && selectedContract && (
        <HopDongPreview
          contract={selectedContract}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Yêu cầu kết thúc Modal */}
      {showTerminationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Yêu Cầu Kết Thúc Hợp Đồng
              </h3>
              <button onClick={() => setShowTerminationModal(false)} className="text-white hover:bg-white/20 rounded-full p-1 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-4">
              {terminationRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Không có yêu cầu kết thúc hợp đồng nào đang chờ xử lý.
                </div>
              ) : (
                terminationRequests.map(req => (
                  <div key={req.ID} className="bg-white p-5 rounded-xl shadow-sm border border-rose-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          Hợp đồng #{req.ID}
                          {getStatusBadge(req.TrangThai)}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold text-gray-800">Căn hộ {req.canho?.MaCanHo}</span> &nbsp;|&nbsp; {req.nguoidung?.HoTen}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Ngày yêu cầu</p>
                        <p className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                          {req.NgayYeuCauKetThuc ? new Date(req.NgayYeuCauKetThuc).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-rose-50 p-4 rounded-xl mb-4 text-sm text-rose-800 flex items-start gap-3 border border-rose-100">
                      <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-semibold block mb-1">Lý do yêu cầu:</span>
                        <div className="text-rose-900 leading-relaxed">{req.LyDoKetThuc || 'Không có lý do cụ thể'}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button onClick={() => {
                        setShowTerminationModal(false);
                        openDetail(req.ID);
                      }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                        Chi tiết HĐ
                      </button>
                      <button onClick={async () => {
                        if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu kết thúc này? Hợp đồng sẽ trở lại trạng thái bình thường.')) return;
                        try {
                          await axios.put(`/hopdong/reset-terminate/${req.ID}`);
                          setSuccess('Đã từ chối yêu cầu kết thúc hợp đồng!');
                          fetchContracts();
                        } catch(e) { setError(e.response?.data?.message || 'Lỗi khi từ chối yêu cầu'); }
                      }} className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Từ chối
                      </button>
                      <button onClick={() => {
                        handleTerminate(req.ID);
                        setShowTerminationModal(false);
                      }} className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors">
                        Đồng ý Kết thúc
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
