// client/src/pages/hopdong/HopDongList.jsx
// Trang quản lý hợp đồng

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const HopDongList = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    TrangThai: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0
  });

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filter.TrangThai) params.TrangThai = filter.TrangThai;

      const response = await axios.get('/hopdong', { params });
      
      // Handle different response formats
      let data = response.data.data || [];
      
      // If data is an object with items property
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.items || data.contracts || data.data || [];
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Filter by search locally
      let filteredData = data;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredData = data.filter(contract => 
          contract.canho?.MaCanHo?.toLowerCase().includes(searchLower) ||
          contract.nguoidung?.HoTen?.toLowerCase().includes(searchLower)
        );
      }
      
      setContracts(filteredData);

      // Calculate stats
      const stats = filteredData.reduce((acc, contract) => {
        acc.total++;
        if (contract.TrangThai === 'DangThue') acc.active++;
        else if (contract.TrangThai === 'HetHan') acc.expired++;
        else if (contract.TrangThai === 'ChoKy') acc.pending++;
        return acc;
      }, { total: 0, active: 0, expired: 0, pending: 0 });
      setStats(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách hợp đồng');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      ChoKy: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: '⏳',
        label: 'Chờ ký'
      },
      DaKy: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: '✍️',
        label: 'Đã ký'
      },
      DangThue: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✅',
        label: 'Đang thuê'
      },
      HetHan: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: '⏰',
        label: 'Hết hạn'
      },
      KetThuc: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '🔚',
        label: 'Kết thúc'
      }
    };

    const config = configs[status] || configs.ChoKy;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${config.bg} ${config.text} ${config.border}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải danh sách hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📄 Quản Lý Hợp Đồng
              </h1>
              <p className="text-gray-600">Danh sách hợp đồng thuê căn hộ</p>
            </div>
            <button
              onClick={fetchContracts}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng hợp đồng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang thuê</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chờ ký</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hết hạn</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={filter.TrangThai}
                  onChange={(e) => setFilter({ ...filter, TrangThai: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả</option>
                  <option value="ChoKy">Chờ ký</option>
                  <option value="DaKy">Đã ký</option>
                  <option value="DangThue">Đang thuê</option>
                  <option value="HetHan">Hết hạn</option>
                  <option value="KetThuc">Kết thúc</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mã căn hộ, tên người thuê..."
                />
              </div>
            </div>

            {(filter.TrangThai || filter.search) && (
              <button
                onClick={() => setFilter({ TrangThai: '', search: '' })}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Contracts List */}
        {contracts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc tạo hợp đồng mới</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {contracts.map((contract) => {
              const daysRemaining = calculateDaysRemaining(contract.NgayKetThuc);
              const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
              
              return (
                <div
                  key={contract.ID}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                    isExpiringSoon ? 'border-orange-300' : 'border-gray-200'
                  }`}
                >
                  {/* Warning Banner */}
                  {isExpiringSoon && (
                    <div className="bg-orange-500 text-white px-6 py-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold">Sắp hết hạn - Còn {daysRemaining} ngày</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Hợp đồng #{contract.ID}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Căn hộ: <span className="font-semibold ml-1">{contract.canho?.MaCanHo} - Phòng {contract.canho?.SoPhong}</span>
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Người thuê: <span className="font-semibold ml-1">{contract.nguoidung?.HoTen}</span>
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(contract.TrangThai)}
                    </div>

                    {/* Contract Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày bắt đầu:</span>
                            <span className="font-semibold">{new Date(contract.NgayBatDau).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày kết thúc:</span>
                            <span className="font-semibold">{new Date(contract.NgayKetThuc).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {contract.NgayKy && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ngày ký:</span>
                              <span className="font-semibold">{new Date(contract.NgayKy).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                          {daysRemaining > 0 && (
                            <div className="flex justify-between pt-2 border-t border-blue-300">
                              <span className="text-gray-700 font-medium">Còn lại:</span>
                              <span className={`font-bold ${isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`}>
                                {daysRemaining} ngày
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-4">Thông tin tài chính</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá thuê:</span>
                            <span className="font-bold text-green-600">{formatCurrency(contract.GiaThue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền cọc:</span>
                            <span className="font-semibold">{formatCurrency(contract.TienCoc)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đã nhận cọc:</span>
                            <span className="font-semibold">{formatCurrency(contract.TienCocDaNhan || 0)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-300">
                            <span className="text-gray-700 font-medium">Còn thiếu:</span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(parseFloat(contract.TienCoc) - parseFloat(contract.TienCocDaNhan || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* File & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-600">
                        {contract.FileHopDong ? (
                          <a 
                            href={contract.FileHopDong} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            Xem file hợp đồng
                          </a>
                        ) : (
                          <span className="text-gray-400">Chưa có file hợp đồng</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => window.location.href = `/hopdong/${contract.ID}`}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HopDongList;
