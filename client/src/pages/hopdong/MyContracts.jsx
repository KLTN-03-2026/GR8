// client/src/pages/hopdong/MyContracts.jsx
// Trang người thuê xem hợp đồng của mình

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [signingId, setSigningId] = useState(null); // track which contract is being signed

  useEffect(() => {
    fetchMyContracts();
  }, [filter]);

  const fetchMyContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { TrangThai: filter } : {};
      const response = await axios.get('/hopdong/my', { params });
      const data = response.data.data || [];
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách hợp đồng');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (contractId) => {
    if (!window.confirm('Bạn xác nhận ký hợp đồng này? Sau khi ký, hợp đồng sẽ có hiệu lực.')) return;
    try {
      setSigningId(contractId);
      setError('');
      await axios.put(`/hopdong/sign/${contractId}`);
      setSuccess('✅ Ký hợp đồng thành công! Hợp đồng đã có hiệu lực.');
      fetchMyContracts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ký hợp đồng thất bại');
    } finally {
      setSigningId(null);
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
        icon: '🏠',
        label: 'Đang thuê'
      },
      HetHan: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: '⚠️',
        label: 'Hết hạn'
      },
      KetThuc: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '🔚',
        label: 'Kết thúc'
      },
      ChuyenNhuong: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-300',
        icon: '🔄',
        label: 'Chuyển nhượng'
      }
    };

    const config = configs[status] || configs.ChoKy;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${config.bg} ${config.text} ${config.border}`}>
        <span className="mr-2">{config.icon}</span>
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

  const calculateMonthsRented = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today - start;
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📄 Hợp Đồng Của Tôi
              </h1>
              <p className="text-gray-600">Quản lý và theo dõi hợp đồng thuê căn hộ</p>
            </div>
            <button
              onClick={fetchMyContracts}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('DangThue')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'DangThue'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Đang thuê
            </button>
            <button
              onClick={() => setFilter('HetHan')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'HetHan'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hết hạn
            </button>
            <button
              onClick={() => setFilter('KetThuc')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'KetThuc'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Kết thúc
            </button>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hợp đồng nào</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Bạn chưa có hợp đồng thuê nào trong hệ thống'
                : `Không có hợp đồng ${filter === 'DangThue' ? 'đang thuê' : filter === 'HetHan' ? 'hết hạn' : 'kết thúc'}`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {contracts.map((contract) => {
              const daysRemaining = calculateDaysRemaining(contract.NgayKetThuc);
              const monthsRented = calculateMonthsRented(contract.NgayBatDau);
              const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30 && contract.TrangThai === 'DangThue';
              
              return (
                <div
                  key={contract.ID}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                    isExpiringSoon ? 'border-orange-300' : 'border-gray-200'
                  }`}
                >
                  {/* Expiring Soon Banner */}
                  {isExpiringSoon && (
                    <div className="bg-orange-600 text-white px-6 py-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold">HỢP ĐỒNG SẮP HẾT HẠN - Còn {daysRemaining} ngày</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Hợp Đồng #{contract.ID}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Căn hộ: <span className="font-semibold ml-1">{contract.canho?.MaCanHo} - Phòng {contract.canho?.SoPhong}</span>
                          </p>
                          {contract.NgayKy && (
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Ngày ký: <span className="font-semibold ml-1">{new Date(contract.NgayKy).toLocaleDateString('vi-VN')}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(contract.TrangThai)}
                    </div>

                    {/* Contract Details */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 mb-6 border-2 border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Chi tiết hợp đồng:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu</p>
                          <p className="font-bold text-gray-900">{new Date(contract.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ngày kết thúc</p>
                          <p className="font-bold text-gray-900">{new Date(contract.NgayKetThuc).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Giá thuê / tháng</p>
                          <p className="font-bold text-blue-600 text-lg">{formatCurrency(contract.GiaThue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Tiền cọc</p>
                          <p className="font-bold text-green-600 text-lg">{formatCurrency(contract.TienCoc)}</p>
                        </div>
                        {contract.TienCocDaNhan > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Tiền cọc đã nhận</p>
                            <p className="font-bold text-green-600">{formatCurrency(contract.TienCocDaNhan)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {contract.TrangThai === 'DangThue' && (
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">Đã thuê</p>
                          <p className="text-2xl font-bold text-green-600">{monthsRented} tháng</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          daysRemaining <= 30 
                            ? 'bg-orange-50 border-orange-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <p className="text-sm text-gray-600 mb-1">Còn lại</p>
                          <p className={`text-2xl font-bold ${
                            daysRemaining <= 30 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã hết hạn'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* File Download */}
                    {contract.FileHopDong && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="font-semibold text-gray-900">Hợp đồng PDF</p>
                              <p className="text-sm text-gray-600">File hợp đồng đã ký</p>
                            </div>
                          </div>
                          <a
                            href={contract.FileHopDong}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Tải xuống
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Apartment Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Thông tin căn hộ:</h5>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Diện tích:</span>
                          <span className="ml-2 font-semibold">{contract.canho?.DienTich} m²</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tầng:</span>
                          <span className="ml-2 font-semibold">Tầng {contract.canho?.Tang}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className="ml-2 font-semibold">{contract.canho?.TrangThai}</span>
                        </div>
                      </div>
                    </div>

                    {/* ✍️ KÝ HỢP ĐỒNG - chỉ hiện khi ChoKy */}
                    {contract.TrangThai === 'ChoKy' && (
                      <div className="mt-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                        <div className="flex items-start mb-4">
                          <svg className="w-6 h-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-bold text-amber-800 mb-1">Hợp đồng đang chờ bạn ký!</p>
                            <p className="text-sm text-amber-700">
                              Vui lòng đọc kỹ các điều khoản trước khi ký. Sau khi ký, hợp đồng sẽ có hiệu lực và căn hộ sẽ được ghi nhận là đang thuê.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSign(contract.ID)}
                          disabled={signingId === contract.ID}
                          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg ${
                            signingId === contract.ID
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
                          }`}
                        >
                          {signingId === contract.ID ? (
                            <>
                              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              ✍️ Ký Hợp Đồng Ngay
                            </>
                          )}
                        </button>
                      </div>
                    )}
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

export default MyContracts;
