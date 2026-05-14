// client/src/components/billing/ConfirmReadingModal.jsx
// Modal xác nhận chỉ số và phát hành hóa đơn

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/mediaUrl';

// Lightbox xem ảnh to
const ImageLightbox = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
    onClick={onClose}
  >
    <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
      <button
        onClick={onClose}
        className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 font-bold"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
      />
      <p className="text-center text-gray-300 text-sm mt-3">{alt}</p>
    </div>
  </div>
);

const ConfirmReadingModal = ({ reading, onClose }) => {
  const [formData, setFormData] = useState({
    ChiSoDienChinhThuc: reading.ChiSoDienMoi,
    ChiSoNuocChinhThuc: reading.ChiSoNuocMoi,
    GhiChuKeToan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null); // { src, alt }
  const [dichVuChuaTinh, setDichVuChuaTinh] = useState([]);
  const [loadingDichVu, setLoadingDichVu] = useState(true);

  // Giá điện EVN bậc thang (đồng bộ với billing.config.js backend)
  const ELECTRICITY_TIERS = [
    { from: 0,   to: 50,       price: 1984 },
    { from: 50,  to: 100,      price: 2050 },
    { from: 100, to: 200,      price: 2380 },
    { from: 200, to: 300,      price: 2998 },
    { from: 300, to: 400,      price: 3350 },
    { from: 400, to: Infinity, price: 3460 },
  ];
  const tinhTienDienBacThang = (soKwh) => {
    let remaining = Math.max(0, Number(soKwh));
    let total = 0;
    for (const tier of ELECTRICITY_TIERS) {
      if (remaining <= 0) break;
      const capacity = tier.to === Infinity ? remaining : (tier.to - tier.from);
      const inTier = Math.min(remaining, capacity);
      total += inTier * tier.price;
      remaining -= inTier;
    }
    return Math.round(total);
  };
  const WATER_PRICE = 10000;
  const COMMON_FEE = 200000;
  const CLEANING_FEE = 50000;

  // Fetch dịch vụ chưa tính tiền của căn hộ này
  React.useEffect(() => {
    const fetchDichVu = async () => {
      try {
        setLoadingDichVu(true);
        // Gọi API lấy yeucaudichvu với filter: CanHoID, TrangThai=DaXuLy, HoaDonID=null
        const response = await axios.get(`/yeucaudichvu`, {
          params: {
            CanHoID: reading.CanHoID,
            TrangThai: 'DaXuLy',
            HoaDonID: 'null', // Backend cần hỗ trợ filter này
          },
        });
        setDichVuChuaTinh(response.data.items || response.data || []);
      } catch (err) {
        console.error('Lỗi khi lấy dịch vụ:', err);
        // Không hiển thị lỗi cho user, chỉ log
      } finally {
        setLoadingDichVu(false);
      }
    };
    fetchDichVu();
  }, [reading.CanHoID]);

  const calculateEstimate = () => {
    const dienUsed = parseFloat(formData.ChiSoDienChinhThuc) - parseFloat(reading.ChiSoDienCu || 0);
    const nuocUsed = parseFloat(formData.ChiSoNuocChinhThuc) - parseFloat(reading.ChiSoNuocCu || 0);
    const tienDien = tinhTienDienBacThang(Math.max(0, dienUsed));
    const tienNuoc = Math.max(0, nuocUsed) * WATER_PRICE;
    const tienThue = parseFloat(reading.canho?.hopdong?.[0]?.GiaThue || 0);
    const tienDichVu = dichVuChuaTinh.reduce((sum, dv) => sum + parseFloat(dv.dichvu?.Gia || 0), 0);
    const tongTien = tienThue + tienDien + tienNuoc + COMMON_FEE + CLEANING_FEE + tienDichVu;
    return { dienUsed, nuocUsed, tienDien, tienNuoc, tienThue, phiChung: COMMON_FEE, phiVeSinh: CLEANING_FEE, tienDichVu, tongTien };
  };

  const estimate = calculateEstimate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const dienImgUrl = reading.AnhDongHoDien ? resolveMediaUrl(reading.AnhDongHoDien) : null;
  const nuocImgUrl = reading.AnhDongHoNuoc ? resolveMediaUrl(reading.AnhDongHoNuoc) : null;

  return createPortal(
    <>
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex-shrink-0">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex justify-between items-center rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Xác Nhận Chỉ Số & Phát Hành Hóa Đơn
              </h2>
              <p className="text-green-100 text-sm">
                Căn hộ {reading.canho?.MaCanHo} — Tháng {reading.ThangNam}
              </p>
            </div>
            <button onClick={() => onClose(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* ===== CHỈ SỐ NHÂN VIÊN GHI + ẢNH ===== */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Chỉ Số Nhân Viên Ghi
                {reading.nguoidung?.HoTen && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    — {reading.nguoidung.HoTen}
                    {reading.NgayGhi && ` (${new Date(reading.NgayGhi).toLocaleDateString('vi-VN')})`}
                  </span>
                )}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Điện */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Điện</p>
                  <p className="text-2xl font-bold text-yellow-700">{reading.ChiSoDienMoi} kWh</p>
                  <p className="text-xs text-gray-500 mt-1">Cũ: {reading.ChiSoDienCu || 0} kWh</p>
                  <p className="text-xs text-yellow-600 font-semibold mt-1">
                    Tiêu thụ: {(parseFloat(reading.ChiSoDienMoi) - parseFloat(reading.ChiSoDienCu || 0)).toFixed(1)} kWh
                  </p>

                  {/* Ảnh đồng hồ điện */}
                  {dienImgUrl ? (
                    <div className="mt-3">
                      <button type="button" onClick={() => setLightbox({ src: dienImgUrl, alt: 'Đồng hồ điện — ' + reading.canho?.MaCanHo })}
                        className="w-full group relative overflow-hidden rounded-lg border-2 border-yellow-300 hover:border-yellow-500 transition-all">
                        <img
                          src={dienImgUrl}
                          alt="Đồng hồ điện"
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={e => { e.target.closest('button').style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                          <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                            🔍 Xem to
                          </span>
                        </div>
                      </button>
                      <p className="text-xs text-center text-yellow-600 mt-1">Nhấn để xem ảnh to</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3 italic">Không có ảnh đồng hồ điện</p>
                  )}
                </div>

                {/* Nước */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Nước</p>
                  <p className="text-2xl font-bold text-blue-700">{reading.ChiSoNuocMoi} m³</p>
                  <p className="text-xs text-gray-500 mt-1">Cũ: {reading.ChiSoNuocCu || 0} m³</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    Tiêu thụ: {(parseFloat(reading.ChiSoNuocMoi) - parseFloat(reading.ChiSoNuocCu || 0)).toFixed(1)} m³
                  </p>

                  {/* Ảnh đồng hồ nước */}
                  {nuocImgUrl ? (
                    <div className="mt-3">
                      <button type="button" onClick={() => setLightbox({ src: nuocImgUrl, alt: 'Đồng hồ nước — ' + reading.canho?.MaCanHo })}
                        className="w-full group relative overflow-hidden rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-all">
                        <img
                          src={nuocImgUrl}
                          alt="Đồng hồ nước"
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={e => { e.target.closest('button').style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                          <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                            🔍 Xem to
                          </span>
                        </div>
                      </button>
                      <p className="text-xs text-center text-blue-600 mt-1">Nhấn để xem ảnh to</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3 italic">Không có ảnh đồng hồ nước</p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== XÁC NHẬN CHỈ SỐ CHÍNH THỨC ===== */}
            <div className="bg-green-50 rounded-xl p-5 border-2 border-green-300">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Xác Nhận Chỉ Số Chính Thức
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chỉ số điện chính thức (kWh) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" step="0.1" name="ChiSoDienChinhThuc"
                    value={formData.ChiSoDienChinhThuc} onChange={handleChange} required
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 font-semibold text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chỉ số nước chính thức (m³) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" step="0.1" name="ChiSoNuocChinhThuc"
                    value={formData.ChiSoNuocChinhThuc} onChange={handleChange} required
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 font-semibold text-lg" />
                </div>
              </div>
            </div>

            {/* ===== DỰ TÍNH HÓA ĐƠN ===== */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Dự Tính Hóa Đơn
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Tiền thuê căn hộ', value: estimate.tienThue, color: 'text-gray-900' },
                  { label: `Tiền điện (${Math.max(0, estimate.dienUsed).toFixed(1)} kWh — bậc thang EVN)`, value: estimate.tienDien, color: 'text-yellow-700' },
                  { label: `Tiền nước (${Math.max(0, estimate.nuocUsed).toFixed(1)} m³ × ${formatCurrency(WATER_PRICE)})`, value: estimate.tienNuoc, color: 'text-blue-700' },
                  { label: 'Phí quản lý chung', value: estimate.phiChung, color: 'text-gray-900' },
                  { label: 'Phí vệ sinh', value: estimate.phiVeSinh, color: 'text-gray-900' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700 text-sm">{label}</span>
                    <span className={`font-semibold ${color}`}>{formatCurrency(value)}</span>
                  </div>
                ))}

                {/* Hiển thị từng dịch vụ chưa tính tiền */}
                {loadingDichVu ? (
                  <div className="flex justify-center items-center py-3 text-gray-500 text-sm">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tải dịch vụ...
                  </div>
                ) : dichVuChuaTinh.length > 0 ? (
                  <>
                    <div className="pt-2 pb-1">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        Dịch vụ đã hoàn thành chưa tính tiền ({dichVuChuaTinh.length})
                      </p>
                    </div>
                    {dichVuChuaTinh.map((dv) => (
                      <div key={dv.ID} className="flex justify-between items-center py-2 border-b border-blue-200 bg-blue-50 px-2 rounded">
                        <span className="text-gray-700 text-sm">
                          {dv.dichvu?.TenDichVu || 'Dịch vụ'}
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(dv.NgayYeuCau).toLocaleDateString('vi-VN')})
                          </span>
                        </span>
                        <span className="font-semibold text-purple-700">{formatCurrency(dv.dichvu?.Gia || 0)}</span>
                      </div>
                    ))}
                  </>
                ) : null}

                <div className="flex justify-between items-center py-3 bg-blue-600 text-white rounded-lg px-4 mt-2">
                  <span className="font-bold text-lg">TỔNG CỘNG</span>
                  <span className="font-bold text-2xl">{formatCurrency(estimate.tongTien)}</span>
                </div>
              </div>
            </div>

            {/* ===== GHI CHÚ KẾ TOÁN ===== */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú của kế toán
              </label>
              <textarea name="GhiChuKeToan" value={formData.GhiChuKeToan} onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập ghi chú nếu có..." />
            </div>

            {/* ===== BUTTONS ===== */}
            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => onClose(false)}
                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl text-white font-bold transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : '✅ Xác Nhận & Phát Hành Hóa Đơn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ConfirmReadingModal;
