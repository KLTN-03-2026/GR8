# GR8 - Hệ thống quản lý chung cư

Đồ án tốt nghiệp về hệ thống quản lý chung cư với frontend React, backend Node.js/Express và database MySQL.

---

## Yêu cầu

- Node.js v18+
- MySQL 8+
- Git

---

## Cài đặt

1. Clone project:
   ```bash
   git clone https://github.com/KLTN-03-2026/GR8.git
   cd DoAnTotNghiep
   ```
2. Cài dependencies:
   - Backend:
     ```bash
     cd server
     npm install
     ```
   - Frontend:
     ```bash
     cd client
     npm install
     ```
3. Cấu hình backend:
   - File `server/.env` đã có sẵn.
   - Nếu cần thay đổi cổng, chỉnh `PORT` trong `server/.env`.

---

## Chạy ứng dụng

Mở hai terminal:

- Backend:
  ```bash
  cd server
  npm run dev
  ```
  Backend mặc định ở `http://localhost:5000`

- Frontend:
  ```bash
  cd client
  npm start
  ```
  Frontend mặc định ở `http://localhost:3000`

---

## Tài khoản test

Mật khẩu chung: `123456`

| Vai trò | Email | Chức năng |
|---------|-------|-----------|
| Quản lý | quanly@gmail.com | Quản lý hệ thống |
| Kế toán | ketoan@gmail.com | Quản lý hóa đơn |
| Kỹ thuật | staff1@gmail.com | Ghi chỉ số và xử lý sự cố |
| Chủ nhà | owner1@gmail.com | Quản lý căn hộ |
| Người thuê | tenant1@gmail.com | Xem hóa đơn và báo sự cố |

---

## Công nghệ

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend | Node.js, Express, Prisma |
| Frontend | React, Tailwind CSS |
| Database | MySQL |
| AI Chatbot | Google Gemini |
| Email | Resend |
| Thanh toán | VNPay |
| Triển khai | Vercel (FE), Render (BE) |

---

## Tính năng

- Quản lý căn hộ và hợp đồng
- Quản lý người dùng theo vai trò
- Hóa đơn điện nước và thanh toán VNPay
- Báo cáo và xử lý sự cố kỹ thuật
- Chat nội bộ giữa người thuê và quản lý
- Chatbot AI hỗ trợ
- Đăng nhập Google OAuth
- Xác thực OTP qua email

---

## Lỗi phổ biến

- `Cannot connect to database`: kiểm tra internet, database đang chạy trên Railway
- `Port 5000 already in use`: đổi `PORT` trong `server/.env`
- `Module not found`: chạy lại `npm install` trong `server` và `client`
