/**
 * Guest Agent — KhachVangLai (chưa đăng nhập hoặc chưa thuê)
 * Chỉ xem thông tin công khai: căn hộ trống, tiện ích, dịch vụ, hướng dẫn
 */
import prisma from "../../../config/prisma.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

/**
 * Parse điều kiện lọc căn hộ từ câu hỏi tự nhiên
 * VD: "căn hộ 2 người", "phòng dưới 5 triệu", "tầng 3", "50m2"
 */
const parseApartmentFilters = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // Giới hạn người ở: "2 người", "cho 3 người", "giới hạn 2"
  const nguoiMatch = msg.match(/(\d+)\s*người|giới hạn\s*(\d+)|cho\s*(\d+)\s*người/);
  if (nguoiMatch) {
    filters.GioiHanNguoiO = parseInt(nguoiMatch[1] || nguoiMatch[2] || nguoiMatch[3]);
  }

  // Giá: "dưới 5 triệu", "5tr", "3.000.000", "tối đa 4 triệu"
  const giaMaxMatch = msg.match(/dưới\s*([\d,.]+)\s*(triệu|tr|đồng|vnđ)?|tối đa\s*([\d,.]+)\s*(triệu|tr)?|không quá\s*([\d,.]+)\s*(triệu|tr)?/);
  if (giaMaxMatch) {
    const raw = giaMaxMatch[1] || giaMaxMatch[3] || giaMaxMatch[5];
    const unit = giaMaxMatch[2] || giaMaxMatch[4] || giaMaxMatch[6] || '';
    let val = parseFloat(raw.replace(/,/g, ''));
    if (unit.includes('triệu') || unit.includes('tr')) val *= 1_000_000;
    filters.giaMax = val;
  }
  const giaMinMatch = msg.match(/từ\s*([\d,.]+)\s*(triệu|tr)|trên\s*([\d,.]+)\s*(triệu|tr)/);
  if (giaMinMatch) {
    const raw = giaMinMatch[1] || giaMinMatch[3];
    let val = parseFloat(raw.replace(/,/g, ''));
    val *= 1_000_000;
    filters.giaMin = val;
  }

  // Diện tích: "50m2", "trên 40m", "dưới 60m2"
  const dtMatch = msg.match(/(\d+)\s*m[²2]?/);
  if (dtMatch) filters.dienTich = parseInt(dtMatch[1]);

  // Tầng: "tầng 3", "tầng 5"
  const tangMatch = msg.match(/tầng\s*(\d+)/);
  if (tangMatch) filters.tang = parseInt(tangMatch[1]);

  // Số phòng ngủ: "2 phòng ngủ", "1 phòng"
  const phongMatch = msg.match(/(\d+)\s*phòng\s*(ngủ)?/);
  if (phongMatch) filters.soPhong = parseInt(phongMatch[1]);

  // Mã căn hộ cụ thể: A101, B203
  const maMatch = msg.match(/\b([A-Z]\d{3})\b/i);
  if (maMatch) filters.maCanHo = maMatch[1].toUpperCase();

  return filters;
};

