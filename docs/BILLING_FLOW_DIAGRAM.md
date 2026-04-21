# 📊 Sơ Đồ Quy Trình Thanh Toán 3 Bước

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APARTMENT BILLING WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: NHÂN VIÊN KỸ THUẬT GHI CHỈ SỐ                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  👷 Nhân Viên Kỹ Thuật                                                       │
│       │                                                                      │
│       ├─► Đến căn hộ A101                                                   │
│       │                                                                      │
│       ├─► 📸 Chụp ảnh đồng hồ điện                                          │
│       │   └─► electric-meter-001.jpg                                        │
│       │                                                                      │
│       ├─► 📸 Chụp ảnh đồng hồ nước                                          │
│       │   └─► water-meter-001.jpg                                           │
│       │                                                                      │
│       └─► 📤 POST /api/chisodiennuoc                                        │
│           ├─ CanHoID: 1                                                     │
│           ├─ ThangNam: "2024-04"                                            │
│           ├─ ChiSoDienMoi: 1250.5                                           │
│           ├─ ChiSoNuocMoi: 85.3                                             │
│           ├─ AnhDongHoDien: "https://..."                                   │
│           └─ AnhDongHoNuoc: "https://..."                                   │
│                                                                              │
│  💾 Database                                                                 │
│       │                                                                      │
│       ├─► Tự động lấy chỉ số cũ từ tháng trước                              │
│       │   ├─ ChiSoDienCu: 1170.0                                            │
│       │   └─ ChiSoNuocCu: 70.0                                              │
│       │                                                                      │
│       └─► Lưu với trạng thái: ChoDuyetKeToan ⏳                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 2: KẾ TOÁN XÁC NHẬN & PHÁT HÀNH HÓA ĐƠN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  👔 Kế Toán                                                                  │
│       │                                                                      │
│       ├─► 📋 GET /api/chisodiennuoc/pending                                 │
│       │   └─► Xem danh sách chỉ số chờ duyệt                                │
│       │                                                                      │
│       ├─► 🔍 Xem ảnh đồng hồ điện + nước                                    │
│       │   ├─ Kiểm tra chỉ số có chính xác không                             │
│       │   └─ Có thể sửa nếu kỹ thuật đọc sai                                │
│       │                                                                      │
│       └─► ✅ POST /api/chisodiennuoc/:id/confirm                            │
│           ├─ ChiSoDienChinhThuc: 1250.5                                     │
│           ├─ ChiSoNuocChinhThuc: 85.3                                       │
│           └─ GhiChuKeToan: "Đã kiểm tra, OK"                                │
│                                                                              │
│  🤖 Hệ Thống Tự Động                                                         │
│       │                                                                      │
│       ├─► 🧮 Tính toán                                                       │
│       │   ├─ Số điện = 1250.5 - 1170.0 = 80.5 kWh                           │
│       │   ├─ Số nước = 85.3 - 70.0 = 15.3 m³                                │
│       │   │                                                                  │
│       │   ├─ Tiền điện = 80.5 × 4,000 = 322,000đ                            │
│       │   ├─ Tiền nước = 15.3 × 10,000 = 153,000đ                           │
│       │   ├─ Tiền thuê = 5,000,000đ (từ hợp đồng)                           │
│       │   ├─ Phí chung = 200,000đ                                           │
│       │   ├─ Phí vệ sinh = 50,000đ                                          │
│       │   └─ TỔNG = 5,725,000đ                                              │
│       │                                                                      │
│       ├─► 📄 Tạo hóa đơn                                                     │
│       │   ├─ MaHoaDon: "HD202404001"                                        │
│       │   ├─ NgayLap: 2024-04-21                                            │
│       │   ├─ NgayDenHan: 2024-05-06 (15 ngày)                               │
│       │   ├─ TongTien: 5,725,000đ                                           │
│       │   └─ TrangThai: ChuaTT 💰                                           │
│       │                                                                      │
│       ├─► 📝 Tạo chi tiết hóa đơn (5 dòng)                                  │
│       │   ├─ TienThue: 5,000,000đ                                           │
│       │   ├─ Dien: 322,000đ                                                 │
│       │   ├─ Nuoc: 153,000đ                                                 │
│       │   ├─ DichVu (Phí chung): 200,000đ                                   │
│       │   └─ DichVu (Phí vệ sinh): 50,000đ                                  │
│       │                                                                      │
│       ├─► 📱 Generate VietQR                                                 │
│       │   ├─ Bank: VCB (Vietcombank)                                        │
│       │   ├─ Account: 1031312786                                            │
│       │   ├─ Amount: 5,725,000                                              │
│       │   ├─ Content: "HD202404001"                                         │
│       │   └─ QR URL: https://img.vietqr.io/image/...                        │
│       │                                                                      │
│       └─► 🔔 Gửi thông báo cho người thuê (TODO)                            │
│                                                                              │
│  💾 Database                                                                 │
│       ├─► ChiSoDienNuoc: TrangThai = DaPhatHanhHoaDon ✅                    │
│       └─► HoaDon: TrangThai = ChuaTT 💰                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 3: NGƯỜI THUÊ THANH TOÁN                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏠 Người Thuê (Nguyễn Văn A)                                                │
│       │                                                                      │
│       ├─► 🔔 Nhận thông báo: "Bạn có hóa đơn mới"                           │
│       │                                                                      │
│       ├─► 📋 GET /api/hoadon/my-invoices                                    │
│       │   └─► Xem danh sách hóa đơn                                         │
│       │                                                                      │
│       ├─► 🔍 GET /api/hoadon/456                                            │
│       │   └─► Xem chi tiết hóa đơn HD202404001                              │
│       │                                                                      │
│       │   ┌──────────────────────────────────────────┐                      │
│       │   │  HÓA ĐƠN HD202404001                     │                      │
│       │   ├──────────────────────────────────────────┤                      │
│       │   │  Căn hộ: A101                            │                      │
│       │   │  Tháng: 04/2024                          │                      │
│       │   │  Hạn thanh toán: 06/05/2024              │                      │
│       │   ├──────────────────────────────────────────┤                      │
│       │   │  • Tiền thuê:      5,000,000đ            │                      │
│       │   │  • Tiền điện:        322,000đ            │                      │
│       │   │    (80.5 kWh × 4,000đ)                   │                      │
│       │   │  • Tiền nước:        153,000đ            │                      │
│       │   │    (15.3 m³ × 10,000đ)                   │                      │
│       │   │  • Phí chung:        200,000đ            │                      │
│       │   │  • Phí vệ sinh:       50,000đ            │                      │
│       │   ├──────────────────────────────────────────┤                      │
│       │   │  TỔNG CỘNG:        5,725,000đ            │                      │
│       │   └──────────────────────────────────────────┘                      │
│       │                                                                      │
│       ├─► 📱 Xem QR Code                                                     │
│       │   │                                                                  │
│       │   │   ┌─────────────────────────┐                                   │
│       │   │   │  Quét mã QR để thanh toán│                                  │
│       │   │   ├─────────────────────────┤                                   │
│       │   │   │   ███████████████████   │                                   │
│       │   │   │   ███ ▄▄▄▄▄ █ ▀█ ███   │                                   │
│       │   │   │   ███ █   █ █▀▀  ███   │                                   │
│       │   │   │   ███ █▄▄▄█ █ ▀▄ ███   │                                   │
│       │   │   │   ███▄▄▄▄▄▄▄█▄█▄▄███   │                                   │
│       │   │   │   ███ ▀ █▀▄  ▄▀ ▄███   │                                   │
│       │   │   │   ███████████████████   │                                   │
│       │   │   ├─────────────────────────┤                                   │
│       │   │   │  🏦 Vietcombank          │                                   │
│       │   │   │  💳 STK: 1031312786      │                                   │
│       │   │   │  💰 Số tiền: 5,725,000đ  │                                   │
│       │   │   │  📝 Nội dung: HD202404001│                                   │
│       │   │   └─────────────────────────┘                                   │
│       │   │                                                                  │
│       │   └─► [Sao chép STK] [Sao chép nội dung]                            │
│       │                                                                      │
│       ├─► 📱 Mở app ngân hàng                                                │
│       │   └─► Quét QR hoặc nhập thủ công                                    │
│       │                                                                      │
│       ├─► 💸 Chuyển khoản 5,725,000đ                                        │
│       │   └─► Nội dung: HD202404001                                         │
│       │                                                                      │
│       └─► ✅ POST /api/hoadon/456/mark-paid                                 │
│           ├─ MaGiaoDich: "FT24042112345678"                                 │
│           └─ GhiChu: "Đã chuyển khoản lúc 14:30"                            │
│                                                                              │
│  💾 Database                                                                 │
│       ├─► HoaDon: TrangThai = DaTT ✅                                       │
│       └─► ThanhToan: Tạo bản ghi thanh toán                                 │
│           ├─ SoTien: 5,725,000đ                                             │
│           ├─ NgayThanhToan: 2024-04-21 14:30                                │
│           ├─ PhuongThuc: ChuyenKhoan                                        │
│           └─ MaGiaoDich: FT24042112345678                                   │
│                                                                              │
│  🔔 Thông báo                                                                │
│       └─► Gửi cho kế toán: "Người thuê đã thanh toán HD202404001"          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
                            ✅ HOÀN THÀNH
