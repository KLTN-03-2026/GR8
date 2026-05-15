// client/src/pages/admin/InvoiceManagement.jsx
// Quản lý hóa đơn cho Kế Toán / Quản Lý

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import MonthYearPicker from '../../components/common/MonthYearPicker';

const STATUS_CONFIG = {
  ChuaTT: { label: 'Chưa TT',  color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  ChoXacNhan: { label: 'Chờ XN', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  DaTT:   { label: 'Đã TT',    color: 'bg-green-100 text-green-800 border-green-300' },
  QuaHan: { label: 'Quá hạn',  color: 'bg-red-100 text-red-800 border-red-300' },
};

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', ThangNam: '', search: '' });
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0, totalPaid: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Debt management tab
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'debt'
  const [debtList, setDebtList] = useState([]);
  const [selectedDebts, setSelectedDebts] = useState(new Set());
  const [notificationForm, setNotificationForm] = useState({
    template: 'reminder',
    channels: { app: true, email: false },
    customMessage: '',
  });
  const [debtFilter, setDebtFilter] = useState({ search: '', overdueOnly: false });

  useEffect(() => { 
    if (activeTab === 'invoices') fetchInvoices();
    else if (activeTab === 'debt') fetchDebtList();
  }, [filter, activeTab]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filter.TrangThai) params.TrangThai = filter.TrangThai;
      if (filter.ThangNam) params.ThangNam = filter.ThangNam;

      const res = await axios.get('/hoadon', { params });
      let data = res.data.data || res.data.items || [];
      if (!Array.isArray(data)) data = [];

      // Local filter by search
      if (filter.search) {
        const s = filter.search.toLowerCase();
        data = data.filter(inv =>
          inv.MaHoaDon?.toLowerCase().includes(s) ||
          inv.hopdong?.canho?.MaCanHo?.toLowerCase().includes(s) ||
          inv.hopdong?.nguoidung?.HoTen?.toLowerCase().includes(s)
        );
      }

      setInvoices(data);
      const today = new Date();
      const s = data.reduce((a, inv) => {
        a.total++;
        if (inv.TrangThai === 'DaTT') { a.paid++; a.totalPaid += parseFloat(inv.TongTien || 0); }
        else {
          a.unpaid++;
          a.totalUnpaid += parseFloat(inv.TongTien || 0);
          if (inv.isOverdue || new Date(inv.NgayDenHan) < today) a.overdue++;
        }
        return a;
      }, { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0, totalPaid: 0 });
      setStats(s);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const fetchDebtList = async () => {
    try {
      setLoading(true);
      setError('');
      // Dùng endpoint mới trả về dữ liệu đã group sẵn
      const res = await axios.get('/hoadon/overdue-grouped');
      const data = res.data.data || [];
      setDebtList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách nợ');
    } finally {
      setLoading(false);
    }
  };

  const toggleDebtSelection = (canHoID) => {
    setSelectedDebts(prev => {
      const next = new Set(prev);
      next.has(canHoID) ? next.delete(canHoID) : next.add(canHoID);
      return next;
    });
  };

  const toggleAllDebts = () => {
    const currentVisibleIds = filteredDebtList.map(d => d.canHoID);
    const allSelected = currentVisibleIds.length > 0 && currentVisibleIds.every(id => selectedDebts.has(id));
    if (allSelected) setSelectedDebts(new Set());
    else setSelectedDebts(new Set(currentVisibleIds));
  };

  const handleSendNotifications = async (debtTarget = null) => {
    const targets = debtTarget ? [debtTarget] : debtList.filter(d => selectedDebts.has(d.canHoID));
    if (!debtTarget && targets.length === 0) {
      setError('Vui lòng chọn ít nhất 1 căn hộ');
      return;
    }

    const channels = Object.keys(notificationForm.channels).filter(k => notificationForm.channels[k]);
    if (channels.length === 0) {
      setError('Vui lòng chọn ít nhất 1 kênh gửi');
      return;
    }

    try {
      setLoading(true);
      const promises = targets.map(debt => {
        const message = notificationForm.customMessage ||
          `Kính gửi cư dân căn hộ ${debt.maCanHo}. Quản lý tòa nhà xin thông báo căn hộ của bạn hiện có ${debt.unpaidCount} hóa đơn chưa thanh toán, tổng số tiền ${formatCurrency(debt.totalDebt)}${debt.overdueCount > 0 ? `, trong đó ${debt.overdueCount} hóa đơn đã quá hạn` : ''}. Vui lòng thanh toán sớm để tránh phát sinh phí phạt.`;

        return axios.post('/thongbao', {
          NguoiNhanIDs: [debt.nguoiDungID],   // mảng ID người nhận
          TieuDe: notificationForm.template === 'final_reminder' ? 'Nhắc nhở nợ phí lần cuối' : 'Nhắc nhở nợ phí',
          NoiDung: message,
          Loai: 'NhacNo',                      // đúng field service nhận
          canHoCode: debt.maCanHo,             // để email hiển thị đúng căn hộ
          totalDebt: debt.totalDebt,
          overdueCount: debt.overdueCount,
        });
      });

      await Promise.all(promises);
      setSuccess(`Đã gửi thông báo đến ${targets.length} căn hộ`);
      if (!debtTarget) setSelectedDebts(new Set());
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi thông báo thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (id, phuongThuc = 'TienMat') => {
    const label = phuongThuc === 'TienMat' ? 'tiền mặt' : 'chuyển khoản';
    if (!window.confirm(`Xác nhận đã nhận ${label} cho hóa đơn này?`)) return;
    try {
      await axios.post(`/hoadon/${id}/confirm-payment`, { PhuongThuc: phuongThuc });
      setSuccess('Đã xác nhận thanh toán!');
      fetchInvoices();
      if (activeTab === 'debt') fetchDebtList();
      setShowDetail(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await axios.get(`/hoadon/${id}`);
      setSelectedInvoice(res.data.data);
      setShowDetail(true);
    } catch {
      setError('Không thể tải chi tiết hóa đơn');
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = status !== 'DaTT' && new Date(dueDate) < new Date();
    const key = isOverdue ? 'QuaHan' : status;
    const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.ChuaTT;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const filteredDebtList = debtList
    .filter(debt => {
      const keyword = debtFilter.search.toLowerCase();
      if (!keyword) return true;
      return (
        debt.maCanHo?.toLowerCase().includes(keyword) ||
        debt.chuHo?.toLowerCase().includes(keyword) ||
        debt.email?.toLowerCase().includes(keyword) ||
        debt.sdt?.toLowerCase().includes(keyword)
      );
    })
    .filter(debt => !debtFilter.overdueOnly || debt.overdueCount > 0);

  const debtStats = filteredDebtList.reduce((acc, debt) => {
    acc.apartments++;
    acc.totalDebt += debt.totalDebt;
    if (debt.overdueCount > 0) acc.overdueApartments++;
    acc.totalInvoices += debt.unpaidCount || debt.invoices?.length || 0;
    return acc;
  }, { apartments: 0, totalDebt: 0, overdueApartments: 0, totalInvoices: 0 });

  const selectedCount = selectedDebts.size;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Hóa Đơn & Nợ Phí</h1>
            <p className="text-gray-500 mt-1">
              {activeTab === 'debt'
                ? `Có ${debtStats.apartments} căn hộ nợ phí, tổng nợ ${formatCurrency(debtStats.totalDebt)}`
                : `Tổng: ${stats.total} hóa đơn, nợ hiện tại ${formatCurrency(stats.totalUnpaid)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'invoices' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              Hóa đơn
            </button>
            <button onClick={() => setActiveTab('debt')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'debt' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              Nợ phí
            </button>
            <button onClick={() => activeTab === 'debt' ? fetchDebtList() : fetchInvoices()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
              Làm mới
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

        {activeTab === 'invoices' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Tổng', value: stats.total, color: 'border-l-blue-500', text: 'text-blue-600' },
                { label: 'Đã TT', value: stats.paid, color: 'border-l-green-500', text: 'text-green-600' },
                { label: 'Chưa TT', value: stats.unpaid, color: 'border-l-yellow-500', text: 'text-yellow-600' },
                { label: 'Quá hạn', value: stats.overdue, color: 'border-l-red-500', text: 'text-red-600' },
                { label: 'Đã thu', value: formatCurrency(stats.totalPaid), color: 'border-l-emerald-500', text: 'text-emerald-600', small: true },
                { label: 'Còn nợ', value: formatCurrency(stats.totalUnpaid), color: 'border-l-rose-500', text: 'text-rose-600', small: true },
              ].map(s => (
                <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${s.color}`}>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`font-semibold ${s.small ? 'text-sm mt-1' : 'text-2xl'} ${s.text}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
              <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tất cả trạng thái</option>
                <option value="ChuaTT">Chưa thanh toán</option>
                <option value="DaTT">Đã thanh toán</option>
                <option value="QuaHan">Quá hạn</option>
              </select>
              <MonthYearPicker
                value={filter.ThangNam || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`}
                onChange={v => setFilter(f => ({ ...f, ThangNam: v }))}
              />
              <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Tìm mã HĐ, căn hộ, người thuê..."
                className="flex-1 min-w-48 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
              {(filter.TrangThai || filter.ThangNam || filter.search) && (
                <button onClick={() => setFilter({ TrangThai: '', ThangNam: '', search: '' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Xóa lọc</button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
            ) : invoices.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                <div className="text-5xl mb-3"></div>
                <p>Không tìm thấy hóa đơn</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Mã HĐ', 'Căn Hộ', 'Người Thuê', 'Tháng', 'Tổng Tiền', 'Hạn TT', 'Trạng Thái', 'Thao Tác'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map(inv => {
                        const isOverdue = inv.TrangThai !== 'DaTT' && new Date(inv.NgayDenHan) < new Date();
                        return (
                          <tr key={inv.ID} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{inv.MaHoaDon || `#${inv.ID}`}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{inv.hopdong?.canho?.MaCanHo}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{inv.hopdong?.nguoidung?.HoTen}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{inv.ThangNam}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(inv.TongTien)}</td>
                            <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              {new Date(inv.NgayDenHan).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(inv.TrangThai, inv.NgayDenHan)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => openDetail(inv.ID)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200">
                                  Chi tiết
                                </button>
                                {inv.thanhtoan?.some(tt => tt.AnhMinhChung) && (
                                  <button onClick={() => {
                                    const img = inv.thanhtoan.find(tt => tt.AnhMinhChung)?.AnhMinhChung;
                                    if (img) window.open(img, '_blank');
                                  }}
                                    className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600"
                                    title="Xem ảnh minh chứng">
                                    Xem ảnh
                                  </button>
                                )}
                                {['ChuaTT', 'ChoXacNhan'].includes(inv.TrangThai) && (
                                  <button onClick={() => handleConfirmPayment(inv.ID, inv.thanhtoan?.[0]?.PhuongThuc || 'TienMat')}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200"
                                    title="Xác nhận thanh toán">
                                    Xác nhận
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Căn hộ đang nợ', value: debtStats.apartments, color: 'border-blue-500', text: 'text-blue-600' },
                  { label: 'Tổng nợ', value: formatCurrency(debtStats.totalDebt), color: 'border-rose-500', text: 'text-rose-600', small: true },
                  { label: 'Căn hộ quá hạn', value: debtStats.overdueApartments, color: 'border-red-500', text: 'text-red-600' },
                  { label: 'Đã chọn', value: selectedCount, color: 'border-emerald-500', text: 'text-emerald-600' },
                ].map(s => (
                  <div key={s.label} className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.color}`}>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`font-bold ${s.small ? 'text-lg mt-1' : 'text-2xl'} ${s.text}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <input type="text" value={debtFilter.search} onChange={e => setDebtFilter(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Tìm căn hộ, người thuê, email, SĐT..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={debtFilter.overdueOnly} onChange={e => setDebtFilter(prev => ({ ...prev, overdueOnly: e.target.checked }))}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded" />
                  Chỉ quá hạn
                </label>
                {(debtFilter.search || debtFilter.overdueOnly) && (
                  <button onClick={() => setDebtFilter({ search: '', overdueOnly: false })}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">Xóa lọc</button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
              ) : filteredDebtList.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-16 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-500">Không có căn hộ nào nợ phí</p>
                  <p className="text-sm text-gray-400 mt-1">Tất cả hóa đơn đã được thanh toán</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input type="checkbox"
                                checked={filteredDebtList.length > 0 && filteredDebtList.every(d => selectedDebts.has(d.canHoID))}
                                onChange={toggleAllDebts}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                              Chọn tất cả
                            </label>
                          </th>
                          {['Căn Hộ', 'Chủ Hộ', 'Liên hệ', 'Hóa đơn', 'Tổng nợ', 'Quá hạn lâu nhất', 'Hành động'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredDebtList.map(debt => (
                          <tr key={debt.canHoID} className={`hover:bg-gray-50 transition-colors ${debt.overdueCount > 0 ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selectedDebts.has(debt.canHoID)} onChange={() => toggleDebtSelection(debt.canHoID)}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900">{debt.maCanHo}</div>
                              {debt.soPhong && <div className="text-xs text-gray-500">Phòng {debt.soPhong}{debt.tang ? ` - Tầng ${debt.tang}` : ''}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{debt.chuHo || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div>{debt.email || '—'}</div>
                              {debt.sdt && <div className="text-xs text-gray-400">{debt.sdt}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-semibold text-gray-900">{debt.unpaidCount}</span>
                              <span className="text-gray-500"> hóa đơn</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-rose-600">{formatCurrency(debt.totalDebt)}</td>
                            <td className="px-4 py-3 text-sm">
                              {debt.overdueCount > 0 ? (
                                <div>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                                    {debt.overdueCount} quá hạn
                                  </span>
                                  {debt.oldestDueDate && (
                                    <div className="text-xs text-red-500 mt-1">
                                      Từ {new Date(debt.oldestDueDate).toLocaleDateString('vi-VN')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Chưa quá hạn</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => openDetail(debt.invoices[0]?.ID)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
                                Xem HĐ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Bảng gửi thông báo</h2>
                    <p className="text-sm text-gray-500">Soạn nội dung thông báo và chọn kênh gửi trước khi gửi hàng loạt.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{selectedCount} đã chọn</span>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">Mẫu thông báo</label>
                    <select value={notificationForm.template} onChange={e => setNotificationForm(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm">
                      <option value="reminder">Nhắc nhở nợ phí thông thường</option>
                      <option value="final_reminder">Nhắc nhở nợ phí cuối cùng</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">Kênh gửi</label>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(notificationForm.channels).map(([key, value]) => (
                        <label key={key} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:border-green-400">
                          <input type="checkbox" checked={value} onChange={() => setNotificationForm(prev => ({ ...prev, channels: { ...prev.channels, [key]: !prev.channels[key] } }))} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                          {key === 'app' ? 'Ứng dụng' : key.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">Nội dung nhắc nợ</label>
                    <textarea value={notificationForm.customMessage} onChange={e => setNotificationForm(prev => ({ ...prev, customMessage: e.target.value }))}
                      rows={6}
                      placeholder="Nhập nội dung thông báo..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm text-gray-700" />
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 border border-gray-200">
                    <p className="font-semibold mb-2">Xem trước:</p>
                    <p>
                      {notificationForm.customMessage || `Kính gửi cư dân [Căn hộ]. Quý khách đang có khoản nợ phí dịch vụ đang chờ xử lý. Vui lòng hoàn tất nghĩa vụ tài chính trong thời gian sớm nhất.`}
                    </p>
                  </div>

                  <button onClick={() => handleSendNotifications()}
                    disabled={selectedCount === 0}
                    className={`w-full px-5 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${selectedCount === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {selectedCount === 0 ? 'Chọn căn hộ để gửi hàng loạt' : `Gửi hàng loạt cho ${selectedCount} căn hộ`}
                  </button>

                  <p className="text-xs text-gray-500">Ghi chú: hệ thống quản lý lưu lại thông báo và hỗ trợ gửi nhắc nhở qua Ứng dụng và Email.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">{selectedInvoice.MaHoaDon || `Hóa đơn #${selectedInvoice.ID}`}</h3>
              <button onClick={() => setShowDetail(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Trạng thái:</span>
                {getStatusBadge(selectedInvoice.TrangThai, selectedInvoice.NgayDenHan)}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Căn hộ:</span><span className="font-semibold">{selectedInvoice.hopdong?.canho?.MaCanHo}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Người thuê:</span><span className="font-semibold">{selectedInvoice.hopdong?.nguoidung?.HoTen}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tháng:</span><span className="font-semibold">{selectedInvoice.ThangNam}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Ngày lập:</span><span className="font-semibold">{new Date(selectedInvoice.NgayLap).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Hạn TT:</span><span className="font-semibold">{new Date(selectedInvoice.NgayDenHan).toLocaleDateString('vi-VN')}</span></div>
              </div>

              {selectedInvoice.hoadonchitiet?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">Chi Tiết Hóa Đơn</h4>
                  <div className="space-y-2">
                    {selectedInvoice.hoadonchitiet.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.MoTa}</span>
                        <span className="font-semibold">{formatCurrency(item.SoTien)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-200">
                      <span>TỔNG CỘNG</span>
                      <span className="text-green-600">{formatCurrency(selectedInvoice.TongTien)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedInvoice.NoiDungCK && (
                <div className="bg-yellow-50 p-4 rounded-xl text-sm">
                  <p className="font-semibold text-gray-700 mb-1">Nội dung chuyển khoản:</p>
                  <p className="font-mono text-yellow-800 font-bold">{selectedInvoice.NoiDungCK}</p>
                </div>
              )}

              {selectedInvoice.thanhtoan?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-xl text-sm">
                  <h4 className="font-bold text-gray-900 mb-3 border-b border-green-200 pb-1">Lịch Sử Thanh Toán</h4>
                  {selectedInvoice.thanhtoan.map((tt, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-600">{new Date(tt.NgayThanhToan).toLocaleDateString('vi-VN')}</span>
                        <span className="text-green-700">{formatCurrency(tt.SoTien)}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-gray-500">
                        <span>Phương thức: <span className="text-blue-600 font-semibold">{tt.PhuongThuc}</span></span>
                        {tt.MaGiaoDich && <span>Mã GD: {tt.MaGiaoDich}</span>}
                      </div>
                      {tt.AnhMinhChung && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ảnh minh chứng thanh toán:
                          </p>
                          <div className="relative group">
                            <img 
                              src={tt.AnhMinhChung} 
                              alt="Minh chứng" 
                              className="w-full max-h-64 object-contain rounded border border-gray-300 cursor-zoom-in transition-transform hover:scale-[1.02]"
                              onClick={() => window.open(tt.AnhMinhChung, '_blank')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none rounded">
                              <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-gray-700">Click để phóng to</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {tt.GhiChu && <div className="text-xs italic text-gray-400 mt-1">{tt.GhiChu}</div>}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowDetail(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Đóng</button>
                {['ChuaTT', 'ChoXacNhan'].includes(selectedInvoice.TrangThai) && (
                  <button onClick={() => handleConfirmPayment(selectedInvoice.ID, selectedInvoice.thanhtoan?.[0]?.PhuongThuc || 'TienMat')}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
                     Xác Nhận Thanh Toán
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

export default InvoiceManagement;
