# 📮 HƯỚNG DẪN TEST API VỚI POSTMAN

## 🚀 BƯỚC 1: KHỞI ĐỘNG SERVER

```bash
cd DoAnTotNghiep/server
npm run dev
```

Đợi thông báo:
```
Server is running on http://localhost:5000
```

---

## 🔐 BƯỚC 2: TEST API LOGIN

### **Request Configuration:**

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "TenDangNhapOrEmail": "your-email@example.com",
    "MatKhau": "your-password"
  }
  ```

### **Ví dụ cụ thể:**

```json
{
  "TenDangNhapOrEmail": "admin@example.com",
  "MatKhau": "123456"
}
```

HOẶC dùng username:

```json
{
  "TenDangNhapOrEmail": "admin",
  "MatKhau": "123456"
}
```

### **Response thành công (200 OK):**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "ID": 1,
      "HoTen": "Admin User",
      "Email": "admin@example.com",
      "VaiTro": "QuanLy",
      "TrangThai": "Active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ LƯU TOKEN NÀY!** Bạn sẽ cần nó cho các API khác.

---

## 📝 BƯỚC 3: ĐĂNG KÝ TÀI KHOẢN MỚI (Nếu chưa có)

### **Request Configuration:**

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "TenDangNhap": "testuser",
    "MatKhau": "123456",
    "HoTen": "Test User",
    "Email": "testuser@example.com",
    "SoDienThoai": "0987654321"
  }
  ```

### **Response thành công (201 Created):**

```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "ID": 5,
    "TenDangNhap": "testuser",
    "HoTen": "Test User",
    "Email": "testuser@example.com",
    "TrangThai": "Active",
    "roles": {
      "TenVaiTro": "NguoiThue"
    }
  }
}
```

---

## 🔑 BƯỚC 4: SỬ DỤNG TOKEN CHO CÁC API KHÁC

Sau khi login thành công, copy **token** từ response.

### **Cách 1: Thêm vào Headers thủ công**

Với mỗi request cần authentication:

- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### **Cách 2: Dùng Postman Environment (Khuyến nghị)**

1. Click biểu tượng **mắt** (👁️) góc phải trên
2. Click **Add** → Tạo Environment mới
3. Đặt tên: `Apartment Management Dev`
4. Thêm variables:
   ```
   Variable: auth_token
   Initial Value: <paste-your-token>
   Current Value: <paste-your-token>
   ```
5. Click **Save**
6. Chọn Environment ở dropdown góc phải trên

Sau đó, trong Headers của các request:
```
Authorization: Bearer {{auth_token}}
```

---

## 📋 BƯỚC 5: TEST CÁC API KHÁC

### **1. Xem danh sách căn hộ (Public - Không cần token)**

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/apartments`

### **2. Xem danh sách tài sản (Cần token)**

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/taisan`
- **Headers**:
  ```
  Authorization: Bearer {{auth_token}}
  ```

### **3. Thêm tài sản mới (Cần token + Role QuanLy/ChuNha)**

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/taisan`
- **Headers**:
  ```
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "MaTaiSan": "TS001",
    "TenTaiSan": "Điều hòa Daikin",
    "LoaiTaiSan": "ThietBiCanHo",
    "CanHoID": 1,
    "TinhTrang": "Tot",
    "GiaTri": 15000000
  }
  ```

### **4. Xem danh sách tiện ích (Public)**

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/tienich`

### **5. Thống kê tài sản (Cần token + Role QuanLy)**

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/taisan/stats/thongke`
- **Headers**:
  ```
  Authorization: Bearer {{auth_token}}
  ```

---

## ❌ XỬ LÝ LỖI THƯỜNG GẶP

### **1. Lỗi 400 - Bad Request**

```json
{
  "success": false,
  "message": "Vui lòng nhập tên đăng nhập/email và mật khẩu"
}
```

**Nguyên nhân**: Thiếu field bắt buộc trong body
**Giải pháp**: Kiểm tra lại body JSON

---

### **2. Lỗi 401 - Unauthorized**

```json
{
  "success": false,
  "message": "Tài khoản không tồn tại"
}
```

**Nguyên nhân**: Email/username không đúng
**Giải pháp**: Kiểm tra lại thông tin đăng nhập

```json
{
  "success": false,
  "message": "Mật khẩu không đúng"
}
```

**Nguyên nhân**: Mật khẩu sai
**Giải pháp**: Nhập đúng mật khẩu

```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

