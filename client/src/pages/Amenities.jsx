import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../api/axios";

const { TextArea } = Input;

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tienich");
      setAmenities(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách tiện ích!");
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
      content: "Bạn có chắc chắn muốn xóa tiện ích này?",
      onOk: async () => {
        try {
          await api.delete(`/tienich/${id}`);
          message.success("Xóa tiện ích thành công!");
          fetchAmenities();
        } catch (error) {
          message.error(error.response?.data?.message || "Xóa thất bại!");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/tienich/${editingId}`, values);
        message.success("Cập nhật tiện ích thành công!");
      } else {
        await api.post("/tienich", values);
        message.success("Thêm tiện ích thành công!");
      }
      setModalVisible(false);
      fetchAmenities();
    } catch (error) {
      message.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: 80,
    },
    {
      title: "Tên tiện ích",
      dataIndex: "TenTienIch",
      key: "TenTienIch",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "MoTa",
      key: "MoTa",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
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
        <h1>Quản lý Tiện ích</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tiện ích
        </Button>
      </div>

      <Card>
        <p style={{ marginBottom: 16, color: "#666" }}>
          Quản lý các tiện ích có thể gán cho căn hộ như: Điều hòa, Tủ lạnh, Máy giặt, Wifi, Bãi đỗ xe, Hồ bơi, Gym...
        </p>
      </Card>

      <Table
        columns={columns}
        dataSource={amenities}
        rowKey="ID"
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingId ? "Sửa tiện ích" : "Thêm tiện ích"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="TenTienIch"
            label="Tên tiện ích"
            rules={[{ required: true, message: "Vui lòng nhập tên tiện ích!" }]}
          >
            <Input placeholder="VD: Điều hòa, Tủ lạnh, Wifi..." />
          </Form.Item>

          <Form.Item name="MoTa" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả chi tiết về tiện ích..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Amenities;
