// client/src/components/billing/PaymentModal.jsx
// Modal thanh toán hóa đơn với VietQR

import React, { useState, useEffect } from 'react';
import { getInvoiceDetail, markInvoiceAsPaid } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatCurrency';

const PaymentModal = ({ invoice: initialInvoice, onClose }) => {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentData, setPaymentData] = useState({
    PhuongThuc: 'ChuyenKhoan',
    MaGiaoDich: '',
    GhiChu: '',
  });

  useEffect(() => {
    if (initialInvoice?.ID) {
      fetchInvoiceDetail();
    }
  }, [initialInvoice?.ID]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoadingDetail(true);
      const response = await getInvoiceDetail(initialInvoice.ID);
      setInvoice(response.data);
    } catch (err) {
      console.error('Error fetching invoice detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await markInvoiceAsPaid(invoice.ID, paymentData);
      setSuccess('✅ Đã xác nhận thanh toán! Chờ kế toán kiểm tra.');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate VietQR URL
  const getQRUrl = () => {
    if (!invoice.SoTaiKhoan || !invoice.TongTien) return null;
    
    const bankCode = 'VCB'; // From billing config
    const accountNumber = invoice.SoTaiKhoan;
    const amount = invoice.TongTien;
    const content = invoice.NoiDungCK || `HD${invoice.MaHoaDon}`;
    
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
  };

  const qrUrl = getQRUrl();
  const isPaid = invoice.TrangThai === 'DaTT';

  if (loadingDetail) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className={`px-6 py-5 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl ${
          isPaid 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {isPaid ? '✅ Hóa Đơn Đã Thanh Toán' : '💳 Thanh Toán Hóa Đơn'}
            </h2>
            <p className="text-white text-opacity-90 text-sm">
              Mã hóa đơn: {invoice.MaHoaDon || invoice.ID} • Tháng {invoice.ThangNam}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Apartment Info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Thông Tin Căn Hộ
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mã căn hộ:</span>
                <span className="ml-2 font-semibold text-gray-900">{invoice.hopdong?.canho?.MaCanHo}</span>
              </div>
              <div>
                <span className="text-gray-600">Phòng:</span>
                <span className="ml-2 font-semibold text-gray-900">{invoice.hopdong?.canho?.SoPhong}</span>
              </div>
              <div>
                <span className="text-gray-600">Người thuê:</span>
                <span className="ml-2 font-semibold text-gray-900">{invoice.hopdong?.nguoidung?.HoTen}</span>
              </div>
              <div>
                <span className="text-gray-600">SĐT:</span>
                <span className="ml-2 font-semibold text-gray-900">{invoice.hopdong?.nguoidung?.SoDienThoai}</span>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Chi Tiết Hóa Đơn
            </h3>
            <div className="space-y-3">
              {invoice.hoadonchitiet?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700">{item.MoTa}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(item.SoTien)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 bg-blue-600 text-white rounded-lg px-4 mt-4">
                <span className="font-bold text-lg">TỔNG CỘNG</span>
                <span className="font-bold text-2xl">{formatCurrency(invoice.TongTien)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {!isPaid && qrUrl && (
            <div className="bg-white rounded-xl border-2 border-green-300 overflow-hidden">
              <div className="bg-green-600 px-6 py-3">
                <h3 className="font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Thông Tin Chuyển Khoản
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bank Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Ngân hàng</p>
                      <p className="font-bold text-gray-900 text-lg">{invoice.NganHangNhan}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Số tài khoản</p>
                      <p className="font-bold text-gray-900 text-lg">{invoice.SoTaiKhoan}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Số tiền</p>
                      <p className="font-bold text-green-600 text-xl">{formatCurrency(invoice.TongTien)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                      <p className="text-xs text-gray-600 mb-1">Nội dung chuyển khoản</p>
                      <p className="font-bold text-gray-900 text-lg">{invoice.NoiDungCK}</p>
                      <p className="text-xs text-red-600 mt-2">⚠️ Vui lòng ghi chính xác nội dung này</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
                      <img 
                        src={qrUrl} 
                        alt="VietQR Code" 
                        className="w-64 h-64 object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23f0f0f0" width="256" height="256"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3EQR Code%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      Quét mã QR để thanh toán nhanh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Confirmation Form */}
          {!isPaid ? (
            <form onSubmit={handlePayment} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Xác Nhận Đã Thanh Toán</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <select
                    name="PhuongThuc"
                    value={paymentData.PhuongThuc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ChuyenKhoan">Chuyển khoản</option>
                    <option value="TienMat">Tiền mặt</option>
                    <option value="VNPay">VNPay</option>
                    <option value="Momo">Momo</option>
                    <option value="ZaloPay">ZaloPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã giao dịch (nếu có)
                  </label>
                  <input
                    type="text"
                    name="MaGiaoDich"
                    value={paymentData.MaGiaoDich}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: FT21234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="GhiChu"
                    value={paymentData.GhiChu}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập ghi chú nếu có..."
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Sau khi xác nhận, kế toán sẽ kiểm tra và duyệt thanh toán của bạn.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    '✅ Xác Nhận Đã Thanh Toán'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Hóa đơn đã được thanh toán</h3>
                  <p className="text-green-700 text-sm">
                    Ngày thanh toán: {invoice.thanhtoan?.[0] && new Date(invoice.thanhtoan[0].NgayThanhToan).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              {invoice.thanhtoan?.[0] && (
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-semibold">{invoice.thanhtoan[0].PhuongThuc}</span>
                  </div>
                  {invoice.thanhtoan[0].MaGiaoDich && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã GD:</span>
                      <span className="font-semibold">{invoice.thanhtoan[0].MaGiaoDich}</span>
                    </div>
                  )}
                  {invoice.thanhtoan[0].GhiChu && (
                    <div>
                      <span className="text-gray-600">Ghi chú:</span>
                      <p className="text-gray-900 mt-1">{invoice.thanhtoan[0].GhiChu}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
