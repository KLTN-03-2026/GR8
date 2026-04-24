// client/src/pages/chisodiennuoc/PendingReadingsList.jsx
// BƯỚC 2: Kế toán xem danh sách chỉ số chờ duyệt và xác nhận - HOÀN THIỆN

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import ConfirmReadingModal from '../../components/billing/ConfirmReadingModal';

const PendingReadingsList = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ ThangNam: '', CanHoID: '' });
  const [stats, setStats] = useState({ pending: 0, approved: 0, issued: 0 });
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [allReadings, setAllReadings] = useState([]);

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
        approved: Array.isArray(allData) ? allData.filter(r => r.TrangThai === 'DaDuyet').length : 0,
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

  const handleModalClose = (didConfirm) => {
    setShowModal(false);
    setSelectedReading(null);
    if (didConfirm) {
      setSuccess('✅ Đã xác nhận và phát hành hóa đơn thành công!');
      setTimeout(() => setSuccess(''), 5000);
    }
    fetchReadings();
  };

  const calcUsage = (newVal, oldVal) => (parseFloat(newVal) - parseFloat(oldVal || 0)).toFixed(1);

  const STATUS_CONFIG = {
    ChoDuyetKeToan:   { label: 'Chờ duyệt',       color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
    DaDuyet:          { label: 'Đã duyệt',         color: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '✅' },
    DaPhatHanhHoaDon: { label: 'Đã phát hành HĐ', color: 'bg-green-100 text-green-800 border-green-300',    icon: '📄' },
    TuChoi:           { label: 'Từ chối',           color: 'bg-red-100 text-red-800 border-red-300',          icon: '❌' },
  };

  const displayList = activeTab === 'pending' ? readings : allReadings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Duyệt Chỉ Số Điện Nước</h1>
            <p className="text-gray-500 mt-1">Xác nhận chỉ số và phát hành hóa đơn cho người thuê</p>
          </div>
          <button onClick={fetchReadings}
            className="flex items-center px-5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Chờ duyệt</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Đã duyệt</p>
            <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Đã phát hành HĐ</p>
            <p className="text-3xl font-bold text-green-600">{stats.issued}</p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg text-green-800 font-medium">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg flex items-center">
            <span className="text-red-800 font-medium flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-500">✕</button>
          </div>
        )}

        {/* Tabs + Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'pending' ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              ⏳ Chờ Duyệt ({stats.pending})
            </button>
            <button onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'all' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              📋 Tất Cả
            </button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <label className="text-sm font-semibold text-gray-600">Lọc tháng:</label>
            <input type="month" value={filter.ThangNam}
              onChange={e => setFilter(f => ({ ...f, ThangNam: e.target.value }))}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
            {filter.ThangNam && (
              <button onClick={() => setFilter({ ThangNam: '', CanHoID: '' })}
                className="text-sm text-gray-500 hover:text-gray-700">✕ Xóa</button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">{activeTab === 'pending' ? '✅' : '📭'}</div>
            <p className="text-lg font-semibold">
              {activeTab === 'pending' ? 'Không có chỉ số nào chờ duyệt' : 'Chưa có dữ liệu chỉ số'}
            </p>
            <p className="text-sm mt-1">
              {activeTab === 'pending' ? 'Tất cả chỉ số đã được xử lý' : 'Nhân viên kỹ thuật chưa ghi chỉ số'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayList.map(reading => {
              const dienUsed = calcUsage(reading.ChiSoDienMoi, reading.ChiSoDienCu);
              const nuocUsed = calcUsage(reading.ChiSoNuocMoi, reading.ChiSoNuocCu);
              const tenant = reading.canho?.hopdong?.[0]?.nguoidung;
              const giaThue = reading.canho?.hopdong?.[0]?.GiaThue;
              const cfg = STATUS_CONFIG[reading.TrangThai] || STATUS_CONFIG.ChoDuyetKeToan;

              return (
                <div key={reading.ID}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-100 overflow-hidden">

                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4 flex items-center justify-between">
                    <div className="text-white">
                      <h3 className="text-lg font-bold">
                        🏠 {reading.canho?.MaCanHo} — Phòng {reading.canho?.SoPhong} — Tầng {reading.canho?.Tang}
                      </h3>
                      <p className="text-slate-300 text-sm mt-0.5">
                        Tháng {reading.ThangNam} &nbsp;•&nbsp; Ghi ngày {new Date(reading.NgayGhi).toLocaleDateString('vi-VN')}
                        {reading.nguoidung && ` &nbsp;•&nbsp; ${reading.nguoidung.HoTen}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className="p-5">
                    {/* Tenant info */}
                    {tenant && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-6 text-sm">
                        <div>👤 <span className="font-semibold">{tenant.HoTen}</span></div>
                        {tenant.SoDienThoai && <div>📞 {tenant.SoDienThoai}</div>}
                        {giaThue && <div>💰 Giá thuê: <span className="font-semibold text-indigo-600">{formatCurrency(giaThue)}</span></div>}
                      </div>
                    )}

                    {/* Meter readings */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Điện */}
                      <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-gray-900">⚡ Điện</span>
                          {reading.AnhDongHoDien && reading.AnhDongHoDien !== 'https://placeholder.com/meter' && (
                            <a href={reading.AnhDongHoDien} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                              📷 Xem ảnh
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center bg-white p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Cũ</p>
                            <p className="font-bold">{reading.ChiSoDienCu || 0}</p>
                            <p className="text-gray-400 text-xs">kWh</p>
                          </div>
                          <div className="text-center bg-yellow-100 p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Mới</p>
                            <p className="font-bold text-yellow-700">{reading.ChiSoDienMoi}</p>
                            <p className="text-gray-400 text-xs">kWh</p>
                          </div>
                          <div className="text-center bg-yellow-200 p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Dùng</p>
                            <p className="font-bold text-yellow-800">{dienUsed}</p>
                            <p className="text-gray-400 text-xs">kWh</p>
                          </div>
                        </div>
                        <p className="text-center text-xs text-yellow-700 mt-2 font-semibold">
                          ≈ {formatCurrency(parseFloat(dienUsed) * 4000)}
                        </p>
                      </div>

                      {/* Nước */}
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-gray-900">💧 Nước</span>
                          {reading.AnhDongHoNuoc && reading.AnhDongHoNuoc !== 'https://placeholder.com/meter' && (
                            <a href={reading.AnhDongHoNuoc} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                              📷 Xem ảnh
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center bg-white p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Cũ</p>
                            <p className="font-bold">{reading.ChiSoNuocCu || 0}</p>
                            <p className="text-gray-400 text-xs">m³</p>
                          </div>
                          <div className="text-center bg-blue-100 p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Mới</p>
                            <p className="font-bold text-blue-700">{reading.ChiSoNuocMoi}</p>
                            <p className="text-gray-400 text-xs">m³</p>
                          </div>
                          <div className="text-center bg-blue-200 p-2 rounded-lg">
                            <p className="text-gray-500 text-xs">Dùng</p>
                            <p className="font-bold text-blue-800">{nuocUsed}</p>
                            <p className="text-gray-400 text-xs">m³</p>
                          </div>
                        </div>
                        <p className="text-center text-xs text-blue-700 mt-2 font-semibold">
                          ≈ {formatCurrency(parseFloat(nuocUsed) * 10000)}
                        </p>
                      </div>
                    </div>

                    {/* Estimated total */}
                    {giaThue && (
                      <div className="bg-indigo-50 rounded-lg p-3 mb-4 flex items-center justify-between text-sm border border-indigo-200">
                        <span className="text-gray-600">Dự tính tổng hóa đơn:</span>
                        <span className="font-bold text-indigo-700 text-lg">
                          {formatCurrency(
                            parseFloat(giaThue) +
                            parseFloat(dienUsed) * 4000 +
                            parseFloat(nuocUsed) * 10000 +
                            200000 + 50000
                          )}
                        </span>
                      </div>
                    )}

                    {/* Ghi chú kế toán nếu có */}
                    {reading.GhiChuKeToan && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm border border-gray-200">
                        <span className="font-semibold text-gray-700">Ghi chú KT: </span>
                        <span className="text-gray-600">{reading.GhiChuKeToan}</span>
                      </div>
                    )}

                    {/* Action */}
                    {reading.TrangThai === 'ChoDuyetKeToan' && (
                      <button
                        onClick={() => handleConfirm(reading)}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-[1.01]"
                      >
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        ✅ Xác Nhận & Phát Hành Hóa Đơn
                      </button>
                    )}
                    {reading.TrangThai === 'DaPhatHanhHoaDon' && (
                      <div className="w-full py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-xl font-semibold text-center">
                        ✅ Đã phát hành hóa đơn — {reading.NgayKeToanDuyet ? new Date(reading.NgayKeToanDuyet).toLocaleDateString('vi-VN') : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
