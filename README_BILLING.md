# 🏢 Hệ Thống Thanh Toán Hóa Đơn Căn Hộ - 3 Bước

## 📖 Giới Thiệu

Hệ thống quản lý thanh toán hóa đơn tự động cho căn hộ chung cư với quy trình 3 bước:

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH 3 BƯỚC                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BƯỚC 1: Nhân Viên Kỹ Thuật                                     │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ • Đến từng căn hộ                                     │       │
│  │ • Chụp ảnh đồng hồ điện + nước                        │       │
│  │ • Upload lên hệ thống                                 │       │
│  │ • Trạng thái: ChoDuyetKeToan                          │       │
│  └──────────────────────────────────────────────────────┘       │
│                          ↓                                       │
│  BƯỚC 2: Kế Toán                                                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ • Xem danh sách chỉ số chờ duyệt                      │       │
│  │ • Xem ảnh đồng hồ                                     │       │
│  │ • Xác nhận chỉ số chính thức                          │       │
│  │ • Hệ thống TỰ ĐỘNG:                                   │       │
│  │   - Tính tiền điện, nước, phí                         │       │
│  │   - Tạo hóa đơn                                       │       │
│  │   - Generate QR code VietQR                           │       │
│  │ • Trạng thái: DaPhatHanhHoaDon                        │       │
│  └──────────────────────────────────────────────────────┘       │
│                          ↓                                       │
│  BƯỚC 3: Người Thuê                                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ • Nhận thông báo có hóa đơn mới                       │       │
│  │ • Xem chi tiết hóa đơn                                │       │
│  │ • Quét QR code thanh toán                             │       │
│  │ • Chuyển khoản                                        │       │
│  │ • Click "Tôi đã chuyển khoản"                         │       │
│  │ • Trạng thái: DaTT                                    │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Tính Năng

### 🔧 Cho Nhân Viên Kỹ Thuật
- ✅ Ghi chỉ số điện nước
- ✅ Upload ảnh đồng hồ
- ✅ Tự động lấy chỉ số cũ từ tháng trước
- ✅ Validate không trùng tháng

### 💼 Cho Kế Toán
- ✅ Xem danh sách chỉ số chờ duyệt
- ✅ Xem ảnh đồng hồ để đối chiếu
- ✅ Xác nhận/sửa chỉ số nếu cần
- ✅ Phát hành hóa đơn tự động
- ✅ Xem tất cả hóa đơn

### 🏠 Cho Người Thuê
- ✅ Xem danh sách hóa đơn của mình
- ✅ Xem chi tiết từng khoản phí
- ✅ Quét QR code VietQR để thanh toán
- ✅ Đánh dấu đã thanh toán
- ✅ Lịch sử thanh toán

### 🤖 Tự Động Hóa
- ✅ Tính tiền điện: (Mới - Cũ) × Đơn giá
- ✅ Tính tiền nước: (Mới - Cũ) × Đơn giá
- ✅ Cộng phí chung, phí vệ sinh
- ✅ Cộng tiền thuê từ hợp đồng
- ✅ Tạo mã hóa đơn tự động
- ✅ Generate QR code VietQR
- ✅ Tạo nội dung chuyển khoản

## 📦 Cài Đặt

### 1. Clone & Install

```bash
cd DoAnTotNghiep/server
npm install
```

### 2. Chạy Migration

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Cấu Hình

Mở `server/src/config/billing.config.js` và cập nhật:

```javascript
module.exports = {
  ELECTRICITY_PRICE: 4000,      // Đơn giá điện (VNĐ/kWh)
  WATER_PRICE: 10000,           // Đơn giá nước (VNĐ/m³)
  COMMON_FEE: 200000,           // Phí chung (VNĐ/tháng)
  CLEANING_FEE: 50000,          // Phí vệ sinh (VNĐ/tháng)

  BANK_INFO: {
    accountNumber: '1031312786',     // ← Thay số TK của bạn
    bankName: 'Vietcombank',         // ← Thay tên ngân hàng
    accountName: 'CONG TY ABC',      // ← Thay tên chủ TK
    bankCode: 'VCB',                 // ← Mã ngân hàng
  },

  PAYMENT_DUE_DAYS: 15,
};
```

### 4. Khởi Động

```bash
npm run dev
```

Server chạy tại: `http://localhost:5000`

## 🧪 Testing

### Import Postman Collection

