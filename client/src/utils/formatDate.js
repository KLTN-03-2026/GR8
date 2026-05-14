/**
 * Format utilities — Ngày giờ
 * Chuẩn toàn hệ thống:
 *   Ngày:     DD/MM/YYYY          (ví dụ: 09/05/2026)
 *   Ngày giờ: DD/MM/YYYY HH:mm   (ví dụ: 09/05/2026 10:30)
 *   Giờ:      HH:mm               (ví dụ: 10:30)
 *   Tháng:    MM/YYYY             (ví dụ: 05/2026)
 */

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Ngày: DD/MM/YYYY
 * @example formatDate("2026-05-09") → "09/05/2026"
 */
export const formatDate = (value) => {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Ngày giờ: DD/MM/YYYY HH:mm
 * @example formatDateTime("2026-05-09T10:30:00") → "09/05/2026 10:30"
 */
export const formatDateTime = (value) => {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Chỉ giờ: HH:mm
 * @example formatTime("2026-05-09T10:30:00") → "10:30"
 */
export const formatTime = (value) => {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Tháng/Năm: MM/YYYY
 * @example formatMonthYear("2026-05") → "05/2026"
 * @example formatMonthYear("2026-05-09") → "05/2026"
 */
export const formatMonthYear = (value) => {
  if (!value) return "—";
  // Hỗ trợ cả "2026-05" và "2026-05-09"
  const parts = String(value).split("-");
  if (parts.length >= 2) return `${parts[1]}/${parts[0]}`;
  return value;
};

/**
 * Giá trị cho input[type=date]: YYYY-MM-DD
 * @example formatDateForInput("09/05/2026") → "2026-05-09"
 */
export const formatDateForInput = (value) => {
  const d = toDate(value);
  if (!d) return "";
  return d.toISOString().split("T")[0];
};

/**
 * Thời gian tương đối
 * @example getRelativeTime(new Date(Date.now() - 60000)) → "1 phút trước"
 */
export const getRelativeTime = (value) => {
  const d = toDate(value);
  if (!d) return "—";
  const diffMs = Date.now() - d.getTime();
  const secs  = Math.floor(diffMs / 1000);
  const mins  = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (secs  <  60) return "Vừa xong";
  if (mins  <  60) return `${mins} phút trước`;
  if (hours <  24) return `${hours} giờ trước`;
  if (days  <  30) return `${days} ngày trước`;
  return formatDate(d);
};

/**
 * Số ngày giữa 2 mốc thời gian
 */
export const daysBetween = (start, end) => {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return 0;
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
};

export default formatDate;
