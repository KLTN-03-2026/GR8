// client/src/pages/canho/BrowseApartments.jsx
// Trang tìm kiếm và gửi yêu cầu thuê căn hộ (cho người thuê)

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const BrowseApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [filter, setFilter] = useState({
    minPrice: '',
    maxPrice: '',
    Tang: '',
    search: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApartments();
  }, [filter]);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { TrangThai: 'Trong' }; // Chỉ lấy căn hộ trống
      if (filter.Tang) params.Tang = filter.Tang;
      if (filter.search) params.search = filter.search;

      const response = await axios.get('/apartments', { params });
      let data = response.data.data || [];
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.items || data.apartments || data.data || [];
      }
      
      if (!Array.isArray(data)) {
        data = [];
      }

      // Filter by price locally
      let filteredData = data;
      if (filter.minPrice || filter.maxPrice) {
        filteredData = data.filter(apt => {
          const price = parseFloat(apt.GiaThue);
          const min = filter.minPrice ? parseFloat(filter.minPrice) : 0;
          const max = filter.maxPrice ? parseFloat(filter.maxPrice) : Infinity;
          return price >= min && price <= max;
        });
      }
      
      setApartments(filteredData);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách căn hộ');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRental = (apartment) => {
    setSelectedApartment(apartment);
    setShowRequestModal(true);
    setRequestNote('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedApartment) return;

    try {
      setLoading(true);
      setError('');
      await axios.post('/yeucauthue/create', {
        CanHoID: selectedApartment.ID,
        GhiChu: requestNote
      });
      setSuccess('✅ Gửi yêu cầu thuê thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      setShowRequestModal(false);
      setSelectedApartment(null);
      setRequestNote('');
      setTimeout(() => {
        setSuccess('');
        navigate('/my-rental-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu thuê');
    } finally {
      setLoading(false);
    }
  };

  if (loading && apartments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải danh sách căn hộ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏠 Tìm Căn Hộ
              </h1>
              <p className="text-gray-600">Khám phá các căn hộ còn trống và gửi yêu cầu thuê</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/my-rental-requests')}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Yêu Cầu Của Tôi
              </button>
              <button
                onClick={fetchApartments}
                className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Bộ Lọc Tìm Kiếm</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá tối thiểu</label>
                <input
                  type="number"
                  value={filter.minPrice}
                  onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="VD: 3000000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá tối đa</label>
                <input
                  type="number"
                  value={filter.maxPrice}
                  onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="VD: 10000000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tầng</label>
                <input
                  type="number"
                  value={filter.Tang}
                  onChange={(e) => setFilter({ ...filter, Tang: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nhập số tầng"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Mã căn hộ..."
                />
              </div>
            </div>

            {(filter.minPrice || filter.maxPrice || filter.Tang || filter.search) && (
              <button
                onClick={() => setFilter({ minPrice: '', maxPrice: '', Tang: '', search: '' })}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

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

        {/* Apartments Grid */}
        {apartments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy căn hộ</h3>
            <p className="text-gray-600">Hiện tại không có căn hộ nào phù hợp với tiêu chí của bạn</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Tìm thấy <span className="font-bold text-teal-600">{apartments.length}</span> căn hộ
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <div
                  key={apartment.ID}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-teal-400"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-1">{apartment.MaCanHo}</h3>
                      <p className="text-teal-100 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Phòng {apartment.SoPhong} • Tầng {apartment.Tang}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Price - Featured */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
                      <p className="text-sm text-gray-600 mb-1">Giá thuê / tháng</p>
                      <p className="text-3xl font-bold text-teal-600">{formatCurrency(apartment.GiaThue)}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Diện tích</p>
                        <p className="font-bold text-gray-900">{apartment.DienTich} m²</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Tiền cọc</p>
                        <p className="font-bold text-blue-600">{formatCurrency(apartment.TienCoc)}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {apartment.MoTa && (
                      <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg">
                        {apartment.MoTa}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border-2 border-green-300">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Còn trống
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRequestRental(apartment)}
                      className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                    >
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Gửi Yêu Cầu Thuê
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Request Rental Modal */}
      {showRequestModal && selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">📝 Gửi Yêu Cầu Thuê</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitRequest} className="p-8 space-y-6">
              {/* Apartment Info */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Thông tin căn hộ:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã căn hộ:</span>
                    <span className="font-bold text-gray-900">{selectedApartment.MaCanHo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-bold text-gray-900">{selectedApartment.SoPhong}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tầng:</span>
                    <span className="font-bold text-gray-900">{selectedApartment.Tang}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diện tích:</span>
                    <span className="font-bold text-gray-900">{selectedApartment.DienTich} m²</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-teal-300 pt-3">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-bold text-teal-600 text-xl">{formatCurrency(selectedApartment.GiaThue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền cọc:</span>
                    <span className="font-bold text-blue-600 text-xl">{formatCurrency(selectedApartment.TienCoc)}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt của bạn..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Yêu cầu của bạn sẽ được quản lý kiểm tra và phê duyệt</li>
                      <li>Chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ</li>
                      <li>Vui lòng chuẩn bị đầy đủ giấy tờ cá nhân</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg text-white font-semibold transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? 'Đang gửi...' : '✅ Gửi Yêu Cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseApartments;
