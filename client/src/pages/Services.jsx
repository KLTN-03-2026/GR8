// client/src/pages/Services.jsx
// Quản lý dịch vụ tiện ích theo yêu cầu (dọn phòng, giặt ủi...)
// Tab 1: Danh mục dịch vụ (CRUD)
// Tab 2: Yêu cầu từ cư dân (duyệt)

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';

const SERVICE_ICONS = {
  'dọn': '', 'don': '',
  'giặt': '', 'giat': '',
  'sửa': '', 'sua': '',
  'điện': '', 'dien': '',
  'nước': '', 'nuoc': '',
  'bảo vệ': '', 'bao ve': '',
  'vệ sinh': '', 've sinh': '',
  'chuyển': '', 'chuyen': '',
  'internet': '', 'wifi': '',
  'điều hòa': '', 'dieu hoa': '',
};

const getIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '';
};

const TRANG_THAI_YC = {
  ChoXuLy: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  DaXuLy:  { label: 'Đã xử lý',  color: 'bg-green-100 text-green-800 border-green-200' },
};

//  Modal thêm/sửa dịch vụ 
const ServiceModal = ({ service, onClose, onSaved }) => {
  const isEdit = !!service;
  const [form, setForm] = useState(
    isEdit
      ? { TenDichVu: service.TenDichVu, MoTa: service.MoTa || '', Gia: service.Gia, TrangThai: service.TrangThai }
      : { TenDichVu: '', MoTa: '', Gia: '', TrangThai: 'Active' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEdit) await axios.put(`/dichvu/${service.ID}`, form);
      else await axios.post('/dichvu', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
            <input required value={form.TenDichVu} onChange={e => set('TenDichVu', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: Dọn phòng, Giặt ủi, Sửa điện..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea rows={3} value={form.MoTa} onChange={e => set('MoTa', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Mô tả chi tiết dịch vụ..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
              <input required type="number" min="0" value={form.Gia} onChange={e => set('Gia', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select value={form.TrangThai} onChange={e => set('TrangThai', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//  Trang chính 
const Services = () => {
  const location = useLocation();
  const [tab, setTab]           = useState('services');
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]     = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'requests' || tabParam === 'services') {
      setTab(tabParam);
    }
  }, [location.search]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get('/dichvu');
      setServices(res.data?.data || []);
    } catch { showToast(' Không thể tải danh sách dịch vụ'); }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const params = filterStatus ? { TrangThai: filterStatus } : {};
      const res = await axios.get('/dichvu/yeucau', { params });
      setRequests(res.data?.data || []);
    } catch { showToast(' Không thể tải yêu cầu dịch vụ'); }
  }, [filterStatus]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchRequests()]);
      setLoading(false);
    };
    load();
  }, [fetchServices, fetchRequests]);

  const handleToggleStatus = async (s) => {
    try {
      const newStatus = s.TrangThai === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`/dichvu/${s.ID}`, { TrangThai: newStatus });
      showToast(newStatus === 'Active' ? ' Đã kích hoạt' : ' Đã tạm ngưng');
      fetchServices();
    } catch (err) { showToast(' ' + (err.response?.data?.message || 'Thất bại')); }
  };

  const handleDuyet = async (id) => {
    setProcessingId(id);
    try {
      await axios.put(`/dichvu/yeucau/${id}`, { TrangThai: 'DaXuLy' });
      showToast(' Đã xác nhận xử lý');
      fetchRequests();
    } catch (err) { showToast(' ' + (err.response?.data?.message || 'Thất bại')); }
    finally { setProcessingId(null); }
  };

  const filteredServices = services.filter(s =>
    !search || s.TenDichVu.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.TrangThai === 'ChoXuLy').length;
  const activeCount  = services.filter(s => s.TrangThai === 'Active').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3 text-sm font-medium text-gray-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Dịch vụ</h1>
          <p className="text-gray-500 text-sm mt-0.5">Dịch vụ theo yêu cầu: dọn phòng, giặt ủi, sửa chữa...</p>
        </div>
        {tab === 'services' && (
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow">
            <span className="text-lg leading-none">+</span> Thêm dịch vụ
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tổng dịch vụ',   value: services.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Đang hoạt động', value: activeCount,      color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Chờ xử lý',      value: pendingCount,     color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('services')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Danh mục dịch vụ
        </button>
        <button onClick={() => setTab('requests')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Yêu cầu từ cư dân
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
      </div>

      {/*  Tab: Danh mục  */}
      {tab === 'services' && (
        <>
          <div className="flex gap-3 mb-5">
            <input type="text" placeholder="Tìm dịch vụ..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <span className="ml-auto text-sm text-gray-400 self-center">{filteredServices.length} dịch vụ</span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-lg">Chưa có dịch vụ nào.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(s => (
                <div key={s.ID}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 ${
                    s.TrangThai === 'Inactive' ? 'opacity-60' : ''
                  } border-gray-200`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{getIcon(s.TenDichVu)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{s.TenDichVu}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.TrangThai === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.TrangThai === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </div>
                  </div>
                  {s.MoTa && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.MoTa}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(s.Gia)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(s)}
                        className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">
                        Sửa
                      </button>
                      <button onClick={() => handleToggleStatus(s)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg border ${
                          s.TrangThai === 'Active'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}>
                        {s.TrangThai === 'Active' ? 'Ngưng' : 'Kích hoạt'}
                      </button>
                    </div>
                  </div>
                  {s._count?.yeucaudichvu > 0 && (
                    <p className="mt-2 text-xs text-gray-400">{s._count.yeucaudichvu} yêu cầu đã nhận</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/*  Tab: Yêu cầu  */}
      {tab === 'requests' && (
        <>
          <div className="flex gap-3 mb-5">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Tất cả trạng thái</option>
              {Object.entries(TRANG_THAI_YC).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span className="ml-auto text-sm text-gray-400 self-center">{requests.length} yêu cầu</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center text-gray-400 py-20 text-lg">Không có yêu cầu nào.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow border border-gray-100">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['#', 'Dịch vụ', 'Cư dân', 'Căn hộ', 'Ngày yêu cầu', 'Ghi chú', 'Trạng thái', 'Thao tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(r => {
                    const tt = TRANG_THAI_YC[r.TrangThai];
                    return (
                      <tr key={r.ID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">#{r.ID}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{getIcon(r.dichvu?.TenDichVu)}</span>
                            <div>
                              <p className="font-medium text-gray-900">{r.dichvu?.TenDichVu}</p>
                              <p className="text-xs text-gray-400">{formatCurrency(r.dichvu?.Gia)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{r.nguoidung?.HoTen}</p>
                          <p className="text-xs text-gray-400">{r.nguoidung?.SoDienThoai}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.canho ? `${r.canho.MaCanHo} - P.${r.canho.SoPhong}` : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {r.NgayYeuCau ? new Date(r.NgayYeuCau).toLocaleDateString('vi-VN') : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{r.GhiChu || ''}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tt?.color}`}>
                            {tt?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.TrangThai === 'ChoXuLy' && (
                            <button disabled={processingId === r.ID} onClick={() => handleDuyet(r.ID)}
                              className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">
                              {processingId === r.ID ? '...' : ' Xác nhận'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modal && (
        <ServiceModal
          service={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(' Lưu thành công'); fetchServices(); }}
        />
      )}
    </div>
  );
};

export default Services;
