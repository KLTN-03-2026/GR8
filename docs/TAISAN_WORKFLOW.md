# 🏗️ LUỒNG HOẠT ĐỘNG MODULE TÀI SẢN

## 📊 TỔNG QUAN

Module **Tài sản** quản lý các thiết bị, tài sản thuộc về tòa nhà hoặc căn hộ trong hệ thống quản lý chung cư.

### Phạm vi quản lý:
- **Thiết bị chung**: Thang máy, máy phát điện, hệ thống PCCC, camera an ninh...
- **Thiết bị căn hộ**: Điều hòa, tủ lạnh, máy giặt, bình nóng lạnh...
- **Nội thất**: Giường, tủ, bàn ghế, sofa...
- **Thiết bị điện**: Đèn, quạt, ổ cắm...
- **Cơ sở vật chất**: Hồ bơi, gym, sân tennis...

---

## 🗄️ CẤU TRÚC DATABASE

```prisma
model taisan {
  ID         Int                @id @default(autoincrement())
  MaTaiSan   String             @unique                        // Mã tài sản (TS001, DH-A101...)
  TenTaiSan  String                                            // Tên tài sản
  LoaiTaiSan taisan_LoaiTaiSan? @default(ThietBiChung)        // Loại tài sản
  ToaNhaID   Int?                                              // Thuộc tòa nhà (nullable)
  CanHoID    Int?                                              // Thuộc căn hộ (nullable)
  ViTri      String?                                           // Vị trí cụ thể
  SoLuong    Int?               @default(1)                    // Số lượng
  TinhTrang  taisan_TinhTrang?  @default(Tot)                 // Tình trạng
  NgayMua    DateTime?                                         // Ngày mua
  GiaTri     Decimal?           @default(0.00)                // Giá trị (VNĐ)
  NhaCungCap String?                                           // Nhà cung cấp
  GhiChu     String?                                           // Ghi chú
  is_deleted Int?               @default(0)                    // Soft delete flag
  updated_at DateTime?          @default(now())
  deleted_at DateTime?
  
  // Relations
  canho      canho?   @relation(...)
  toanha     toanha?  @relation(...)
}

enum taisan_LoaiTaiSan {
  ThietBiChung      // Thiết bị chung
  ThietBiCanHo      // Thiết bị căn hộ
  NoiThat           // Nội thất
  ThietBiDien       // Thiết bị điện
  CoSoVatChat       // Cơ sở vật chất
}

enum taisan_TinhTrang {
  Tot        // Tốt
  Hong       // Hỏng
  DangSua    // Đang sửa
  Mat        // Mất
  Cu         // Cũ
}
```

---

## 🔄 API ENDPOINTS

### 1. Xem danh sách tài sản (có filter)
```http
GET /api/taisan?ToaNhaID=1&TinhTrang=Tot&LoaiTaiSan=ThietBiChung
Authorization: Bearer <token>
```

**Query Parameters:**
- `ToaNhaID` (optional): Lọc theo tòa nhà
- `CanHoID` (optional): Lọc theo căn hộ
- `TinhTrang` (optional): Tot | Hong | DangSua | Mat | Cu
- `LoaiTaiSan` (optional): ThietBiChung | ThietBiCanHo | NoiThat | ThietBiDien | CoSoVatChat

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "MaTaiSan": "TM-A-01",
      "TenTaiSan": "Thang máy Mitsubishi",
      "LoaiTaiSan": "ThietBiChung",
      "TinhTrang": "Tot",
      "GiaTri": "500000000.00",
      "toanha": { "TenToaNha": "Tòa A" },
      "canho": null
    }
  ]
}
```

**Quyền hạn:** QuanLy, ChuNha

---

### 2. Xem chi tiết tài sản
```http
GET /api/taisan/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ID": 5,
    "MaTaiSan": "DH-A101-01",
    "TenTaiSan": "Điều hòa Daikin 12000BTU",
    "LoaiTaiSan": "ThietBiCanHo",
    "CanHoID": 10,
    "ViTri": "Phòng khách",
    "TinhTrang": "Tot",
    "NgayMua": "2024-03-01",
    "GiaTri": "15000000.00",
    "NhaCungCap": "Điện máy Xanh",
    "canho": {
      "MaCanHo": "A101",
      "SoPhong": "3"
    }
  }
}
```

**Quyền hạn:** QuanLy, ChuNha

---

### 3. Thêm tài sản mới
```http
POST /api/taisan
Authorization: Bearer <token>
Content-Type: application/json

