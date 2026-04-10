# Entity Relationship Diagram

## Database Entities

### Users (NguoiDung)
- ID (Primary Key)
- TenDangNhap
- MatKhau
- HoTen
- Email
- SoDienThoai
- VaiTro (Role: ChuNha, NguoiThue, QuanLy)
- TrangThai

### Apartments (CanHo)
- ID (Primary Key)
- MaCanHo
- Tang (Floor)
- SoPhong (Number of rooms)
- DienTich (Area)
- GiaThue (Rental price)
- TienCoc (Deposit)
- TrangThai (Status)
- MoTa (Description)
- ChuNhaID (Foreign Key to Users)
- ToaNhaID (Foreign Key to Buildings)

### Buildings (ToaNha)
- ID (Primary Key)
- TenToaNha
- DiaChi
- ThanhPho

### Contracts (HopDong)
- ID (Primary Key)
- MaHopDong
- CanHoID (Foreign Key to Apartments)
- NguoiThueID (Foreign Key to Users)
- NgayBatDau (Start Date)
- NgayKetThuc (End Date)
- TrangThai

### Invoices (HoaDon)
- ID (Primary Key)
- MaHoaDon
- HopDongID (Foreign Key to Contracts)
- NgayPhatHanh (Issued Date)
- SoTien (Amount)
- TrangThai (Status)
