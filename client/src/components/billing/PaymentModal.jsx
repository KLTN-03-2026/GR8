// client/src/components/billing/PaymentModal.jsx
// Modal thanh toán với QR code VietQR

import React, { useState, useEffect } from 'react';
import { getInvoiceById, markInvoiceAsPaid } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatCurrency';

const PaymentModal = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [transactionCode, setTransactionCode] = useState('');

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      setInvoice(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải chi tiết hóa đơn');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!transactionCode.trim()) {
      alert('Vui lòng nhập mã giao dịch');
      return;
    }

    if (!window.confirm('Xác nhận bạn đã chuyển khoản?')) {
      return;
    }

    try {
      setPaying(true);
      await markInvoiceAsPaid(invoiceId, {
        MaGiaoDich: transactionCode,
        GhiChu: 'Đã chuyển khoản qua VietQR',
      });
      alert('✅ Đã xác nhận thanh toán! Kế toán sẽ kiểm tra và xác nhận.');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
      console.error('Error:', err);
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`✅ Đã sao chép ${label}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-xl text-gray-600">⏳ Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-xl text-red-600">{error || 'Không tìm thấy hóa đơn'}</div>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const isPaid = invoice.TrangThai === 'DaTT';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {isPaid ? '✅ Hóa Đơn Đã Thanh Toán' : '💳 Thanh Toán Hóa Đơn'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Thông tin hóa đơn */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📄 Thông Tin Hóa Đơn</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Mã hóa đơn:</span>
                <span className="ml-2 font-semibold">{invoice.MaHoaDon || invoice.ID}</span>
              </div>
              <div>
                <span className="text-gray-600">Tháng:</span>
                <span className="ml-2 font-semibold">{invoice.ThangNam}</span>
              </div>
              <div>
                <span className="text-gray-600">Căn hộ:</span>
                <span className="ml-2 font-semibold">
                  {invoice.hopdong?.canho?.MaCanHo} - Phòng {invoice.hopdong?.canho?.SoPhong}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Hạn thanh toán:</span>
                <span className="ml-2 font-semibold">
                  {new Date(invoice.NgayDenHan).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Chi tiết hóa đơn */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">📋 Chi Tiết</h4>
            <div className="space-y-2">
              {invoice.hoadonchitiet?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-200">
                  <span className="text-gray-700">{item.MoTa}</span>
                  <span className="font-semibold">{formatCurrency(item.SoTien)}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                <span>TỔNG CỘNG:</span>
                <span className="text-blue-600">{formatCurrency(invoice.TongTien)}</span>
              </div>
            </div>
          </div>

          {!isPaid && (
            <>
              {/* QR Code */}
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4 text-center text-lg">
                  📱 Quét Mã QR Để Thanh Toán
                </h4>
                
                <div className="flex justify-center mb-4">
                  <img
                    src={invoice.qrUrl}
                    alt="VietQR Code"
                    className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=QR+Code';
                    }}
                  />
                </div>

                {/* Thông tin ngân hàng */}
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🏦 Ngân hàng:</span>
                    <span className="font-semibold">{invoice.NganHangNhan}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">💳 Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{invoice.SoTaiKhoan}</span>
                      <button
                        onClick={() => copyToClipboard(invoice.SoTaiKhoan, 'số tài khoản')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">💰 Số tiền:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(invoice.TongTien)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(invoice.TongTien.toString(), 'số tiền')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">📝 Nội dung:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{invoice.NoiDungCK}</span>
                      <button
                        onClick={() => copyToClipboard(invoice.NoiDungCK, 'nội dung')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Xác nhận thanh toán */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">
                  ✅ Xác Nhận Đã Chuyển Khoản
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Sau khi chuyển khoản thành công, vui lòng nhập mã giao dịch và xác nhận.
                </p>
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  placeholder="Nhập mã giao dịch (VD: FT24042112345678)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <button
                  onClick={handleMarkAsPaid}
                  disabled={paying}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    paying
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {paying ? '⏳ Đang xử lý...' : '✅ Tôi Đã Chuyển Khoản'}
                </button>
              </div>

              {/* Hướng dẫn */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">📌 Hướng Dẫn:</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Mở app ngân hàng của bạn</li>
                  <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
                  <li>Kiểm tra kỹ số tiền và nội dung</li>
                  <li>Xác nhận chuyển khoản</li>
                  <li>Nhập mã giao dịch và click "Tôi đã chuyển khoản"</li>
                </ol>
              </div>
            </>
          )}

          {isPaid && (
            <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-green-800 mb-2">
                Hóa Đơn Đã Được Thanh Toán
              </h4>
              <p className="text-green-700">
                Cảm ơn bạn đã thanh toán đúng hạn!
              </p>
              {invoice.thanhtoan?.[0] && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Ngày thanh toán: {new Date(invoice.thanhtoan[0].NgayThanhToan).toLocaleDateString('vi-VN')}</p>
                  {invoice.thanhtoan[0].MaGiaoDich && (
                    <p>Mã giao dịch: {invoice.thanhtoan[0].MaGiaoDich}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
