// client/src/pages/chisodiennuoc/MeterReadingForm.jsx
// BƯỚC 1: Nhân viên kỹ thuật ghi chỉ số

import React, { useState } from 'react';
import { createMeterReading } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatCurrency';

const MeterReadingForm = () => {
  const [formData, setFormData] = useState({
    CanHoID: '',
    ThangNam: '',
    ChiSoDienMoi: '',
    ChiSoNuocMoi: '',
    AnhDongHoDien: '',
    AnhDongHoNuoc: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const data = {
        CanHoID: parseInt(formData.CanHoID),
        ThangNam: formData.ThangNam,
        ChiSoDienMoi: parseFloat(formData.ChiSoDienMoi),
        ChiSoNuocMoi: parseFloat(formData.ChiSoNuocMoi),
        AnhDongHoDien: formData.AnhDongHoDien,
        AnhDongHoNuoc: formData.AnhDongHoNuoc,
      };

      const response = await createMeterReading(data);
      setSuccess('✅ Ghi chỉ số thành công! Chờ kế toán duyệt.');
      
      // Reset form
      setFormData({
        CanHoID: '',
        ThangNam: '',
        ChiSoDienMoi: '',
        ChiSoNuocMoi: '',
        AnhDongHoDien: '',
        AnhDongHoNuoc: '',
      });

      console.log('Response:', response);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi ghi chỉ số');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📝 Ghi Chỉ Số Điện Nước
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Căn hộ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Căn Hộ ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="CanHoID"
              value={formData.CanHoID}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ID căn hộ (VD: 1)"
            />
          </div>

          {/* Tháng năm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng/Năm <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              name="ThangNam"
              value={formData.ThangNam}
              onChange={handleChange}
              required
              max={getCurrentMonth()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: YYYY-MM (VD: 2024-04)
            </p>
          </div>

          {/* Chỉ số điện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Chỉ Số Điện Mới (kWh) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              name="ChiSoDienMoi"
              value={formData.ChiSoDienMoi}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: 1250.5"
            />
          </div>

          {/* Chỉ số nước */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💧 Chỉ Số Nước Mới (m³) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              name="ChiSoNuocMoi"
              value={formData.ChiSoNuocMoi}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: 85.3"
            />
          </div>

          {/* Ảnh đồng hồ điện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 URL Ảnh Đồng Hồ Điện <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="AnhDongHoDien"
              value={formData.AnhDongHoDien}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://storage.example.com/electric-meter.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload ảnh lên cloud storage và paste URL vào đây
            </p>
          </div>

          {/* Ảnh đồng hồ nước */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 URL Ảnh Đồng Hồ Nước <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="AnhDongHoNuoc"
              value={formData.AnhDongHoNuoc}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://storage.example.com/water-meter.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload ảnh lên cloud storage và paste URL vào đây
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '⏳ Đang gửi...' : '✅ Ghi Chỉ Số'}
          </button>
        </form>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📌 Lưu ý:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Chụp ảnh rõ ràng, đủ ánh sáng</li>
            <li>• Đảm bảo chỉ số trên ảnh khớp với số nhập vào</li>
            <li>• Hệ thống tự động lấy chỉ số cũ từ tháng trước</li>
            <li>• Sau khi ghi, chờ kế toán xác nhận</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeterReadingForm;
