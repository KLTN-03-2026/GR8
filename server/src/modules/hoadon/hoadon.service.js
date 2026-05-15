// server/src/modules/hoadon/hoadon.service.js
// Invoice business logic

import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import billingConfig from "../../config/billing.config.js";

/**
 * BƯỚC 3: Người thuê xem hóa đơn của mình
 * Get tenant's invoices
 */
export const getTenantInvoices = async (tenantId, filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {
    is_deleted: 0,
    hopdong: {
      NguoiThueID: Number(tenantId),
      is_deleted: 0,
    },
    ...(filters.TrangThai && { TrangThai: filters.TrangThai }),
    ...(filters.ThangNam && { ThangNam: filters.ThangNam }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.hoadon.findMany({
      where,
      skip,
      take: limit,
      include: {
        hopdong: {
          select: {
            ID: true,
            CanHoID: true,
            canho: {
              select: {
                MaCanHo: true,
                SoPhong: true,
                Tang: true,
              },
            },
          },
        },
        hoadonchitiet: {
          select: {
            ID: true,
            Loai: true,
            SoTien: true,
            MoTa: true,
          },
        },
        thanhtoan: {
          select: {
            ID: true,
            SoTien: true,
            NgayThanhToan: true,
            PhuongThuc: true,
          },
        },
      },
      orderBy: { NgayLap: "desc" },
    }),
    prisma.hoadon.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * BƯỚC 3: Lấy chi tiết hóa đơn với QR code
 * Get invoice detail with VietQR info
 */
export const getInvoiceById = async (id, userId = null) => {
  const invoice = await prisma.hoadon.findFirst({
    where: {
      ID: Number(id),
      is_deleted: 0,
    },
    include: {
      hopdong: {
        select: {
          ID: true,
          NguoiThueID: true,
          CanHoID: true,
          canho: {
            select: {
              MaCanHo: true,
              SoPhong: true,
              Tang: true,
            },
          },
          nguoidung: {
            select: {
              HoTen: true,
              SoDienThoai: true,
              Email: true,
            },
          },
        },
      },
      hoadonchitiet: {
        select: {
          ID: true,
          Loai: true,
          SoTien: true,
          MoTa: true,
        },
        orderBy: {
          Loai: "asc",
        },
      },
      thanhtoan: {
        select: {
          ID: true,
          SoTien: true,
          NgayThanhToan: true,
          PhuongThuc: true,
          MaGiaoDich: true,
          GhiChu: true,
        },
      },
    },
  });

  if (!invoice) {
    throw Object.assign(new Error("Không tìm thấy hóa đơn"), { statusCode: 404 });
  }

  // If userId provided, check authorization
  if (userId && invoice.hopdong.NguoiThueID !== Number(userId)) {
    // Allow if user is manager/accountant (check in controller)
    // throw Object.assign(new Error("Bạn không có quyền xem hóa đơn này"), { statusCode: 403 });
  }

  return invoice;
};

/**
 * BƯỚC 3: Người thuê đánh dấu đã thanh toán
 * Tenant marks invoice as paid
 */
export const markAsPaid = async (invoiceId, tenantId, paymentData = {}) => {
  const invoice = await prisma.hoadon.findFirst({
    where: {
      ID: Number(invoiceId),
      is_deleted: 0,
    },
    include: {
      hopdong: {
        select: {
          NguoiThueID: true,
        },
      },
    },
  });

  if (!invoice) {
    throw Object.assign(new Error("Không tìm thấy hóa đơn"), { statusCode: 404 });
  }

  if (invoice.hopdong.NguoiThueID !== Number(tenantId)) {
    throw Object.assign(
      new Error("Bạn không có quyền thao tác hóa đơn này"),
      { statusCode: 403 }
    );
  }

  if (invoice.TrangThai === "DaTT") {
    throw Object.assign(
      new Error("Hóa đơn đã được thanh toán"),
      { statusCode: 400 }
    );
  }

  // Update invoice status to Pending Confirmation
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    const updated = await tx.hoadon.update({
      where: { ID: Number(invoiceId) },
      data: {
        TrangThai: "ChoXacNhan",
      },
    });

    // Create or update payment record
    // We check if there's already a pending payment record
    const existingPayment = await tx.thanhtoan.findFirst({
      where: { 
        HoaDonID: Number(invoiceId),
        XacNhanBoID: null 
      }
    });

    if (existingPayment) {
      const updateData = {
        SoTien: updated.TongTien,
        NgayThanhToan: new Date(),
        PhuongThuc: paymentData.PhuongThuc || existingPayment.PhuongThuc,
        MaGiaoDich: paymentData.MaGiaoDich || existingPayment.MaGiaoDich,
        GhiChu: paymentData.GhiChu || "Người thuê cập nhật thông tin thanh toán",
      };
      
      if (paymentData.AnhMinhChung) {
        updateData.AnhMinhChung = paymentData.AnhMinhChung;
      }

      await tx.thanhtoan.update({
        where: { ID: existingPayment.ID },
        data: updateData
      });
    } else {
      await tx.thanhtoan.create({
        data: {
          HoaDonID: Number(invoiceId),
          SoTien: updated.TongTien,
          NgayThanhToan: new Date(),
          PhuongThuc: paymentData.PhuongThuc || "ChuyenKhoan",
          MaGiaoDich: paymentData.MaGiaoDich || null,
          NganHang: paymentData.NganHang || updated.NganHangNhan,
          AnhMinhChung: paymentData.AnhMinhChung || null,
          GhiChu: paymentData.GhiChu || "Người thuê xác nhận đã chuyển khoản",
        },
      });
    }

    return updated;
  });

  return updatedInvoice;
};

/**
 * Get all invoices (for manager/accountant)
 */
export const getAllInvoices = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(filters.limit) || 200));
  const skip = (page - 1) * limit;
  const now = new Date();

  // Build where clause
  // Special case: TrangThai=QuaHan means ChuaTT + NgayDenHan < now
  let where = { is_deleted: 0 };

  if (filters.TrangThai === 'QuaHan') {
    where.TrangThai = 'ChuaTT';
    where.NgayDenHan = { lt: now };
  } else if (filters.TrangThai) {
    where.TrangThai = filters.TrangThai;
  }

  if (filters.ThangNam) where.ThangNam = filters.ThangNam;
  if (filters.HopDongID) where.HopDongID = Number(filters.HopDongID);

  const [items, total] = await prisma.$transaction([
    prisma.hoadon.findMany({
      where,
      skip,
      take: limit,
      include: {
        hopdong: {
          select: {
            ID: true,
            NguoiThueID: true,
            CanHoID: true,
            canho: {
              select: {
                ID: true,
                MaCanHo: true,
                SoPhong: true,
                Tang: true,
              },
            },
            nguoidung: {
              select: {
                ID: true,
                HoTen: true,
                SoDienThoai: true,
                Email: true,
              },
            },
          },
        },
        hoadonchitiet: true,
        thanhtoan: true,
      },
      orderBy: [
        { NgayDenHan: "asc" },  // quá hạn lâu nhất lên đầu
        { NgayLap: "desc" },
      ],
    }),
    prisma.hoadon.count({ where }),
  ]);

  // Annotate each invoice with computed isOverdue flag
  const annotated = items.map(inv => ({
    ...inv,
    isOverdue: inv.TrangThai !== 'DaTT' && new Date(inv.NgayDenHan) < now,
  }));

  return {
    items: annotated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get overdue invoices grouped by apartment (for debt management)
 */
export const getOverdueGrouped = async () => {
  const now = new Date();

  const items = await prisma.hoadon.findMany({
    where: {
      is_deleted: 0,
      TrangThai: 'ChuaTT',
    },
    include: {
      hopdong: {
        select: {
          ID: true,
          NguoiThueID: true,
          CanHoID: true,
          canho: {
            select: {
              ID: true,
              MaCanHo: true,
              SoPhong: true,
              Tang: true,
            },
          },
          nguoidung: {
            select: {
              ID: true,
              HoTen: true,
              SoDienThoai: true,
              Email: true,
            },
          },
        },
      },
    },
    orderBy: { NgayDenHan: 'asc' },
  });

  // Group by apartment
  const grouped = {};
  for (const inv of items) {
    const canHoID = inv.hopdong?.canho?.ID;
    if (!canHoID) continue;

    if (!grouped[canHoID]) {
      grouped[canHoID] = {
        canHoID,
        maCanHo: inv.hopdong.canho.MaCanHo,
        soPhong: inv.hopdong.canho.SoPhong,
        tang: inv.hopdong.canho.Tang,
        chuHo: inv.hopdong.nguoidung?.HoTen,
        email: inv.hopdong.nguoidung?.Email,
        sdt: inv.hopdong.nguoidung?.SoDienThoai,
        nguoiDungID: inv.hopdong.NguoiThueID,
        invoices: [],
        totalDebt: 0,
        overdueCount: 0,
        unpaidCount: 0,
        oldestDueDate: null,
      };
    }

    const isOverdue = new Date(inv.NgayDenHan) < now;
    grouped[canHoID].invoices.push({ ...inv, isOverdue });
    grouped[canHoID].totalDebt += parseFloat(inv.TongTien || 0);
    grouped[canHoID].unpaidCount++;
    if (isOverdue) grouped[canHoID].overdueCount++;

    // Track oldest due date
    if (!grouped[canHoID].oldestDueDate || new Date(inv.NgayDenHan) < new Date(grouped[canHoID].oldestDueDate)) {
      grouped[canHoID].oldestDueDate = inv.NgayDenHan;
    }
  }

  // Sort: most overdue first, then by total debt
  return Object.values(grouped).sort((a, b) => {
    if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
    return b.totalDebt - a.totalDebt;
  });
};

/**
 * Generate VietQR URL for invoice
 */
export const generateVietQRUrl = (invoice) => {
  const config = billingConfig;
  // Bank code from config
  const bankCode = config.BANK_INFO.bankCode;
  // Use the account number stored on the invoice if present,
  // otherwise fall back to the default from config.
  const accountNumber = invoice.SoTaiKhoan || config.BANK_INFO.accountNumber;
  // Amount to be paid
  const amount = invoice.TongTien;
  // Description – fall back to a generic ID if not provided
  const content = invoice.NoiDungCK || `HD${invoice.MaHoaDon}`;
  // Build the VietQR image URL
  const qrUrl = `${config.VIETQR_API}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
  return qrUrl;
};

/**
 * Accountant confirms payment (manual)
 */
export const confirmPaymentByAccountant = async (invoiceId, accountantId, data = {}) => {
  const invoice = await prisma.hoadon.findUnique({
    where: { ID: Number(invoiceId) },
  });

  if (!invoice) {
    throw Object.assign(new Error("Không tìm thấy hóa đơn"), { statusCode: 404 });
  }

  if (invoice.TrangThai === "DaTT") {
    throw Object.assign(new Error("Hóa đơn đã được thanh toán"), { statusCode: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Cập nhật trạng thái hóa đơn
    const updated = await tx.hoadon.update({
      where: { ID: Number(invoiceId) },
      data: { TrangThai: "DaTT" },
    });

    // 2. Cập nhật hoặc Tạo bản ghi thanh toán
    const existingPayment = await tx.thanhtoan.findFirst({
      where: { 
        HoaDonID: Number(invoiceId),
        XacNhanBoID: null 
      }
    });

    if (existingPayment) {
      await tx.thanhtoan.update({
        where: { ID: existingPayment.ID },
        data: {
          XacNhanBoID: Number(accountantId),
          PhuongThuc: data.PhuongThuc || existingPayment.PhuongThuc,
          GhiChu: data.GhiChu || `${existingPayment.GhiChu} (Kế toán đã duyệt)`,
        }
      });
    } else {
      await tx.thanhtoan.create({
        data: {
          HoaDonID: Number(invoiceId),
          SoTien: updated.TongTien,
          NgayThanhToan: new Date(),
          PhuongThuc: data.PhuongThuc || "TienMat",
          XacNhanBoID: Number(accountantId),
          GhiChu: data.GhiChu || `Kế toán xác nhận thanh toán (${data.PhuongThuc || "Tiền mặt"})`,
        },
      });
    }

    return updated;
  });
};
