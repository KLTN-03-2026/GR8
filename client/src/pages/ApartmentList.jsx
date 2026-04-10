import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import api from "../api/axios.js";

const { Title } = Typography;
const { Option } = Select;

const formatVND = (value) => {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
};

const statusColor = {
  Trống: "green",
  DaThue: "red",
  BaoTri: "orange",
};

const ApartmentList = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/apartments");
      setApartments(response.data.data || response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách căn hộ:", error);
      message.error("Không thể tải dữ liệu căn hộ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleCreate = async (values) => {
    try {
      setSaving(true);

      const dataToSend = {
        MaCanHo: values.MaCanHo,
        Tang: parseInt(values.Tang, 10),
        SoPhong: String(values.SoPhong),
        DienTich:
          values.DienTich != null ? parseFloat(values.DienTich) : undefined,
        GiaThue: parseFloat(values.GiaThue),
        TienCoc:
          values.TienCoc != null ? parseFloat(values.TienCoc) : undefined,
        TrangThai: values.TrangThai,
        ChuNhaID: 1,
        ToaNhaID: 1,
      };

      console.log("Dữ liệu chuẩn bị gửi:", dataToSend);

      await api.post("/apartments", dataToSend);

      message.success("Thêm căn hộ thành công");
      form.resetFields();
      setModalOpen(false);
      fetchApartments();
    } catch (error) {
      console.error("Lỗi khi tạo căn hộ:", error);
      message.error("Thêm căn hộ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Mã căn hộ",
      dataIndex: "MaCanHo",
      key: "MaCanHo",
    },
    {
      title: "Tầng",
      dataIndex: "Tang",
      key: "Tang",
      render: (value) => (value ?? "-"),
    },
    {
      title: "Giá thuê",
      dataIndex: "GiaThue",
      key: "GiaThue",
      render: (value) => formatVND(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {status || "Không rõ"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={3} className="m-0">
            Danh sách căn hộ
          </Title>
          <p className="text-sm text-gray-600">
            Quản lý và thêm mới các căn hộ hiện có.
          </p>
        </div>

        <Button type="primary" onClick={() => setModalOpen(true)}>
          Thêm căn hộ
        </Button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <Table
          rowKey={(record) => record.ID || record.MaCanHo}
          columns={columns}
          dataSource={apartments}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div className="text-center">
                <p>Không có căn hộ để hiển thị.</p>
                <Button type="primary" onClick={fetchApartments}>
                  Tải lại
                </Button>
              </div>
            ),
          }}
        />
      </div>

      <Modal
        title="Thêm căn hộ mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Lưu"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ TrangThai: "Trong" }}
        >
          <Form.Item
            label="Mã căn hộ"
            name="MaCanHo"
            rules={[{ required: true, message: "Vui lòng nhập mã căn hộ" }]}
          >
            <Input placeholder="Nhập mã căn hộ" />
          </Form.Item>

          <Form.Item
            label="Tầng"
            name="Tang"
            rules={[{ required: true, message: "Vui lòng nhập tầng" }]}
          >
            <InputNumber className="w-full" min={0} placeholder="Nhập tầng" />
          </Form.Item>

          <Form.Item
            label="Số phòng"
            name="SoPhong"
            rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
          >
            <Input placeholder="Nhập số phòng" />
          </Form.Item>

          <Form.Item
            label="Diện tích"
            name="DienTich"
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Nhập diện tích (m²)"
            />
          </Form.Item>

          <Form.Item
            label="Giá thuê"
            name="GiaThue"
            rules={[{ required: true, message: "Vui lòng nhập giá thuê" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\D/g, "")}
              placeholder="Nhập giá thuê"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="TrangThai"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Trong">Trống</Option>
              <Option value="DaThue">DaThue</Option>
              <Option value="BaoTri">BaoTri</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApartmentList;