// Tin nhan he thong service
// Chat trực tiếp giữa NguoiThue và QuanLy/NhanVien

import prisma from "../../config/prisma.js";

const ADMIN_ROLES = ["QuanLy", "NhanVienKyThuat", "KeToan"];

/**
 * Lấy danh sách tất cả cuộc hội thoại (dành cho Admin/QuanLy)
 * Group tin nhắn theo từng người thuê
 */
export const getConversations = async () => {
  // Lấy tất cả tin nhắn, group theo cặp người dùng
  // Mỗi "cuộc hội thoại" = tập hợp tin nhắn giữa 1 người thuê và hệ thống quản lý
  const messages = await prisma.tinnhanhethong.findMany({
    include: {
      nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung: {
        select: { ID: true, HoTen: true, Email: true, Avatar: true, roles: { select: { TenVaiTro: true } } }
      },
      nguoidung_tinnhanhethong_NguoiNhanIDTonguoidung: {
        select: { ID: true, HoTen: true, Email: true, Avatar: true, roles: { select: { TenVaiTro: true } } }
      }
    },
    orderBy: { ThoiGian: "desc" }
  });

  // Tìm tất cả người thuê đã từng nhắn tin
  const tenantMap = new Map();

  for (const msg of messages) {
    const sender = msg.nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung;
    const receiver = msg.nguoidung_tinnhanhethong_NguoiNhanIDTonguoidung;

    const senderRole = sender?.roles?.TenVaiTro;
    const receiverRole = receiver?.roles?.TenVaiTro;

    // Xác định người thuê trong cuộc hội thoại
    let tenant = null;
    if (!ADMIN_ROLES.includes(senderRole)) {
      tenant = sender;
    } else if (!ADMIN_ROLES.includes(receiverRole)) {
      tenant = receiver;
    }

    if (tenant && !tenantMap.has(tenant.ID)) {
      tenantMap.set(tenant.ID, {
        ID: tenant.ID,
        HoTen: tenant.HoTen,
        Email: tenant.Email,
        Avatar: tenant.Avatar,
        TinNhanCuoi: msg.NoiDung,
        ThoiGianCuoi: msg.ThoiGian,
        SoChuaDoc: 0,
        nguoidung: tenant
      });
    }
  }

  // Đếm tin nhắn chưa đọc từ người thuê (gửi đến admin)
  const unreadCounts = await prisma.tinnhanhethong.groupBy({
    by: ["NguoiGuiID"],
    where: { DaDoc: false },
    _count: { ID: true }
  });

  for (const item of unreadCounts) {
    if (tenantMap.has(item.NguoiGuiID)) {
      tenantMap.get(item.NguoiGuiID).SoChuaDoc = item._count.ID;
    }
  }

  return Array.from(tenantMap.values());
};

/**
 * Lấy cuộc hội thoại của người thuê hiện tại (dành cho NguoiThue)
 */
export const getMyConversation = async (userId) => {
  // Lấy tin nhắn mới nhất để trả về thông tin cuộc hội thoại
  const lastMsg = await prisma.tinnhanhethong.findFirst({
    where: {
      OR: [
        { NguoiGuiID: userId },
        { NguoiNhanID: userId }
      ]
    },
    orderBy: { ThoiGian: "desc" }
  });

  return {
    ID: userId, // dùng userId làm conversation ID cho người thuê
    TinNhanCuoi: lastMsg?.NoiDung || null,
    ThoiGianCuoi: lastMsg?.ThoiGian || null
  };
};

/**
 * Lấy tất cả tin nhắn trong một cuộc hội thoại
 * convId = ID của người thuê
 */
