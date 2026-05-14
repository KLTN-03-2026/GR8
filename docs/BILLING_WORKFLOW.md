# Quy Trình Thanh Toán 3 Bước (3-Step Billing Workflow)

## Tổng Quan

Hệ thống thanh toán hóa đơn căn hộ theo quy trình 3 bước:

1. **Nhân viên kỹ thuật** ghi chỉ số điện nước + upload ảnh
2. **Kế toán** xác nhận chỉ số và phát hành hóa đơn
3. **Người thuê** xem hóa đơn, quét QR thanh toán

---

## BƯỚC 1: Nhân Viên Kỹ Thuật Ghi Chỉ Số

### API Endpoint
```
POST /api/chisodiennuoc
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "CanHoID": 1,
  "ThangNam": "2024-04",
  "ChiSoDienMoi": 1250.5,
  "ChiSoNuocMoi": 85.3,
  "AnhDongHoDien": "https://storage.example.com/meter-electric-001.jpg",
  "AnhDongHoNuoc": "https://storage.example.com/meter-water-001.jpg"
}
```

### Response
```json
{
  "success": true,
  "message": "Ghi chỉ số thành công, chờ kế toán duyệt",
  "data": {
    "ID": 123,
    "CanHoID": 1,
    "ThangNam": "2024-04",
    "ChiSoDienCu": 1170.0,
    "ChiSoDienMoi": 1250.5,
    "ChiSoNuocCu": 70.0,
    "ChiSoNuocMoi": 85.3,
    "AnhDongHoDien": "https://storage.example.com/meter-electric-001.jpg",
    "AnhDongHoNuoc": "https://storage.example.com/meter-water-001.jpg",
    "TrangThai": "ChoDuyetKeToan",
    "NgayGhi": "2024-04-21T12:00:00.000Z",
    "canho": {
      "MaCanHo": "A101",
      "SoPhong": "101"
    }
  }
}
```

### Quyền Truy Cập
- `NhanVienKyThuat`
- `QuanLy`

---

## BƯỚC 2A: Kế Toán Xem Danh Sách Chờ Duyệt

### API Endpoint
```
GET /api/chisodiennuoc/pending
```

### Query Parameters
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số bản ghi/trang (default: 20)
- `ThangNam` (optional): Lọc theo tháng (VD: "2024-04")
- `CanHoID` (optional): Lọc theo căn hộ

### Response
```json
{
  "success": true,
  "data": [
    {
      "ID": 123,
      "CanHoID": 1,
      "ThangNam": "2024-04",
      "ChiSoDienCu": 1170.0,
      "ChiSoDienMoi": 1250.5,
      "ChiSoNuocCu": 70.0,
      "ChiSoNuocMoi": 85.3,
      "AnhDongHoDien": "https://storage.example.com/meter-electric-001.jpg",
      "AnhDongHoNuoc": "https://storage.example.com/meter-water-001.jpg",
      "TrangThai": "ChoDuyetKeToan",
      "NgayGhi": "2024-04-21T12:00:00.000Z",
      "canho": {
        "MaCanHo": "A101",
        "SoPhong": "101",
        "Tang": 1,
        "hopdong": [
          {
            "ID": 45,
            "GiaThue": 5000000,
            "nguoidung": {
              "HoTen": "Nguyễn Văn A",
              "SoDienThoai": "0901234567"
            }
          }
        ]
      },
      "nguoidung": {
        "HoTen": "Trần Văn B (Kỹ thuật)"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### Quyền Truy Cập
- `KeToan`
- `QuanLy`

---

## BƯỚC 2B: Kế Toán Xác Nhận & Phát Hành Hóa Đơn

### API Endpoint
```
POST /api/chisodiennuoc/:id/confirm
```

### Request Body
```json
{
  "ChiSoDienChinhThuc": 1250.5,
  "ChiSoNuocChinhThuc": 85.3,
  "GhiChuKeToan": "Đã kiểm tra ảnh, chỉ số chính xác"
}
```

### Response
```json
{
  "success": true,
  "message": "Xác nhận chỉ số và phát hành hóa đơn thành công",
  "data": {
    "reading": {
      "ID": 123,
      "TrangThai": "DaPhatHanhHoaDon",
      "ChiSoDienChinhThuc": 1250.5,
      "ChiSoNuocChinhThuc": 85.3,
      "NgayKeToanDuyet": "2024-04-21T14:30:00.000Z"
    },
    "invoice": {
      "ID": 456,
      "MaHoaDon": "HD202404001",
      "HopDongID": 45,
      "ThangNam": "2024-04",
      "NgayLap": "2024-04-21",
      "NgayDenHan": "2024-05-06",
      "TongTien": 5720000,
      "TrangThai": "ChuaTT",
      "SoTaiKhoan": "1031312786",
      "NganHangNhan": "Vietcombank",
      "NoiDungCK": "HD202404001"
    }
  }
}
```

### Tính Toán Tự Động

Hệ thống tự động tính:

```javascript
// Từ config/billing.config.js
const ELECTRICITY_PRICE = 4000;  // VNĐ/kWh
const WATER_PRICE = 10000;       // VNĐ/m³
const COMMON_FEE = 200000;       // VNĐ/tháng
const CLEANING_FEE = 50000;      // VNĐ/tháng

