import React, { useState } from "react";
import { Form, Input, Button, Card, message, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      await login({
        TenDangNhapOrEmail: values.username,
        MatKhau: values.password,
      });
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    setLoading(true);
    try {
      await register({
        TenDangNhap: values.username,
        MatKhau: values.password,
        HoTen: values.fullName,
        Email: values.email,
        SoDienThoai: values.phone,
      });
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
    } catch (error) {
      message.error(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form onFinish={onLogin} layout="vertical" size="large">
      <Form.Item
        name="username"
        label="Tên đăng nhập hoặc Email"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập hoặc email!" }]}
      >
        <Input placeholder="Tên đăng nhập hoặc Email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form onFinish={onRegister} layout="vertical" size="large">
      <Form.Item
        name="username"
        label="Tên đăng nhập"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
      >
        <Input placeholder="Tên đăng nhập" />
      </Form.Item>

      <Form.Item
        name="fullName"
        label="Họ và tên"
        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
      >
        <Input placeholder="Họ và tên" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item name="phone" label="Số điện thoại (tùy chọn)">
        <Input placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu!" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
        ]}
      >
        <Input.Password placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu không khớp!"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Xác nhận mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        title={
          <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
            🏢 Quản lý Chung cư
          </div>
        }
      >
        <Tabs
          defaultActiveKey="login"
          items={[
            { key: "login", label: "Đăng nhập", children: loginForm },
            { key: "register", label: "Đăng ký", children: registerForm },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
