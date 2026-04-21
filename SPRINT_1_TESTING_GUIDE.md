# 🧪 SPRINT 1 - TESTING GUIDE

## 📋 Hướng Dẫn Test Đầy Đủ

Tài liệu này hướng dẫn cách test tất cả chức năng đã implement trong Sprint 1.

---

## 🚀 Setup & Preparation

### 1. Start Backend Server

```bash
cd server
npm install
npx prisma generate
npm run dev
```

**Expected:** Server chạy ở `http://localhost:5000`

### 2. Start Frontend Client

```bash
cd client
npm install
npm start
```

**Expected:** Client chạy ở `http://localhost:3000`

### 3. Prepare Test Data

Cần có ít nhất:
- ✅ 1 tài khoản **NguoiThue** (người thuê)
- ✅ 1 tài khoản **QuanLy** (quản lý)
- ✅ 1 tài khoản **ChuNha** (chủ nhà)
- ✅ Một số căn hộ với trạng thái "Trong" (trống)

---

## 🧪 Test Cases

### TEST 1: Đăng Nhập

#### Test 1.1: Đăng nhập với tài khoản NguoiThue

**Steps:**
1. Mở `http://localhost:3000/login`
2. Nhập username và password của NguoiThue
3. Click "Đăng nhập"

**Expected Results:**
- ✅ Redirect về trang Home
- ✅ Header hiển thị tên người dùng
- ✅ Menu hiển thị:
  - Trang chủ
  - Dashboard
  - Tìm Căn Hộ
  - Yêu Cầu Của Tôi
  - Hợp Đồng Của Tôi
  - Hóa Đơn

---

### TEST 2: Tìm Căn Hộ (Browse Apartments)

#### Test 2.1: Xem danh sách căn hộ

**Steps:**
1. Đăng nhập với tài khoản NguoiThue
2. Click menu "Tìm Căn Hộ"

**Expected Results:**
- ✅ Hiển thị danh sách căn hộ trống
- ✅ Mỗi card hiển thị:
  - Mã căn hộ
  - Số phòng, tầng
  - Diện tích
  - Giá thuê (nổi bật)
  - Tiền cọc
  - Badge "Còn trống"
  - Button "Gửi Yêu Cầu Thuê"

#### Test 2.2: Filter theo giá

**Steps:**
1. Nhập "Giá tối thiểu": 3000000
2. Nhập "Giá tối đa": 8000000
3. Quan sát kết quả

**Expected Results:**
- ✅ Chỉ hiển thị căn hộ có giá trong khoảng 3-8 triệu
- ✅ Số lượng căn hộ cập nhật

#### Test 2.3: Filter theo tầng

**Steps:**
1. Nhập "Tầng": 5
2. Quan sát kết quả

**Expected Results:**
- ✅ Chỉ hiển thị căn hộ ở tầng 5

#### Test 2.4: Tìm kiếm theo mã căn hộ

**Steps:**
1. Nhập "Tìm kiếm": "A101"
2. Quan sát kết quả

**Expected Results:**
- ✅ Chỉ hiển thị căn hộ có mã chứa "A101"

#### Test 2.5: Xóa bộ lọc

**Steps:**
1. Sau khi filter, click "Xóa bộ lọc"

**Expected Results:**
- ✅ Tất cả filter reset về rỗng
- ✅ Hiển thị lại tất cả căn hộ

---

### TEST 3: Gửi Yêu Cầu Thuê

#### Test 3.1: Mở modal yêu cầu thuê

**Steps:**
1. Ở trang "Tìm Căn Hộ"
2. Click button "Gửi Yêu Cầu Thuê" trên một căn hộ

**Expected Results:**
- ✅ Modal hiện ra
- ✅ Hiển thị đầy đủ thông tin căn hộ:
  - Mã căn hộ
  - Phòng, tầng
  - Diện tích
  - Giá thuê (nổi bật)
  - Tiền cọc
- ✅ Có textarea "Ghi chú"
- ✅ Có button "Hủy" và "Gửi Yêu Cầu"

#### Test 3.2: Gửi yêu cầu thành công

**Steps:**
1. Mở modal
2. Nhập ghi chú: "Tôi muốn thuê căn hộ này từ tháng 5"
3. Click "Gửi Yêu Cầu"

