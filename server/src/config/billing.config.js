/**
 * Billing Configuration
 * Cấu hình giá điện, nước, phí dịch vụ và thông tin ngân hàng
 */

module.exports = {
  // Đơn giá điện (VNĐ/kWh)
  ELECTRICITY_PRICE: 4000,

  // Đơn giá nước (VNĐ/m³)
  WATER_PRICE: 10000,

  // Phí chung cố định (VNĐ/tháng)
  COMMON_FEE: 200000,

  // Phí vệ sinh (VNĐ/tháng)
  CLEANING_FEE: 50000,

  // Thông tin ngân hàng nhận thanh toán
  BANK_INFO: {
    accountNumber: '1031312786',
    bankName: 'Vietcombank',
    accountName: 'CONG TY TNHH QUAN LY CAN HO',
    bankCode: 'VCB', // Mã ngân hàng cho VietQR
  },

  // Số ngày đến hạn thanh toán (tính từ ngày lập hóa đơn)
  PAYMENT_DUE_DAYS: 15,

  // Template nội dung chuyển khoản
  // {maHoaDon} sẽ được thay thế bằng mã hóa đơn thực tế
  TRANSFER_CONTENT_TEMPLATE: 'HD{maHoaDon}',

  // VietQR API endpoint (nếu sử dụng API tạo QR động)
  VIETQR_API: 'https://img.vietqr.io/image',
};
