# 🗺️ ROUTES SUMMARY - Apartment Management System

## 📊 Overview
- **Total Routes**: 11 routes
- **Total Pages**: 13 pages/components
- **Framework**: React + React Router v6
- **UI Library**: Tailwind CSS
- **Auth**: Role-based access control

---

## 🔐 Authentication Routes

### 1. Login Page
- **Path**: `/login`
- **Component**: `Login.jsx`
- **Access**: Public
- **Description**: User authentication page

---

## 🏠 Main Routes

### 2. Home / Dashboard
- **Path**: `/` or `/dashboard`
- **Component**: `Home.jsx` → `Dashboard.jsx`
- **Access**: All authenticated users
- **Description**: Main dashboard with stats and quick actions
- **Features**:
  - Welcome message
  - Stats cards (apartments, invoices, assets, revenue)
  - Recent activities
  - Quick actions sidebar

---

## 🏢 Property Management Routes

### 3. Apartments Management
- **Path**: `/apartments`
- **Component**: `Apartments.jsx`
- **Access**: All authenticated users
- **Roles**: QuanLy, ChuNha, NhanVienKyThuat, NguoiThue
- **Description**: Apartment listing and management
- **Features**:
  - Stats cards (total, vacant, rented, maintenance)
  - Filter by status, floor, search
  - Apartment cards with details
  - Status badges

### 4. Assets Management
- **Path**: `/assets`
- **Component**: `Assets.jsx`
- **Access**: All authenticated users
- **Roles**: QuanLy, ChuNha
- **Description**: Asset inventory management
- **Features**:
  - Stats cards (total, good, broken, repairing, total value)
  - Filter by condition, type, search
  - Asset type icons
  - Asset details (value, quantity, location, purchase date)

### 5. Amenities
- **Path**: `/amenities`
- **Component**: `Amenities.jsx`
- **Access**: All authenticated users
- **Description**: Building amenities listing
- **Features**:
  - Search functionality
  - Auto-detect icons (WiFi, AC, Fridge, etc.)
  - Grid layout with hover effects

---

## 💰 Billing Workflow Routes (3-Step Process)

### 6. Meter Reading Form (Step 1)
- **Path**: `/meter-reading`
- **Component**: `MeterReadingForm.jsx`
- **Access**: Role-restricted
- **Roles**: NhanVienKyThuat, QuanLy
- **Description**: Record electricity and water meter readings
- **Features**:
  - Apartment dropdown selection
  - Meter reading inputs (electric, water)
  - Photo upload (URL input)
  - Validation & error handling

### 7. Pending Readings List (Step 2)
- **Path**: `/pending-readings`
- **Component**: `PendingReadingsList.jsx`
- **Access**: Role-restricted
- **Roles**: KeToan, QuanLy
- **Description**: Review and confirm meter readings, generate invoices
- **Features**:
  - List of pending readings
  - Filter by month
  - View meter photos
  - Confirm readings & auto-generate invoices
  - Modal: `ConfirmReadingModal.jsx`

### 8. My Invoices (Step 3)
- **Path**: `/my-invoices`
- **Component**: `MyInvoicesList.jsx`
- **Access**: Role-restricted
- **Roles**: NguoiThue
- **Description**: Tenant view and pay invoices
- **Features**:
  - Stats cards (total, paid, unpaid, total debt)
  - Filter tabs (All, Unpaid, Paid)
  - Overdue warnings
  - Invoice details breakdown
  - Payment modal with VietQR
  - Modal: `PaymentModal.jsx`

---

## 📄 Contract & Rental Management Routes

### 9. Contracts Management
- **Path**: `/hopdong`
- **Component**: `HopDongList.jsx`
- **Access**: Role-restricted
- **Roles**: QuanLy, ChuNha, NguoiThue
- **Description**: Contract management and tracking
- **Features**:
  - Stats cards (total, active, pending, expired)
  - Filter by status and search
  - Contract details (dates, financial info)
  - Warning banner for expiring contracts (≤30 days)
  - Days remaining calculation
  - File download link
  - Status badges (Chờ ký, Đã ký, Đang thuê, Hết hạn, Kết thúc)

### 10. Rental Requests Management
- **Path**: `/yeucauthue`
- **Component**: `YeuCauThueList.jsx`
- **Access**: Role-restricted
- **Roles**: QuanLy, ChuNha
- **Description**: Manage rental applications from customers
- **Features**:
  - Stats cards (total, pending, approved, rejected)
  - Filter by status and search
  - Customer and apartment info display
  - Approve/Reject actions (for managers)
  - Status badges (Chờ kiểm tra, Chờ duyệt, Đã duyệt, Từ chối)
  - Apartment info card

