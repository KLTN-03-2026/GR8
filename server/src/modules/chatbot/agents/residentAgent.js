/**
 * Resident Agent — NguoiThue / KhachVangLai
 * Chỉ xem dữ liệu của chính họ: hóa đơn, hợp đồng, sự cố, dịch vụ
 * Khách vãng lai chỉ xem thông tin công khai: căn hộ trống, tiện ích, dịch vụ
 */
import prisma from "../../../config/prisma.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── Căn hộ trống (public) ────────────────────────────────────────────────────
export const getAvailableApartments = async (message) => {
  // Dùng chung parser từ guestAgent
  const { getAvailableApartments: guestGetApartments } = await import("./guestAgent.js");
  return guestGetApartments(message);
};

// ─── Hóa đơn của cư dân ──────────────────────────────────────────────────────
export const getMyInvoices = async (userId) => {
  const invoices = await prisma.hoadon.findMany({
    where: {
      is_deleted: 0,
      hopdong: { NguoiThueID: Number(userId) },
    },
    include: {
      hopdong: { include: { canho: { select: { MaCanHo: true } } } },
      hoadonchitiet: true,
    },
    orderBy: { NgayLap: "desc" },
    take: 5,
  });

  if (!invoices.length) return "Bạn chưa có hóa đơn nào.";

  const statusMap = { ChuaTT: "⚠️ Chưa thanh toán", DaTT: "✅ Đã thanh toán", QuaHan: "❌ Quá hạn" };

  const lines = invoices.map((hd) => {
    const canho = hd.hopdong?.canho?.MaCanHo || "N/A";
    const status = statusMap[hd.TrangThai] || hd.TrangThai;
    const details = hd.hoadonchitiet.map((ct) => `  - ${ct.Loai}: ${Number(ct.SoTien).toLocaleString("vi-VN")}đ`).join("\n");
    return `• **${hd.MaHoaDon || `HD-${hd.ID}`}** | Căn hộ ${canho} | Tháng ${hd.ThangNam}\n  Tổng: **${Number(hd.TongTien).toLocaleString("vi-VN")}đ** | ${status}\n${details}`;
  });

  const unpaidCount = invoices.filter((h) => h.TrangThai !== "DaTT").length;
  const summary = unpaidCount > 0 ? `\n⚠️ Bạn có **${unpaidCount}** hóa đơn chưa thanh toán.` : "";

  return `💰 **Hóa đơn của bạn:**\n${lines.join("\n\n")}${summary}\n\n👉 Xem tất cả: ${CLIENT_URL}/my-invoices`;
};

// ─── Hợp đồng của cư dân ─────────────────────────────────────────────────────
export const getMyContracts = async (userId) => {
  const contracts = await prisma.hopdong.findMany({
    where: {
      is_deleted: 0,
      NguoiThueID: Number(userId),
      TrangThai: { in: ["DaKy", "DangThue"] },
    },
    include: { canho: { select: { MaCanHo: true, Tang: true, GiaThue: true } } },
    take: 3,
  });

  if (!contracts.length) return "Bạn chưa có hợp đồng đang hoạt động.";

  const lines = contracts.map((hd) => {
    const batDau = new Date(hd.NgayBatDau).toLocaleDateString("vi-VN");
    const ketThuc = new Date(hd.NgayKetThuc).toLocaleDateString("vi-VN");
    const daysLeft = Math.ceil((new Date(hd.NgayKetThuc) - new Date()) / (1000 * 60 * 60 * 24));
    const warning = daysLeft <= 30 && daysLeft > 0 ? ` ⚠️ Còn ${daysLeft} ngày` : daysLeft <= 0 ? " ❌ Đã hết hạn" : "";
    return `• **Hợp đồng #${hd.ID}** | Căn hộ ${hd.canho?.MaCanHo}\n  Từ ${batDau} → ${ketThuc}${warning}\n  Giá thuê: ${Number(hd.GiaThue).toLocaleString("vi-VN")}đ/tháng`;
  });

  return `📄 **Hợp đồng của bạn:**\n${lines.join("\n\n")}\n\n👉 ${CLIENT_URL}/my-contracts`;
};

