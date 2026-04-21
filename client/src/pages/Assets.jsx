import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Space,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from "@ant-design/icons";
import api from "../api/axios";
import dayjs from "dayjs";

const { TextArea } = Input;

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAssets();
    fetchStats();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/taisan");
      setAssets(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách tài sản!");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/taisan/stats/thongke");
      setStats(response.data.data);
    } catch (error) {
      console.error("Không thể tải thống kê");
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      NgayMua: record.NgayMua ? dayjs(record.NgayMua) : null,
    });
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa tài sản này?",
      onOk: async () => {
        try {
          await api.delete(`/taisan/${id}`);
          message.success("Xóa tài sản thành công!");
          fetchAssets();
          fetchStats();
        } catch (error) {
          message.error(error.response?.data?.message || "Xóa thất bại!");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        NgayMua: values.NgayMua ? values.NgayMua.format("YYYY-MM-DD") : null,
      };

      if (editingId) {
        await api.put(`/taisan/${editingId}`, data);
        message.success("Cập nhật tài sản thành công!");
      } else {
        await api.post("/taisan", data);
        message.success("Thêm tài sản thành công!");
      }
      setModalVisible(false);
      fetchAssets();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã tài sản",
      dataIndex: "MaTaiSan",
      key: "MaTaiSan",
      width: 120,
    },
    {
      title: "Tên tài sản",
      dataIndex: "TenTaiSan",
      key: "TenTaiSan",
      width: 200,
    },
    {
      title: "Loại",
      dataIndex: "LoaiTaiSan",
      key: "LoaiTaiSan",
      width: 150,
      render: (type) => {
        const labels = {
          ThietBiChung: "Thiết bị chung",
          ThietBiCanHo: "Thiết bị căn hộ",
          NoiThat: "Nội thất",
          ThietBiDien: "Thiết bị điện",
          CoSoVatChat: "Cơ sở vật chất",
        };
        return labels[type] || type;
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "TinhTrang",
      key: "TinhTrang",
      width: 120,
      render: (status) => {
        const colors = {
          Tot: "green",
          Hong: "red",
          DangSua: "orange",
          Mat: "volcano",
          Cu: "default",
        };
        const labels = {
          Tot: "Tốt",
          Hong: "Hỏng",
          DangSua: "Đang sửa",
          Mat: "Mất",
          Cu: "Cũ",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Giá trị (VNĐ)",
      dataIndex: "GiaTri",
      key: "GiaTri",
      width: 150,
      render: (value) => new Intl.NumberFormat("vi-VN").format(value || 0),
    },
    {
      title: "Vị trí",
      dataIndex: "ViTri",
      key: "ViTri",
      width: 150,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
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
      <h1>Quản lý Tài sản</h1>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng số tài sản"
                value={stats.tongSoTaiSan}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giá trị"
                value={stats.tongGiaTri}
                suffix="VNĐ"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tài sản tốt"
                value={stats.theoTinhTrang?.find((t) => t.TinhTrang === "Tot")?._count?.ID || 0}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tài sản hỏng"
                value={stats.theoTinhTrang?.find((t) => t.TinhTrang === "Hong")?._count?.ID || 0}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <div />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tài sản
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={assets}
        rowKey="ID"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa tài sản" : "Thêm tài sản"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="MaTaiSan"
                label="Mã tài sản"
                rules={[{ required: true, message: "Vui lòng nhập mã tài sản!" }]}
              >
                <Input placeholder="VD: TS001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="TenTaiSan"
                label="Tên tài sản"
                rules={[{ required: true, message: "Vui lòng nhập tên tài sản!" }]}
              >
                <Input placeholder="VD: Điều hòa Daikin" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="LoaiTaiSan" label="Loại tài sản" initialValue="ThietBiChung">
                <Select>
                  <Select.Option value="ThietBiChung">Thiết bị chung</Select.Option>
                  <Select.Option value="ThietBiCanHo">Thiết bị căn hộ</Select.Option>
                  <Select.Option value="NoiThat">Nội thất</Select.Option>
                  <Select.Option value="ThietBiDien">Thiết bị điện</Select.Option>
                  <Select.Option value="CoSoVatChat">Cơ sở vật chất</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="TinhTrang" label="Tình trạng" initialValue="Tot">
                <Select>
                  <Select.Option value="Tot">Tốt</Select.Option>
                  <Select.Option value="Hong">Hỏng</Select.Option>
                  <Select.Option value="DangSua">Đang sửa</Select.Option>
                  <Select.Option value="Mat">Mất</Select.Option>
                  <Select.Option value="Cu">Cũ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="CanHoID" label="ID Căn hộ">
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Để trống nếu là thiết bị chung" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ToaNhaID" label="ID Tòa nhà">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="GiaTri" label="Giá trị (VNĐ)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="NgayMua" label="Ngày mua">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ViTri" label="Vị trí">
            <Input placeholder="VD: Phòng khách" />
          </Form.Item>

          <Form.Item name="NhaCungCap" label="Nhà cung cấp">
            <Input placeholder="VD: Điện máy Xanh" />
          </Form.Item>

          <Form.Item name="GhiChu" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú về tài sản..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Assets;
