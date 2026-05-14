/**
 * Format utilities — Tiền tệ
 * Chuẩn: 900000 → "900,000 VNĐ"
 */

/**
 * Format số tiền VNĐ có ký hiệu
 * @example formatCurrency(900000) → "900,000 VNĐ"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "0 VNĐ";
  return num.toLocaleString("vi-VN") + " VNĐ";
};

/**
 * Format số tiền không có ký hiệu (dùng trong bảng, input)
 * @example formatNumber(900000) → "900,000"
 */
export const formatNumber = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
};

/**
 * Format số tiền rút gọn (dùng trong card, badge)
 * @example formatCurrencyShort(1500000) → "1.5M VNĐ"
 * @example formatCurrencyShort(900000)  → "900K VNĐ"
 */
export const formatCurrencyShort = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "0 VNĐ";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B VNĐ";
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace(".0", "") + "M VNĐ";
  if (num >= 1_000)         return (num / 1_000).toFixed(0) + "K VNĐ";
  return num + " VNĐ";
};

export default formatCurrency;