**Expected Results:**
- ✅ Loading state hiển thị
- ✅ Success message: "✅ Gửi yêu cầu thuê thành công!"
- ✅ Modal đóng
- ✅ Redirect về trang "Yêu Cầu Của Tôi"

#### Test 3.3: Gửi yêu cầu trùng

**Steps:**
1. Gửi yêu cầu cho căn hộ A
2. Thử gửi lại yêu cầu cho căn hộ A

**Expected Results:**
- ✅ Error message: "Bạn đã có yêu cầu thuê đang chờ xử lý cho căn hộ này"

---

### TEST 4: Xem Yêu Cầu Của Tôi

#### Test 4.1: Xem danh sách yêu cầu

**Steps:**
1. Click menu "Yêu Cầu Của Tôi"

**Expected Results:**
- ✅ Hiển thị danh sách yêu cầu đã gửi
- ✅ Mỗi yêu cầu hiển thị:
  - ID yêu cầu
  - Mã căn hộ, số phòng
  - Ngày gửi
  - Status badge (ChoKiemTra, ChoDuyet, DaDuyet, TuChoi)
  - Thông tin căn hộ (diện tích, giá, tầng)
  - Ghi chú của người dùng
  - Thông tin trạng thái

#### Test 4.2: Trạng thái "Chờ kiểm tra"

**Expected Results:**
- ✅ Badge màu vàng: "⏳ Chờ kiểm tra"
- ✅ Thông tin: "Yêu cầu của bạn đang chờ quản lý kiểm tra..."

#### Test 4.3: Trạng thái "Chờ duyệt"

**Steps:**
1. Quản lý approve yêu cầu (backend)
2. Refresh trang

**Expected Results:**
- ✅ Badge màu xanh dương: "📋 Chờ duyệt"
- ✅ Thông tin: "Yêu cầu đã qua kiểm tra và đang chờ chủ nhà phê duyệt..."

#### Test 4.4: Trạng thái "Đã duyệt"

**Steps:**
1. Chủ nhà approve yêu cầu (backend)
2. Refresh trang

**Expected Results:**
- ✅ Badge màu xanh lá: "✅ Đã duyệt"
- ✅ Thông tin: "🎉 Chúc mừng! Yêu cầu của bạn đã được duyệt..."

#### Test 4.5: Trạng thái "Từ chối"

**Expected Results:**
- ✅ Badge màu đỏ: "❌ Từ chối"
- ✅ Thông tin: "Rất tiếc, yêu cầu của bạn đã bị từ chối..."

#### Test 4.6: Empty state

**Steps:**
1. Đăng nhập với tài khoản mới chưa gửi yêu cầu
2. Vào "Yêu Cầu Của Tôi"

**Expected Results:**
- ✅ Icon 🏠
- ✅ Text: "Chưa có yêu cầu thuê nào"
- ✅ Button "Tìm Căn Hộ Ngay"

---

### TEST 5: Xem Hợp Đồng Của Tôi

#### Test 5.1: Xem danh sách hợp đồng

**Steps:**
1. Click menu "Hợp Đồng Của Tôi"

**Expected Results:**
- ✅ Hiển thị danh sách hợp đồng
- ✅ Filter tabs: Tất cả, Đang thuê, Hết hạn, Kết thúc
- ✅ Mỗi hợp đồng hiển thị:
  - ID hợp đồng
  - Mã căn hộ, số phòng
  - Ngày ký
  - Status badge
  - Ngày bắt đầu, kết thúc
  - Giá thuê, tiền cọc
  - Thống kê (đã thuê X tháng, còn Y ngày)

#### Test 5.2: Filter "Đang thuê"

**Steps:**
1. Click tab "Đang thuê"

**Expected Results:**
- ✅ Chỉ hiển thị hợp đồng có TrangThai = "DangThue"

#### Test 5.3: Cảnh báo hợp đồng sắp hết hạn

**Steps:**
1. Tìm hợp đồng còn ≤30 ngày

**Expected Results:**
- ✅ Banner màu cam ở đầu card
- ✅ Text: "HỢP ĐỒNG SẮP HẾT HẠN - Còn X ngày"
- ✅ Border card màu cam

#### Test 5.4: Thống kê thời gian

**Expected Results:**
- ✅ Box "Đã thuê": Hiển thị số tháng đã thuê
- ✅ Box "Còn lại": Hiển thị số ngày còn lại
- ✅ Màu cam nếu ≤30 ngày

