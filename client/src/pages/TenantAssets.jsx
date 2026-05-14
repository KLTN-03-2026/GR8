// client/src/pages/TenantAssets.jsx
// Người thuê xem tài sản căn hộ đang thuê (read-only)

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import { useActiveContract } from '../hooks/useActiveContract';
import NoContractNotice from '../components/common/NoContractNotice';

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

const TenantAssets = ({ canHoID } = {}) => {
  const { hasActiveContract, loading: contractLoading } = useActiveContract();
  const [canho, setCanho]   = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Dùng /taisan/my-apartment rồi filter theo canHoID nếu cần
        const res = await axios.get('/taisan/my-apartment');
        const { canho: ch, assets: list } = res.data?.data || {};
        setCanho(ch || null);
        let assetList = list || [];
        // Nếu có canHoID cụ thể, lọc theo căn hộ đó
        if (canHoID && assetList.length > 0) {
          assetList = assetList.filter(a => a.CanHoID === Number(canHoID));
        }
        setAssets(assetList);
      } catch (err) {
        // Nếu lỗi (không có hợp đồng), hiển thị danh sách rỗng thay vì lỗi
        setAssets([]);
        setCanho(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canHoID]);

  const filtered = assets.filter((a) => {
    const matchSearch =
      !search ||
      (a.TenTaiSan || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.MaTaiSan  || '').toLowerCase().includes(search.toLowerCase());
    const matchLoai = !filterLoai || a.LoaiTaiSan === filterLoai;
    return matchSearch && matchLoai;
  });

  // Thống kê nhanh
  const stats = {
    total: assets.length,
    tot:   assets.filter((a) => a.TinhTrang === 'Tot').length,
    hong:  assets.filter((a) => a.TinhTrang === 'Hong').length,
    dangSua: assets.filter((a) => a.TinhTrang === 'DangSua').length,
  };

  if (contractLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!hasActiveContract) {
    return (
      <NoContractNotice
        title="Bạn chưa thuê căn hộ nào"
        message="Bạn cần có hợp đồng thuê căn hộ đang hoạt động để xem tài sản căn hộ."
      />
    );
  }

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-gray-600 font-medium">Căn hộ này chưa có tài sản nào được ghi nhận</p>
        <p className="text-gray-400 text-sm mt-1">Liên hệ quản lý để biết thêm thông tin.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Tài sản căn hộ của tôi</h1>
        {canho && (
          <p className="text-gray-500 text-sm">
            Căn hộ <span className="font-semibold text-gray-700">{canho.MaCanHo}</span>
            {'  '}Phòng <span className="font-semibold text-gray-700">{canho.SoPhong}</span>
            {'  '}Tầng <span className="font-semibold text-gray-700">{canho.Tang}</span>
          </p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng tài sản', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Tốt',          value: stats.tot,   color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Hỏng',         value: stats.hong,  color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Đang sửa',     value: stats.dangSua, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Tìm theo tên, mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tất cả loại</option>
          {Object.entries(LOAI_TS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} tài sản</span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-base font-medium text-gray-500">Chưa có tài sản nào trong căn hộ này</p>
          <p className="text-sm text-gray-400 mt-1">Liên hệ quản lý để biết thêm thông tin</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, idx) => {
            const tt = TINH_TRANG[a.TinhTrang];
            return (
              <div
                key={a.ID || idx}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.TenTaiSan}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{a.MaTaiSan}</p>
                  </div>
                  {tt && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tt.color}`}>
                      {tt.label}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loại</span>
                    <span>{LOAI_TS[a.LoaiTaiSan] || a.LoaiTaiSan}</span>
                  </div>
                  {a.ViTri && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vị trí</span>
                      <span>{a.ViTri}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số lượng</span>
                    <span>{a.SoLuong ?? 1}</span>
                  </div>
                  {a.GiaTri != null && Number(a.GiaTri) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giá trị</span>
                      <span className="font-medium text-gray-800">{formatCurrency(a.GiaTri)}</span>
                    </div>
                  )}
                  {a.NgayMua && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày mua</span>
                      <span>{new Date(a.NgayMua).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {a.NhaCungCap && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nhà cung cấp</span>
                      <span>{a.NhaCungCap}</span>
                    </div>
                  )}
                </div>

                {a.GhiChu && (
                  <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {a.GhiChu}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantAssets;
