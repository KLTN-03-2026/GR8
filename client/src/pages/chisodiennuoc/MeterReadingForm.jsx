// client/src/pages/chisodiennuoc/MeterReadingForm.jsx
// Nhân viên kỹ thuật ghi chỉ số điện nước

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const STATUS_CONFIG = {
  ChoDuyetKeToan:   { label: 'Chờ kế toán duyệt', color: 'bg-yellow-100 text-yellow-800' },
  DaDuyet:          { label: 'Đã duyệt',           color: 'bg-blue-100 text-blue-800' },
  DaPhatHanhHoaDon: { label: 'Đã phát hành HĐ',   color: 'bg-green-100 text-green-800' },
  TuChoi:           { label: 'Từ chối',             color: 'bg-red-100 text-red-800' },
};

const MeterReadingForm = () => {
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [activeTab, setActiveTab] = useState('form');
  const [prevReading, setPrevReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    CanHoID: '',
    ThangNam: getCurrentMonth(),
    ChiSoDienMoi: '',
    ChiSoNuocMoi: '',
    AnhDongHoDien: '',
    AnhDongHoNuoc: '',
  });

  useEffect(() => {
    fetchApartments();
    fetchRecentReadings();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoadingApartments(true);
      const res = await axios.get('/apartments', { params: { TrangThai: 'DaThue' } });
      let data = res.data?.data || [];
      if (!Array.isArray(data)) data = data.items || [];
      if (!Array.isArray(data)) data = [];
      setApartments(data);
    } catch {
      setError('Không thể tải danh sách căn hộ');
    } finally {
      setLoadingApartments(false);
    }
  };

  const fetchRecentReadings = async () => {
    try {
      const res = await axios.get('/chisodiennuoc');
      const data = res.data?.data || [];
      setRecentReadings(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch {}
  };

  const fetchPrevReading = async (canHoID, thangNam) => {
    try {
      const res = await axios.get('/chisodiennuoc', { params: { CanHoID: canHoID } });
      const data = res.data?.data || [];
      const prev = Array.isArray(data)
        ? data.filter(r => r.ThangNam < thangNam).sort((a, b) => b.ThangNam.localeCompare(a.ThangNam))[0]
        : null;
      setPrevReading(prev || null);
    } catch {
      setPrevReading(null);
    }
  };

  const handleApartmentChange = (e) => {
    const id = e.target.value;
    const apt = apartments.find(a => a.ID === parseInt(id));
    setSelectedApartment(apt || null);
    setFormData(prev => ({ ...prev, CanHoID: id }));
    if (id) fetchPrevReading(id, formData.ThangNam);
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, ThangNam: value }));
    if (formData.CanHoID) fetchPrevReading(formData.CanHoID, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calcUsage = (newVal, oldVal) => {
    const n = parseFloat(newVal);
    const o = parseFloat(oldVal || 0);
    if (isNaN(n) || n < o) return null;
    return (n - o).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const prevDien = parseFloat(prevReading?.ChiSoDienMoi || 0);
    const prevNuoc = parseFloat(prevReading?.ChiSoNuocMoi || 0);

    if (parseFloat(formData.ChiSoDienMoi) < prevDien) {
      setError(`Chỉ số điện mới (${formData.ChiSoDienMoi}) không thể nhỏ hơn chỉ số cũ (${prevDien})`);
      setLoading(false);
      return;
    }
    if (parseFloat(formData.ChiSoNuocMoi) < prevNuoc) {
      setError(`Chỉ số nước mới (${formData.ChiSoNuocMoi}) không thể nhỏ hơn chỉ số cũ (${prevNuoc})`);
      setLoading(false);
      return;
    }

    try {
      await axios.post('/chisodiennuoc', {
        CanHoID: parseInt(formData.CanHoID),
        ThangNam: formData.ThangNam,
        ChiSoDienMoi: parseFloat(formData.ChiSoDienMoi),
        ChiSoNuocMoi: parseFloat(formData.ChiSoNuocMoi),
        AnhDongHoDien: formData.AnhDongHoDien || '',
        AnhDongHoNuoc: formData.AnhDongHoNuoc || '',
      });

      setSuccess(`✅ Ghi chỉ số tháng ${formData.ThangNam} thành công! Chờ kế toán xác nhận.`);
      setFormData({
        CanHoID: '',
        ThangNam: getCurrentMonth(),
        ChiSoDienMoi: '',
        ChiSoNuocMoi: '',
        AnhDongHoDien: '',
        AnhDongHoNuoc: '',
      });
      setSelectedApartment(null);
      setPrevReading(null);
      fetchRecentReadings();
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi ghi chỉ số');
    } finally {
      setLoading(false);
    }
  };

  const dienUsage = calcUsage(formData.ChiSoDienMoi, prevReading?.ChiSoDienMoi);
  const nuocUsage = calcUsage(formData.ChiSoNuocMoi, prevReading?.ChiSoNuocMoi);

  if (loadingApartments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Ghi Chỉ Số Điện Nước</h1>
            <p className="text-gray-500 mt-1">Nhập chỉ số đồng hồ cho căn hộ đang thuê</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-700">{apartments.length} căn hộ đang thuê</p>
            <p>Tháng hiện tại: {getCurrentMonth()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'form', label: '📝 Ghi Chỉ Số' },
            { key: 'history', label: `📋 Lịch Sử (${recentReadings.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== TAB FORM ===== */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-r-lg flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6 rounded-r-lg flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Row 1: Căn hộ + Tháng */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Căn hộ */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🏠 Chọn Căn Hộ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.CanHoID}
                    onChange={handleApartmentChange}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Chọn căn hộ đang thuê --</option>
                    {apartments.map(apt => (
                      <option key={apt.ID} value={apt.ID}>
                        {apt.MaCanHo} — Phòng {apt.SoPhong} — Tầng {apt.Tang}
                      </option>
                    ))}
                  </select>
                  {apartments.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">⚠️ Không có căn hộ nào đang được thuê</p>
                  )}
                  {selectedApartment && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Diện tích:</span>
                        <span className="font-semibold ml-1">{selectedApartment.DienTich} m²</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Giá thuê:</span>
                        <span className="font-semibold text-blue-600 ml-1">{formatCurrency(selectedApartment.GiaThue)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tháng */}
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Tháng/Năm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={formData.ThangNam}
                    onChange={handleMonthChange}
                    required
                    max={getCurrentMonth()}
                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  />
                  {prevReading ? (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 text-sm">
                      <p className="text-gray-500 mb-1 font-medium">Chỉ số tháng trước ({prevReading.ThangNam}):</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>⚡ <span className="font-bold text-yellow-700">{prevReading.ChiSoDienMoi} kWh</span></div>
                        <div>💧 <span className="font-bold text-blue-700">{prevReading.ChiSoNuocMoi} m³</span></div>
                      </div>
                    </div>
                  ) : formData.CanHoID ? (
                    <p className="text-sm text-gray-500 mt-2">ℹ️ Chưa có chỉ số tháng trước (bắt đầu từ 0)</p>
                  ) : null}
                </div>
              </div>

              {/* Row 2: Điện + Nước */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Điện */}
                <div className="bg-yellow-50 p-5 rounded-xl border-2 border-yellow-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-white text-xl">⚡</div>
                    <h3 className="text-lg font-bold text-gray-900">Chỉ Số Điện</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Chỉ số cũ (kWh)</label>
                      <input
                        type="number"
                        value={prevReading?.ChiSoDienMoi || 0}
                        disabled
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Chỉ số mới (kWh) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="ChiSoDienMoi"
                        value={formData.ChiSoDienMoi}
                        onChange={handleChange}
                        required
                        min={prevReading?.ChiSoDienMoi || 0}
                        className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white font-semibold text-lg"
                        placeholder="VD: 1250.5"
                      />
                    </div>
                    {dienUsage !== null && (
                      <div className="bg-yellow-100 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Tiêu thụ tháng này</p>
                        <p className="text-2xl font-bold text-yellow-700">{dienUsage} kWh</p>
                        <p className="text-xs text-gray-500">≈ {formatCurrency(parseFloat(dienUsage) * 4000)}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">URL Ảnh Đồng Hồ Điện</label>
                      <input
                        type="text"
                        name="AnhDongHoDien"
                        value={formData.AnhDongHoDien}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white text-sm"
                        placeholder="https://i.imgur.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Nước */}
                <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white text-xl">💧</div>
                    <h3 className="text-lg font-bold text-gray-900">Chỉ Số Nước</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Chỉ số cũ (m³)</label>
                      <input
                        type="number"
                        value={prevReading?.ChiSoNuocMoi || 0}
                        disabled
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Chỉ số mới (m³) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="ChiSoNuocMoi"
                        value={formData.ChiSoNuocMoi}
                        onChange={handleChange}
                        required
                        min={prevReading?.ChiSoNuocMoi || 0}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-lg"
                        placeholder="VD: 85.3"
                      />
                    </div>
                    {nuocUsage !== null && (
                      <div className="bg-blue-100 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Tiêu thụ tháng này</p>
                        <p className="text-2xl font-bold text-blue-700">{nuocUsage} m³</p>
                        <p className="text-xs text-gray-500">≈ {formatCurrency(parseFloat(nuocUsage) * 10000)}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">URL Ảnh Đồng Hồ Nước</label>
                      <input
                        type="text"
                        name="AnhDongHoNuoc"
                        value={formData.AnhDongHoNuoc}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                        placeholder="https://i.imgur.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !formData.CanHoID || !formData.ChiSoDienMoi || !formData.ChiSoNuocMoi}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center ${
                  loading || !formData.CanHoID || !formData.ChiSoDienMoi || !formData.ChiSoNuocMoi
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang ghi chỉ số...
                  </>
                ) : '📊 Ghi Chỉ Số & Gửi Kế Toán Duyệt'}
              </button>
            </form>

            {/* Info footer */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-sm">
              <p className="font-bold mb-2">📌 Lưu ý:</p>
              <div className="grid md:grid-cols-2 gap-1 opacity-90">
                <p>• Chỉ ghi cho căn hộ đang có người thuê</p>
                <p>• Chỉ số mới phải ≥ chỉ số cũ</p>
                <p>• Chụp ảnh rõ ràng, đủ ánh sáng</p>
                <p>• Kế toán sẽ xác nhận và phát hành hóa đơn</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB HISTORY ===== */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">📋 Lịch Sử Ghi Chỉ Số</h2>
              <button onClick={fetchRecentReadings} className="text-sm text-blue-600 hover:underline">
                🔄 Làm mới
              </button>
            </div>

            {recentReadings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p>Chưa có chỉ số nào được ghi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Căn Hộ', 'Tháng', 'Điện Cũ', 'Điện Mới', 'Nước Cũ', 'Nước Mới', 'Người Ghi', 'Trạng Thái'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentReadings.map(r => {
                      const cfg = STATUS_CONFIG[r.TrangThai] || { label: r.TrangThai, color: 'bg-gray-100 text-gray-800' };
                      return (
                        <tr key={r.ID} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-sm text-gray-900">{r.canho?.MaCanHo}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{r.ThangNam}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{r.ChiSoDienCu || 0}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-yellow-700">{r.ChiSoDienMoi}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{r.ChiSoNuocCu || 0}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-700">{r.ChiSoNuocMoi}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.nguoidung?.HoTen || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MeterReadingForm;