```

---

## 📊 State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRẠNG THÁI CHỈ SỐ ĐIỆN NƯỚC                   │
└─────────────────────────────────────────────────────────────────┘

    [Kỹ thuật ghi chỉ số]
              │
              ▼
    ┌──────────────────┐
    │ ChoDuyetKeToan   │ ⏳
    │ (Chờ duyệt)      │
    └──────────────────┘
              │
              │ [Kế toán xác nhận]
              ▼
    ┌──────────────────┐
    │ DaPhatHanhHoaDon │ ✅
    │ (Đã phát hành)   │
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      TRẠNG THÁI HÓA ĐƠN                          │
└─────────────────────────────────────────────────────────────────┘

    [Kế toán phát hành]
              │
              ▼
    ┌──────────────────┐
    │     ChuaTT       │ 💰
    │ (Chưa thanh toán)│
    └──────────────────┘
              │
              │ [Người thuê thanh toán]
              ▼
    ┌──────────────────┐
    │      DaTT        │ ✅
    │ (Đã thanh toán)  │
    └──────────────────┘
```

---

## 🗄️ Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA DIAGRAM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   canho      │
│──────────────│
│ ID           │◄────┐
│ MaCanHo      │     │
│ GiaThue      │     │
└──────────────┘     │
                     │
                     │ CanHoID
                     │
