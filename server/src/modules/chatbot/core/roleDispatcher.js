/**
 * Role Dispatcher
 * Nhận role + intents → gọi đúng agent → trả về context string
 * Đây là trái tim của hệ thống role-based chatbot
 */
import { ROLES } from "../../../constants/roles.js";
import * as residentAgent from "../agents/residentAgent.js";
import * as managerAgent from "../agents/managerAgent.js";
import * as accountingAgent from "../agents/accountingAgent.js";
import * as technicalAgent from "../agents/technicalAgent.js";
import * as guestAgent from "../agents/guestAgent.js";

// Intent chung — mọi role đều có thể hỏi
const COMMON_INTENTS = {
  billing_info: () => guestAgent.getBillingInfo(),
  policies:     () => guestAgent.getPolicies(),
  contact:      () => guestAgent.getContactInfo(),
  renting_guide:() => guestAgent.getRentingGuide(),
  amenities:    () => guestAgent.getPublicInfo(),
  services:     () => guestAgent.getPublicInfo(),
};

/**
 * Dispatch context queries theo role và intents
 * @param {string} role - VaiTro của user
 * @param {string[]} intents - Danh sách intent từ classifier
 * @param {string} message - Tin nhắn gốc
 * @param {number} userId - ID user
 * @returns {Promise<string>} - Context string để inject vào AI prompt
 */
export const dispatchContext = async (role, intents, message, userId) => {
  const contextParts = [];

  const addContext = async (fn, ...args) => {
    try {
      const result = await fn(...args);
      if (result) contextParts.push(result);
    } catch (e) {
      console.error(`[RoleDispatcher] Error in ${fn.name}:`, e.message);
    }
  };

  // ── Common intents — mọi role đều trả lời được ───────────────────────────
  for (const intent of intents) {
    if (COMMON_INTENTS[intent]) {
      await addContext(COMMON_INTENTS[intent]);
    }
  }

  // Nếu đã có context từ common intents và không có intent role-specific → trả về luôn
  const roleSpecificIntents = intents.filter(i => !COMMON_INTENTS[i]);
  if (roleSpecificIntents.length === 0 && contextParts.length > 0) {
    return contextParts.join("\n\n");
  }

  // ── KHACH_VANG_LAI — chỉ thông tin công khai ─────────────────────────────
  if (!role || role === ROLES.KHACH_VANG_LAI) {
    for (const intent of roleSpecificIntents) {
      switch (intent) {
        case "apartments":      await addContext(guestAgent.getAvailableApartments, message); break;
        default:                if (contextParts.length === 0) await addContext(guestAgent.getPublicInfo); break;
      }
    }
    if (intents.includes("general") && contextParts.length === 0) await addContext(guestAgent.getPublicInfo);
    return contextParts.join("\n\n");
  }

  // ── NGUOI_THUE — dữ liệu cá nhân ─────────────────────────────────────────
  if (role === ROLES.NGUOI_THUE) {
    for (const intent of roleSpecificIntents) {
      switch (intent) {
        case "invoices":        await addContext(residentAgent.getMyInvoices, userId); break;
        case "payment_guide":   await addContext(residentAgent.getPaymentGuide, userId); break;
        case "contracts":       await addContext(residentAgent.getMyContracts, userId); break;
        case "incidents":
        case "assigned_incidents": await addContext(residentAgent.getMyIncidents, userId); break;
        case "meter_readings":  await addContext(residentAgent.getMyMeterReadings, userId); break;
        case "apartments":      await addContext(residentAgent.getAvailableApartments, message); break;
        default: break;
      }
    }
    return contextParts.join("\n\n");
  }

  // ── KE_TOAN — tài chính, hóa đơn, chỉ số ────────────────────────────────
  if (role === ROLES.KE_TOAN) {
    for (const intent of roleSpecificIntents) {
      switch (intent) {
        case "financial_overview":
        case "overview":        await addContext(accountingAgent.getFinancialOverview); break;
        case "overdue":
        case "invoices":        await addContext(accountingAgent.getOverdueInvoices); break;
        case "pending_readings":
        case "meter_work":      await addContext(accountingAgent.getPendingMeterReadings); break;
        case "monthly_stats":
        case "revenue":         await addContext(accountingAgent.getMonthlyStats, message); break;
        default:                if (contextParts.length === 0) await addContext(accountingAgent.getFinancialOverview); break;
      }
    }
    return contextParts.join("\n\n");
  }

  // ── NHAN_VIEN_KY_THUAT — sự cố, lịch trực, chỉ số ───────────────────────
  if (role === ROLES.NHAN_VIEN_KY_THUAT) {
    for (const intent of roleSpecificIntents) {
      switch (intent) {
        case "assigned_incidents":
        case "incidents":       await addContext(technicalAgent.getAssignedIncidents, userId); break;
        case "new_incidents":   await addContext(technicalAgent.getNewIncidents); break;
        case "schedule":        await addContext(technicalAgent.getMySchedule, userId); break;
        case "meter_work":
        case "meter_readings":  await addContext(technicalAgent.getPendingMeterWork); break;
        default:                if (contextParts.length === 0) await addContext(technicalAgent.getAssignedIncidents, userId); break;
      }
    }
    return contextParts.join("\n\n");
  }

  // ── QUAN_LY / CHU_NHA — toàn hệ thống ───────────────────────────────────
  if (role === ROLES.QUAN_LY || role === ROLES.CHU_NHA) {
    for (const intent of roleSpecificIntents) {
      switch (intent) {
        case "overview":        await addContext(managerAgent.getSystemOverview); break;
        case "invoices":
        case "overdue":
        case "payment_guide":   await addContext(managerAgent.getUnpaidInvoices); break;
        case "incidents":
        case "new_incidents":   await addContext(managerAgent.getOpenIncidents); break;
        case "tenants":         await addContext(managerAgent.getTenantList); break;
        case "revenue":
        case "monthly_stats":   await addContext(managerAgent.getRevenueStats); break;
        case "rent_requests":   await addContext(managerAgent.getPendingRentRequests); break;
        case "apartments":      await addContext(residentAgent.getAvailableApartments, message); break;
        default:                if (contextParts.length === 0) await addContext(managerAgent.getSystemOverview); break;
      }
    }
    return contextParts.join("\n\n");
  }

  return contextParts.join("\n\n");
};