1. Mở Postman
2. Import file: `Billing_Workflow_API.postman_collection.json`
3. Cập nhật biến môi trường:
   - `base_url`: `http://localhost:5000`
   - `token_technician`: JWT token của kỹ thuật viên
   - `token_accountant`: JWT token của kế toán
   - `token_tenant`: JWT token của người thuê

### Test Flow

#### 1. Kỹ Thuật Viên Ghi Chỉ Số

```bash
POST /api/chisodiennuoc
Authorization: Bearer <token_technician>

{
  "CanHoID": 1,
  "ThangNam": "2024-04",
  "ChiSoDienMoi": 1250.5,
  "ChiSoNuocMoi": 85.3,
  "AnhDongHoDien": "https://example.com/electric.jpg",
  "AnhDongHoNuoc": "https://example.com/water.jpg"
}
```

#### 2. Kế Toán Xem Chờ Duyệt

```bash
GET /api/chisodiennuoc/pending
Authorization: Bearer <token_accountant>
```

#### 3. Kế Toán Xác Nhận & Phát Hành

```bash
POST /api/chisodiennuoc/1/confirm
Authorization: Bearer <token_accountant>

{
  "ChiSoDienChinhThuc": 1250.5,
  "ChiSoNuocChinhThuc": 85.3,
  "GhiChuKeToan": "OK"
}
```

#### 4. Người Thuê Xem Hóa Đơn

```bash
GET /api/hoadon/my-invoices
Authorization: Bearer <token_tenant>
```

#### 5. Người Thuê Thanh Toán

```bash
POST /api/hoadon/1/mark-paid
Authorization: Bearer <token_tenant>

{
  "MaGiaoDich": "FT24042112345678"
}
```

## 📚 Tài Liệu

| File | Mô Tả |
|------|-------|
| [BILLING_SETUP.md](./BILLING_SETUP.md) | Hướng dẫn cài đặt chi tiết |
| [docs/BILLING_WORKFLOW.md](./docs/BILLING_WORKFLOW.md) | API documentation đầy đủ |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Tóm tắt implementation |
| [Billing_Workflow_API.postman_collection.json](./Billing_Workflow_API.postman_collection.json) | Postman collection |

## 🔐 Phân Quyền

| Endpoint | NhanVienKyThuat | KeToan | QuanLy | NguoiThue |
|----------|----------------|--------|--------|-----------|
| POST /chisodiennuoc | ✅ | ❌ | ✅ | ❌ |
| GET /chisodiennuoc/pending | ❌ | ✅ | ✅ | ❌ |
| POST /chisodiennuoc/:id/confirm | ❌ | ✅ | ✅ | ❌ |
| GET /hoadon/my-invoices | ❌ | ❌ | ❌ | ✅ |
| GET /hoadon/:id | ❌ | ✅ | ✅ | ✅* |
| POST /hoadon/:id/mark-paid | ❌ | ❌ | ❌ | ✅ |
| GET /hoadon | ❌ | ✅ | ✅ | ❌ |

*NguoiThue chỉ xem được hóa đơn của mình

## 💡 Ví Dụ Tính Toán

### Input:
- Căn hộ A101
- Tháng 04/2024
- Chỉ số điện mới: 1250.5 kWh
- Chỉ số nước mới: 85.3 m³
- Chỉ số điện cũ: 1170.0 kWh (tự động lấy)
- Chỉ số nước cũ: 70.0 m³ (tự động lấy)
- Tiền thuê: 5,000,000đ (từ hợp đồng)

### Tính toán:
```
Số điện = 1250.5 - 1170.0 = 80.5 kWh
Số nước = 85.3 - 70.0 = 15.3 m³

Tiền điện = 80.5 × 4,000 = 322,000đ
Tiền nước = 15.3 × 10,000 = 153,000đ
Tiền thuê = 5,000,000đ
Phí chung = 200,000đ
Phí vệ sinh = 50,000đ

TỔNG = 5,725,000đ
```