// ─── Căn hộ trống (public) ────────────────────────────────────────────────────
export const getAvailableApartments = async (message) => {
  const filters = parseApartmentFilters(message);

  // Build where clause
  const where = { is_deleted: 0, TrangThai: "Trong" };

  if (filters.maCanHo) where.MaCanHo = { contains: filters.maCanHo };
  if (filters.tang) where.Tang = filters.tang;
  if (filters.soPhong) where.SoPhong = filters.soPhong;
  if (filters.GioiHanNguoiO) where.GioiHanNguoiO = { gte: filters.GioiHanNguoiO };
  if (filters.dienTich) where.DienTich = { gte: filters.dienTich - 10, lte: filters.dienTich + 20 };
  if (filters.giaMax) where.GiaThue = { ...(where.GiaThue || {}), lte: filters.giaMax };
  if (filters.giaMin) where.GiaThue = { ...(where.GiaThue || {}), gte: filters.giaMin };

  const apartments = await prisma.canho.findMany({
    where,
    include: {
      toanha: { select: { TenToaNha: true, DiaChi: true } },
      canho_tienich: { include: { tienich: { select: { TenTienIch: true } } } },
    },
    take: 6,
    orderBy: { GiaThue: "asc" },
  });

  if (!apartments.length) {
    // Nếu không tìm thấy với filter chặt → thử lại không filter
    const fallback = await prisma.canho.findMany({
      where: { is_deleted: 0, TrangThai: "Trong" },
      include: {
        toanha: { select: { TenToaNha: true, DiaChi: true } },
        canho_tienich: { include: { tienich: { select: { TenTienIch: true } } } },
      },
      take: 4,
      orderBy: { GiaThue: "asc" },
    });

    if (!fallback.length) return "Hiện tại không có căn hộ trống nào trong hệ thống.";

    const filterDesc = Object.entries(filters).map(([k, v]) => {
      if (k === 'GioiHanNguoiO') return `giới hạn ${v} người`;
      if (k === 'giaMax') return `giá dưới ${(v/1e6).toFixed(1)} triệu`;
      if (k === 'tang') return `tầng ${v}`;
      if (k === 'dienTich') return `~${v}m²`;
      return '';
    }).filter(Boolean).join(', ');

    const lines = fallback.map(formatApartment);
    return `Không tìm thấy căn hộ với điều kiện: **${filterDesc}**.\n\nDưới đây là một số căn hộ trống hiện có:\n\n${lines.join("\n\n")}\n\n📋 Xem tất cả: ${CLIENT_URL}/browse-apartments`;
  }

  const lines = apartments.map(formatApartment);
  const filterDesc = buildFilterDesc(filters);

  return `🏠 **Căn hộ trống${filterDesc ? ` (${filterDesc})` : ''}:**\n\n${lines.join("\n\n")}\n\n📋 Xem tất cả: ${CLIENT_URL}/browse-apartments`;
};

const formatApartment = (a) => {
  const tienich = a.canho_tienich.map((t) => t.tienich.TenTienIch).join(", ");
  return `• **${a.MaCanHo}** | ${a.toanha?.TenToaNha || "N/A"} — ${a.toanha?.DiaChi || ""}
  Tầng ${a.Tang} | ${a.DienTich}m² | Giới hạn ${a.GioiHanNguoiO || 2} người | **${Number(a.GiaThue).toLocaleString("vi-VN")}đ/tháng**
  Tiện ích: ${tienich || "N/A"}
  👉 ${process.env.CLIENT_URL || "http://localhost:3000"}/apartments/${a.ID}`;
};

const buildFilterDesc = (filters) => {
  const parts = [];
  if (filters.GioiHanNguoiO) parts.push(`${filters.GioiHanNguoiO}+ người`);
  if (filters.giaMax) parts.push(`dưới ${(filters.giaMax/1e6).toFixed(1)} triệu`);
  if (filters.giaMin) parts.push(`từ ${(filters.giaMin/1e6).toFixed(1)} triệu`);
  if (filters.tang) parts.push(`tầng ${filters.tang}`);
  if (filters.dienTich) parts.push(`~${filters.dienTich}m²`);
  if (filters.soPhong) parts.push(`${filters.soPhong} phòng`);
  return parts.join(', ');
};

// ─── Thông tin dịch vụ & tiện ích ────────────────────────────────────────────
export const getPublicInfo = async () => {
  const [services, amenities, buildings] = await Promise.all([
    prisma.dichvu.findMany({ where: { TrangThai: "Active" }, take: 8 }),
    prisma.tienich.findMany({ take: 10 }),
    prisma.toanha.findMany({ take: 5, select: { TenToaNha: true, DiaChi: true, SoTang: true } }),
  ]);

  const buildingList = buildings.map((b) => `• **${b.TenToaNha}** — ${b.DiaChi} (${b.SoTang} tầng)`).join("\n");
  const serviceList = services.map((s) => `• ${s.TenDichVu}: **${Number(s.Gia).toLocaleString("vi-VN")}đ**`).join("\n");
  const amenityList = amenities.map((a) => a.TenTienIch).join(", ");

  return `🏢 **Thông tin SmartBuilding:**

🏗️ **Tòa nhà:**
${buildingList}

🛎️ **Dịch vụ:**
${serviceList}

🏊 **Tiện ích:** ${amenityList}

📋 Xem căn hộ trống: ${CLIENT_URL}/browse-apartments`;
};

