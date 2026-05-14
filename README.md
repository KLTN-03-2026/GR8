# 🏢 Hệ Thống Quản Lý Chung Cư — SmartBuilding

Đồ án tốt nghiệp — Hệ thống quản lý chung cư toàn diện với Chatbot AI.

---

## ⚙️ Yêu Cầu Cài Đặt Trước

- [Node.js v18+](https://nodejs.org/)
- [MySQL 8+](https://dev.mysql.com/downloads/)
- Gitm

---

## 🚀 Hướng Dẫn Chạy Local (Lần Đầu)

### Bước 1 — Clone project

```bash
git clone https://github.com/ChungChien04/DoAnTotNghiep.git
cd DoAnTotNghiep
```

### Bước 2 — Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend (mở terminal mới)
cd client
npm install
```

### Bước 3 — Cấu hình Backend

File `server/.env` đã có sẵn, **không cần chỉnh sửa gì** khi chạy local với database Railway.

> Database đang dùng MySQL trên Railway (cloud), không cần cài MySQL local.

### Bước 4 — Chạy ứng dụng

Mở **2 terminal** chạy song song:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
> Backend chạy tại: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```
> Frontend tự mở tại: http://localhost:3000

---

## 🎯 Tài Khoản Test

Mật khẩu tất cả tài khoản: **`123456`**

| Vai trò | Email | Chức năng |
|---------|-------|-----------|
| 👨‍💼 Quản lý | quanly@gmail.com | Quản lý toàn bộ hệ thống |
| 💰 Kế toán | ketoan@gmail.com | Quản lý tài chính, hóa đơn |
| 🔧 Kỹ thuật | staff1@gmail.com | Ghi chỉ số, xử lý sự cố |
| 🏠 Chủ nhà | owner1@gmail.com | Quản lý căn hộ của mình |
| 👤 Người thuê | tenant1@gmail.com | Xem hóa đơn, báo sự cố |

---

## 🌐 Demo Online (Vercel)

> https://do-an-tot-nghiep-tan.vercel.app

---

## 💻 Tech Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend | Node.js + Express + Prisma ORM |
| Frontend | React + Tailwind CSS |
| Database | MySQL (Railway) |
| AI Chatbot | Google Gemini API |
| Email OTP | Resend |
| Thanh toán | VNPay |
| Deploy | Vercel (FE) + Render (BE) |

---

## ✨ Tính Năng Chính

- ✅ Quản lý căn hộ, tòa nhà, hợp đồng
- ✅ Quản lý người dùng theo vai trò
- ✅ Hóa đơn điện nước, thanh toán VNPay
- ✅ Báo cáo & xử lý sự cố kỹ thuật
- ✅ Chat trực tiếp người thuê ↔ quản lý
- ✅ Chatbot AI hỗ trợ 24/7 (Gemini)
- ✅ Đăng nhập Google OAuth
- ✅ Đăng ký xác thực OTP qua email
- ✅ Dashboard theo từng vai trò

---

## 🐛 Xử Lý Lỗi Thường Gặp

**Lỗi: `Cannot connect to database`**
> Kiểm tra kết nối internet — database đang trên cloud Railway

**Lỗi: `Port 5000 already in use`**
```bash
# Đổi PORT trong server/.env
PORT=5001
```

**Lỗi: `Module not found`**
```bash
cd server && npm install
cd client && npm install
```