/**
 * Tạo system prompt theo role
 * @param {string} role
 * @returns {string}
 */
export const buildRoleSystemPrompt = (role) => {
  const roleDescriptions = {
    [ROLES.NGUOI_THUE]:         "cư dân đang thuê căn hộ",
    [ROLES.KE_TOAN]:            "kế toán viên quản lý tài chính",
    [ROLES.NHAN_VIEN_KY_THUAT]: "nhân viên kỹ thuật xử lý sự cố",
    [ROLES.QUAN_LY]:            "quản lý hệ thống",
    [ROLES.CHU_NHA]:            "chủ nhà quản lý căn hộ",
    [ROLES.KHACH_VANG_LAI]:     "khách vãng lai tìm hiểu thông tin",
  };

  const roleDesc = roleDescriptions[role] || "người dùng";

  return `Bạn là trợ lý AI của hệ thống quản lý căn hộ SmartBuilding.
Bạn đang hỗ trợ một **${roleDesc}**.

NGUYÊN TẮC BẮT BUỘC:
- Chỉ trả lời dựa trên dữ liệu thực tế được cung cấp trong [DỮ LIỆU HỆ THỐNG]
- Hiển thị thông tin trực tiếp trong câu trả lời, KHÔNG chỉ gửi link
- Link chỉ dùng để bổ sung ("xem thêm tại..."), không thay thế nội dung
- Trả lời ngắn gọn, thân thiện, chuyên nghiệp bằng tiếng Việt
- Nếu không có dữ liệu liên quan, hướng dẫn người dùng đến đúng mục trong hệ thống
- KHÔNG bịa đặt số liệu, tên người, hay thông tin không có trong context
- Định dạng rõ ràng: dùng **in đậm** cho tiêu đề, danh sách gạch đầu dòng cho nhiều mục`;
};
