/**
 * Manager Agent — QuanLy / ChuNha
 * Xem toàn hệ thống: tổng quan, tất cả hóa đơn, sự cố, người thuê, thống kê
 */
import prisma from "../../../config/prisma.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── Tổng quan hệ thống ───────────────────────────────────────────────────────
export const getSystemOverview = async () => {
  const [
    totalApts, rentedApts, emptyApts,
    totalUsers, activeContracts,
    unpaidInvoices, openIncidents,
  ] = await Promise.all([
    prisma.canho.count({ where: { is_deleted: 0 } }),
    prisma.canho.count({ where: { is_deleted: 0, TrangThai: "DaThue" } }),
    prisma.canho.count({ where: { is_deleted: 0, TrangThai: "Trong" } }),
    prisma.nguoidung.count({ where: { is_deleted: 0, TrangThai: "Active" } }),
    prisma.hopdong.count({ where: { is_deleted: 0, TrangThai: "DangThue" } }),
    prisma.hoadon.count({ where: { is_deleted: 0, TrangThai: { in: ["ChuaTT", "QuaHan"] } } }),
    prisma.yeucausuco.count({ where: { TrangThai: { in: ["Moi", "QuanLyDaNhan", "DangXuLy"] } } }),
  ]);

  const occupancyRate = totalApts > 0 ? Math.round((rentedApts / totalApts) * 100) : 0;

  return `📊 **Tổng quan hệ thống SmartBuilding:**

🏢 **Căn hộ:** ${totalApts} tổng | ${rentedApts} đang thuê | ${emptyApts} trống | Tỷ lệ lấp đầy: **${occupancyRate}%**
👥 **Người dùng:** ${totalUsers} tài khoản active | ${activeContracts} hợp đồng đang thuê
💰 **Hóa đơn chưa thanh toán:** ${unpaidInvoices} hóa đơn
🔧 **Sự cố đang xử lý:** ${openIncidents} yêu cầu

👉 Dashboard: ${CLIENT_URL}/dashboard`;
};

// ─── Danh sách hóa đơn chưa thanh toán ───────────────────────────────────────
export const getUnpaidInvoices = async () => {
  const invoices = await prisma.hoadon.findMany({
    where: { is_deleted: 0, TrangThai: { in: ["ChuaTT", "QuaHan"] } },
    include: {
      hopdong: {
        include: {
          canho: { select: { MaCanHo: true } },
          nguoidung: { select: { HoTen: true, SoDienThoai: true } },
        },
      },
    },
    orderBy: { NgayDenHan: "asc" },
    take: 10,
  });

  if (!invoices.length) return "✅ Không có hóa đơn nào chưa thanh toán.";

  const totalDebt = invoices.reduce((sum, hd) => sum + Number(hd.TongTien), 0);
  const overdueCount = invoices.filter((hd) => hd.TrangThai === "QuaHan").length;

  const lines = invoices.map((hd) => {
    const tenant = hd.hopdong?.nguoidung?.HoTen || "N/A";
    const canho = hd.hopdong?.canho?.MaCanHo || "N/A";
    const status = hd.TrangThai === "QuaHan" ? "❌ Quá hạn" : "⚠️ Chưa TT";
    return `• **${hd.MaHoaDon || `HD-${hd.ID}`}** | ${canho} | ${tenant} | ${Number(hd.TongTien).toLocaleString("vi-VN")}đ | ${status}`;
  });

  return `💰 **Hóa đơn chưa thanh toán (${invoices.length}):**\n${lines.join("\n")}\n\n📊 Tổng nợ: **${totalDebt.toLocaleString("vi-VN")}đ** | Quá hạn: ${overdueCount}\n👉 ${CLIENT_URL}/hoadon-all`;
};

// ─── Sự cố đang mở ────────────────────────────────────────────────────────────
export const getOpenIncidents = async () => {
  const incidents = await prisma.yeucausuco.findMany({
    where: { TrangThai: { in: ["Moi", "QuanLyDaNhan", "DangXuLy"] } },
    include: {
      canho: { select: { MaCanHo: true } },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: { select: { HoTen: true } },
      nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung: { select: { HoTen: true } },
    },
    orderBy: [{ DoUuTien: "desc" }, { NgayBao: "asc" }],
    take: 10,
  });

  if (!incidents.length) return "✅ Không có sự cố nào đang mở.";

  const priorityMap = { Cao: "🔴", Trung: "🟡", Thap: "🟢" };
  const statusMap = { Moi: "Mới", QuanLyDaNhan: "Đã tiếp nhận", DangXuLy: "Đang xử lý" };

  const lines = incidents.map((sc) => {
    const priority = priorityMap[sc.DoUuTien] || "⚪";
    const status = statusMap[sc.TrangThai] || sc.TrangThai;
    const tenant = sc.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || "N/A";
    const staff = sc.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung?.HoTen || "Chưa phân công";
    return `${priority} **${sc.TieuDe}** | ${sc.canho?.MaCanHo} | ${tenant}\n  ${status} | KTV: ${staff}`;
  });

  return `🔧 **Sự cố đang xử lý (${incidents.length}):**\n${lines.join("\n\n")}\n\n👉 ${CLIENT_URL}/assign-incidents`;
};

