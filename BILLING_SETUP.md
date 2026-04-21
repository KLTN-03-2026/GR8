# Hướng Dẫn Cài Đặt Quy Trình Thanh Toán 3 Bước

## 📋 Tổng Quan

Quy trình thanh toán hóa đơn tự động với 3 bước:
1. **Kỹ thuật viên** ghi chỉ số + upload ảnh đồng hồ
2. **Kế toán** xác nhận và phát hành hóa đơn tự động
3. **Người thuê** xem hóa đơn, quét QR thanh toán

## 🚀 Cài Đặt

### Bước 1: Chạy Migration

```bash
cd server
npx prisma migrate deploy
```

Hoặc nếu đang dev:

```bash
npx prisma migrate dev
```

### Bước 2: Generate Prisma Client

```bash
npx prisma generate
```

### Bước 3: Cấu Hình Giá & Ngân Hàng

Mở file `server/src/config/billing.config.js` và cập nhật:

```javascript
module.exports = {
  // Đơn giá điện nước
  ELECTRICITY_PRICE: 4000,      // VNĐ/kWh
  WATER_PRICE: 10000,           // VNĐ/m³
  COMMON_FEE: 200000,           // Phí chung/tháng
  CLEANING_FEE: 50000,          // Phí vệ sinh/tháng

  // Thông tin ngân hàng THẬT của bạn
  BANK_INFO: {
    accountNumber: '1031312786',           // ← Thay số TK của bạn
    bankName: 'Vietcombank',               // ← Thay tên ngân hàng
    accountName: 'CONG TY ABC',            // ← Thay tên chủ TK
    bankCode: 'VCB',                       // ← Mã ngân hàng (VCB, TCB, MB, etc.)
  },

  PAYMENT_DUE_DAYS: 15,  // Số ngày đến hạn thanh toán
};
```

### Bước 4: Khởi Động Server

```bash
cd server
npm run dev
```

## ✅ Kiểm Tra

### 1. Test Database Connection

```bash
curl http://localhost:5000/api/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Server OK, Database connected"
}
```

### 2. Test API Endpoints

Kiểm tra routes đã được đăng ký:

```bash
# Xem danh sách chỉ số
curl http://localhost:5000/api/chisodiennuoc \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xem hóa đơn
curl http://localhost:5000/api/hoadon/my-invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Quy Trình Sử Dụng

### BƯỚC 1: Nhân Viên Kỹ Thuật Ghi Chỉ Số

**Endpoint:** `POST /api/chisodiennuoc`

**Quyền:** `NhanVienKyThuat`, `QuanLy`

**Body:**
```json
{
  "CanHoID": 1,
  "ThangNam": "2024-04",
  "ChiSoDienMoi": 1250.5,
  "ChiSoNuocMoi": 85.3,
  "AnhDongHoDien": "https://storage.example.com/electric.jpg",
  "AnhDongHoNuoc": "https://storage.example.com/water.jpg"
}
```

**Kết quả:**
- Chỉ số được lưu với trạng thái `ChoDuyetKeToan`
- Hệ thống tự động lấy chỉ số cũ từ tháng trước

---

### BƯỚC 2: Kế Toán Xác Nhận & Phát Hành

**2A. Xem danh sách chờ duyệt:**

`GET /api/chisodiennuoc/pending`

**Quyền:** `KeToan`, `QuanLy`

**2B. Xác nhận và phát hành hóa đơn:**

`POST /api/chisodiennuoc/:id/confirm`

**Body:**
```json
{
  "ChiSoDienChinhThuc": 1250.5,
  "ChiSoNuocChinhThuc": 85.3,
  "GhiChuKeToan": "Đã kiểm tra ảnh, chỉ số chính xác"
}
```

**Kết quả:**
- Chỉ số → trạng thái `DaPhatHanhHoaDon`
- Hệ thống TỰ ĐỘNG tạo hóa đơn với:
  - Mã hóa đơn: `HD202404001`
  - Tính tiền điện, nước, phí dịch vụ
  - Tạo QR code VietQR
  - Trạng thái: `ChuaTT`

---

### BƯỚC 3: Người Thuê Thanh Toán

**3A. Xem danh sách hóa đơn:**

`GET /api/hoadon/my-invoices`

**Quyền:** `NguoiThue`

**3B. Xem chi tiết + QR code:**

`GET /api/hoadon/:id`

**Response chứa:**
- Chi tiết từng khoản phí
- QR code URL: `qrUrl`
- Thông tin ngân hàng
- Nội dung chuyển khoản

**3C. Đánh dấu đã thanh toán:**

`POST /api/hoadon/:id/mark-paid`

**Body (optional):**
```json
{
  "MaGiaoDich": "FT24042112345678",
  "GhiChu": "Đã chuyển khoản lúc 14:30"
}
```

**Kết quả:**
- Hóa đơn → trạng thái `DaTT`
- Tạo bản ghi thanh toán

---

## 🎨 Frontend Integration

### React Example - Hiển thị QR Code

```jsx
import React from 'react';