---

## 👤 User Management Routes

### 11. User Profile
- **Path**: `/profile`
- **Component**: `Profile.jsx`
- **Access**: All authenticated users
- **Description**: User profile and settings
- **Features**:
  - Two tabs: Personal Info & Change Password
  - Update profile form:
    - Name, Email, Phone
    - CCCD/CMND
    - Date of birth, Gender
    - Address
  - Change password form with validation
  - Role badge display
  - Account info section (username, creation date)
  - Gradient header with avatar

---

## 🎯 Role-Based Access Control

### Role Permissions Matrix

| Route | QuanLy | KeToan | NhanVienKyThuat | NguoiThue | ChuNha |
|-------|--------|--------|-----------------|-----------|--------|
| `/` (Dashboard) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/apartments` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/assets` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `/amenities` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/meter-reading` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/pending-readings` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/my-invoices` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/hopdong` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `/yeucauthue` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Role Descriptions
- **QuanLy** (Manager): Full access to all features
- **KeToan** (Accountant): Billing workflow step 2, view apartments
- **NhanVienKyThuat** (Technical Staff): Billing workflow step 1, view apartments
- **NguoiThue** (Tenant): View invoices, pay bills, view contracts
- **ChuNha** (Owner): View assets, contracts, rental requests

---

## 🔄 Navigation Flow

### Billing Workflow
```
1. NhanVienKyThuat → /meter-reading
   ↓ (Record meter readings)
   
2. KeToan → /pending-readings
   ↓ (Confirm & generate invoice)
   
3. NguoiThue → /my-invoices
   ↓ (View & pay invoice)
   
✅ Payment completed
```

### Rental Process
```
1. Customer submits rental request
   ↓
   
2. QuanLy/ChuNha → /yeucauthue
   ↓ (Review & approve/reject)
   
3. Create contract → /hopdong
   ↓
   
4. NguoiThue → /hopdong
   ✅ (View contract details)
```

---

## 📁 File Structure

```
client/src/
├── App.js (Main routing configuration)
├── pages/
│   ├── auth/
│   │   └── Login.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx
│   ├── chisodiennuoc/
│   │   ├── MeterReadingForm.jsx
│   │   └── PendingReadingsList.jsx
│   ├── hoadon/
│   │   └── MyInvoicesList.jsx
│   ├── hopdong/
│   │   └── HopDongList.jsx
│   ├── yeucauthue/
│   │   └── YeuCauThueList.jsx
│   ├── Apartments.jsx
│   ├── Assets.jsx
│   ├── Amenities.jsx
│   ├── Profile.jsx
│   └── Home.jsx
├── components/
│   ├── Layout.jsx
│   └── billing/
│       ├── ConfirmReadingModal.jsx
│       └── PaymentModal.jsx
├── context/
│   └── AuthContext.jsx
└── services/
    ├── api.js
    └── billingService.js
```

---

## 🧪 Test Accounts

| Username | Password | Role | Access |
|----------|----------|------|--------|
| quanly | 123456 | QuanLy | Full access |
| ketoan | 123456 | KeToan | Billing step 2 |
| kythuat | 123456 | NhanVienKyThuat | Billing step 1 |
| nguoithue | 123456 | NguoiThue | View invoices |
| chunha | 123456 | ChuNha | Owner access |

---

## 🚀 How to Test

1. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd client
   npm start
   ```

3. **Login** with test accounts above

4. **Test Billing Workflow**:
   - Login as `kythuat` → Go to `/meter-reading` → Record readings
   - Login as `ketoan` → Go to `/pending-readings` → Confirm & generate invoice
   - Login as `nguoithue` → Go to `/my-invoices` → View & pay invoice

5. **Test Contract Management**:
   - Login as `quanly` → Go to `/hopdong` → View contracts
   - Login as `quanly` → Go to `/yeucauthue` → Approve/reject requests

6. **Test Profile**:
   - Any user → Go to `/profile` → Update info or change password

---

## 📝 Notes

- All routes use `<Layout>` wrapper for consistent UI
- Protected routes redirect to `/login` if not authenticated
- Role-restricted routes redirect to `/` if user doesn't have permission
- All pages are responsive and mobile-friendly
- Tailwind CSS for styling
- Loading states and error handling on all pages

---

**Created**: 2026-04-21  
**Status**: ✅ COMPLETED  
**Total Routes**: 11  
**Total Pages**: 13
