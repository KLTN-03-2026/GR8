// client/src/pages/Assets.jsx
// Quản lý tài sản - nhóm theo căn hộ

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import * as XLSX from 'xlsx';

const TINH_TRANG = {
  Tot:     { label: 'Tốt',       color: 'bg-green-100 text-green-800 border-green-200' },
  Hong:    { label: 'Hỏng',      color: 'bg-red-100 text-red-800 border-red-200' },
  DangSua: { label: 'Đang sửa',  color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  Mat:     { label: 'Mất',       color: 'bg-gray-100 text-gray-800 border-gray-200' },
  Cu:      { label: 'Cũ',        color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const LOAI_TS = {
  ThietBiCanHo: 'Thiết bị căn hộ',
  NoiThat:      'Nội thất',
  ThietBiDien:  'Thiết bị điện',
  ThietBiChung: 'Thiết bị chung',
  CoSoVatChat:  'Cơ sở vật chất',
};

const EMPTY_FORM = {
  MaTaiSan: '', TenTaiSan: '', LoaiTaiSan: 'ThietBiCanHo',
  CanHoID: '', ViTri: '', SoLuong: 1, TinhTrang: 'Tot',
  NgayMua: '', GiaTri: '', NhaCungCap: '', GhiChu: '',
};

//  Modal thêm / sửa 
const AssetModal = ({ asset, canhoList, onClose, onSaved }) => {
  const isEdit = !!asset;
  const [form, setForm] = useState(
    isEdit
      ? {
          ...asset,
          CanHoID: asset.CanHoID ?? '',
          NgayMua: asset.NgayMua ? asset.NgayMua.slice(0, 10) : '',
          GiaTri: asset.GiaTri ?? '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await axios.put(`/taisan/${asset.ID}`, form);
      } else {
        await axios.post('/taisan', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Cập nhật tài sản' : 'Thêm tài sản mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã tài sản *</label>
              <input
                required
                value={form.MaTaiSan}
                onChange={(e) => set('MaTaiSan', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: TS-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản *</label>
              <input
                required
                value={form.TenTaiSan}
                onChange={(e) => set('TenTaiSan', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: Máy lạnh Daikin"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài sản</label>
              <select
                value={form.LoaiTaiSan}
                onChange={(e) => set('LoaiTaiSan', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(LOAI_TS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Căn hộ *</label>
              <select
                required
                value={form.CanHoID}
                onChange={(e) => set('CanHoID', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Chọn căn hộ --</option>
                {canhoList.map((c) => (
                  <option key={c.ID} value={c.ID}>
                    {c.MaCanHo} - Phòng {c.SoPhong} (Tầng {c.Tang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
              <select
                value={form.TinhTrang}
                onChange={(e) => set('TinhTrang', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(TINH_TRANG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input
                type="number" min="1"
                value={form.SoLuong}
                onChange={(e) => set('SoLuong', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (VNĐ)</label>
              <input
                type="number" min="0"
                value={form.GiaTri}
                onChange={(e) => set('GiaTri', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
              <input
                type="date"
                value={form.NgayMua}
                onChange={(e) => set('NgayMua', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
              <input
                value={form.ViTri}
                onChange={(e) => set('ViTri', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: Phòng ngủ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
              <input
                value={form.NhaCungCap}
                onChange={(e) => set('NhaCungCap', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: Daikin Vietnam"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={form.GhiChu}
              onChange={(e) => set('GhiChu', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Nhóm tài sản theo căn hộ ─────────────────────────────────────────────────
const ApartmentGroup = ({ canhoKey, assets, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  const totalValue = assets.reduce((s, a) => s + (Number(a.GiaTri) || 0) * (Number(a.SoLuong) || 1), 0);
  const badCnt     = assets.filter(a => ['Hong', 'Mat', 'DangSua'].includes(a.TinhTrang)).length;

  // Lấy thông tin căn hộ từ phần tử đầu tiên
  const canho = assets[0]?.canho;
  const label = canho
    ? `${canho.MaCanHo} — Phòng ${canho.SoPhong}, Tầng ${canho.Tang}`
    : canhoKey;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header nhóm */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-gray-800">{label}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {assets.length} tài sản
          </span>
          {badCnt > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              ⚠ {badCnt} cần xử lý
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-indigo-600">{formatCurrency(totalValue)}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Bảng tài sản */}
      {open && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                {['Mã TS', 'Tên tài sản', 'Loại', 'Vị trí', 'Tình trạng', 'SL', 'Giá trị', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map(a => {
                const tt = TINH_TRANG[a.TinhTrang];
                return (
                  <tr key={a.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{a.MaTaiSan}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{a.TenTaiSan}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{LOAI_TS[a.LoaiTaiSan] || a.LoaiTaiSan}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{a.ViTri || '—'}</td>
                    <td className="px-4 py-2.5">
                      {tt
                        ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tt.color}`}>{tt.label}</span>
                        : <span className="text-gray-400 text-xs">{a.TinhTrang}</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-700">{a.SoLuong ?? 1}</td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                      {a.GiaTri != null ? formatCurrency(a.GiaTri) : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onEdit(a)}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => onDelete(a.ID)}
                          className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer tổng giá trị nhóm */}
            <tfoot>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">
                  Tổng giá trị căn hộ:
                </td>
                <td className="px-4 py-2 text-sm font-bold text-indigo-600 whitespace-nowrap">
                  {formatCurrency(totalValue)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Trang chính ───────────────────────────────────────────────────────────────
const Assets = () => {
  const [assets, setAssets]       = useState([]);
  const [canhoList, setCanhoList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [filterTinhTrang, setFilterTinhTrang] = useState('');
  const [filterLoai, setFilterLoai]           = useState('');
  const [filterCanHo, setFilterCanHo]         = useState(''); // lọc theo căn hộ cụ thể
  const [modal, setModal]         = useState(null); // null | 'add' | asset-object
  const [deleteId, setDeleteId]   = useState(null);
  const [toast, setToast]         = useState('');
  const importRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importCanHoID, setImportCanHoID] = useState('');
  const [importFile, setImportFile] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // Download file template Excel mẫu (không cần cột Mã căn hộ)
  const handleDownloadTemplate = () => {
    const template = [
      { 'Mã tài sản': 'TS001', 'Tên tài sản': 'Điều hòa Daikin 12000BTU', 'Loại tài sản': 'ThietBiDien', 'Vị trí': 'Phòng khách', 'Số lượng': 1, 'Tình trạng': 'Tot', 'Giá trị': 8500000, 'Ngày mua': '2024-01-15', 'Nhà cung cấp': 'Daikin VN', 'Ghi chú': 'Bảo hành 2 năm' },
      { 'Mã tài sản': 'TS002', 'Tên tài sản': 'Tủ lạnh Samsung 300L',      'Loại tài sản': 'ThietBiCanHo', 'Vị trí': 'Bếp',         'Số lượng': 1, 'Tình trạng': 'Tot', 'Giá trị': 6200000, 'Ngày mua': '2024-02-10', 'Nhà cung cấp': 'Samsung VN',  'Ghi chú': '' },
      { 'Mã tài sản': 'TS003', 'Tên tài sản': 'Sofa 3 chỗ',                'Loại tài sản': 'NoiThat',      'Vị trí': 'Phòng khách', 'Số lượng': 1, 'Tình trạng': 'Tot', 'Giá trị': 4500000, 'Ngày mua': '2024-03-01', 'Nhà cung cấp': 'Hòa Phát',     'Ghi chú': '' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [14,22,18,16,10,12,12,12,18,20].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TaiSan');
    XLSX.writeFile(wb, 'template_tai_san.xlsx');
  };

  // Upload file Excel với CanHoID đã chọn
  const handleImportExcel = async () => {
    if (!importCanHoID) return showToast('❌ Vui lòng chọn căn hộ');
    if (!importFile)    return showToast('❌ Vui lòng chọn file Excel');
    setImporting(true);
    try {
      // Đọc file Excel ở client, inject CanHoID vào từng dòng
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows.length) return showToast('❌ File Excel không có dữ liệu');

      // Inject CanHoID vào mỗi dòng rồi gửi lên server
      const enriched = rows.map(r => ({ ...r, 'Mã căn hộ': Number(importCanHoID) }));
      const newSheet = XLSX.utils.json_to_sheet(enriched);
      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, newSheet, 'TaiSan');
      const outBuffer = XLSX.write(newWb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const formData = new FormData();
      formData.append('file', blob, 'import.xlsx');
      const res = await axios.post('/taisan/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = res.data;
      let msg = `Thành công ${data.success} tài sản`;
      if (data.errors?.length) msg += ` | Lỗi ${data.errors.length} dòng: ${data.errors.map(e => `Dòng ${e.row}: ${e.message}`).join('; ')}`;
      showToast('✅ ' + msg);
      setImportModal(false);
      setImportFile(null);
      setImportCanHoID('');
      fetchAssets();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Import thất bại'));
    } finally {
      setImporting(false);
    }
  };

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/taisan');
      setAssets(res.data?.data || []);
    } catch {
      setError('Không thể tải danh sách tài sản.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCanho = useCallback(async () => {
    try {
      const res = await axios.get('/apartments', { params: { limit: 1000 } });
      const raw = res.data?.data;
      setCanhoList(Array.isArray(raw) ? raw : (raw?.items || []));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchAssets(); fetchCanho(); }, [fetchAssets, fetchCanho]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/taisan/${id}`);
      showToast('✅ Xóa tài sản thành công');
      fetchAssets();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Xóa thất bại'));
    } finally {
      setDeleteId(null);
    }
  };

  const handleSaved = () => {
    setModal(null);
    showToast('✅ Lưu tài sản thành công');
    fetchAssets();
  };

  // Lọc phẳng trước khi nhóm
  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (a.TenTaiSan || '').toLowerCase().includes(q) ||
      (a.MaTaiSan  || '').toLowerCase().includes(q) ||
      (a.canho?.MaCanHo || '').toLowerCase().includes(q);
    const matchTT    = !filterTinhTrang || a.TinhTrang === filterTinhTrang;
    const matchLoai  = !filterLoai      || a.LoaiTaiSan === filterLoai;
    const matchCanHo = !filterCanHo     || String(a.CanHoID) === filterCanHo;
    return matchSearch && matchTT && matchLoai && matchCanHo;
  });

  // Nhóm theo CanHoID
  const groups = filtered.reduce((acc, a) => {
    const key = a.CanHoID ?? 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  // Sắp xếp nhóm: theo MaCanHo → Tang → SoPhong
  const sortedKeys = Object.keys(groups).sort((ka, kb) => {
    const a0 = groups[ka][0]?.canho;
    const b0 = groups[kb][0]?.canho;
    if (!a0 && !b0) return 0;
    if (!a0) return 1;
    if (!b0) return -1;
    const byMa = (a0.MaCanHo || '').localeCompare(b0.MaCanHo || '');
    if (byMa !== 0) return byMa;
    return (Number(a0.Tang) || 0) - (Number(b0.Tang) || 0);
  });

  // Tổng toàn bộ
  const grandTotal = filtered.reduce((s, a) => s + (Number(a.GiaTri) || 0) * (Number(a.SoLuong) || 1), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3 text-sm font-medium text-gray-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tài sản</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} tài sản · {sortedKeys.length} căn hộ · Tổng giá trị: <span className="font-semibold text-indigo-600">{formatCurrency(grandTotal)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Download template */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 text-sm font-medium"
            title="Tải file Excel mẫu"
          >
            Tải mẫu Excel
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setImportModal(true)}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow disabled:opacity-60"
          >
            {importing ? 'Đang import...' : 'Import Excel'}
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />

          {/* Thêm thủ công */}
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
          >
            <span className="text-lg leading-none">+</span> Thêm tài sản
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="Tìm theo tên, mã tài sản..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterCanHo}
          onChange={e => setFilterCanHo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tất cả căn hộ</option>
          {canhoList.map(c => (
            <option key={c.ID} value={String(c.ID)}>
              {c.MaCanHo} — P.{c.SoPhong} (T.{c.Tang})
            </option>
          ))}
        </select>
        <select
          value={filterTinhTrang}
          onChange={e => setFilterTinhTrang(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tất cả tình trạng</option>
          {Object.entries(TINH_TRANG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={filterLoai}
          onChange={e => setFilterLoai(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tất cả loại</option>
          {Object.entries(LOAI_TS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(search || filterCanHo || filterTinhTrang || filterLoai) && (
          <button
            onClick={() => { setSearch(''); setFilterCanHo(''); setFilterTinhTrang(''); setFilterLoai(''); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Grouped list */}
      {sortedKeys.length === 0 ? (
        <div className="text-center text-gray-400 py-20 text-lg">Không có tài sản nào.</div>
      ) : (
        <div className="space-y-3">
          {sortedKeys.map(key => (
            <ApartmentGroup
              key={key}
              canhoKey={key}
              assets={groups[key]}
              onEdit={a => setModal(a)}
              onDelete={id => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Modal Import Excel */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Import tài sản từ Excel</h3>
              <button onClick={() => { setImportModal(false); setImportFile(null); setImportCanHoID(''); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Chọn căn hộ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Căn hộ <span className="text-red-500">*</span>
                </label>
                <select
                  value={importCanHoID}
                  onChange={e => setImportCanHoID(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Chọn căn hộ --</option>
                  {canhoList.map(c => (
                    <option key={c.ID} value={c.ID}>{c.MaCanHo} {c.toanha?.TenToaNha ? `- ${c.toanha.TenToaNha}` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Chọn file */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  File Excel <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {importFile && <p className="text-xs text-gray-500 mt-1">Đã chọn: {importFile.name}</p>}
              </div>

              {/* Ghi chú */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-600">Các cột trong file Excel:</p>
                <p>Mã tài sản · Tên tài sản · Loại tài sản · Vị trí · Số lượng · Tình trạng · Giá trị · Ngày mua · Nhà cung cấp · Ghi chú</p>
                <p className="text-emerald-600 font-medium cursor-pointer hover:underline" onClick={handleDownloadTemplate}>
                  Tải file mẫu Excel →
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={() => { setImportModal(false); setImportFile(null); setImportCanHoID(''); }}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleImportExcel}
                disabled={importing || !importCanHoID || !importFile}
                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Đang import...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa */}
      {modal && (
        <AssetModal
          asset={modal === 'add' ? null : modal}
          canhoList={canhoList}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 text-sm mb-5">Bạn có chắc muốn xóa tài sản này không?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
