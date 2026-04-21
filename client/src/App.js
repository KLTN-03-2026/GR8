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

// Import billing components
import MeterReadingForm from './pages/chisodiennuoc/MeterReadingForm';
import PendingReadingsList from './pages/chisodiennuoc/PendingReadingsList';
import MyInvoicesList from './pages/hoadon/MyInvoicesList';

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
          <ProtectedRoute>
            <Layout>
              <Apartments />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <Layout>
              <Assets />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/amenities"
        element={
          <ProtectedRoute>
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
