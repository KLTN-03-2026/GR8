// client/src/pages/canho/BrowseApartments.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate, useLocation } from 'react-router-dom';
import { normalizeAnhCanHoEntries, resolveMediaUrl, getFeaturedImageUrl } from '../../utils/mediaUrl';
import {
  PageWrapper, PageHeader, Alert, Card, Btn,
  EmptyState, PageSkeleton,
} from '../../components/tenant/TenantUI';
import ApartmentFilter from '../../components/canho/ApartmentFilter';

const BrowseApartments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apartments, setApartments]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [filter, setFilter] = useState({
    minPrice: '', maxPrice: '',
    Tang: '', SoPhong: '',
    minDienTich: '', maxDienTich: '',
    search: '',
    ToaNhaID: '', TrangThai: '',
    minGia: '', maxGia: '',
    minDT: '', maxDT: '',
  });
  const [favorites, setFavorites]         = useState([]);
  const [buildings, setBuildings]         = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteApartments') || '[]');
    setFavorites(savedFavorites);

    const fetchBuildings = async () => {
      try {
        const res = await axios.get('/toanha');
        setBuildings(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch buildings:', err);
      }
    };
    fetchBuildings();

    // Check for initial search from Home page
    if (location.state?.initialSearch) {
      setFilter(prev => ({ ...prev, search: location.state.initialSearch }));
    }
  }, [location.state]);

  useEffect(() => { fetchApartments(); }, [filter]);

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = { TrangThai: 'Trong' };
      if (filter.Tang)      params.Tang     = filter.Tang;
      if (filter.SoPhong)   params.SoPhong  = filter.SoPhong;
      if (filter.search)    params.search   = filter.search;
      if (filter.ToaNhaID)  params.ToaNhaID = filter.ToaNhaID;
      if (filter.minGia)    params.minGia   = filter.minGia;
      if (filter.maxGia)    params.maxGia   = filter.maxGia;

      const res = await axios.get('/apartments', { params });
      let data = res.data.data || [];
      if (!Array.isArray(data)) data = data.items || [];
      if (!Array.isArray(data)) data = [];

      // Client-side area filter
      data = data.filter(a => {
        const minDT = filter.minDT || filter.minDienTich;
        const maxDT = filter.maxDT || filter.maxDienTich;
        if (minDT || maxDT) {
          const area = parseFloat(a.DienTich);
          if (minDT && area < parseFloat(minDT)) return false;
          if (maxDT && area > parseFloat(maxDT)) return false;
        }
        return true;
      });

      setApartments(data);
    } catch (err) { setError(err.response?.data?.message || 'Không thể tải căn hộ'); }
    finally { setLoading(false); }
  }, [filter]);

  const getImg = (apt) => getFeaturedImageUrl(apt?.AnhCanHo);

  const toggleFavorite = (aptId) => {
    const newFavorites = favorites.includes(aptId)
      ? favorites.filter(id => id !== aptId)
      : [...favorites, aptId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteApartments', JSON.stringify(newFavorites));
    setSuccess(newFavorites.includes(aptId) ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
    setTimeout(() => setSuccess(''), 2000);
  };

  const isFavorite = (aptId) => favorites.includes(aptId);

  return (
    <PageWrapper>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏠</span>
            <h1 className="text-2xl font-bold text-gray-900">
              Khám phá căn hộ{' '}
              <span className="text-emerald-600">phù hợp với bạn</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-9">
            {apartments.length > 0
              ? `Đang hiển thị ${apartments.length} căn hộ còn trống`
              : 'Tìm kiếm căn hộ theo nhu cầu của bạn'}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn
            variant="secondary"
            onClick={() => navigate('/favorite-apartments')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Yêu thích ({favorites.length})
          </Btn>
          <Btn variant="secondary" onClick={() => navigate('/my-rental-requests')}>Yêu cầu của tôi</Btn>
          <Btn variant="secondary" onClick={fetchApartments}>Làm mới</Btn>
        </div>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error"   message={error}   onClose={() => setError('')}   />

      {/* Filter */}
      <ApartmentFilter
        filter={filter}
        onChange={setFilter}
        onSearch={(f) => setFilter(f)}
        buildings={buildings}
        loading={loading}
      />

      {loading ? <PageSkeleton /> : apartments.length === 0 ? (
        <EmptyState title="Không tìm thấy căn hộ" description="Hiện tại không có căn hộ nào phù hợp với tiêu chí của bạn" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apartments.map(apt => {
            const img = getImg(apt);
            return (
              <Card key={apt.ID} className="overflow-hidden flex flex-col">
                {/* Image */}
                <div className="h-44 bg-gray-100 flex-shrink-0 overflow-hidden relative">
                  {img ? (
                    <img src={img} alt={apt.MaCanHo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                  {/* Favorite button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(apt.ID); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow hover:scale-110 transition-transform"
                    title={isFavorite(apt.ID) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${isFavorite(apt.ID) ? 'text-red-500' : 'text-gray-400'}`}
                      fill={isFavorite(apt.ID) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{apt.MaCanHo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Phòng {apt.SoPhong} &bull; Tầng {apt.Tang} &bull; {apt.DienTich} m²
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-200 flex-shrink-0">
                      Còn trống
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(apt.GiaThue)}
                      <span className="text-xs font-normal text-gray-500">/tháng</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Tiền cọc: {formatCurrency(apt.TienCoc)}</p>
                  </div>

                  {apt.MoTa && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{apt.MoTa}</p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <Btn
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/apartments/${apt.ID}`)}
                    >
                      Xem chi tiết
                    </Btn>
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

export default BrowseApartments;
