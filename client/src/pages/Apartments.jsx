import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import ApartmentFilter from '../components/canho/ApartmentFilter';
import { useNumberInput } from '../hooks/useNumberInput';

const AMENITY_ICONS = {
  'wifi': '📶', 'internet': '📶',
  'hồ bơi': '🏊', 'bơi': '🏊',
  'gym': '🏋️', 'phòng tập': '🏋️',
  'bãi đỗ': '🅿️', 'đỗ xe': '🅿️', 'parking': '🅿️',
  'thang máy': '🛗',
  'bảo vệ': '💂', 'security': '💂',
  'điều hòa': '❄️', 'máy lạnh': '❄️',
  'tủ lạnh': '🧊',
  'máy giặt': '🫧',
  'bếp': '🍳',
  'tivi': '📺', 'tv': '📺',
  'sân': '🌿', 'vườn': '🌿',
  'ban công': '🪟',
  'lễ tân': '🛎️',
};
const getAmenityIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '✨';
};

const EMPTY_FORM = {
  MaCanHo: '', SoPhong: '', Tang: '', DienTich: '',
  GiaThue: '', TienCoc: '', TrangThai: 'Trong', MoTa: '', ToaNhaID: '', IsHot: false,
};

const EMPTY_BUILDING_FORM = {
  TenToaNha: '', DiaChi: '', SoTang: 1, Latitude: '', Longitude: '', ChuNhaID: '',
};

const EMPTY_ROOM_TEMPLATE = {
  Tang: 0, SoPhong: 10, DienTich: 20, GiaThue: 1000000, TienCoc: 1000000,
  Prefix: 'P', MoTa: '',
};

