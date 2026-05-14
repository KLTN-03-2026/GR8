// server/src/middleware/activitylog.middleware.js
// Tự động ghi systemlogs sau mỗi request write thành công

import prisma from "../config/prisma.js";

// Mỗi rule: match trên req.originalUrl (vd: /api/hopdong/terminate/30)
// Thứ tự quan trọng — rule cụ thể hơn phải đứng trước
const ACTION_MAP = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/auth\/login/,                  action: "Đăng nhập",                    entity: "auth" },
  { method: "POST",   re: /\/api\/auth\/logout/,                 action: "Đăng xuất",                    entity: "auth" },
  { method: "POST",   re: /\/api\/auth\/register/,               action: "Tạo tài khoản",                entity: "nguoidung" },

  // ── Người dùng ────────────────────────────────────────────────────────────
  { method: "PATCH",  re: /\/api\/users\/me/,                    action: "Cập nhật hồ sơ cá nhân",       entity: "nguoidung" },
  { method: "POST",   re: /\/api\/users\/me\/avatar/,            action: "Cập nhật ảnh đại diện",        entity: "nguoidung" },
  { method: "POST",   re: /\/api\/users\/me\/cccd/,              action: "Cập nhật ảnh CCCD",            entity: "nguoidung" },
  { method: "PATCH",  re: /\/api\/users\/\d+/,                   action: "Cập nhật người dùng",          entity: "nguoidung" },
  { method: "DELETE", re: /\/api\/users\/\d+/,                   action: "Xóa người dùng",               entity: "nguoidung" },

  // ── Tòa nhà ───────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/toanha\//,                     action: "Thêm tòa nhà",                 entity: "toanha" },
  { method: "PUT",    re: /\/api\/toanha\/\d+/,                  action: "Cập nhật tòa nhà",             entity: "toanha" },
  { method: "DELETE", re: /\/api\/toanha\/\d+/,                  action: "Xóa tòa nhà",                  entity: "toanha" },

  // ── Căn hộ ────────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/apartments\/bulk/,             action: "Tạo hàng loạt căn hộ",         entity: "canho" },
  { method: "DELETE", re: /\/api\/apartments\/\d+\/photo\/\d+/,  action: "Xóa ảnh căn hộ",               entity: "canho" },
  { method: "PATCH",  re: /\/api\/apartments\/\d+\/photo\/\d+/,  action: "Đặt ảnh nổi bật",              entity: "canho" },
  { method: "POST",   re: /\/api\/apartments\/\d+\/photo/,       action: "Tải ảnh căn hộ",               entity: "canho" },
  { method: "DELETE", re: /\/api\/apartments\/\d+\/photo/,       action: "Xóa tất cả ảnh căn hộ",        entity: "canho" },
  { method: "POST",   re: /\/api\/apartments\//,                 action: "Thêm căn hộ",                  entity: "canho" },
  { method: "PATCH",  re: /\/api\/apartments\/\d+/,              action: "Cập nhật căn hộ",              entity: "canho" },
  { method: "DELETE", re: /\/api\/apartments\/\d+/,              action: "Xóa căn hộ",                   entity: "canho" },

  // ── Tiện ích ──────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/tienich\/canho\/\d+/,          action: "Gán tiện ích căn hộ",          entity: "tienich" },
  { method: "DELETE", re: /\/api\/tienich\/canho\/\d+/,          action: "Gỡ tiện ích căn hộ",           entity: "tienich" },
  { method: "POST",   re: /\/api\/tienich\//,                    action: "Thêm tiện ích",                entity: "tienich" },
  { method: "PUT",    re: /\/api\/tienich\/\d+/,                 action: "Cập nhật tiện ích",            entity: "tienich" },
  { method: "DELETE", re: /\/api\/tienich\/\d+/,                 action: "Xóa tiện ích",                 entity: "tienich" },

  // ── Dịch vụ ───────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/dichvu\/yeucau/,               action: "Yêu cầu dịch vụ",              entity: "yeucaudichvu" },
  { method: "PUT",    re: /\/api\/dichvu\/yeucau\/\d+/,          action: "Duyệt yêu cầu dịch vụ",        entity: "yeucaudichvu" },
  { method: "DELETE", re: /\/api\/dichvu\/yeucau\/\d+/,          action: "Hủy yêu cầu dịch vụ",          entity: "yeucaudichvu" },
  { method: "POST",   re: /\/api\/dichvu\//,                     action: "Thêm dịch vụ",                 entity: "dichvu" },
  { method: "PUT",    re: /\/api\/dichvu\/\d+/,                  action: "Cập nhật dịch vụ",             entity: "dichvu" },
  { method: "DELETE", re: /\/api\/dichvu\/\d+/,                  action: "Xóa dịch vụ",                  entity: "dichvu" },

  // ── Yêu cầu thuê ──────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/yeucauthue\/create/,           action: "Gửi yêu cầu thuê",             entity: "yeucauthue" },
  { method: "PUT",    re: /\/api\/yeucauthue\/manager-approve/,  action: "Duyệt yêu cầu thuê",           entity: "yeucauthue" },
  { method: "PUT",    re: /\/api\/yeucauthue\/schedule/,         action: "Đặt lịch xem căn hộ",          entity: "yeucauthue" },
  { method: "PUT",    re: /\/api\/yeucauthue\/reject/,           action: "Từ chối yêu cầu thuê",         entity: "yeucauthue" },
  { method: "PUT",    re: /\/api\/yeucauthue\/cancel/,           action: "Hủy yêu cầu thuê",             entity: "yeucauthue" },

  // ── Hợp đồng ──────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/hopdong\/create/,              action: "Tạo hợp đồng",                 entity: "hopdong" },
  { method: "PUT",    re: /\/api\/hopdong\/sign\/\d+/,           action: "Ký hợp đồng",                  entity: "hopdong" },
  { method: "PUT",    re: /\/api\/hopdong\/terminate\/\d+/,      action: "Kết thúc hợp đồng",            entity: "hopdong" },

  // ── Hóa đơn ───────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/hoadon\/\d+\/mark-paid/,       action: "Xác nhận thanh toán hóa đơn",  entity: "hoadon" },
  { method: "POST",   re: /\/api\/hoadon/,                       action: "Tạo hóa đơn",                  entity: "hoadon" },
  { method: "PATCH",  re: /\/api\/hoadon\/\d+/,                  action: "Cập nhật hóa đơn",             entity: "hoadon" },
  { method: "DELETE", re: /\/api\/hoadon\/\d+/,                  action: "Xóa hóa đơn",                  entity: "hoadon" },

  // ── Chỉ số điện nước ──────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/chisodiennuoc/,                action: "Ghi chỉ số điện nước",         entity: "chisodiennuoc" },
  { method: "PATCH",  re: /\/api\/chisodiennuoc\/\d+/,           action: "Duyệt chỉ số điện nước",       entity: "chisodiennuoc" },

  // ── Tài sản ───────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/taisan\//,                     action: "Thêm tài sản",                 entity: "taisan" },
  { method: "PUT",    re: /\/api\/taisan\/\d+/,                  action: "Cập nhật tài sản",             entity: "taisan" },
  { method: "DELETE", re: /\/api\/taisan\/\d+/,                  action: "Xóa tài sản",                  entity: "taisan" },

  // ── Thành viên ────────────────────────────────────────────────────────────
  { method: "PATCH",  re: /\/api\/thanhvien\/\d+\/checkout/,     action: "Thành viên rời đi",            entity: "thanhvien" },
  { method: "POST",   re: /\/api\/thanhvien/,                    action: "Thêm thành viên căn hộ",       entity: "thanhvien" },
  { method: "PATCH",  re: /\/api\/thanhvien\/\d+/,               action: "Cập nhật thành viên",          entity: "thanhvien" },
  { method: "DELETE", re: /\/api\/thanhvien\/\d+/,               action: "Xóa thành viên",               entity: "thanhvien" },

  // ── Sự cố ─────────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/yeucausuco\/\d+\/assign/,      action: "Phân công xử lý sự cố",        entity: "yeucausuco" },
  { method: "POST",   re: /\/api\/yeucausuco\/\d+\/complete/,    action: "Hoàn thành sự cố",             entity: "yeucausuco" },
  { method: "POST",   re: /\/api\/yeucausuco\//,                 action: "Báo cáo sự cố",                entity: "yeucausuco" },
  { method: "PATCH",  re: /\/api\/yeucausuco\/\d+/,              action: "Cập nhật sự cố",               entity: "yeucausuco" },
  { method: "DELETE", re: /\/api\/yeucausuco\/\d+/,              action: "Xóa sự cố",                    entity: "yeucausuco" },

  // ── Chuyển nhượng ─────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/chuyennhuong/,                 action: "Yêu cầu chuyển nhượng",        entity: "chuyennhuong" },
  { method: "PUT",    re: /\/api\/chuyennhuong\/\d+/,            action: "Xử lý chuyển nhượng",          entity: "chuyennhuong" },

  // ── Thẻ gửi xe ────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/theguixe\//,                   action: "Thêm thẻ gửi xe",              entity: "theguixe" },
  { method: "PUT",    re: /\/api\/theguixe\/\d+/,                action: "Cập nhật thẻ gửi xe",          entity: "theguixe" },
  { method: "DELETE", re: /\/api\/theguixe\/\d+/,                action: "Xóa thẻ gửi xe",               entity: "theguixe" },

  // ── Thông báo ─────────────────────────────────────────────────────────────
  { method: "POST",   re: /\/api\/thongbao\//,                   action: "Gửi thông báo",                entity: "thongbao" },
];

const ENTITY_LABELS = {
  auth:           "Xác thực",
  nguoidung:      "Người dùng",
  toanha:         "Tòa nhà",
  canho:          "Căn hộ",
  tienich:        "Tiện ích",
  dichvu:         "Dịch vụ",
  yeucauthue:     "Yêu cầu thuê",
  hopdong:        "Hợp đồng",
  hoadon:         "Hóa đơn",
  chisodiennuoc:  "Chỉ số điện nước",
  taisan:         "Tài sản",
  thanhvien:      "Thành viên",
  yeucausuco:     "Sự cố",
  yeucaudichvu:   "Yêu cầu dịch vụ",
  chuyennhuong:   "Chuyển nhượng",
  theguixe:       "Thẻ gửi xe",
  thongbao:       "Thông báo",
};

// Trích tên hiển thị từ response body theo entity type
const extractName = (entity, data) => {
  if (!data) return null;
  switch (entity) {
    case "nguoidung":     return data.HoTen || data.TenDangNhap || null;
    case "canho":         return data.MaCanHo || null;
    case "toanha":        return data.TenToaNha || null;
    case "tienich":       return data.TenTienIch || null;
    case "dichvu":        return data.TenDichVu || null;
    case "taisan":        return data.TenTaiSan || data.MaTaiSan || null;
    case "hopdong":       return data.canho?.MaCanHo ? `Căn hộ ${data.canho.MaCanHo}` : null;
    case "hoadon":        return data.MaHoaDon || data.ThangNam || null;
    case "yeucauthue":    return data.canho?.MaCanHo ? `Căn hộ ${data.canho.MaCanHo}` : null;
    case "yeucausuco":    return data.TieuDe || null;
    case "yeucaudichvu":  return data.dichvu?.TenDichVu || null;
    case "thanhvien":     return data.HoTen || null;
    case "theguixe":      return data.MaThe || data.BienSoXe || null;
    case "chuyennhuong":  return null;
    case "chisodiennuoc": return data.ThangNam || null;
    case "thongbao":      return data.TieuDe || null;
    default:              return null;
  }
};

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const resolve = (method, originalUrl) => {
  const url = originalUrl.split("?")[0]; // bỏ query string
  for (const rule of ACTION_MAP) {
    if (rule.method === method && rule.re.test(url)) {
      return { action: rule.action, entity: rule.entity };
    }
  }
  const fallback = { POST: "Tạo mới", PUT: "Cập nhật", PATCH: "Cập nhật", DELETE: "Xóa" };
  return { action: fallback[method] || method, entity: null };
};

const extractId = (url) => {
  const m = url.match(/\/(\d+)/);
  return m ? parseInt(m[1]) : null;
};

export const activityLogger = (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  // Skip logging cho internal undo calls (từ activitylog service)
  if ((req.originalUrl || req.url).includes("/api/activitylog/")) return next();

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user?.ID) {
      const url = (req.originalUrl || req.url).split("?")[0];
      const { action, entity } = resolve(req.method, url);
      const entityLabel = entity ? (ENTITY_LABELS[entity] || entity) : null;

      // Lấy ID: ưu tiên từ URL, fallback từ response body (cho POST tạo mới)
      const idFromUrl  = extractId(url);
      const idFromBody = body?.data?.ID ?? body?.data?.id ?? null;
      const entityId   = idFromUrl ?? idFromBody;

      // Lấy tên hiển thị từ response body, fallback về "EntityLabel #ID"
      const nameFromBody = extractName(entity, body?.data);
      const description = entityLabel
        ? (nameFromBody || `${entityLabel}${entityId ? ` #${entityId}` : ""}`)
        : url;

      // Lưu snapshot data cho hard-delete (tienich) để hỗ trợ undo
      let snapshot = null;
      if (req.method === "DELETE" && entity === "tienich" && body?.data) {
        snapshot = JSON.stringify(body.data);
      }

      prisma.systemlogs.create({
        data: {
          UserID:      req.user.ID,
          Action:      action,
          EntityType:  entity,
          EntityID:    entityId,
          Description: snapshot ? `${description}||SNAPSHOT:${snapshot}` : description,
          IPAddress:   (req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim() || null,
          UserAgent:   req.headers["user-agent"]?.slice(0, 200) || null,
          level:       "INFO",
        },
      }).catch(() => {});
    }

    return originalJson(body);
  };

  next();
};