// ─── Hướng dẫn thuê nhà ──────────────────────────────────────────────────────
export const getRentingGuide = async () => {
  return `📋 **Quy trình thuê căn hộ tại SmartBuilding:**

1. **Tìm căn hộ** phù hợp tại: ${CLIENT_URL}/browse-apartments
2. **Đăng ký tài khoản** hoặc đăng nhập
3. **Gửi yêu cầu thuê** — điền thông tin cá nhân
4. **Đặt lịch xem nhà** — quản lý sẽ liên hệ xác nhận
5. **Ký hợp đồng** và đóng tiền cọc (2 tháng tiền thuê)
6. **Nhận bàn giao** căn hộ và bắt đầu sinh sống

📞 Liên hệ hỗ trợ: Vào mục Chat trực tiếp sau khi đăng nhập`;
};

// ─── Cách tính tiền điện nước ─────────────────────────────────────────────────
export const getBillingInfo = async () => {
  return `**Cách tính tiền điện nước tại SmartBuilding:**

**1. Tiền điện — Bậc thang EVN (Quyết định 1062/QĐ-BCT)**
Mỗi căn hộ có công tơ riêng. Chỉ số được ghi hàng tháng, tính theo bậc lũy tiến:

| Bậc | Mức tiêu thụ | Đơn giá |
|-----|-------------|---------|
| Bậc 1 | 0 – 50 kWh | 1.984đ/kWh |
| Bậc 2 | 51 – 100 kWh | 2.050đ/kWh |
| Bậc 3 | 101 – 200 kWh | 2.380đ/kWh |
| Bậc 4 | 201 – 300 kWh | 2.998đ/kWh |
| Bậc 5 | 301 – 400 kWh | 3.350đ/kWh |
| Bậc 6 | Trên 400 kWh | 3.460đ/kWh |

Ví dụ: Dùng 170 kWh = (50×1.984) + (50×2.050) + (70×2.380) = **368.300đ**

**2. Tiền nước — Giá cố định**
Đơn giá: **10.000đ/m³**
Ví dụ: Dùng 5m³ = 5 × 10.000 = **50.000đ**

**3. Các khoản phí cố định hàng tháng**
- Phí quản lý chung: **200.000đ/tháng**
- Phí vệ sinh: **50.000đ/tháng**
- Tiền thuê: theo hợp đồng

**4. Ngày tính tiền**
- Chỉ số điện ghi vào ngày 3 hàng tháng
- Chỉ số nước ghi vào ngày 2 hàng tháng
- Hóa đơn phát hành vào ngày 5 hàng tháng
- Hạn thanh toán: 15 ngày kể từ ngày phát hành`;
};

// ─── Chính sách & quy định ────────────────────────────────────────────────────
export const getPolicies = async () => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
  return `**Chính sách & Quy định tại SmartBuilding:**

**Hợp đồng thuê:**
- Thời hạn tối thiểu: 6 tháng
- Tiền cọc: 2 tháng tiền thuê
- Thông báo trước khi chấm dứt: 30 ngày
- Gia hạn hợp đồng: liên hệ quản lý trước 30 ngày hết hạn

**Thanh toán:**
- Hạn thanh toán: 15 ngày kể từ ngày phát hành hóa đơn
- Phương thức: Chuyển khoản, VNPay, tiền mặt
- Ngân hàng: Vietcombank — STK: 1031312786
- Phạt trễ hạn: theo quy định hợp đồng

**Quy định sinh hoạt:**
- Giờ yên tĩnh: 22:00 – 06:00
- Không nuôi thú cưng (trừ khi có thỏa thuận riêng)
- Không tự ý sửa chữa, cải tạo căn hộ
- Báo sự cố qua hệ thống trong vòng 24h

**Dịch vụ thêm:**
- Đăng ký dịch vụ qua hệ thống hoặc liên hệ quản lý
- Phí dịch vụ tính vào hóa đơn tháng tiếp theo

Chi tiết: ${CLIENT_URL}/quy-dinh-cong-dong`;
};

// ─── Thông tin liên hệ & hỗ trợ ──────────────────────────────────────────────
export const getContactInfo = async () => {
  return `**Thông tin liên hệ SmartBuilding:**

- Địa chỉ: 123 Nguyễn Văn Linh, Thành phố Đà Nẵng
- Hotline: 0357 877 087
- Email: support@smartbuilding.vn
- Zalo: zalo.me/0357877087

**Giờ làm việc:**
- Thứ 2 – Thứ 6: 8:00 – 17:30
- Thứ 7: 8:00 – 12:00
- Chủ nhật & Lễ: Nghỉ (trực sự cố 24/7)

**Báo sự cố khẩn:** Đăng nhập → Báo sự cố → Chọn mức độ Khẩn cấp`;
};
