// client/src/pages/ApartmentDetail.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import { resolveMediaUrl, normalizeAnhCanHoEntries } from '../utils/mediaUrl';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';
import BuildingLocationCard from '../components/common/BuildingLocationCard';

const AMENITY_ICONS = {
  'wifi': '📶', 'internet': '📶',
  'hồ bơi': '🏊', 'bơi': '🏊',
  'gym': '💪', 'phòng tập': '💪',
  'bãi đỗ': '��️', 'đỗ xe': '🅿️', 'parking': '🅿️',
  'thang máy': '🛗',
  'bảo vệ': '🛡️', 'security': '🛡️',
  'điều hòa': '❄️', 'máy lạnh': '❄️',
  'tủ lạnh': '🧊',
  'máy giặt': '🧺',
  'bếp': '🍳',
  'tivi': '📺', 'tv': '📺',
  'sân': '🌳', 'vườn': '🌳',
  'ban công': '🏡',
  'lễ tân': '🏨',
};
const getAmenityIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '✨';
};

const TAISAN_LOAI = {
  ThietBiChung: 'Thiết bị chung',
  ThietBiCanHo: 'Thiết bị căn hộ',
  NoiThat: 'Nội thất',
  ThietBiDien: 'Thiết bị điện',
  CoSoVatChat: 'Cơ sở vật chất',
};

const TINHTRANG_CONFIG = {
  Tot:     { label: 'Tốt',       color: 'bg-green-100 text-green-700' },
  Hong:    { label: 'Hỏng',      color: 'bg-red-100 text-red-700' },
  DangSua: { label: 'Đang sửa',  color: 'bg-yellow-100 text-yellow-700' },
  Mat:     { label: 'Mất',       color: 'bg-gray-100 text-gray-600' },
  Cu:      { label: 'Cũ',        color: 'bg-orange-100 text-orange-700' },
};

