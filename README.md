# Hệ Thống Quản Lý Căn Hộ Cho Thuê

Đồ án tốt nghiệp — Hệ thống quản lý căn hộ cho thuê tích hợp Chatbot AI.

## Tech Stack

**Backend:** Node.js + Express + Prisma ORM + MySQL (Railway)  
**Frontend:** React + Tailwind CSS + Axios  
**Database:** MySQL hosted trên Railway  
**AI:** OpenAI ChatGPT API  
**Thanh toán:** VNPay / MoMo (dự kiến)

---

## Cấu trúc dự án

```
DoAnTotNghiep/
├── server/       # Backend Node.js + Express
├── client/       # Frontend React
├── database/     # Schema SQL
├── docs/         # Tài liệu API, ERD
└── README.md
```

---

## Cài đặt & Chạy

### Backend
```bash
cd server
npm install
cp .env.example .env
# Điền DATABASE_URL từ Railway vào .env
npx prisma generate
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm start
```

---

## Tiến độ Backend

### Đã hoàn thiện

| Module | Endpoint | Mô tả |
|--------|----------|-------|
| **auth** | `POST /api/auth/register` | Đăng ký tài khoản |
| **auth** | `POST /api/auth/login` | Đăng nhập, trả JWT token |
| **apartment** | `GET /api/apartments` | Danh sách căn hộ (filter: TrangThai, giá, search) |
| **apartment** | `GET /api/apartments/:id` | Chi tiết căn hộ |
| **apartment** | `POST /api/apartments` | Tạo căn hộ (yêu cầu token + role ChuNha/QuanLy) |
| **user** | `GET /api/users` | Danh sách người dùng |
| **user** | `POST /api/users` | Tạo người dùng |

### Chưa implement

| Module | Chức năng |
|--------|-----------|
| **chatbot** | Chatbot AI tư vấn (OpenAI API) |
| **hoadon** | Quản lý hóa đơn hàng tháng |
| **hopdong** | Quản lý hợp đồng thuê |
| **yeucausuco** | Ticket sự cố, phân công kỹ thuật |

### Đã tạo cấu trúc

| Module | Chức năng |
|--------|-----------|
| **toanha** | CRUD tòa nhà |
| **yeucauthue** | Gửi & duyệt yêu cầu thuê |
| **chuyennhuong** | Yêu cầu & duyệt chuyển nhượng hợp đồng |
| **thanhtoan** | Thanh toán hóa đơn, lịch sử giao dịch |
| **dichvu** | Đăng ký & quản lý dịch vụ (giặt đồ, dọn phòng...) |
| **thongbao** | Gửi thông báo chung/riêng cho cư dân |
| **chisodiennuoc** | Nhập chỉ số điện nước → tạo hóa đơn |
| **tinnhanhethong** | Chat nội bộ giữa quản lý và người thuê |
| **baocao** | Báo cáo doanh thu, thống kê |
| **taisan** | Quản lý tài sản tòa nhà / căn hộ |
| **theguixe** | Quản lý thẻ gửi xe |
| **tienich** | Quản lý tiện ích căn hộ |
| **refreshtoken** | Gia hạn token, logout an toàn |

---

## Phân quyền

| Vai trò | Mô tả |
|---------|-------|
| `KhachVangLai` | Xem căn hộ, dùng chatbot, đăng ký |
| `NguoiThue` | Thuê nhà, thanh toán, xem hợp đồng, báo sự cố |
| `QuanLy` | Quản lý toàn bộ hệ thống, duyệt yêu cầu |
| `NhanVienKyThuat` | Xử lý ticket sự cố |
| `KeToan` | Quản lý hóa đơn, thanh toán, báo cáo |
| `ChuNha` | Duyệt yêu cầu thuê, xem báo cáo, quản lý căn hộ |

---

## Kết nối Database

Database MySQL được host trên **Railway**.  
Cấu hình trong `server/.env`:
```
DATABASE_URL=mysql://...@maglev.proxy.rlwy.net:46023/railway
```

---

## Tài liệu

- [API Documentation](docs/API.md)
- [ERD](docs/ERD.md)
- [Database Schema](database/schema.sql)
