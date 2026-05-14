-- Add missing columns to nguoidung table
-- This fixes the 500 Internal Server Error when loading user list

USE apartment_management;

-- Add missing columns to canho table
ALTER TABLE `canho` 
ADD COLUMN IF NOT EXISTS `GioiHanNguoiO` INT DEFAULT 2 AFTER `MoTa`;

-- Add AnhCCCDMatTruoc column if it doesn't exist
ALTER TABLE `nguoidung` 
ADD COLUMN IF NOT EXISTS `AnhCCCDMatTruoc` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `Avatar`;

-- Add AnhCCCDMatSau column if it doesn't exist
ALTER TABLE `nguoidung` 
ADD COLUMN IF NOT EXISTS `AnhCCCDMatSau` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `AnhCCCDMatTruoc`;

-- Add NgayCapCCCD column if it doesn't exist
ALTER TABLE `nguoidung` 
ADD COLUMN IF NOT EXISTS `NgayCapCCCD` DATE DEFAULT NULL AFTER `CCCD`;

-- Add NoiCapCCCD column if it doesn't exist
ALTER TABLE `nguoidung` 
ADD COLUMN IF NOT EXISTS `NoiCapCCCD` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `NgayCapCCCD`;

-- Add DaKhaiBaoNgoaiTru column if it doesn't exist
ALTER TABLE `nguoidung` 
ADD COLUMN IF NOT EXISTS `DaKhaiBaoNgoaiTru` TINYINT(1) DEFAULT 0 AFTER `VisaType`;

-- Verify the columns were added
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'apartment_management' 
    AND TABLE_NAME = 'nguoidung'
    AND COLUMN_NAME IN ('AnhCCCDMatTruoc', 'AnhCCCDMatSau', 'NgayCapCCCD', 'NoiCapCCCD', 'DaKhaiBaoNgoaiTru')
ORDER BY 
    ORDINAL_POSITION;
