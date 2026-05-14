-- Fix migration state
-- Run this in MySQL directly if needed

-- Check if columns exist
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'apartment_management' 
  AND TABLE_NAME = 'toanha' 
  AND COLUMN_NAME IN ('Latitude', 'Longitude', 'KinhDo', 'ViDo');

-- Add Latitude and Longitude if not exists
ALTER TABLE `toanha` 
    ADD COLUMN IF NOT EXISTS `Latitude` DECIMAL(10, 8) NULL,
    ADD COLUMN IF NOT EXISTS `Longitude` DECIMAL(11, 8) NULL;

-- Add DaKhaiBaoNgoaiTru if not exists
ALTER TABLE `nguoidung` 
    ADD COLUMN IF NOT EXISTS `DaKhaiBaoNgoaiTru` BOOLEAN NULL DEFAULT false;

-- Add HinhAnhHoanThanh to yeucausuco
ALTER TABLE `yeucausuco` 
    ADD COLUMN IF NOT EXISTS `HinhAnhHoanThanh` JSON NULL AFTER `HinhAnh`;