┌──────────────────────────────┐
│   chisodiennuoc              │
│──────────────────────────────│
│ ID                           │
│ CanHoID                      │────┘
│ ThangNam                     │
│ ChiSoDienCu                  │
│ ChiSoDienMoi                 │
│ ChiSoNuocCu                  │
│ ChiSoNuocMoi                 │
│ AnhDongHoDien        ← NEW   │
│ AnhDongHoNuoc        ← NEW   │
│ TrangThai            ← NEW   │
│ KeToanDuyetID        ← NEW   │
│ NgayKeToanDuyet      ← NEW   │
│ ChiSoDienChinhThuc   ← NEW   │
│ ChiSoNuocChinhThuc   ← NEW   │
│ GhiChuKeToan         ← NEW   │
└──────────────────────────────┘

┌──────────────┐
│   hopdong    │
│──────────────│
│ ID           │◄────┐
│ CanHoID      │     │
│ NguoiThueID  │     │
│ GiaThue      │     │
└──────────────┘     │
                     │ HopDongID
                     │
┌──────────────────────────────┐
│   hoadon                     │
│──────────────────────────────│
│ ID                           │
│ HopDongID                    │────┘
│ ThangNam                     │
│ NgayLap                      │
│ NgayDenHan                   │
│ TongTien                     │
│ TrangThai                    │
│ MaHoaDon             ← NEW   │
│ QRContent            ← NEW   │
│ SoTaiKhoan           ← NEW   │
│ NganHangNhan         ← NEW   │
│ NoiDungCK            ← NEW   │
└──────────────────────────────┘
                     │
                     │ HoaDonID
                     ▼
┌──────────────────────────────┐
│   hoadonchitiet              │
│──────────────────────────────│
│ ID                           │
│ HoaDonID                     │
│ Loai (TienThue, Dien, Nuoc)  │
│ SoTien                       │
│ MoTa                         │
└──────────────────────────────┘

