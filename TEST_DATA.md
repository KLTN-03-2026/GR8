# Dữ liệu Test cho Trang Chủ Tenant

## Hướng dẫn test

### 1. Đăng nhập với tài khoản tenant
- Đăng nhập với tài khoản có vai trò `NguoiThue` hoặc `KhachVangLai`
- Sau khi đăng nhập, bạn sẽ ở lại trang chủ (/) thay vì bị redirect về /dashboard

### 2. Kiểm tra trang chủ
Trang chủ sẽ hiển thị:
- **Hero section** với thanh tìm kiếm căn hộ
- **Quick Actions section** (chỉ hiện khi đã đăng nhập):
  - Thống kê: Hợp đồng đang thuê, Hóa đơn chưa thanh toán, Yêu cầu đang xử lý
  - 4 nút chức năng nhanh:
    - 🏠 Căn hộ của tôi
    - 💰 Hóa đơn
    - 📋 Yêu cầu thuê
    - 💬 Liên hệ quản lý
- **Danh sách căn hộ nổi bật** (6 căn hộ trống)
- **Thông tin dịch vụ**
- **Footer**

### 3. Kiểm tra "Căn hộ của tôi" (/my-apartment)
Trang này gộp tất cả chức năng:
- Tab **Tổng quan**: Thông tin căn hộ + hợp đồng
- Tab **Hợp đồng**: Danh sách hợp đồng
- Tab **Hóa đơn**: Danh sách hóa đơn
- Tab **Tài sản**: Tài sản trong căn hộ
- Tab **Dịch vụ**: Dịch vụ đang sử dụng
- Tab **Báo cáo sự cố**: Danh sách sự cố
- Tab **Thành viên**: Quản lý thành viên trong căn hộ
- Tab **Vị trí**: Bản đồ hiển thị vị trí tòa nhà (sử dụng OpenStreetMap)

### 4. Kiểm tra bản đồ
- Vào tab "Vị trí" trong "Căn hộ của tôi"
- Bản đồ sẽ hiển thị vị trí tòa nhà với marker màu indigo
- Click vào marker để xem popup với thông tin tòa nhà
- Có link "Xem trên Google Maps" để mở Google Maps

### 5. Kiểm tra menu
- Menu hamburger ở header chỉ hiển thị các chức năng của tenant:
  - Dashboard
  - Tìm căn hộ
  - Yêu cầu thuê
  - Hợp đồng
  - Hóa đơn
  - Chat
  - Tài sản căn hộ
  - Dịch vụ
  - Hồ sơ

## Dữ liệu cần có trong database

### Tài khoản tenant
```sql
-- Tạo tài khoản test
INSERT INTO nguoidung (HoTen, Email, MatKhau, SoDienThoai, VaiTroID)
VALUES ('Nguyễn Văn A', 'tenant@test.com', '$2a$10$...', '0901234567', 
  (SELECT ID FROM vaitro WHERE TenVaiTro = 'NguoiThue'));
```

### Căn hộ trống
```sql
-- Tạo căn hộ trống để hiển thị trên trang chủ
INSERT INTO canho (MaCanHo, ToaNhaID, Tang, SoPhong, DienTich, GiaThue, TienCoc, TrangThai)
VALUES 
  ('A101', 1, 1, 2, 50, 5000000, 10000000, 'Trong'),
  ('A102', 1, 1, 3, 70, 7000000, 14000000, 'Trong'),
  ('A201', 1, 2, 2, 50, 5000000, 10000000, 'Trong'),
  ('A202', 1, 2, 3, 70, 7000000, 14000000, 'Trong'),
  ('B101', 2, 1, 2, 55, 5500000, 11000000, 'Trong'),
  ('B102', 2, 1, 3, 75, 7500000, 15000000, 'Trong');
```

### Hợp đồng đang thuê
```sql
-- Tạo hợp đồng cho tenant
INSERT INTO hopdong (CanHoID, NguoiThueID, NgayBatDau, NgayKetThuc, GiaThue, TienCoc, TrangThai)
VALUES (
  (SELECT ID FROM canho WHERE MaCanHo = 'A101'),
  (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com'),
  '2024-01-01',
  '2025-12-31',
  5000000,
  10000000,
  'DangThue'
);
```

### Hóa đơn
```sql
-- Tạo hóa đơn chưa thanh toán
INSERT INTO hoadon (HopDongID, ThangNam, TongTien, TrangThai)
VALUES (
  (SELECT ID FROM hopdong WHERE NguoiThueID = (SELECT ID FROM nguoidung WHERE Email = 'tenant@test.com')),
  '2024-05',
  5500000,
  'ChuaThanhToan'
);
```

### Tòa nhà với tọa độ
```sql
-- Cập nhật tọa độ cho tòa nhà
UPDATE toanha 
SET Latitude = 10.7769, Longitude = 106.7009, DiaChi = '123 Nguyễn Văn Linh, Quận 7, TP.HCM'
WHERE ID = 1;
```

## Lưu ý
- Bản đồ sử dụng OpenStreetMap (miễn phí, không CORS) thay vì Vietmap
- Nếu muốn dùng Vietmap, cần cấu hình CORS trên server hoặc dùng proxy
- Leaflet đã được cài đặt để hiển thị bản đồ
- Package @vietmap/vietmap-gl-js đã được cài đặt nhưng chưa sử dụng (do CORS)
