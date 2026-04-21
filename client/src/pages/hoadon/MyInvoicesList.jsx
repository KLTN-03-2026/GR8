// client/src/pages/hoadon/MyInvoicesList.jsx
// BƯỚC 3: Người thuê xem danh sách hóa đơn

import React, { useState, useEffect } from 'react';
import { getMyInvoices } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatCurrency';
import PaymentModal from '../../components/billing/PaymentModal';

const MyInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, ChuaTT, DaTT

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { TrangThai: filter } : {};
      const response = await getMyInvoices(params);
      setInvoices(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách hóa đơn');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      ChuaTT: 'bg-yellow-100 text-yellow-800',
      DaTT: 'bg-green-100 text-green-800',
      QuaHan: 'bg-red-100 text-red-800',
    };

    const labels = {
      ChuaTT: '💰 Chưa thanh toán',
      DaTT: '✅ Đã thanh toán',
      QuaHan: '⚠️ Quá hạn',
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            💳 Hóa Đơn Của Tôi
          </h2>
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('ChuaTT')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ChuaTT'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chưa thanh toán
          </button>
          <button
            onClick={() => setFilter('DaTT')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'DaTT'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Đã thanh toán
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl text-gray-600">Chưa có hóa đơn nào</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.ID}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Hóa Đơn #{invoice.MaHoaDon || invoice.ID}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Căn hộ: {invoice.hopdong?.canho?.MaCanHo} - Phòng {invoice.hopdong?.canho?.SoPhong}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tháng: {invoice.ThangNam}
                    </p>
                  </div>
                  {getStatusBadge(invoice.TrangThai)}
                </div>

                {/* Chi tiết hóa đơn */}
                <div className="mb-4 space-y-2">
                  {invoice.hoadonchitiet?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.MoTa}</span>
                      <span className="font-medium">{formatCurrency(item.SoTien)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TỔNG CỘNG:</span>
                      <span className="text-blue-600">{formatCurrency(invoice.TongTien)}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Ngày lập: {new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}</p>
                    <p>Hạn thanh toán: {new Date(invoice.NgayDenHan).toLocaleDateString('vi-VN')}</p>
                  </div>
                  
                  {invoice.TrangThai === 'ChuaTT' ? (
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      💳 Thanh Toán Ngay
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      👁️ Xem Chi Tiết
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          invoiceId={selectedInvoice.ID}
          onClose={() => {
            setShowPaymentModal(false);
            fetchInvoices(); // Refresh list
          }}
        />
      )}
    </div>
  );
};

export default MyInvoicesList;
