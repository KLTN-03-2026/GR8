// client/src/pages/chisodiennuoc/PendingReadingsList.jsx
// BƯỚC 2: Kế toán xem danh sách chỉ số chờ duyệt và xác nhận - HOÀN THIỆN

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import ConfirmReadingModal from '../../components/billing/ConfirmReadingModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';

// Hàm tính tiền điện bậc thang EVN (đồng bộ với backend)
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

const PendingReadingsList = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ ThangNam: '', CanHoID: '' });
  const [stats, setStats] = useState({ pending: 0, approved: 0, issued: 0 });
  const [activeTab, setActiveTab] = useState('pending');
  const [allReadings, setAllReadings] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { src, alt }

  useEffect(() => { fetchReadings(); }, [filter, activeTab]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'pending') {
        // Lấy chỉ số chờ duyệt
        const res = await axios.get('/chisodiennuoc/pending', {
          params: { ...(filter.ThangNam && { ThangNam: filter.ThangNam }) }
        });
        const data = res.data.data || [];
        setReadings(Array.isArray(data) ? data : []);
      } else {
        // Lấy tất cả chỉ số
        const res = await axios.get('/chisodiennuoc', {
          params: { ...(filter.ThangNam && { ThangNam: filter.ThangNam }) }
        });
        const data = res.data.data || [];
        setAllReadings(Array.isArray(data) ? data : []);
      }

      // Fetch stats
      const [pendingRes, allRes] = await Promise.all([
        axios.get('/chisodiennuoc/pending').catch(() => ({ data: { data: [] } })),
        axios.get('/chisodiennuoc').catch(() => ({ data: { data: [] } })),
      ]);
      const pendingData = pendingRes.data.data || [];
      const allData = allRes.data.data || [];
      setStats({
        pending: Array.isArray(pendingData) ? pendingData.length : 0,
        approved: Array.isArray(allData) ? allData.filter(r => r.TrangThai === 'DaDuyetChoPhatHanh').length : 0,
        issued: Array.isArray(allData) ? allData.filter(r => r.TrangThai === 'DaPhatHanhHoaDon').length : 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chỉ số');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (reading) => {
    setSelectedReading(reading);
    setShowModal(true);
  };

  const handleModalClose = (didConfirm, result) => {
    setShowModal(false);
    setSelectedReading(null);
    if (didConfirm) {
      if (result?.issued === false) {
        setSuccess(`✅ Đã duyệt số liệu. ${result.message}`);
      } else {
        setSuccess('✅ Đã xác nhận và phát hành hóa đơn thành công!');
      }
      setTimeout(() => setSuccess(''), 6000);
    }
    fetchReadings();
  };

  const calcUsage = (newVal, oldVal) => (parseFloat(newVal) - parseFloat(oldVal || 0)).toFixed(1);

  const STATUS_CONFIG = {
    ChoDuyetKeToan:     { label: 'Chờ duyệt',            color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    DaDuyetChoPhatHanh: { label: 'Đã duyệt — chờ ngày',   color: 'bg-blue-100 text-blue-800 border-blue-300'     },
    DaPhatHanhHoaDon:   { label: 'Đã phát hành HĐ',       color: 'bg-green-100 text-green-800 border-green-300'  },
    TuChoi:             { label: 'Từ chối',                color: 'bg-red-100 text-red-800 border-red-300'        },
  };

  const displayList = activeTab === 'pending' ? readings : allReadings;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
            onClick={() => setLightbox(null)}>
            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 font-bold">✕</button>
              <img src={lightbox.src} alt={lightbox.alt}
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
              <p className="text-center text-gray-300 text-sm mt-3">{lightbox.alt}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Duyệt Chỉ Số Điện Nước</h1>
            <p className="text-gray-500 mt-1">Xác nhận chỉ số và phát hành hóa đơn cho người thuê</p>
          </div>
          <button onClick={fetchReadings}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-yellow-500">
            <p className="text-xs text-gray-500 font-medium">Chờ duyệt</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-500 font-medium">Đã duyệt</p>
            <p className="text-2xl font-semibold text-blue-600">{stats.approved}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-green-500">
            <p className="text-xs text-gray-500 font-medium">Đã phát hành HĐ</p>
            <p className="text-2xl font-semibold text-green-600">{stats.issued}</p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg text-green-800 font-medium">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg flex items-center">
            <span className="text-red-800 font-medium flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-500"></button>
          </div>
        )}

        {/* Tabs + Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'pending' ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
               Chờ Duyệt ({stats.pending})
            </button>
            <button onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'all' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
               Tất Cả
            </button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <label className="text-sm font-semibold text-gray-600">Lọc tháng:</label>
            <div className="flex gap-2">
              {['1','2','3','4','5','6','7','8','9','10','11','12'].map(m => {
                const val = `${new Date().getFullYear()}-${m.padStart(2,'0')}`;
                const selected = filter.ThangNam === val;
                return (
                  <button key={m}
                    onClick={() => setFilter(f => ({ ...f, ThangNam: selected ? '' : val }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selected ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                    T{m}
                  </button>
                );
              })}
              {filter.ThangNam && (
                <button onClick={() => setFilter(f => ({ ...f, ThangNam: '' }))}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
            {filter.ThangNam && (
              <button onClick={() => setFilter({ ThangNam: '', CanHoID: '' })}
                className="text-sm text-gray-500 hover:text-gray-700"> Xóa</button>
            )}
          </div>
        </div>

        {/* List - Table Layout */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <p className="text-lg font-semibold">
              {activeTab === 'pending' ? 'Không có chỉ số nào chờ duyệt' : 'Chưa có dữ liệu chỉ số'}
            </p>
            <p className="text-sm mt-1">
              {activeTab === 'pending' ? 'Tất cả chỉ số đã được xử lý' : 'Nhân viên kỹ thuật chưa ghi chỉ số'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã căn hộ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phòng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người thuê</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tháng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tính tiền</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Dự tính tổng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày ghi</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayList.map(reading => {
                  const dienUsed = calcUsage(reading.ChiSoDienMoi, reading.ChiSoDienCu);
                  const nuocUsed = calcUsage(reading.ChiSoNuocMoi, reading.ChiSoNuocCu);
                  const tenant = reading.canho?.hopdong?.[0]?.nguoidung;
                  const giaThue = reading.canho?.hopdong?.[0]?.GiaThue || 0;
                  const duTinh = parseFloat(giaThue) + tinhTienDienBacThang(parseFloat(dienUsed)) + parseFloat(nuocUsed) * 10000 + 200000 + 50000;
                  const cfg = STATUS_CONFIG[reading.TrangThai] || STATUS_CONFIG.ChoDuyetKeToan;

                  return (
                    <tr key={reading.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{reading.canho?.MaCanHo || '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reading.canho?.SoPhong || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant?.HoTen || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reading.ThangNam}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        Điện: {reading.canho?.NgayTinhDien || 3}, Nước: {reading.canho?.NgayTinhNuoc || 2}, Tiền nhà: {reading.canho?.NgayTinhTienNha || 5}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-gray-900">{formatCurrency(duTinh)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(reading.NgayGhi).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {reading.TrangThai === 'ChoDuyetKeToan' ? (
                          <button
                            onClick={() => handleConfirm(reading)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Chi tiết
                          </button>
                        ) : reading.TrangThai === 'DaPhatHanhHoaDon' ? (
                          <button
                            onClick={() => handleConfirm(reading)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                          >
                            Chỉnh sửa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConfirm(reading)}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedReading && (
        <ConfirmReadingModal
          reading={selectedReading}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default PendingReadingsList;
