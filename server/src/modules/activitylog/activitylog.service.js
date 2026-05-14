// server/src/modules/activitylog/activitylog.service.js

import prisma from "../../config/prisma.js";

export const getLogs = async ({ page = 1, limit = 50, search, action, level, userId, from, to }) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(200, Math.max(1, parseInt(limit)));
  const skip = (p - 1) * l;

  const where = {};

  if (search) {
    where.OR = [
      { Action:      { contains: search } },
      { Description: { contains: search } },
      { EntityType:  { contains: search } },
      { nguoidung: { HoTen: { contains: search } } },
    ];
  }
  if (action)  where.Action = { contains: action };
  if (level)   where.level  = level;
  if (userId)  where.UserID = parseInt(userId);
  if (from || to) {
    where.CreatedAt = {};
    if (from) where.CreatedAt.gte = new Date(from);
    if (to)   where.CreatedAt.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }

  const [items, total] = await prisma.$transaction([
    prisma.systemlogs.findMany({
      where,
      skip,
      take: l,
      orderBy: { CreatedAt: "desc" },
      include: {
        nguoidung: { select: { ID: true, HoTen: true, TenDangNhap: true, roles: { select: { TenVaiTro: true } } } },
      },
    }),
    prisma.systemlogs.count({ where }),
  ]);

  return { items, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

export const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, todayCount, byLevel, topActions] = await Promise.all([
    prisma.systemlogs.count(),
    prisma.systemlogs.count({ where: { CreatedAt: { gte: today } } }),
    prisma.systemlogs.groupBy({ by: ["level"], _count: { ID: true } }),
    prisma.systemlogs.groupBy({
      by: ["Action"],
      _count: { ID: true },
      orderBy: { _count: { ID: "desc" } },
      take: 5,
    }),
  ]);

  return { total, todayCount, byLevel, topActions };
};

// Các action có thể hoàn tác và cách thực hiện
const UNDO_HANDLERS = {
  "Xóa tài sản": async (entityId) => {
    const item = await prisma.taisan.findFirst({ where: { ID: entityId } });
    if (!item) throw new Error("Không tìm thấy tài sản để khôi phục");
    if (item.is_deleted === 0) throw new Error("Tài sản này chưa bị xóa");
    await prisma.taisan.update({
      where: { ID: entityId },
      data: { is_deleted: 0, deleted_at: null },
    });
    return "Đã khôi phục tài sản";
  },

  "Xóa người dùng": async (entityId) => {
    const user = await prisma.nguoidung.findFirst({ where: { ID: entityId } });
    if (!user) throw new Error("Không tìm thấy người dùng để khôi phục");
    if (user.is_deleted === 0) throw new Error("Người dùng này chưa bị xóa");
    await prisma.nguoidung.update({
      where: { ID: entityId },
      data: { is_deleted: 0, deleted_at: null, TrangThai: "Active" },
    });
    return "Đã khôi phục người dùng";
  },

  "Kết thúc hợp đồng": async (entityId) => {
    const hd = await prisma.hopdong.findFirst({ where: { ID: entityId } });
    if (!hd) throw new Error("Không tìm thấy hợp đồng");
    if (hd.TrangThai !== "KetThuc") throw new Error("Hợp đồng không ở trạng thái Kết thúc");
    await prisma.$transaction([
      prisma.hopdong.update({
        where: { ID: entityId },
        data: { TrangThai: "DangThue" },
      }),
      prisma.canho.update({
        where: { ID: hd.CanHoID },
        data: { TrangThai: "DaThue" },
      }),
    ]);
    return "Đã hoàn tác kết thúc hợp đồng";
  },

  "Xóa tiện ích": async (entityId, snapshot) => {
    if (!snapshot) throw new Error("Không có dữ liệu để khôi phục tiện ích");
    // Kiểm tra đã tồn tại chưa (tránh duplicate unique TenTienIch)
    const existing = await prisma.tienich.findUnique({ where: { ID: entityId } });
    if (existing) throw new Error("Tiện ích này vẫn còn tồn tại, không cần khôi phục");
    const existingByName = await prisma.tienich.findUnique({ where: { TenTienIch: snapshot.TenTienIch } });
    if (existingByName) throw new Error(`Tiện ích "${snapshot.TenTienIch}" đã tồn tại`);
    await prisma.tienich.create({
      data: {
        TenTienIch: snapshot.TenTienIch,
        MoTa:       snapshot.MoTa || null,
      },
    });
    return `Đã khôi phục tiện ích "${snapshot.TenTienIch}"`;
  },

  "Xóa thẻ gửi xe": async (entityId) => {
    const the = await prisma.theguixe.findFirst({ where: { ID: entityId } });
    if (!the) throw new Error("Không tìm thấy thẻ gửi xe để khôi phục");
    if (the.is_deleted === 0) throw new Error("Thẻ gửi xe này chưa bị xóa");
    await prisma.theguixe.update({
      where: { ID: entityId },
      data: { is_deleted: 0 },
    });
    return "Đã khôi phục thẻ gửi xe";
  },
};

export const undoLog = async (logId, requesterId) => {
  const log = await prisma.systemlogs.findUnique({
    where: { ID: parseInt(logId) },
  });
  if (!log) throw Object.assign(new Error("Không tìm thấy bản ghi"), { statusCode: 404 });

  const handler = UNDO_HANDLERS[log.Action];
  if (!handler) {
    throw Object.assign(
      new Error(`Hành động "${log.Action}" không hỗ trợ hoàn tác`),
      { statusCode: 400 }
    );
  }

  if (!log.EntityID) {
    throw Object.assign(new Error("Không xác định được đối tượng cần hoàn tác"), { statusCode: 400 });
  }

  // Parse snapshot nếu có (dùng cho hard-delete như tienich)
  let snapshot = null;
  if (log.Description?.includes("||SNAPSHOT:")) {
    try {
      snapshot = JSON.parse(log.Description.split("||SNAPSHOT:")[1]);
    } catch { /* ignore */ }
  }

  const message = await handler(log.EntityID, snapshot);

  // Ghi log hoàn tác
  await prisma.systemlogs.create({
    data: {
      UserID:      requesterId,
      Action:      `Hoàn tác: ${log.Action}`,
      EntityType:  log.EntityType,
      EntityID:    log.EntityID,
      Description: `Hoàn tác log #${log.ID} — ${log.Description}`,
      level:       "WARN",
    },
  });

  // Đánh dấu log gốc đã được hoàn tác (dùng level để phân biệt)
  await prisma.systemlogs.update({
    where: { ID: log.ID },
    data: { level: "WARN" },
  });

  return message;
};

export const getUndoableActions = () => Object.keys(UNDO_HANDLERS);
