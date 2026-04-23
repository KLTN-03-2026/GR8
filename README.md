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
## User story
# 🏢 Apartment Rental Management System - Use Cases

## 🎭 Actors

- Guest (Khách vãng lai)
- Tenant (Người thuê nhà)
- Manager (Quản lý)
- Owner (Chủ nhà)
- Technician (Nhân viên kỹ thuật)
- Accountant (Kế toán)

---

# 🔐 AUTHENTICATION & PROFILE

## US01 - Register

**Actor:** Guest  
**Description:** Register new account

### Acceptance Criteria:

- Enter name, email, phone
- Enter valid password
- Verify via OTP (email/phone)
- Complete registration & login

### Constraints:

- Email/Phone must be unique

---

## US05 - Login

**Actor:** Tenant

### Acceptance Criteria:

- Input email/phone + password
- System validates
- Login success or error

---

## US06 - Update Profile

**Actor:** Tenant

### Acceptance Criteria:

- View profile info
- Update info (name, phone, email, password...)
- Validate input
- Save changes

---

# 🏠 APARTMENT & SEARCH

## US02 - Search Apartment

**Actor:** Guest, Tenant

### Acceptance Criteria:

- View apartment list
- Search by keyword
- Filter by:
  - Price
  - Area
  - Location
  - Status
- View details:
  - Images
  - Description
  - Price
  - Amenities
- AI chatbot suggestion

### Constraints:

- Only show available apartments

---

## US03 - Contact

**Actor:** Guest, Tenant

### Acceptance Criteria:

- Click contact button
- View contact info
- Redirect to Zalo
- Call or message directly

---

# 🤖 AI SYSTEM

## US04 - Chatbot AI

**Actor:** Guest, Tenant

### Acceptance Criteria:

- Natural language query
- Answer about apartments
- Suggest apartments
- Multi-turn conversation
- Navigate user to relevant pages

---

# 📄 RENTING & CONTRACT

## US07 - Rent Apartment

**Actor:** Tenant

### Flow:

1. Select apartment
2. Enter personal info
3. Accept terms
4. Send request
5. Wait approval
6. Sign contract
7. Pay deposit

---

## US09 - Contract

**Actor:** Tenant

### Acceptance Criteria:

- View contract list
- View details
- Request termination

---

## US11 - Transfer Contract

**Actor:** Tenant

### Acceptance Criteria:

- Send transfer request
- Input new tenant info
- Post transfer listing
- Wait approval
- Auto create new contract

---

# 💰 PAYMENT

## US08 - Pay Bills

**Actor:** Tenant

### Acceptance Criteria:

- View invoices
- Select payment method
- Pay successfully
- Receive notification

---

## US12 - Payment History

**Actor:** Tenant

### Acceptance Criteria:

- View transactions
- View details
- Export invoice

---

# 🛠️ SERVICES & INCIDENTS

## US10 - Report Issue / Service

**Actor:** Tenant

### Acceptance Criteria:

- Create ticket (text + media)
- Track status
- Register services
- Cancel/edit service

---

## US17 - Manage Issues

**Actor:** Manager

### Acceptance Criteria:

- View tickets
- Assign technician
- Track progress

---

## US22 - Handle Issues

**Actor:** Technician

### Acceptance Criteria:

- View assigned tickets
- Update progress

---

## US23 - Report Work

**Actor:** Technician

### Acceptance Criteria:

- Submit repair report
- Upload media
- Update electricity index

---

# 🧑‍💼 MANAGEMENT

## US13 - Manage Tenants

**Actor:** Manager

### Acceptance Criteria:

- View tenant list
- Search & filter

---

## US14 - Handle Rent Requests

**Actor:** Manager

### Acceptance Criteria:

- Review requests
- Validate info
- Forward to owner

---

## US15 - Manage Contracts

**Actor:** Manager

### Acceptance Criteria:

- Create contract
- Fill details
- Prepare for signing

---

## US16 - Manage Payments

**Actor:** Manager

### Acceptance Criteria:

- View payments
- Send reminders
- Confirm transactions

---

## US18 - Manage Services

**Actor:** Manager

### Acceptance Criteria:

- Add / edit / delete services

---

## US19 - Chat System

**Actor:** Manager

### Acceptance Criteria:

- Chat with tenant
- View history
- Real-time notification

---

## US20 - Notifications

**Actor:** Manager

### Acceptance Criteria:

- Create announcements
- Send to all tenants

---

# 🏢 OWNER

## US21 - Manage Apartments

**Actor:** Owner

### Acceptance Criteria:

- Add / edit / delete apartments
- Update status

---

## US27 - Approve Rent Request

**Actor:** Owner

### Acceptance Criteria:

- Approve / reject request

---

## US28 - Reports & Statistics

**Actor:** Owner

### Acceptance Criteria:

- View revenue
- View occupancy
- Export reports

---

## US29 - Manage Staff Accounts

**Actor:** Owner

### Acceptance Criteria:

- Create staff accounts
- Assign roles
- Disable accounts

---

## US30 - Approve Transfer

**Actor:** Owner

### Acceptance Criteria:

- Approve / reject transfer
- Auto contract update

---

# 💼 ACCOUNTING

## US24 - Confirm Payments

**Actor:** Accountant

### Acceptance Criteria:

- Verify transactions
- Confirm payments

---

## US25 - Financial Reports

**Actor:** Accountant

### Acceptance Criteria:

- View revenue reports
- Export Excel/PDF

---

## US26 - Invoice Management

**Actor:** Accountant

### Acceptance Criteria:

- Create invoice
- Edit / delete (if unpaid)
- Export invoice