#### Test 5.5: Download hợp đồng PDF

**Steps:**
1. Tìm hợp đồng có FileHopDong
2. Click button "Tải xuống"

**Expected Results:**
- ✅ Mở file PDF trong tab mới
- ✅ Hoặc download file về máy

#### Test 5.6: Empty state

**Steps:**
1. Đăng nhập với tài khoản chưa có hợp đồng
2. Vào "Hợp Đồng Của Tôi"

**Expected Results:**
- ✅ Icon 📄
- ✅ Text: "Chưa có hợp đồng nào"

---

### TEST 6: Cập Nhật Profile

#### Test 6.1: Xem thông tin cá nhân

**Steps:**
1. Click avatar ở header
2. Click "Thông tin cá nhân"

**Expected Results:**
- ✅ Hiển thị avatar với initial
- ✅ Hiển thị tên, email
- ✅ Role badge
- ✅ Status badge
- ✅ Tab "Thông tin cá nhân" active
- ✅ Hiển thị tất cả thông tin:
  - Họ tên, Email, SĐT
  - CCCD, Ngày sinh, Giới tính
  - Quốc tịch, Địa chỉ
  - Ngày tạo tài khoản

#### Test 6.2: Chỉnh sửa thông tin

**Steps:**
1. Click button "Chỉnh Sửa Thông Tin"
2. Form chuyển sang edit mode
3. Thay đổi một số thông tin
4. Click "Lưu Thay Đổi"

**Expected Results:**
- ✅ Loading state hiển thị
- ✅ Success message: "✅ Cập nhật thông tin thành công!"
- ✅ Form chuyển về view mode
- ✅ Thông tin mới hiển thị

#### Test 6.3: Validation

**Steps:**
1. Click "Chỉnh Sửa Thông Tin"
2. Xóa trống "Họ và tên"
3. Click "Lưu Thay Đổi"

**Expected Results:**
- ✅ Browser validation: "Please fill out this field"

#### Test 6.4: Hủy chỉnh sửa

**Steps:**
1. Click "Chỉnh Sửa Thông Tin"
2. Thay đổi một số thông tin
3. Click "Hủy"

**Expected Results:**
- ✅ Form chuyển về view mode
- ✅ Thông tin không thay đổi (reset về giá trị cũ)

#### Test 6.5: Đổi mật khẩu

**Steps:**
1. Click tab "Đổi Mật Khẩu"
2. Nhập mật khẩu hiện tại
3. Nhập mật khẩu mới (≥6 ký tự)
4. Nhập xác nhận mật khẩu mới
5. Click "Đổi Mật Khẩu"

**Expected Results:**
- ✅ Success message: "✅ Đổi mật khẩu thành công!"
- ✅ Form reset về rỗng

#### Test 6.6: Đổi mật khẩu - Validation

**Test Case A: Mật khẩu không khớp**
- Nhập mật khẩu mới: "123456"
- Nhập xác nhận: "654321"
- Expected: Error "Mật khẩu xác nhận không khớp!"

**Test Case B: Mật khẩu quá ngắn**
- Nhập mật khẩu mới: "123"
- Expected: Error "Mật khẩu mới phải có ít nhất 6 ký tự!"

---

### TEST 7: Navigation & Authorization

#### Test 7.1: Menu theo role NguoiThue

**Steps:**
1. Đăng nhập với NguoiThue

**Expected Menu:**
- ✅ Trang chủ
- ✅ Dashboard
- ✅ Tìm Căn Hộ
- ✅ Yêu Cầu Của Tôi
- ✅ Hợp Đồng Của Tôi
- ✅ Hóa Đơn

#### Test 7.2: Menu theo role QuanLy

**Steps:**
1. Đăng nhập với QuanLy

**Expected Menu:**
- ✅ Trang chủ
- ✅ Dashboard
- ✅ Căn hộ
- ✅ Tiện ích
- ✅ Tài sản
- ✅ Ghi Chỉ Số
- ✅ Duyệt Chỉ Số
- ✅ Hóa Đơn
- ✅ Hợp Đồng
- ✅ Yêu Cầu Thuê

#### Test 7.3: Authorization - Blocked Access

