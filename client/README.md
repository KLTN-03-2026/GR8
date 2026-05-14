# 🎨 Client - Apartment Management System

Giao diện quản lý chung cư đơn giản với React + Ant Design

## 🚀 Chạy ứng dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📋 Chức năng

### ✅ Đã hoàn thành:

1. **Authentication**
   - Đăng nhập
   - Đăng ký
   - Logout
   - Protected routes

2. **Quản lý Căn hộ**
   - Xem danh sách căn hộ
   - Thêm căn hộ mới
   - Sửa thông tin căn hộ
   - Xóa căn hộ
   - Filter theo trạng thái

3. **Quản lý Tài sản**
   - Xem danh sách tài sản
   - Thêm tài sản mới
   - Sửa thông tin tài sản
   - Xóa tài sản (soft delete)
   - Thống kê tài sản
   - Filter theo loại, tình trạng

4. **Quản lý Tiện ích**
   - Xem danh sách tiện ích
   - Thêm tiện ích mới
   - Sửa tiện ích
   - Xóa tiện ích

## 🎯 Cách sử dụng

### Đăng nhập
1. Mở `http://localhost:3000/login`
2. Nhập email/username và password
3. Hoặc đăng ký tài khoản mới

### Test với tài khoản mẫu
Nếu database đã có dữ liệu:
```
Email: admin@example.com
Password: 123456
```

### Điều hướng
- **Trang chủ**: `/` - Dashboard với thống kê tổng quan
- **Căn hộ**: `/apartments` - Quản lý căn hộ
- **Tài sản**: `/assets` - Quản lý tài sản
- **Tiện ích**: `/amenities` - Quản lý tiện ích

## 🛠️ Công nghệ sử dụng

- **React 19** - UI Framework
- **React Router v6** - Routing
- **Ant Design** - UI Components
- **Axios** - HTTP Client
- **dayjs** - Date handling

## 📁 Cấu trúc thư mục

```
src/
├── api/
│   └── axios.js          # Axios config + interceptors
├── components/
│   └── Layout.jsx        # Layout chính với header, menu
├── context/
│   └── AuthContext.jsx   # Authentication context
├── pages/
│   ├── Home.jsx          # Trang chủ
│   ├── Login.jsx         # Đăng nhập/Đăng ký
│   ├── Apartments.jsx    # Quản lý căn hộ
│   ├── Assets.jsx        # Quản lý tài sản
│   └── Amenities.jsx     # Quản lý tiện ích
└── App.jsx               # Main app với routes
```

## 🔧 Cấu hình

### API Base URL
File: `src/api/axios.js`
```javascript
baseURL: "http://localhost:5000/api"
```

### Token Storage
- Token được lưu trong `localStorage`
- Tự động thêm vào header của mỗi request
- Tự động redirect về login khi token hết hạn (401)

## 🎨 Giao diện

### Đặc điểm:
- ✅ Responsive design
- ✅ Ant Design components
- ✅ Vietnamese locale
- ✅ Clean & simple UI
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages

### Màu sắc:
- Primary: `#1890ff` (Blue)
- Success: `#52c41a` (Green)
- Error: `#ff4d4f` (Red)
- Warning: `#faad14` (Orange)

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Hoặc đổi port
set PORT=3001 && npm start
```

### Không kết nối được API
1. Kiểm tra server đang chạy: `http://localhost:5000`
2. Kiểm tra CORS đã enable
3. Xem console browser có lỗi gì

### Token hết hạn
- Đăng nhập lại để lấy token mới
- Token có thời hạn 7 ngày

## 📝 TODO

- [ ] Thêm pagination cho danh sách
- [ ] Thêm search/filter nâng cao
- [ ] Upload hình ảnh
- [ ] Export Excel
- [ ] Dark mode
- [ ] Responsive mobile tốt hơn
- [ ] Unit tests
- [ ] E2E tests

## 🚀 Build Production

```bash
npm run build
```

Output sẽ ở thư mục `build/`

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
