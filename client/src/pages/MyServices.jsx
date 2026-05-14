// client/src/pages/MyServices.jsx
// Người thuê xem danh sách dịch vụ và đặt dịch vụ

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import { useActiveContract } from '../hooks/useActiveContract';
import NoContractNotice from '../components/common/NoContractNotice';

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

const TRANG_THAI = {
  ChoXuLy: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
  DaXuLy:  { label: 'Đã xử lý',  color: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-500' },
};

//  Modal đặt dịch vụ 
const OrderModal = ({ service, canHoID, onClose, onOrdered }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { DichVuID: service.ID, GhiChu: ghiChu };
      if (canHoID) payload.CanHoID = canHoID;
      await axios.post('/dichvu/yeucau', payload);
      onOrdered();
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt dịch vụ thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Đặt dịch vụ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {/* Service info */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 border border-blue-100">
            <span className="text-4xl">{getIcon(service.TenDichVu)}</span>
            <div>
              <p className="font-bold text-gray-900">{service.TenDichVu}</p>
              {service.MoTa && <p className="text-sm text-gray-500 mt-0.5">{service.MoTa}</p>}
              <p className="text-blue-600 font-bold mt-1">{formatCurrency(service.Gia)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
            <textarea rows={3} value={ghiChu} onChange={e => setGhiChu(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Thời gian mong muốn, yêu cầu đặc biệt..." />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//  Trang chính 
const MyServices = ({ canHoID } = {}) => {
  const { hasActiveContract, loading: contractLoading } = useActiveContract();
  const [tab, setTab]           = useState('browse'); // 'browse' | 'history'
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [orderModal, setOrderModal] = useState(null);
  const [toast, setToast]       = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get('/dichvu');
      setServices((res.data?.data || []).filter(s => s.TrangThai === 'Active'));
    } catch { showToast(' Không thể tải danh sách dịch vụ'); }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await axios.get('/dichvu/yeucau/my');
      setMyRequests(res.data?.data || []);
    } catch { showToast('Không thể tải lịch sử yêu cầu'); }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchMyRequests()]);
      setLoading(false);
    };
    load();
  }, [fetchServices, fetchMyRequests]);

  const handleOrdered = () => {
    setOrderModal(null);
    showToast('Đặt dịch vụ thành công! Chúng tôi sẽ liên hệ sớm.');
    fetchMyRequests();
    setTab('history');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu dịch vụ này?')) return;
    setCancelingId(id);
    try {
      await axios.delete(`/dichvu/yeucau/${id}`);
      showToast('✅ Đã hủy yêu cầu');
      fetchMyRequests();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Hủy thất bại'));
    } finally { setCancelingId(null); }
  };

  // Lọc yêu cầu theo căn hộ đang xem
  const filteredRequests = canHoID
    ? myRequests.filter(r =>
        r.CanHoID === Number(canHoID) ||
        r.canho?.ID === Number(canHoID) ||
        String(r.CanHoID) === String(canHoID)
      )
    : myRequests;

  const pendingCount = filteredRequests.filter(r => r.TrangThai === 'ChoXuLy').length;

  // Show loading while checking contract
  if (contractLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  // Show notice if no active contract
  if (!hasActiveContract) {
    return (
      <NoContractNotice 
        title="Bạn chưa thuê căn hộ nào"
        message="Bạn cần có hợp đồng thuê căn hộ đang hoạt động để đặt dịch vụ."
      />
    );
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3 text-sm font-medium text-gray-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dịch vụ Tiện ích</h1>
        <p className="text-gray-500 text-sm">Đặt các dịch vụ hỗ trợ cho căn hộ của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('browse')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'browse' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Đặt dịch vụ
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{services.length}</span>
        </button>
        <button onClick={() => setTab('history')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Yêu cầu của tôi
          {pendingCount > 0 && (
            <span className="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
      </div>

      {/*  Tab: Đặt dịch vụ  */}
      {tab === 'browse' && (
        <>
          {services.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-lg">Hiện chưa có dịch vụ nào khả dụng.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.ID}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{getIcon(s.TenDichVu)}</span>
                    <div>
                      <p className="font-bold text-gray-900">{s.TenDichVu}</p>
                      <p className="text-blue-600 font-semibold text-sm">{formatCurrency(s.Gia)}</p>
                    </div>
                  </div>

                  {s.MoTa && (
                    <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3">{s.MoTa}</p>
                  )}

                  <button
                    onClick={() => setOrderModal(s)}
                    className="mt-auto w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Đặt dịch vụ
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/*  Tab: Lịch sử yêu cầu  */}
      {tab === 'history' && (
        <>
          {filteredRequests.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-lg">Bạn chưa có yêu cầu dịch vụ nào.</p>
              <button onClick={() => setTab('browse')}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Đặt dịch vụ ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(r => {
                const tt = TRANG_THAI[r.TrangThai];
                return (
                  <div key={r.ID}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
                    <span className="text-3xl flex-shrink-0">{getIcon(r.dichvu?.TenDichVu)}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{r.dichvu?.TenDichVu}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tt?.color}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${tt?.dot}`} />
                          {tt?.label}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>Căn hộ: {r.canho ? `${r.canho.MaCanHo} - P.${r.canho.SoPhong}` : ''}</span>
                        <span>Ngày đặt: {r.NgayYeuCau ? new Date(r.NgayYeuCau).toLocaleDateString('vi-VN') : ''}</span>
                        <span className="font-medium text-blue-500">{formatCurrency(r.dichvu?.Gia)}</span>
                      </div>
                      {r.GhiChu && <p className="text-xs text-gray-500 mt-1 italic">"{r.GhiChu}"</p>}
                    </div>

                    {r.TrangThai === 'ChoXuLy' && (
                      <button
                        disabled={cancelingId === r.ID}
                        onClick={() => handleCancel(r.ID)}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancelingId === r.ID ? '...' : 'Hủy'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal đặt dịch vụ */}
      {orderModal && (
        <OrderModal
          service={orderModal}
          canHoID={canHoID}
          onClose={() => setOrderModal(null)}
          onOrdered={handleOrdered}
        />
      )}
    </div>
  );
};

export default MyServices;
