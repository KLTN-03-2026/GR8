// Trang "Căn hộ của tôi" - Hub trung tâm cho người thuê
// Chọn căn hộ → xem đầy đủ thông tin, hóa đơn, tài sản, dịch vụ, sự cố, thành viên

import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import MyInvoicesList from './hoadon/MyInvoicesList';
import TenantAssets from './TenantAssets';
import MyServices from './MyServices';
import MyIncidents from './yeucausuco/MyIncidents';
import MyContracts from './hopdong/MyContracts';
import ThanhVienCanHo from './thanhvien/ThanhVienCanHo';
import BuildingLocationCard from '../components/common/BuildingLocationCard';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"
    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
    <path d={d} />
  </svg>
);

const STATUS_MAP = {
  DaKy:     { label: 'Đã ký',      color: 'bg-blue-100 text-blue-700' },
  DangThue: { label: 'Đang thuê',  color: 'bg-green-100 text-green-700' },
  HetHan:   { label: 'Hết hạn',    color: 'bg-gray-100 text-gray-600' },
  KetThuc:  { label: 'Kết thúc',   color: 'bg-gray-100 text-gray-600' },
  ChoKy:    { label: 'Chờ ký',     color: 'bg-yellow-100 text-yellow-700' },
};

const TABS = [
  { key: 'overview',   label: 'Tổng quan',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'contracts',  label: 'Hợp đồng',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'invoices',   label: 'Hóa đơn',      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { key: 'assets',     label: 'Tài sản',       icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'services',   label: 'Dịch vụ',       icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'incidents',  label: 'Báo cáo sự cố', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { key: 'members',    label: 'Thành viên',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'location',   label: 'Vị trí',        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
];

// ── Tổng quan căn hộ ─────────────────────────────────────────────────────────
const OverviewTab = ({ contract }) => {
  const canho = contract.canho;
  const toanha = canho?.toanha;
  const diffDays = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);
  const remaining = diffDays(contract.NgayKetThuc);

  return (
    <div className="space-y-5">
      {/* Cảnh báo sắp hết hạn */}
      {remaining > 0 && remaining <= 30 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">Hợp đồng còn <strong>{remaining} ngày</strong> nữa là hết hạn.</p>
        </div>
      )}

      {/* Thông tin hợp đồng + căn hộ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin căn hộ</p>
          <InfoRow label="Mã căn hộ"   value={canho?.MaCanHo} />
          <InfoRow label="Tòa nhà"     value={toanha?.TenToaNha} />
          <InfoRow label="Tầng"        value={canho?.Tang ? `Tầng ${canho.Tang}` : '—'} />
          <InfoRow label="Số phòng"    value={canho?.SoPhong} />
          <InfoRow label="Diện tích"   value={canho?.DienTich ? `${canho.DienTich} m²` : '—'} />
          <InfoRow label="Địa chỉ"     value={toanha?.DiaChi} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin hợp đồng</p>
          <InfoRow label="Mã hợp đồng" value={`#${contract.ID}`} />
          <InfoRow label="Trạng thái"  value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[contract.TrangThai]?.color}`}>
              {STATUS_MAP[contract.TrangThai]?.label}
            </span>
          } />
          <InfoRow label="Bắt đầu"     value={new Date(contract.NgayBatDau).toLocaleDateString('vi-VN')} />
          <InfoRow label="Kết thúc"    value={new Date(contract.NgayKetThuc).toLocaleDateString('vi-VN')} />
          <InfoRow label="Giá thuê"    value={<span className="font-semibold text-indigo-600">{formatCurrency(contract.GiaThue)}/tháng</span>} />
          <InfoRow label="Tiền cọc"    value={formatCurrency(contract.TienCoc)} />
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right max-w-[180px] truncate">{value || '—'}</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const MyApartment = () => {
  const navigate = useNavigate();
  const [contracts, setContracts]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/hopdong/my');
      const data = res.data?.data || [];
      const active = data.filter(c => ['DaKy', 'DangThue'].includes(c.TrangThai));
      setContracts(active);
      if (active.length === 1) setSelectedContract(active[0]);
    } catch {
      setError('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Không có hợp đồng ──
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bạn chưa có căn hộ nào</h3>
        <p className="text-sm text-gray-500 mb-6">Hãy tìm và gửi yêu cầu thuê căn hộ để bắt đầu.</p>
        <button
          onClick={() => navigate('/browse-apartments')}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Tìm căn hộ ngay
        </button>
      </div>
    );
  }

  // ── Chọn căn hộ (nếu có nhiều hơn 1) ──
  if (!selectedContract) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Căn hộ của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">Chọn căn hộ để xem chi tiết</p>
        </div>
        {contracts.map(c => {
          const canho = c.canho;
          return (
            <button
              key={c.ID}
              onClick={() => { setSelectedContract(c); setActiveTab('overview'); }}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{canho?.MaCanHo} — {canho?.toanha?.TenToaNha}</p>
                    <p className="text-sm text-gray-500">Tầng {canho?.Tang} • {canho?.DienTich} m² • {formatCurrency(c.GiaThue)}/tháng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[c.TrangThai]?.color}`}>
                    {STATUS_MAP[c.TrangThai]?.label}
                  </span>
                  <Icon d="M9 5l7 7-7 7" className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Chi tiết căn hộ đã chọn ──
  const canho = selectedContract.canho;
  const toanha = canho?.toanha;

  return (
    <div className="space-y-5">
      {/* Header căn hộ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {contracts.length > 1 && (
            <button
              onClick={() => setSelectedContract(null)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Icon d="M15 19l-7-7 7-7" className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{canho?.MaCanHo}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[selectedContract.TrangThai]?.color}`}>
                {STATUS_MAP[selectedContract.TrangThai]?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">{toanha?.TenToaNha} • Tầng {canho?.Tang} • {canho?.DienTich} m²</p>
          </div>
        </div>
        <p className="text-lg font-bold text-indigo-600">{formatCurrency(selectedContract.GiaThue)}<span className="text-sm font-normal text-gray-400">/tháng</span></p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Tab bar - scroll ngang trên mobile */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon d={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'overview' && (
            <OverviewTab contract={selectedContract} />
          )}

          {activeTab === 'contracts' && (
            <MyContracts contractId={selectedContract.ID} />
          )}

          {activeTab === 'invoices' && (
            <MyInvoicesList canHoID={canho?.ID} contractId={selectedContract.ID} />
          )}

          {activeTab === 'assets' && (
            <TenantAssets canHoID={canho?.ID} />
          )}

          {activeTab === 'services' && (
            <MyServices canHoID={canho?.ID} />
          )}

          {activeTab === 'incidents' && (
            <MyIncidents defaultCanHoID={canho?.ID} />
          )}

          {activeTab === 'members' && (
            <ThanhVienCanHo
              canHoID={canho?.ID}
              gioiHan={canho?.GioiHanNguoiO}
              contract={selectedContract}
            />
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <BuildingLocationCard
                latitude={toanha?.Latitude || 16.0471}
                longitude={toanha?.Longitude || 108.2068}
                buildingName={toanha?.TenToaNha || 'Tòa nhà'}
                address={toanha?.DiaChi || ''}
                height="380px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApartment;
