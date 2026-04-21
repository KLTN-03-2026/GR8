# ✅ SPRINT 1 - HOÀN THÀNH

## 📋 Tổng Quan

Sprint 1 tập trung vào các chức năng cơ bản cho **Người Thuê** và hoàn thiện workflow thuê căn hộ.

**Thời gian:** 2 tuần  
**Trạng thái:** ✅ HOÀN THÀNH  
**Ngày hoàn thành:** 21/04/2026

---

## 🎯 Mục Tiêu Sprint

### ✅ Đã Hoàn Thành

1. **Tìm kiếm và xem căn hộ** - Frontend cho người thuê
2. **Gửi yêu cầu thuê** - Form và workflow hoàn chỉnh
3. **Xem trạng thái yêu cầu thuê** - Theo dõi yêu cầu của mình
4. **Xem hợp đồng** - Danh sách và chi tiết hợp đồng
5. **Cập nhật thông tin cá nhân** - Profile management
6. **Thanh toán hóa đơn** - Đã có từ trước (backend + frontend)
7. **Navigation & Routes** - Cập nhật menu theo role

### ❌ Không Làm (Theo Yêu Cầu)

- **Chatbot AI** - Bỏ qua trong Sprint 1

---

## 📁 Files Đã Tạo/Cập Nhật

### Frontend - New Files (3 files)

1. **`client/src/pages/canho/BrowseApartments.jsx`**
   - Trang tìm kiếm căn hộ cho người thuê
   - Filter theo giá, tầng, tìm kiếm
   - Gửi yêu cầu thuê trực tiếp
   - Modal xác nhận yêu cầu thuê

2. **`client/src/pages/yeucauthue/MyRentalRequests.jsx`**
   - Xem danh sách yêu cầu thuê của mình
   - Theo dõi trạng thái (ChoKiemTra, ChoDuyet, DaDuyet, TuChoi)
   - Thông tin chi tiết căn hộ
   - Ghi chú và timeline

3. **`client/src/pages/hopdong/MyContracts.jsx`**
   - Danh sách hợp đồng của người thuê
   - Filter theo trạng thái
   - Thống kê thời gian thuê
   - Cảnh báo hợp đồng sắp hết hạn
   - Download file hợp đồng PDF

### Frontend - Updated Files (3 files)

4. **`client/src/App.js`**
   - Thêm routes mới:
     - `/browse-apartments` - Tìm căn hộ (NguoiThue, KhachHang)
     - `/my-rental-requests` - Yêu cầu của tôi (NguoiThue, KhachHang)
     - `/my-contracts` - Hợp đồng của tôi (NguoiThue)
   - Phân quyền routes theo role

5. **`client/src/components/Layout.jsx`**
   - Cập nhật menu navigation theo role
   - Thêm menu items cho NguoiThue:
     - Tìm Căn Hộ
     - Yêu Cầu Của Tôi
     - Hợp Đồng Của Tôi
     - Hóa Đơn
   - Thêm menu items cho KhachHang:
     - Tìm Căn Hộ
     - Yêu Cầu Của Tôi

6. **`client/src/pages/Profile.jsx`**
   - Đã có sẵn và hoàn chỉnh
   - Form cập nhật thông tin
   - Đổi mật khẩu
   - Hiển thị role và status

### Backend - Updated Files (2 files)

7. **`server/src/modules/hopdong/hopdong.route.js`**
   - Cập nhật authorization cho route `/my`
   - Thêm role "NguoiThue" vào authorize

8. **`server/src/modules/yeucauthue/yeucauthue.route.js`**
   - Cập nhật authorization cho routes
   - Thêm role "NguoiThue" vào `/create` và `/my`

---

## 🔐 Phân Quyền (Authorization)

### Người Thuê (NguoiThue)

| Chức năng | Endpoint | Method | Quyền |
|-----------|----------|--------|-------|
| Tìm căn hộ | `/apartments` | GET | ✅ Public |
| Gửi yêu cầu thuê | `/yeucauthue/create` | POST | ✅ NguoiThue, KhachHang |
| Xem yêu cầu của mình | `/yeucauthue/my` | GET | ✅ NguoiThue, KhachHang |
| Xem hợp đồng của mình | `/hopdong/my` | GET | ✅ NguoiThue, KhachHang |
| Xem hóa đơn | `/hoadon/my-invoices` | GET | ✅ NguoiThue |
| Thanh toán hóa đơn | `/hoadon/:id/mark-paid` | POST | ✅ NguoiThue |
| Cập nhật profile | `/users/:id` | PUT | ✅ Authenticated |

### Quản Lý (QuanLy)

