/**
 * Technical Agent — NhanVienKyThuat
 * Xem sự cố được phân công, lịch trực, chỉ số điện nước cần ghi
 */
import prisma from "../../../config/prisma.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ─── Sự cố được phân công cho kỹ thuật viên ──────────────────────────────────
export const getAssignedIncidents = async (userId) => {
  const incidents = await prisma.yeucausuco.findMany({
    where: {
      NhanVienXuLyID: Number(userId),
      TrangThai: { in: ["QuanLyDaNhan", "DangXuLy"] },
    },
    include: {
      canho: { select: { MaCanHo: true, Tang: true } },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: { select: { HoTen: true, SoDienThoai: true } },
    },
    orderBy: [{ DoUuTien: "desc" }, { NgayBao: "asc" }],
    take: 10,
  });

  if (!incidents.length) return "✅ Bạn không có sự cố nào được phân công.";

  const priorityMap = { Cao: "🔴 Cao", Trung: "🟡 Trung", Thap: "🟢 Thấp" };
  const statusMap = { QuanLyDaNhan: "Đã tiếp nhận", DangXuLy: "Đang xử lý" };

  const lines = incidents.map((sc) => {
    const tenant = sc.nguoidung_yeucausuco_NguoiThueIDTonguoidung;
    const ngay = new Date(sc.NgayBao).toLocaleDateString("vi-VN");
    return `• ${priorityMap[sc.DoUuTien] || "⚪"} **${sc.TieuDe}**\n  Căn hộ ${sc.canho?.MaCanHo} | ${tenant?.HoTen || "N/A"} (${tenant?.SoDienThoai || "N/A"})\n  ${statusMap[sc.TrangThai] || sc.TrangThai} | Ngày báo: ${ngay}`;
  });

  return `🔧 **Sự cố được phân công cho bạn (${incidents.length}):**\n${lines.join("\n\n")}\n\n👉 Xem chi tiết: ${CLIENT_URL}/staff/work`;
};

// ─── Tất cả sự cố mới chưa phân công ─────────────────────────────────────────
export const getNewIncidents = async () => {
  const incidents = await prisma.yeucausuco.findMany({
    where: { TrangThai: "Moi" },
    include: {
      canho: { select: { MaCanHo: true } },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: { select: { HoTen: true } },
    },
    orderBy: [{ DoUuTien: "desc" }, { NgayBao: "asc" }],
    take: 10,
  });

  if (!incidents.length) return "✅ Không có sự cố mới nào.";

  const priorityMap = { Cao: "🔴", Trung: "🟡", Thap: "🟢" };

  const lines = incidents.map((sc) => {
    const ngay = new Date(sc.NgayBao).toLocaleDateString("vi-VN");
    return `${priorityMap[sc.DoUuTien] || "⚪"} **${sc.TieuDe}** | ${sc.canho?.MaCanHo} | ${ngay}`;
  });

  return `🆕 **Sự cố mới chưa phân công (${incidents.length}):**\n${lines.join("\n")}\n\n👉 ${CLIENT_URL}/assign-incidents`;
};

// ─── Lịch trực của kỹ thuật viên ─────────────────────────────────────────────
export const getMySchedule = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const schedules = await prisma.lichtruc.findMany({
    where: {
      NhanVienID: Number(userId),
      NgayTruc: { gte: today, lt: nextWeek },
    },
    orderBy: { NgayTruc: "asc" },
  });

  if (!schedules.length) return "Bạn không có lịch trực nào trong 7 ngày tới.";

  const caMap = { Sang: "🌅 Ca sáng", Chieu: "☀️ Ca chiều", Toi: "🌙 Ca tối", CaNgay: "🌞 Ca ngày" };
  const statusMap = { DangTruc: "✅ Đang trực", DaTruc: "✔️ Đã trực", Huy: "❌ Đã hủy" };

  const lines = schedules.map((s) => {
    const ngay = new Date(s.NgayTruc).toLocaleDateString("vi-VN");
    return `• **${ngay}** | ${caMap[s.CaTruc] || s.CaTruc} | ${statusMap[s.TrangThai] || s.TrangThai}`;
  });

  return `📅 **Lịch trực của bạn (7 ngày tới):**\n${lines.join("\n")}`;
};

// ─── Chỉ số điện nước cần ghi ─────────────────────────────────────────────────
export const getPendingMeterWork = async () => {
  // Tìm căn hộ chưa có chỉ số tháng này
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const recordedThisMonth = await prisma.chisodiennuoc.findMany({
    where: { ThangNam: thisMonth },
    select: { CanHoID: true },
  });

  const recordedIds = recordedThisMonth.map((r) => r.CanHoID);

  const pendingApts = await prisma.canho.findMany({
    where: {
      is_deleted: 0,
      TrangThai: "DaThue",
      ID: { notIn: recordedIds.length > 0 ? recordedIds : [-1] },
    },
    select: { ID: true, MaCanHo: true, Tang: true },
    take: 15,
  });

  if (!pendingApts.length) return `✅ Tất cả căn hộ đã được ghi chỉ số tháng ${thisMonth}.`;

  const lines = pendingApts.map((a) => `• **${a.MaCanHo}** | Tầng ${a.Tang}`);

  return `⚡ **Căn hộ chưa ghi chỉ số tháng ${thisMonth} (${pendingApts.length}):**\n${lines.join("\n")}\n\n👉 Ghi chỉ số: ${CLIENT_URL}/meter-reading`;
};
