// client/src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Modern Icon Components (Lucide-style)
const BuildingIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const FileTextIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClipboardListIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const DollarSignIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BarChartIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertTriangleIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const PackageIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ZapIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CheckCircleIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const RefreshIcon = ({ className, strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const StatCard = ({ title, value, sub, icon: IconComponent, link, navigate, gradient = "from-primary-400 to-primary-600" }) => (
  <div
    className={`group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300`}
    onClick={() => link && navigate(link)}
  >
    <div className="bg-blue-600 p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-sm">
            <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-opacity-90 text-xs font-medium tracking-wider uppercase">{title}</span>
        </div>
        <p className="text-4xl font-bold text-white mb-1 tracking-tight">{value}</p>
        {sub && <p className="text-white text-opacity-85 text-sm font-medium">{sub}</p>}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roles?.TenVaiTro || user?.VaiTro;

  // ===== ALL HOOKS MUST BE CALLED FIRST =====
  const [stats, setStats] = useState({
    apartments: { total: 0, available: 0, rented: 0, maintenance: 0 },
    contracts: { total: 0, active: 0, pending: 0, expiringSoon: 0 },
    invoices: { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 },
    requests: { total: 0, pending: 0, approved: 0, rejected: 0 },
    users: { total: 0, tenants: 0 },
    technician: { 
      pendingIncidents: 0, 
      pendingReadings: 0, 
      brokenAssets: 0,
      recentIncidents: [],
      recentReadings: []
    },
  });
  const [loading, setLoading] = useState(true);
  const [recentContracts, setRecentContracts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  console.log('=== DASHBOARD RENDER ===');
  console.log('User:', user);
  console.log('Role:', role);

  // Nếu không có user, redirect về login
  useEffect(() => {
    if (!user) {
      console.error('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  // Tenant redirect về trang chủ
  useEffect(() => {
    if (user && ['NguoiThue', 'KhachVangLai'].includes(user.roles?.TenVaiTro || user.VaiTro)) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => { 
    if (user) {
      fetchDashboardData(); 
    }
  }, [user]);

  // ===== FETCH DATA FUNCTION =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Roles: QuanLy, KeToan, ChuNha, NhanVienKyThuat, NguoiThue
      const isAdmin = role === 'QuanLy';
      const isAccountant = role === 'KeToan';
      const isOwner = role === 'ChuNha';
      const isTenant = role === 'NguoiThue';
      const isTech = role === 'NhanVienKyThuat';

      console.log('Fetching dashboard data for role:', role, { isAdmin, isAccountant, isOwner, isTenant, isTech });

      const promises = [
        axios.get('/apartments').catch((err) => {
          console.error('Error fetching apartments:', err);
          return { data: { data: [] } };
        }),
      ];
      if (isAdmin || isOwner) {
        promises.push(
          axios.get('/hopdong').catch((err) => { console.error('Error fetching hopdong:', err); return { data: { data: [] } }; }),
          axios.get('/hoadon').catch((err) => { console.error('Error fetching hoadon:', err); return { data: { data: [] } }; }),
          axios.get('/yeucauthue').catch((err) => { console.error('Error fetching yeucauthue:', err); return { data: { data: [] } }; }),
          axios.get('/users').catch((err) => { console.error('Error fetching users:', err); return { data: { data: { items: [] } } }; }),
        );
      }
      if (isAccountant) {
        promises.push(
          axios.get('/hoadon').catch((err) => { console.error('Error fetching hoadon:', err); return { data: { data: [] } }; }),
          axios.get('/chisodiennuoc/pending').catch((err) => { console.error('Error fetching pending readings:', err); return { data: { data: [] } }; }),
        );
      }
      if (isTenant) {
        promises.push(
          axios.get('/hopdong/my').catch((err) => { console.error('Error fetching my hopdong:', err); return { data: { data: [] } }; }),
          axios.get('/hoadon/my-invoices').catch((err) => { console.error('Error fetching my invoices:', err); return { data: { data: [] } }; }),
          axios.get('/yeucauthue/my').catch((err) => { console.error('Error fetching my yeucauthue:', err); return { data: { data: [] } }; }),
        );
      }
      if (isTech) {
        promises.push(
          axios.get('/yeucausuco').catch((err) => { console.error('Error fetching yeucausuco:', err); return { data: { data: [] } }; }),
          axios.get('/chisodiennuoc/pending').catch((err) => { console.error('Error fetching pending readings:', err); return { data: { data: [] } }; }),
          axios.get('/assets').catch((err) => { console.error('Error fetching assets:', err); return { data: { data: [] } }; }),
        );
      }

      const results = await Promise.all(promises);
      const [aptRes, ...rest] = results;

      console.log('API Results:', { aptRes, rest, restLength: rest.length });

      // Apartments
      let apts = aptRes.data.data || [];
      if (!Array.isArray(apts)) apts = apts.items || [];
      if (!Array.isArray(apts)) apts = [];
      const aptStats = apts.reduce((a, x) => {
        a.total++;
        if (x.TrangThai === 'Trong') a.available++;
        else if (x.TrangThai === 'DaThue') a.rented++;
        else if (x.TrangThai === 'BaoTri') a.maintenance++;
        return a;
      }, { total: 0, available: 0, rented: 0, maintenance: 0 });

      let contractStats = { total: 0, active: 0, pending: 0, expiringSoon: 0 };
      let invoiceStats = { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 };
      let requestStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
      let userStats = { total: 0, tenants: 0 };
      let techStats = { 
        pendingIncidents: 0, 
        pendingReadings: 0, 
        brokenAssets: 0,
        recentIncidents: [],
        recentReadings: []
      };
      let recentC = [], recentR = [];

      if (isAdmin && rest.length >= 4) {
        let contracts = rest[0].data.data || [];
        if (!Array.isArray(contracts)) contracts = [];
        const today = new Date();
        contractStats = contracts.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DangThue') {
            a.active++;
            const days = Math.ceil((new Date(x.NgayKetThuc) - today) / 86400000);
            if (days > 0 && days <= 30) a.expiringSoon++;
          }
          if (x.TrangThai === 'ChoKy') a.pending++;
          return a;
        }, { total: 0, active: 0, pending: 0, expiringSoon: 0 });
        recentC = contracts.slice(0, 5);

        let invoices = rest[1].data.data || rest[1].data.items || [];
        if (!Array.isArray(invoices)) invoices = [];
        invoiceStats = invoices.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DaTT') a.paid++;
          else {
            a.unpaid++;
            a.totalUnpaid += parseFloat(x.TongTien || 0);
            if (new Date(x.NgayDenHan) < today) a.overdue++;
          }
          return a;
        }, { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 });

        let requests = rest[2].data.data || [];
        if (!Array.isArray(requests)) requests = [];
        requestStats = requests.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'ChoKiemTra') a.pending++;
          else if (x.TrangThai === 'DaDuyet') a.approved++;
          else if (x.TrangThai === 'TuChoi') a.rejected++;
          return a;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
        recentR = requests.filter(r => r.TrangThai === 'ChoKiemTra').slice(0, 5);

        let users = rest[3].data.data?.items || rest[3].data.items || [];
        if (!Array.isArray(users)) users = [];
        userStats = { total: users.length, tenants: users.filter(u => u.roles?.TenVaiTro === 'NguoiThue').length };
      }

      if (isTenant && rest.length >= 3) {
        let contracts = rest[0].data.data || [];
        if (!Array.isArray(contracts)) contracts = [];
        contractStats = contracts.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DangThue') a.active++;
          if (x.TrangThai === 'ChoKy') a.pending++;
          return a;
        }, { total: 0, active: 0, pending: 0, expiringSoon: 0 });

        let invoices = rest[1].data.data || rest[1].data.items || [];
        if (!Array.isArray(invoices)) invoices = [];
        invoiceStats = invoices.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DaTT') a.paid++;
          else { a.unpaid++; a.totalUnpaid += parseFloat(x.TongTien || 0); }
          return a;
        }, { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 });

        let requests = rest[2].data.data || [];
        if (!Array.isArray(requests)) requests = [];
        requestStats = requests.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'ChoKiemTra') a.pending++;
          else if (x.TrangThai === 'DaDuyet') a.approved++;
          return a;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      }

      if (isTech && rest.length >= 3) {
        console.log('Processing technician data...', rest);
        
        // Sự cố
        let incidents = rest[0].data.data || [];
        if (!Array.isArray(incidents)) incidents = [];
        console.log('Incidents:', incidents);
        
        const pendingIncidents = incidents.filter(i => 
          i.TrangThai === 'DangXuLy' || i.TrangThai === 'ChoXuLy'
        );
        techStats.pendingIncidents = pendingIncidents.length;
        techStats.recentIncidents = pendingIncidents.slice(0, 5);

        // Chỉ số chờ ghi
        let readings = rest[1].data.data || [];
        if (!Array.isArray(readings)) readings = [];
        console.log('Readings:', readings);
        
        const pendingReadings = readings.filter(r => r.TrangThai === 'ChoGhi');
        techStats.pendingReadings = pendingReadings.length;
        techStats.recentReadings = pendingReadings.slice(0, 5);

        // Tài sản hỏng
        let assets = rest[2].data.data || [];
        if (!Array.isArray(assets)) assets = [];
        console.log('Assets:', assets);
        
        techStats.brokenAssets = assets.filter(a => 
          a.TrangThai === 'Hong' || a.TrangThai === 'CanSuaChua'
        ).length;
        
        console.log('Tech Stats:', techStats);
      }

      setStats({ 
        apartments: aptStats, 
        contracts: contractStats, 
        invoices: invoiceStats, 
        requests: requestStats, 
        users: userStats,
        technician: techStats
      });
      setRecentContracts(recentC);
      setRecentRequests(recentR);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== CONDITIONAL RENDERS =====
  
  // Nếu không có user, return null
  if (!user) {
    return null;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4"></div>
        </div>
        <p className="text-gray-700 font-medium">Đang tải dữ liệu...</p>
        <p className="text-gray-500 text-sm mt-1">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );

  const isAdmin = role === 'QuanLy';
  const isAccountant = role === 'KeToan';
  const isOwner = role === 'ChuNha';
  const isTenant = role === 'NguoiThue';
  const isTech = role === 'NhanVienKyThuat';

  console.log('Role check:', { role, isAdmin, isAccountant, isOwner, isTenant, isTech });

  // TEST: Render đơn giản trước
  if (isTech) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Xin chào, {user?.HoTen}!
            </h1>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Sự cố */}
            <div 
              onClick={() => navigate('/incidents')}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="bg-red-600 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-opacity-80 text-sm font-medium">Sự Cố</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats?.technician?.pendingIncidents || 0}
                </p>
                <p className="text-white text-opacity-75 text-sm">Đang chờ xử lý</p>
              </div>
            </div>

            {/* Chỉ số chờ ghi */}
            <div 
              onClick={() => navigate('/meter-reading')}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="bg-blue-600 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-opacity-80 text-sm font-medium">Chỉ Số</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats?.technician?.pendingReadings || 0}
                </p>
                <p className="text-white text-opacity-75 text-sm">Chờ ghi điện nước</p>
              </div>
            </div>

            {/* Tài sản hỏng */}
            <div 
              onClick={() => navigate('/assets')}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="bg-amber-500 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-opacity-80 text-sm font-medium">Tài Sản</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats?.technician?.brokenAssets || 0}
                </p>
                <p className="text-white text-opacity-75 text-sm">Cần sửa chữa</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Thao Tác Nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/meter-reading')}
                className="group p-6 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all text-center"
              >
                <p className="font-semibold text-gray-800 text-base mb-1">Ghi Chỉ Số</p>
                <p className="text-sm text-gray-600">Điện nước hàng tháng</p>
              </button>

              <button
                onClick={() => navigate('/incidents')}
                className="group p-6 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all text-center"
              >
                <p className="font-semibold text-gray-800 text-base mb-1">Xử Lý Sự Cố</p>
                <p className="text-sm text-gray-600">Sửa chữa & bảo trì</p>
              </button>

              <button
                onClick={() => navigate('/assets')}
                className="group p-6 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all text-center"
              >
                <p className="font-semibold text-gray-800 text-base mb-1">Quản Lý Tài Sản</p>
                <p className="text-sm text-gray-600">Kiểm tra & cập nhật</p>
              </button>
            </div>
          </div>

          {/* Work Summary */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sự cố gần đây */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>🔧</span>
                  <span>Sự Cố Cần Xử Lý</span>
                </h3>
                <button 
                  onClick={() => navigate('/incidents')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Xem tất cả →
                </button>
              </div>
              
              {(!stats?.technician?.recentIncidents || stats.technician.recentIncidents.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">✅</div>
                  <p className="text-gray-500 font-medium">Không có sự cố đang chờ</p>
                  <p className="text-sm text-gray-400 mt-1">Tuyệt vời! Mọi thứ đang hoạt động tốt</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.technician.recentIncidents.slice(0, 5).map((incident, idx) => (
                    <div 
                      key={incident.ID || idx} 
                      className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {incident.TieuDe || 'Sự cố'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Căn hộ: {incident.canho?.MaCanHo || 'N/A'} • {incident.TrangThai}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/incidents')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Xử lý
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chỉ số chờ ghi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📊</span>
                  <span>Chỉ Số Chờ Ghi</span>
                </h3>
                <button 
                  onClick={() => navigate('/meter-reading')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Xem tất cả →
                </button>
              </div>
              
              {(!stats?.technician?.recentReadings || stats.technician.recentReadings.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">✅</div>
                  <p className="text-gray-500 font-medium">Không có chỉ số chờ ghi</p>
                  <p className="text-sm text-gray-400 mt-1">Đã hoàn thành hết công việc</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.technician.recentReadings.slice(0, 5).map((reading, idx) => (
                    <div 
                      key={reading.ID || idx} 
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          Căn hộ {reading.canho?.MaCanHo || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Kỳ: {reading.ThangNam || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/meter-reading')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Ghi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Nếu không match role nào, hiển thị thông báo
  if (!isAdmin && !isAccountant && !isOwner && !isTenant && !isTech) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vai trò không hợp lệ</h2>
          <p className="text-gray-600 mb-4">Role hiện tại: {role || 'undefined'}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Xin chào, {user?.HoTen}!
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={fetchDashboardData} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm text-gray-600 shadow-soft hover:shadow-hover transition-all">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* ===== ADMIN / QUANLY ===== */}
        {isAdmin && (
          <>
            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Căn Hộ" value={stats.apartments.total}
                sub={`Trống: ${stats.apartments.available} | Thuê: ${stats.apartments.rented}`}
                color="from-primary-300 to-primary-500" icon="🏢" link="/apartments" navigate={navigate} />
              <StatCard title="Hợp Đồng" value={stats.contracts.total}
                sub={`Đang thuê: ${stats.contracts.active} | Chờ ký: ${stats.contracts.pending}`}
                color="from-indigo-500 to-indigo-600" icon="📄" link="/hopdong" navigate={navigate} />
              <StatCard title="Yêu Cầu Thuê" value={stats.requests.pending}
                sub="Đang chờ duyệt"
                color="from-amber-500 to-orange-500" icon="📋" link="/yeucauthue" navigate={navigate} />
              <StatCard title="Công Nợ" value={formatCurrency(stats.invoices.totalUnpaid)}
                sub={`${stats.invoices.unpaid} hóa đơn chưa TT`}
                color="from-red-500 to-rose-600" icon="💰" link="/hoadon-all" navigate={navigate} />
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-soft p-5 border-l-4 border-primary-500">
                <p className="text-sm text-gray-500 font-medium">Hóa đơn đã TT</p>
                <p className="text-3xl font-bold text-primary-600">{stats.invoices.paid}</p>
              </div>
              <div className="bg-white rounded-xl shadow-soft p-5 border-l-4 border-red-500">
                <p className="text-sm text-gray-500 font-medium">Hóa đơn quá hạn</p>
                <p className="text-3xl font-bold text-red-600">{stats.invoices.overdue}</p>
              </div>
              <div className="bg-white rounded-xl shadow-soft p-5 border-l-4 border-orange-500">
                <p className="text-sm text-gray-500 font-medium">HĐ sắp hết hạn</p>
                <p className="text-3xl font-bold text-orange-600">{stats.contracts.expiringSoon}</p>
              </div>
              <div className="bg-white rounded-xl shadow-soft p-5 border-l-4 border-purple-500">
                <p className="text-sm text-gray-500 font-medium">Tỷ lệ lấp đầy</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.apartments.total > 0
                    ? Math.round((stats.apartments.rented / stats.apartments.total) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Tables */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Requests */}
              <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>Yêu Cầu Chờ Duyệt</span>
                  </h2>
                  <button onClick={() => navigate('/yeucauthue')} className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline flex items-center gap-1">
                    Xem tất cả
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="font-medium">Không có yêu cầu chờ duyệt</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRequests.map(r => (
                      <div key={r.ID} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">Căn hộ {r.canho?.MaCanHo}</p>
                        </div>
                        <button
                          onClick={() => navigate('/yeucauthue')}
                          className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600"
                        >
                          Duyệt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Contracts */}
              <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span>Hợp Đồng Gần Đây</span>
                  </h2>
                  <button onClick={() => navigate('/hopdong')} className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline flex items-center gap-1">
                    Xem tất cả
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {recentContracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="font-medium">Chưa có hợp đồng</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentContracts.map(c => {
                      const statusColor = { DangThue: 'primary', ChoKy: 'yellow', KetThuc: 'gray', HetHan: 'red' }[c.TrangThai] || 'gray';
                      return (
                        <div key={c.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{c.nguoidung?.HoTen}</p>
                            <p className="text-xs text-gray-500">Căn hộ {c.canho?.MaCanHo} • {formatCurrency(c.GiaThue)}/tháng</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-800`}>
                            {c.TrangThai}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-soft p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>Thao Tác Nhanh</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Duyệt Yêu Cầu', icon: '📋', path: '/yeucauthue', color: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
                  { label: 'Tạo Hợp Đồng', icon: '📄', path: '/hopdong', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
                  { label: 'Duyệt Chỉ Số', icon: '📊', path: '/pending-readings', color: 'bg-primary-50 hover:bg-primary-100 border-primary-200' },
                  { label: 'Quản Lý Căn Hộ', icon: '🏢', path: '/apartments', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-4 rounded-xl border-2 ${a.color} transition-all text-left`}>
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== KE TOAN ===== */}
        {isAccountant && (
          <>
            {/* KPI Cards for Accountant */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Chỉ Số Chờ Duyệt" value={stats?.readings?.pending || 0}
                sub="Cần xác nhận"
                color="from-yellow-500 to-amber-600" icon="📊" link="/pending-readings" navigate={navigate} />
              <StatCard title="Hóa Đơn Chưa TT" value={stats.invoices.unpaid}
                sub={formatCurrency(stats.invoices.totalUnpaid)}
                color="from-red-500 to-rose-600" icon="💰" link="/hoadon-all" navigate={navigate} />
              <StatCard title="Hóa Đơn Đã TT" value={stats.invoices.paid}
                sub="Trong tháng"
                color="from-green-500 to-emerald-600" icon="✅" link="/hoadon-all" navigate={navigate} />
              <StatCard title="Hóa Đơn Quá Hạn" value={stats.invoices.overdue}
                sub="Cần nhắc nhở"
                color="from-orange-500 to-red-500" icon="⚠️" link="/hoadon-all" navigate={navigate} />
            </div>

            {/* Quick Actions for Accountant */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Duyệt Chỉ Số', icon: '📊', path: '/pending-readings', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                  { label: 'Quản Lý Hóa Đơn', icon: '💰', path: '/hoadon-all', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                  { label: 'Báo Cáo', icon: '📈', path: '/reports', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-4 rounded-xl border-2 ${a.color} transition-all text-left`}>
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== CHU NHA ===== */}
        {isOwner && (
          <>
            {/* KPI Cards for Owner - similar to Admin but simplified */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Căn Hộ" value={stats.apartments.total}
                sub={`Trống: ${stats.apartments.available} | Thuê: ${stats.apartments.rented}`}
                color="from-blue-500 to-blue-600" icon="🏢" link="/apartments" navigate={navigate} />
              <StatCard title="Yêu Cầu Thuê" value={stats.requests.pending}
                sub="Đang chờ duyệt"
                color="from-amber-500 to-orange-500" icon="📋" link="/yeucauthue" navigate={navigate} />
              <StatCard title="Doanh Thu" value={formatCurrency(stats.invoices.totalPaid || 0)}
                sub="Tháng này"
                color="from-green-500 to-emerald-600" icon="💰" link="/reports" navigate={navigate} />
              <StatCard title="Tỷ Lệ Lấp Đầy" 
                value={`${stats.apartments.total > 0 ? Math.round((stats.apartments.rented / stats.apartments.total) * 100) : 0}%`}
                sub={`${stats.apartments.rented}/${stats.apartments.total} căn`}
                color="from-purple-500 to-indigo-600" icon="📊" link="/apartments" navigate={navigate} />
            </div>

            {/* Quick Actions for Owner */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Duyệt Yêu Cầu', icon: '📋', path: '/yeucauthue', color: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
                  { label: 'Chuyển Nhượng', icon: '🔄', path: '/transfer-requests', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
                  { label: 'Nhân Sự', icon: '👥', path: '/staff-management', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                  { label: 'Báo Cáo', icon: '📈', path: '/reports', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-4 rounded-xl border-2 ${a.color} transition-all text-left`}>
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== NHAN VIEN KY THUAT ===== */}
        {isTech && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard 
                title="Sự Cố Đang Xử Lý" 
                value={stats?.technician?.pendingIncidents || 0}
                sub="Cần xử lý ngay" 
                color="from-red-500 to-rose-600" 
                icon="🔧" 
                link="/incidents" 
                navigate={navigate} 
              />
              <StatCard 
                title="Chỉ Số Chờ Ghi" 
                value={stats?.technician?.pendingReadings || 0}
                sub="Điện nước cần ghi" 
                color="from-blue-500 to-blue-600" 
                icon="📊" 
                link="/meter-reading" 
                navigate={navigate} 
              />
              <StatCard 
                title="Tài Sản Hỏng" 
                value={stats?.technician?.brokenAssets || 0}
                sub="Cần sửa chữa" 
                color="from-amber-500 to-orange-600" 
                icon="⚠️" 
                link="/assets" 
                navigate={navigate} 
              />
            </div>

            {/* Recent Work */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Sự cố gần đây */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">🔧 Sự Cố Cần Xử Lý</h2>
                  <button onClick={() => navigate('/incidents')} className="text-sm text-blue-600 hover:underline">
                    Xem tất cả
                  </button>
                </div>
                {(!stats?.technician?.recentIncidents || stats.technician.recentIncidents.length === 0) ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">✅</div>
                    <p>Không có sự cố đang chờ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.technician.recentIncidents.map(incident => (
                      <div key={incident.ID} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {incident.TieuDe || 'Sự cố'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Căn hộ: {incident.canho?.MaCanHo || 'N/A'} • {incident.TrangThai}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/incidents')}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                        >
                          Xử lý
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chỉ số chờ ghi */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">📊 Chỉ Số Chờ Ghi</h2>
                  <button onClick={() => navigate('/meter-reading')} className="text-sm text-blue-600 hover:underline">
                    Xem tất cả
                  </button>
                </div>
                {(!stats?.technician?.recentReadings || stats.technician.recentReadings.length === 0) ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">✅</div>
                    <p>Không có chỉ số chờ ghi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.technician.recentReadings.map(reading => (
                      <div key={reading.ID} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            Căn hộ {reading.canho?.MaCanHo || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Kỳ: {reading.ThangNam || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/meter-reading')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600"
                        >
                          Ghi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Ghi Chỉ Số Điện Nước', icon: '📊', path: '/meter-reading', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                  { label: 'Xử Lý Sự Cố', icon: '🔧', path: '/incidents', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
                  { label: 'Quản Lý Tài Sản', icon: '📦', path: '/assets', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-6 rounded-xl border-2 ${a.color} transition-all text-center`}>
                    <div className="text-3xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
