// Shared header dùng cho tất cả trang
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

export const ROLE_MENUS = {
  QuanLy: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Căn hộ", path: "/apartments" },
    { label: "Tiện ích", path: "/amenities" },
    { label: "Tài sản", path: "/assets" },
    { label: "Dịch vụ", path: "/services" },
    { label: "Yêu cầu thuê", path: "/yeucauthue" },
    { label: "Hợp đồng", path: "/contracts" },
    { label: "Quản lý sự cố", path: "/assign-incidents" },
    // { label: "Lịch trực", path: "/duty-schedule" }, // Đã tắt để giảm test case
    { label: "Ghi chỉ số", path: "/meter-reading" },
    { label: "Hóa đơn", path: "/hoadon-all" },
    { label: "Người dùng", path: "/users" },
    { label: "Hồ sơ", path: "/profile" },
  ],
  KeToan: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Duyệt chỉ số", path: "/pending-readings" },
    { label: "Hóa đơn", path: "/hoadon-all" },
    { label: "Hồ sơ", path: "/profile" },
  ],
  NhanVienKyThuat: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Công việc", path: "/staff/work" },
    { label: "Ghi chỉ số", path: "/meter-reading" },
    { label: "Hồ sơ", path: "/profile" },
  ],
  ChuNha: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Nhân sự", path: "/staff-management" },
    { label: "Báo cáo & Thống kê", path: "/owner-reports" },
    { label: "Hồ sơ", path: "/profile" },
  ],
  NguoiThue: [
    { label: "Trang chủ", path: "/" },
    { label: "Căn hộ của tôi", path: "/my-apartment" },
    { label: "Tìm căn hộ", path: "/browse-apartments" },
    { label: "Yêu thích", path: "/favorite-apartments" },
    { label: "Yêu cầu thuê", path: "/my-rental-requests" },
    { label: "Chuyển nhượng", path: "/my-transfers" },
    { label: "Hồ sơ", path: "/profile" },
  ],
  KhachVangLai: [
    { label: "Trang chủ", path: "/" },
    { label: "Căn hộ của tôi", path: "/my-apartment" },
    { label: "Tìm căn hộ", path: "/browse-apartments" },
    { label: "Yêu thích", path: "/favorite-apartments" },
    { label: "Yêu cầu thuê", path: "/my-rental-requests" },
    { label: "Hồ sơ", path: "/profile" },
  ],
};

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  const roleMenu = user
    ? ROLE_MENUS[user.roles?.TenVaiTro || user.VaiTro] || []
    : [];
  const isTenant = user && ['NguoiThue', 'KhachVangLai'].includes(user.roles?.TenVaiTro || user.VaiTro);
  const isHome = location.pathname === "/";

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    
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
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: "#2E8B5E",
            cursor: "pointer",
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#A8E6CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#A8E6CF" fillOpacity="0.2"/>
            <path d="M9 22V12H15V22" stroke="#2E8B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          SMARTBUILDING
        </div>

        {/* Breadcrumb path khi không ở trang chủ */}

        {/* Auth area */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/notifications')}
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Thông báo"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#333' }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff4d4f',
                      color: '#fff',
                      borderRadius: '50%',
                      width: unreadCount > 9 ? '20px' : '18px',
                      height: unreadCount > 9 ? '20px' : '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: '2px solid #fff',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <div
              ref={menuRef}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Hiển thị tên người dùng */}
              <span style={{ fontSize: 14, color: "#333" }}>
                Xin chào, <strong>{user.HoTen}</strong>
              </span>

              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  background: menuOpen ? "#A8E6CF" : "transparent",
                  border: "2px solid #A8E6CF",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: "all 0.2s",
                }}
                title="Menu"
              >
                <span
                  style={{
                    display: "block",
                    width: 20,
                    height: 2.5,
                    background: menuOpen ? "#2E8B5E" : "#4CAF7A",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: 20,
                    height: 2.5,
                    background: menuOpen ? "#2E8B5E" : "#4CAF7A",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: 20,
                    height: 2.5,
                    background: menuOpen ? "#2E8B5E" : "#4CAF7A",
                    borderRadius: 2,
                  }}
                />
              </button>

              {/* Dropdown menu - giống nhau cho tất cả */}
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 210,
                    zIndex: 999,
                    border: "1px solid #e8e8e8",
                    overflow: "hidden",
                  }}
                >
                  {roleMenu.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        background:
                          location.pathname === item.path
                            ? "#F0FDF4"
                            : "transparent",
                        border: "none",
                        borderBottom: "1px solid #E5E7EB",
                        cursor: "pointer",
                        fontSize: 14,
                        color:
                          location.pathname === item.path ? "#2E8B5E" : "#4B5563",
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }}
                      onMouseEnter={(e) => {
                        if (location.pathname !== item.path)
                          e.currentTarget.style.background = "#f9f9f9";
                      }}
                      onMouseLeave={(e) => {
                        if (location.pathname !== item.path)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "#ff4d4f",
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fff1f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "transparent",
                  color: "#2E8B5E",
                  border: "2px solid #A8E6CF",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F0FDF4";
                  e.currentTarget.style.borderColor = "#4CAF7A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#A8E6CF";
                }}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/login?tab=register")}
                style={{
                  background: "linear-gradient(135deg, #A8E6CF 0%, #4CAF7A 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  boxShadow: "0 2px 8px rgba(168, 230, 207, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(168, 230, 207, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(168, 230, 207, 0.3)";
                }}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
