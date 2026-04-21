// server/src/modules/hoadon/hoadon.service.js
// Invoice business logic

import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

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

  // Update invoice status
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    // Update invoice
    const updated = await tx.hoadon.update({
      where: { ID: Number(invoiceId) },
      data: {
        TrangThai: "DaTT",
      },
    });

    // Create payment record
    await tx.thanhtoan.create({
      data: {
        HoaDonID: Number(invoiceId),
        SoTien: invoice.TongTien,
        NgayThanhToan: new Date(),
        PhuongThuc: paymentData.PhuongThuc || "ChuyenKhoan",
        MaGiaoDich: paymentData.MaGiaoDich || null,
        NganHang: paymentData.NganHang || invoice.NganHangNhan,
        GhiChu: paymentData.GhiChu || "Người thuê xác nhận đã chuyển khoản",
      },
    });

    // TODO: Send notification to accountant for verification
    // await sendPaymentNotification(invoiceId);

    return updated;
  });

  return updatedInvoice;
};

/**
 * Get all invoices (for manager/accountant)
 */
export const getAllInvoices = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {
    is_deleted: 0,
    ...(filters.TrangThai && { TrangThai: filters.TrangThai }),
    ...(filters.ThangNam && { ThangNam: filters.ThangNam }),
    ...(filters.HopDongID && { HopDongID: Number(filters.HopDongID) }),
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
              },
            },
            nguoidung: {
              select: {
                HoTen: true,
                SoDienThoai: true,
              },
            },
          },
        },
        hoadonchitiet: true,
        thanhtoan: true,
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
 * Generate VietQR URL for invoice
 */
export const generateVietQRUrl = (invoice) => {
  const billingConfig = require("../../config/billing.config.js");
  const config = billingConfig.default || billingConfig;

  const bankCode = config.BANK_INFO.bankCode;
  const accountNumber = invoice.SoTaiKhoan || config.BANK_INFO.accountNumber;
  const amount = invoice.TongTien;
  const content = invoice.NoiDungCK;

  // VietQR format: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={CONTENT}
  const qrUrl = `${config.VIETQR_API}/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;

  return qrUrl;
};
