// client/src/pages/admin/MemberManagement.jsx
// Quản lý xem thành viên và người thuê theo căn hộ

import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const isSamePerson = (member, tenant) => {
  if (!member || !tenant) return false;
  if (tenant.CCCD && member.CCCD && tenant.CCCD === member.CCCD) return true;
  if (tenant.SoDienThoai && member.SoDienThoai && tenant.SoDienThoai === member.SoDienThoai) return true;
  if (tenant.HoTen && member.HoTen && tenant.NgaySinh && member.NgaySinh) {
    const tenantDob = new Date(tenant.NgaySinh).toISOString().slice(0, 10);
    const memberDob = new Date(member.NgaySinh).toISOString().slice(0, 10);
    if (tenant.HoTen === member.HoTen && tenantDob === memberDob) return true;
  }
  return false;
};

const MemberManagement = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartmentDetails, setApartmentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/apartments?limit=100'); // Add limit parameter
      const aptList = res.data?.data?.items || res.data?.data || [];
      
      // Lấy số lượng thành viên cho mỗi căn hộ
      const apartmentsWithCounts = await Promise.all(
        aptList.map(async (apt) => {
          try {
            const membersRes = await axios.get(`/thanhvien/canho/${apt.ID}`);
            const members = membersRes.data?.data || [];
            
            // Lấy thông tin hợp đồng hiện tại
            const contractRes = await axios.get(`/hopdong?canHoID=${apt.ID}&trangThai=DangThue`);
            const activeContract = contractRes.data?.data?.items?.[0] || contractRes.data?.data?.[0];
            
            // Nếu có hợp đồng, lấy thông tin người thuê đầy đủ
            let tenantInfo = null;
            if (activeContract?.NguoiThueID) {
              try {
                const tenantRes = await axios.get(`/users/${activeContract.NguoiThueID}`);
                tenantInfo = tenantRes.data?.data;
              } catch {
                // Dùng thông tin từ hợp đồng nếu không lấy được user
                tenantInfo = activeContract.nguoidung || null;
              }
            }

            const tenantDuplicate = tenantInfo && members.some((m) => isSamePerson(m, tenantInfo));
            const tenantCount = activeContract && !tenantDuplicate ? 1 : 0;
            return {
              ...apt,
              memberCount: members.filter(m => m.TrangThai === 'DangO').length + tenantCount,
              totalMembers: members.length + tenantCount,
              activeContract: activeContract ? {
                ...activeContract,
                nguoidung: tenantInfo || activeContract.nguoidung
              } : null
            };
          } catch (err) {
            return { ...apt, memberCount: 0, totalMembers: 0, activeContract: null };
          }
        })
      );
      
      setApartments(apartmentsWithCounts);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      alert('Lỗi khi tải danh sách căn hộ: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchApartmentDetails = async (apartmentId) => {
    setLoadingDetails(true);
    try {
      // Lấy thông tin căn hộ
      const aptRes = await axios.get(`/apartments/${apartmentId}`);
      const apartment = aptRes.data?.data;

      // Lấy danh sách thành viên
      const membersRes = await axios.get(`/thanhvien/canho/${apartmentId}`);
      const members = membersRes.data?.data || [];

      // Lấy hợp đồng đang thuê
      const contractRes = await axios.get(`/hopdong?canHoID=${apartmentId}&trangThai=DangThue`);
      const activeContract = contractRes.data?.data?.items?.[0] || contractRes.data?.data?.[0];

      // Lấy thông tin người thuê nếu có hợp đồng
      let tenant = null;
      if (activeContract) {
        try {
          const tenantRes = await axios.get(`/users/${activeContract.NguoiThueID}`);
          tenant = tenantRes.data?.data;
        } catch {
          // Fallback về thông tin từ hợp đồng
          tenant = activeContract.nguoidung || null;
        }
      }

      const membersWithTenant = tenant
        ? [
            {
              ID: `tenant-${tenant.ID}`,
              HoTen: tenant.HoTen,
              NgaySinh: tenant.NgaySinh || null,
              GioiTinh: tenant.GioiTinh || null,
              CCCD: tenant.CCCD || tenant.SoGiayTo || null,
              SoDienThoai: tenant.SoDienThoai || null,
              QuanHe: 'Chủ hộ',
              DiaChiThuongTru: tenant.DiaChi || tenant.DiaChiThuongTru || null,
              NgayDangKy: activeContract?.NgayBatDau || tenant.NgayTao || null,
              TrangThai: 'DangO',
              DaKhaiBaoNgoaiTru: tenant.DaKhaiBaoNgoaiTru,
            },
            ...members.filter((m) => !isSamePerson(m, tenant))
          ]
        : members;

      setApartmentDetails({
        apartment,
        members: membersWithTenant,
        activeContract,
        tenant
      });
    } catch (error) {
      console.error('Error fetching apartment details:', error);
      alert('Lỗi khi tải chi tiết căn hộ: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    fetchApartmentDetails(apartment.ID);
  };

  const handleBack = () => {
    setSelectedApartment(null);
    setApartmentDetails(null);
  };

  // Filter apartments
  const filteredApartments = apartments.filter(apt => {
    const matchStatus = statusFilter === 'all' || apt.TrangThai === statusFilter;
    const matchSearch = !searchTerm || 
      apt.MaCanHo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.Tang?.toString().includes(searchTerm);
    
    return matchStatus && matchSearch;
  });

  // Statistics
  const stats = {
    totalApartments: apartments.length,
    occupied: apartments.filter(a => a.TrangThai === 'DaThue').length,
    totalMembers: apartments.reduce((sum, apt) => sum + (apt.memberCount || 0), 0),
    apartmentsWithMembers: apartments.filter(a => (a.memberCount || 0) > 0).length
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          {selectedApartment ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={handleBack}
                style={{
                  padding: '8px 16px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4a5568'
                }}
              >
                ← Quay lại
              </button>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>
                  🏠 Chi tiết căn hộ {selectedApartment.MaCanHo}
                </h1>
                <p style={{ color: '#718096' }}>
                  Thông tin người thuê và thành viên trong căn hộ
                </p>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>
                🏢 Quản Lý Căn Hộ & Thành Viên
              </h1>
              <p style={{ color: '#718096' }}>
                Xem danh sách căn hộ, người thuê và thành viên
              </p>
            </>
          )}
        </div>

        {!selectedApartment ? (
          // Hiển thị danh sách căn hộ
          <>
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Tổng căn hộ', value: stats.totalApartments, icon: '🏢', color: '#3182ce' },
                { label: 'Đang cho thuê', value: stats.occupied, icon: '🔑', color: '#38a169' },
                { label: 'Tổng thành viên', value: stats.totalMembers, icon: '👥', color: '#d69e2e' },
                { label: 'Căn hộ có thành viên', value: stats.apartmentsWithMembers, icon: '✅', color: '#805ad5' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${stat.color}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#718096', fontSize: 14, marginBottom: 8 }}>{stat.label}</p>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    </div>
                    <div style={{ fontSize: '2.5rem' }}>{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {/* Search */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>
                    🔍 Tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Mã căn hộ, tầng..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>
                    📊 Trạng thái
                  </label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="Trong">Trống</option>
                    <option value="DaThue">Đã thuê</option>
                    <option value="BaoTri">Bảo trì</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <p style={{ color: '#718096', fontSize: 14 }}>
                  Tìm thấy <strong style={{ color: '#2d3748' }}>{filteredApartments.length}</strong> căn hộ
                </p>
              </div>
            </div>

            {/* Apartments Table */}
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#a0aec0', background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : filteredApartments.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#a0aec0', background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                <p>Không tìm thấy căn hộ nào</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                    <thead>
                      <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          STT
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Mã căn hộ
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Tầng
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Diện tích
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Giá thuê
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Người thuê
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Thành viên
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Khai báo ngoại trú
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Trạng thái
                        </th>
                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApartments.map((apt, idx) => (
                        <tr 
                          key={apt.ID} 
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            background: idx % 2 === 0 ? '#fff' : '#f9fafb'
                          }}
                        >
                          <td style={{ padding: '16px 20px', color: '#718096', fontSize: 14 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 15 }}>
                              {apt.MaCanHo}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14 }}>
                            Tầng {apt.Tang}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14 }}>
                            {apt.DienTich ? `${apt.DienTich}m²` : '-'}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14 }}>
                            {apt.GiaThue ? formatCurrency(apt.GiaThue) : '-'}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {apt.activeContract?.nguoidung ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 14 }}>
                                  {apt.activeContract.nguoidung.HoTen}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#a0aec0', fontSize: 14 }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center', color: '#4a5568', fontSize: 14 }}>
                            {apt.memberCount || 0}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            {apt.activeContract?.nguoidung ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                background: apt.activeContract.nguoidung.DaKhaiBaoNgoaiTru ? '#d1fae5' : '#fee2e2',
                                color: apt.activeContract.nguoidung.DaKhaiBaoNgoaiTru ? '#065f46' : '#991b1b'
                              }}>
                                {apt.activeContract.nguoidung.DaKhaiBaoNgoaiTru ? 'Đã khai báo' : 'Chưa khai báo'}
                              </span>
                            ) : (
                              <span style={{ color: '#a0aec0', fontSize: 13 }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              background: apt.TrangThai === 'DaThue' ? '#dbeafe' : '#f3f4f6',
                              color: apt.TrangThai === 'DaThue' ? '#1e40af' : '#6b7280'
                            }}>
                              {apt.TrangThai === 'DaThue' ? 'Đã thuê' : apt.TrangThai === 'Trong' ? 'Trống' : 'Bảo trì'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleApartmentClick(apt)}
                              style={{
                                padding: '8px 16px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                              onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          // Hiển thị chi tiết căn hộ
          <ApartmentDetailView 
            apartmentDetails={apartmentDetails}
            loading={loadingDetails}
            onRefresh={async () => {
              // Chạy song song cả 2: refresh chi tiết và refresh bảng danh sách
              await Promise.all([
                fetchApartmentDetails(selectedApartment.ID),
                fetchApartments(),
              ]);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Component hiển thị chi tiết căn hộ
const ApartmentDetailView = ({ apartmentDetails, loading, onRefresh }) => {
  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#a0aec0', background: '#fff', borderRadius: 12 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
        <p>Đang tải chi tiết...</p>
      </div>
    );
  }

  if (!apartmentDetails) return null;

  const { apartment, members, activeContract, tenant } = apartmentDetails;
  const activeMembersCount = members.filter(m => m.TrangThai === 'DangO').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Thông tin căn hộ */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>
          📋 Thông tin căn hộ
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Mã căn hộ</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{apartment.MaCanHo}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Tầng</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>Tầng {apartment.Tang}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Số phòng</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{apartment.SoPhong} phòng</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Diện tích</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>
              {apartment.DienTich ? `${apartment.DienTich}m²` : '-'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Giá thuê</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>
              {apartment.GiaThue ? `${formatCurrency(apartment.GiaThue)}/tháng` : '-'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Giới hạn người ở</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: activeMembersCount > apartment.GioiHanNguoiO ? '#e53e3e' : '#2d3748' }}>
              {activeMembersCount}/{apartment.GioiHanNguoiO || 'Không giới hạn'}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin người thuê */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>
          👤 Người thuê hiện tại
        </h2>
        {tenant && activeContract ? (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16,
              padding: 20,
              background: '#f7fafc',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Họ tên</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{tenant.HoTen}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Email</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{tenant.Email}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Số điện thoại</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{tenant.SoDienThoai || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>CCCD/Passport</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', fontFamily: 'monospace' }}>
                  {tenant.CCCD || tenant.SoGiayTo || '-'}
                </p>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16,
              padding: 20,
              background: '#edf2f7',
              borderRadius: 8
            }}>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Ngày bắt đầu</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>
                  {formatDate(activeContract.NgayBatDau)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Ngày kết thúc</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>
                  {formatDate(activeContract.NgayKetThuc)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Trạng thái hợp đồng</p>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#c6f6d5',
                  color: '#22543d'
                }}>
                  ✓ {activeContract.TrangThai}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Đã khai báo ngoại trú</p>
                <button
                  onClick={async () => {
                    try {
                      const newStatus = !tenant.DaKhaiBaoNgoaiTru;
                      await axios.patch(`/users/${tenant.ID}`, {
                        DaKhaiBaoNgoaiTru: newStatus
                      });
                      // Refresh cả chi tiết lẫn bảng danh sách
                      if (onRefresh) await onRefresh();
                    } catch (err) {
                      alert('Lỗi: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: tenant.DaKhaiBaoNgoaiTru ? '#d1fae5' : '#fee2e2',
                    color: tenant.DaKhaiBaoNgoaiTru ? '#065f46' : '#991b1b'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {tenant.DaKhaiBaoNgoaiTru ? '✓ Đã khai báo' : '✗ Chưa khai báo'} (Click để thay đổi)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏠</div>
            <p>Căn hộ hiện chưa có người thuê</p>
          </div>
        )}
      </div>

      {/* Danh sách thành viên */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748' }}>
            👥 Danh sách thành viên ({activeMembersCount} đang ở)
          </h2>
          {members.length > 0 && (
            <button
              onClick={() => {
                // Tạo dữ liệu cho khai báo ngoại trú
                const csv = [
                  ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'CCCD/CMND', 'Số điện thoại', 'Quan hệ với chủ hộ', 'Địa chỉ thường trú', 'Ngày đăng ký', 'Trạng thái'],
                  ...members.map((member, idx) => [
                    idx + 1,
                    member.HoTen || '',
                    member.NgaySinh ? formatDate(member.NgaySinh) : '',
                    member.GioiTinh === 'Nam' ? 'Nam' : member.GioiTinh === 'Nu' ? 'Nữ' : '',
                    member.CCCD || '',
                    member.SoDienThoai || '',
                    member.QuanHe || '',
                    member.DiaChiThuongTru || '',
                    formatDate(member.NgayDangKy),
                    member.TrangThai === 'DangO' ? 'Đang ở' : 'Đã rời'
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `thanh-vien-${apartment.MaCanHo}-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
              onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
            >
              <span>📥</span>
              Xuất Excel (Khai báo ngoại trú)
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div>
            <p>Chưa có thành viên nào được thêm vào căn hộ này</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Họ tên
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Ngày sinh
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Giới tính
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    CCCD
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    SĐT
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Quan hệ
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Ngày đăng ký
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => (
                  <tr key={member.ID} style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb'
                  }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2d3748' }}>
                      {member.HoTen}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      {member.NgaySinh ? formatDate(member.NgaySinh) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      {member.GioiTinh === 'Nam' ? '👨 Nam' : member.GioiTinh === 'Nu' ? '👩 Nữ' : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontFamily: 'monospace', fontSize: 13 }}>
                      {member.CCCD || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontFamily: 'monospace', fontSize: 13 }}>
                      {member.SoDienThoai || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      {member.QuanHe || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      {formatDate(member.NgayDangKy)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: member.TrangThai === 'DangO' ? '#c6f6d5' : '#e2e8f0',
                        color: member.TrangThai === 'DangO' ? '#22543d' : '#4a5568'
                      }}>
                        {member.TrangThai === 'DangO' ? '✓ Đang ở' : '✗ Đã rời'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
