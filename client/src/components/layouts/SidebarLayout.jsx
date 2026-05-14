// client/src/components/layouts/SidebarLayout.jsx
// Professional sidebar layout inspired by Linear, Vercel, Notion

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, strokeWidth = 2 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
    <path d={d} />
  </svg>
);

const ICONS = {
  "/dashboard":        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  "/apartments":       "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  "/users":            "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  "/members":          "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "/yeucauthue":       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "/contracts":        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "/incidents":        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  "/assign-incidents": "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "/duty-schedule":    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "/staff/work":       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  "/amenities":        "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  "/services":         "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "/assets":           "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "/parking":          "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  "/transfer-requests":"M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  "/staff-management": "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  "/meter-reading":    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "/pending-readings": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  "/hoadon-all":       "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  "/reports":          "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  "/owner-reports":    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "/activity-log":     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "/chat":             "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  "/notifications":    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  "/browse-apartments":"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  "/my-rental-requests":"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  "/my-contracts":     "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "/my-transfers":     "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  "/my-invoices":      "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  "/my-assets":        "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "/my-services":      "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "/my-incidents":     "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  "/profile":          "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const DEFAULT_ICON = "M4 6h16M4 12h16M4 18h7";

// ── Menu config ───────────────────────────────────────────────────────────────
const MENU_CONFIG = {
  QuanLy: [
    { group: "Tổng quan", items: [{ key: "/dashboard", label: "Dashboard" }] },
    {
      group: "Quản lý",
      items: [
        { key: "/apartments",        label: "Căn hộ" },
        { key: "/users",             label: "Người dùng" },
        { key: "/members",           label: "Thành viên" },
        { key: "/yeucauthue",        label: "Yêu cầu thuê" },
        { key: "/contracts",         label: "Hợp đồng" },
        { key: "/assign-incidents",  label: "Quản lý sự cố" },
        // { key: "/duty-schedule",     label: "Lịch trực" }, // Đã tắt để giảm test case
        { key: "/amenities",         label: "Tiện ích" },
        { key: "/services",          label: "Dịch vụ" },
        { key: "/assets",            label: "Tài sản" },
        { key: "/parking",           label: "Bãi xe" },
        { key: "/transfer-requests", label: "Chuyển nhượng" },
        { key: "/staff-management",  label: "Nhân sự" },
      ],
    },
    {
      group: "Tài chính",
      items: [
        { key: "/hoadon-all",       label: "Hóa đơn" },
        { key: "/reports",          label: "Báo cáo" },
      ],
    },
    { group: "Hệ thống", items: [
      { key: "/activity-log", label: "Nhật ký hoạt động" },
      { key: "/notifications", label: "Gửi thông báo" }
    ] },
  ],
  KeToan: [
    { group: "Tổng quan", items: [{ key: "/dashboard", label: "Dashboard" }] },
    {
      group: "Tài chính",
      items: [
        { key: "/pending-readings", label: "Duyệt chỉ số" },
        { key: "/hoadon-all",       label: "Hóa đơn" },
        { key: "/reports",          label: "Báo cáo" },
      ],
    },
  ],
  NhanVienKyThuat: [
    { group: "Tổng quan", items: [{ key: "/dashboard", label: "Dashboard" }] },
    {
      group: "Công việc",
      items: [
        { key: "/meter-reading", label: "Ghi chỉ số" },
        { key: "/staff/work",    label: "Công việc" },
      ],
    },
  ],
  ChuNha: [
    {
      group: "Tổng quan",
      items: [
        { key: "/dashboard",  label: "Dashboard" },
        { key: "/apartments", label: "Căn hộ" },
      ],
    },
    {
      group: "Quản lý",
      items: [
        { key: "/staff-management",  label: "Nhân sự" },
      ],
    },
    { group: "Thống kê", items: [{ key: "/owner-reports", label: "Báo cáo & Thống kê" }] },
    { group: "Hệ thống", items: [
      { key: "/activity-log", label: "Nhật ký hoạt động" },
      { key: "/notifications", label: "Gửi thông báo" }
    ] },
  ],
  NguoiThue: [
    { group: "Tổng quan", items: [{ key: "/dashboard", label: "Dashboard" }] },
    {
      group: "Căn hộ",
      items: [
        { key: "/browse-apartments",   label: "Tìm căn hộ" },
        { key: "/my-rental-requests",  label: "Yêu cầu thuê" },
        { key: "/my-contracts",        label: "Hợp đồng" },
        { key: "/my-transfers",        label: "Chuyển nhượng" },
      ],
    },
    {
      group: "Tiện ích",
      items: [
        { key: "/my-invoices",  label: "Hóa đơn" },
        { key: "/my-assets",    label: "Tài sản căn hộ" },
        { key: "/my-services",  label: "Dịch vụ" },
        { key: "/my-incidents", label: "Sự cố" },
      ],
    },
  ],
};

const ROLE_LABELS = {
  QuanLy:           "Quản lý",
  KeToan:           "Kế toán",
  NhanVienKyThuat:  "Nhân viên kỹ thuật",
  ChuNha:           "Chủ nhà",
  NguoiThue:        "Người thuê",
  KhachVangLai:     "Khách vãng lai",
};

const ROLE_ACCENT = {
  QuanLy:           "#3b82f6", // blue
  KeToan:           "#8b5cf6", // violet
  NhanVienKyThuat:  "#f59e0b", // amber
  ChuNha:           "#10b981", // emerald
  NguoiThue:        "#06b6d4", // cyan
  KhachVangLai:     "#64748b", // slate
};

// ── Component ─────────────────────────────────────────────────────────────────
const SidebarLayout = ({ children }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemRequests, setSystemRequests] = useState({ total: 0, items: [] });
  const [sysReqOpen, setSysReqOpen] = useState(false);
  const [readRequests, setReadRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(`readSystemRequests_${user?.ID || user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const role       = user?.roles?.TenVaiTro || user?.VaiTro || "NguoiThue";
  const menuGroups = MENU_CONFIG[role] || MENU_CONFIG.NguoiThue;
  const accent     = ROLE_ACCENT[role] || "#06b6d4";
  const initials   = user?.HoTen?.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase() || "U";
  const avatarSrc  = user?.Avatar
    ? (user.Avatar.startsWith('http') ? user.Avatar : `http://localhost:5000${user.Avatar}`)
    : null;

  // Component avatar dùng chung
  const AvatarBox = ({ size = "w-9 h-9" }) => avatarSrc ? (
    <img
      src={avatarSrc}
      alt={user?.HoTen}
      className={`${size} rounded-lg object-cover flex-shrink-0`}
      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
    />
  ) : (
    <div
      className={`${size} rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
      style={{ backgroundColor: accent }}
    >
      {initials}
    </div>
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get('/thongbao/unread-count');
        setUnreadCount(res.data?.data?.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch system requests cho QuanLy/ChuNha/NhanVienKyThuat/KeToan
  useEffect(() => {
    if (!['QuanLy', 'ChuNha', 'NhanVienKyThuat', 'KeToan'].includes(role)) return;
    const fetchSystemReqs = async () => {
      try {
        const res = await axios.get('/thongbao/system-requests');
        setSystemRequests(res.data?.data || { total: 0 });
      } catch (err) {
        console.error('Failed to fetch system requests:', err);
      }
    };
    fetchSystemReqs();
    const interval = setInterval(fetchSystemReqs, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const handleMarkAsRead = (item) => {
    if (!readRequests.includes(item.id)) {
      const newRead = [...readRequests, item.id];
      setReadRequests(newRead);
      localStorage.setItem(`readSystemRequests_${user?.ID || user?.id}`, JSON.stringify(newRead));
    }
    navigate(item.link);
    setSysReqOpen(false);
  };

  const unreadCountUI = systemRequests.items?.filter(item => !readRequests.includes(item.id)).length || 0;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (key) => location.pathname === key;

  // Current page label for topbar breadcrumb
  const currentLabel = menuGroups.flatMap(g => g.items).find(i => i.key === location.pathname)?.label || "SmartBuilding";

  // ── Sidebar inner ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Logo + Brand */}
      <div className={`flex items-center gap-3 border-b border-gray-200 ${collapsed ? 'px-4 py-5' : 'px-5 py-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width={18} height={18} fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">SmartBuilding</h1>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý chung cư</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User Profile Card */}
        <div 
          className={`flex items-center gap-3 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left w-full ${collapsed ? 'px-4 py-4' : 'px-5 py-4'}`}
          onClick={() => navigate("/profile")}
          style={{ cursor: 'pointer' }}
        >
          <AvatarBox size="w-9 h-9" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.HoTen || "Người dùng"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[role] || role}</p>
            </div>
          )}
        </div>
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-nav">
        {menuGroups.map((group, groupIdx) => (
          <div key={group.group} className={groupIdx > 0 ? 'mt-6' : ''}>
            {!collapsed && (
              <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.group}</p>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    title={collapsed ? item.label : ''}
                    className={`
                      w-full flex items-center gap-3 rounded-lg transition-all
                      ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2'}
                      ${active 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon d={ICONS[item.key] || DEFAULT_ICON} size={20} strokeWidth={active ? 2 : 1.5} />
                    {!collapsed && (
                      <span className="text-sm font-medium flex-1 text-left truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom - Empty now, moved to header */}
      <div className={`border-t border-gray-200 ${collapsed ? 'px-3 py-3' : 'px-3 py-3'}`}>
        {/* Intentionally empty - logout moved to header */}
      </div>
    </div>
  );

  // ── Layout shell ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? 72 : 260 }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 h-16 bg-white border-b border-gray-200 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Icon d="M4 6h16M4 12h16M4 18h16" size={20} />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">{currentLabel}</h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {(['QuanLy', 'ChuNha', 'NhanVienKyThuat', 'KeToan'].includes(role)) ? (
              <div className="relative">
                <button
                  onClick={() => setSysReqOpen(!sysReqOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Yêu cầu cần xử lý"
                >
                  <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" size={20} />
                  {unreadCountUI > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {unreadCountUI > 9 ? '9+' : unreadCountUI}
                    </span>
                  )}
                </button>
                {sysReqOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSysReqOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <p className="text-sm font-bold text-gray-900">Yêu cầu hệ thống</p>
                        <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold">{unreadCountUI} mới</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {systemRequests.total === 0 || !systemRequests.items || systemRequests.items.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center">
                            <span className="text-3xl mb-2">🎉</span>
                            <span>Tuyệt vời! Không có yêu cầu nào đang chờ xử lý.</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {systemRequests.items.map((item) => {
                              const isUnread = !readRequests.includes(item.id);
                              return (
                                <button 
                                  key={item.id} 
                                  onClick={() => handleMarkAsRead(item)} 
                                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors group ${isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base shadow-sm group-hover:scale-110 transition-transform ${isUnread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {item.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold truncate mb-0.5 ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>{item.title}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(item.time).toLocaleString('vi-VN')}</p>
                                  </div>
                                  {isUnread && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Thông báo"
              >
                <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <AvatarBox size="w-9 h-9" />
                <Icon d="M19 9l-7 7-7-7" size={16} />
              </button>

              {/* Dropdown */}
              {profileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.HoTen}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[role] || role}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={16} />
                      Hồ sơ cá nhân
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Scrollbar style */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar { width: 6px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        .sidebar-nav::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};

export default SidebarLayout;