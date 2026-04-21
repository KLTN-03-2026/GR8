import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Apartments from "./pages/Apartments";
import Assets from "./pages/Assets";
import Amenities from "./pages/Amenities";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/Profile";

// Billing workflow
import MeterReadingForm from './pages/chisodiennuoc/MeterReadingForm';
import PendingReadingsList from './pages/chisodiennuoc/PendingReadingsList';
import MyInvoicesList from './pages/hoadon/MyInvoicesList';

// Tenant pages
import HopDongList from './pages/hopdong/HopDongList';
import MyContracts from './pages/hopdong/MyContracts';
import YeuCauThueList from './pages/yeucauthue/YeuCauThueList';
import MyRentalRequests from './pages/yeucauthue/MyRentalRequests';
import BrowseApartments from './pages/canho/BrowseApartments';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import ContractManagement from './pages/admin/ContractManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';

import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(user.VaiTro)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/apartments"
        element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha', 'NhanVienKyThuat']}>
            <Layout>
              <Apartments />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/assets"
        element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <Layout>
              <Assets />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/amenities"
        element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha', 'NhanVienKyThuat']}>
            <Layout>
              <Amenities />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* BILLING WORKFLOW ROUTES                      */}
      {/* ============================================ */}

      {/* BƯỚC 1: Nhân viên kỹ thuật ghi chỉ số */}
      <Route
        path="/meter-reading"
        element={
          <ProtectedRoute allowedRoles={['NhanVienKyThuat', 'QuanLy']}>
            <Layout>
              <MeterReadingForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* BƯỚC 2: Kế toán xem chờ duyệt & phát hành */}
      <Route
        path="/pending-readings"
        element={
          <ProtectedRoute allowedRoles={['KeToan', 'QuanLy']}>
            <Layout>
              <PendingReadingsList />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* BƯỚC 3: Người thuê xem hóa đơn & thanh toán */}
      <Route
        path="/my-invoices"
        element={
          <ProtectedRoute allowedRoles={['NguoiThue']}>
            <Layout>
              <MyInvoicesList />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* END BILLING WORKFLOW ROUTES                  */}
      {/* ============================================ */}

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Contracts Management - Admin */}
      <Route
        path="/hopdong"
        element={
          <ProtectedRoute allowedRoles={['QuanLy']}>
            <Layout>
              <ContractManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* My Contracts - For Tenants */}
      <Route
        path="/my-contracts"
        element={
          <ProtectedRoute allowedRoles={['NguoiThue']}>
            <Layout>
              <MyContracts />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rental Requests Management - For Admin */}
      <Route
        path="/yeucauthue"
        element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <Layout>
              <YeuCauThueList />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* My Rental Requests - For Tenants */}
      <Route
        path="/my-rental-requests"
        element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachHang']}>
            <Layout>
              <MyRentalRequests />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Browse Apartments - For Tenants */}
      <Route
        path="/browse-apartments"
        element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachHang']}>
            <Layout>
              <BrowseApartments />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* ADMIN ROUTES                                 */}
      {/* ============================================ */}

      {/* Quản lý người dùng */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['QuanLy']}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Quản lý hợp đồng (admin) */}
      <Route
        path="/contracts"
        element={
          <ProtectedRoute allowedRoles={['QuanLy']}>
            <Layout>
              <ContractManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Quản lý hóa đơn (admin/ketoan) */}
      <Route
        path="/hoadon-all"
        element={
          <ProtectedRoute allowedRoles={['QuanLy', 'KeToan']}>
            <Layout>
              <InvoiceManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