{
  "MaTaiSan": "TS010",
  "TenTaiSan": "Máy giặt Samsung 9kg",
  "LoaiTaiSan": "ThietBiCanHo",
  "CanHoID": 15,
  "ViTri": "Ban công",
  "TinhTrang": "Tot",
  "NgayMua": "2024-04-19",
  "GiaTri": 8000000,
  "NhaCungCap": "Điện máy Chợ Lớn",
  "SoLuong": 1,
  "GhiChu": "Máy giặt cửa trước, inverter"
}
```

**Required fields:**
- `MaTaiSan` (unique)
- `TenTaiSan`

**Optional fields:**
- `LoaiTaiSan` (default: "ThietBiChung")
- `ToaNhaID` (nullable)
- `CanHoID` (nullable)
- `ViTri`
- `SoLuong` (default: 1)
- `TinhTrang` (default: "Tot")
- `NgayMua`
- `GiaTri` (default: 0)
- `NhaCungCap`
- `GhiChu`

**Response:**
```json
{
  "success": true,
  "data": { "ID": 10, "MaTaiSan": "TS010", ... },
  "message": "Thêm tài sản thành công"
}
```

**Quyền hạn:** QuanLy, ChuNha

---

### 4. Cập nhật tài sản
```http
PUT /api/taisan/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "TinhTrang": "DangSua",
  "GhiChu": "Máy giặt bị hỏng động cơ, đang sửa chữa"
}
```

**Đặc điểm:**
- Partial update (chỉ update field được gửi)
- Tất cả fields đều optional

**Response:**
```json
{
  "success": true,
  "data": { "ID": 10, "TinhTrang": "DangSua", ... },
  "message": "Cập nhật thành công"
}
```

**Quyền hạn:** QuanLy, ChuNha

---

### 5. Xóa tài sản (Soft Delete)
```http
DELETE /api/taisan/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa tài sản thành công"
}
```

**Lưu ý:**
- Soft delete: `is_deleted = 1`, `deleted_at = NOW()`
- Tài sản đã xóa không hiện trong danh sách
- Có thể restore bằng cách update `is_deleted = 0`

**Quyền hạn:** QuanLy, ChuNha

---

### 6. Thống kê tài sản
```http
GET /api/taisan/stats/thongke
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tongSoTaiSan": 150,
    "theoLoai": [
      { "LoaiTaiSan": "ThietBiChung", "_count": { "ID": 25 } },
      { "LoaiTaiSan": "ThietBiCanHo", "_count": { "ID": 80 } },
      { "LoaiTaiSan": "NoiThat", "_count": { "ID": 45 } }
    ],
    "theoTinhTrang": [
      { "TinhTrang": "Tot", "_count": { "ID": 120 } },
      { "TinhTrang": "Hong", "_count": { "ID": 15 } },
      { "TinhTrang": "DangSua", "_count": { "ID": 10 } },
      { "TinhTrang": "Cu", "_count": { "ID": 5 } }
    ],
    "tongGiaTri": "5500000000.00"
  }
}
```

**Quyền hạn:** QuanLy

---

## 📋 USE CASES

### Use Case 1: Quản lý thiết bị chung của tòa nhà

#### Bước 1: Thêm thang máy
```bash
POST /api/taisan
{
  "MaTaiSan": "TM-A-01",
  "TenTaiSan": "Thang máy Mitsubishi 8 người",
  "LoaiTaiSan": "ThietBiChung",
  "ToaNhaID": 1,
  "ViTri": "Sảnh chính",
  "TinhTrang": "Tot",
  "NgayMua": "2023-01-15",
  "GiaTri": 500000000,
  "NhaCungCap": "Mitsubishi Vietnam"
}
```

#### Bước 2: Xem tất cả thiết bị chung
```bash
GET /api/taisan?ToaNhaID=1&LoaiTaiSan=ThietBiChung
```

#### Bước 3: Báo hỏng thang máy
```bash
PUT /api/taisan/1
{
  "TinhTrang": "Hong",
  "GhiChu": "Thang máy bị kẹt tầng 5, cần sửa chữa gấp"
}
```

#### Bước 4: Cập nhật đang sửa
```bash
PUT /api/taisan/1
{
  "TinhTrang": "DangSua",
  "GhiChu": "Đã liên hệ Mitsubishi, kỹ thuật viên đến sửa ngày 20/04"
}
```

#### Bước 5: Hoàn thành sửa chữa
```bash
PUT /api/taisan/1
{
  "TinhTrang": "Tot",
  "GhiChu": "Đã sửa xong, hoạt động bình thường"
}
```

---

### Use Case 2: Quản lý thiết bị căn hộ

#### Bước 1: Thêm điều hòa cho căn hộ mới
```bash
POST /api/taisan
{
  "MaTaiSan": "DH-A101-01",
  "TenTaiSan": "Điều hòa Daikin 12000BTU",
  "LoaiTaiSan": "ThietBiCanHo",
  "CanHoID": 10,
  "ViTri": "Phòng khách",
  "TinhTrang": "Tot",
  "NgayMua": "2024-03-01",
  "GiaTri": 15000000,
  "SoLuong": 1
}
```

#### Bước 2: Xem tất cả thiết bị của căn hộ
```bash
GET /api/taisan?CanHoID=10
```

#### Bước 3: Người thuê báo hỏng
```bash
PUT /api/taisan/5
{
  "TinhTrang": "Hong",
  "GhiChu": "Điều hòa không lạnh, cần kiểm tra gas"
}
```

---

### Use Case 3: Kiểm kê tài sản định kỳ

#### Xem tất cả tài sản đang hỏng
```bash
GET /api/taisan?TinhTrang=Hong
```

#### Xem tất cả tài sản đang sửa
```bash
GET /api/taisan?TinhTrang=DangSua
```

#### Báo cáo thống kê tổng quan
```bash
GET /api/taisan/stats/thongke
```

---

## 🔗 TÍCH HỢP VỚI CÁC MODULE KHÁC

### 1. Module Căn hộ (apartment)
Khi xem chi tiết căn hộ, nên include danh sách tài sản:

```javascript
// apartment.service.js
export const getApartmentById = async (id) => {
  return await prisma.canho.findUnique({
    where: { ID: Number(id) },
    include: {
      taisan: {
        where: { is_deleted: 0 },
        orderBy: { LoaiTaiSan: 'asc' }
      }
    }
  });
};
```

### 2. Module Yêu cầu sửa chữa (yeucausuco)
Khi tạo yêu cầu sửa chữa, có thể liên kết với tài sản:

```javascript
// Thêm field TaiSanID vào yeucausuco
POST /api/yeucausuco
{
  "TieuDe": "Điều hòa hỏng",
  "TaiSanID": 5,
  "MoTa": "Điều hòa không lạnh"
}

