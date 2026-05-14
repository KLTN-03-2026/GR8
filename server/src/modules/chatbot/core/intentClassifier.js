/**
 * Intent Classifier
 * Phân tích câu hỏi → trả về danh sách intent
 * Mỗi intent map tới một DB query cụ thể
 */

const INTENT_PATTERNS = [
  // Tài chính / Hóa đơn
  { intent: "invoices",        pattern: /hóa đơn|tiền điện|tiền nước|tiền thuê|phí|tháng này|tháng trước|nợ|công nợ/ },
  { intent: "payment_guide",   pattern: /cách thanh toán|thanh toán như thế nào|vnpay|chuyển khoản|trả tiền|nộp tiền/ },
  { intent: "overdue",         pattern: /quá hạn|chưa thanh toán|nợ quá hạn/ },
  { intent: "revenue",         pattern: /doanh thu|thống kê|báo cáo tài chính|thu nhập/ },
  { intent: "monthly_stats",   pattern: /thống kê tháng|doanh thu tháng|tháng \d/ },

  // Căn hộ
  { intent: "apartments",      pattern: /căn hộ|phòng|thuê|trống|còn phòng|tìm nhà|xem nhà|diện tích|giá thuê|tầng|mã căn|\d+\s*người|giới hạn|cho\s*\d+|dưới\s*\d+\s*(triệu|tr)|trên\s*\d+\s*(triệu|tr)|\d+\s*m[²2]?/ },
  { intent: "contracts",       pattern: /hợp đồng|ký hợp đồng|kết thúc hợp đồng|gia hạn|hết hạn/ },
  { intent: "rent_requests",   pattern: /yêu cầu thuê|đơn thuê|chờ duyệt|duyệt thuê/ },

  // Sự cố / Kỹ thuật
  { intent: "incidents",       pattern: /sự cố|hỏng|sửa chữa|báo hỏng|yêu cầu sửa|kỹ thuật|điện hỏng|nước hỏng|máy lạnh/ },
  { intent: "assigned_incidents", pattern: /sự cố của tôi|được phân công|việc của tôi|công việc/ },
  { intent: "new_incidents",   pattern: /sự cố mới|chưa phân công|cần xử lý/ },
  { intent: "meter_work",      pattern: /chỉ số điện nước|ghi chỉ số|đồng hồ điện|đồng hồ nước|chưa ghi/ },

  // Lịch trực
  { intent: "schedule",        pattern: /lịch trực|ca trực|lịch làm việc|ca làm/ },

  // Người dùng / Cư dân
  { intent: "tenants",         pattern: /người thuê|cư dân|danh sách người thuê|khách thuê/ },
  { intent: "meter_readings",  pattern: /chỉ số điện nước của tôi|điện nước tháng|tiêu thụ điện|tiêu thụ nước/ },
  { intent: "pending_readings",pattern: /chỉ số chờ duyệt|duyệt chỉ số|chờ kế toán/ },

  // Thông tin chung
  { intent: "services",        pattern: /dịch vụ|vệ sinh|giặt ủi|bảo trì|điều hòa|đăng ký dịch vụ/ },
  { intent: "amenities",       pattern: /tiện ích|hồ bơi|gym|bãi xe|thang máy|sân chơi/ },
  { intent: "renting_guide",   pattern: /quy trình thuê|cách thuê|thủ tục thuê|muốn thuê/ },
  { intent: "overview",        pattern: /tổng quan|tổng hợp|thống kê hệ thống|báo cáo tổng/ },
  { intent: "financial_overview", pattern: /tổng quan tài chính|tình hình tài chính|thu chi/ },
  { intent: "billing_info",    pattern: /cách tính điện|cách tính nước|giá điện|giá nước|bậc thang|evn|tiền điện tính như thế nào|tiền nước tính|công thức tính|đơn giá điện|đơn giá nước|tính tiền điện|tính tiền nước/ },
  { intent: "policies",        pattern: /chính sách|quy định|nội quy|điều khoản|tiền cọc|hợp đồng bao lâu|thông báo trước|phạt|gia hạn|chấm dứt hợp đồng/ },
  { intent: "contact",         pattern: /liên hệ|hotline|số điện thoại|email|địa chỉ|zalo|hỗ trợ|giờ làm việc/ },
];

/**
 * Phân tích message → trả về mảng intent strings
 * @param {string} message
 * @returns {string[]}
 */
export const classifyIntent = (message) => {
  const msg = message.toLowerCase().normalize("NFC");
  const matched = [];

  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(msg) && !matched.includes(intent)) {
      matched.push(intent);
    }
  }

  // Nếu không match gì → trả về intent chung
  return matched.length > 0 ? matched : ["general"];
};