**Nguyên nhân**: Token sai hoặc hết hạn
**Giải pháp**: Login lại để lấy token mới

---

### **3. Lỗi 403 - Forbidden**

```json
{
  "success": false,
  "message": "Không có quyền truy cập"
}
```

**Nguyên nhân**: Tài khoản không có quyền (role không đủ)
**Giải pháp**: Dùng tài khoản có role phù hợp

---

### **4. Lỗi 404 - Not Found**

```json
{
  "success": false,
  "message": "Không tìm thấy tài sản"
}
```

**Nguyên nhân**: ID không tồn tại
**Giải pháp**: Kiểm tra lại ID

---

### **5. Lỗi 500 - Internal Server Error**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Nguyên nhân**: Lỗi server (database, code...)
**Giải pháp**: Kiểm tra console server, kiểm tra database connection

---

## 🎯 POSTMAN COLLECTION MẪU

### **Collection: Apartment Management API**

```
📁 Auth
  ├─ POST Register
  └─ POST Login

📁 Apartments
  ├─ GET List Apartments
  ├─ GET Apartment Detail
  ├─ POST Create Apartment
  ├─ PUT Update Apartment
  └─ DELETE Delete Apartment

📁 Tài sản
  ├─ GET List Assets
  ├─ GET Asset Detail
  ├─ POST Create Asset
  ├─ PUT Update Asset
  ├─ DELETE Delete Asset
  └─ GET Statistics

📁 Tiện ích
  ├─ GET List Amenities
  ├─ POST Create Amenity
  ├─ POST Assign to Apartment
  └─ DELETE Remove from Apartment
```

---

## 💡 TIPS & TRICKS

### **1. Tự động lưu token sau khi login**

Trong tab **Tests** của request Login, thêm script:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.data.token);
    console.log("Token saved:", jsonData.data.token);
}
```

### **2. Kiểm tra token hết hạn**

Token có thời hạn 7 ngày. Nếu hết hạn, login lại để lấy token mới.

### **3. Test nhiều role**

Tạo nhiều tài khoản với role khác nhau:
- QuanLy (Admin)
- ChuNha (Landlord)
- NguoiThue (Tenant)

### **4. Sử dụng Pre-request Script**

Để tự động thêm timestamp:

```javascript
pm.environment.set("timestamp", new Date().toISOString());
```

---

## 🔍 KIỂM TRA TÀI KHOẢN CÓ SẴN

Chạy script kiểm tra:

```bash
cd DoAnTotNghiep/server
node check-users.js
```

Hoặc query trực tiếp database:

```sql
SELECT ID, TenDangNhap, Email, HoTen, TrangThai 
FROM nguoidung 
WHERE TrangThai = 'Active';
```

---

## 📞 TROUBLESHOOTING

### **Server không chạy?**

```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID <process-id> /F

# Chạy lại server
npm run dev
```

### **Database connection error?**

Kiểm tra file `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/quanlychungcu"
```

Test connection:
```bash
npm run test:db
```

### **Postman không gửi được request?**

1. Tắt SSL verification: Settings → SSL certificate verification → OFF
2. Kiểm tra proxy settings
3. Thử dùng `127.0.0.1` thay vì `localhost`

---

## 📚 TÀI LIỆU THAM KHẢO

- [API Documentation](./API.md)
- [Database Schema](./ERD.md)
- [Tài sản Workflow](./TAISAN_WORKFLOW.md)
- [Server README](../server/README.md)

---

## ✅ CHECKLIST

- [ ] Server đang chạy (http://localhost:5000)
- [ ] Database đã kết nối
- [ ] Có tài khoản để test (hoặc đăng ký mới)
- [ ] Postman đã cài đặt
- [ ] Đã tạo Environment trong Postman
- [ ] Đã test login thành công
- [ ] Đã lưu token
- [ ] Đã test API cần authentication
