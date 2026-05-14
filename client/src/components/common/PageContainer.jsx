// Container cho các trang tenant - style giống trang chủ
import React from 'react';

export const PageContainer = ({ children, maxWidth = '1200px' }) => {
  return (
    <div style={{ 
      maxWidth, 
      margin: '0 auto', 
      padding: '40px 24px',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {children}
    </div>
  );
};

export const PageTitle = ({ children, subtitle }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 700, 
        color: '#1a1a1a',
        marginBottom: subtitle ? '8px' : 0
      }}>
        {children}
      </h1>
      {subtitle && (
        <p style={{ fontSize: '1rem', color: '#666' }}>{subtitle}</p>
      )}
    </div>
  );
};

export const Section = ({ children, style = {} }) => {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px',
      ...style
    }}>
      {children}
    </div>
  );
};

export const SectionTitle = ({ children }) => {
  return (
    <h2 style={{ 
      fontSize: '1.25rem', 
      fontWeight: 600, 
      color: '#1a1a1a',
      marginBottom: '16px'
    }}>
      {children}
    </h2>
  );
};

export const EmptyState = ({ icon = '📭', title, description, action }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px',
      color: '#666'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '24px' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export const LoadingState = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1a7f4b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: '#666' }}>Đang tải...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style = {}
}) => {
  const variants = {
    primary: { background: '#1a7f4b', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#1a7f4b', border: '2px solid #1a7f4b' },
    danger: { background: '#dc3545', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: '#666', border: '1px solid #ddd' },
  };

  const sizes = {
    small: { padding: '6px 16px', fontSize: '0.875rem' },
    medium: { padding: '10px 24px', fontSize: '1rem' },
    large: { padding: '14px 32px', fontSize: '1.125rem' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: '8px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        ...style
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { background: '#f0f0f0', color: '#666' },
    success: { background: '#d4edda', color: '#155724' },
    warning: { background: '#fff3cd', color: '#856404' },
    danger: { background: '#f8d7da', color: '#721c24' },
    info: { background: '#d1ecf1', color: '#0c5460' },
  };

  return (
    <span style={{
      ...variants[variant],
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 600,
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

export const Alert = ({ children, variant = 'info', style = {} }) => {
  const variants = {
    info: { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
    success: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
    warning: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
    danger: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
  };

  return (
    <div style={{
      ...variants[variant],
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      ...style
    }}>
      {children}
    </div>
  );
};