const InvoicePayment = ({ invoice }) => {
  const handleMarkPaid = async () => {
    const response = await fetch(`/api/hoadon/${invoice.ID}/mark-paid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        MaGiaoDich: 'FT24042112345678',
      }),
    });

    if (response.ok) {
      alert('Đã xác nhận thanh toán!');
    }
  };

  return (
    <div className="payment-modal">
      <h2>Hóa Đơn {invoice.MaHoaDon}</h2>
      
      {/* Chi tiết hóa đơn */}
      <div className="invoice-details">
        {invoice.hoadonchitiet.map(item => (
          <div key={item.ID}>
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
          <p>🏦 <strong>{invoice.NganHangNhan}</strong></p>
          <p>💳 STK: <strong>{invoice.SoTaiKhoan}</strong></p>
          <p>💰 Số tiền: <strong>{invoice.TongTien.toLocaleString()}đ</strong></p>
          <p>📝 Nội dung: <strong>{invoice.NoiDungCK}</strong></p>
        </div>

        <button 
          onClick={handleMarkPaid}
          className="btn-confirm"
        >
          ✅ Tôi đã chuyển khoản
        </button>
      </div>
    </div>
  );
};

export default InvoicePayment;
```

---

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

---

## 📊 Database Schema

### Bảng `chisodiennuoc` (Meter Readings)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| AnhDongHoDien | VARCHAR(500) | URL ảnh đồng hồ điện |
| AnhDongHoNuoc | VARCHAR(500) | URL ảnh đồng hồ nước |
| TrangThai | ENUM | ChoDuyetKeToan, DaDuyet, DaPhatHanhHoaDon, TuChoi |
| KeToanDuyetID | INT | ID kế toán duyệt |
| NgayKeToanDuyet | DATETIME | Ngày duyệt |
| ChiSoDienChinhThuc | DECIMAL | Chỉ số điện chính thức |
| ChiSoNuocChinhThuc | DECIMAL | Chỉ số nước chính thức |
| GhiChuKeToan | TEXT | Ghi chú kế toán |

### Bảng `hoadon` (Invoices)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MaHoaDon | VARCHAR(50) | Mã hóa đơn (HD202404001) |
| QRContent | TEXT | Nội dung QR |
| SoTaiKhoan | VARCHAR(50) | Số TK nhận |
| NganHangNhan | VARCHAR(100) | Tên ngân hàng |
| NoiDungCK | VARCHAR(200) | Nội dung chuyển khoản |

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module billing.config.js"

**Giải pháp:** Đảm bảo file `server/src/config/billing.config.js` tồn tại

### Lỗi: Migration failed

**Giải pháp:**
```bash
# Reset database (CHỈ dùng khi dev)
npx prisma migrate reset

# Hoặc apply migration thủ công
npx prisma db push
```

### QR Code không hiển thị

**Giải pháp:** Kiểm tra:
1. `VIETQR_API` trong config
2. `bankCode` đúng format (VCB, TCB, MB, etc.)
3. URL được generate đúng format

### Không tính được tiền điện/nước

**Giải pháp:** Kiểm tra:
1. Chỉ số mới > chỉ số cũ
2. `ELECTRICITY_PRICE` và `WATER_PRICE` trong config
3. Hợp đồng có `GiaThue`

---

## 📚 Tài Liệu Chi Tiết

Xem thêm: [docs/BILLING_WORKFLOW.md](./docs/BILLING_WORKFLOW.md)

---

## 🎯 Next Steps

1. **Upload ảnh:** Implement file upload service (AWS S3, Cloudinary)
2. **Thông báo:** Gửi email/SMS khi có hóa đơn mới
3. **Webhook:** Tích hợp webhook từ ngân hàng để tự động xác nhận thanh toán
4. **Dashboard:** Tạo dashboard thống kê doanh thu, công nợ

---

## 💡 Tips

- Mã hóa đơn format: `HD{ThangNam}{CanHoID}` → `HD202404001`
- Nội dung CK ngắn gọn để dễ nhập: `HD202404001`
- QR code tự động điền đầy đủ thông tin, người dùng chỉ cần quét
- Kế toán nên kiểm tra lại sau khi người thuê đánh dấu đã thanh toán

---

**Chúc bạn triển khai thành công! 🚀**
