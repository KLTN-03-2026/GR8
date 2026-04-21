-- Add workflow fields to chisodiennuoc table
ALTER TABLE `chisodiennuoc` 
ADD COLUMN `AnhDongHoDien` VARCHAR(500) NULL AFTER `thang_nam_date`,
ADD COLUMN `AnhDongHoNuoc` VARCHAR(500) NULL AFTER `AnhDongHoDien`,
ADD COLUMN `TrangThai` ENUM('ChoDuyetKeToan', 'DaDuyet', 'DaPhatHanhHoaDon', 'TuChoi') DEFAULT 'ChoDuyetKeToan' AFTER `AnhDongHoNuoc`,
ADD COLUMN `KeToanDuyetID` INT NULL AFTER `TrangThai`,
ADD COLUMN `NgayKeToanDuyet` DATETIME NULL AFTER `KeToanDuyetID`,
ADD COLUMN `ChiSoDienChinhThuc` DECIMAL(10,2) NULL AFTER `NgayKeToanDuyet`,
ADD COLUMN `ChiSoNuocChinhThuc` DECIMAL(10,2) NULL AFTER `ChiSoDienChinhThuc`,
ADD COLUMN `GhiChuKeToan` TEXT NULL AFTER `ChiSoNuocChinhThuc`,
ADD INDEX `idx_chisodiennuoc_trangthai` (`TrangThai`);

-- Add VietQR payment fields to hoadon table
ALTER TABLE `hoadon`
ADD COLUMN `MaHoaDon` VARCHAR(50) NULL UNIQUE AFTER `thang_nam_date`,
ADD COLUMN `QRContent` TEXT NULL AFTER `MaHoaDon`,
ADD COLUMN `SoTaiKhoan` VARCHAR(50) NULL AFTER `QRContent`,
ADD COLUMN `NganHangNhan` VARCHAR(100) NULL AFTER `SoTaiKhoan`,
ADD COLUMN `NoiDungCK` VARCHAR(200) NULL AFTER `NganHangNhan`,
ADD INDEX `idx_hoadon_mahoadon` (`MaHoaDon`);
