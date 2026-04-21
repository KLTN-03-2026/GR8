import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Chào mừng đến với Hệ thống Quản lý Chung cư</h1>
      {user && (
        <p style={{ fontSize: "16px", marginBottom: "24px" }}>
          Xin chào, <strong>{user.HoTen}</strong> ({user.VaiTro || "User"})
        </p>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Căn hộ"
              value={10}
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tài sản"
              value={150}
              styles={{ content: { color: "#cf1322" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiện ích"
              value={8}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={4}
              styles={{ content: { color: "#722ed1" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: "24px" }} title="Chức năng chính">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card hoverable>
              <h3>📋 Quản lý Căn hộ</h3>
              <p>Xem, thêm, sửa, xóa thông tin căn hộ</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable>
              <h3>🔧 Quản lý Tài sản</h3>
              <p>Theo dõi tài sản, thiết bị của tòa nhà và căn hộ</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable>
              <h3>✨ Quản lý Tiện ích</h3>
              <p>Quản lý các tiện ích đi kèm căn hộ</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Home;
