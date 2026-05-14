import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SidebarLayout from "./components/layouts/SidebarLayout";
import PublicTenantLayout from "./components/layouts/PublicTenantLayout";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Apartments from "./pages/Apartments";
import ApartmentDetail from "./pages/ApartmentDetail";
import Assets from "./pages/Assets";
import TenantAssets from "./pages/TenantAssets";
import MyServices from "./pages/MyServices";
import Amenities from "./pages/Amenities";
import Services from "./pages/Services";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/Profile";

// Billing workflow
import MeterReadingForm from './pages/chisodiennuoc/MeterReadingForm';
import PendingReadingsList from './pages/chisodiennuoc/PendingReadingsList';
import MyInvoicesList from './pages/hoadon/MyInvoicesList';

// Contract & Request pages
import MyContracts from './pages/hopdong/MyContracts';
import YeuCauThueList from './pages/yeucauthue/YeuCauThueList';
import MyRentalRequests from './pages/yeucauthue/MyRentalRequests';
import BrowseApartments from './pages/canho/BrowseApartments';
import FavoriteApartments from './pages/canho/FavoriteApartments';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import ContractManagement from './pages/admin/ContractManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import StaffManagement from './pages/admin/StaffManagement';
import MemberManagement from './pages/admin/MemberManagement';
import ActivityLog from './pages/admin/ActivityLog';

// Incident & Notification pages
import MyIncidents from './pages/yeucausuco/MyIncidents';
import StaffWorkList from './pages/yeucausuco/StaffWorkList';
import AssignIncidents from './pages/yeucausuco/AssignIncidents';
// import DutySchedule from './pages/lichtruc/DutySchedule'; // Đã tắt để giảm test case
import Notifications from './pages/thongbao/Notifications';
import Reports from './pages/baocao/Reports';
import OwnerReports from './pages/baocao/OwnerReports';
import ParkingManagement from './pages/theguixe/ParkingManagement';

// New pages - Phase 2
import MyTransfers from './pages/chuyennhuong/MyTransfers';
import TransferRequests from './pages/chuyennhuong/TransferRequests';
import ChatPage from './pages/chat/ChatPage';
import ChatbotWidget from './components/ChatbotWidget';
import ChatWidget from './components/ChatWidget';
import MyApartment from './pages/MyApartment';

import "./App.css";
import GoogleCallback from './pages/GoogleCallback';
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CommunityRules from './pages/CommunityRules';
import BangGiaDienNuoc from './pages/BangGiaDienNuoc';

// Scroll lên top mỗi khi chuyển route
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Protected Route Component
// Roles from DB: Admin, ChuNha, NguoiThue, NhanVien, KeToan
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.roles?.TenVaiTro || user.VaiTro;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Tenant/guest redirect to home, others to dashboard
    const redirectPath = ['NguoiThue', 'KhachVangLai'].includes(userRole) ? '/' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Wrap with sidebar (for admin/staff) or public layout (for tenants and guests)
const WithLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.roles?.TenVaiTro || user?.VaiTro;
  
  // Use PublicTenantLayout for tenants and guests (no sidebar, just header like home page)
  if (role === 'NguoiThue' || role === 'KhachVangLai') {
    return <PublicTenantLayout>{children}</PublicTenantLayout>;
  }
  
  return <SidebarLayout>{children}</SidebarLayout>;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        {/* Login redirect - tenant/guest stays on home, others go to dashboard */}
        <Route path="/login" element={
          user ? (
            ['NguoiThue', 'KhachVangLai'].includes(user.roles?.TenVaiTro || user.VaiTro) 
              ? <Navigate to="/" replace /> 
              : <Navigate to="/dashboard" replace />
          ) : <Login />
        } />

        {/* Google OAuth callback */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Quên mật khẩu */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Chính sách bảo mật - public, không cần đăng nhập */}
        <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />

        {/* Điều khoản sử dụng - public, không cần đăng nhập */}
        <Route path="/dieu-khoan-su-dung" element={<TermsOfService />} />

        {/* Quy định cộng đồng - public, không cần đăng nhập */}
        <Route path="/quy-dinh-cong-dong" element={<CommunityRules />} />

        {/* Bảng giá điện nước - public */}
        <Route path="/bang-gia-dien-nuoc" element={<BangGiaDienNuoc />} />

        {/* Dashboard - only for admin/staff, NOT for tenants */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha', 'KeToan', 'NhanVienKyThuat']}>
            <WithLayout><Dashboard /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <WithLayout><Profile /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Notifications - all roles */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <WithLayout><Notifications /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Chat - QuanLy, NhanVienKyThuat, NguoiThue, KhachVangLai */}
        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'NhanVienKyThuat', 'NguoiThue', 'KhachVangLai']}>
            <WithLayout><ChatPage /></WithLayout>
          </ProtectedRoute>
        } />

        {/* ============================================ */}
        {/* QUAN LY / CHU NHA ROUTES                    */}
        {/* ============================================ */}
        <Route path="/apartments" element={
          <ProtectedRoute allowedRoles={['ChuNha', 'QuanLy', 'NhanVienKyThuat']}>
            <WithLayout><Apartments /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/apartments/:id" element={
          user ? (
            <WithLayout><ApartmentDetail /></WithLayout>
          ) : (
            <PublicTenantLayout><ApartmentDetail /></PublicTenantLayout>
          )
        } />

        <Route path="/assets" element={
          <ProtectedRoute allowedRoles={['ChuNha', 'QuanLy', 'NhanVienKyThuat']}>
            <WithLayout><Assets /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/amenities" element={
          <ProtectedRoute allowedRoles={['ChuNha', 'QuanLy', 'NhanVienKyThuat']}>
            <WithLayout><Amenities /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/services" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><Services /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><UserManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><ContractManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/hopdong" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><ContractManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/yeucauthue" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><YeuCauThueList /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/assign-incidents" element={
          <ProtectedRoute allowedRoles={['QuanLy']}>
            <WithLayout><AssignIncidents /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Đã tắt Lịch trực để giảm test case */}
        {/* <Route path="/duty-schedule" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><DutySchedule /></WithLayout>
          </ProtectedRoute>
        } /> */}

        <Route path="/staff/work" element={
          <ProtectedRoute allowedRoles={['NhanVienKyThuat']}>
            <WithLayout><StaffWorkList /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/members" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><MemberManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/parking" element={
          <ProtectedRoute allowedRoles={['QuanLy']}>
            <WithLayout><ParkingManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['KeToan', 'QuanLy']}>
            <WithLayout><Reports /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/owner-reports" element={
          <ProtectedRoute allowedRoles={['ChuNha']}>
            <WithLayout><OwnerReports /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/staff-management" element={
          <ProtectedRoute allowedRoles={['ChuNha', 'QuanLy']}>
            <WithLayout><StaffManagement /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/transfer-requests" element={
          <ProtectedRoute allowedRoles={['ChuNha', 'QuanLy']}>
            <WithLayout><TransferRequests /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/activity-log" element={
          <ProtectedRoute allowedRoles={['QuanLy', 'ChuNha']}>
            <WithLayout><ActivityLog /></WithLayout>
          </ProtectedRoute>
        } />

        {/* ============================================ */}
        {/* BILLING WORKFLOW ROUTES                     */}
        {/* ============================================ */}
        <Route path="/meter-reading" element={
          <ProtectedRoute allowedRoles={['NhanVienKyThuat']}>
            <WithLayout><MeterReadingForm /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/pending-readings" element={
          <ProtectedRoute allowedRoles={['KeToan', 'QuanLy']}>
            <WithLayout><PendingReadingsList /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/hoadon-all" element={
          <ProtectedRoute allowedRoles={['KeToan', 'QuanLy']}>
            <WithLayout><InvoiceManagement /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Căn hộ của tôi - hub trung tâm cho tenant */}
        <Route path="/my-apartment" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyApartment /></WithLayout>
          </ProtectedRoute>
        } />

        {/* Browse apartments */}
        <Route path="/browse-apartments" element={
          user ? (
            <WithLayout><BrowseApartments /></WithLayout>
          ) : (
            <PublicTenantLayout><BrowseApartments /></PublicTenantLayout>
          )
        } />

        {/* Favorite apartments */}
        <Route path="/favorite-apartments" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><FavoriteApartments /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-rental-requests" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyRentalRequests /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-contracts" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyContracts /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-invoices" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyInvoicesList /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-assets" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><TenantAssets /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-services" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyServices /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-incidents" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyIncidents /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-transfers" element={
          <ProtectedRoute allowedRoles={['NguoiThue', 'KhachVangLai']}>
            <WithLayout><MyTransfers /></WithLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={
          <Navigate to={
            user && ['NguoiThue', 'KhachVangLai'].includes(user.roles?.TenVaiTro || user.VaiTro) 
              ? '/' 
              : '/dashboard'
          } replace />
        } />
      </Routes>

      {/* Chatbot AI Floating Widget - visible on all pages */}
      <ChatbotWidget />
      {/* Chat trực tiếp với quản lý - floating widget */}
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
