-- Thêm ngày tính tiền riêng cho từng căn hộ
-- NULL = dùng giá trị mặc định trong billing.config.js
ALTER TABLE canho
  ADD COLUMN NgayTinhDien     TINYINT UNSIGNED NULL COMMENT 'Ngày trong tháng tính tiền điện (1-28)',
  ADD COLUMN NgayTinhNuoc     TINYINT UNSIGNED NULL COMMENT 'Ngày trong tháng tính tiền nước (1-28)',
  ADD COLUMN NgayTinhTienNha  TINYINT UNSIGNED NULL COMMENT 'Ngày trong tháng phát hành hóa đơn tổng (1-28)';