export const getMessages = async (convId, requesterId, requesterRole) => {
  const isAdmin = ADMIN_ROLES.includes(requesterRole);
  const tenantId = isAdmin ? Number(convId) : requesterId;

  // Đánh dấu đã đọc các tin nhắn từ người thuê (khi admin mở)
  if (isAdmin) {
    await prisma.tinnhanhethong.updateMany({
      where: {
        NguoiGuiID: tenantId,
        DaDoc: false
      },
      data: { DaDoc: true }
    });
  }

  const messages = await prisma.tinnhanhethong.findMany({
    where: {
      OR: [
        { NguoiGuiID: tenantId },
        { NguoiNhanID: tenantId }
      ]
    },
    include: {
      nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung: {
        select: { ID: true, HoTen: true, Avatar: true, roles: { select: { TenVaiTro: true } } }
      }
    },
    orderBy: { ThoiGian: "asc" }
  });

  return messages.map(msg => ({
    ID: msg.ID,
    NguoiGuiID: msg.NguoiGuiID,
    NguoiNhanID: msg.NguoiNhanID,
    NoiDung: msg.NoiDung,
    ThoiGian: msg.ThoiGian,
    DaDoc: msg.DaDoc,
    LoaiNguoiGui: ADMIN_ROLES.includes(
      msg.nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung?.roles?.TenVaiTro
    ) ? "Admin" : "NguoiThue",
    NguoiGui: msg.nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung
  }));
};

/**
 * Gửi tin nhắn
 * - Admin gửi: cần CuocHoiThoaiID (= tenantId)
 * - Người thuê gửi: tự động tìm admin để gửi
 */
export const sendMessage = async (senderId, senderRole, body) => {
  const { NoiDung, CuocHoiThoaiID } = body;

  if (!NoiDung?.trim()) {
    throw new Error("Nội dung tin nhắn không được để trống");
  }

  const isAdmin = ADMIN_ROLES.includes(senderRole);
  let receiverId;

  if (isAdmin) {
    // Admin gửi cho người thuê cụ thể
    if (!CuocHoiThoaiID) {
      throw new Error("Thiếu CuocHoiThoaiID khi admin gửi tin nhắn");
    }
    receiverId = Number(CuocHoiThoaiID);

    // Kiểm tra người nhận tồn tại
    const receiver = await prisma.nguoidung.findUnique({
      where: { ID: receiverId },
      select: { ID: true }
    });
    if (!receiver) {
      throw new Error("Người nhận không tồn tại");
    }
  } else {
    // Người thuê gửi cho admin — tìm QuanLy đầu tiên
    const admin = await prisma.nguoidung.findFirst({
      where: {
        roles: { TenVaiTro: "QuanLy" },
        TrangThai: "Active",
        is_deleted: 0
      },
      select: { ID: true }
    });

    if (!admin) {
      throw new Error("Không tìm thấy quản lý để gửi tin nhắn");
    }
    receiverId = admin.ID;
  }

  const message = await prisma.tinnhanhethong.create({
    data: {
      NguoiGuiID: senderId,
      NguoiNhanID: receiverId,
      NoiDung: NoiDung.trim(),
      DaDoc: false
    },
    include: {
      nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung: {
        select: { ID: true, HoTen: true, Avatar: true, roles: { select: { TenVaiTro: true } } }
      }
    }
  });

  return {
    ID: message.ID,
    NguoiGuiID: message.NguoiGuiID,
    NguoiNhanID: message.NguoiNhanID,
    NoiDung: message.NoiDung,
    ThoiGian: message.ThoiGian,
    DaDoc: message.DaDoc,
    LoaiNguoiGui: isAdmin ? "Admin" : "NguoiThue",
    NguoiGui: message.nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung
  };
};

/**
 * Đếm tin nhắn chưa đọc (dành cho badge notification)
 */
export const getUnreadCount = async (userId, userRole) => {
  const isAdmin = ADMIN_ROLES.includes(userRole);

  if (isAdmin) {
    // Admin: đếm tất cả tin nhắn chưa đọc từ người thuê
    const count = await prisma.tinnhanhethong.count({
      where: {
        DaDoc: false,
        nguoidung_tinnhanhethong_NguoiGuiIDTonguoidung: {
          roles: { TenVaiTro: { notIn: ADMIN_ROLES } }
        }
      }
    });
    return { unreadCount: count };
  } else {
    // Người thuê: đếm tin nhắn chưa đọc gửi đến mình
    const count = await prisma.tinnhanhethong.count({
      where: {
        NguoiNhanID: userId,
        DaDoc: false
      }
    });
    return { unreadCount: count };
  }
};
