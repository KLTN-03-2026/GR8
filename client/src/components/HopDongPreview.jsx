// client/src/components/HopDongPreview.jsx
// Tờ hợp đồng cho thuê phòng trọ - hiển thị dạng văn bản pháp lý

import React, { useRef } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

const dot = (label, value, dashes = 30) => (
  <p className="mb-2 text-sm leading-relaxed">
    <span className="font-medium">{label}: </span>
    <span className="border-b border-gray-400 inline-block min-w-[120px]">
      {value || '...................................'}
    </span>
  </p>
);

const formatDate = (d) => {
  if (!d) return '...';
  const date = new Date(d);
  return `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
};

const formatDateShort = (d) => {
  if (!d) return '...';
  return new Date(d).toLocaleDateString('vi-VN');
};

const formatYear = (d) => {
  if (!d) return '...';
  return new Date(d).getFullYear();
};

const soThangHopDong = (start, end) => {
  if (!start || !end) return '...';
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months > 0 ? months : '...';
};

const HopDongPreview = ({ contract, onClose }) => {
  const printRef = useRef();

  if (!contract) return null;

  const benA = contract.canho?.nguoidung; // Chủ nhà
  const benB = contract.nguoidung;        // Người thuê
  const canho = contract.canho;
  const toanha = canho?.toanha;

  const diaChi = toanha?.DiaChi || canho?.DiaChi || '...';
  const tenPhong = canho?.MaCanHo || `Phòng ${canho?.SoPhong}`;
  const soThang = soThangHopDong(contract.NgayBatDau, contract.NgayKetThuc);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hợp đồng cho thuê - ${tenPhong}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 13pt;
              line-height: 1.8;
              color: #000;
              background: #fff;
              padding: 30mm 20mm 20mm 25mm;
            }
            h1, h2, h3, .center { text-align: center; }
            .text-center { text-align: center; }
            .font-bold, strong, b { font-weight: bold; }
            .underline { text-decoration: underline; }
            .italic { font-style: italic; }
            p { margin-bottom: 6pt; }
            ul { margin: 6pt 0 6pt 20pt; }
            li { margin-bottom: 4pt; }

            /* Ký tên - dùng table để không bị ngắt trang */
            .sign-section {
              margin-top: 30pt;
              page-break-inside: avoid;
              width: 100%;
            }
            .sign-table {
              width: 100%;
              border-collapse: collapse;
            }
            .sign-table td {
              width: 50%;
              text-align: center;
              vertical-align: top;
              padding: 0 10pt;
            }
            .sign-name {
              margin-top: 50pt;
              border-top: 1px solid #000;
              padding-top: 4pt;
              font-weight: bold;
            }

            /* Tránh ngắt trang giữa các điều khoản */
            .dieu { page-break-inside: avoid; margin-bottom: 10pt; }

            /* Field gạch chân */
            .field-line {
              display: inline-block;
              min-width: 150pt;
              border-bottom: 1px solid #000;
              padding-bottom: 1pt;
            }

            @page {
              size: A4;
              margin: 25mm 20mm 20mm 25mm;
            }
            @media print {
              body { padding: 0; }
              .sign-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">📄 Hợp Đồng Cho Thuê #{contract.ID}</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
            >
              🖨️ In / Xuất PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <div ref={printRef} className="p-10 font-serif text-gray-900" style={{ fontFamily: "'Times New Roman', serif" }}>

          {/* Tiêu đề */}
          <div className="text-center mb-6">
            <p className="font-bold text-sm uppercase tracking-wide">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
            <p className="text-sm underline font-semibold">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-xs text-gray-500 mt-1">
              ........., {formatDate(contract.NgayKy || contract.NgayBatDau)}
            </p>
          </div>

          <h2 className="text-center text-base font-bold uppercase mb-6">
            Hợp đồng cho thuê phòng trọ
          </h2>

          {/* Bên A */}
          <div className="mb-5">
            <p className="font-bold text-sm mb-2">BÊN A : BÊN CHO THUÊ (PHÒNG TRỌ)</p>
            {dot('Họ và tên', benA?.HoTen)}
            {dot('Năm sinh', benA?.NgaySinh ? formatYear(benA.NgaySinh) : null)}
            {dot('CMND/CCCD', benA?.CCCD || benA?.SoGiayTo)}
            <div className="flex gap-8">
              <div className="flex-1">{dot('Ngày cấp', benA?.NgayCapCCCD ? formatDateShort(benA.NgayCapCCCD) : null)}</div>
              <div className="flex-1">{dot('Nơi cấp', benA?.NoiCapCCCD)}</div>
            </div>
            {dot('Thường trú', benA?.DiaChi)}
            {dot('Điện thoại', benA?.SoDienThoai)}
          </div>

          {/* Bên B */}
          <div className="mb-5">
            <p className="font-bold text-sm mb-2">BÊN B : BÊN THUÊ (PHÒNG TRỌ)</p>
            {dot('Họ và tên', benB?.HoTen)}
            {dot('Năm sinh', benB?.NgaySinh ? formatYear(benB.NgaySinh) : null)}
            {dot('CMND/CCCD', benB?.CCCD || benB?.SoGiayTo)}
            <div className="flex gap-8">
              <div className="flex-1">{dot('Ngày cấp', benB?.NgayCapCCCD ? formatDateShort(benB.NgayCapCCCD) : null)}</div>
              <div className="flex-1">{dot('Nơi cấp', benB?.NoiCapCCCD)}</div>
            </div>
            {dot('Thường trú', benB?.DiaChi)}
            {dot('Điện thoại', benB?.SoDienThoai)}
          </div>

          <p className="text-sm mb-4">Hai bên cùng thỏa thuận và đồng ý với nội dung sau :</p>

          {/* Điều 1 */}
          <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
            <p className="font-bold text-sm mb-2">Điều 1:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>
                Bên A đồng ý cho bên B thuê một phòng trọ thuộc địa chỉ:{' '}
                <strong>{diaChi}</strong>
              </li>
              <li>Tên phòng: <strong>{tenPhong}</strong>{canho?.Tang ? ` — Tầng ${canho.Tang}` : ''}</li>
              {canho?.DienTich && <li>Diện tích: <strong>{canho.DienTich} m²</strong></li>}
              <li>Dịch vụ sử dụng</li>
              <li>Tài sản phòng sử dụng</li>
              <li>
                Thời hạn thuê phòng trọ là <strong>{soThang} tháng</strong> kể từ ngày{' '}
                <strong>{formatDateShort(contract.NgayBatDau)}</strong>
                {' '}đến ngày <strong>{formatDateShort(contract.NgayKetThuc)}</strong>
              </li>
            </ul>
          </div>

          {/* Điều 2 */}
          <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
            <p className="font-bold text-sm mb-2">Điều 2: Giá thuê và phương thức thanh toán</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>
                Giá thuê phòng: <strong>{formatCurrency(contract.GiaThue)}/tháng</strong>
              </li>
              <li>
                Tiền đặt cọc: <strong>{formatCurrency(contract.TienCoc)}</strong>
                {contract.TienCocDaNhan > 0 && (
                  <span> (đã nhận: <strong>{formatCurrency(contract.TienCocDaNhan)}</strong>)</span>
                )}
              </li>
              <li>Thanh toán vào ngày <strong>05</strong> hàng tháng</li>
              <li>Hình thức thanh toán: Tiền mặt hoặc chuyển khoản</li>
            </ul>
          </div>

          {/* Điều 3 */}
          <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
            <p className="font-bold text-sm mb-2">Điều 3: Trách nhiệm bên A</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Giao phòng đúng thời hạn đã thỏa thuận</li>
              <li>Đảm bảo các tiện ích cơ bản trong phòng hoạt động bình thường</li>
              <li>Không tự ý vào phòng khi chưa có sự đồng ý của bên B</li>
              <li>Thông báo trước <strong>30 ngày</strong> nếu muốn lấy lại phòng</li>
            </ul>
          </div>

          {/* Điều 4 */}
          <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
            <p className="font-bold text-sm mb-2">Điều 4: Trách nhiệm bên B</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Thanh toán tiền thuê đúng hạn</li>
              <li>Giữ gìn vệ sinh, không gây ồn ào ảnh hưởng đến người xung quanh</li>
              <li>Không tự ý sửa chữa, cải tạo phòng khi chưa có sự đồng ý của bên A</li>
              <li>Thông báo trước <strong>30 ngày</strong> nếu muốn chấm dứt hợp đồng</li>
              <li>Bồi thường thiệt hại nếu làm hư hỏng tài sản của bên A</li>
            </ul>
          </div>

          {/* Điều 5 */}
          <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
            <p className="font-bold text-sm mb-2">Điều 5: Điều khoản chung</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Hợp đồng có hiệu lực kể từ ngày ký</li>
              <li>Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng</li>
              <li>Hợp đồng được lập thành <strong>02 bản</strong>, mỗi bên giữ <strong>01 bản</strong></li>
            </ul>
          </div>

          {contract.GhiChu && (
            <div className="mb-4">
              <p className="font-bold text-sm mb-1">Ghi chú:</p>
              <p className="text-sm italic text-gray-700">{contract.GhiChu}</p>
            </div>
          )}

          {/* Ký tên */}
          <div className="sign-section" style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
            <table className="sign-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 20px' }}>
                    <p className="font-bold text-sm">BÊN A</p>
                    <p className="text-xs text-gray-500">(Ký và ghi rõ họ tên)</p>
                    <p className="font-semibold text-sm" style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                      {benA?.HoTen || '...........................'}
                    </p>
                  </td>
                  <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 20px' }}>
                    <p className="font-bold text-sm">BÊN B</p>
                    <p className="text-xs text-gray-500">(Ký và ghi rõ họ tên)</p>
                    <p className="font-semibold text-sm" style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                      {benB?.HoTen || '...........................'}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HopDongPreview;
