# 🎨 Frontend - Billing Workflow UI

## 📦 Các Components Đã Tạo

### 1. **Services**
- `src/services/billingService.js` - API calls cho billing workflow

### 2. **Pages - BƯỚC 1: Kỹ Thuật Viên**
- `src/pages/chisodiennuoc/MeterReadingForm.jsx` - Form ghi chỉ số + upload ảnh

### 3. **Pages - BƯỚC 2: Kế Toán**
- `src/pages/chisodiennuoc/PendingReadingsList.jsx` - Danh sách chỉ số chờ duyệt
- `src/components/billing/ConfirmReadingModal.jsx` - Modal xác nhận & phát hành hóa đơn

### 4. **Pages - BƯỚC 3: Người Thuê**
- `src/pages/hoadon/MyInvoicesList.jsx` - Danh sách hóa đơn
- `src/components/billing/PaymentModal.jsx` - Modal thanh toán với QR code

---

## 🚀 Cài Đặt & Sử Dụng

### 1. Import vào Routes

Thêm vào file `App.js` hoặc router của bạn:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MeterReadingForm from './pages/chisodiennuoc/MeterReadingForm';
import PendingReadingsList from './pages/chisodiennuoc/PendingReadingsList';
import MyInvoicesList from './pages/hoadon/MyInvoicesList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* BƯỚC 1: Kỹ thuật viên */}
        <Route path="/meter-reading" element={<MeterReadingForm />} />
        
        {/* BƯỚC 2: Kế toán */}
        <Route path="/pending-readings" element={<PendingReadingsList />} />
        
        {/* BƯỚC 3: Người thuê */}
        <Route path="/my-invoices" element={<MyInvoicesList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🎯 Phân Quyền Routes

### Theo Vai Trò:

```jsx
// Kỹ thuật viên
<PrivateRoute role="NhanVienKyThuat">
  <Route path="/meter-reading" element={<MeterReadingForm />} />
</PrivateRoute>

// Kế toán
<PrivateRoute role="KeToan">
  <Route path="/pending-readings" element={<PendingReadingsList />} />
</PrivateRoute>

// Người thuê
<PrivateRoute role="NguoiThue">
  <Route path="/my-invoices" element={<MyInvoicesList />} />
</PrivateRoute>
```

---

## 📱 Screenshots & Features

### BƯỚC 1: Form Ghi Chỉ Số
**Features:**
- ✅ Input căn hộ ID
- ✅ Chọn tháng/năm
- ✅ Nhập chỉ số điện mới
- ✅ Nhập chỉ số nước mới
- ✅ Upload URL ảnh đồng hồ điện
- ✅ Upload URL ảnh đồng hồ nước
- ✅ Validation form
- ✅ Success/Error messages

**URL:** `/meter-reading`

---

### BƯỚC 2: Danh Sách Chờ Duyệt
**Features:**
- ✅ Hiển thị danh sách chỉ số chờ duyệt
- ✅ Xem thông tin căn hộ
- ✅ Xem chỉ số cũ/mới
- ✅ Tính tiêu thụ tự động
- ✅ Click "Xem & Duyệt" → Mở modal

**Modal Xác Nhận:**
- ✅ Hiển thị ảnh đồng hồ điện + nước
- ✅ Cho phép sửa chỉ số nếu cần
- ✅ Tính toán dự kiến hóa đơn real-time
- ✅ Nhập ghi chú kế toán
- ✅ Xác nhận → Tự động phát hành hóa đơn

**URL:** `/pending-readings`

---

### BƯỚC 3: Danh Sách Hóa Đơn
**Features:**
- ✅ Hiển thị danh sách hóa đơn của người thuê
- ✅ Filter: Tất cả / Chưa TT / Đã TT
- ✅ Hiển thị chi tiết từng khoản phí
- ✅ Badge trạng thái (Chưa TT / Đã TT)
- ✅ Button "Thanh Toán Ngay" cho hóa đơn chưa thanh toán

**Modal Thanh Toán:**
- ✅ Hiển thị QR code VietQR
- ✅ Thông tin ngân hàng
- ✅ Copy số TK, số tiền, nội dung
- ✅ Input mã giao dịch
- ✅ Button "Tôi đã chuyển khoản"
- ✅ Hướng dẫn thanh toán

**URL:** `/my-invoices`

---

## 🎨 Styling

Các components sử dụng **Tailwind CSS**. Đảm bảo bạn đã cài đặt:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 🔧 Dependencies

Các packages cần thiết:

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

---

## 📝 Utility Functions

### formatCurrency.js
```javascript
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
```

### formatDate.js
```javascript
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};
```

---

## 🔐 Authentication

Các components tự động lấy token từ `localStorage`:

```javascript
// Trong axios.js
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

Đảm bảo sau khi login, bạn lưu token:

```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

---

## 🧪 Testing

### Test Flow:

**1. Kỹ Thuật Viên:**
```
1. Login với role NhanVienKyThuat
2. Vào /meter-reading
3. Điền form và submit
4. Kiểm tra success message
```

**2. Kế Toán:**
```
1. Login với role KeToan
2. Vào /pending-readings
3. Click "Xem & Duyệt" một chỉ số
4. Xem ảnh đồng hồ
5. Xác nhận chỉ số
6. Click "Xác Nhận & Phát Hành"
7. Kiểm tra hóa đơn được tạo
```

**3. Người Thuê:**
```
1. Login với role NguoiThue
2. Vào /my-invoices
3. Click "Thanh Toán Ngay"
4. Xem QR code
5. Copy thông tin ngân hàng
6. Nhập mã giao dịch
7. Click "Tôi đã chuyển khoản"
8. Kiểm tra trạng thái đổi thành "Đã TT"
```

---

## 🐛 Troubleshooting

### Lỗi: CORS
```
Access to XMLHttpRequest blocked by CORS policy
```

**Giải pháp:** Đảm bảo server có CORS config:
```javascript
// server/src/app.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### Lỗi: 401 Unauthorized
```
Request failed with status code 401
```

**Giải pháp:** 
- Kiểm tra token trong localStorage
- Login lại để lấy token mới

### Lỗi: QR Code không hiển thị
```
Failed to load image
```

**Giải pháp:**
- Kiểm tra `qrUrl` trong response
- Kiểm tra VietQR API endpoint
- Kiểm tra bank code trong config

---

## 📚 API Endpoints

Tất cả endpoints đã được implement trong `billingService.js`:

```javascript
// BƯỚC 1
createMeterReading(data)
getAllMeterReadings(params)
getMeterReadingById(id)

// BƯỚC 2
getPendingMeterReadings(params)
confirmAndGenerateInvoice(id, data)

// BƯỚC 3
getMyInvoices(params)
getInvoiceById(id)
markInvoiceAsPaid(id, data)
getAllInvoices(params)
```

---

## 🎯 Next Steps

### TODO:
- [ ] Implement file upload service (AWS S3 / Cloudinary)
- [ ] Add real-time notifications (WebSocket)
- [ ] Add invoice PDF export
- [ ] Add payment history page
- [ ] Add dashboard with statistics
- [ ] Add mobile responsive improvements
- [ ] Add loading skeletons
- [ ] Add error boundaries

---

## 💡 Tips

1. **Upload Ảnh:** Hiện tại dùng URL. Nên implement upload service:
   - AWS S3
   - Cloudinary
   - Firebase Storage

2. **QR Code:** VietQR API miễn phí, không cần API key

3. **Validation:** Thêm validation cho số điện/nước phải > số cũ

4. **UX:** Thêm loading states và error handling

5. **Mobile:** Test trên mobile, QR code dễ quét hơn

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs
2. Check Network tab (DevTools)
3. Check server logs
4. Xem API documentation: `docs/BILLING_WORKFLOW.md`

---

**🎉 Frontend đã sẵn sàng sử dụng!**
