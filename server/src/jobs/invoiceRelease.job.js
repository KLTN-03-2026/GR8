// server/src/jobs/invoiceRelease.job.js
// Cron job: Tự động phát hành hóa đơn đúng ngày tính tiền của từng căn hộ

import { runDailyInvoiceRelease } from "../modules/chisodiennuoc/chisodiennuoc.service.js";

/**
 * Chạy hàng ngày lúc 00:05
 * Kiểm tra các chỉ số đã duyệt nhưng chưa phát hành hóa đơn
 * Phát hành nếu hôm nay >= ngày tính tiền nhà của căn hộ
 */
export const startInvoiceReleaseJob = () => {
  const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 giờ

  const run = async () => {
    const now = new Date();
    console.log(`[InvoiceJob] Chạy lúc ${now.toLocaleString('vi-VN')}`);
    try {
      const results = await runDailyInvoiceRelease();
      const ok  = results.filter(r => r.success).length;
      const err = results.filter(r => !r.success).length;
      console.log(`[InvoiceJob] Phát hành: ${ok} thành công, ${err} lỗi`);
      if (err > 0) {
        results.filter(r => !r.success).forEach(r =>
          console.error(`[InvoiceJob] Lỗi căn hộ ${r.maCanHo}: ${r.error}`)
        );
      }
    } catch (e) {
      console.error('[InvoiceJob] Lỗi nghiêm trọng:', e);
    }
  };

  // Chạy ngay khi khởi động (để catch up nếu server restart)
  run();

  // Lên lịch chạy hàng ngày
  setInterval(run, INTERVAL_MS);

  console.log('[InvoiceJob] Đã khởi động job phát hành hóa đơn tự động');
};