**Steps:**
1. Đăng nhập với NguoiThue
2. Thử truy cập `/apartments` (chỉ cho QuanLy)

**Expected Results:**
- ✅ Redirect về trang Home
- ✅ Hoặc hiển thị "Access Denied"

---

### TEST 8: Responsive Design

#### Test 8.1: Mobile View (375px)

**Steps:**
1. Mở DevTools
2. Chọn iPhone SE (375px)
3. Test tất cả trang

**Expected Results:**
- ✅ Grid chuyển sang 1 column
- ✅ Menu collapse
- ✅ Cards stack vertically
- ✅ Buttons full width
- ✅ Text readable

#### Test 8.2: Tablet View (768px)

**Steps:**
1. Chọn iPad (768px)

**Expected Results:**
- ✅ Grid 2 columns
- ✅ Layout responsive
- ✅ Spacing appropriate

#### Test 8.3: Desktop View (1920px)

**Expected Results:**
- ✅ Grid 3 columns
- ✅ Max-width containers
- ✅ Proper spacing

---

### TEST 9: Error Handling

#### Test 9.1: Network Error

**Steps:**
1. Stop backend server
2. Thử gửi yêu cầu thuê

**Expected Results:**
- ✅ Error message hiển thị
- ✅ Loading state kết thúc
- ✅ User có thể retry

#### Test 9.2: 401 Unauthorized

**Steps:**
1. Xóa token trong localStorage
2. Thử truy cập trang protected

**Expected Results:**
- ✅ Redirect về `/login`

#### Test 9.3: 404 Not Found

**Steps:**
1. Truy cập `/invalid-route`

**Expected Results:**
- ✅ Redirect về trang Home
- ✅ Hoặc hiển thị 404 page

---

### TEST 10: Performance

#### Test 10.1: Loading States

**Expected:**
- ✅ Spinner hiển thị khi fetch data
- ✅ Skeleton screens (optional)
- ✅ Disable buttons khi loading

#### Test 10.2: Debounce Search

**Steps:**
1. Nhập nhanh vào search box

**Expected:**
- ✅ Không gọi API mỗi keystroke
- ✅ Chỉ gọi sau khi user ngừng gõ

---

## 📊 Test Results Template

```
TEST CASE: [Tên test case]
DATE: [Ngày test]
TESTER: [Tên người test]
BROWSER: [Chrome/Firefox/Safari]
DEVICE: [Desktop/Mobile/Tablet]

RESULT: [PASS/FAIL]

NOTES:
- [Ghi chú nếu có]

BUGS FOUND:
- [Bug 1]
- [Bug 2]
```

---

## 🐛 Bug Report Template

```
BUG ID: BUG-001
TITLE: [Tiêu đề ngắn gọn]
SEVERITY: [Critical/High/Medium/Low]
PRIORITY: [P0/P1/P2/P3]

STEPS TO REPRODUCE:
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

EXPECTED RESULT:
[Kết quả mong đợi]

ACTUAL RESULT:
[Kết quả thực tế]

ENVIRONMENT:
- Browser: [Chrome 120]
- OS: [Windows 11]
- Screen: [1920x1080]

SCREENSHOTS:
[Attach screenshots]

ADDITIONAL INFO:
[Thông tin thêm]
```

---

## ✅ Test Completion Checklist

### Functional Testing
- [ ] Tất cả test cases đã chạy
- [ ] Tất cả features hoạt động đúng
- [ ] Authorization đúng theo role
- [ ] Error handling hoạt động

### UI/UX Testing
- [ ] Responsive trên mobile
- [ ] Responsive trên tablet
- [ ] Responsive trên desktop
- [ ] Loading states hiển thị
- [ ] Success/Error messages rõ ràng

### Performance Testing
- [ ] Page load < 3s
- [ ] API response < 1s
- [ ] No memory leaks
- [ ] Smooth animations

### Security Testing
- [ ] Authorization đúng
- [ ] Token validation
- [ ] Input validation
- [ ] XSS prevention

---

## 📝 Notes

- Test trên nhiều browsers: Chrome, Firefox, Safari, Edge
- Test trên nhiều devices: Desktop, Tablet, Mobile
- Test với nhiều roles: NguoiThue, QuanLy, ChuNha
- Document tất cả bugs tìm được
- Retest sau khi fix bugs

---

**Happy Testing! 🧪**
