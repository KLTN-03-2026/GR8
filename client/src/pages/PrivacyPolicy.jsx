// client/src/pages/PrivacyPolicy.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Chính sách bảo mật</h1>
          </div>
          <p className="text-green-100 text-sm">Cập nhật lần cuối: tháng 5 năm 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Intro */}
          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-xl mb-10">
            <p className="text-gray-700 leading-relaxed mb-3">
              Chính sách bảo mật dưới đây mô tả cách thức mà chúng tôi{' '}
              <strong className="text-green-700">SMARTBUILDING - Tìm căn hộ</strong> thu thập, lưu trữ,
              sử dụng, chuyển giao và bảo vệ dữ liệu của bạn trong quá trình sử dụng ứng dụng
              SMARTBUILDING - Tìm căn hộ.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Chính sách bảo mật này áp dụng cho tất cả các khách hàng, đối tác, sau đây được gọi chung là <strong>"bạn"</strong>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Vui lòng đọc kỹ chính sách bảo mật này để bảo đảm bạn hiểu rõ trình tự xử lý và bảo mật dữ liệu của chúng tôi.
            </p>
          </div>

          {/* Section 1 */}
          <Section number="1" title="Định nghĩa">
            <SubItem number="1.1.">
              Trang web <strong>SMARTBUILDING - Tìm căn hộ</strong> là một sản phẩm của SMARTBUILDING.
              Trang web là giải pháp hữu ích giúp người có nhu cầu thuê nhà trọ nhanh chóng tìm được căn trọ như ý.
            </SubItem>
            <SubItem number="1.2.">
              <strong>Dữ liệu cá nhân:</strong> Tên, địa chỉ, ngày sinh, quốc tịch, số điện thoại, địa chỉ email,
              hình ảnh, mã định danh, dữ liệu sinh trắc học,... mà khi được gộp chung với những thông tin khác
              sẽ nhận dạng được bạn.
            </SubItem>
            <SubItem number="1.3.">
              <strong>Dữ liệu tài sản:</strong> là các thông tin liên quan tới nhà trọ cho thuê.
            </SubItem>
            <SubItem number="1.4.">
              <strong>Dữ liệu:</strong> là gọi chung của "Dữ liệu cá nhân" và "Dữ liệu tài sản".
            </SubItem>
          </Section>

          {/* Section 2 */}
          <Section number="2" title="Thu thập dữ liệu">
            <p>
              Chúng tôi thu thập dữ liệu về bạn theo nhiều hình thức khác nhau được liệt kê dưới đây.
              Ngoài ra, chúng tôi cũng có thể kết hợp các dữ liệu đã được thu thập với những dữ liệu
              chúng tôi đang sở hữu theo quy định của pháp luật.
            </p>

            <SubItem number="2.1. Dữ liệu có được do bạn cung cấp cho chúng tôi">
              Chúng tôi thu thập dữ liệu của bạn khi bạn cung cấp một cách tự nguyện trong các trường hợp sau:
            </SubItem>
            <BulletList items={[
              'Điền vào hồ sơ đăng ký và tạo tài khoản: Tên, địa chỉ, ngày sinh, quốc tịch, số điện thoại, địa chỉ email, hình ảnh, mã định danh, dữ liệu sinh trắc học,...',
              'Thông tin về tài sản nhà trọ: địa chỉ, đơn giá tiền điện, nước, số lượng phòng và các thông tin liên quan.',
              'Tương tác với các trang/kênh mạng xã hội của chúng tôi.',
              'Tham gia các cuộc thi, sự kiện/chương trình do chúng tôi tổ chức.',
            ]} />

            <SubItem number="2.2. Dữ liệu có được khi bạn sử dụng dịch vụ của chúng tôi">
              Dữ liệu có thể được thu thập thông qua hoạt động bình thường của ứng dụng:
            </SubItem>
            <BulletList items={[
              'Vị trí của bạn (để xác định vị trí nhà trọ, giúp khách thuê phòng định vị dễ dàng hơn).',
              'Thông tin giao dịch (phương thức thanh toán và nội dung công việc được yêu cầu).',
              'Thông tin về cách bạn tương tác với ứng dụng (tính năng được sử dụng và nội dung được xem).',
              'Thông tin thiết bị (thông số phần cứng, số sê-ri, địa chỉ IP, hệ điều hành, nhận dạng quảng cáo).',
              'Dữ liệu bạn nhập trong tin nhắn khi sử dụng tính năng giao tiếp trong ứng dụng.',
            ]} />

            <SubItem number="2.3. Dữ liệu có được từ các nguồn khác">
              Khi thu thập dữ liệu từ các nguồn khác, chúng tôi đảm bảo phù hợp theo quy định pháp luật:
            </SubItem>
            <BulletList items={[
              'Từ các chương trình giới thiệu.',
              'Từ các đối tác và các bên khác cung cấp dịch vụ cho chúng tôi.',
              'Từ các nhà cung cấp.',
              'Dữ liệu công khai trên mạng xã hội và một số nguồn công khai khác.',
              'Nguồn dữ liệu Chính Phủ.',
              'Nguồn do khách thuê phòng cung cấp.',
            ]} />

            <SubItem number="2.4. Dữ liệu của bên thứ ba khác được bạn cung cấp cho chúng tôi">
              Trong một số trường hợp, bạn có thể cung cấp cho chúng tôi dữ liệu của bên thứ ba
              (ví dụ: vợ/chồng, thành viên gia đình hoặc bạn bè). Tuy nhiên, bạn cần cam đoan rằng
              bạn đã có được sự chấp thuận của bên thứ ba này để dữ liệu của họ được thu thập, sử dụng
              và tiết lộ cho chúng tôi theo quy định trong Chính sách bảo mật này.
            </SubItem>
          </Section>

          {/* Section 3 */}
          <Section number="3" title="Sử dụng dữ liệu chúng tôi thu nhập">
            <p>
              Chúng tôi có thể sử dụng, kết hợp và xử lý dữ liệu có được cho bất kỳ mục đích nào sau đây,
              cũng như các mục đích khác được cho phép theo quy định pháp luật ("Mục Đích").
            </p>

            <SubItem number="3.1. Cung cấp dịch vụ và các tính năng">
              Dữ liệu của bạn sẽ được sử dụng để cung cấp, cá nhân hóa, duy trì và cải thiện sản phẩm và dịch vụ:
            </SubItem>
            <BulletList items={[
              'Cung cấp cho bạn dịch vụ xuyên suốt các lĩnh vực khác nhau của chúng tôi.',
              'Tạo mới, quản trị và cập nhật tài khoản của bạn.',
              'Xác minh danh tính của bạn.',
              'Phục vụ cho quá trình thanh toán dịch vụ.',
              'Thực hiện các hoạt động nội bộ: khắc phục lỗi, phân tích dữ liệu, thử nghiệm và nghiên cứu.',
              'Bảo vệ tính bảo mật hoặc tính toàn vẹn của dịch vụ.',
              'Cho phép liên lạc giữa những người dùng.',
              'Xử lý, quản lý hoặc xác minh ứng dụng đăng ký của bạn.',
              'Cho phép các đối tác của chúng tôi quản lý và phân bổ nguồn lực.',
            ]} />

            <SubItem number="3.2. An toàn và bảo mật">
              Chúng tôi sử dụng dữ liệu của bạn để đảm bảo an toàn và bảo mật:
            </SubItem>
            <BulletList items={[
              'Sử dụng thiết bị, vị trí, hồ sơ và dữ liệu khác để ngăn chặn, phát hiện và chống lại các hoạt động gian lận, giả mạo hoặc không an toàn.',
              'Giám sát việc tuân thủ các điều khoản và điều kiện cũng như tính xác thực của thông tin bạn cung cấp.',
              'Phát hiện, ngăn chặn và truy tố tội phạm.',
            ]} />

            <SubItem number="3.3. Hỗ trợ khách hàng">
              Chúng tôi sử dụng dữ liệu để giải quyết các vấn đề hỗ trợ khách hàng:
            </SubItem>
            <BulletList items={[
              'Trả lời các câu hỏi, ý kiến và phản hồi.',
              'Thông báo cho bạn về các bước thực hiện để giải quyết các vấn đề hỗ trợ khách hàng.',
            ]} />

            <SubItem number="3.4. Mục đích pháp lý">
              Chúng tôi có thể sử dụng dữ liệu để điều tra và giải quyết khiếu nại hoặc tranh chấp:
            </SubItem>
            <BulletList items={[
              'Tuân thủ các lệnh của tòa án hoặc các yêu cầu pháp lý khác.',
              'Thực thi Điều khoản dịch vụ của chúng tôi hoặc các thỏa thuận khác.',
              'Bảo vệ quyền hoặc tài sản của chúng tôi trong trường hợp khiếu nại hoặc tranh chấp.',
              'Liên quan đến việc sáp nhập, mua lại, liên doanh, bán tài sản công ty hoặc tái cấu trúc.',
            ]} />

            <SubItem number="3.5. Tiếp thị và quảng bá">
              Chúng tôi có thể sử dụng dữ liệu của bạn để tiếp thị sản phẩm, dịch vụ và sự kiện:
            </SubItem>
            <BulletList items={[
              'Gửi cho bạn thông báo, bản tin, cập nhật, thư điện tử, tài liệu quảng cáo, đặc quyền, lời chúc mừng lễ hội.',
              'Thông báo, mời và quản lý sự tham gia của bạn vào các sự kiện hoặc hoạt động của chúng tôi.',
              'Liên lạc qua bưu điện, cuộc gọi điện thoại, SMS, dịch vụ nhắn tin trực tuyến, thông báo đẩy và email.',
            ]} />
            <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              💡 Bạn có thể lựa chọn không nhận thông tin tiếp thị bằng cách nhấp vào liên kết "hủy đăng ký"
              trong email hoặc liên hệ với chúng tôi.
            </p>
          </Section>

          {/* Section 4 */}
          <Section number="4" title="Tiết lộ dữ liệu">
            <p>
              Chúng tôi cần tiết lộ hoặc chia sẻ dữ liệu của bạn với các công ty liên kết hoặc các bên
              khác nhau với các mục đích theo quy định pháp luật.
            </p>

            <SubItem number="4.1. Cung cấp dữ liệu cho khách thuê phòng">
              Chúng tôi sẽ chia sẻ dữ liệu của bạn với khách thuê phòng nhằm mục đích kết nối giữa bạn
              và người có nhu cầu thuê.
            </SubItem>

            <SubItem number="4.2. Với các đối tác của chúng tôi theo yêu cầu của bạn">
              Trường hợp bạn yêu cầu dịch vụ thông qua đối tác hoặc sử dụng chương trình khuyến mại
              do đối tác cung cấp, chúng tôi có thể chia sẻ dữ liệu của bạn với các đối tác đó.
            </SubItem>

            <SubItem number="4.3. Với các cố vấn pháp lý và cơ quan nhà nước">
              Chúng tôi có thể chia sẻ dữ liệu của bạn với các cố vấn pháp lý, cơ quan nhà nước có
              thẩm quyền và các bên thứ ba khác theo quy định của pháp luật.
            </SubItem>

            <SubItem number="4.4. Các mục đích khác">
              Trừ khi được quy định trong chính sách bảo mật này, chúng tôi có thể tiết lộ hoặc chia sẻ
              dữ liệu của bạn nếu chúng tôi thông báo trước cho bạn hoặc đã nhận được sự chấp thuận của bạn.
            </SubItem>
            <p className="text-sm bg-green-50 border border-green-200 rounded-lg p-3 mt-2 font-medium text-green-800">
              🔒 Chúng tôi cam kết không bán hoặc cho thuê dữ liệu của bạn cho bất kỳ bên thứ ba nào.
            </p>
          </Section>

          {/* Section 5 */}
          <Section number="5" title="Lưu giữ dữ liệu">
            <p>
              Chúng tôi lưu giữ dữ liệu của bạn trong suốt thời hạn bạn duy trì tài khoản. Khi có cơ sở
              cho rằng việc lưu giữ dữ liệu của bạn không còn cần thiết, hoặc chúng tôi không còn mục đích
              kinh doanh hoặc pháp lý, chúng tôi sẽ thực hiện các bước để ngăn chặn việc truy cập hoặc sử
              dụng dữ liệu cho bất kỳ mục đích nào ngoài việc tuân thủ theo Chính sách bảo mật này, hoặc
              cho mục đích an toàn, bảo mật, phát hiện và phòng chống gian lận.
            </p>
          </Section>

          {/* Section 6 */}
          <Section number="6" title="Sửa đổi và cập nhật">
            <p>
              Chúng tôi có quyền xem xét, sửa đổi, cập nhật hoặc điều chỉnh các điều khoản của Chính sách
              bảo mật này bất cứ lúc nào, để đảm bảo rằng chính sách này phù hợp với định hướng phát triển
              của chúng tôi trong tương lai và/hoặc thay đổi về các quy định pháp luật, bằng cách chúng tôi
              sẽ công bố Chính sách bảo mật cập nhật trên ứng dụng hoặc gửi thông báo vào địa chỉ email
              mà bạn cung cấp.
            </p>
            <p>
              Bạn đồng ý rằng bạn có trách nhiệm thường xuyên xem lại Chính sách bảo mật này để biết thông
              tin mới nhất về trình tự xử lý dữ liệu và bảo vệ dữ liệu của chúng tôi. Việc bạn tiếp tục
              sử dụng ứng dụng của chúng tôi sau khi có bất kỳ sửa đổi, cập nhật hoặc điều chỉnh chính sách
              bảo mật này sẽ được coi là sự chấp thuận của bạn đối với các nội dung sửa đổi, cập nhật hoặc
              điều chỉnh đó.
            </p>
          </Section>

          {/* Footer note */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại{' '}
              <a href="mailto:support@smartbuilding.vn" className="text-green-600 hover:underline font-medium">
                support@smartbuilding.vn
              </a>
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Quay lại
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