// ─── Sự cố của cư dân ────────────────────────────────────────────────────────
export const getMyIncidents = async (userId) => {
  const incidents = await prisma.yeucausuco.findMany({
    where: { NguoiThueID: Number(userId) },
    include: { canho: { select: { MaCanHo: true } } },
    orderBy: { NgayBao: "desc" },
    take: 5,
  });

  if (!incidents.length) return "Bạn chưa có yêu cầu sự cố nào.";

  const statusMap = {
    Moi: "🆕 Mới",
    QuanLyDaNhan: "👀 Đã tiếp nhận",
    DangXuLy: "🔧 Đang xử lý",
    DaGiaiQuyet: "✅ Đã giải quyết",
  };

  const lines = incidents.map((sc) => {
    const ngay = new Date(sc.NgayBao).toLocaleDateString("vi-VN");
    return `• **${sc.TieuDe}** | Căn hộ ${sc.canho?.MaCanHo}\n  ${statusMap[sc.TrangThai] || sc.TrangThai} | Ngày báo: ${ngay}`;
  });

  return `🔧 **Sự cố của bạn:**\n${lines.join("\n\n")}\n\n👉 Báo sự cố mới: ${CLIENT_URL}/my-incidents`;
};

// ─── Hướng dẫn thanh toán ────────────────────────────────────────────────────
export const getPaymentGuide = async (userId) => {
  const unpaid = await prisma.hoadon.findFirst({
    where: {
      is_deleted: 0,
      TrangThai: { in: ["ChuaTT", "QuaHan"] },
      hopdong: { NguoiThueID: Number(userId) },
    },
    orderBy: { NgayDenHan: "asc" },
  });

  const guide = `📱 **Hướng dẫn thanh toán hóa đơn:**
1. Vào **"Hóa đơn của tôi"**: ${CLIENT_URL}/my-invoices
2. Chọn hóa đơn cần thanh toán
3. Chọn phương thức: **VNPay** (thẻ ATM/Visa/QR) hoặc **Chuyển khoản**
4. Xác nhận → Hệ thống tự cập nhật`;

  const unpaidInfo = unpaid
    ? `\n\n⚠️ **Hóa đơn cần thanh toán:** Tháng ${unpaid.ThangNam} — **${Number(unpaid.TongTien).toLocaleString("vi-VN")}đ** (hạn: ${new Date(unpaid.NgayDenHan).toLocaleDateString("vi-VN")})`
    : "\n\n✅ Bạn không có hóa đơn nào cần thanh toán.";

  return guide + unpaidInfo;
};

// ─── Chỉ số điện nước ────────────────────────────────────────────────────────
export const getMyMeterReadings = async (userId) => {
  const contract = await prisma.hopdong.findFirst({
    where: { NguoiThueID: Number(userId), TrangThai: "DangThue", is_deleted: 0 },
    select: { CanHoID: true, canho: { select: { MaCanHo: true } } },
  });

  if (!contract) return "Bạn chưa có hợp đồng đang thuê để xem chỉ số điện nước.";

  const readings = await prisma.chisodiennuoc.findMany({
    where: { CanHoID: contract.CanHoID },
    orderBy: { ThangNam: "desc" },
    take: 3,
  });

  if (!readings.length) return "Chưa có dữ liệu chỉ số điện nước cho căn hộ của bạn.";

  const lines = readings.map((r) => {
    const dien = Number(r.ChiSoDienMoi) - Number(r.ChiSoDienCu || 0);
    const nuoc = Number(r.ChiSoNuocMoi) - Number(r.ChiSoNuocCu || 0);
    return `• **Tháng ${r.ThangNam}** | Điện: ${dien} kWh | Nước: ${nuoc} m³`;
  });

  return `⚡ **Chỉ số điện nước — Căn hộ ${contract.canho?.MaCanHo}:**\n${lines.join("\n")}`;
};

// ─── Thông tin công khai ──────────────────────────────────────────────────────
export const getPublicInfo = async () => {
  const [services, amenities] = await Promise.all([
    prisma.dichvu.findMany({ where: { TrangThai: "Active" }, take: 8 }),
    prisma.tienich.findMany({ take: 10 }),
  ]);

  const serviceList = services.map((s) => `• ${s.TenDichVu}: ${Number(s.Gia).toLocaleString("vi-VN")}đ`).join("\n");
  const amenityList = amenities.map((a) => a.TenTienIch).join(", ");

  return `🏢 **Thông tin SmartBuilding:**\n\n🛎️ **Dịch vụ:**\n${serviceList}\n\n🏊 **Tiện ích:** ${amenityList}\n\n👉 Đăng ký dịch vụ: ${CLIENT_URL}/my-services`;
};
