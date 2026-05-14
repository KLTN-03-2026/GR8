// client/src/pages/chisodiennuoc/MeterReadingForm.jsx
// Nhân viên kỹ thuật ghi chỉ số điện nước — điện và nước ghi riêng từng ngày

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import MonthYearPicker from '../../components/common/MonthYearPicker';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const STATUS_CONFIG = {
  ChoDienHoacNuoc:    { label: 'Chờ ghi đủ điện & nước', color: 'bg-orange-100 text-orange-800' },
  ChoDuyetKeToan:     { label: 'Chờ kế toán duyệt',      color: 'bg-yellow-100 text-yellow-800' },
  DaDuyetChoPhatHanh: { label: 'Đã duyệt — chờ ngày',    color: 'bg-blue-100 text-blue-800'    },
  DaDuyet:            { label: 'Đã duyệt',                color: 'bg-blue-100 text-blue-800'    },
  DaPhatHanhHoaDon:   { label: 'Đã phát hành HĐ',        color: 'bg-green-100 text-green-800'  },
  TuChoi:             { label: 'Từ chối',                 color: 'bg-red-100 text-red-800'      },
};

// ── Sub-form ghi 1 loại (điện hoặc nước) ──────────────────────────────────
const ReadingSubForm = ({ type, apartments, onSuccess }) => {
  const isDien = type === 'dien';
  const label  = isDien ? 'Điện' : 'Nước';
  const unit   = isDien ? 'kWh' : 'm³';
  const color  = isDien ? 'yellow' : 'blue';

  const [canHoID, setCanHoID]     = useState('');
  const [thangNam, setThangNam]   = useState(getCurrentMonth());
  const [chiSoMoi, setChiSoMoi]   = useState('');
  const [prevVal, setPrevVal]     = useState(0);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [existingReading, setExistingReading] = useState(null); // bản ghi tháng này nếu đã có
  const fileRef = useRef(null);

  const fetchPrev = useCallback(async (id, thang) => {
    if (!id) return;
    try {
      const res = await axios.get('/chisodiennuoc/prev', { params: { CanHoID: id, ThangNam: thang } });
      const d = res.data?.data;
      if (d) setPrevVal(isDien ? parseFloat(d.ChiSoDienCu || 0) : parseFloat(d.ChiSoNuocCu || 0));
      else setPrevVal(0);
    } catch { setPrevVal(0); }
  }, [isDien]);

  const fetchExisting = useCallback(async (id, thang) => {
    if (!id) return;
    try {
      const res = await axios.get('/chisodiennuoc', { params: { CanHoID: id, ThangNam: thang, limit: 1 } });
      const items = res.data?.data || [];
      setExistingReading(items[0] || null);
    } catch { setExistingReading(null); }
  }, []);

  useEffect(() => {
    if (canHoID && thangNam) {
      fetchPrev(canHoID, thangNam);
      fetchExisting(canHoID, thangNam);
    }
  }, [canHoID, thangNam, fetchPrev, fetchExisting]);

  const alreadyRecorded = existingReading && (
    isDien ? existingReading.ChiSoDienMoi !== null : existingReading.ChiSoNuocMoi !== null
  );
  // Chỉ cho sửa khi chưa kế toán duyệt
  const canEdit = alreadyRecorded && ['ChoDienHoacNuoc', 'ChoDuyetKeToan'].includes(existingReading?.TrangThai);
  const [editMode, setEditMode] = useState(false);
  const isLocked = alreadyRecorded && !editMode;

  const usage = chiSoMoi !== '' && !isNaN(parseFloat(chiSoMoi))
    ? Math.max(0, parseFloat(chiSoMoi) - prevVal).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (parseFloat(chiSoMoi) < prevVal) {
      setError(`Chỉ số mới (${chiSoMoi}) không thể nhỏ hơn chỉ số cũ (${prevVal})`);
      return;
    }
    setLoading(true);
    try {
      // Upload ảnh nếu có
      let photoUrl = '';
      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append(isDien ? 'AnhDongHoDien' : 'AnhDongHoNuoc', file);
        const upRes = await axios.post('/chisodiennuoc/upload-photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photoUrl = isDien
          ? upRes.data.data?.AnhDongHoDien || ''
          : upRes.data.data?.AnhDongHoNuoc || '';
        setUploading(false);
      }

      const payload = {
        CanHoID: parseInt(canHoID),
        ThangNam: thangNam,
        ...(isDien ? { ChiSoDienMoi: parseFloat(chiSoMoi) } : { ChiSoNuocMoi: parseFloat(chiSoMoi) }),
        ...(isDien && photoUrl ? { AnhDongHoDien: photoUrl } : {}),
        ...(!isDien && photoUrl ? { AnhDongHoNuoc: photoUrl } : {}),
      };

      if (editMode && existingReading) {
        // Sửa bản ghi đã có — dùng PUT
        await axios.put(`/chisodiennuoc/${existingReading.ID}`, {
          ...(isDien ? { ChiSoDienMoi: parseFloat(chiSoMoi) } : { ChiSoNuocMoi: parseFloat(chiSoMoi) }),
          ...(isDien && photoUrl ? { AnhDongHoDien: photoUrl } : {}),
          ...(!isDien && photoUrl ? { AnhDongHoNuoc: photoUrl } : {}),
        });
      } else {
        await axios.post('/chisodiennuoc', payload);
      }

      setSuccess(`${editMode ? 'Cập nhật' : 'Ghi'} chỉ số ${label.toLowerCase()} tháng ${thangNam} thành công!`);
      setCanHoID(''); setThangNam(getCurrentMonth()); setChiSoMoi('');
      setFile(null); setPreview(null); setPrevVal(0); setExistingReading(null); setEditMode(false);
      if (fileRef.current) fileRef.current.value = '';
      onSuccess?.();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi ghi chỉ số');
    } finally {
      setLoading(false); setUploading(false);
    }
  };

  const borderColor = `border-${color}-300`;
  const bgColor     = `bg-${color}-50`;

  return (
    <div className={`bg-white rounded-xl border-2 ${isDien ? 'border-yellow-200' : 'border-blue-200'} p-5`}>
      <h3 className="text-base font-bold text-gray-900 mb-4">
        Ghi chỉ số {label} ({unit})
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Căn hộ */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Căn hộ</label>
          <select value={canHoID} onChange={e => setCanHoID(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">-- Chọn căn hộ --</option>
            {apartments.map(apt => (
              <option key={apt.ID} value={apt.ID}>
                {apt.MaCanHo} — Phòng {apt.SoPhong} Tầng {apt.Tang}
              </option>
            ))}
          </select>
        </div>

        {/* Tháng */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tháng/Năm</label>
          <MonthYearPicker value={thangNam} onChange={setThangNam} maxValue={getCurrentMonth()} />
        </div>

        {/* Trạng thái bản ghi hiện tại */}
        {canHoID && existingReading && (
          <div className={`text-xs px-3 py-2 rounded-lg flex items-center justify-between gap-2 ${
            isLocked
              ? 'bg-orange-50 text-orange-700 border border-orange-200'
              : alreadyRecorded && editMode
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}>
            <span>
              {isLocked
                ? `Chỉ số ${label.toLowerCase()} tháng ${thangNam} đã ghi: ${isDien ? existingReading.ChiSoDienMoi : existingReading.ChiSoNuocMoi} ${unit}`
                : alreadyRecorded && editMode
                ? `Đang sửa chỉ số ${label.toLowerCase()} tháng ${thangNam}`
                : `Tháng ${thangNam} chưa có chỉ số ${label.toLowerCase()}. Bổ sung vào đây.`
              }
            </span>
            {isLocked && canEdit && (
              <button type="button" onClick={() => {
                setEditMode(true);
                setChiSoMoi(String(isDien ? existingReading.ChiSoDienMoi : existingReading.ChiSoNuocMoi));
              }}
                className="text-xs font-semibold underline whitespace-nowrap">
                Sửa lại
              </button>
            )}
            {alreadyRecorded && editMode && (
              <button type="button" onClick={() => { setEditMode(false); setChiSoMoi(''); }}
                className="text-xs font-semibold underline whitespace-nowrap">
                Hủy
              </button>
            )}
            {isLocked && !canEdit && (
              <span className="text-xs opacity-70">(Đã kế toán duyệt, không thể sửa)</span>
            )}
          </div>
        )}

        {/* Chỉ số cũ */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Chỉ số cũ ({unit})</label>
          <input type="number" value={prevVal} disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-600 font-medium" />
        </div>

        {/* Chỉ số mới */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Chỉ số mới ({unit}) <span className="text-red-500">*</span>
          </label>
          <input type="number" step="0.1" value={chiSoMoi}
            onChange={e => setChiSoMoi(e.target.value)}
            min={prevVal} required
            disabled={alreadyRecorded && !editMode}
            className={`w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 ${
              isDien ? 'border-yellow-300 focus:ring-yellow-400' : 'border-blue-300 focus:ring-blue-400'
            } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            placeholder={`VD: ${isDien ? '1420' : '85.3'}`} />
        </div>

        {/* Tiêu thụ */}
        {usage !== null && (
          <div className={`text-center py-2 rounded-lg ${isDien ? 'bg-yellow-50' : 'bg-blue-50'}`}>
            <p className="text-xs text-gray-500">Tiêu thụ tháng này</p>
            <p className={`text-xl font-bold ${isDien ? 'text-yellow-700' : 'text-blue-700'}`}>
              {usage} {unit}
            </p>
          </div>
        )}

        {/* Upload ảnh */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ảnh đồng hồ (tùy chọn)</label>
          <input ref={fileRef} type="file" accept="image/*"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
            }}
            className="hidden" id={`upload-${type}`} />
          {!preview ? (
            <label htmlFor={`upload-${type}`}
              className={`flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                isDien ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50' : 'border-blue-300 text-blue-600 hover:bg-blue-50'
              }`}>
              Chọn ảnh
            </label>
          ) : (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit"
          disabled={loading || uploading || !canHoID || !chiSoMoi || isLocked}
          className={`w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${
            loading || uploading || !canHoID || !chiSoMoi || isLocked
              ? 'bg-gray-400 cursor-not-allowed'
              : isDien ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
          {uploading ? 'Đang upload ảnh...' : loading ? 'Đang ghi...' : editMode ? `Cập nhật chỉ số ${label}` : `Ghi chỉ số ${label}`}
        </button>
      </form>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const MeterReadingForm = () => {
  const [apartments, setApartments]         = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(true);
  const [activeTab, setActiveTab]           = useState('form');
  const [recentReadings, setRecentReadings] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [historyFilter, setHistoryFilter]   = useState({ ThangNam: '', CanHoID: '' });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshKey, setRefreshKey]         = useState(0);

  useEffect(() => {
    axios.get('/apartments', { params: { TrangThai: 'DaThue' } })
      .then(res => {
        let data = res.data?.data || [];
        if (!Array.isArray(data)) data = data.items || [];
        setApartments(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoadingApartments(false));
  }, []);

  const doFetchHistory = useCallback(async (page, filter) => {
    try {
      setHistoryLoading(true);
      const params = { page, limit: 20 };
      if (filter?.ThangNam) params.ThangNam = filter.ThangNam;
      if (filter?.CanHoID)  params.CanHoID  = filter.CanHoID;
      const res = await axios.get('/chisodiennuoc', { params });
      setRecentReadings(Array.isArray(res.data?.data) ? res.data.data : []);
      setHistoryPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch { setRecentReadings([]); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') doFetchHistory(1, historyFilter);
  }, [activeTab, historyFilter, refreshKey, doFetchHistory]);

  const handleSuccess = () => setRefreshKey(k => k + 1);

  if (loadingApartments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-full">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Ghi chỉ số điện nước</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ghi điện và nước riêng từng ngày — hệ thống tự ghép khi đủ cả hai
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'form',    label: 'Ghi chỉ số' },
            { key: 'history', label: `Lịch sử${historyPagination.total > 0 ? ` (${historyPagination.total})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB FORM ── */}
        {activeTab === 'form' && (
          <div className="space-y-4">
            {/* Hướng dẫn */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">Quy trình ghi chỉ số:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
                <li>Ghi chỉ số điện vào ngày tính điện của căn hộ</li>
                <li>Ghi chỉ số nước vào ngày tính nước của căn hộ (có thể khác ngày)</li>
                <li>Khi đủ cả hai, bản ghi tự chuyển sang "Chờ kế toán duyệt"</li>
              </ol>
            </div>

            {/* 2 form song song */}
            <div className="grid md:grid-cols-2 gap-5">
              <ReadingSubForm type="dien" apartments={apartments} onSuccess={handleSuccess} />
              <ReadingSubForm type="nuoc" apartments={apartments} onSuccess={handleSuccess} />
            </div>
          </div>
        )}

        {/* ── TAB HISTORY ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Filter */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Tháng:</label>
                <MonthYearPicker
                  value={historyFilter.ThangNam || getCurrentMonth()}
                  onChange={v => setHistoryFilter(f => ({ ...f, ThangNam: v }))}
                />
                {historyFilter.ThangNam && (
                  <button onClick={() => setHistoryFilter(f => ({ ...f, ThangNam: '' }))}
                    className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Căn hộ:</label>
                <select value={historyFilter.CanHoID}
                  onChange={e => setHistoryFilter(f => ({ ...f, CanHoID: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                  <option value="">Tất cả</option>
                  {apartments.map(apt => (
                    <option key={apt.ID} value={apt.ID}>{apt.MaCanHo} — P.{apt.SoPhong}</option>
                  ))}
                </select>
              </div>
              {(historyFilter.ThangNam || historyFilter.CanHoID) && (
                <button onClick={() => setHistoryFilter({ ThangNam: '', CanHoID: '' })}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg">
                  Xóa bộ lọc
                </button>
              )}
              <button onClick={() => doFetchHistory(1, historyFilter)}
                className="ml-auto text-xs text-blue-600 hover:underline">Làm mới</button>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentReadings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Chưa có dữ liệu</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Căn hộ', 'Tháng', 'Điện cũ', 'Điện mới', 'Ngày ghi điện', 'Nước cũ', 'Nước mới', 'Ngày ghi nước', 'Ảnh', 'Người ghi', 'Trạng thái'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentReadings.map(r => {
                        const cfg = STATUS_CONFIG[r.TrangThai] || { label: r.TrangThai, color: 'bg-gray-100 text-gray-700' };
                        return (
                          <tr key={r.ID} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 font-semibold text-gray-900 whitespace-nowrap">{r.canho?.MaCanHo}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.ThangNam}</td>
                            <td className="px-3 py-2.5 text-gray-500">{r.ChiSoDienCu ?? '—'}</td>
                            <td className="px-3 py-2.5 font-medium text-yellow-700">
                              {r.ChiSoDienMoi ?? <span className="text-gray-300">Chưa ghi</span>}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                              {r.NgayGhiDien ? new Date(r.NgayGhiDien).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500">{r.ChiSoNuocCu ?? '—'}</td>
                            <td className="px-3 py-2.5 font-medium text-blue-700">
                              {r.ChiSoNuocMoi ?? <span className="text-gray-300">Chưa ghi</span>}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                              {r.NgayGhiNuoc ? new Date(r.NgayGhiNuoc).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1">
                                {r.AnhDongHoDien && (
                                  <a href={resolveMediaUrl(r.AnhDongHoDien)} target="_blank" rel="noopener noreferrer"
                                    className="w-7 h-7 rounded overflow-hidden border border-yellow-300 block">
                                    <img src={resolveMediaUrl(r.AnhDongHoDien)} alt="Điện" className="w-full h-full object-cover" />
                                  </a>
                                )}
                                {r.AnhDongHoNuoc && (
                                  <a href={resolveMediaUrl(r.AnhDongHoNuoc)} target="_blank" rel="noopener noreferrer"
                                    className="w-7 h-7 rounded overflow-hidden border border-blue-300 block">
                                    <img src={resolveMediaUrl(r.AnhDongHoNuoc)} alt="Nước" className="w-full h-full object-cover" />
                                  </a>
                                )}
                                {!r.AnhDongHoDien && !r.AnhDongHoNuoc && <span className="text-gray-300 text-xs">—</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.nguoidung?.HoTen || '—'}</td>
                            <td className="px-3 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {historyPagination.totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Trang {historyPagination.page}/{historyPagination.totalPages} · {historyPagination.total} bản ghi
                    </p>
                    <div className="flex gap-1.5">
                      <button disabled={historyPagination.page <= 1}
                        onClick={() => doFetchHistory(historyPagination.page - 1, historyFilter)}
                        className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Trước</button>
                      <button disabled={historyPagination.page >= historyPagination.totalPages}
                        onClick={() => doFetchHistory(historyPagination.page + 1, historyFilter)}
                        className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Sau →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MeterReadingForm;
