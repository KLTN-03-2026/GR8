// client/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Row, Col, Tag, Spin, Empty, Rate } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/home.css';

const Home = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApartments, setFilteredApartments] = useState([]);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/apartments');
      let data = response.data.data || [];
      
      // Ensure array
      if (!Array.isArray(data)) {
        data = data.items || data.apartments || [];
      }
      
      // Filter only available apartments and limit to 6
      const availableApts = data.filter(apt => apt.TrangThai === 'Trong').slice(0, 6);
      setApartments(availableApts);
      setFilteredApartments(availableApts);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setApartments([]);
      setFilteredApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = apartments.filter(apt =>
      apt.MaCanHo?.toLowerCase().includes(value.toLowerCase()) ||
      apt.SoPhong?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredApartments(filtered);
  };

  const handleNavigateToApartments = () => {
    window.location.href = '/apartments';
  };

  const getStatusBadge = (index) => {
    if (index === 0) return <Tag color="#ff4d4f">HOT</Tag>;
    if (index === 1) return <Tag color="#faad14">NEW</Tag>;
    if (index === 2) return <Tag color="#ff4d4f">HOT</Tag>;
    return null;
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">TÌM KIẾM CĂN HỘ CHO THUÊ</h1>
          <p className="hero-subtitle">CHUYÊN TRANG CĂN HỘ TẠI QUẬN 7</p>
          
          {/* Search Bar */}
          <div className="hero-search">
            <Input
              placeholder="Tìm kiếm căn hộ..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              className="search-button"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Apartments Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">CĂN HỘ CHO THUÊ NỔI BẬT</h2>
          <div className="title-divider"></div>
          <p className="section-subtitle">Những căn hộ nổi bật tại quận 7</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : filteredApartments.length === 0 ? (
          <Empty 
            description="Không có căn hộ nào phù hợp" 
            style={{ padding: '50px' }}
          />
        ) : (
          <Row gutter={[24, 24]} className="apartments-grid">
            {filteredApartments.map((apt, index) => (
              <Col xs={24} sm={12} lg={8} key={apt.ID}>
                <Card
                  hoverable
                  className="apartment-card"
                  cover={
                    <div className="card-image-container">
                      <div 
                        className="card-image"
                        style={{
                          backgroundImage: `url('https://via.placeholder.com/400x300?text=${apt.MaCanHo}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                      <div className="card-badge">
                        {getStatusBadge(index)}
                      </div>
                    </div>
                  }
                >
                  <div className="card-body">
                    <h3 className="apartment-code">{apt.MaCanHo}</h3>
                    
                    <div className="apartment-info">
                      <p><span className="label">Phòng:</span> {apt.SoPhong}</p>
                      <p><span className="label">Tầng:</span> {apt.Tang}</p>
                      <p><span className="label">Diện tích:</span> {apt.DienTich} m²</p>
                    </div>

                    <div className="apartment-pricing">
                      <div className="price-item">
                        <span className="price-label">Giá thuê:</span>
                        <span className="price-value">{formatCurrency(apt.GiaThue)}/tháng</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Tiền cọc:</span>
                        <span className="price-value">{formatCurrency(apt.TienCoc)}</span>
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      className="view-detail-btn"
                      onClick={handleNavigateToApartments}
                    >
                      Xem Chi Tiết
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* View All Button */}
        <div className="view-all-container">
          <Button 
            size="large" 
            className="view-all-btn"
            onClick={handleNavigateToApartments}
          >
            Xem Tất Cả Căn Hộ
          </Button>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <div className="info-card">
              <div className="info-icon">🏢</div>
              <h3>Căn Hộ Chất Lượng</h3>
              <p>Hàng trăm căn hộ được lựa chọn kỹ càng</p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Tìm Kiếm Nhanh</h3>
              <p>Hệ thống tìm kiếm mạnh mẽ và dễ sử dụng</p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="info-card">
              <div className="info-icon">✓</div>
              <h3>Thông Tin Minh Bạch</h3>
              <p>Toàn bộ thông tin cập nhật hàng ngày</p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="info-card">
              <div className="info-icon">💬</div>
              <h3>Hỗ Trợ 24/7</h3>
              <p>Đội ngũ hỗ trợ sẵn sàng giúp đỡ</p>
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default Home;
