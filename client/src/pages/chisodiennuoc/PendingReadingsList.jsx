// client/src/pages/chisodiennuoc/PendingReadingsList.jsx
// BƯỚC 2: Kế toán xem danh sách chờ duyệt

import React, { useState, useEffect } from 'react';
import { getPendingMeterReadings, confirmAndGenerateInvoice } from '../../services/billingService';
import ConfirmReadingModal from '../../components/billing/ConfirmReadingModal';

const PendingReadingsList = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingReadings();
  }, []);

  const fetchPendingReadings = async () => {
    try {
      setLoading(true);
      const response = await getPendingMeterReadings();
      setReadings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (reading) => {
    setSelectedReading(reading);
    setShowModal(true);
  };

  const handleConfirm = async (readingId, data) => {
    try {
      await confirmAndGenerateInvoice(readingId, data);
      alert('✅ Xác nhận thành công! Hóa đơn đã được phát hành.');
      setShowModal(false);
      fetchPendingReadings(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Chỉ Số Chờ Duyệt
          </h2>
          <button
            onClick={fetchPendingReadings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {readings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-gray-600">Không có chỉ số nào chờ duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Căn Hộ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tháng/Năm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điện (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nước (m³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người Ghi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Ghi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reading.canho?.MaCanHo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng {reading.canho?.SoPhong}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {reading.ThangNam}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Cũ: {reading.ChiSoDienCu}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        Mới: {reading.ChiSoDienMoi}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tiêu thụ: {(reading.ChiSoDienMoi - reading.ChiSoDienCu).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Cũ: {reading.ChiSoNuocCu}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        Mới: {reading.ChiSoNuocMoi}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tiêu thụ: {(reading.ChiSoNuocMoi - reading.ChiSoNuocCu).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.nguoidung?.HoTen || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reading.NgayGhi).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(reading)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        👁️ Xem & Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xác nhận */}
      {showModal && selectedReading && (
        <ConfirmReadingModal
          reading={selectedReading}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default PendingReadingsList;
