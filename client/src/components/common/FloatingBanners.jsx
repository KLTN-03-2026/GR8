import React from 'react';

const FloatingBanners = () => {
  return (
    <>
      <style>
        {`
          @keyframes bannerFloat {
            0%, 100% { transform: translateY(-50%) translateX(0); }
            50% { transform: translateY(-52%) translateX(0); }
          }
          
          .vn-floating-banner {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            width: 120px;
            height: 480px;
            border-radius: 12px; /* Đã giảm độ bo tròn từ 24px xuống 12px */
            overflow: hidden;
            display: none;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            animation: bannerFloat 6s ease-in-out infinite;
            cursor: pointer;
          }

          @media (min-width: 1500px) {
            .vn-floating-banner {
              display: block;
            }
          }

          .vn-floating-banner:hover {
            transform: translateY(-50%) scale(1.02);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.6);
          }

          .banner-content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 32px 16px;
            text-align: center;
            color: #ffffff;
            position: relative;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }

          .banner-left, .banner-right {
            background: linear-gradient(145deg, rgba(110, 210, 170, 0.85) 0%, rgba(60, 170, 125, 0.95) 100%);
          }

          .banner-left {
            left: -220px;
          }

          .banner-right {
            right: -220px;
            animation-delay: -3s; 
          }

          .banner-icon-wrapper {
            width: 56px;
            height: 56px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 10px; /* Đã giảm độ bo tròn icon từ 16px xuống 10px */
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }

          .vn-floating-banner:hover .banner-icon-wrapper {
            background: rgba(255, 255, 255, 0.4);
            transform: translateY(-4px);
          }

          .banner-text-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
          }

          .banner-main-title {
            font-size: 15px;
            font-weight: 700;
            line-height: 1.4;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .banner-sub-text {
            font-size: 13px;
            opacity: 0.9;
            line-height: 1.5;
            font-weight: 500;
          }

          .banner-action-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            opacity: 0.8;
            margin-top: 16px;
          }

          .vn-floating-banner:hover .banner-action-btn {
            opacity: 1;
            background: #ffffff;
            color: #3caa7d; 
            transform: scale(1.1);
          }

          .banner-decor {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
            z-index: 0;
            pointer-events: none;
          }
          .decor-1 { width: 120px; height: 120px; top: -40px; right: -40px; }
          .decor-2 { width: 100px; height: 100px; bottom: -20px; left: -40px; }
          
          .banner-icon-wrapper, .banner-text-group, .banner-action-btn {
            z-index: 1;
          }
        `}
      </style>

      {/* Left Banner: Payment */}
      <div className="vn-floating-banner banner-left">
        <div className="banner-content">
          <div className="banner-decor decor-1"></div>
          <div className="banner-decor decor-2"></div>
          
          <div className="banner-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          
          <div className="banner-text-group">
            <div className="banner-main-title">Thanh toán<br/>An toàn</div>
            <div className="banner-sub-text">Hỗ trợ VietQR bảo mật 100%</div>
          </div>

          
        </div>
      </div>

      {/* Right Banner: AI Chatbot */}
      <div className="vn-floating-banner banner-right">
        <div className="banner-content">
          <div className="banner-decor decor-1"></div>
          <div className="banner-decor decor-2"></div>

          <div className="banner-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <line x1="8" y1="16" x2="8" y2="16"></line>
              <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
          </div>

          <div className="banner-text-group">
            <div className="banner-main-title">Trợ lý AI<br/>Thông minh</div>
            <div className="banner-sub-text">Trực tuyến 24/7<br/>Giải đáp tức thì</div>
          </div>

          
        </div>
      </div>
    </>
  );
};

export default FloatingBanners;