| Chức năng | Endpoint | Method | Quyền |
|-----------|----------|--------|-------|
| Xem tất cả yêu cầu thuê | `/yeucauthue` | GET | ✅ QuanLy, ChuNha |
| Duyệt yêu cầu (bước 1) | `/yeucauthue/manager-approve/:id` | PUT | ✅ QuanLy |
| Từ chối yêu cầu | `/yeucauthue/reject/:id` | PUT | ✅ QuanLy, ChuNha |
| Xem tất cả hợp đồng | `/hopdong` | GET | ✅ QuanLy, ChuNha |
| Tạo hợp đồng | `/hopdong/create` | POST | ✅ QuanLy, ChuNha |

### Chủ Nhà (ChuNha)

| Chức năng | Endpoint | Method | Quyền |
|-----------|----------|--------|-------|
| Duyệt yêu cầu (bước 2) | `/yeucauthue/owner-approve/:id` | PUT | ✅ ChuNha |
| Xem tất cả yêu cầu thuê | `/yeucauthue` | GET | ✅ QuanLy, ChuNha |
| Xem tất cả hợp đồng | `/hopdong` | GET | ✅ QuanLy, ChuNha |

---

## 🎨 UI/UX Features

### 1. Browse Apartments (Tìm Căn Hộ)

**Features:**
- ✅ Grid layout responsive (3 columns desktop, 2 tablet, 1 mobile)
- ✅ Filter theo giá (min/max)
- ✅ Filter theo tầng
- ✅ Tìm kiếm theo mã căn hộ
- ✅ Hiển thị giá thuê nổi bật
- ✅ Badge "Còn trống"
- ✅ Modal gửi yêu cầu thuê với thông tin đầy đủ
- ✅ Validation và error handling

**Design:**
- Gradient background (teal-cyan)
- Card hover effects
- Responsive grid
- Clear CTAs

### 2. My Rental Requests (Yêu Cầu Của Tôi)

**Features:**
- ✅ Danh sách yêu cầu với status badges
- ✅ Timeline trạng thái
- ✅ Thông tin căn hộ chi tiết
- ✅ Ghi chú của người dùng
- ✅ Hướng dẫn theo từng trạng thái
- ✅ Link đến trang tìm căn hộ

**Status:**
- ⏳ Chờ kiểm tra (ChoKiemTra)
- 📋 Chờ duyệt (ChoDuyet)
- ✅ Đã duyệt (DaDuyet)
- ❌ Từ chối (TuChoi)

### 3. My Contracts (Hợp Đồng Của Tôi)

**Features:**
- ✅ Filter tabs (Tất cả, Đang thuê, Hết hạn, Kết thúc)
- ✅ Cảnh báo hợp đồng sắp hết hạn (≤30 ngày)
- ✅ Thống kê thời gian thuê (tháng)
- ✅ Countdown ngày còn lại
- ✅ Download file hợp đồng PDF
- ✅ Thông tin chi tiết căn hộ
- ✅ Lịch sử thanh toán (link)

**Status:**
- ⏳ Chờ ký (ChoKy)
- ✍️ Đã ký (DaKy)
- 🏠 Đang thuê (DangThue)
- ⚠️ Hết hạn (HetHan)
- 🔚 Kết thúc (KetThuc)
- 🔄 Chuyển nhượng (ChuyenNhuong)

### 4. Profile (Thông Tin Cá Nhân)

**Features:**
- ✅ View/Edit mode toggle
- ✅ Avatar với initial
- ✅ Role badge
- ✅ Status badge
- ✅ Form validation
- ✅ Tab: Thông tin cá nhân / Đổi mật khẩu
- ✅ Success/Error messages
- ✅ Responsive layout

---

## 🔄 Workflow: Thuê Căn Hộ

### Bước 1: Tìm Căn Hộ
```
Người Thuê → Browse Apartments → Filter/Search → Xem Chi Tiết
```

### Bước 2: Gửi Yêu Cầu
```
Click "Gửi Yêu Cầu Thuê" → Modal hiện thông tin → Nhập ghi chú → Submit
↓
Backend: POST /yeucauthue/create
↓
Trạng thái: ChoKiemTra
```

### Bước 3: Theo Dõi Yêu Cầu
```
My Rental Requests → Xem trạng thái
↓
ChoKiemTra → Quản lý kiểm tra → ChoDuyet → Chủ nhà duyệt → DaDuyet
```

### Bước 4: Ký Hợp Đồng
```
Quản lý tạo hợp đồng → Người thuê ký → Trạng thái: DangThue
```

