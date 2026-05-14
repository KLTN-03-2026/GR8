// client/src/pages/TermsOfService.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </span>
      {title}
    </h2>
    <div className="pl-10 space-y-3 text-gray-600 leading-relaxed">
      {children}
    </div>
  </div>
);

const SubItem = ({ number, children }) => (
  <div className="mb-3">
    <p className="font-semibold text-gray-700 mb-1">{number}</p>
    <p>{children}</p>
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-disc list-inside space-y-1.5 ml-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Điều khoản sử dụng</h1>
          </div>
          <p className="text-blue-100 text-sm">Cập nhật lần cuối: tháng 5 năm 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Intro */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl mb-10">
            <p className="text-gray-700 leading-relaxed mb-3">
              Điều khoản sử dụng dưới đây mô tả các điều khoản sử dụng và chế tài của chúng tôi{' '}
              <strong className="text-blue-700">"SMARTBUILDING - Quản lý căn hộ cho thuê"</strong>.
              Thông qua việc sử dụng SMARTBUILDING - Quản lý căn hộ cho thuê (sau đây được gọi chung là{' '}
              <strong>"Ứng Dụng"</strong>) trên toàn lãnh thổ Việt Nam.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Điều khoản sử dụng này áp dụng cho tất cả các Khách hàng sử dụng ứng dụng, sau đây được gọi chung là <strong>"bạn"</strong>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Vui lòng đọc kỹ Điều khoản sử dụng này để bảo đảm bạn hiểu rõ các điều khoản và chế tài của chúng tôi.
            </p>
          </div>

          {/* Section 1 */}
          <Section number="1" title="Định nghĩa">
            <SubItem number="1.1. Ứng Dụng:">
              Nghĩa là Ứng Dụng <strong>SMARTBUILDING - Quản lý căn hộ cho thuê</strong> là một sản phẩm của SMARTBUILDING.
            </SubItem>
            <SubItem number="1.2. Dữ Liệu cá nhân:">
              Địa chỉ, ngày sinh, quốc tịch, số điện thoại, địa chỉ email, hình ảnh của bạn, số nhận dạng do chính phủ cấp,
              dữ liệu sinh trắc học và các thông tin khác của bạn. Mà khi được gộp chung với những thông tin khác,
              sẽ có thể nhận dạng được bạn.
            </SubItem>
            <SubItem number="1.3. Dữ Liệu tài sản:">
              Là các thông tin liên quan tới nhà trọ của bạn.
            </SubItem>
            <SubItem number="1.4. Dữ Liệu:">
              Là gọi chung của "Dữ Liệu cá nhân" và "Dữ Liệu tài sản".
            </SubItem>
            <SubItem number="1.5. Khách thuê phòng:">
              Là người thuê phòng trọ của nhà trọ của bạn.
            </SubItem>
          </Section>

          {/* Section 2 */}
          <Section number="2" title="Phạm vi áp dụng">
            <p>
              Điều khoản sử dụng này áp dụng cho chủ nhà đang sử dụng dịch vụ{' '}
              <strong>SMARTBUILDING - Quản lý căn hộ cho thuê</strong>, bao gồm 2 phiên bản iOS, Android
              và phiên bản máy tính.
            </p>
          </Section>

          {/* Section 3 */}
          <Section number="3" title="Cam đoan, bảo đảm và cam kết">
            <p>Bằng việc sử dụng Dịch Vụ, bạn cam đoan, bảo đảm và cam kết rằng:</p>

            <SubItem number="3.1. Cung cấp thông tin chính xác">
              Bạn phải đảm bảo rằng các dữ liệu cá nhân và dữ liệu tài sản cho thuê là chính xác, đúng thực tế:
            </SubItem>
            <BulletList items={[
              'Các dữ liệu tài sản cho thuê như giá cả, tiền điện, tiền nước... phải đúng giá thị trường. Không nâng giá vượt quá mức cho phép.',
              'Hình ảnh, video mô tả cho nhà trọ phải chính xác, đúng thực tế bằng cách chụp ảnh hoặc quay từ nguồn nhà trọ của bạn. Không sao chép từ bất cứ nguồn nào khác.',
              'Bạn phải đảm bảo rằng các thông tin bạn cung cấp phải liên quan tới dịch vụ, không được sử dụng khác mục đích dịch vụ của chúng tôi.',
            ]} />

            <SubItem number="3.2. Cung cấp thông tin đầy đủ và rõ ràng">
              Bạn phải đảm bảo rằng các dữ liệu của bạn cung cấp đầy đủ, không thiếu sót gây hiểu nhầm cho khách thuê dẫn đến mâu thuẫn.
              Dữ liệu cung cấp phải rõ ràng.
            </SubItem>
          </Section>

          {/* Section 4 */}
          <Section number="4" title="Chế tài khi vi phạm điều khoản">
            <p>
              Nếu bạn vi phạm các điều khoản sử dụng trên, chúng tôi có quyền khóa tài khoản, ngừng cung cấp
              dịch vụ và không hiển thị dữ liệu của bạn cho khách thuê phòng.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <p>
                  Nếu tài khoản bạn bị khóa trong vòng <strong>3 tháng (90 ngày)</strong> kể từ ngày khóa mà
                  không có kiến nghị chính đáng nào, chúng tôi sẽ xóa tài khoản của bạn.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">📋</span>
                <p>
                  Bạn phải tải hoặc trích xuất dữ liệu trước khi tài khoản bị xóa khỏi dịch vụ của chúng tôi,
                  trong thời hạn <strong>30 ngày</strong> kể từ ngày báo xóa tài khoản.
                </p>
              </div>
            </div>
          </Section>

          {/* Footer note */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi tại{' '}
              <a href="mailto:support@smartbuilding.vn" className="text-blue-600 hover:underline font-medium">
                support@smartbuilding.vn
              </a>
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
