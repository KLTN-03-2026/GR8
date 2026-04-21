// client/src/pages/Assets.jsx
// Trang quản lý tài sản tòa nhà/căn hộ

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    TinhTrang: '',
    LoaiTaiSan: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    good: 0,
    broken: 0,
    repairing: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filter.TinhTrang) params.TinhTrang = filter.TinhTrang;
      if (filter.LoaiTaiSan) params.LoaiTaiSan = filter.LoaiTaiSan;

      const response = await axios.get('/taisan', { params });
      
      // Handle different response formats
      let data = response.data.data || [];
      
      // If data is an object with items property (pagination)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.items || data.assets || data.data || [];
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Filter by search locally
      let filteredData = data;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredData = data.filter(asset => 
          asset.TenTaiSan?.toLowerCase().includes(searchLower) ||
          asset.MaTaiSan?.toLowerCase().includes(searchLower)
        );
      }
      
      setAssets(filteredData);

      // Calculate stats
      const stats = filteredData.reduce((acc, asset) => {
        acc.total++;
        if (asset.TinhTrang === 'Tot') acc.good++;
        else if (asset.TinhTrang === 'Hong') acc.broken++;
        else if (asset.TinhTrang === 'DangSua') acc.repairing++;
        acc.totalValue += parseFloat(asset.GiaTri || 0);
        return acc;
      }, { total: 0, good: 0, broken: 0, repairing: 0, totalValue: 0 });
      setStats(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tài sản');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      Tot: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✅',
        label: 'Tốt'
      },
      Hong: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: '❌',
        label: 'Hỏng'
      },
      DangSua: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: '🔧',
        label: 'Đang sửa'
      },
      Mat: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '🔍',
        label: 'Mất'
      },
      Cu: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: '📦',
        label: 'Cũ'
      }
    };

    const config = configs[status] || configs.Tot;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${config.bg} ${config.text} ${config.border}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getAssetTypeIcon = (type) => {
    const icons = {
      ThietBiChung: '🏢',
      ThietBiCanHo: '🏠',
      NoiThat: '🛋️',
      ThietBiDien: '⚡',
      CoSoVatChat: '🏗️'
    };
    return icons[type] || '📦';
  };

  const getAssetTypeLabel = (type) => {
    const labels = {
      ThietBiChung: 'Thiết bị chung',
      ThietBiCanHo: 'Thiết bị căn hộ',
      NoiThat: 'Nội thất',
      ThietBiDien: 'Thiết bị điện',
      CoSoVatChat: 'Cơ sở vật chất'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải danh sách tài sản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📦 Quản Lý Tài Sản
              </h1>
              <p className="text-gray-600">Theo dõi và quản lý tài sản tòa nhà, căn hộ</p>
            </div>
            <button
              onClick={fetchAssets}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng tài sản</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tốt</p>
                  <p className="text-3xl font-bold text-green-600">{stats.good}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hỏng</p>
                  <p className="text-3xl font-bold text-red-600">{stats.broken}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang sửa</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.repairing}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng giá trị</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tình trạng</label>
                <select
                  value={filter.TinhTrang}
                  onChange={(e) => setFilter({ ...filter, TinhTrang: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Tot">Tốt</option>
                  <option value="Hong">Hỏng</option>
                  <option value="DangSua">Đang sửa</option>
                  <option value="Mat">Mất</option>
                  <option value="Cu">Cũ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại tài sản</label>
                <select
                  value={filter.LoaiTaiSan}
                  onChange={(e) => setFilter({ ...filter, LoaiTaiSan: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Tất cả</option>
                  <option value="ThietBiChung">Thiết bị chung</option>
                  <option value="ThietBiCanHo">Thiết bị căn hộ</option>
                  <option value="NoiThat">Nội thất</option>
                  <option value="ThietBiDien">Thiết bị điện</option>
                  <option value="CoSoVatChat">Cơ sở vật chất</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Mã tài sản, tên..."
                />
              </div>
            </div>

            {(filter.TinhTrang || filter.LoaiTaiSan || filter.search) && (
              <button
                onClick={() => setFilter({ TinhTrang: '', LoaiTaiSan: '', search: '' })}
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

        {/* Assets List */}
        {assets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy tài sản</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc thêm tài sản mới</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assets.map((asset) => (
              <div
                key={asset.ID}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-3xl">
                        {getAssetTypeIcon(asset.LoaiTaiSan)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{asset.TenTaiSan}</h3>
                        <p className="text-sm text-gray-600 mb-2">Mã: {asset.MaTaiSan}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            {getAssetTypeLabel(asset.LoaiTaiSan)}
                          </span>
                          {getStatusBadge(asset.TinhTrang)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Giá trị</p>
                      <p className="text-xl font-bold text-purple-600">{formatCurrency(asset.GiaTri)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Số lượng</p>
                      <p className="font-semibold text-gray-900">{asset.SoLuong || 1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Vị trí</p>
                      <p className="font-semibold text-gray-900">{asset.ViTri || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ngày mua</p>
                      <p className="font-semibold text-gray-900">
                        {asset.NgayMua ? new Date(asset.NgayMua).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Nhà cung cấp</p>
                      <p className="font-semibold text-gray-900">{asset.NhaCungCap || 'N/A'}</p>
                    </div>
                  </div>

                  {asset.GhiChu && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Ghi chú:</span> {asset.GhiChu}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;
