import prisma from "../../config/prisma.js";
import transporter from "../../config/mailer.js";

// Gửi email nhắc nợ
const sendDebtReminderEmail = async (toEmail, tenantName, canHoCode, totalDebt, overdueCount) => {
  if (!toEmail) return;
  try {
    const formattedDebt = new Intl.NumberFormat('vi-VN').format(totalDebt);
    await transporter.sendMail({
      from: `"SmartBuilding" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: `[SmartBuilding] Nhắc nhở thanh toán hóa đơn - Căn hộ ${canHoCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #dc2626; margin-bottom: 4px;">SmartBuilding</h2>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 24px;">Thông báo nhắc nhở thanh toán</p>

          <p style="color: #374151;">Kính gửi <strong>${tenantName || 'Quý cư dân'}</strong>,</p>
          <p style="color: #374151;">Chúng tôi xin thông báo căn hộ <strong>${canHoCode}</strong> hiện có khoản phí chưa thanh toán:</p>

          <div style="background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; color: #374151;">💰 Tổng số tiền còn nợ: <strong style="color: #dc2626; font-size: 18px;">${formattedDebt} VNĐ</strong></p>
            ${overdueCount > 0 ? `<p style="margin: 0; color: #b91c1c;">⚠️ Trong đó <strong>${overdueCount} hóa đơn đã quá hạn thanh toán</strong></p>` : ''}
          </div>

          <p style="color: #374151;">Vui lòng đăng nhập vào ứng dụng SmartBuilding để xem chi tiết và thực hiện thanh toán sớm nhất có thể.</p>
          <p style="color: #6b7280; font-size: 13px;">Nếu bạn đã thanh toán, vui lòng bỏ qua thông báo này.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 SmartBuilding. All rights reserved.</p>
        </div>
      `,
    });
  } catch (err) {
    console.warn("⚠️ Gửi email nhắc nợ thất bại:", err.message);
    // Không throw — lỗi email không nên làm hỏng toàn bộ request
  }
};

export const createNotification = async (data, senderId) => {
  const { TieuDe, NoiDung, Loai, NguoiNhanIDs, HinhAnh } = data;

  console.log("🔵 Service - Creating notification:", { TieuDe, Loai, senderId });

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create thongbao
    console.log("🔵 Creating thongbao record...");
    const thongbao = await tx.thongbao.create({
      data: {
        TieuDe,
        NoiDung,
        Loai,
        HinhAnh: HinhAnh && HinhAnh.length > 0 ? HinhAnh : undefined,
        NguoiGuiID: Number(senderId)
      }
    });
    console.log("✅ Thongbao created:", thongbao.ID);

    // 2. Determine receivers
    let receivers = [];
    if (Loai === "Chung") {
      console.log("🔵 Fetching all active users...");
      const users = await tx.nguoidung.findMany({
        where: { TrangThai: "Active", is_deleted: 0 },
        select: { ID: true }
      });
      receivers = users.map(u => u.ID);
      console.log(`✅ Found ${receivers.length} active users`);
    } else if (NguoiNhanIDs && NguoiNhanIDs.length > 0) {
      receivers = NguoiNhanIDs;
      console.log(`🔵 Using specific receivers: ${receivers.length} users`);
    }

    // 3. Create thongbao_nguoinhan records
    if (receivers.length > 0) {
      console.log("🔵 Creating recipient records...");
      const nguoinhanData = receivers.map(id => ({
        ThongBaoID: thongbao.ID,
        NguoiNhanID: Number(id),
        DaDoc: false
      }));
      await tx.thongbao_nguoinhan.createMany({ data: nguoinhanData });
      console.log(`✅ Created ${nguoinhanData.length} recipient records`);
    }

    return { thongbao, receivers };
  });

  // 4. Gửi email nếu là NhacNo — ngoài transaction để không block
  if (Loai === "NhacNo" && result.receivers.length > 0) {
    try {
      const users = await prisma.nguoidung.findMany({
        where: { ID: { in: result.receivers.map(Number) }, is_deleted: 0 },
        select: { ID: true, HoTen: true, Email: true }
      });
      for (const user of users) {
        if (user.Email) {
          // Lấy thông tin nợ từ NoiDung để truyền vào email
          await sendDebtReminderEmail(
            user.Email,
            user.HoTen,
            data.canHoCode || '',
            data.totalDebt || 0,
            data.overdueCount || 0
          );
        }
      }
    } catch (err) {
      console.warn("⚠️ Email sending error:", err.message);
    }
  }

  return result.thongbao;
};

export const updateNotification = async (notificationId, data) => {
  const { TieuDe, NoiDung, HinhAnh } = data;
  return await prisma.thongbao.update({
    where: { ID: Number(notificationId) },
    data: {
      TieuDe,
      NoiDung,
      ...(HinhAnh !== undefined && { HinhAnh })
    }
  });
};

export const deleteNotification = async (notificationId) => {
  return await prisma.$transaction([
    prisma.thongbao_nguoinhan.deleteMany({
      where: { ThongBaoID: Number(notificationId) }
    }),
    prisma.thongbao.delete({
      where: { ID: Number(notificationId) }
    })
  ]);
};

export const getUserNotifications = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.thongbao_nguoinhan.findMany({
      where: { NguoiNhanID: Number(userId) },
      skip,
      take: limit,
      include: {
        thongbao: {
          include: {
            nguoidung: { select: { HoTen: true } }
          }
        }
      },
      orderBy: {
        thongbao: {
          NgayGui: "desc"
        }
      }
    }),
    prisma.thongbao_nguoinhan.count({
      where: { NguoiNhanID: Number(userId) }
    })
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const markAsRead = async (notificationId, userId) => {
  return await prisma.thongbao_nguoinhan.updateMany({
    where: {
      ThongBaoID: Number(notificationId),
      NguoiNhanID: Number(userId)
    },
    data: {
      DaDoc: true
    }
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.thongbao_nguoinhan.updateMany({
    where: {
      NguoiNhanID: Number(userId),
      DaDoc: false
    },
    data: {
      DaDoc: true
    }
  });
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.thongbao_nguoinhan.count({
    where: {
      NguoiNhanID: Number(userId),
      DaDoc: false
    }
  });
  return { unreadCount: count };
};
export const sendInvoiceNotification = async (userId, invoiceId, amount, month) => {
  return await createNotification({
    TieuDe: "Hóa đơn mới được phát hành",
    NoiDung: `Hóa đơn tiền điện nước tháng ${month} của bạn đã được phát hành. Số tiền: ${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ. Vui lòng thanh toán trước ngày đến hạn.`,
    Loai: "NhacNo",
    NguoiNhanIDs: [Number(userId)]
  }, 1); // 1 is usually Admin/System ID
};
