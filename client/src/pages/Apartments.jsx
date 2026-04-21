import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag } from "antd";
import api from "../api/axios";

const { TextArea } = Input;

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching apartments...");
      const response = await api.get("/apartments", {
        params: {
          page: 1,
          limit: 10,
        },
      });
      console.log("✅ Response:", response.data);
      
      // Handle response format - could be items array or paginated object
      const data = response.data.data;
      if (data.items) {
        setApartments(data.items);
      } else if (Array.isArray(data)) {
        setApartments(data);
      } else {
        setApartments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching apartments:", error);
      message.error("Không thể tải danh sách căn hộ!");
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa căn hộ này?",
      onOk: async () => {
        try {
          await api.delete(`/apartments/${id}`);
          message.success("Xóa căn hộ thành công!");
          fetchApartments();
        } catch (error) {
          message.error(error.response?.data?.message || "Xóa thất bại!");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/apartments/${editingId}`, values);
        message.success("Cập nhật căn hộ thành công!");
      } else {
        await api.post("/apartments", values);
        message.success("Thêm căn hộ thành công!");
      }
      setModalVisible(false);
      fetchApartments();
    } catch (error) {
      message.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã căn hộ",
      dataIndex: "MaCanHo",
      key: "MaCanHo",
      width: 120,
    },
    {
      title: "Tầng",
      dataIndex: "Tang",
      key: "Tang",
      width: 80,
    },
    {
      title: "Số phòng",
      dataIndex: "SoPhong",
      key: "SoPhong",
      width: 100,
    },
    {
      title: "Diện tích (m²)",
      dataIndex: "DienTich",
      key: "DienTich",
      width: 120,
      render: (value) => value ? parseFloat(value).toFixed(2) : "-",
    },
    {
      title: "Giá thuê (VNĐ)",
      dataIndex: "GiaThue",
      key: "GiaThue",
      width: 150,
      render: (value) => new Intl.NumberFormat("vi-VN").format(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 120,
      render: (status) => {
        const colors = {
          Trong: "green",
          DaThue: "red",
          BaoTri: "orange",
          DangDon: "blue",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: "Người thuê",
      key: "nguoithue",
      width: 150,
      render: (_, record) => {
        const tenant = record.hopdong?.[0]?.nguoidung?.HoTen;
        return tenant || "-";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.ID)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <h1>Quản lý Căn hộ</h1>
        <Button type="primary" onClick={handleAdd}>
          + Thêm căn hộ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={apartments}
        rowKey="ID"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa căn hộ" : "Thêm căn hộ"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="MaCanHo"
            label="Mã căn hộ"
            rules={[{ required: true, message: "Vui lòng nhập mã căn hộ!" }]}
          >
            <Input placeholder="VD: A101" />
          </Form.Item>

          <Form.Item
            name="Tang"
            label="Tầng"
            rules={[{ required: true, message: "Vui lòng nhập tầng!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="SoPhong" label="Số phòng">
            <Input placeholder="VD: 3" />
          </Form.Item>

          <Form.Item name="DienTich" label="Diện tích (m²)">
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="GiaThue"
            label="Giá thuê (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá thuê!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="TienCoc" label="Tiền cọc (VNĐ)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="TrangThai" label="Trạng thái" initialValue="Trong">
            <Select>
              <Select.Option value="Trong">Trống</Select.Option>
              <Select.Option value="DaThue">Đã thuê</Select.Option>
              <Select.Option value="BaoTri">Bảo trì</Select.Option>
              <Select.Option value="DangDon">Đang dọn</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="MoTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả căn hộ..." />
          </Form.Item>

          <Form.Item name="ToaNhaID" label="ID Tòa nhà" initialValue={1}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Apartments;
