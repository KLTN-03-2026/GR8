// client/src/components/billing/ConfirmReadingModal.jsx
// Modal xác nhận chỉ số và phát hành hóa đơn - HOÀN THIỆN

import React, { useState } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const ConfirmReadingModal = ({ reading, onClose }) => {
  const [formData, setFormData] = useState({
    ChiSoDienChinhThuc: reading.ChiSoDienMoi,
    ChiSoNuocChinhThuc: reading.ChiSoNuocMoi,
    GhiChuKeToan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImgDien, setShowImgDien] = useState(false);
  const [showImgNuoc, setShowImgNuoc] = useState(false);

  const ELECTRICITY_PRICE = 4000;
  const WATER_PRICE = 10000;
  const COMMON_FEE = 200000;
  const CLEANING_FEE = 50000;

  const calculateEstimate = () => {
    const dienUsed = parseFloat(formData.ChiSoDienChinhThuc) - parseFloat(reading.ChiSoDienCu || 0);
    const nuocUsed = parseFloat(formData.ChiSoNuocChinhThuc) - parseFloat(reading.ChiSoNuocCu || 0);
    
    const tienDien = dienUsed * ELECTRICITY_PRICE;
    const tienNuoc = nuocUsed * WATER_PRICE;
    const tienThue = parseFloat(reading.canho?.hopdong?.[0]?.GiaThue || 0);
    const tongTien = tienThue + tienDien + tienNuoc + COMMON_FEE + CLEANING_FEE;

    return {
      dienUsed,
      nuocUsed,
      tienDien,
      tienNuoc,
      tienThue,
      phiChung: COMMON_FEE,
      phiVeSinh: CLEANING_FEE,
      tongTien,
    };
  };

  const estimate = calculateEstimate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate
    const prevDien = parseFloat(reading.ChiSoDienCu || 0);
    const prevNuoc = parseFloat(reading.ChiSoNuocCu || 0);
    if (parseFloat(formData.ChiSoDienChinhThuc) < prevDien) {
      setError(`Chỉ số điện chính thức không thể nhỏ hơn chỉ số cũ (${prevDien})`);
      setLoading(false);
      return;
    }
    if (parseFloat(formData.ChiSoNuocChinhThuc) < prevNuoc) {
      setError(`Chỉ số nước chính thức không thể nhỏ hơn chỉ số cũ (${prevNuoc})`);
      setLoading(false);
      return;
    }

    try {
      await axios.post(`/chisodiennuoc/${reading.ID}/confirm`, {
        ChiSoDienChinhThuc: parseFloat(formData.ChiSoDienChinhThuc),
        ChiSoNuocChinhThuc: parseFloat(formData.ChiSoNuocChinhThuc),
        GhiChuKeToan: formData.GhiChuKeToan,
      });
      onClose(true); // true = did confirm
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Xác Nhận Chỉ Số & Phát Hành Hóa Đơn
            </h2>
            <p className="text-green-100 text-sm">
              Căn hộ {reading.canho?.MaCanHo} - Tháng {reading.ThangNam}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Original Readings */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Chỉ Số Nhân Viên Ghi
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-semibold">⚡ Điện</p>
                  {reading.AnhDongHoDien && reading.AnhDongHoDien !== 'https://placeholder.com/meter' && (
                    <button type="button" onClick={() => setShowImgDien(!showImgDien)}
                      className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                      {showImgDien ? '🙈 Ẩn' : '📷 Xem ảnh'}
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold text-yellow-700">{reading.ChiSoDienMoi} kWh</p>
                <p className="text-xs text-gray-500 mt-1">Cũ: {reading.ChiSoDienCu || 0} kWh</p>
                {showImgDien && (
                  <img src={reading.AnhDongHoDien} alt="Đồng hồ điện"
                    className="mt-3 w-full rounded-lg border border-yellow-300 object-cover max-h-40"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-semibold">💧 Nước</p>
                  {reading.AnhDongHoNuoc && reading.AnhDongHoNuoc !== 'https://placeholder.com/meter' && (
                    <button type="button" onClick={() => setShowImgNuoc(!showImgNuoc)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      {showImgNuoc ? '🙈 Ẩn' : '📷 Xem ảnh'}
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-700">{reading.ChiSoNuocMoi} m³</p>
                <p className="text-xs text-gray-500 mt-1">Cũ: {reading.ChiSoNuocCu || 0} m³</p>
                {showImgNuoc && (
                  <img src={reading.AnhDongHoNuoc} alt="Đồng hồ nước"
                    className="mt-3 w-full rounded-lg border border-blue-300 object-cover max-h-40"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
            </div>
          </div>

          {/* Confirmed Readings */}
          <div className="bg-green-50 rounded-xl p-5 border-2 border-green-300">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Xác Nhận Chỉ Số Chính Thức
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chỉ số điện chính thức (kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="ChiSoDienChinhThuc"
                  value={formData.ChiSoDienChinhThuc}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chỉ số nước chính thức (m³) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="ChiSoNuocChinhThuc"
                  value={formData.ChiSoNuocChinhThuc}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-lg"
                />
              </div>
            </div>
          </div>

          {/* Estimated Invoice */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Dự Tính Hóa Đơn
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-700">Tiền thuê căn hộ</span>
                <span className="font-semibold text-gray-900">{formatCurrency(estimate.tienThue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-700">
                  Tiền điện ({estimate.dienUsed.toFixed(1)} kWh × {formatCurrency(ELECTRICITY_PRICE)})
                </span>
                <span className="font-semibold text-yellow-700">{formatCurrency(estimate.tienDien)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-700">
                  Tiền nước ({estimate.nuocUsed.toFixed(1)} m³ × {formatCurrency(WATER_PRICE)})
                </span>
                <span className="font-semibold text-blue-700">{formatCurrency(estimate.tienNuoc)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-700">Phí quản lý chung</span>
                <span className="font-semibold text-gray-900">{formatCurrency(estimate.phiChung)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-700">Phí vệ sinh</span>
                <span className="font-semibold text-gray-900">{formatCurrency(estimate.phiVeSinh)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-600 text-white rounded-lg px-4 mt-4">
                <span className="font-bold text-lg">TỔNG CỘNG</span>
                <span className="font-bold text-2xl">{formatCurrency(estimate.tongTien)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú của kế toán
            </label>
            <textarea
              name="GhiChuKeToan"
              value={formData.GhiChuKeToan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú nếu có..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-xl text-white font-bold transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                '✅ Xác Nhận & Phát Hành'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmReadingModal;
