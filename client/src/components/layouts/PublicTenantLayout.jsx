// Layout cho tenant - giống trang chủ, không có sidebar
import React from 'react';
import AppHeader from '../AppHeader';
import AppFooter from '../AppFooter';

const PublicTenantLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AppHeader />
      
      {/* Main content với container giống trang chủ */}
      <main style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {children}
      </main>

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

      {/* Chatbot Widget được render từ App.js, không cần ở đây */}
    </div>
  );
};

export default PublicTenantLayout;
