// Component hiển thị thông báo cho KhachVangLai (chưa có hợp đồng)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoContractNotice = ({ 
  title = "Bạn chưa thuê căn hộ nào",
  message = "Bạn cần có hợp đồng thuê căn hộ để sử dụng tính năng này.",
  showBrowseButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-sky-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-neutral-900 mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-neutral-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        {showBrowseButton && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/browse-apartments')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Tìm căn hộ
            </button>
            <button
              onClick={() => navigate('/my-rental-requests')}
              className="px-6 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 font-medium rounded-lg border border-neutral-300 transition-colors"
            >
              Xem yêu cầu của tôi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoContractNotice;
