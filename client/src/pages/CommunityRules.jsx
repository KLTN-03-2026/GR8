// client/src/pages/CommunityRules.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </span>
      {title}
    </h2>
    <div className="pl-10 text-gray-600 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-disc list-inside space-y-1.5 ml-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const CommunityRules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Quy Định Cộng Đồng</h1>
          </div>
          <p className="text-emerald-100 text-sm">Cập nhật lần cuối: tháng 5 năm 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Intro */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-xl mb-10">
            <p className="text-gray-700 leading-relaxed">
              Chào mừng bạn đến với <strong className="text-emerald-700">SMARTBUILDING</strong> – hệ thống quản lý
              căn hộ thông minh tích hợp Chatbot AI. Để xây dựng một môi trường văn minh, an toàn và thân thiện
              cho tất cả người dùng, chúng tôi đề ra các quy định cộng đồng dưới đây. Khi sử dụng hệ thống,
              bạn đồng ý tuân thủ toàn bộ các quy định này.
            </p>
          </div>

          <Section number="1" title="Tôn trọng cộng đồng và người dùng khác">
            <p>
              Người dùng cần giữ thái độ lịch sự, tôn trọng và văn minh trong quá trình sử dụng hệ thống.
              Mọi hành vi xúc phạm, quấy rối, đe dọa, phân biệt đối xử hoặc sử dụng ngôn từ thiếu văn hóa
              đối với người dùng khác, chủ nhà hoặc ban quản lý đều không được chấp nhận.
            </p>
          </Section>

          <Section number="2" title="Cung cấp thông tin trung thực">
            <p>
              Người dùng có trách nhiệm cung cấp thông tin cá nhân chính xác và hợp lệ khi đăng ký tài khoản,
              thuê căn hộ hoặc sử dụng các chức năng của hệ thống. Các hành vi giả mạo danh tính, sử dụng
              thông tin sai sự thật hoặc cố tình gây hiểu nhầm có thể dẫn đến việc khóa tài khoản mà không
              cần báo trước.
            </p>
          </Section>

          <Section number="3" title="Tuân thủ quy định về đăng tải nội dung">
            <p>
              Mọi nội dung được đăng tải trên hệ thống như thông tin căn hộ, hình ảnh, mô tả, bình luận hoặc
              phản hồi phải đảm bảo phù hợp với quy định pháp luật và tiêu chuẩn cộng đồng. Người dùng không
              được đăng tải:
            </p>
            <BulletList items={[
              'Nội dung sai sự thật hoặc gây hiểu nhầm',
              'Nội dung phản cảm, kích động bạo lực hoặc vi phạm pháp luật',
              'Nội dung quảng cáo trái phép hoặc spam',
              'Nội dung xâm phạm quyền riêng tư của người khác',
            ]} />
          </Section>

          <Section number="4" title="Bảo mật tài khoản">
            <p>
              Người dùng có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Không chia sẻ tài
              khoản cho người khác sử dụng hoặc thực hiện các hành vi truy cập trái phép vào tài khoản, dữ
              liệu hoặc hệ thống của người khác.
            </p>
          </Section>

          <Section number="5" title="Quy định về thuê căn hộ">
            <p>
              Người thuê cần thực hiện đúng quy trình thuê nhà, thanh toán và tuân thủ các điều khoản trong
              hợp đồng thuê căn hộ. Các hành vi gian lận, sử dụng thông tin giả hoặc vi phạm thỏa thuận thuê
              nhà có thể bị từ chối sử dụng dịch vụ.
            </p>
          </Section>

          <Section number="6" title="Quy định về Chatbot AI">
            <p>
              Chatbot AI được xây dựng nhằm hỗ trợ tư vấn và giải đáp thông tin cho người dùng. Người dùng
              không được sử dụng chatbot vào các mục đích:
            </p>
            <BulletList items={[
              'Phát tán nội dung độc hại hoặc phản cảm',
              'Khai thác lỗ hổng hệ thống',
              'Gửi spam hoặc nội dung vi phạm pháp luật',
            ]} />
            <p className="mt-2 text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 SMARTBUILDING có quyền lưu lại lịch sử tương tác để nâng cao chất lượng dịch vụ và đảm bảo
              an toàn hệ thống.
            </p>
          </Section>

          <Section number="7" title="Quyền và trách nhiệm của ban quản lý">
            <p>
              Ban quản lý có quyền kiểm tra, xử lý hoặc hạn chế các tài khoản vi phạm quy định cộng đồng
              nhằm đảm bảo môi trường hoạt động an toàn và minh bạch. Đồng thời, ban quản lý có trách nhiệm
              bảo vệ thông tin cá nhân của người dùng theo chính sách bảo mật của hệ thống.
            </p>
          </Section>

          <Section number="8" title="Xử lý vi phạm">
            <p>Các tài khoản vi phạm quy định cộng đồng có thể bị:</p>
            <BulletList items={[
              'Cảnh báo',
              'Hạn chế chức năng',
              'Tạm khóa hoặc khóa vĩnh viễn tài khoản',
            ]} />
            <p className="mt-2 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              ⚠️ Tùy theo mức độ vi phạm, SMARTBUILDING có thể phối hợp với cơ quan chức năng để xử lý theo
              quy định pháp luật.
            </p>
          </Section>

          <Section number="9" title="Thay đổi và cập nhật quy định">
            <p>
              SMARTBUILDING có quyền thay đổi hoặc cập nhật quy định cộng đồng bất cứ lúc nào nhằm phù hợp
              với quá trình phát triển hệ thống và các quy định pháp luật hiện hành. Người dùng nên thường
              xuyên theo dõi để cập nhật những thay đổi mới nhất.
            </p>
          </Section>

          {/* Closing note */}
          <div className="mt-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-emerald-800 font-medium">
              🏠 SMARTBUILDING mong muốn xây dựng một cộng đồng văn minh, minh bạch và hiện đại, nơi mọi
              người có thể kết nối và sử dụng dịch vụ một cách an toàn, thuận tiện và hiệu quả.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ{' '}
              <a href="mailto:support@smartbuilding.vn" className="text-emerald-600 hover:underline font-medium">
                support@smartbuilding.vn
              </a>
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Quay lại
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityRules;
