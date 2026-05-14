// server/src/modules/thanhtoan/thanhtoan.service.js
// Payment (Thanh toán) business logic

import prisma from "../../config/prisma.js";

/**
 * Get all payments (for accountant/manager)
 */
export const getAllPayments = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.HoaDonID && { HoaDonID: Number(filters.HoaDonID) }),
    ...(filters.PhuongThuc && { PhuongThuc: filters.PhuongThuc }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.thanhtoan.findMany({
      where,
      skip,
      take: limit,
      include: {
        hoadon: {
          select: {
            ID: true,
            MaHoaDon: true,
            ThangNam: true,
            TongTien: true,
            TrangThai: true,
            hopdong: {
              select: {
                canho: { select: { MaCanHo: true, SoPhong: true } },
                nguoidung: { select: { HoTen: true, SoDienThoai: true } },
              },
            },
          },
        },
        nguoidung: {
          select: { ID: true, HoTen: true },
        },
      },
      orderBy: { NgayThanhToan: "desc" },
    }),
    prisma.thanhtoan.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get payments for a specific invoice
 */
export const getPaymentsByInvoice = async (invoiceId) => {
  return prisma.thanhtoan.findMany({
    where: { HoaDonID: Number(invoiceId) },
    orderBy: { NgayThanhToan: "desc" },
  });
};

/**
 * Accountant confirms/verifies a payment
 */
export const confirmPayment = async (paymentId, accountantId, data = {}) => {
  const payment = await prisma.thanhtoan.findUnique({
    where: { ID: Number(paymentId) },
    include: { hoadon: true },
  });

  if (!payment) {
    throw Object.assign(new Error("Không tìm thấy giao dịch"), { statusCode: 404 });
  }

  return prisma.$transaction(async (tx) => {
    // Mark payment as verified
    const updated = await tx.thanhtoan.update({
      where: { ID: Number(paymentId) },
      data: {
        XacNhanBoID: Number(accountantId),
        GhiChu: data.GhiChu || payment.GhiChu,
      },
    });

    // Mark the invoice as paid
    await tx.hoadon.update({
      where: { ID: payment.HoaDonID },
      data: { TrangThai: "DaTT" },
    });

    return updated;
  });
};

/**
 * Create a manual payment record (accountant records cash payment)
 */
export const createManualPayment = async (invoiceId, accountantId, data = {}) => {
  const invoice = await prisma.hoadon.findFirst({
    where: { ID: Number(invoiceId), is_deleted: 0 },
  });

  if (!invoice) {
    throw Object.assign(new Error("Không tìm thấy hóa đơn"), { statusCode: 404 });
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.thanhtoan.create({
      data: {
        HoaDonID: Number(invoiceId),
        SoTien: data.SoTien || invoice.TongTien,
        NgayThanhToan: data.NgayThanhToan ? new Date(data.NgayThanhToan) : new Date(),
        PhuongThuc: data.PhuongThuc || "TienMat",
        MaGiaoDich: data.MaGiaoDich || null,
        NganHang: data.NganHang || null,
        GhiChu: data.GhiChu || "Kế toán ghi nhận thanh toán",
        XacNhanBoID: Number(accountantId),
      },
    });

    await tx.hoadon.update({
      where: { ID: Number(invoiceId) },
      data: { TrangThai: "DaTT" },
    });

    return payment;
  });
};
