/**
 * Billing Configuration
 * Cấu hình giá điện, nước, phí dịch vụ và thông tin ngân hàng
 */

export default {
  // ── Giá điện EVN theo bậc thang (VNĐ/kWh) ──────────────────────────────
  // Áp dụng theo Quyết định 1062/QĐ-BCT
  // from/to là số kWh tích lũy, capacity = to - from (không +1)
  ELECTRICITY_TIERS: [
    { from: 0,   to: 50,       price: 1984 },   // Bậc 1: 50 kWh đầu
    { from: 50,  to: 100,      price: 2050 },   // Bậc 2: 50 kWh tiếp
    { from: 100, to: 200,      price: 2380 },   // Bậc 3: 100 kWh tiếp
    { from: 200, to: 300,      price: 2998 },   // Bậc 4: 100 kWh tiếp
    { from: 300, to: 400,      price: 3350 },   // Bậc 5: 100 kWh tiếp
    { from: 400, to: Infinity, price: 3460 },   // Bậc 6: từ 400 kWh trở lên
  ],

  // Đơn giá nước (VNĐ/m³)
  WATER_PRICE: 10000,

  // Phí chung cố định (VNĐ/tháng)
  COMMON_FEE: 200000,

  // Phí vệ sinh (VNĐ/tháng)
  CLEANING_FEE: 50000,

  // ── Ngày tính tiền mặc định (dùng khi căn hộ chưa cấu hình riêng) ──────
  // Ngày trong tháng mà hóa đơn tự động phát hành
  DEFAULT_NGAY_TINH_DIEN:    3,   // Ngày 3 hàng tháng
  DEFAULT_NGAY_TINH_NUOC:    2,   // Ngày 2 hàng tháng
  DEFAULT_NGAY_TINH_TIEN_NHA: 5,  // Ngày 5 hàng tháng (ngày phát hành hóa đơn tổng)

  // Thông tin ngân hàng nhận thanh toán
  BANK_INFO: {
    accountNumber: '1031312786',
    bankName: 'Vietcombank',
    accountName: 'CONG TY TNHH QUAN LY CAN HO',
    bankCode: 'VCB',
  },

  // Số ngày đến hạn thanh toán (tính từ ngày lập hóa đơn)
  PAYMENT_DUE_DAYS: 15,

  // Template nội dung chuyển khoản
  TRANSFER_CONTENT_TEMPLATE: 'HD{maHoaDon}',

  // VietQR API endpoint
  VIETQR_API: 'https://img.vietqr.io/image',
};
