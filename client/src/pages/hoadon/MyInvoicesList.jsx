// client/src/pages/hoadon/MyInvoicesList.jsx
// BƯỚC 3: Người thuê xem danh sách hóa đơn và thanh toán

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
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { TrangThai: filter } : {};
      const response = await getMyInvoices(params);
      const invoiceData = response.data.items || response.data || [];
      setInvoices(invoiceData);
      
      // Calculate stats
      const stats = invoiceData.reduce((acc, inv) => {
        acc.total++;
        if (inv.TrangThai === 'DaTT') acc.paid++;
        else acc.unpaid++;
        if (inv.TrangThai === 'ChuaTT') acc.totalAmount += parseFloat(inv.TongTien);
        return acc;
      }, { total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
      setStats(stats);
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

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    fetchInvoices(); // Refresh list
  };

  const getStatusBadge = (status) => {
    const configs = {
      ChuaTT: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: '💰',
        label: 'Chưa thanh toán'
      },
      DaTT: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✅',
        label: 'Đã thanh toán'
      },
      QuaHan: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: '⚠️',
        label: 'Quá hạn'
      },
    };

    const config = configs[status] || configs.ChuaTT;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${config.bg} ${config.text} ${config.border}`}>
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const isOverdue = (invoice) => {
    if (invoice.TrangThai === 'DaTT') return false;
    const dueDate = new Date(invoice.NgayDenHan);
    const today = new Date();
    return dueDate < today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💳 Hóa Đơn Của Tôi
              </h1>
              <p className="text-gray-600">Quản lý và thanh toán hóa đơn căn hộ</p>
            </div>
            <button
              onClick={fetchInvoices}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng hóa đơn</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đã thanh toán</p>
                  <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chưa thanh toán</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.unpaid}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng nợ</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setFilter('ChuaTT')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'ChuaTT'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chưa thanh toán ({stats.unpaid})
            </button>
            <button
              onClick={() => setFilter('DaTT')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'DaTT'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Đã thanh toán ({stats.paid})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hóa đơn nào</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Bạn chưa có hóa đơn nào trong hệ thống'
                : `Không có hóa đơn ${filter === 'ChuaTT' ? 'chưa thanh toán' : 'đã thanh toán'}`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => {
              const overdue = isOverdue(invoice);
              
              return (
                <div
                  key={invoice.ID}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                    overdue ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  {/* Overdue Banner */}
                  {overdue && (
                    <div className="bg-red-600 text-white px-6 py-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold">HÓA ĐƠN QUÁ HẠN - Vui lòng thanh toán ngay!</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Hóa Đơn #{invoice.MaHoaDon || invoice.ID}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Căn hộ: <span className="font-semibold ml-1">{invoice.hopdong?.canho?.MaCanHo} - Phòng {invoice.hopdong?.canho?.SoPhong}</span>
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Tháng: <span className="font-semibold ml-1">{invoice.ThangNam}</span>
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(invoice.TrangThai)}
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Chi tiết hóa đơn:</h4>
                      <div className="space-y-3">
                        {invoice.hoadonchitiet?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.MoTa}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.SoTien)}</span>
                          </div>
                        ))}
                        <div className="border-t-2 border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">TỔNG CỘNG:</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.TongTien)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates and Action */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Ngày lập:</span> {new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}
                        </p>
                        <p className={overdue ? 'text-red-600 font-semibold' : ''}>
                          <span className="font-medium">Hạn thanh toán:</span> {new Date(invoice.NgayDenHan).toLocaleDateString('vi-VN')}
                        </p>
                        {invoice.thanhtoan?.[0] && (
                          <p className="text-green-600 font-semibold">
                            <span className="font-medium">Đã thanh toán:</span> {new Date(invoice.thanhtoan[0].NgayThanhToan).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      
                      {invoice.TrangThai === 'ChuaTT' ? (
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                        >
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          Thanh Toán Ngay
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Xem Chi Tiết
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

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default MyInvoicesList;