┌──────────────────────────────┐
│   thanhtoan                  │
│──────────────────────────────│
│ ID                           │
│ HoaDonID                     │
│ SoTien                       │
│ NgayThanhToan                │
│ PhuongThuc                   │
│ MaGiaoDich                   │
└──────────────────────────────┘
```

---

## 🔐 Authorization Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHÂN QUYỀN THEO VAI TRÒ                       │
└─────────────────────────────────────────────────────────────────┘

                    │ Kỹ Thuật │ Kế Toán │ Quản Lý │ Người Thuê │
────────────────────┼──────────┼─────────┼─────────┼────────────┤
Ghi chỉ số          │    ✅    │    ❌   │   ✅    │     ❌     │
Xem chờ duyệt       │    ❌    │    ✅   │   ✅    │     ❌     │
Xác nhận & phát hành│    ❌    │    ✅   │   ✅    │     ❌     │
Xem hóa đơn (all)   │    ❌    │    ✅   │   ✅    │     ❌     │
Xem hóa đơn (own)   │    ❌    │    ❌   │   ❌    │     ✅     │
Thanh toán          │    ❌    │    ❌   │   ❌    │     ✅     │
────────────────────┴──────────┴─────────┴─────────┴────────────┘
```

---

## 📱 API Endpoints Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        API ENDPOINTS                             │
└─────────────────────────────────────────────────────────────────┘

/api/chisodiennuoc
├── GET    /                    → Get all meter readings
├── GET    /pending             → Get pending readings (Accountant)
├── GET    /:id                 → Get reading by ID
├── POST   /                    → Create new reading (Technician)
└── POST   /:id/confirm         → Confirm & generate invoice (Accountant)

/api/hoadon
├── GET    /                    → Get all invoices (Manager/Accountant)
├── GET    /my-invoices         → Get tenant's invoices
├── GET    /:id                 → Get invoice detail with QR
└── POST   /:id/mark-paid       → Mark as paid (Tenant)
```

---

## 💰 Calculation Formula

```
┌─────────────────────────────────────────────────────────────────┐
│                    CÔNG THỨC TÍNH TOÁN                           │
└─────────────────────────────────────────────────────────────────┘

INPUT:
  ChiSoDienMoi = 1250.5 kWh
  ChiSoNuocMoi = 85.3 m³
  ChiSoDienCu = 1170.0 kWh (auto from previous month)
  ChiSoNuocCu = 70.0 m³ (auto from previous month)
  GiaThue = 5,000,000đ (from contract)

CALCULATION:
  SoDien = ChiSoDienMoi - ChiSoDienCu
         = 1250.5 - 1170.0
         = 80.5 kWh

  SoNuoc = ChiSoNuocMoi - ChiSoNuocCu
         = 85.3 - 70.0
         = 15.3 m³

  TienDien = SoDien × ELECTRICITY_PRICE
           = 80.5 × 4,000
           = 322,000đ

  TienNuoc = SoNuoc × WATER_PRICE
           = 15.3 × 10,000
           = 153,000đ

  TongTien = GiaThue + TienDien + TienNuoc + COMMON_FEE + CLEANING_FEE
           = 5,000,000 + 322,000 + 153,000 + 200,000 + 50,000
           = 5,725,000đ

OUTPUT:
  MaHoaDon = "HD" + ThangNam.replace("-", "") + CanHoID.padStart(3, "0")
           = "HD" + "202404" + "001"
           = "HD202404001"

  NoiDungCK = "HD202404001"

  QRUrl = "https://img.vietqr.io/image/VCB-1031312786-compact.png
           ?amount=5725000&addInfo=HD202404001"
```

---

## 🎯 Success Criteria

```
✅ Kỹ thuật viên có thể ghi chỉ số + upload ảnh
✅ Hệ thống tự động lấy chỉ số cũ từ tháng trước
✅ Kế toán xem được danh sách chờ duyệt
✅ Kế toán xem được ảnh đồng hồ để đối chiếu
✅ Hệ thống tự động tính tiền điện, nước, phí
✅ Hệ thống tự động tạo hóa đơn
✅ Hệ thống tự động generate QR code VietQR
✅ Người thuê xem được hóa đơn của mình
✅ Người thuê quét QR để thanh toán
✅ Người thuê đánh dấu đã thanh toán
✅ Phân quyền chính xác theo vai trò
```

---

**🎉 Quy trình hoàn chỉnh và sẵn sàng triển khai!**
