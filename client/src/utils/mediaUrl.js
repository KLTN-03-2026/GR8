import axios from '../api/axios';

/**
 * Đường dẫn trong DB có thể là:
 * - URL đầy đủ: https://...
 * - Đường dẫn tương đối: /uploads/dongho/...
 * - Đường dẫn tuyệt đối Windows (legacy): D:\...\uploads\chisodiennuoc\...
 */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  const s = String(pathOrUrl).trim();

  // Đã là URL đầy đủ
  if (/^https?:\/\//i.test(s)) return s;

  const base = String(axios.defaults.baseURL || '')
    .replace(/\/api\/?$/, '')
    || 'http://localhost:5000';

  // Đường dẫn tuyệt đối Windows (legacy): D:\...\uploads\chisodiennuoc\filename.jpg
  // Trích xuất phần từ "uploads\" trở đi
  const winMatch = s.match(/uploads[\\\/](.+)$/i);
  if (winMatch) {
    const relativePart = winMatch[1].replace(/\\/g, '/');
    return `${base}/uploads/${relativePart}`;
  }

  // Đường dẫn tương đối /uploads/...
  const p = s.startsWith('/') ? s : `/${s}`;
  return `${base}${p}`;
}

/**
 * API trả `AnhCanHo`: mảng `{ ID, FileURL }` (hoặc legacy: chuỗi URL).
 */
export function normalizeAnhCanHoEntries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return { ID: null, FileURL: item };
      if (item && typeof item.FileURL === 'string') {
        return {
          ID: item.ID != null ? item.ID : null,
          FileURL: item.FileURL,
          IsFeatured: !!item.IsFeatured,
        };
      }
      return null;
    })
    .filter((x) => x && x.FileURL);
}

/**
 * Lấy URL ảnh nổi bật (IsFeatured) hoặc ảnh đầu tiên trong danh sách.
 */
export function getFeaturedImageUrl(anhCanHo) {
  const imgs = normalizeAnhCanHoEntries(anhCanHo);
  const featured = imgs.find(img => img.IsFeatured) || imgs[0];
  return featured ? resolveMediaUrl(featured.FileURL) : null;
}
