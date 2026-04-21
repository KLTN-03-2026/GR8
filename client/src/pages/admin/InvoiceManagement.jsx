// client/src/pages/admin/InvoiceManagement.jsx
// Quản lý hóa đơn cho Kế Toán / Quản Lý

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_CONFIG = {
  ChuaTT: { label: 'Chưa TT',  color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '💰' },
  DaTT:   { label: 'Đã TT',    color: 'bg-green-100 text-green-800 border-green-300',    icon: '✅' },
  QuaHan: { label: 'Quá hạn',  color: 'bg-red-100 text-red-800 border-red-300',          icon: '⚠️' },
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

  useEffect(() => { fetchInvoices(); }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filter.TrangThai) params.TrangThai = filter.TrangThai;
      if (filter.ThangNam) params.ThangNam = filter.ThangNam;

      const res = await axios.get('/hoadon');
      let data = res.data.data || res.data.items || [];
      if (!Array.isArray(data)) data = [];

      // Local filter
      if (filter.search) {
        const s = filter.search.toLowerCase();
        data = data.filter(inv =>
          inv.MaHoaDon?.toLowerCase().includes(s) ||
          inv.hopdong?.canho?.MaCanHo?.toLowerCase().includes(s) ||
          inv.hopdong?.nguoidung?.HoTen?.toLowerCase().includes(s)
        );
      }
      if (filter.TrangThai) data = data.filter(inv => inv.TrangThai === filter.TrangThai);
      if (filter.ThangNam) data = data.filter(inv => inv.ThangNam === filter.ThangNam);

      setInvoices(data);
      const today = new Date();
      const s = data.reduce((a, inv) => {
        a.total++;
        if (inv.TrangThai === 'DaTT') { a.paid++; a.totalPaid += parseFloat(inv.TongTien || 0); }
        else {
          a.unpaid++;
          a.totalUnpaid += parseFloat(inv.TongTien || 0);
          if (new Date(inv.NgayDenHan) < today) a.overdue++;
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

  const handleConfirmPayment = async (id) => {
    if (!window.confirm('Xác nhận đã nhận thanh toán cho hóa đơn này?')) return;
    try {
      await axios.post(`/hoadon/${id}/mark-paid`);
      setSuccess('✅ Đã xác nhận thanh toán!');
      fetchInvoices();
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
        <span className="mr-1">{cfg.icon}</span>{cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💳 Quản Lý Hóa Đơn</h1>
            <p className="text-gray-500 mt-1">Tổng: {stats.total} hóa đơn</p>
          </div>
          <button onClick={fetchInvoices} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            🔄 Làm mới
          </button>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Tổng', value: stats.total, color: 'border-blue-500', text: 'text-blue-600' },
            { label: 'Đã TT', value: stats.paid, color: 'border-green-500', text: 'text-green-600' },
            { label: 'Chưa TT', value: stats.unpaid, color: 'border-yellow-500', text: 'text-yellow-600' },
            { label: 'Quá hạn', value: stats.overdue, color: 'border-red-500', text: 'text-red-600' },
            { label: 'Đã thu', value: formatCurrency(stats.totalPaid), color: 'border-emerald-500', text: 'text-emerald-600', small: true },
            { label: 'Còn nợ', value: formatCurrency(stats.totalUnpaid), color: 'border-rose-500', text: 'text-rose-600', small: true },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.color}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`font-bold ${s.small ? 'text-sm mt-1' : 'text-3xl'} ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="ChuaTT">Chưa thanh toán</option>
            <option value="DaTT">Đã thanh toán</option>
          </select>
          <input type="month" value={filter.ThangNam} onChange={e => setFilter(f => ({ ...f, ThangNam: e.target.value }))}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
          <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Tìm mã HĐ, căn hộ, người thuê..."
            className="flex-1 min-w-48 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
          {(filter.TrangThai || filter.ThangNam || filter.search) && (
            <button onClick={() => setFilter({ TrangThai: '', ThangNam: '', search: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Xóa lọc</button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">💳</div>
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
                        <td className="px-4 py-3">{getStatusBadge(inv.TrangThai, inv.NgayDenHan)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openDetail(inv.ID)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200">
                              Chi tiết
                            </button>
                            {inv.TrangThai === 'ChuaTT' && (
                              <button onClick={() => handleConfirmPayment(inv.ID)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200">
                                Xác nhận TT
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
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">💳 {selectedInvoice.MaHoaDon || `Hóa đơn #${selectedInvoice.ID}`}</h3>
              <button onClick={() => setShowDetail(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
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
                  <h4 className="font-bold text-gray-900 mb-2">Lịch Sử Thanh Toán</h4>
                  {selectedInvoice.thanhtoan.map((tt, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{new Date(tt.NgayThanhToan).toLocaleDateString('vi-VN')}</span>
                      <span className="font-semibold text-green-700">{formatCurrency(tt.SoTien)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowDetail(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Đóng</button>
                {selectedInvoice.TrangThai === 'ChuaTT' && (
                  <button onClick={() => handleConfirmPayment(selectedInvoice.ID)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    ✅ Xác Nhận Đã TT
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
