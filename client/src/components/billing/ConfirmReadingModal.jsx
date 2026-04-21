// client/src/components/billing/ConfirmReadingModal.jsx
// Modal xác nhận chỉ số và phát hành hóa đơn

import React, { useState } from 'react';

const ConfirmReadingModal = ({ reading, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    ChiSoDienChinhThuc: reading.ChiSoDienMoi,
    ChiSoNuocChinhThuc: reading.ChiSoNuocMoi,
    GhiChuKeToan: '',
  });

  const [loading, setLoading] = useState(false);

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

    try {
      const data = {
        ChiSoDienChinhThuc: parseFloat(formData.ChiSoDienChinhThuc),
        ChiSoNuocChinhThuc: parseFloat(formData.ChiSoNuocChinhThuc),
        GhiChuKeToan: formData.GhiChuKeToan,
      };

      await onConfirm(reading.ID, data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán dự kiến
  const soDien = parseFloat(formData.ChiSoDienChinhThuc) - parseFloat(reading.ChiSoDienCu);
  const soNuoc = parseFloat(formData.ChiSoNuocChinhThuc) - parseFloat(reading.ChiSoNuocCu);
  const tienDien = soDien * 4000; // 4,000đ/kWh
  const tienNuoc = soNuoc * 10000; // 10,000đ/m³

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              ✅ Xác Nhận Chỉ Số & Phát Hành Hóa Đơn
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Thông tin căn hộ */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📍 Thông Tin Căn Hộ</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mã căn hộ:</span>
                <span className="ml-2 font-semibold">{reading.canho?.MaCanHo}</span>
              </div>
              <div>
                <span className="text-gray-600">Phòng:</span>
                <span className="ml-2 font-semibold">{reading.canho?.SoPhong}</span>
              </div>
              <div>
                <span className="text-gray-600">Tháng:</span>
                <span className="ml-2 font-semibold">{reading.ThangNam}</span>
              </div>
              <div>
                <span className="text-gray-600">Người ghi:</span>
                <span className="ml-2 font-semibold">{reading.nguoidung?.HoTen}</span>
              </div>
            </div>
          </div>

          {/* Ảnh đồng hồ */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">📸 Ảnh Đồng Hồ</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">⚡ Đồng hồ điện:</p>
                <img
                  src={reading.AnhDongHoDien}
                  alt="Đồng hồ điện"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Không+tải+được+ảnh';
                  }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">💧 Đồng hồ nước:</p>
                <img
                  src={reading.AnhDongHoNuoc}
                  alt="Đồng hồ nước"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Không+tải+được+ảnh';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form xác nhận */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4">📝 Xác Nhận Chỉ Số</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Chỉ số điện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⚡ Chỉ Số Điện Chính Thức (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="ChiSoDienChinhThuc"
                    value={formData.ChiSoDienChinhThuc}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cũ: {reading.ChiSoDienCu} → Tiêu thụ: {soDien.toFixed(1)} kWh
                  </p>
                </div>

                {/* Chỉ số nước */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💧 Chỉ Số Nước Chính Thức (m³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="ChiSoNuocChinhThuc"
                    value={formData.ChiSoNuocChinhThuc}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cũ: {reading.ChiSoNuocCu} → Tiêu thụ: {soNuoc.toFixed(1)} m³
                  </p>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📌 Ghi Chú Kế Toán
                </label>
                <textarea
                  name="GhiChuKeToan"
                  value={formData.GhiChuKeToan}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Đã kiểm tra ảnh, chỉ số chính xác"
                />
              </div>
            </div>

            {/* Dự kiến hóa đơn */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">💰 Dự Kiến Hóa Đơn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Tiền điện:</span>
                  <span className="font-semibold">
                    {soDien.toFixed(1)} kWh × 4,000đ = {tienDien.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tiền nước:</span>
                  <span className="font-semibold">
                    {soNuoc.toFixed(1)} m³ × 10,000đ = {tienNuoc.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tiền thuê:</span>
                  <span className="font-semibold">
                    {reading.canho?.hopdong?.[0]?.GiaThue?.toLocaleString('vi-VN') || '0'}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Phí chung:</span>
                  <span className="font-semibold">200,000đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Phí vệ sinh:</span>
                  <span className="font-semibold">50,000đ</span>
                </div>
                <div className="border-t border-green-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-green-800">TỔNG CỘNG:</span>
                    <span className="font-bold text-green-800">
                      {(
                        tienDien +
                        tienNuoc +
                        parseFloat(reading.canho?.hopdong?.[0]?.GiaThue || 0) +
                        200000 +
                        50000
                      ).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ❌ Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '⏳ Đang xử lý...' : '✅ Xác Nhận & Phát Hành Hóa Đơn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReadingModal;