### Output:
```json
{
  "MaHoaDon": "HD202404001",
  "TongTien": 5725000,
  "NoiDungCK": "HD202404001",
  "QRUrl": "https://img.vietqr.io/image/VCB-1031312786-compact.png?amount=5725000&addInfo=HD202404001",
  "hoadonchitiet": [
    { "Loai": "TienThue", "SoTien": 5000000, "MoTa": "Tiền thuê tháng 2024-04" },
    { "Loai": "Dien", "SoTien": 322000, "MoTa": "Điện: 80.5 kWh × 4000đ" },
    { "Loai": "Nuoc", "SoTien": 153000, "MoTa": "Nước: 15.3 m³ × 10000đ" },
    { "Loai": "DichVu", "SoTien": 200000, "MoTa": "Phí quản lý chung" },
    { "Loai": "DichVu", "SoTien": 50000, "MoTa": "Phí vệ sinh" }
  ]
}
```

## 🎨 Frontend Example

### React Component - Payment Modal

```jsx
import React from 'react';

const PaymentModal = ({ invoice, onMarkPaid }) => {
  return (
    <div className="modal">
      <h2>Hóa Đơn {invoice.MaHoaDon}</h2>
      
      {/* Chi tiết */}
      <div className="details">
        {invoice.hoadonchitiet.map(item => (
          <div key={item.ID} className="row">
            <span>{item.MoTa}</span>
            <span>{item.SoTien.toLocaleString()}đ</span>
          </div>
        ))}
        <div className="total">
          <strong>Tổng cộng:</strong>
          <strong>{invoice.TongTien.toLocaleString()}đ</strong>
        </div>
      </div>

      {/* QR Code */}
      <div className="qr-section">
        <h3>Quét mã QR để thanh toán</h3>
        <img src={invoice.qrUrl} alt="VietQR" width="300" />
        
        <div className="bank-info">
          <p>🏦 {invoice.NganHangNhan}</p>
          <p>💳 STK: {invoice.SoTaiKhoan}</p>
          <p>💰 Số tiền: {invoice.TongTien.toLocaleString()}đ</p>
          <p>📝 Nội dung: {invoice.NoiDungCK}</p>
        </div>

        <button onClick={() => onMarkPaid(invoice.ID)}>
          ✅ Tôi đã chuyển khoản
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
```

## 🔄 Status Flow

### ChiSoDienNuoc (Meter Reading)
```
ChoDuyetKeToan → DaPhatHanhHoaDon
```

### HoaDon (Invoice)
```
ChuaTT → DaTT
```

## 🐛 Troubleshooting

### Lỗi: Migration failed
```bash
# Reset database (CHỈ dùng khi dev)
npx prisma migrate reset

# Hoặc
npx prisma db push
```

### Lỗi: Cannot find module billing.config.js
Đảm bảo file `server/src/config/billing.config.js` tồn tại

### QR Code không hiển thị
Kiểm tra:
- `VIETQR_API` trong config
- `bankCode` đúng format (VCB, TCB, MB, etc.)

## 📊 Database Schema

### Bảng `chisodiennuoc` - Thêm 8 cột:
- `AnhDongHoDien` VARCHAR(500)
- `AnhDongHoNuoc` VARCHAR(500)
- `TrangThai` ENUM
- `KeToanDuyetID` INT
- `NgayKeToanDuyet` DATETIME
- `ChiSoDienChinhThuc` DECIMAL(10,2)
- `ChiSoNuocChinhThuc` DECIMAL(10,2)
- `GhiChuKeToan` TEXT

### Bảng `hoadon` - Thêm 5 cột:
- `MaHoaDon` VARCHAR(50) UNIQUE
- `QRContent` TEXT
- `SoTaiKhoan` VARCHAR(50)
- `NganHangNhan` VARCHAR(100)
- `NoiDungCK` VARCHAR(200)

## 🚀 Next Steps

### Backend TODO:
- [ ] Implement file upload service (AWS S3 / Cloudinary)
- [ ] Add notification service (Email/SMS)
- [ ] Add webhook from bank for auto-confirmation
- [ ] Add dashboard for revenue statistics

### Frontend TODO:
- [ ] Create meter reading form with image upload
- [ ] Create pending readings list for accountant
- [ ] Create invoice list for tenant
- [ ] Create payment modal with QR code
- [ ] Add real-time notifications

## 📞 Support

Nếu gặp vấn đề:
1. Xem [BILLING_SETUP.md](./BILLING_SETUP.md) → Troubleshooting
2. Xem [docs/BILLING_WORKFLOW.md](./docs/BILLING_WORKFLOW.md) → API docs
3. Check server logs: `npm run dev`
4. Check database: `npx prisma studio`

## 📄 License

MIT

---

**Developed with ❤️ for Apartment Management System**

🎉 **Ready to use!**
