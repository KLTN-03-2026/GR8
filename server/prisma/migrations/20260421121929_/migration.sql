-- RenameIndex
ALTER TABLE `chisodiennuoc` RENAME INDEX `idx_chisodiennuoc_trangthai` TO `chisodiennuoc_TrangThai_idx`;

-- RenameIndex
ALTER TABLE `hoadon` RENAME INDEX `MaHoaDon` TO `hoadon_MaHoaDon_key`;

-- RenameIndex
ALTER TABLE `hoadon` RENAME INDEX `idx_hoadon_mahoadon` TO `hoadon_MaHoaDon_idx`;