// ─── Danh sách người thuê ─────────────────────────────────────────────────────
export const getTenantList = async () => {
  const contracts = await prisma.hopdong.findMany({
    where: { is_deleted: 0, TrangThai: "DangThue" },
    include: {
      canho: { select: { MaCanHo: true, Tang: true } },
      nguoidung: { select: { HoTen: true, SoDienThoai: true, Email: true } },
    },
    take: 15,
    orderBy: { ID: "desc" },
  });

  if (!contracts.length) return "Hiện không có người thuê nào.";

  const lines = contracts.map((hd) => {
    const tenant = hd.nguoidung;
    return `• **${tenant?.HoTen || "N/A"}** | Căn hộ ${hd.canho?.MaCanHo} | ${tenant?.SoDienThoai || "N/A"}`;
  });

  return `👥 **Danh sách người thuê (${contracts.length}):**\n${lines.join("\n")}\n\n👉 ${CLIENT_URL}/users`;
};

// ─── Thống kê doanh thu ───────────────────────────────────────────────────────
export const getRevenueStats = async () => {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

  const [thisMonthPaid, lastMonthPaid, thisMonthUnpaid] = await Promise.all([
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, ThangNam: thisMonth, TrangThai: "DaTT" },
      _sum: { TongTien: true },
      _count: true,
    }),
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, ThangNam: lastMonth, TrangThai: "DaTT" },
      _sum: { TongTien: true },
      _count: true,
    }),
    prisma.hoadon.aggregate({
      where: { is_deleted: 0, ThangNam: thisMonth, TrangThai: { in: ["ChuaTT", "QuaHan"] } },
      _sum: { TongTien: true },
      _count: true,
    }),
  ]);

  const thisRevenue = Number(thisMonthPaid._sum.TongTien || 0);
  const lastRevenue = Number(lastMonthPaid._sum.TongTien || 0);
  const growth = lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : 0;
  const growthStr = growth >= 0 ? `📈 +${growth}%` : `📉 ${growth}%`;

  return `📊 **Thống kê doanh thu:**

**Tháng ${thisMonth}:**
  ✅ Đã thu: **${thisRevenue.toLocaleString("vi-VN")}đ** (${thisMonthPaid._count} hóa đơn)
  ⚠️ Chưa thu: **${Number(thisMonthUnpaid._sum.TongTien || 0).toLocaleString("vi-VN")}đ** (${thisMonthUnpaid._count} hóa đơn)

**Tháng ${lastMonth}:** ${lastRevenue.toLocaleString("vi-VN")}đ
**So sánh:** ${growthStr} so với tháng trước

👉 Báo cáo chi tiết: ${CLIENT_URL}/reports`;
};

// ─── Yêu cầu thuê chờ duyệt ──────────────────────────────────────────────────
export const getPendingRentRequests = async () => {
  const requests = await prisma.yeucauthue.findMany({
    where: { TrangThai: { in: ["ChoKiemTra", "DatLich"] } },
    include: {
      canho: { select: { MaCanHo: true, GiaThue: true } },
      nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung: { select: { HoTen: true, SoDienThoai: true } },
    },
    orderBy: { NgayYeuCau: "asc" },
    take: 10,
  });

  if (!requests.length) return "✅ Không có yêu cầu thuê nào đang chờ duyệt.";

  const lines = requests.map((r) => {
    const user = r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung;
    const ngay = new Date(r.NgayYeuCau).toLocaleDateString("vi-VN");
    const status = r.TrangThai === "ChoKiemTra" ? "⏳ Chờ kiểm tra" : "📅 Đã đặt lịch";
    return `• **${user?.HoTen || "N/A"}** | Căn hộ ${r.canho?.MaCanHo} | ${ngay} | ${status}`;
  });

  return `📋 **Yêu cầu thuê chờ duyệt (${requests.length}):**\n${lines.join("\n")}\n\n👉 ${CLIENT_URL}/yeucauthue`;
};
