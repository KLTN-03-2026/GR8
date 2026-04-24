// client/src/pages/Amenities.jsx
// Trang quản lý tiện ích căn hộ

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/tienich');
      
      // Handle different response formats
      let data = response.data.data || [];
      
      // If data is an object with items property
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.items || data.amenities || data.data || [];
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      setAmenities(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tiện ích');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (name) => {
    const nameLower = name?.toLowerCase() || '';
    if (nameLower.includes('wifi') || nameLower.includes('internet')) return '📶';
    if (nameLower.includes('điều hòa') || nameLower.includes('máy lạnh')) return '❄️';
    if (nameLower.includes('tủ lạnh')) return '🧊';
    if (nameLower.includes('máy giặt')) return '🧺';
    if (nameLower.includes('bếp') || nameLower.includes('kitchen')) return '🍳';
    if (nameLower.includes('tv') || nameLower.includes('tivi')) return '📺';
    if (nameLower.includes('bãi đỗ') || nameLower.includes('parking')) return '🅿️';
    if (nameLower.includes('thang máy') || nameLower.includes('elevator')) return '🛗';
    if (nameLower.includes('bảo vệ') || nameLower.includes('security')) return '🔒';
    if (nameLower.includes('hồ bơi') || nameLower.includes('pool')) return '🏊';
    if (nameLower.includes('gym') || nameLower.includes('phòng tập')) return '💪';
    if (nameLower.includes('sân') || nameLower.includes('garden')) return '🌳';
    return '✨';
  };

  const filteredAmenities = amenities.filter(amenity =>
    amenity.TenTienIch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amenity.MoTa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải danh sách tiện ích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ✨ Tiện Ích Căn Hộ
              </h1>
              <p className="text-gray-600">Danh sách các tiện ích có sẵn</p>
            </div>
            <button
              onClick={fetchAmenities}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng số tiện ích</p>
                  <p className="text-4xl font-bold text-gray-900">{amenities.length}</p>
                </div>
              </div>
              
              {/* Search */}
              <div className="w-96">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm tiện ích..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
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

        {/* Amenities Grid */}
        {filteredAmenities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy tiện ích' : 'Chưa có tiện ích nào'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Thêm tiện ích mới để bắt đầu'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmenities.map((amenity) => (
              <div
                key={amenity.ID}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
              >
                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="flex items-start mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-3xl mr-4 group-hover:scale-110 transition-transform duration-300">
                      {getAmenityIcon(amenity.TenTienIch)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                        {amenity.TenTienIch}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ID: {amenity.ID}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {amenity.MoTa && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {amenity.MoTa}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Tiện ích chung
                      </span>
                      <button className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                        Chi tiết →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-lg mb-2">💡 Về Tiện Ích</h3>
              <p className="text-green-100 text-sm leading-relaxed">
                Tiện ích là các dịch vụ và trang thiết bị đi kèm với căn hộ. Mỗi căn hộ có thể được gán nhiều tiện ích khác nhau để tăng giá trị và sự hấp dẫn cho người thuê.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amenities;