// Tính toán
const soDien = ChiSoDienMoi - ChiSoDienCu;  // 1250.5 - 1170 = 80.5 kWh
const soNuoc = ChiSoNuocMoi - ChiSoNuocCu;  // 85.3 - 70 = 15.3 m³

const tienDien = soDien * ELECTRICITY_PRICE;     // 80.5 × 4000 = 322,000đ
const tienNuoc = soNuoc * WATER_PRICE;           // 15.3 × 10000 = 153,000đ
const tienThue = 5000000;  // Từ hợp đồng
const phiChung = 200000;
const phiVeSinh = 50000;

const tongTien = tienThue + tienDien + tienNuoc + phiChung + phiVeSinh;
// = 5,000,000 + 322,000 + 153,000 + 200,000 + 50,000 = 5,725,000đ
```

### Chi Tiết Hóa Đơn Được Tạo

```json
{
  "hoadonchitiet": [
    {
      "Loai": "TienThue",
      "SoTien": 5000000,
      "MoTa": "Tiền thuê tháng 2024-04"
    },
    {
      "Loai": "Dien",
      "SoTien": 322000,
      "MoTa": "Điện: 80.5 kWh × 4000đ"
    },
    {
      "Loai": "Nuoc",
      "SoTien": 153000,
      "MoTa": "Nước: 15.3 m³ × 10000đ"
    },
    {
      "Loai": "DichVu",
      "SoTien": 200000,
      "MoTa": "Phí quản lý chung"
    },
    {
      "Loai": "DichVu",
      "SoTien": 50000,
      "MoTa": "Phí vệ sinh"
    }
  ]
}
```

### Quyền Truy Cập
- `KeToan`
- `QuanLy`

---

## BƯỚC 3A: Người Thuê Xem Hóa Đơn

### API Endpoint
```
GET /api/hoadon/my-invoices
```

### Query Parameters
- `page` (optional)
- `limit` (optional)
- `TrangThai` (optional): `ChuaTT`, `DaTT`, `QuaHan`
- `ThangNam` (optional)

### Response
```json
{
  "success": true,
  "data": [
    {
      "ID": 456,
      "MaHoaDon": "HD202404001",
      "ThangNam": "2024-04",
      "NgayLap": "2024-04-21",
      "NgayDenHan": "2024-05-06",
      "TongTien": 5725000,
      "TrangThai": "ChuaTT",
      "hopdong": {
        "canho": {
          "MaCanHo": "A101",
          "SoPhong": "101",
          "Tang": 1
        }
      },
      "hoadonchitiet": [
        {
          "Loai": "TienThue",
          "SoTien": 5000000,
          "MoTa": "Tiền thuê tháng 2024-04"
        },
        {
          "Loai": "Dien",
          "SoTien": 322000,
          "MoTa": "Điện: 80.5 kWh × 4000đ"
        },
        {
          "Loai": "Nuoc",
          "SoTien": 153000,
          "MoTa": "Nước: 15.3 m³ × 10000đ"
        },
        {
          "Loai": "DichVu",
          "SoTien": 200000,
          "MoTa": "Phí quản lý chung"
        },
        {
          "Loai": "DichVu",
          "SoTien": 50000,
          "MoTa": "Phí vệ sinh"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Quyền Truy Cập
- `NguoiThue`

---

## BƯỚC 3B: Xem Chi Tiết Hóa Đơn + QR Code

### API Endpoint
```
GET /api/hoadon/:id
```

### Response
```json
{
  "success": true,
  "data": {
    "ID": 456,
    "MaHoaDon": "HD202404001",
    "ThangNam": "2024-04",
    "NgayLap": "2024-04-21",
    "NgayDenHan": "2024-05-06",
    "TongTien": 5725000,
    "TrangThai": "ChuaTT",
    "SoTaiKhoan": "1031312786",
    "NganHangNhan": "Vietcombank",
    "NoiDungCK": "HD202404001",
    "qrUrl": "https://img.vietqr.io/image/VCB-1031312786-compact.png?amount=5725000&addInfo=HD202404001",
    "hopdong": {
      "canho": {
        "MaCanHo": "A101",
        "SoPhong": "101",
        "Tang": 1
      },
      "nguoidung": {
        "HoTen": "Nguyễn Văn A",
        "SoDienThoai": "0901234567",
        "Email": "nguyenvana@example.com"
      }
    },
    "hoadonchitiet": [
      {
        "Loai": "TienThue",
        "SoTien": 5000000,
        "MoTa": "Tiền thuê tháng 2024-04"
      },
      {
        "Loai": "Dien",
        "SoTien": 322000,
        "MoTa": "Điện: 80.5 kWh × 4000đ"
      },
      {
        "Loai": "Nuoc",
        "SoTien": 153000,
        "MoTa": "Nước: 15.3 m³ × 10000đ"
      },
      {
        "Loai": "DichVu",
        "SoTien": 200000,
        "MoTa": "Phí quản lý chung"
      },
      {
        "Loai": "DichVu",
        "SoTien": 50000,
        "MoTa": "Phí vệ sinh"
      }
    ]
  }
}
```

### Quyền Truy Cập
- `NguoiThue` (chỉ hóa đơn của mình)
- `KeToan`, `QuanLy` (tất cả hóa đơn)

---

## BƯỚC 3C: Người Thuê Đánh Dấu Đã Thanh Toán

### API Endpoint
```
POST /api/hoadon/:id/mark-paid
```

### Request Body (Optional)
```json
{
  "PhuongThuc": "ChuyenKhoan",
  "MaGiaoDich": "FT24042112345678",
  "NganHang": "Vietcombank",
  "GhiChu": "Đã chuyển khoản lúc 14:30"
}
```

### Response
```json
{
  "success": true,
  "message": "Đã xác nhận thanh toán. Kế toán sẽ kiểm tra và xác nhận.",
  "data": {
    "ID": 456,
    "TrangThai": "DaTT",
    "updated_at": "2024-04-21T14:35:00.000Z"
  }
}
```

### Quyền Truy Cập
- `NguoiThue`

---

## Cấu Hình Giá & Ngân Hàng

File: `server/src/config/billing.config.js`

```javascript
module.exports = {
  // Đơn giá
  ELECTRICITY_PRICE: 4000,      // VNĐ/kWh
  WATER_PRICE: 10000,           // VNĐ/m³
  COMMON_FEE: 200000,           // VNĐ/tháng
  CLEANING_FEE: 50000,          // VNĐ/tháng

  // Thông tin ngân hàng
  BANK_INFO: {
    accountNumber: '1031312786',
    bankName: 'Vietcombank',
    accountName: 'CONG TY TNHH QUAN LY CAN HO',
    bankCode: 'VCB',
  },

  // Số ngày đến hạn
  PAYMENT_DUE_DAYS: 15,

  // Template nội dung CK
  TRANSFER_CONTENT_TEMPLATE: 'HD{maHoaDon}',

  // VietQR API
  VIETQR_API: 'https://img.vietqr.io/image',
};
```

---

## Database Schema Changes

### Table: `chisodiennuoc`

**Thêm các cột:**
- `AnhDongHoDien` VARCHAR(500) - URL ảnh đồng hồ điện
- `AnhDongHoNuoc` VARCHAR(500) - URL ảnh đồng hồ nước
- `TrangThai` ENUM - Trạng thái: ChoDuyetKeToan, DaDuyet, DaPhatHanhHoaDon, TuChoi
- `KeToanDuyetID` INT - ID kế toán duyệt
- `NgayKeToanDuyet` DATETIME - Ngày kế toán duyệt
- `ChiSoDienChinhThuc` DECIMAL(10,2) - Chỉ số điện chính thức
- `ChiSoNuocChinhThuc` DECIMAL(10,2) - Chỉ số nước chính thức
- `GhiChuKeToan` TEXT - Ghi chú của kế toán

### Table: `hoadon`

**Thêm các cột:**
- `MaHoaDon` VARCHAR(50) UNIQUE - Mã hóa đơn (VD: HD202404001)
- `QRContent` TEXT - Nội dung QR code
- `SoTaiKhoan` VARCHAR(50) - Số tài khoản nhận
- `NganHangNhan` VARCHAR(100) - Tên ngân hàng
- `NoiDungCK` VARCHAR(200) - Nội dung chuyển khoản

---

## Migration

Chạy migration:

```bash
cd server
npx prisma migrate dev --name add_meter_reading_workflow
```

Hoặc apply migration có sẵn:

```bash
npx prisma migrate deploy
```

---

## Testing Flow

### 1. Tạo chỉ số (Kỹ thuật viên)
```bash
curl -X POST http://localhost:5000/api/chisodiennuoc \
  -H "Authorization: Bearer <token_ky_thuat>" \
  -H "Content-Type: application/json" \
  -d '{
    "CanHoID": 1,
    "ThangNam": "2024-04",
    "ChiSoDienMoi": 1250.5,
    "ChiSoNuocMoi": 85.3,
    "AnhDongHoDien": "https://example.com/electric.jpg",
    "AnhDongHoNuoc": "https://example.com/water.jpg"
  }'
```

### 2. Xem danh sách chờ duyệt (Kế toán)
```bash
curl http://localhost:5000/api/chisodiennuoc/pending \
  -H "Authorization: Bearer <token_ke_toan>"
```

### 3. Xác nhận & phát hành (Kế toán)
```bash
curl -X POST http://localhost:5000/api/chisodiennuoc/123/confirm \
  -H "Authorization: Bearer <token_ke_toan>" \
  -H "Content-Type: application/json" \
  -d '{
    "ChiSoDienChinhThuc": 1250.5,
    "ChiSoNuocChinhThuc": 85.3,
    "GhiChuKeToan": "OK"
  }'
```

### 4. Xem hóa đơn (Người thuê)
```bash
curl http://localhost:5000/api/hoadon/my-invoices \
  -H "Authorization: Bearer <token_nguoi_thue>"
```

### 5. Đánh dấu đã thanh toán (Người thuê)
```bash
curl -X POST http://localhost:5000/api/hoadon/456/mark-paid \
  -H "Authorization: Bearer <token_nguoi_thue>" \
  -H "Content-Type: application/json" \
  -d '{
    "MaGiaoDich": "FT24042112345678"
  }'
```

---

## Frontend Integration

### React Component Example - Payment Modal

```jsx
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

const PaymentModal = ({ invoice, onClose, onConfirmPaid }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmPaid = async () => {
    setLoading(true);
    try {
      await onConfirmPaid(invoice.ID);
      alert('Đã xác nhận thanh toán!');
      onClose();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Thanh Toán Hóa Đơn</h2>
      <div className="invoice-details">
        <p><strong>Mã hóa đơn:</strong> {invoice.MaHoaDon}</p>
        <p><strong>Tổng tiền:</strong> {invoice.TongTien.toLocaleString()}đ</p>
        <p><strong>Hạn thanh toán:</strong> {invoice.NgayDenHan}</p>
      </div>

      <div className="qr-section">
        <h3>Quét mã QR để thanh toán</h3>
        <img src={invoice.qrUrl} alt="VietQR" />
        
        <div className="bank-info">
          <p><strong>Ngân hàng:</strong> {invoice.NganHangNhan}</p>
          <p><strong>Số TK:</strong> {invoice.SoTaiKhoan}</p>
          <p><strong>Số tiền:</strong> {invoice.TongTien.toLocaleString()}đ</p>
          <p><strong>Nội dung:</strong> {invoice.NoiDungCK}</p>
        </div>
      </div>

      <button onClick={handleConfirmPaid} disabled={loading}>
        ✅ Tôi đã chuyển khoản
      </button>
      <button onClick={onClose}>Đóng</button>
    </div>
  );
};

export default PaymentModal;
```

---

## Notes

1. **Upload ảnh**: Cần implement file upload service (AWS S3, Cloudinary, etc.)
2. **Thông báo**: Cần implement notification service để gửi thông báo cho người thuê khi có hóa đơn mới
3. **Xác nhận thanh toán**: Kế toán cần kiểm tra lại sau khi người thuê đánh dấu đã thanh toán
4. **VietQR**: Sử dụng API miễn phí của VietQR.io để tạo mã QR

---

## Status Flow

```
ChiSoDienNuoc:
  ChoDuyetKeToan → DaPhatHanhHoaDon

HoaDon:
  ChuaTT → DaTT
```
