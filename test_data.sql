-- Script tạo dữ liệu test cho trang chủ tenant
-- Chạy script này sau khi đã có database structure

-- 1. Tạo tòa nhà với tọa độ (nếu chưa có)
INSERT INTO toanha (TenToaNha, DiaChi, SoTang, Latitude, Longitude)
VALUES 
  ('Tòa A - SmartBuilding', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 10, 10.7769, 106.7009),
  ('Tòa B - SmartBuilding', '125 Nguyễn Văn Linh, Quận 7, TP.HCM', 10, 10.7771, 106.7011)
ON DUPLICATE KEY UPDATE 
  Latitude = VALUES(Latitude), 
  Longitude = VALUES(Longitude),
  DiaChi = VALUES(DiaChi);

-- 2. Tạo căn hộ trống để hiển thị trên trang chủ
INSERT INTO canho (MaCanHo, ToaNhaID, Tang, SoPhong, DienTich, GiaThue, TienCoc, TrangThai, GioiHanNguoiO)
VALUES 
  ('A101', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 1, 2, 50, 5000000, 10000000, 'Trong', 4),
  ('A102', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 1, 3, 70, 7000000, 14000000, 'Trong', 6),
  ('A201', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 2, 2, 50, 5000000, 10000000, 'Trong', 4),
  ('A202', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 2, 3, 70, 7000000, 14000000, 'Trong', 6),
  ('A301', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 3, 2, 55, 5500000, 11000000, 'Trong', 4),
  ('A302', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa A%' LIMIT 1), 3, 3, 75, 7500000, 15000000, 'Trong', 6),
  ('B101', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa B%' LIMIT 1), 1, 2, 55, 5500000, 11000000, 'Trong', 4),
  ('B102', (SELECT ID FROM toanha WHERE TenToaNha LIKE 'Tòa B%' LIMIT 1), 1, 3, 75, 7500000, 15000000, 'Trong', 6)
ON DUPLICATE KEY UPDATE 
  TrangThai = VALUES(TrangThai),
  GiaThue = VALUES(GiaThue),
  TienCoc = VALUES(TienCoc);

-- 3. Tạo tài khoản tenant test (nếu chưa có)
-- Mật khẩu: 123456
INSERT INTO nguoidung (HoTen, Email, MatKhau, SoDienThoai, VaiTroID, TrangThai)
VALUES (
  'Nguyễn Văn Test', 
  'tenant@test.com', 
  '$2a$10$YourHashedPasswordHere', 
  '0901234567',
  (SELECT ID FROM vaitro WHERE TenVaiTro = 'NguoiThue' LIMIT 1),
  'HoatDong'
)
ON DUPLICATE KEY UPDATE 
  HoTen = VALUES(HoTen),
  SoDienThoai = VALUES(SoDienThoai);

-- 4. Tạo hợp đồng đang thuê cho tenant
INSERT INTO hopdong (CanHoID, NguoiThueID, NgayBatDau, NgayKetThuc, GiaThue, TienCoc, TrangThai, NgayTao)
SELECT 
  (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1),
  (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1),
  '2024-01-01',
  '2025-12-31',
  5000000,
  10000000,
  'DangThue',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM hopdong 
  WHERE NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
  AND TrangThai IN ('DangThue', 'DaKy')
);

-- 5. Cập nhật trạng thái căn hộ thành đang thuê
UPDATE canho 
SET TrangThai = 'DangThue'
WHERE MaCanHo = 'A101';

-- 6. Tạo hóa đơn chưa thanh toán
INSERT INTO hoadon (HopDongID, ThangNam, TongTien, TrangThai, NgayTao, HanThanhToan)
SELECT 
  hd.ID,
  DATE_FORMAT(NOW(), '%Y-%m'),
  5500000,
  'ChuaThanhToan',
  NOW(),
  DATE_ADD(NOW(), INTERVAL 7 DAY)
FROM hopdong hd
WHERE hd.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.TrangThai = 'DangThue'
AND NOT EXISTS (
  SELECT 1 FROM hoadon 
  WHERE HopDongID = hd.ID 
  AND ThangNam = DATE_FORMAT(NOW(), '%Y-%m')
);

-- 7. Tạo chi tiết hóa đơn
INSERT INTO chitiethoadon (HoaDonID, TenKhoanThu, SoTien, GhiChu)
SELECT 
  hd.ID,
  'Tiền thuê nhà',
  5000000,
  'Tiền thuê tháng ' || DATE_FORMAT(NOW(), '%m/%Y')
FROM hoadon hd
JOIN hopdong hdong ON hd.HopDongID = hdong.ID
WHERE hdong.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.ThangNam = DATE_FORMAT(NOW(), '%Y-%m')
AND NOT EXISTS (
  SELECT 1 FROM chitiethoadon 
  WHERE HoaDonID = hd.ID 
  AND TenKhoanThu = 'Tiền thuê nhà'
);

INSERT INTO chitiethoadon (HoaDonID, TenKhoanThu, SoTien, GhiChu)
SELECT 
  hd.ID,
  'Tiền điện',
  300000,
  'Điện tháng ' || DATE_FORMAT(NOW(), '%m/%Y')
FROM hoadon hd
JOIN hopdong hdong ON hd.HopDongID = hdong.ID
WHERE hdong.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.ThangNam = DATE_FORMAT(NOW(), '%Y-%m')
AND NOT EXISTS (
  SELECT 1 FROM chitiethoadon 
  WHERE HoaDonID = hd.ID 
  AND TenKhoanThu = 'Tiền điện'
);

INSERT INTO chitiethoadon (HoaDonID, TenKhoanThu, SoTien, GhiChu)
SELECT 
  hd.ID,
  'Tiền nước',
  200000,
  'Nước tháng ' || DATE_FORMAT(NOW(), '%m/%Y')
FROM hoadon hd
JOIN hopdong hdong ON hd.HopDongID = hdong.ID
WHERE hdong.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.ThangNam = DATE_FORMAT(NOW(), '%Y-%m')
AND NOT EXISTS (
  SELECT 1 FROM chitiethoadon 
  WHERE HoaDonID = hd.ID 
  AND TenKhoanThu = 'Tiền nước'
);

-- 8. Tạo yêu cầu thuê đang xử lý
INSERT INTO yeucauthue (NguoiThueID, CanHoID, NgayYeuCau, TrangThai, GhiChu)
SELECT 
  (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1),
  (SELECT ID FROM canho WHERE MaCanHo = 'A201' LIMIT 1),
  NOW(),
  'DangXuLy',
  'Muốn thuê căn hộ 2 phòng ngủ'
WHERE NOT EXISTS (
  SELECT 1 FROM yeucauthue 
  WHERE NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
  AND CanHoID = (SELECT ID FROM canho WHERE MaCanHo = 'A201' LIMIT 1)
);

-- 9. Tạo tài sản trong căn hộ
INSERT INTO taisan (TenTaiSan, LoaiTaiSan, TrangThai, CanHoID, GiaTriUocTinh, NgayMua)
SELECT 
  'Tủ lạnh Samsung',
  'Điện tử',
  'TotDep',
  (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1),
  8000000,
  '2023-01-15'
WHERE NOT EXISTS (
  SELECT 1 FROM taisan 
  WHERE TenTaiSan = 'Tủ lạnh Samsung'
  AND CanHoID = (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1)
);

INSERT INTO taisan (TenTaiSan, LoaiTaiSan, TrangThai, CanHoID, GiaTriUocTinh, NgayMua)
SELECT 
  'Máy giặt LG',
  'Điện tử',
  'TotDep',
  (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1),
  6000000,
  '2023-01-15'
WHERE NOT EXISTS (
  SELECT 1 FROM taisan 
  WHERE TenTaiSan = 'Máy giặt LG'
  AND CanHoID = (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1)
);

INSERT INTO taisan (TenTaiSan, LoaiTaiSan, TrangThai, CanHoID, GiaTriUocTinh, NgayMua)
SELECT 
  'Điều hòa Daikin',
  'Điện tử',
  'TotDep',
  (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1),
  12000000,
  '2023-01-15'
WHERE NOT EXISTS (
  SELECT 1 FROM taisan 
  WHERE TenTaiSan = 'Điều hòa Daikin'
  AND CanHoID = (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1)
);

-- 10. Tạo dịch vụ
INSERT INTO dichvu (TenDichVu, MoTa, DonGia, DonVi, TrangThai)
VALUES 
  ('Internet', 'Dịch vụ Internet cáp quang 100Mbps', 200000, 'tháng', 'HoatDong'),
  ('Gửi xe máy', 'Dịch vụ gửi xe máy trong tòa nhà', 100000, 'tháng', 'HoatDong'),
  ('Vệ sinh', 'Dịch vụ vệ sinh căn hộ hàng tuần', 500000, 'tháng', 'HoatDong')
ON DUPLICATE KEY UPDATE 
  DonGia = VALUES(DonGia),
  TrangThai = VALUES(TrangThai);

-- 11. Đăng ký dịch vụ cho căn hộ
INSERT INTO canho_dichvu (CanHoID, DichVuID, NgayBatDau, TrangThai)
SELECT 
  (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1),
  dv.ID,
  '2024-01-01',
  'DangSuDung'
FROM dichvu dv
WHERE dv.TenDichVu IN ('Internet', 'Gửi xe máy')
AND NOT EXISTS (
  SELECT 1 FROM canho_dichvu 
  WHERE CanHoID = (SELECT ID FROM canho WHERE MaCanHo = 'A101' LIMIT 1)
  AND DichVuID = dv.ID
);

-- 12. Tạo thành viên trong căn hộ
INSERT INTO thanhviencanho (HopDongID, HoTen, CCCD, SoDienThoai, QuanHe, NgayVao)
SELECT 
  hd.ID,
  'Trần Thị B',
  '079123456789',
  '0912345678',
  'Vợ',
  '2024-01-01'
FROM hopdong hd
WHERE hd.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.TrangThai = 'DangThue'
AND NOT EXISTS (
  SELECT 1 FROM thanhviencanho 
  WHERE HopDongID = hd.ID 
  AND CCCD = '079123456789'
);

INSERT INTO thanhviencanho (HopDongID, HoTen, CCCD, SoDienThoai, QuanHe, NgayVao)
SELECT 
  hd.ID,
  'Nguyễn Văn C',
  '079987654321',
  '0923456789',
  'Con',
  '2024-01-01'
FROM hopdong hd
WHERE hd.NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com' LIMIT 1)
AND hd.TrangThai = 'DangThue'
AND NOT EXISTS (
  SELECT 1 FROM thanhviencanho 
  WHERE HopDongID = hd.ID 
  AND CCCD = '079987654321'
);

-- Hoàn thành!
SELECT 'Dữ liệu test đã được tạo thành công!' AS Message;
