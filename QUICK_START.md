# 🚀 QUICK START - Chạy toàn bộ hệ thống

## ⚡ 3 BƯỚC ĐƠN GIẢN

### **Bước 1: Chạy Server (Backend)**

```bash
# Terminal 1
cd DoAnTotNghiep/server
npm install
npm run dev
```

✅ Server chạy tại: `http://localhost:5000`

---

### **Bước 2: Chạy Client (Frontend)**

```bash
# Terminal 2 (mở terminal mới)
cd DoAnTotNghiep/client
npm install
npm start
```

✅ Client chạy tại: `http://localhost:3000`

---

### **Bước 3: Đăng nhập và Test**

1. Mở trình duyệt: `http://localhost:3000`
2. Click tab **"Đăng ký"**
3. Điền thông tin:
   ```
   Tên đăng nhập: admin
   Họ và tên: Admin User
   Email: admin@example.com
   Mật khẩu: 123456
   ```
4. Click **"Đăng ký"**
5. Chuyển sang tab **"Đăng nhập"**
6. Đăng nhập với tài khoản vừa tạo

---

## 🎯 TEST CÁC CHỨC NĂNG

### 1. **Quản lý Căn hộ**
- Click menu **"Căn hộ"**
- Click **"Thêm căn hộ"**
- Điền thông tin và lưu
- Thử sửa, xóa căn hộ

### 2. **Quản lý Tài sản**
- Click menu **"Tài sản"**
- Xem thống kê ở trên cùng
- Click **"Thêm tài sản"**
- Điền thông tin và lưu

### 3. **Quản lý Tiện ích**
- Click menu **"Tiện ích"**
- Thêm các tiện ích: Điều hòa, Tủ lạnh, Wifi...

---

## 📊 KIỂM TRA HỆ THỐNG

### ✅ Server hoạt động:
```bash
curl http://localhost:5000
# Kết quả: "API is running..."
```

### ✅ API hoạt động:
```bash
curl http://localhost:5000/api/tienich
# Kết quả: JSON danh sách tiện ích
```

### ✅ Client hoạt động:
- Mở `http://localhost:3000`
- Thấy trang đăng nhập

---

## 🐛 XỬ LÝ LỖI

### **Server không chạy?**

**Lỗi: Port 5000 đã được sử dụng**
```bash
# Tìm process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process-id> /F

# Hoặc đổi port trong .env
PORT=5001
```

**Lỗi: Database connection failed**
```bash
# Kiểm tra MySQL đang chạy
# Kiểm tra thông tin trong .env
DATABASE_URL="mysql://root:password@localhost:3306/quanlychungcu"
```

---

### **Client không chạy?**

**Lỗi: Port 3000 đã được sử dụng**
```bash
# Kill process
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Hoặc chọn port khác khi được hỏi
```

**Lỗi: Module not found**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 TÀI KHOẢN MẪU

Nếu database đã có dữ liệu:

```
Email: admin@example.com
Password: 123456
Role: QuanLy (Admin)
```

---

## 🎨 GIAO DIỆN

### Trang chủ
- Dashboard với thống kê
- Số lượng căn hộ, tài sản, tiện ích

### Menu chính
- 🏠 Trang chủ
- 🏢 Căn hộ
- ✨ Tiện ích  
- 🔧 Tài sản

### Chức năng
- ✅ CRUD đầy đủ (Create, Read, Update, Delete)
- ✅ Filter, search
- ✅ Thống kê
- ✅ Responsive
- ✅ Loading states
- ✅ Error handling

---

## 📚 TÀI LIỆU CHI TIẾT

- **Server**: `server/README.md`
- **Client**: `client/README.md`
- **API**: `docs/API.md`
- **Postman**: `docs/POSTMAN_GUIDE.md`
- **Database**: `docs/ERD.md`

---

## ✅ CHECKLIST

- [ ] MySQL đang chạy
- [ ] Database `quanlychungcu` đã tạo
- [ ] Server chạy thành công (port 5000)
- [ ] Client chạy thành công (port 3000)
- [ ] Đã đăng ký/đăng nhập thành công
- [ ] Test thêm căn hộ thành công
- [ ] Test thêm tài sản thành công
- [ ] Test thêm tiện ích thành công

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có thể:
- ✅ Quản lý căn hộ
- ✅ Quản lý tài sản
- ✅ Quản lý tiện ích
- ✅ Xem thống kê
- ✅ Đăng nhập/Đăng ký

**Chúc bạn test vui vẻ! 🚀**
