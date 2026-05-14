import { useNavigate } from 'react-router-dom';

const AppFooter = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', fontFamily: 'sans-serif' }}>
      {/* Main footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: '#1a7f4b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>SMARTBUILDING</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: '#94a3b8' }}>
            Hệ thống quản lý căn hộ thông minh. Kết nối cư dân và ban quản lý một cách dễ dàng, hiệu quả.
          </p>
          {/* Social links */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              {
                href: 'https://www.facebook.com/profile.php?id=100083283292203',
                title: 'Facebook',
                color: '#1877f2',
                svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />,
              },
              {
                href: 'https://www.youtube.com/@smartbuilding-c8f',
                title: 'YouTube',
                color: '#ff0000',
                svg: (
                  <>
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                    <polygon fill="#0f172a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                  </>
                ),
              },
              {
                href: 'https://www.tiktok.com/@smartbuilding_gr8',
                title: 'TikTok',
                color: '#fff',
                svg: <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />,
              },
              {
                href: 'https://zalo.me/0357877087',
                title: 'Zalo ',
                color: '#0068ff',
                svg: <text x="4" y="17" fontSize="11" fontWeight="bold" fill="#0068ff" stroke="none">Zalo</text>,
              },
            ].map(s => (
              <a
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
                style={{
                  width: 36, height: 36,
                  background: '#1e293b',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, transform 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = ''; }}
              >
                <svg width="18" height="18" fill={s.color} stroke="none" viewBox="0 0 24 24">
                  {s.svg}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Về chúng tôi */}
        <div>
          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: 0.5 }}>Về chúng tôi</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Giới thiệu', path: '/' },
              { label: 'Đội ngũ', path: '/' },
              { label: 'Tuyển dụng', path: '/' },
              { label: 'Tin tức', path: '/' },
              { label: 'Liên hệ', path: '/' },
            ].map(item => (
              <li key={item.label}>
                <span
                  onClick={() => navigate(item.path)}
                  style={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dịch vụ */}
        <div>
          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: 0.5 }}>Dịch vụ</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Tìm căn hộ', path: '/browse-apartments' },
              { label: 'Căn hộ yêu thích', path: '/favorite-apartments' },
              { label: 'Gửi yêu cầu thuê', path: '/browse-apartments' },
              { label: 'Quản lý hóa đơn', path: '/my-invoices' },
              { label: 'Báo cáo sự cố', path: '/my-incidents' },
              { label: 'Cách tính tiền điện nước', path: '/bang-gia-dien-nuoc' },
            ].map(item => (
              <li key={item.label}>
                <span
                  onClick={() => navigate(item.path)}
                  style={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pháp lý & Liên hệ */}
        <div>
          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: 0.5 }}>Pháp lý</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Chính sách bảo mật', path: '/chinh-sach-bao-mat' },
              { label: 'Điều khoản sử dụng', path: '/dieu-khoan-su-dung' },
              { label: 'Chính sách cookie', path: '/' },
              { label: 'Quy định cộng đồng', path: '/quy-dinh-cong-dong' },
            ].map(item => (
              <li key={item.label}>
                <span
                  onClick={() => navigate(item.path)}
                  style={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12, letterSpacing: 0.5 }}>Liên hệ</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '📍', text: '123 Nguyễn Văn Linh, Thành phố Đà Nẵng' },
              { icon: '📞', text: '0357 877 087' },
              { icon: '✉️', text: 'support@smartbuilding.vn' },
            ].map(c => (
              <div key={c.text} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#94a3b8', alignItems: 'flex-start' }}>
                <span>{c.icon}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1e293b' }} />

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          © 2026 <strong style={{ color: '#94a3b8' }}>SmartBuilding</strong>. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;
