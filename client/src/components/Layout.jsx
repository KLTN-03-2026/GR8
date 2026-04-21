import React from "react";
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/",
      label: "Trang chủ",
    },
    {
      key: "/apartments",
      label: "Căn hộ",
    },
    {
      key: "/amenities",
      label: "Tiện ích",
    },
    {
      key: "/assets",
      label: "Tài sản",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
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
                <span style={{ color: "white" }}>
                  {user.HoTen} ({user.VaiTro || "User"})
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
