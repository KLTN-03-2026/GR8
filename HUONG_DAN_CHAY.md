# 🏢 Hướng Dẫn Chạy Hệ Thống Quản Lý Chung Cư

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v16 trở lên ([Download](https://nodejs.org/))
- **MySQL**: v8 trở lên ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git**: ([Download](https://git-scm.com/downloads))

---

## 🚀 Cài Đặt Lần Đầu

### Bước 1: Clone Dự Án
```bash
git clone <link-repo>
cd DoAnTotNghiepđ
```

### Bước 2: Cấu Hình Database

Tạo file `.env` trong folder `server`:

```bash
cd server
```

Tạo file `.env` với nội dung (hoặc copy từ `.env.example`):
```env
# Database Configuration
DATABASE_URL="mysql://root:your_password@localhost:3306/apartment_management"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
BCRYPT_ROUNDS=10

# Legacy JWT (for backward compatibility)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Secret
SESSION_SECRET=your_session_secret

# Email (Gmail) - dùng App Password
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

**⚠️ Lưu ý:** Thay `your_password` bằng password MySQL của bạn!

### Bước 3: Cài Đặt Dependencies

```bash
# Cài đặt backend (trong folder server)
npm install

# Cài đặt frontend (mở terminal mới)
cd ../client
npm install
```

### Bước 4: Setup Database Tự Động ⚡

```bash
# Quay lại folder server
cd ../server

# Chạy lệnh reset & setup (tạo DB mới + migrate + seed)
npm run reset
```

**Lệnh này sẽ:**
1. ✅ Tự động xóa database cũ (nếu có)
2. ✅ Tạo database mới
3. ✅ Xóa migrations cũ
4. ✅ Tạo migration mới từ schema
5. ✅ Seed data mẫu (roles, users, apartments, contracts, invoices...)

**⚠️ CẢNH BÁO:** Lệnh này sẽ **XÓA HẾT DATA** cũ. Chỉ dùng khi setup lần đầu!

### Bước 5: Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend chạy tại: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
✅ Frontend chạy tại: http://localhost:3000

---

## 🔄 Cập Nhật Code Từ Git (Cho Người Khác Pull)

### Trường hợp 1: Chỉ có thay đổi code (không đổi database)

```bash
# Pull code mới
git pull

# Cài đặt dependencies mới (nếu có)
cd server
npm install

cd ../client
npm install

# Chạy lại app như bình thường
```

### Trường hợp 2: Có thay đổi schema database (thêm bảng, cột mới...)

```bash
# Pull code mới
git pull

# Cài đặt dependencies
cd server
npm install

# Áp dụng migrations mới (GIỮ NGUYÊN data cũ)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Chạy lại app
npm run dev
```

### Trường hợp 3: Muốn reset toàn bộ database (xóa hết, tạo lại từ đầu)

```bash
# Pull code mới
git pull

# Cài đặt dependencies
cd server
npm install

# Reset toàn bộ database + seed lại data mẫu
npm run reset

# Chạy lại app
npm run dev
```

---

## 👥 Tài Khoản Test

Sau khi seed, bạn có thể đăng nhập bằng các tài khoản sau (password: `123456`):

| Vai trò | Email | Mô tả |
|---------|-------|-------|
| 👨‍💼 Quản lý | `admin@example.com` | Quản lý toàn bộ hệ thống |
| 💰 Kế toán | `ketoan@example.com` | Quản lý tài chính, hóa đơn |
| 🔧 Kỹ thuật | `kythuat@example.com` | Ghi chỉ số, sửa chữa |
| 🏠 Chủ nhà | `chunha@example.com` | Quản lý căn hộ của mình |
| 👤 Người thuê | `nguoithue@example.com` | Cư dân thuê căn hộ |

---

## 🧪 Kiểm Tra Chức Năng

### 1. Đăng nhập với tài khoản tenant
- Đăng nhập với `nguoithue@example.com` / `123456`
- Sau khi đăng nhập, bạn sẽ ở lại trang chủ (/) thay vì bị redirect về /dashboard

### 2. Kiểm tra trang chủ
Trang chủ sẽ hiển thị:
- **Hero section** với thanh tìm kiếm căn hộ
- **Quick Actions section** (chỉ hiện khi đã đăng nhập):
  - Thống kê: Hợp đồng đang thuê, Hóa đơn chưa thanh toán, Yêu cầu đang xử lý
  - 4 nút chức năng nhanh:
    - 🏠 Căn hộ của tôi
    - 💰 Hóa đơn
    - 📋 Yêu cầu thuê
    - 💬 Liên hệ quản lý
- **Danh sách căn hộ nổi bật** (6 căn hộ trống)
- **Thông tin dịch vụ**
- **Footer**

### 3. Kiểm tra "Căn hộ của tôi" (/my-apartment)
Trang này gộp tất cả chức năng:
- Tab **Tổng quan**: Thông tin căn hộ + hợp đồng
- Tab **Hợp đồng**: Danh sách hợp đồng
- Tab **Hóa đơn**: Danh sách hóa đơn
- Tab **Tài sản**: Tài sản trong căn hộ
- Tab **Dịch vụ**: Dịch vụ đang sử dụng
- Tab **Báo cáo sự cố**: Danh sách sự cố
- Tab **Thành viên**: Quản lý thành viên trong căn hộ
- Tab **Vị trí**: Bản đồ hiển thị vị trí tòa nhà (sử dụng OpenStreetMap)

### 4. Kiểm tra bản đồ
- Vào tab "Vị trí" trong "Căn hộ của tôi"
- Bản đồ sẽ hiển thị vị trí tòa nhà với marker màu indigo
- Click vào marker để xem popup với thông tin tòa nhà
- Có link "Xem trên Google Maps" để mở Google Maps

### 5. Kiểm tra menu
- Menu hamburger ở header chỉ hiển thị các chức năng của tenant:
  - Dashboard
  - Tìm căn hộ
  - Yêu cầu thuê
  - Hợp đồng
  - Hóa đơn
  - Chat
  - Tài sản căn hộ
  - Dịch vụ
  - Hồ sơ

---

## 🛠️ Các Lệnh Hữu Ích

### Backend (trong folder `server`)

```bash
# Chạy development server
npm run dev

# Chạy production
npm start

# Setup lần đầu (reset toàn bộ + tạo mới)
npm run reset

# Áp dụng migrations mới (không xóa data)
npx prisma migrate deploy

# Tạo migration mới (khi bạn thay đổi schema.prisma)
npx prisma migrate dev --name ten_migration

# Generate Prisma Client (sau khi pull code mới)
npx prisma generate

# Mở Prisma Studio (GUI quản lý database)
npm run prisma:studio

# Chỉ seed data (không xóa data cũ) - KHÔNG KHUYẾN NGHỊ
npm run seed
```

### Frontend (trong folder `client`)

```bash
# Chạy development
npm start

# Build production
npm run build

# Test
npm test
```

---

## 📁 Cấu Trúc Dự Án

```
DoAnTotNghiep/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.js        # Data mẫu
│   │   └── migrations/    # Lịch sử thay đổi DB
│   ├── src/
│   │   ├── modules/       # Các module chức năng
│   │   ├── middleware/    # Middleware (auth, validation...)
│   │   └── index.js       # Entry point
│   ├── scripts/
│   │   └── setup-db.js    # Script tự động tạo database
│   └── .env               # Cấu hình (cần tạo)
│
└── client/                # Frontend (React)
    ├── src/
    │   ├── pages/         # Các trang
    │   ├── components/    # Components
    │   ├── context/       # Context (Auth...)
    │   └── api/           # API calls
    └── .env               # Cấu hình (nếu cần)
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot connect to MySQL"
```bash
# Kiểm tra MySQL đã chạy chưa
# Windows:
services.msc  # Tìm MySQL và Start

# Mac:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### Lỗi: "Database does not exist"
```bash
# Chạy lại setup
cd server
npm run reset
```

### Lỗi: "Port 5000 already in use"
```bash
# Đổi port trong file .env
PORT=5001
```

### Lỗi: "Prisma Client not generated"
```bash
cd server
npx prisma generate
```

### Lỗi: "Migration failed" hoặc "Schema out of sync"
```bash
# Cách 1: Reset toàn bộ (mất data)
cd server
npm run reset

# Cách 2: Chỉ generate lại client
npx prisma generate
npx prisma migrate deploy
```

---

## 📝 Workflow Làm Việc Nhóm

### Khi bạn thay đổi database schema:

1. **Sửa file `schema.prisma`**
2. **Tạo migration mới:**
   ```bash
   cd server
   npx prisma migrate dev --name ten_thay_doi
   ```
3. **Commit cả file schema và folder migrations:**
   ```bash
   git add prisma/schema.prisma prisma/migrations/
   git commit -m "feat: thêm bảng XYZ"
   git push
   ```

### Khi người khác pull code có thay đổi database:

1. **Pull code:**
   ```bash
   git pull
   ```
2. **Áp dụng migrations mới:**
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma generate
   ```
3. **Chạy lại app:**
   ```bash
   npm run dev
   ```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. ✅ Kiểm tra file `.env` đã đúng chưa
2. ✅ Kiểm tra MySQL đã chạy chưa
3. ✅ Xem log lỗi trong terminal
4. ✅ Thử chạy `npm run reset` để reset toàn bộ
5. ✅ Liên hệ: [email/contact của bạn]

---

## 🆕 Tính Năng Mới: Hệ Thống Lịch Trực & Phân Công Sự Cố

### 📅 Lịch Trực Kỹ Thuật Viên

**Mô tả:** Quản lý lịch trực theo ngày và ca cho kỹ thuật viên. Hệ thống tự động phân công sự cố cho người đang trực.

**Các ca trực:**
- 🌅 **Ca sáng**: 6:00 - 12:00
- ☀️ **Ca chiều**: 12:00 - 18:00
- 🌙 **Ca tối**: 18:00 - 24:00
- 📆 **Cả ngày**: 6:00 - 18:00

**Tính năng:**
- ✅ Xem lịch trực theo tháng (calendar view)
- ✅ Thêm lịch trực đơn lẻ
- ✅ Tạo hàng loạt theo khoảng thời gian + chọn ngày trong tuần
- ✅ Phân công sự cố tự động ưu tiên người đang trực
- ✅ Kiểm tra trùng lịch tự động

**Truy cập:**
- Menu → **"Lịch Trực"** (Quản lý & Chủ nhà)
- URL: http://localhost:3000/duty-schedule

**Cách sử dụng:**

1. **Tạo lịch trực đơn lẻ:**
   - Click "Thêm lịch trực"
   - Chọn kỹ thuật viên, ngày, ca trực
   - Lưu

2. **Tạo lịch trực hàng loạt:**
   - Click "Tạo hàng loạt"
   - Chọn kỹ thuật viên
   - Chọn khoảng thời gian (từ ngày → đến ngày)
   - Chọn ca trực
   - Chọn các ngày trong tuần (VD: T2-T6)
   - Hệ thống tự động tạo lịch cho tất cả ngày phù hợp

3. **Phân công sự cố tự động:**
   - Vào "Phân Công Sự Cố"
   - Click "Tự động" trên sự cố chưa phân công
   - Hệ thống ưu tiên chọn người đang trực hôm nay
   - Nếu không có người trực → chọn người có ít việc nhất

**Quyền truy cập:**
- **Quản lý & Chủ nhà**: Toàn quyền quản lý lịch trực
- **Kỹ thuật viên**: Xem lịch trực của mình
- **Cư dân**: Không có quyền

---

## 🔒 Lưu Ý Bảo Mật

- ⚠️ Đổi `JWT_SECRET` trong production
- ⚠️ Backup database thường xuyên
- ⚠️ **KHÔNG** commit file `.env` lên Git
- ⚠️ Đọc file `CHANGELOG.md` để biết các thay đổi mới

---

## 📌 Tóm Tắt Nhanh

| Tình huống | Lệnh chạy |
|------------|-----------|
| Cài đặt lần đầu | `npm install` → `npm run reset` |
| Pull code không đổi DB | `git pull` → `npm install` |
| Pull code có đổi DB | `git pull` → `npm install` → `npx prisma migrate deploy` |
| Muốn reset DB hoàn toàn | `npm run reset` |
| Chạy app | `npm run dev` (backend) + `npm start` (frontend) |

---

