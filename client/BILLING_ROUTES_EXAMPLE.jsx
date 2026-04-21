// BILLING_ROUTES_EXAMPLE.jsx
// Copy code này vào App.js của bạn

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import billing components
import MeterReadingForm from './pages/chisodiennuoc/MeterReadingForm';
import PendingReadingsList from './pages/chisodiennuoc/PendingReadingsList';
import MyInvoicesList from './pages/hoadon/MyInvoicesList';

// Import existing components
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './components/Layout';

// Protected Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.VaiTro)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ============================================ */}
          {/* BILLING WORKFLOW ROUTES                      */}
          {/* ============================================ */}

          {/* BƯỚC 1: Nhân viên kỹ thuật ghi chỉ số */}
          <Route
            path="meter-reading"
            element={
              <PrivateRoute allowedRoles={['NhanVienKyThuat', 'QuanLy']}>
                <MeterReadingForm />
              </PrivateRoute>
            }
          />

          {/* BƯỚC 2: Kế toán xem chờ duyệt & phát hành */}
          <Route
            path="pending-readings"
            element={
              <PrivateRoute allowedRoles={['KeToan', 'QuanLy']}>
                <PendingReadingsList />
              </PrivateRoute>
            }
          />

          {/* BƯỚC 3: Người thuê xem hóa đơn & thanh toán */}
          <Route
            path="my-invoices"
            element={
              <PrivateRoute allowedRoles={['NguoiThue']}>
                <MyInvoicesList />
              </PrivateRoute>
            }
          />

          {/* ============================================ */}
          {/* END BILLING WORKFLOW ROUTES                  */}
          {/* ============================================ */}

          {/* Other existing routes... */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// ============================================
// NAVIGATION MENU EXAMPLE
// ============================================

// Thêm vào sidebar/navigation của bạn:

const NavigationMenu = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav>
      {/* Existing menu items... */}

      {/* Billing Menu */}
      <div className="menu-section">
        <h3>💰 Thanh Toán</h3>

        {/* Kỹ thuật viên */}
        {['NhanVienKyThuat', 'QuanLy'].includes(user.VaiTro) && (
          <a href="/meter-reading" className="menu-item">
            📝 Ghi Chỉ Số
          </a>
        )}

        {/* Kế toán */}
        {['KeToan', 'QuanLy'].includes(user.VaiTro) && (
          <a href="/pending-readings" className="menu-item">
            ⏳ Chỉ Số Chờ Duyệt
          </a>
        )}

        {/* Người thuê */}
        {user.VaiTro === 'NguoiThue' && (
          <a href="/my-invoices" className="menu-item">
            💳 Hóa Đơn Của Tôi
          </a>
        )}
      </div>
    </nav>
  );
};

// ============================================
// DASHBOARD CARDS EXAMPLE
// ============================================

const DashboardCards = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Kỹ thuật viên */}
      {['NhanVienKyThuat', 'QuanLy'].includes(user.VaiTro) && (
        <div className="card bg-blue-500 text-white p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">📝 Ghi Chỉ Số</h3>
          <p className="mb-4">Ghi chỉ số điện nước hàng tháng</p>
          <a
            href="/meter-reading"
            className="bg-white text-blue-500 px-4 py-2 rounded-lg inline-block"
          >
            Bắt đầu →
          </a>
        </div>
      )}

      {/* Kế toán */}
      {['KeToan', 'QuanLy'].includes(user.VaiTro) && (
        <div className="card bg-green-500 text-white p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">⏳ Chờ Duyệt</h3>
          <p className="mb-4">Xác nhận chỉ số và phát hành hóa đơn</p>
          <a
            href="/pending-readings"
            className="bg-white text-green-500 px-4 py-2 rounded-lg inline-block"
          >
            Xem ngay →
          </a>
        </div>
      )}

      {/* Người thuê */}
      {user.VaiTro === 'NguoiThue' && (
        <div className="card bg-purple-500 text-white p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">💳 Hóa Đơn</h3>
          <p className="mb-4">Xem và thanh toán hóa đơn</p>
          <a
            href="/my-invoices"
            className="bg-white text-purple-500 px-4 py-2 rounded-lg inline-block"
          >
            Xem hóa đơn →
          </a>
        </div>
      )}
    </div>
  );
};
