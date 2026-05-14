-- Kiểm tra các cột mới đã được thêm
USE apartment_management;

-- Kiểm tra cột HinhAnhHoanThanh trong yeucausuco
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'apartment_management' 
  AND TABLE_NAME = 'yeucausuco' 
  AND COLUMN_NAME = 'HinhAnhHoanThanh';

-- Kiểm tra cột DaKhaiBaoNgoaiTru trong nguoidung
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'apartment_management' 
  AND TABLE_NAME = 'nguoidung' 
  AND COLUMN_NAME = 'DaKhaiBaoNgoaiTru';

-- Kiểm tra cột Latitude, Longitude trong toanha
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'apartment_management' 
  AND TABLE_NAME = 'toanha' 
  AND COLUMN_NAME IN ('Latitude', 'Longitude');