// Tự động update tình trạng tài sản
PUT /api/taisan/5
{
  "TinhTrang": "DangSua"
}
```

### 3. Module Hợp đồng (hopdong)
Khi ký hợp đồng, liệt kê tài sản đi kèm căn hộ:

```javascript
// Lấy danh sách tài sản của căn hộ
GET /api/taisan?CanHoID=10

// Lưu vào hợp đồng hoặc tạo bảng hopdong_taisan
```

---

## 🎯 BUSINESS RULES

### 1. Phân loại tài sản
- **ThietBiChung**: Thuộc tòa nhà (ToaNhaID có giá trị, CanHoID = null)
- **ThietBiCanHo**: Thuộc căn hộ (CanHoID có giá trị, ToaNhaID = null)
- **Tài sản dự trữ**: Cả 2 đều null

### 2. Quy trình xử lý hỏng hóc
1. Người thuê báo hỏng → Tạo yeucausuco
2. Quản lý xác nhận → Update TinhTrang = "Hong"
3. Giao cho kỹ thuật viên → Update TinhTrang = "DangSua"
4. Hoàn thành sửa chữa → Update TinhTrang = "Tot"
5. Không sửa được → Update TinhTrang = "Mat"

### 3. Quy định về giá trị
- Tài sản > 50 triệu: Cần phê duyệt của Chủ nhà
- Tài sản bị mất: Cần báo cáo và xử lý bồi thường

### 4. Bảo trì định kỳ
- Thiết bị chung: Kiểm tra 6 tháng/lần
- Thiết bị căn hộ: Kiểm tra khi có yêu cầu
- Tài sản cũ (> 5 năm): Đánh giá thay thế

---

## ✅ CHECKLIST TRIỂN KHAI

- [x] CRUD cơ bản (Create, Read, Update, Delete)
- [x] Soft delete
- [x] Filter theo ToaNhaID, CanHoID, TinhTrang, LoaiTaiSan
- [x] Validation ToaNhaID, CanHoID
- [x] Include relations (toanha, canho)
- [x] Thống kê tài sản
- [ ] Upload hình ảnh tài sản
- [ ] Lịch sử bảo trì
- [ ] Tích hợp với yeucausuco
- [ ] Báo cáo khấu hao
- [ ] Export Excel danh sách tài sản

---

## 🐛 LƯU Ý KHI SỬ DỤNG

1. **MaTaiSan phải unique**: Nên có quy tắc đặt tên rõ ràng
   - Thiết bị chung: `TM-A-01` (Thang máy - Tòa A - Số 01)
   - Thiết bị căn hộ: `DH-A101-01` (Điều hòa - Căn A101 - Số 01)

2. **Soft delete**: Không xóa thật, chỉ đánh dấu `is_deleted = 1`

3. **Validation**: Luôn check ToaNhaID/CanHoID tồn tại trước khi tạo

4. **Performance**: Với số lượng lớn, nên thêm pagination

5. **Security**: Chỉ QuanLy và ChuNha mới được quản lý tài sản
