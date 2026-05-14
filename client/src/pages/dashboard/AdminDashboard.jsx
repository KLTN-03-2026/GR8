import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios'; // We keep using their configured axios
import { formatCurrency } from '../../utils/formatCurrency';

const { Title } = Typography;

const fetchDashboardStats = async () => {
  const [aptsRes, contractsRes, invoicesRes] = await Promise.all([
    axios.get('/apartments').catch(() => ({ data: { data: [] } })),
    axios.get('/hopdong').catch(() => ({ data: { data: [] } })),
    axios.get('/hoadon').catch(() => ({ data: { data: [] } }))
  ]);

  const apartments = aptsRes.data.data?.items || aptsRes.data.data || [];
  const contracts = contractsRes.data.data || [];
  const invoices = invoicesRes.data.data?.items || invoicesRes.data.data || [];

  return {
    apartments: Array.isArray(apartments) ? apartments : [],
    contracts: Array.isArray(contracts) ? contracts : [],
    invoices: Array.isArray(invoices) ? invoices : []
  };
};

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (error) return <div>Đã xảy ra lỗi khi tải dữ liệu Dashboard!</div>;

  const { apartments, contracts, invoices } = data;

  const totalApts = apartments.length;
  const rentedApts = apartments.filter(a => a.TrangThai === 'DaThue').length;
  const activeContracts = contracts.filter(c => c.TrangThai === 'DangThue').length;
  const totalUnpaid = invoices.filter(i => i.TrangThai !== 'DaTT').reduce((sum, i) => sum + Number(i.TongTien || 0), 0);

  const columns = [
    { title: 'Căn hộ', dataIndex: ['canho', 'MaCanHo'], key: 'canho' },
    { title: 'Người thuê', dataIndex: ['nguoidung', 'HoTen'], key: 'nguoidung' },
    { title: 'Trạng thái', dataIndex: 'TrangThai', key: 'TrangThai' },
    { title: 'Giá thuê', dataIndex: 'GiaThue', key: 'GiaThue', render: (val) => formatCurrency(val) }
  ];

  return (
    <div>
      <Title level={2}>Dashboard Quản Lý</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Statistic title="Tổng Căn Hộ" value={totalApts} suffix={`(Đã thuê: ${rentedApts})`} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Hợp Đồng Đang Thuê" value={activeContracts} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#fff1f0' }}>
            <Statistic title="Tổng Công Nợ" value={totalUnpaid} formatter={(val) => formatCurrency(val)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f9f0ff' }}>
            <Statistic title="Tỷ Lệ Lấp Đầy" value={totalApts ? Math.round((rentedApts/totalApts)*100) : 0} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card title="Hợp Đồng Gần Đây" bordered={false}>
        <Table 
          dataSource={contracts.slice(0, 5)} 
          columns={columns} 
          rowKey="ID" 
          pagination={false} 
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
