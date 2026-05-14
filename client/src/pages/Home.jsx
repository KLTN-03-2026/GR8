// client/src/pages/Home.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import FloatingBanners from '../components/common/FloatingBanners';
import { getFeaturedImageUrl } from '../utils/mediaUrl';

// ── Carousel trượt thực sự ───────────────────────────────────────────────────
const HotCarousel = ({ items, onViewDetail }) => {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState('next');
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const total = items.length;
  const MAX_VISIBLE = 3;
  const isSlidable = total > MAX_VISIBLE;
  const GAP = 24;
  const SLIDE_MS = 600;

  const go = useCallback((dir) => {
    if (sliding || !isSlidable) return;
    setDirection(dir);
    setSliding(true);
    setTimeout(() => {
      setCurrent(c => dir === 'next' ? (c + 1) % total : (c - 1 + total) % total);
      setSliding(false);
    }, SLIDE_MS);
  }, [sliding, total, isSlidable]);

  useEffect(() => {
    if (paused || !isSlidable) return;
    timerRef.current = setInterval(() => go('next'), 3800);
    return () => clearInterval(timerRef.current);
  }, [paused, go, isSlidable]);

  if (total === 0) return null;

  const getIdx = (offset) => (current + offset + total) % total;

  const slideOffset = sliding && isSlidable
    ? (direction === 'next' ? -(350 + GAP) : (350 + GAP))
    : 0;

  const AptCard = ({ apt, isCenter }) => {
    const src = getFeaturedImageUrl(apt.AnhCanHo);
    const toa = apt.toanha?.TenToaNha || '';

    return (
      <div
        onClick={() => onViewDetail(apt.ID)}
        style={{
          width: '350px',
          flex: '0 0 350px',
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: isCenter
            ? '0 20px 60px rgba(76,175,122,0.22), 0 4px 16px rgba(0,0,0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.07)',
          border: isCenter ? '2px solid #4CAF7A' : '1.5px solid #E5E7EB',
          transform: isCenter ? 'scale(1.03) translateY(-3px)' : 'scale(0.97)',
          transition: `transform ${SLIDE_MS}ms cubic-bezier(0.4,0,0.2,1), box-shadow ${SLIDE_MS}ms ease, opacity ${SLIDE_MS}ms ease, border-color ${SLIDE_MS}ms ease`,
          opacity: isCenter ? 1 : 0.75,
          position: 'relative',
        }}
      >
        {/* Ảnh */}
        <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' }}>
          {src
            ? <img src={src} alt={apt.MaCanHo}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 56 }}>🏠</span>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Chưa có ảnh</span>
              </div>
          }
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />

          {/* HOT badge */}
          <span style={{
            position: 'absolute', top: 14, left: 14,
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff', borderRadius: 8, padding: '5px 12px',
            fontSize: 12, fontWeight: 800, letterSpacing: 0.8,
            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
          }}>HOT</span>

          {/* Trạng thái */}
          <span style={{
            position: 'absolute', top: 14, right: 14,
            background: apt.TrangThai === 'Trong' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
            color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
          }}>
            {apt.TrangThai === 'Trong' ? 'Còn trống' : 'Đã thuê'}
          </span>

          {/* Tên căn hộ overlay */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {apt.MaCanHo}
            </h3>
            {toa && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>{toa}</p>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#F8FAFC', borderRadius: 12, overflow: 'hidden', border: '1px solid #F1F5F9' }}>
            {[
              { label: 'Tầng', value: apt.Tang },
              { label: 'Phòng', value: apt.SoPhong },
              { label: 'Diện tích', value: `${apt.DienTich} m²` },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                borderRight: i < 2 ? '1px solid #E5E7EB' : 'none',
              }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Giá */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 2 }}>Giá thuê/tháng</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>
                {formatCurrency(apt.GiaThue)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 2 }}>Tiền cọc</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                {formatCurrency(apt.TienCoc)}
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={e => { e.stopPropagation(); onViewDetail(apt.ID); }}
            style={{
              width: '100%', padding: '12px 0',
              background: isCenter
                ? 'linear-gradient(135deg,#4CAF7A,#059669)'
                : 'linear-gradient(135deg,#A8E6CF,#4CAF7A)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: isCenter ? '0 4px 16px rgba(76,175,122,0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: 0.3,
            }}
          >
            Xem chi tiết →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ position: 'relative', userSelect: 'none', padding: '8px 0 32px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Sliding track — overflow hidden để ẩn thẻ thứ 4, padding để thẻ giữa scale không bị cắt */}
      <div style={{ 
        overflow: 'hidden', 
        padding: '20px 0 12px',
        width: isSlidable ? `calc(350px * ${MAX_VISIBLE} + ${GAP * (MAX_VISIBLE - 1)}px)` : 'auto',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          gap: GAP,
          justifyContent: isSlidable ? 'flex-start' : 'center',
          transform: `translateX(${slideOffset}px)`,
          transition: sliding && isSlidable ? `transform ${SLIDE_MS}ms cubic-bezier(0.4,0,0.2,1)` : 'none',
        }}>
          {isSlidable ? (
            Array.from({ length: MAX_VISIBLE + 1 }).map((_, offset) => {
              const apt = items[getIdx(offset)];
              const centerIndex = Math.floor(MAX_VISIBLE / 2);
              const isCenter = offset === centerIndex;
              return <AptCard key={`${apt.ID}-${offset}`} apt={apt} isCenter={isCenter} />;
            })
          ) : (
            items.map((apt, idx) => {
              const centerIndex = Math.floor(total / 2);
              const isCenter = idx === centerIndex;
              return <AptCard key={apt.ID} apt={apt} isCenter={isCenter} />;
            })
          )}
        </div>
      </div>

      {/* Prev / Next */}
      {total > 1 && (
        <>
          {[
            { dir: 'prev', side: 'left', icon: '‹' },
            { dir: 'next', side: 'right', icon: '›' },
          ].map(({ dir, side, icon }) => (
            <button key={dir} onClick={() => go(dir)} style={{
              position: 'absolute', [side]: -50, top: '45%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
              cursor: 'pointer', fontSize: 22, fontWeight: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3, transition: 'all 0.2s', color: '#374151',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.color = '#059669'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; }}
            >{icon}</button>
          ))}
        </>
      )}

      {/* Dots */}
      {isSlidable && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => { if (!sliding) setCurrent(i); }} style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: i === current
                ? 'linear-gradient(90deg,#4CAF7A,#059669)'
                : '#D1FAE5',
              transition: 'all 0.35s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  );
};


const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ contracts: 0, unpaidInvoices: 0, requests: 0 });

  // Chỉ fetch căn hộ được đánh dấu HOT
  useEffect(() => {
    api.get('/apartments?limit=100&TrangThai=Trong')
      .then(res => {
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : (raw?.items || []);
        // Chỉ hiển thị căn hộ HOT
        const hotList = list.filter(a => a.IsHot);
        setApartments(hotList);
      })
      .catch(() => setApartments([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch tenant stats if logged in as tenant
  useEffect(() => {
    if (!user) return;
    const role = user.roles?.TenVaiTro || user.VaiTro;
    if (!['NguoiThue', 'KhachVangLai'].includes(role)) return;

    Promise.all([
      api.get('/hopdong/my').catch(() => ({ data: { data: [] } })),
      api.get('/hoadon/my-invoices').catch(() => ({ data: { data: [] } })),
      api.get('/yeucauthue/my').catch(() => ({ data: { data: [] } })),
    ]).then(([contractsRes, invoicesRes, requestsRes]) => {
      const contracts = contractsRes.data?.data || [];
      const invoices = invoicesRes.data?.data || invoicesRes.data?.items || [];
      const requests = requestsRes.data?.data || [];
      
      setStats({
        contracts: contracts.filter(c => ['DaKy', 'DangThue'].includes(c.TrangThai)).length,
        unpaidInvoices: invoices.filter(i => i.TrangThai === 'ChuaThanhToan' || i.TrangThai === 'ChuaTT').length,
        requests: requests.filter(r => r.TrangThai === 'DangXuLy' || r.TrangThai === 'ChoKiemTra').length,
      });
    });
  }, [user]);

  const filtered = apartments.filter(a =>
    !search ||
    a.MaCanHo?.toLowerCase().includes(search.toLowerCase()) ||
    String(a.SoPhong).includes(search)
  );

  const isTenant = user && ['NguoiThue', 'KhachVangLai'].includes(user.roles?.TenVaiTro || user.VaiTro);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AppHeader />

      {/* Hero */}
      <section style={{
        height: 520,
        background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80) center/cover',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#fff', padding: '0 20px', maxWidth: 800 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 16, letterSpacing: -1, lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.18)', fontFamily: "'Segoe UI', 'Be Vietnam Pro', sans-serif" }}>
            Tìm kiếm căn hộ cho thuê
          </h1>
          <p style={{ fontSize: '1.15rem', marginBottom: 40, opacity: 0.92, fontWeight: 400, letterSpacing: 0.3, fontStyle: 'italic' }}>
            Hệ thống quản lý căn hộ thông minh &nbsp;•&nbsp; Thành phố Đà Nẵng
          </p>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 10,
            display: 'flex', gap: 10, maxWidth: 600, margin: '0 auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nhập tên căn hộ, số phòng..."
              style={{ 
                flex: 1, 
                border: 'none', 
                outline: 'none', 
                padding: '12px 18px', 
                fontSize: 15, 
                borderRadius: 8,
                color: '#1F2937',
                background: '#F8F9FA',
                fontWeight: 500,
              }}
            />
            <button style={{
              background: 'linear-gradient(135deg, #A8E6CF 0%, #4CAF7A 100%)', 
              color: '#fff', 
              border: 'none',
              borderRadius: 8, 
              padding: '12px 28px', 
              fontWeight: 700, 
              fontSize: 15, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 230, 207, 0.4)',
            }}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      

      {/* Featured */}
      <section id="featured" style={{ maxWidth: 1200, margin: '60px auto', padding: '0 24px', overflow: 'visible' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1F2937', marginBottom: 12 }}>CĂN HỘ NỔI BẬT</h2>
          <div style={{ width: 80, height: 4, background: 'linear-gradient(90deg, #A8E6CF, #4CAF7A)', margin: '0 auto 16px', borderRadius: 2 }} />
          <p style={{ color: '#6B7280', fontSize: '1.05rem', fontWeight: 500 }}>Những căn hộ nổi bật được chọn lọc</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-300 mx-auto mb-4"></div>
            <p className="font-medium">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
            <p className="font-medium">Chưa có căn hộ nổi bật</p>
          </div>
        ) : (
          <div style={{ padding: '0 8px', overflow: 'visible', position: 'relative' }}>
            <FloatingBanners />
            <HotCarousel items={filtered} onViewDetail={(id) => navigate(`/apartments/${id}`)} />
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate(user ? '/browse-apartments' : '/browse-apartments')}
            style={{ 
              background: 'linear-gradient(135deg, #A8E6CF 0%, #4CAF7A 100%)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 10, 
              padding: '14px 56px', 
              fontWeight: 800, 
              fontSize: 16, 
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168, 230, 207, 0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 230, 207, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(168, 230, 207, 0.4)';
            }}
          >
            Xem tất cả căn hộ
          </button>
        </div>
      </section>

      {/* Info */}
      <section id="info" style={{ background: '#fff', padding: '80px 24px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          {[
            { icon: '', title: 'Căn hộ chất lượng', desc: 'Hàng trăm căn hộ được lựa chọn kỹ càng' },
            { icon: '', title: 'Tìm kiếm nhanh', desc: 'Hệ thống tìm kiếm mạnh mẽ và dễ sử dụng' },
            { icon: '', title: 'Thông tin minh bạch', desc: 'Toàn bộ thông tin cập nhật hàng ngày' },
            { icon: '', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ sẵn sàng giúp đỡ' },
          ].map(c => (
            <div key={c.title} style={{ textAlign: 'center', padding: '40px 28px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 16, border: '1px solid #A8E6CF' }}>
              <div style={{ fontSize: '3rem', marginBottom: 18 }}>{c.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#1F2937', marginBottom: 10, fontSize: '1.1rem' }}>{c.title}</h3>
              <p style={{ color: '#6B7280', fontSize: 14, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <AppFooter />

      {/* Zalo Floating Button */}
      <a
        href="https://zalo.me/0357877087"
        target="_blank"
        rel="noopener noreferrer"
        title="Liên hệ Zalo"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
          alt="Zalo"
          style={{ width: '48px', height: '48px', display: 'block' }}
        />
      </a>
    </div>
  );
};

export default Home;
