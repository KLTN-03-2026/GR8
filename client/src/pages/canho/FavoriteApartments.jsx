// Trang danh sách căn hộ yêu thích
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { normalizeAnhCanHoEntries, resolveMediaUrl, getFeaturedImageUrl } from '../../utils/mediaUrl';
import {
  PageWrapper, PageHeader, Alert, Card,
  EmptyState, PageSkeleton,
} from '../../components/tenant/TenantUI';

const FavoriteApartments = () => {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get favorite IDs from localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('favoriteApartments') || '[]');
      
      if (favoriteIds.length === 0) {
        setApartments([]);
        setLoading(false);
        return;
      }

      // Fetch all apartments and filter by favorite IDs
      const res = await axios.get('/apartments');
      let data = res.data.data || [];
      if (!Array.isArray(data)) data = data.items || [];
      if (!Array.isArray(data)) data = [];
      
      const favoriteApartments = data.filter(apt => favoriteIds.includes(apt.ID));
      setApartments(favoriteApartments);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (aptId) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteApartments') || '[]');
    const newFavorites = favorites.filter(id => id !== aptId);
    localStorage.setItem('favoriteApartments', JSON.stringify(newFavorites));
    setApartments(prev => prev.filter(apt => apt.ID !== aptId));
  };

  const getImg = (apt) => getFeaturedImageUrl(apt?.AnhCanHo);

  const getStatusBadge = (status) => {
    const configs = {
      Trong:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Trống' },
      DaThue:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Đã thuê' },
      BaoTri:  { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bảo trì' },
      DangDon: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang dọn' },
    };
    const c = configs[status] || configs.Trong;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Căn hộ yêu thích"
        subtitle={`${apartments.length} căn hộ đã lưu`}
        action={
          <button
            onClick={() => navigate('/browse-apartments')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tìm thêm căn hộ
          </button>
        }
      />

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <PageSkeleton />
      ) : apartments.length === 0 ? (
        <EmptyState
          title="Chưa có căn hộ yêu thích"
          description="Hãy thêm các căn hộ bạn quan tâm vào danh sách yêu thích để dễ dàng theo dõi"
          action={
            <button
              onClick={() => navigate('/browse-apartments')}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tìm căn hộ ngay
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apartments.map(apt => {
            const img = getImg(apt);
            return (
              <Card key={apt.ID} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {img ? (
                    <img src={img} alt={apt.MaCanHo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Remove favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(apt.ID);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors group"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(apt.TrangThai)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">{apt.MaCanHo}</h3>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {apt.toanha?.TenToaNha} • Tầng {apt.Tang}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>{apt.SoPhong} phòng</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span>{apt.DienTich} m²</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Giá thuê</p>
                      <p className="text-base font-bold text-indigo-600">{formatCurrency(apt.GiaThue)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/apartments/${apt.ID}`)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

export default FavoriteApartments;
