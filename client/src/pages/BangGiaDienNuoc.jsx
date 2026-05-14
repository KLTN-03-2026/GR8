// client/src/pages/BangGiaDienNuoc.jsx
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';

const ELECTRICITY_TIERS = [
  { bac: 1, from: 0,   to: 50,   price: 1984 },
  { bac: 2, from: 51,  to: 100,  price: 2050 },
  { bac: 3, from: 101, to: 200,  price: 2380 },
  { bac: 4, from: 201, to: 300,  price: 2998 },
  { bac: 5, from: 301, to: 400,  price: 3350 },
  { bac: 6, from: 401, to: null, price: 3460 },
];

const WATER_PRICE  = 10000;
const COMMON_FEE   = 200000;
const CLEANING_FEE = 50000;

const EXAMPLE_KWH = 170;
const tinhBacThang = (kwh) => {
  let remaining = kwh;
  const steps = [];
  for (const tier of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const capacity = tier.to === null ? remaining : (tier.to - tier.from + 1);
    const inTier = Math.min(remaining, capacity);
    steps.push({ bac: tier.bac, inTier, price: tier.price, subtotal: inTier * tier.price });
    remaining -= inTier;
  }
  return steps;
};
const exampleSteps = tinhBacThang(EXAMPLE_KWH);
const exampleTotal = exampleSteps.reduce((s, x) => s + x.subtotal, 0);
const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';

const BangGiaDienNuoc = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="max-w-2xl mx-auto py-10 px-4">

        <button onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Quay lại
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cách tính tiền điện nước</h1>
        <p className="text-gray-500 text-sm mb-10">Giải thích công thức và bảng giá áp dụng tại tòa nhà</p>

        {/* ĐIỆN */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">1. Tiền điện</h2>
          <p className="text-sm text-gray-700 mb-4">
            Mỗi căn hộ có công tơ điện riêng. Nhân viên kỹ thuật ghi chỉ số hàng tháng.
            Hệ thống tính lượng tiêu thụ theo công thức:
          </p>
          <p className="text-sm text-gray-800 font-mono bg-gray-50 border border-gray-200 rounded px-4 py-2 mb-4">
            Tiêu thụ (kWh) = Chỉ số mới − Chỉ số cũ
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Tiền điện được tính theo bậc thang lũy tiến của EVN (Quyết định 1062/QĐ-BCT).
            Nghĩa là mỗi kWh trong từng bậc áp một mức giá khác nhau, bậc càng cao giá càng tăng.
          </p>

          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Bậc</th>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Mức tiêu thụ</th>
                <th className="text-right py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Đơn giá (đ/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {ELECTRICITY_TIERS.map((t, i) => (
                <tr key={t.bac} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2.5 px-4 text-gray-700">Bậc {t.bac}</td>
                  <td className="py-2.5 px-4 text-gray-700">{t.from} – {t.to === null ? 'trở lên' : t.to} kWh</td>
                  <td className="py-2.5 px-4 text-right text-gray-900 font-medium">{t.price.toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm font-semibold text-gray-800 mb-2">Ví dụ: Căn hộ tiêu thụ {EXAMPLE_KWH} kWh trong tháng</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden text-sm mb-2">
            {exampleSteps.map((s, i) => (
              <div key={s.bac} className={`flex justify-between px-4 py-2 ${i < exampleSteps.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-gray-700">Bậc {s.bac}: {s.inTier} kWh × {s.price.toLocaleString('vi-VN')}đ</span>
                <span className="text-gray-900 font-medium">{s.subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200 font-semibold">
              <span className="text-gray-800">Tổng tiền điện ({EXAMPLE_KWH} kWh)</span>
              <span className="text-gray-900">{exampleTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </section>

        {/* NƯỚC */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">2. Tiền nước</h2>
          <p className="text-sm text-gray-700 mb-4">
            Mỗi căn hộ có đồng hồ nước riêng. Tiền nước tính theo đơn giá cố định:
          </p>
          <p className="text-sm text-gray-800 font-mono bg-gray-50 border border-gray-200 rounded px-4 py-2 mb-4">
            Tiền nước = Tiêu thụ (m³) × {WATER_PRICE.toLocaleString('vi-VN')}đ/m³
          </p>
          <p className="text-sm text-gray-700">
            Ví dụ: Dùng 5 m³ → 5 × {WATER_PRICE.toLocaleString('vi-VN')}đ = <strong>{(5 * WATER_PRICE).toLocaleString('vi-VN')}đ</strong>
          </p>
        </section>

        {/* PHÍ KHÁC */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">3. Các khoản phí cố định hàng tháng</h2>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Khoản phí</th>
                <th className="text-left py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Mô tả</th>
                <th className="text-right py-2.5 px-4 font-semibold text-gray-700 border-b border-gray-200">Mức phí</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="py-2.5 px-4 text-gray-700">Tiền thuê căn hộ</td>
                <td className="py-2.5 px-4 text-gray-500">Theo hợp đồng thuê</td>
                <td className="py-2.5 px-4 text-right text-gray-700">Theo hợp đồng</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-2.5 px-4 text-gray-700">Phí quản lý chung</td>
                <td className="py-2.5 px-4 text-gray-500">Vận hành tòa nhà, bảo vệ, thang máy</td>
                <td className="py-2.5 px-4 text-right text-gray-900 font-medium">{fmt(COMMON_FEE)}/tháng</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2.5 px-4 text-gray-700">Phí vệ sinh</td>
                <td className="py-2.5 px-4 text-gray-500">Dọn dẹp khu vực chung, thu gom rác</td>
                <td className="py-2.5 px-4 text-right text-gray-900 font-medium">{fmt(CLEANING_FEE)}/tháng</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* TỔNG KẾT */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">4. Cấu trúc hóa đơn hàng tháng</h2>
          <p className="text-sm text-gray-700 mb-3">Hóa đơn hàng tháng bao gồm các khoản sau:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
            <li>Tiền thuê căn hộ (theo hợp đồng)</li>
            <li>Tiền điện (bậc thang EVN, tính theo chỉ số công tơ)</li>
            <li>Tiền nước ({WATER_PRICE.toLocaleString('vi-VN')}đ/m³, tính theo chỉ số đồng hồ)</li>
            <li>Phí quản lý chung ({COMMON_FEE.toLocaleString('vi-VN')}đ/tháng)</li>
            <li>Phí vệ sinh ({CLEANING_FEE.toLocaleString('vi-VN')}đ/tháng)</li>
            <li>Dịch vụ phát sinh (nếu có)</li>
          </ol>
          <p className="text-sm text-gray-500 mt-4">
            Hóa đơn được phát hành tự động vào ngày tính tiền nhà của từng căn hộ. Hạn thanh toán là 15 ngày kể từ ngày phát hành.
          </p>
        </section>

      </div>
      <AppFooter />
    </div>
  );
};

export default BangGiaDienNuoc;
