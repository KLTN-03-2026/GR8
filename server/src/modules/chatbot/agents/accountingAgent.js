/**
 * Accounting Agent — KeToan
 * Xem hóa đơn, công nợ, thanh toán, báo cáo tài chính
 */
import prisma from "../../../config/prisma.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── Tổng quan tài chính ──────────────────────────────────────────────────────
export const getFinancialOverview = async () => {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [paid, unpaid, overdue, pendingReadings] = await Promise.all([
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, TrangThai: "DaTT" },
      _sum: { TongTien: true },
      _count: true,
    }),
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, TrangThai: "ChuaTT" },
      _sum: { TongTien: true },
      _count: true,
    }),
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, TrangThai: "QuaHan" },
      _sum: { TongTien: true },
      _count: true,
    }),
    prisma.chisodiennuoc.count({
      where: { TrangThai: "ChoDuyetKeToan" },
    }),
  ]);

  return `💼 **Tổng quan tài chính:**

✅ **Đã thu:** ${Number(paid._sum.TongTien || 0).toLocaleString("vi-VN")}đ (${paid._count} hóa đơn)
⚠️ **Chưa thu:** ${Number(unpaid._sum.TongTien || 0).toLocaleString("vi-VN")}đ (${unpaid._count} hóa đơn)
❌ **Quá hạn:** ${Number(overdue._sum.TongTien || 0).toLocaleString("vi-VN")}đ (${overdue._count} hóa đơn)
📊 **Chỉ số điện nước chờ duyệt:** ${pendingReadings} bản ghi

👉 Quản lý hóa đơn: ${CLIENT_URL}/hoadon-all
👉 Duyệt chỉ số: ${CLIENT_URL}/pending-readings`;
};

// ─── Hóa đơn quá hạn ─────────────────────────────────────────────────────────
export const getOverdueInvoices = async () => {
  const invoices = await prisma.hoadon.findMany({
    where: { is_deleted: 0, TrangThai: "QuaHan" },
    include: {
      hopdong: {
        include: {
          canho: { select: { MaCanHo: true } },
          nguoidung: { select: { HoTen: true, SoDienThoai: true } },
        },
      },
    },
    orderBy: { NgayDenHan: "asc" },
    take: 15,
  });

  if (!invoices.length) return "✅ Không có hóa đơn quá hạn.";

  const totalDebt = invoices.reduce((sum, hd) => sum + Number(hd.TongTien), 0);

  const lines = invoices.map((hd) => {
    const tenant = hd.hopdong?.nguoidung?.HoTen || "N/A";
    const phone = hd.hopdong?.nguoidung?.SoDienThoai || "N/A";
    const canho = hd.hopdong?.canho?.MaCanHo || "N/A";
    const daysOverdue = Math.ceil((new Date() - new Date(hd.NgayDenHan)) / (1000 * 60 * 60 * 24));
    return `• **${hd.MaHoaDon || `HD-${hd.ID}`}** | ${canho} | ${tenant} (${phone})\n  ${Number(hd.TongTien).toLocaleString("vi-VN")}đ | Quá hạn **${daysOverdue} ngày**`;
  });

  return `❌ **Hóa đơn quá hạn (${invoices.length}):**\n${lines.join("\n\n")}\n\n📊 Tổng nợ quá hạn: **${totalDebt.toLocaleString("vi-VN")}đ**\n👉 ${CLIENT_URL}/hoadon-all`;
};

// ─── Chỉ số điện nước chờ duyệt ──────────────────────────────────────────────
export const getPendingMeterReadings = async () => {
  const readings = await prisma.chisodiennuoc.findMany({
    where: { TrangThai: "ChoDuyetKeToan" },
    include: {
      canho: { select: { MaCanHo: true } },
      nguoidung: { select: { HoTen: true } },
    },
    orderBy: { NgayGhi: "asc" },
    take: 10,
  });

  if (!readings.length) return "✅ Không có chỉ số điện nước nào chờ duyệt.";

  const lines = readings.map((r) => {
    const dien = Number(r.ChiSoDienMoi) - Number(r.ChiSoDienCu || 0);
    const nuoc = Number(r.ChiSoNuocMoi) - Number(r.ChiSoNuocCu || 0);
    const nguoiGhi = r.nguoidung?.HoTen || "N/A";
    return `• **${r.canho?.MaCanHo}** | Tháng ${r.ThangNam} | Điện: ${dien} kWh | Nước: ${nuoc} m³ | Ghi bởi: ${nguoiGhi}`;
  });

  return `📊 **Chỉ số điện nước chờ duyệt (${readings.length}):**\n${lines.join("\n")}\n\n👉 Duyệt tại: ${CLIENT_URL}/pending-readings`;
};

// ─── Thống kê theo tháng ──────────────────────────────────────────────────────
export const getMonthlyStats = async (message) => {
  // Tìm tháng trong message, mặc định tháng hiện tại
  const monthMatch = message.match(/tháng\s*(\d{1,2})(?:\s*\/\s*(\d{4}))?/i);
  const now = new Date();
  const month = monthMatch ? String(monthMatch[1]).padStart(2, "0") : String(now.getMonth() + 1).padStart(2, "0");
  const year = monthMatch?.[2] || now.getFullYear();
  const thangNam = `${year}-${month}`;

  const [invoices, payments] = await Promise.all([
    prisma.hoadon.findMany({
      where: { is_deleted: 0, ThangNam: thangNam },
      select: { TrangThai: true, TongTien: true },
    }),
    prisma.thanhtoan.findMany({
      where: {
        NgayThanhToan: {
          gte: new Date(`${year}-${month}-01`),
          lt: new Date(Number(month) === 12 ? `${Number(year) + 1}-01-01` : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`),
        },
      },
      select: { SoTien: true, PhuongThuc: true },
    }),
  ]);

  const totalBilled = invoices.reduce((s, h) => s + Number(h.TongTien), 0);
  const totalPaid = invoices.filter((h) => h.TrangThai === "DaTT").reduce((s, h) => s + Number(h.TongTien), 0);
  const totalUnpaid = invoices.filter((h) => h.TrangThai !== "DaTT").reduce((s, h) => s + Number(h.TongTien), 0);

  const paymentByMethod = payments.reduce((acc, p) => {
    acc[p.PhuongThuc] = (acc[p.PhuongThuc] || 0) + Number(p.SoTien);
    return acc;
  }, {});

  const methodLines = Object.entries(paymentByMethod)
    .map(([method, amount]) => `  - ${method}: ${amount.toLocaleString("vi-VN")}đ`)
    .join("\n");

  return `📊 **Thống kê tháng ${thangNam}:**

📋 Tổng hóa đơn: ${invoices.length} | Tổng tiền: **${totalBilled.toLocaleString("vi-VN")}đ**
✅ Đã thu: **${totalPaid.toLocaleString("vi-VN")}đ** (${invoices.filter((h) => h.TrangThai === "DaTT").length} hóa đơn)
⚠️ Chưa thu: **${totalUnpaid.toLocaleString("vi-VN")}đ**

💳 **Phương thức thanh toán:**
${methodLines || "  Chưa có giao dịch"}

👉 Báo cáo: ${CLIENT_URL}/reports`;
};