const ImageFitFrame = ({ src, alt, children, onClick }) => (
  <div
    className={`relative w-full aspect-[4/3] rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
    onClick={onClick}
  >
    <img src={src} alt={alt || ''} className="max-h-full max-w-full object-contain" loading="lazy" />
    {children}
  </div>
);

const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const getStatusBadge = (status) => {
  const configs = {
    Trong:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Trống' },
    DaThue:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Đã thuê' },
    BaoTri:  { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bảo trì' },
    DangDon: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang dọn' },
  };
  const c = configs[status] || configs.Trong;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [apartment, setApartment]       = useState(null);
  const [amenities, setAmenities]       = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const [assets, setAssets]             = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsFetched, setAssetsFetched] = useState(false);
  
  // Favorite state
  const [isFavorite, setIsFavorite]     = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Check if apartment is in favorites on mount
  useEffect(() => {
    if (apartment?.ID) {
      const favorites = JSON.parse(localStorage.getItem('favoriteApartments') || '[]');
      setIsFavorite(favorites.includes(apartment.ID));
    }
  }, [apartment?.ID]);

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editForm, setEditForm]           = useState({});
  const [saving, setSaving]               = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNote, setRequestNote]           = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [profileCheck, setProfileCheck]         = useState(null); // { complete, missing }

  const [showAmenityModal, setShowAmenityModal]     = useState(false);
  const [selectedAmenities, setSelectedAmenities]   = useState(new Set());

  const [pendingPhotos, setPendingPhotos]         = useState([]);
  const [pendingFeaturedKey, setPendingFeaturedKey] = useState(null);
  const photoInputRef = useRef(null);

  // Lightbox state
  const [lightbox, setLightbox] = useState(null); // { imgs: string[], idx: number }
  const openLightbox = (imgs, idx) => setLightbox({ imgs, idx });
  const closeLightbox = () => setLightbox(null);
  const prevImg = () => setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.imgs.length) % lb.imgs.length }));
  const nextImg = () => setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.imgs.length }));

  const clearPendingPhotos = () => {
    setPendingPhotos((prev) => { prev.forEach((p) => { if (p.url) URL.revokeObjectURL(p.url); }); return []; });
    setPendingFeaturedKey(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const fetchApartment = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/apartments/${id}`);
      const data = res.data?.data;
      setApartment(data);
      setEditForm({
        MaCanHo: data.MaCanHo,
        SoPhong: data.SoPhong,
        Tang: data.Tang,
        DienTich: data.DienTich,
        GiaThue: data.GiaThue,
        TienCoc: data.TienCoc,
        TrangThai: data.TrangThai,
        MoTa: data.MoTa || '',
        GioiHanNguoiO: data.GioiHanNguoiO ?? 2,
        NgayTinhDien:    data.NgayTinhDien    ?? '',
        NgayTinhNuoc:    data.NgayTinhNuoc    ?? '',
        NgayTinhTienNha: data.NgayTinhTienNha ?? '',
      });
      clearPendingPhotos();
      const aptAmenities = data.canho_tienich?.map(ct => ct.tienich) || [];
      setAmenities(aptAmenities);
      setSelectedAmenities(new Set(aptAmenities.map(a => a.ID)));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin căn hộ');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAllAmenities = useCallback(async () => {
    try {
      const res = await axios.get('/tienich');
      setAllAmenities(res.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchAssets = useCallback(async () => {
    if (assetsFetched) return;
    
    const role = user?.roles?.TenVaiTro || user?.VaiTro;
    const isAdminOrStaff = user && ['ChuNha', 'QuanLy', 'NhanVienKyThuat'].includes(role);
    
    try {
      setAssetsLoading(true);
      const url = isAdminOrStaff ? `/taisan?CanHoID=${id}` : `/taisan/public/${id}`;
      const res = await axios.get(url);
      setAssets(res.data?.data || []);
      setAssetsFetched(true);
    } catch { 
      setAssets([]); 
      setAssetsFetched(true); 
    } finally { 
      setAssetsLoading(false); 
    }
  }, [id, assetsFetched, user]);

  useEffect(() => { fetchApartment(); fetchAllAmenities(); }, [fetchApartment, fetchAllAmenities]);

  // Kiểm tra hồ sơ khi user là người thuê / khách vãng lai
  useEffect(() => {
    if (!user) return;
    const role = user?.roles?.TenVaiTro || user?.VaiTro;
    if (['ChuNha', 'QuanLy', 'NhanVienKyThuat'].includes(role)) return;
    axios.get('/yeucauthue/profile-check')
      .then(res => setProfileCheck(res.data?.data || null))
      .catch(() => setProfileCheck(null));
  }, [user]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { AnhCanHo: _ignored, ...patchBody } = editForm;
      await axios.patch(`/apartments/${id}`, patchBody);
      if (pendingPhotos.length > 0) {
        const fd = new FormData();
        const featuredIndex = pendingFeaturedKey
          ? pendingPhotos.findIndex((p) => p.key === pendingFeaturedKey)
          : -1;
        pendingPhotos.forEach((p) => fd.append('photos', p.file));
        if (featuredIndex >= 0) fd.append('featuredIndex', String(featuredIndex));
        await axios.post(`/apartments/${id}/photo`, fd);
      }
      setSuccess('Cập nhật thông tin thành công!');
      setShowEditPanel(false);
      clearPendingPhotos();
      fetchApartment();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingPhotos((prev) => {
      const next = [...prev];
      files.forEach((file) => {
        const key = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        next.push({ key, file, url: URL.createObjectURL(file) });
        if (!pendingFeaturedKey) setPendingFeaturedKey(key);
      });
      return next;
    });
    e.target.value = '';
  };

  const removePendingPhoto = (key) => {
    setPendingPhotos((prev) => {
      const t = prev.find((p) => p.key === key);
      if (t?.url) URL.revokeObjectURL(t.url);
      return prev.filter((p) => p.key !== key);
    });
    if (pendingFeaturedKey === key) setPendingFeaturedKey(null);
  };

  const handleDeleteSavedPhoto = async (mediaId) => {
    if (mediaId == null) return;
    setSaving(true); setError('');
    try {
      await axios.delete(`/apartments/${id}/photo/${mediaId}`);
      setSuccess('Đã xóa ảnh'); fetchApartment(); setTimeout(() => setSuccess(''), 2500);
    } catch (err) { setError(err.response?.data?.message || 'Không thể xóa ảnh'); }
    finally { setSaving(false); }
  };

  const handleDeleteAllPhotos = async () => {
    if (!window.confirm('Xóa toàn bộ ảnh của căn hộ này?')) return;
    setSaving(true); setError('');
    try {
      await axios.delete(`/apartments/${id}/photo`);
      setSuccess('Đã xóa tất cả ảnh'); fetchApartment(); setTimeout(() => setSuccess(''), 2500);
    } catch (err) { setError(err.response?.data?.message || 'Không thể xóa ảnh'); }
    finally { setSaving(false); }
  };

  const handleSetFeaturedSavedPhoto = async (mediaId) => {
    if (mediaId == null) return;
    setSaving(true); setError('');
    try {
      await axios.patch(`/apartments/${id}/photo/${mediaId}/featured`);
      setSuccess('Đã đặt ảnh nổi bật'); fetchApartment(); setTimeout(() => setSuccess(''), 2500);
    } catch (err) { setError(err.response?.data?.message || 'Không thể đặt ảnh nổi bật'); }
    finally { setSaving(false); }
  };

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => {
      const next = new Set(prev);
      next.has(amenityId) ? next.delete(amenityId) : next.add(amenityId);
      return next;
    });
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm vào yêu thích');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setFavoriteLoading(true);
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteApartments') || '[]');
      
      if (isFavorite) {
        // Remove from favorites
        const newFavorites = favorites.filter(id => id !== apartment.ID);
        localStorage.setItem('favoriteApartments', JSON.stringify(newFavorites));
        setIsFavorite(false);
        setSuccess('Đã xóa khỏi yêu thích');
      } else {
        // Add to favorites
        const newFavorites = [...favorites, apartment.ID];
        localStorage.setItem('favoriteApartments', JSON.stringify(newFavorites));
        setIsFavorite(true);
        setSuccess('Đã thêm vào yêu thích');
      }
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Không thể cập nhật yêu thích');
      setTimeout(() => setError(''), 3000);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await axios.post('/yeucauthue/create', { CanHoID: apartment.ID, GhiChu: requestNote });
      setSuccess('Gửi yêu cầu thuê thành công! Chúng tôi sẽ liên hệ sớm.');
      setShowRequestModal(false);
      setRequestNote('');
      setTimeout(() => { setSuccess(''); navigate('/my-rental-requests'); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAmenities = async () => {
    setSaving(true); setError('');
    try {
      const currentIds = new Set(amenities.map(a => a.ID));
      const toAdd    = [...selectedAmenities].filter(aid => !currentIds.has(aid));
      const toRemove = [...currentIds].filter(aid => !selectedAmenities.has(aid));
      await Promise.all(toAdd.map(aid => axios.post(`/tienich/canho/${id}`, { TienIchID: aid })));
      await Promise.all(toRemove.map(aid => axios.delete(`/tienich/canho/${id}/${aid}`)));
      setSuccess('Cập nhật tiện ích thành công!');
      setShowAmenityModal(false);
      fetchApartment();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Không thể cập nhật tiện ích'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <SkeletonBlock className="h-4 w-24" />
            <span className="text-gray-300">/</span>
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-64 w-full" />
              <SkeletonBlock className="h-32 w-full" />
            </div>
            <div className="w-80 space-y-4">
              <SkeletonBlock className="h-48 w-full" />
              <SkeletonBlock className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy căn hộ</p>
          <button onClick={() => navigate('/apartments')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const galleryImages   = normalizeAnhCanHoEntries(apartment.AnhCanHo);
  const userRole        = user?.roles?.TenVaiTro || user?.VaiTro;
  const canEditApartment = ['ChuNha', 'QuanLy', 'NhanVienKyThuat'].includes(userRole);
  const hasActiveTenant  = Array.isArray(apartment.hopdong) && apartment.hopdong.length > 0;
  const featuredImg      = galleryImages.find(g => g.IsFeatured) || galleryImages[0];
  const otherImgs        = galleryImages.filter(g => g !== featuredImg);
  const totalAssetValue  = assets.reduce((sum, a) => sum + (Number(a.GiaTri) || 0) * (Number(a.SoLuong) || 1), 0);

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* AppHeader chỉ hiển thị khi không có layout wrapper - đã được xử lý bởi PublicTenantLayout */}
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
          <button onClick={() => navigate(user ? '/apartments' : '/')} className="hover:text-indigo-600 transition-colors">
            {user ? 'Căn hộ' : 'Trang chủ'}
          </button>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-800 font-medium">{apartment.MaCanHo}</span>
        </nav>

        {/* Page title row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{apartment.MaCanHo}</h1>
              {getStatusBadge(apartment.TrangThai)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {apartment.toanha?.TenToaNha || 'Chưa có tòa nhà'} &bull; Phòng {apartment.SoPhong} &bull; Tầng {apartment.Tang}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorite ? 'Đã lưu' : 'Lưu'}
            </button>
            
            {/* Back button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              Quay lại
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {success}
          </div>
        )}

        {/* 2-column layout */}
        <div className="flex gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Overview Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="space-y-6">
                    {/* Gallery */}
                    {galleryImages.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ảnh căn hộ ({galleryImages.length})</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {featuredImg && (
                            <div className="col-span-2 row-span-2">
                              <ImageFitFrame
                                src={resolveMediaUrl(featuredImg.FileURL)}
                                alt={apartment.MaCanHo}
                                onClick={() => openLightbox(galleryImages.map(i => resolveMediaUrl(i.FileURL)), 0)}
                              >
                                <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Nổi bật</span>
                              </ImageFitFrame>
                            </div>
                          )}
                          {otherImgs.slice(0, 4).map((img, idx) => (
                            <ImageFitFrame
                              key={img.ID ?? img.FileURL}
                              src={resolveMediaUrl(img.FileURL)}
                              alt={apartment.MaCanHo}
                              onClick={() => openLightbox(galleryImages.map(i => resolveMediaUrl(i.FileURL)), featuredImg ? idx + 1 : idx)}
                            />
                          ))}
                          {otherImgs.length > 4 && (
                            <div
                              className="relative w-full aspect-[4/3] rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => openLightbox(galleryImages.map(i => resolveMediaUrl(i.FileURL)), 5)}
                            >
                              <span className="text-gray-600 font-semibold text-lg">+{otherImgs.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-400">Chưa có ảnh căn hộ</p>
                      </div>
                    )}

                    {/* Description */}
                    {apartment.MoTa && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{apartment.MoTa}</p>
                      </div>
                    )}

                    {/* Info grid */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                          <p className="text-lg font-bold text-gray-900">{apartment.DienTich} m²</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Tầng</p>
                          <p className="text-lg font-bold text-gray-900">Tầng {apartment.Tang}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Số phòng</p>
                          <p className="text-lg font-bold text-gray-900">{apartment.SoPhong}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Giới hạn người ở</p>
                          <p className="text-lg font-bold text-gray-900">{apartment.GioiHanNguoiO ?? '—'} người</p>
                        </div>
                      </div>
                 
                  </div>
              

              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Tiện ích ({amenities.length})</h3>
                {canEditApartment && (
                  <button
                    onClick={() => setShowAmenityModal(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    Chỉnh sửa tiện ích
                  </button>
                )}
              </div>
              {amenities.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Chưa có tiện ích nào</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map(amenity => (
                    <div key={amenity.ID} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                      <span className="text-xl">{getAmenityIcon(amenity.TenTienIch)}</span>
                      <span className="text-sm font-medium text-gray-700">{amenity.TenTienIch}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assets Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tài sản căn hộ</h3>
              {assetsLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <SkeletonBlock key={i} className="h-10 w-full" />)}
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Chưa có tài sản nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã TS</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tình trạng</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">SL</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assets.map(asset => {
                        const tt = TINHTRANG_CONFIG[asset.TinhTrang] || { label: asset.TinhTrang, color: 'bg-gray-100 text-gray-600' };
                        return (
                          <tr key={asset.ID} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{asset.MaTaiSan || asset.ID}</td>
                            <td className="py-2.5 px-3 font-medium text-gray-800">{asset.TenTaiSan}</td>
                            <td className="py-2.5 px-3 text-gray-500">{TAISAN_LOAI[asset.Loai] || asset.Loai || '—'}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tt.color}`}>{tt.label}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-700">{asset.SoLuong ?? 1}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-gray-800">{asset.GiaTri ? formatCurrency(asset.GiaTri) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {totalAssetValue > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-gray-50">
                          <td colSpan={5} className="py-2.5 px-3 text-sm font-semibold text-gray-700 text-right">Tổng giá trị:</td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-600">{formatCurrency(totalAssetValue)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="w-80 flex-shrink-0 space-y-4">

            {/* Price card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Giá thuê / tháng</p>
              <p className="text-3xl font-bold text-indigo-600 mb-4">{formatCurrency(apartment.GiaThue)}</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tiền cọc</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(apartment.TienCoc)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Trạng thái</span>
                  {getStatusBadge(apartment.TrangThai)}
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Tòa nhà</span>
                  <span className="font-medium text-gray-800 text-right max-w-[160px] truncate">{apartment.toanha?.TenToaNha || '—'}</span>
                </div>
              </div>

              {canEditApartment && (
                <button
                  onClick={() => { clearPendingPhotos(); setShowEditPanel(true); }}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  Chỉnh sửa thông tin
                </button>
              )}

              {/* Nút yêu cầu thuê - hiện cho người đăng nhập khi căn hộ còn trống */}
              {user && !canEditApartment && apartment.TrangThai === 'Trong' && (
                <>
                  {profileCheck && !profileCheck.complete && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                      <p className="font-semibold mb-1">⚠️ Hồ sơ chưa hoàn chỉnh</p>
                      <p>Vui lòng bổ sung trước khi gửi yêu cầu thuê:</p>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        {profileCheck.missing.map(f => <li key={f}>{f}</li>)}
                      </ul>
                      <a href="/profile" className="inline-block mt-2 text-amber-700 underline font-medium">Cập nhật hồ sơ →</a>
                    </div>
                  )}
                  <button
                    onClick={() => setShowRequestModal(true)}
                    disabled={profileCheck !== null && !profileCheck.complete}
                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                      profileCheck !== null && !profileCheck.complete
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    Thuê Ngay
                  </button>
                </>
              )}
            </div>

            {/* Quick stats */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3 text-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Thông tin nhanh</p>
              <div className="flex justify-between">
                <span className="text-gray-500">Diện tích</span>
                <span className="font-medium text-gray-800">{apartment.DienTich} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tầng</span>
                <span className="font-medium text-gray-800">{apartment.Tang}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số phòng</span>
                <span className="font-medium text-gray-800">{apartment.SoPhong}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giới hạn người ở</span>
                <span className="font-medium text-gray-800">{apartment.GioiHanNguoiO ?? '—'} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tiện ích</span>
                <span className="font-medium text-gray-800">{amenities.length}</span>
              </div>
              {canEditApartment && (
                <>
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Ngày tính tiền</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày phát hành HĐ</span>
                    <span className="font-medium text-gray-800">Ngày {apartment.NgayTinhTienNha ?? 5} hàng tháng</span>
                  </div>
                </>
              )}
            </div>

            {/* Building Location Map */}
            <BuildingLocationCard
              latitude={apartment.toanha?.Latitude || 21.0285}
              longitude={apartment.toanha?.Longitude || 105.8542}
              buildingName={apartment.toanha?.TenToaNha || 'Tòa nhà'}
              address={apartment.toanha?.DiaChi || 'Chưa cập nhật địa chỉ'}
              height="300px"
            />
          </div>
        </div>
      </div>

      {/* ── SLIDE-OVER EDIT PANEL ── */}
      {showEditPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => { setShowEditPanel(false); clearPendingPhotos(); }}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Chỉnh sửa căn hộ</h2>
                <p className="text-xs text-gray-500 mt-0.5">{apartment.MaCanHo}</p>
              </div>
              <button
                onClick={() => { setShowEditPanel(false); clearPendingPhotos(); }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>

            {/* Panel body */}
            <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã căn hộ</label>
                    <input type="text" name="MaCanHo" value={editForm.MaCanHo} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số phòng</label>
                    <input type="text" name="SoPhong" value={editForm.SoPhong} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tầng</label>
                    <input type="number" name="Tang" value={editForm.Tang} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Diện tích (m²)</label>
                    <input type="number" name="DienTich" value={editForm.DienTich} onChange={handleEditChange} step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giá thuê (VNĐ)</label>
                    <input type="number" name="GiaThue" value={editForm.GiaThue} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tiền cọc (VNĐ)</label>
                    <input type="number" name="TienCoc" value={editForm.TienCoc} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái</label>
                    <select name="TrangThai" value={editForm.TrangThai} onChange={handleEditChange} required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                      <option value="Trong" disabled={hasActiveTenant}>Trống</option>
                      <option value="DaThue">Đã thuê</option>
                      <option value="BaoTri">Bảo trì</option>
                      <option value="DangDon">Đang dọn</option>
                    </select>
                    {hasActiveTenant && (
                      <p className="text-xs text-amber-600 mt-1">Đang có người thuê, không thể chuyển về Trống.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới hạn người ở</label>
                    <input type="number" name="GioiHanNguoiO" value={editForm.GioiHanNguoiO ?? ''} onChange={handleEditChange} min="1" max="20" placeholder="VD: 2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                </div>

                {/* Ngày tính tiền */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Ngày tính tiền hàng tháng <span className="text-gray-400 font-normal">(để trống = dùng mặc định hệ thống)</span></p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ngày tính điện</label>
                      <input type="number" name="NgayTinhDien" value={editForm.NgayTinhDien ?? ''} onChange={handleEditChange} min="1" max="28" placeholder="VD: 3"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ngày tính nước</label>
                      <input type="number" name="NgayTinhNuoc" value={editForm.NgayTinhNuoc ?? ''} onChange={handleEditChange} min="1" max="28" placeholder="VD: 2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ngày phát hành HĐ</label>
                      <input type="number" name="NgayTinhTienNha" value={editForm.NgayTinhTienNha ?? ''} onChange={handleEditChange} min="1" max="28" placeholder="VD: 5"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
                  <textarea name="MoTa" value={editForm.MoTa} onChange={handleEditChange} rows={3}
                    placeholder="Nhập mô tả chi tiết về căn hộ..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" />
                </div>

                {/* Photo section */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Ảnh căn hộ</label>
                    {galleryImages.length > 0 && (
                      <button type="button" onClick={handleDeleteAllPhotos} disabled={saving}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50">
                        Xóa tất cả ảnh
                      </button>
                    )}
                  </div>
                  <input ref={photoInputRef} type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoFilesChange}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:text-xs" />
                  <p className="text-xs text-gray-400 mt-1">Mỗi file tối đa 5MB. Ảnh mới được thêm vào, không xóa ảnh cũ.</p>
                </div>

                {galleryImages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Ảnh đang lưu ({galleryImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryImages.map(img => (
                        <div key={img.ID ?? img.FileURL} className="relative group">
                          <ImageFitFrame src={resolveMediaUrl(img.FileURL)} alt={apartment.MaCanHo} />
                          {img.IsFeatured && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">★</div>
                          )}
                          {img.ID != null && (
                            <div className="absolute top-1 right-1 flex gap-1">
                              {!img.IsFeatured && (
                                <button type="button" onClick={() => handleSetFeaturedSavedPhoto(img.ID)} disabled={saving}
                                  className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" title="Đặt nổi bật">★</button>
                              )}
                              <button type="button" onClick={() => handleDeleteSavedPhoto(img.ID)} disabled={saving}
                                className="w-6 h-6 rounded-full bg-red-600 text-white text-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" title="Xóa">×</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingPhotos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Sẽ tải lên khi lưu ({pendingPhotos.length})</p>
                    <p className="text-xs text-gray-400 mb-2">Chọn 1 ảnh làm nổi bật.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {pendingPhotos.map(p => (
                        <div key={p.key} className="relative group">
                          <ImageFitFrame src={p.url} alt="Xem trước" />
                          <label className="absolute bottom-1 left-1 bg-white/90 border border-gray-200 rounded-full px-1.5 py-0.5 text-xs text-gray-700 flex items-center gap-1 cursor-pointer shadow">
                            <input type="radio" name="featuredPending" checked={pendingFeaturedKey === p.key} onChange={() => setPendingFeaturedKey(p.key)} className="accent-amber-500 w-3 h-3" />
                            <span>NB</span>
                          </label>
                          <button type="button" onClick={() => removePendingPhoto(p.key)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-800 text-white text-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-white">
                <button type="button"
                  onClick={() => {
                    setShowEditPanel(false);
                    clearPendingPhotos();
                    setEditForm({
                      MaCanHo: apartment.MaCanHo, SoPhong: apartment.SoPhong, Tang: apartment.Tang,
                      DienTich: apartment.DienTich, GiaThue: apartment.GiaThue, TienCoc: apartment.TienCoc,
                      TrangThai: apartment.TrangThai, MoTa: apartment.MoTa || '', GioiHanNguoiO: apartment.GioiHanNguoiO ?? 2,
                      NgayTinhDien: apartment.NgayTinhDien ?? '', NgayTinhNuoc: apartment.NgayTinhNuoc ?? '', NgayTinhTienNha: apartment.NgayTinhTienNha ?? '',
                    });
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── AMENITY MODAL ── */}
      {showAmenityModal && canEditApartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Quản lý tiện ích</h3>
                <p className="text-xs text-gray-500 mt-0.5">Căn hộ {apartment.MaCanHo}</p>
              </div>
              <button
                onClick={() => { setShowAmenityModal(false); setSelectedAmenities(new Set(amenities.map(a => a.ID))); }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {allAmenities.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">Chưa có tiện ích nào trong hệ thống.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {allAmenities.map(amenity => {
                    const checked = selectedAmenities.has(amenity.ID);
                    return (
                      <label key={amenity.ID}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          checked ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleAmenity(amenity.ID)}
                          className="w-4 h-4 accent-indigo-600 flex-shrink-0" />
                        <span className="text-xl">{getAmenityIcon(amenity.TenTienIch)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{amenity.TenTienIch}</p>
                          {amenity.MoTa && <p className="text-xs text-gray-400 truncate">{amenity.MoTa}</p>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 flex-shrink-0 flex gap-3">
              <button
                onClick={() => { setShowAmenityModal(false); setSelectedAmenities(new Set(amenities.map(a => a.ID))); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSaveAmenities} disabled={saving}
                className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {saving ? 'Đang lưu...' : `Lưu (${selectedAmenities.size} tiện ích)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL YÊU CẦU THUÊ ── */}
      {showRequestModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => { setShowRequestModal(false); setRequestNote(''); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900">Gửi yêu cầu thuê</h2>
                <button onClick={() => { setShowRequestModal(false); setRequestNote(''); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                {/* Cảnh báo hồ sơ chưa đủ (phòng thủ thêm) */}
                {profileCheck && !profileCheck.complete && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Hồ sơ chưa hoàn chỉnh</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {profileCheck.missing.map(f => <li key={f}>{f}</li>)}
                    </ul>
                    <a href="/profile" className="inline-block mt-2 text-amber-700 underline font-medium">Cập nhật hồ sơ →</a>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Căn hộ</span>
                    <span className="font-semibold text-gray-900">{apartment.MaCanHo} — Phòng {apartment.SoPhong}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diện tích</span>
                    <span className="font-medium text-gray-900">{apartment.DienTich} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giá thuê</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(apartment.GiaThue)}/tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tiền cọc</span>
                    <span className="font-medium text-gray-900">{formatCurrency(apartment.TienCoc)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={requestNote}
                    onChange={e => setRequestNote(e.target.value)}
                    rows={3}
                    placeholder="Vui lòng ghi chú ngày dự kiến chuyển vào thuê hoặc các yêu cầu khác..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  Yêu cầu sẽ được quản lý xem xét trong vòng 24–48 giờ. Vui lòng chuẩn bị đầy đủ giấy tờ cá nhân.
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button"
                    onClick={() => { setShowRequestModal(false); setRequestNote(''); }}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    Hủy
                  </button>
                  <button type="submit"
                    disabled={submitting || (profileCheck !== null && !profileCheck.complete)}
                    className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors ${
                      submitting || (profileCheck !== null && !profileCheck.complete)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}>
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>

    {/* ── Lightbox ── */}
    {lightbox && (
      <div
        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
        onClick={closeLightbox}
      >
        <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
          <img
            src={lightbox.imgs[lightbox.idx]}
            alt=""
            className="w-full max-h-[85vh] object-contain rounded-xl"
          />

          {/* Close */}
          <button onClick={closeLightbox}
            className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-lg transition-colors">
            ✕
          </button>

          {/* Prev / Next */}
          {lightbox.imgs.length > 1 && (
            <>
              <button onClick={prevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xl transition-colors">
                ‹
              </button>
              <button onClick={nextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xl transition-colors">
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                {lightbox.idx + 1} / {lightbox.imgs.length}
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default ApartmentDetail;