const Apartments = () => {
  const navigate = useNavigate();
  const [apartments, setApartments]   = useState([]);
  const [allApartments, setAllApartments] = useState([]);
  const [buildings, setBuildings]     = useState([]);
  const [amenities, setAmenities]     = useState([]);
  const [owners, setOwners]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', Tang: '', search: '', ToaNhaID: '', minGia: '', maxGia: '', minDT: '', maxDT: '' });
  const [stats, setStats]             = useState({ total: 0, available: 0, rented: 0, maintenance: 0 });

  const [modalType, setModalType]         = useState('');
  const [modalStep, setModalStep]         = useState(1);
  const [newApartment, setNewApartment]   = useState(EMPTY_FORM);
  const [newBuilding, setNewBuilding]     = useState(EMPTY_BUILDING_FORM);
  const [roomTemplate, setRoomTemplate]   = useState(EMPTY_ROOM_TEMPLATE);
  const [createdBuildingId, setCreatedBuildingId] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState(new Set());
  const [formLoading, setFormLoading]     = useState(false);
  const [photoFiles, setPhotoFiles]       = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  // Number input hooks for price fields
  const [giaThueValue, handleGiaThueChange, setGiaThueValue, getGiaThueRaw, giaThueRef] = useNumberInput('');
  const [tienCocValue, handleTienCocChange, setTienCocValue, getTienCocRaw, tienCocRef] = useNumberInput('');

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { limit: 1000 };
      if (filter.TrangThai) params.TrangThai = filter.TrangThai;
      if (filter.Tang)      params.Tang      = filter.Tang;
      if (filter.search)    params.search    = filter.search;
      if (filter.ToaNhaID)  params.ToaNhaID  = filter.ToaNhaID;
      if (filter.minGia)    params.minGia    = filter.minGia;
      if (filter.maxGia)    params.maxGia    = filter.maxGia;

      const response = await axios.get('/apartments', { params });
      const raw = response.data?.data;
      const data = Array.isArray(raw) ? raw : (raw?.items || []);
      setApartments(data);

      if (!filter.ToaNhaID && !filter.TrangThai && !filter.Tang && !filter.search) {
        setAllApartments(data);
      }

      const s = data.reduce((acc, apt) => {
        acc.total++;
        if (apt.TrangThai === 'Trong')   acc.available++;
        else if (apt.TrangThai === 'DaThue') acc.rented++;
        else if (apt.TrangThai === 'BaoTri') acc.maintenance++;
        return acc;
      }, { total: 0, available: 0, rented: 0, maintenance: 0 });
      setStats(s);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách căn hộ');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await axios.get('/apartments', { params: { limit: 1000 } });
        const raw = response.data?.data;
        const data = Array.isArray(raw) ? raw : (raw?.items || []);
        setAllApartments(data);
      } catch { /* silent */ }
    };
    fetchAll();
  }, []);

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await axios.get('/toanha');
      setBuildings(res.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchAmenities = useCallback(async () => {
    try {
      const res = await axios.get('/tienich');
      setAmenities(res.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchOwners = useCallback(async () => {
    try {
      const res = await axios.get('/users?roles=ChuNha&limit=100');
      const data = res.data?.data;
      setOwners(Array.isArray(data) ? data : (data?.items || []));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchApartments(); }, [fetchApartments]);
  useEffect(() => { fetchBuildings(); },  [fetchBuildings]);
  useEffect(() => { fetchAmenities(); },  [fetchAmenities]);
  useEffect(() => { fetchOwners(); },     [fetchOwners]);

  // ── Badge trạng thái ──────────────────────────────────────────
  const getStatusBadge = (status) => {
    const configs = {
      Trong:   { cls: 'bg-green-100 text-green-800 border-green-200',  label: 'Còn trống' },
      DaThue:  { cls: 'bg-blue-100  text-blue-800  border-blue-200',   label: 'Đã thuê'   },
      BaoTri:  { cls: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Bảo trì' },
      DangDon: { cls: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Đang dọn' },
    };
    const c = configs[status] || configs.Trong;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}>
        {c.label}
      </span>
    );
  };

  // ── Tiện ích chips ────────────────────────────────────────────
  const AmenityChips = ({ items = [] }) => {
    if (!items.length) return <span className="text-xs text-gray-400">—</span>;
    const visible = items.slice(0, 2);
    const extra   = items.length - 2;
    return (
      <div className="flex flex-wrap gap-1">
        {visible.map((ct) => (
          <span
            key={ct.tienich?.ID ?? ct.TienIchID}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
          >
            <span className="text-[11px]">{getAmenityIcon(ct.tienich?.TenTienIch ?? '')}</span>
            {ct.tienich?.TenTienIch ?? ''}
          </span>
        ))}
        {extra > 0 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{extra}</span>
        )}
      </div>
    );
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleInputChange         = (e) => { const { name, value } = e.target; setNewApartment(p => ({ ...p, [name]: value })); };
  const handleBuildingInputChange = (e) => { const { name, value } = e.target; setNewBuilding(p => ({ ...p, [name]: value })); };
  const handleRoomTemplateChange  = (name, value) => setRoomTemplate(p => ({ ...p, [name]: value }));

  const handleCreateBuilding = async (e) => {
    e.preventDefault();
    if (!newBuilding.ChuNhaID) {
      setError('Vui lòng chọn chủ nhà');
      return;
    }
    setFormLoading(true); setError('');
    try {
      const res = await axios.post('/toanha', newBuilding);
      setCreatedBuildingId(res.data?.data?.ID);
      setModalStep(2);
      setSuccess(`✅ Tạo tòa nhà ${newBuilding.TenToaNha} thành công!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tòa nhà');
    } finally { setFormLoading(false); }
  };

  const handleBulkCreateRooms = async () => {
    if (!createdBuildingId) return;
    setFormLoading(true); setError('');
    try {
      await axios.post('/apartments/bulk', { ...roomTemplate, ToaNhaID: createdBuildingId });
      closeModal();
      setSuccess(`✅ Đã tạo ${roomTemplate.SoPhong} căn hộ thành công!`);
      fetchApartments(); fetchBuildings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo phòng hàng loạt');
    } finally { setFormLoading(false); }
  };

  const handleCreateApartment = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError('');
    try {
      // Merge formatted price values with form data
      const apartmentData = {
        ...newApartment,
        GiaThue: getGiaThueRaw(),
        TienCoc: getTienCocRaw(),
      };

      const res = await axios.post('/apartments', apartmentData);
      const apt = res.data?.data;

      // Upload ảnh nếu có
      if (photoFiles.length > 0 && apt?.ID) {
        const formData = new FormData();
        photoFiles.forEach(f => formData.append('photos', f));
        await axios.post(`/apartments/${apt.ID}/photo`, formData).catch(() => {});
      }

      // Gắn tiện ích
      if (selectedAmenities.size > 0 && apt?.ID) {
        await Promise.allSettled(
          [...selectedAmenities].map(id => axios.post(`/tienich/canho/${apt.ID}`, { TienIchID: id }))
        );
      }
      closeModal();
      setSuccess(`✅ Thêm căn hộ ${apt?.MaCanHo} thành công!`);
      fetchApartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể thêm căn hộ');
    } finally { setFormLoading(false); }
  };

  const closeModal = () => {
    setModalType(''); setModalStep(1);
    setNewApartment(EMPTY_FORM); setNewBuilding(EMPTY_BUILDING_FORM);
    setRoomTemplate(EMPTY_ROOM_TEMPLATE); setCreatedBuildingId(null);
    setSelectedAmenities(new Set()); setPhotoFiles([]); setPhotoPreviews([]);
    setGiaThueValue(''); setTienCocValue(''); // Reset number inputs
    setError('');
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const valid = files.filter(f => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024);
    const combined = [...photoFiles, ...valid].slice(0, 10);
    setPhotoFiles(combined);
    const previews = combined.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    const next = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(next);
    setPhotoPreviews(next.map(f => URL.createObjectURL(f)));
  };

  const handleToggleHot = async (apt) => {
    try {
      await axios.patch(`/apartments/${apt.ID}`, { IsHot: !apt.IsHot });
      setSuccess(`${!apt.IsHot ? '🔥 Đã bật HOT' : '✅ Đã tắt HOT'} cho căn hộ ${apt.MaCanHo}`);
      fetchApartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái HOT');
    }
  };

  if (loading && apartments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải danh sách căn hộ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quản lý danh sách phòng</h1>
            <p className="text-sm text-gray-500">Chung cư mini Bình Thạnh</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalType('building')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              Thêm tòa nhà
            </button>
            <button
              onClick={() => setModalType('apartment')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm căn hộ
            </button>
            <button
              onClick={fetchApartments}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {/* ── Building Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-1">
          <button
            onClick={() => setFilter({ ...filter, ToaNhaID: '' })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              !filter.ToaNhaID ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          {buildings.map(b => {
            const count = allApartments.filter(a => a.ToaNhaID === b.ID).length;
            return (
              <button
                key={b.ID}
                onClick={() => setFilter({ ...filter, ToaNhaID: b.ID })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter.ToaNhaID === b.ID ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {b.TenToaNha} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Tổng căn hộ',   val: stats.total,       color: 'border-l-blue-500',   textColor: 'text-gray-900' },
            { label: 'Còn trống',      val: stats.available,   color: 'border-l-green-500',  textColor: 'text-green-600' },
            { label: 'Đã cho thuê',    val: stats.rented,      color: 'border-l-indigo-500', textColor: 'text-indigo-600' },
            { label: 'Bảo trì',        val: stats.maintenance, color: 'border-l-yellow-500', textColor: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${s.color} p-4`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.textColor}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <ApartmentFilter
          filter={filter}
          onChange={setFilter}
          onSearch={(f) => { setFilter(f); }}
          buildings={buildings}
          loading={loading}
        />

        {/* ── Alerts ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* ── Table ── */}
        {apartments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-lg mb-1">Không tìm thấy căn hộ</p>
            <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc thêm căn hộ mới</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tòa nhà</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá thuê</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiện ích</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diện tích</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách thuê</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hợp đồng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">HOT</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apartments.map((apartment) => {
                    const contract = apartment.hopdong?.[0];
                    const tenant   = contract?.nguoidung;
                    const amenityList = apartment.canho_tienich || [];

                    return (
                      <tr key={apartment.ID} className="hover:bg-gray-50 transition-colors">

                        {/* Phòng */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-700 flex-shrink-0">
                              {apartment.MaCanHo?.slice(0, 2).toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{apartment.MaCanHo}</div>
                              <div className="text-xs text-gray-400">Tầng {apartment.Tang}</div>
                            </div>
                          </div>
                        </td>

                        {/* Tòa nhà */}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {apartment.toanha?.TenToaNha || '—'}
                        </td>

                        {/* Giá thuê */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{formatCurrency(apartment.GiaThue)}</div>
                          <div className="text-xs text-gray-400">Chưa có dịch vụ</div>
                        </td>

                        {/* Tiện ích */}
                        <td className="px-4 py-3">
                          <AmenityChips items={amenityList} />
                        </td>

                        {/* Diện tích */}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {apartment.DienTich ? `${apartment.DienTich} m²` : '—'}
                        </td>

                        {/* Khách thuê */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {tenant ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                                {tenant.HoTen?.slice(0, 2).toUpperCase() || '?'}
                              </div>
                              <span className="text-gray-900">{tenant.HoTen}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Hợp đồng (ngày vào – ngày kết thúc) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {contract?.NgayBatDau ? (
                            <div>
                              <div className="text-gray-700 text-xs">
                                {new Date(contract.NgayBatDau).toLocaleDateString('vi-VN')}
                              </div>
                              {contract?.NgayKetThuc && (
                                <div className="text-gray-400 text-xs">
                                  → {new Date(contract.NgayKetThuc).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Tình trạng */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(apartment.TrangThai)}
                        </td>

                        {/* HOT toggle */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleHot(apartment)}
                            title={apartment.IsHot ? 'Tắt HOT' : 'Bật HOT — hiển thị nổi bật trang chủ'}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              apartment.IsHot
                                ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                            }`}
                          >
                            🔥 {apartment.IsHot ? 'HOT' : 'Bật'}
                          </button>
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => navigate(`/apartments/${apartment.ID}`)}
                            title="Chỉnh sửa"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ MODAL TẠO TÒA NHÀ ══════════════ */}
      {modalType === 'building' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {modalStep === 1 ? 'Thêm tòa nhà mới' : 'Tạo phòng hàng loạt'}
                </h3>
                <p className="text-gray-300 text-xs mt-0.5">
                  Bước {modalStep}/2 — {modalStep === 1 ? 'Thông tin tòa nhà' : 'Tạo phòng từ mẫu'}
                </p>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

              {/* Bước 1 */}
              {modalStep === 1 && (
                <form onSubmit={handleCreateBuilding} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên tòa nhà <span className="text-red-500">*</span></label>
                      <input type="text" name="TenToaNha" value={newBuilding.TenToaNha} onChange={handleBuildingInputChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="VD: Tòa A" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chủ nhà <span className="text-red-500">*</span></label>
                      <select name="ChuNhaID" value={newBuilding.ChuNhaID} onChange={handleBuildingInputChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                        <option value="">— Chọn chủ nhà —</option>
                        {owners.map(owner => (
                          <option key={owner.ID} value={owner.ID}>
                            {owner.HoTen} ({owner.Email})
                          </option>
                        ))}
                      </select>
                      {owners.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">Chưa có tài khoản chủ nhà nào trong hệ thống</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số tầng <span className="text-red-500">*</span></label>
                      <input type="number" name="SoTang" value={newBuilding.SoTang} onChange={handleBuildingInputChange} required min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                      <input type="text" name="DiaChi" value={newBuilding.DiaChi} onChange={handleBuildingInputChange} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="VD: 123 Nguyễn Văn A, Q.Bình Thạnh" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vĩ độ (Latitude)
                        <span className="ml-1 text-xs text-gray-400 font-normal">— tìm trên Google Maps</span>
                      </label>
                      <input type="number" name="Latitude" value={newBuilding.Latitude} onChange={handleBuildingInputChange}
                        step="0.00000001" min="-90" max="90"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="VD: 16.0471" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kinh độ (Longitude)
                      </label>
                      <input type="number" name="Longitude" value={newBuilding.Longitude} onChange={handleBuildingInputChange}
                        step="0.00000001" min="-180" max="180"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="VD: 108.2068" />
                    </div>
                    <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                      💡 Cách lấy tọa độ: Mở <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Maps</a>, tìm địa chỉ tòa nhà → click chuột phải → copy tọa độ (số đầu là Latitude, số sau là Longitude)
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                    <button type="submit" disabled={formLoading}
                      className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium transition-colors ${formLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                      {formLoading ? 'Đang tạo...' : 'Tiếp theo →'}
                    </button>
                  </div>
                </form>
              )}

              {/* Bước 2 */}
              {modalStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    ✅ Tòa nhà tạo thành công! Bây giờ hãy tạo phòng hàng loạt.
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-r-lg text-sm text-blue-700">
                    <strong>Gợi ý:</strong> Chọn tầng và nhập số phòng, hệ thống sẽ tự động tạo theo mẫu.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Tầng (0 = trệt)', key: 'Tang', type: 'number', min: '0' },
                      { label: 'Số phòng *', key: 'SoPhong', type: 'number', min: '1' },
                      { label: 'Diện tích mẫu (m²)', key: 'DienTich', type: 'number', min: '1' },
                      { label: 'Giá thuê mẫu (đ) *', key: 'GiaThue', type: 'number', min: '0' },
                      { label: 'Tiền cọc mẫu (đ)', key: 'TienCoc', type: 'number', min: '0' },
                      { label: 'Prefix mã phòng', key: 'Prefix', type: 'text', placeholder: 'VD: P → P01, P02...' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <input type={f.type} min={f.min} placeholder={f.placeholder}
                          value={roomTemplate[f.key]}
                          onChange={(e) => handleRoomTemplateChange(f.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                    Sẽ tạo <strong>{roomTemplate.SoPhong}</strong> phòng từ{' '}
                    <strong>{roomTemplate.Prefix}{Number(roomTemplate.Tang) > 0 ? roomTemplate.Tang : ''}{String(1).padStart(2, '0')}</strong>{' '}
                    đến <strong>{roomTemplate.Prefix}{Number(roomTemplate.Tang) > 0 ? roomTemplate.Tang : ''}{String(Number(roomTemplate.SoPhong)).padStart(2, '0')}</strong>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { closeModal(); fetchBuildings(); }}
                      className="flex-1 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Bỏ qua
                    </button>
                    <button onClick={handleBulkCreateRooms} disabled={formLoading}
                      className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium transition-colors ${formLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                      {formLoading ? 'Đang tạo...' : `Tạo ${roomTemplate.SoPhong} phòng`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL TẠO CĂN HỘ ══════════════ */}
      {modalType === 'apartment' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-white">Thêm căn hộ mới</h3>
                <p className="text-green-200 text-xs mt-0.5">Điền thông tin căn hộ bên dưới</p>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateApartment} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà <span className="text-red-500">*</span></label>
                  <select name="ToaNhaID" value={newApartment.ToaNhaID} onChange={handleInputChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">— Chọn tòa nhà —</option>
                    {buildings.map(b => <option key={b.ID} value={b.ID}>{b.TenToaNha}</option>)}
                  </select>
                </div>

                {[
                  { label: 'Mã căn hộ',       name: 'MaCanHo',  type: 'text',   placeholder: 'VD: A101',       required: true },
                  { label: 'Số phòng',         name: 'SoPhong',  type: 'text',   placeholder: 'VD: 101',        required: true },
                  { label: 'Tầng',             name: 'Tang',     type: 'number', placeholder: 'VD: 1',          required: true, min: '1' },
                  { label: 'Diện tích (m²)',   name: 'DienTich', type: 'number', placeholder: 'VD: 50',         required: true, min: '1', step: '0.01' },
                  { label: 'Giá thuê (đ)',     name: 'GiaThue',  type: 'tel', placeholder: 'VD: 5,000,000',  required: true },
                  { label: 'Tiền cọc (đ)',     name: 'TienCoc',  type: 'tel', placeholder: 'VD: 10,000,000', required: true },
                ].map(f => {
                  // Special handling for price fields with number formatting
                  if (f.name === 'GiaThue') {
                    return (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <input type={f.type} name={f.name} value={giaThueValue}
                          onChange={handleGiaThueChange} required={f.required}
                          placeholder={f.placeholder}
                          ref={giaThueRef}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                      </div>
                    );
                  }
                  if (f.name === 'TienCoc') {
                    return (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <input type={f.type} name={f.name} value={tienCocValue}
                          onChange={handleTienCocChange} required={f.required}
                          placeholder={f.placeholder}
                          ref={tienCocRef}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                      </div>
                    );
                  }
                  // Default handling for other fields
                  return (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      <input type={f.type} name={f.name} value={newApartment[f.name]}
                        onChange={handleInputChange} required={f.required}
                        min={f.min} step={f.step} placeholder={f.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                  );
                })}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                  <select name="TrangThai" value={newApartment.TrangThai} onChange={handleInputChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="Trong">Còn trống</option>
                    <option value="DaThue">Đã thuê</option>
                    <option value="BaoTri">Bảo trì</option>
                    <option value="DangDon">Đang dọn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="MoTa" value={newApartment.MoTa} onChange={handleInputChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Mô tả chi tiết về căn hộ..." />
              </div>

              {/* Upload ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh căn hộ
                  <span className="ml-2 text-xs font-normal text-gray-400">(tối đa 10 ảnh · JPEG/PNG/WebP · 5MB/ảnh)</span>
                  {photoFiles.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{photoFiles.length}/10</span>
                  )}
                </label>

                {/* Grid preview */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img src={src} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Chính</span>
                        )}
                      </div>
                    ))}
                    {/* Nút thêm ảnh nếu chưa đủ 10 */}
                    {photoFiles.length < 10 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-400 mt-1">Thêm</span>
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={handlePhotoSelect} />
                      </label>
                    )}
                  </div>
                )}

                {/* Vùng kéo thả khi chưa có ảnh */}
                {photoPreviews.length === 0 && (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Nhấn để chọn ảnh</span>
                    <span className="text-xs text-gray-400 mt-0.5">Chọn tối đa 10 ảnh cùng lúc</span>
                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={handlePhotoSelect} />
                  </label>
                )}
              </div>

              {/* Toggle HOT */}
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-orange-800">🔥 Đánh dấu HOT</p>
                  <p className="text-xs text-orange-600 mt-0.5">Căn hộ sẽ hiển thị nổi bật ở trang chủ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewApartment(p => ({ ...p, IsHot: !p.IsHot }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newApartment.IsHot ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    newApartment.IsHot ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {amenities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiện ích
                    <span className="ml-2 text-xs font-normal text-gray-400">(tùy chọn)</span>
                    {selectedAmenities.size > 0 && (
                      <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{selectedAmenities.size} đã chọn</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {amenities.map(a => {
                      const checked = selectedAmenities.has(a.ID);
                      return (
                        <label key={a.ID}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                            checked ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleAmenity(a.ID)} className="w-3.5 h-3.5 accent-green-600 flex-shrink-0" />
                          <span className="text-base">{getAmenityIcon(a.TenTienIch)}</span>
                          <span className="font-medium text-gray-800 truncate text-xs">{a.TenTienIch}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                <button type="submit" disabled={formLoading}
                  className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium transition-colors ${formLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                  {formLoading ? 'Đang tạo...' : 'Thêm căn hộ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartments;