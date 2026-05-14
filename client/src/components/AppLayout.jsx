// AppLayout - dùng cho tất cả trang chức năng (thay thế Layout cũ)
import React from 'react';
import AppHeader from './AppHeader';

const AppLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
    <AppHeader />
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {children}
    </main>
    <footer style={{
      background: '#1a1a2e', color: '#aaa',
      textAlign: 'center', padding: '20px 24px',
      fontSize: 13, marginTop: 40,
    }}>
       2026 SmartBuilding  Hệ thống quản lý căn hộ thông minh
    </footer>
  </div>
);

export default AppLayout;
