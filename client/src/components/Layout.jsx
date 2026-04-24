import React from "react";
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Role-based menu items configuration
  const getRoleBasedMenuItems = (role) => {
    const allItems = {
      home:              { key: "/",                label: "Trang chủ" },
      dashboard:         { key: "/dashboard",       label: "Dashboard" },
      // Admin
      apartments:        { key: "/apartments",      label: "Căn hộ" },
      amenities:         { key: "/amenities",       label: "Tiện ích" },
      assets:            { key: "/assets",          label: "Tài sản" },
      users:             { key: "/users",           label: "Người dùng" },
      contracts:         { key: "/contracts",       label: "Hợp đồng" },
      rentalRequests:    { key: "/yeucauthue",      label: "Yêu cầu thuê" },
      invoiceAll:        { key: "/hoadon-all",      label: "Hóa đơn" },
      // Billing
      meterReading:      { key: "/meter-reading",   label: "Ghi chỉ số" },
      pendingReadings:   { key: "/pending-readings",label: "Duyệt chỉ số" },
      // Tenant
      browseApartments:  { key: "/browse-apartments",   label: "Tìm căn hộ" },
      myRentalRequests:  { key: "/my-rental-requests",  label: "Yêu cầu của tôi" },
      myContracts:       { key: "/my-contracts",        label: "Hợp đồng" },
      myInvoices:        { key: "/my-invoices",         label: "Hóa đơn" },
    };

    const roleMenus = {
      QuanLy: [
        allItems.home, allItems.dashboard,
        allItems.apartments, allItems.amenities, allItems.assets,
        allItems.rentalRequests, allItems.contracts,
        allItems.meterReading, allItems.pendingReadings, allItems.invoiceAll,
        allItems.users,
      ],
      KeToan: [
        allItems.home, allItems.dashboard,
        allItems.pendingReadings, allItems.invoiceAll,
      ],
      NhanVienKyThuat: [
        allItems.home, allItems.dashboard,
        allItems.meterReading, allItems.assets,
      ],
      ChuNha: [
        allItems.home, allItems.dashboard,
      ],
      NguoiThue: [
        allItems.home, allItems.dashboard,
        allItems.browseApartments, allItems.myRentalRequests,
        allItems.myContracts, allItems.myInvoices,
      ],
      KhachVangLai: [
        allItems.home,
        allItems.browseApartments, allItems.myRentalRequests,
      ],
    };

    return roleMenus[role] || [allItems.home, allItems.dashboard];
  };

  const menuItems = user ? getRoleBasedMenuItems(user.roles?.TenVaiTro || user.VaiTro) : [];

  const getRoleLabel = (role) => {
    const roleLabels = {
      KeToan: "Kế Toán",
      NhanVienKyThuat: "Nhân Viên Kỹ Thuật",
      QuanLy: "Quản Lý",
      ChuNha: "Chủ Nhà",
      NguoiThue: "Người Thuê",
      KhachVangLai: "Khách Vãng Lai",
    };
    return roleLabels[role] || "Người Dùng";
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      danger: true,
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#001529",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            style={{
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              marginRight: "40px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            🏢 Quản lý Chung cư
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>

        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar style={{ backgroundColor: "#1890ff" }}>
                  {user.HoTen?.charAt(0) || "U"}
                </Avatar>
                <span style={{ color: "white", fontSize: "14px" }}>
                  <div>{user.HoTen}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {getRoleLabel(user.roles?.TenVaiTro || user.VaiTro)}
                  </div>
                </span>
              </div>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </Header>

      <Content style={{ padding: "24px", minHeight: "calc(100vh - 134px)" }}>
        <div style={{ background: "#fff", padding: "24px", minHeight: "100%" }}>
          {children}
        </div>
      </Content>

      <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
        Apartment Management System ©2024
      </Footer>
    </AntLayout>
  );
};

export default Layout;