### Bước 5: Thanh Toán
```
My Contracts → Xem hợp đồng → My Invoices → Thanh toán hóa đơn hàng tháng
```

---

## 📊 Statistics

### Code Metrics

| Metric | Count |
|--------|-------|
| New Frontend Files | 3 |
| Updated Frontend Files | 3 |
| Updated Backend Files | 2 |
| Total Lines of Code | ~2,500+ |
| New Routes | 3 |
| New Menu Items | 3 |

### Features Completed

| Feature | Status |
|---------|--------|
| Browse Apartments | ✅ |
| Send Rental Request | ✅ |
| View My Requests | ✅ |
| View My Contracts | ✅ |
| Update Profile | ✅ (Already existed) |
| Pay Invoices | ✅ (Already existed) |
| Navigation Update | ✅ |
| Authorization Update | ✅ |

---

## 🧪 Testing Checklist

### Frontend Testing

- [ ] Browse Apartments
  - [ ] Filter by price works
  - [ ] Filter by floor works
  - [ ] Search works
  - [ ] Modal opens correctly
  - [ ] Submit request works
  - [ ] Error handling works

- [ ] My Rental Requests
  - [ ] List displays correctly
  - [ ] Status badges show correctly
  - [ ] Empty state shows
  - [ ] Refresh works

- [ ] My Contracts
  - [ ] Filter tabs work
  - [ ] Expiring warning shows
  - [ ] Stats calculate correctly
  - [ ] Download PDF works (if file exists)

- [ ] Profile
  - [ ] View mode displays data
  - [ ] Edit mode works
  - [ ] Form validation works
  - [ ] Submit updates data
  - [ ] Password change works

### Backend Testing

- [ ] Authorization
  - [ ] NguoiThue can access `/yeucauthue/my`
  - [ ] NguoiThue can access `/hopdong/my`
  - [ ] NguoiThue can create rental request
  - [ ] Unauthorized roles blocked

- [ ] API Endpoints
  - [ ] GET `/yeucauthue/my` returns user's requests
  - [ ] POST `/yeucauthue/create` creates request
  - [ ] GET `/hopdong/my` returns user's contracts
  - [ ] PUT `/users/:id` updates profile

---

## 🐛 Known Issues

### Minor Issues

1. **File Upload** - Chưa có service upload ảnh CCCD/Passport
2. **Email Notification** - Chưa gửi email khi yêu cầu được duyệt
3. **Contract PDF** - Chưa có chức năng generate PDF hợp đồng
4. **Payment Gateway** - Chưa tích hợp VNPay/MoMo

### Future Enhancements

1. 📸 **File Upload Service** - AWS S3 / Cloudinary
2. 📧 **Email Service** - SendGrid / Nodemailer
3. 📄 **PDF Generation** - PDFKit / Puppeteer
4. 💳 **Payment Gateway** - VNPay / MoMo integration
5. 🔔 **Real-time Notifications** - WebSocket / Socket.io
6. 📱 **Mobile Responsive** - Optimize for mobile devices

---

## 🚀 Next Sprint (Sprint 2)

### Planned Features

1. **Quản Lý Core**
   - Dashboard với charts
   - Duyệt yêu cầu thuê (frontend)
   - Quản lý hợp đồng (CRUD)
   - Ghi chỉ số điện nước (frontend)
   - Kế toán duyệt & phát hành hóa đơn (frontend)

2. **File Upload**
   - Upload ảnh căn hộ
   - Upload giấy tờ cá nhân
   - Upload ảnh đồng hồ điện nước

3. **Email Service**
   - Gửi email khi yêu cầu được duyệt
   - Gửi email khi có hóa đơn mới
   - Template email

---

## 📝 Notes

### Development Notes

- Sử dụng Tailwind CSS cho styling
- Responsive design cho mobile/tablet/desktop
- Error handling và validation đầy đủ
- Loading states cho tất cả API calls
- Success/Error messages cho user feedback

### Deployment Notes

- Cần cập nhật `.env` với DATABASE_URL
- Chạy `npm install` cho cả client và server
- Chạy `npx prisma generate` sau khi update schema
- Test authorization với các roles khác nhau

---

## ✅ Sprint 1 - COMPLETED!

**Total Time:** 2 weeks  
**Total Files:** 8 files (3 new, 5 updated)  
**Total Lines:** ~2,500+ lines  
**Status:** ✅ READY FOR TESTING

**Next Steps:**
1. Test tất cả chức năng
2. Fix bugs nếu có
3. Deploy to staging
4. User acceptance testing
5. Start Sprint 2

---

**Prepared by:** AI Assistant  
**Date:** April 21, 2026  
**Version:** 1.0
