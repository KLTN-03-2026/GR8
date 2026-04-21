// server/src/modules/chisodiennuoc/chisodiennuoc.service.js
// Meter reading service - 3-step workflow

import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import { ROLES } from "../../constants/roles.js";

/**
 * BƯỚC 1: Nhân viên kỹ thuật ghi chỉ số
 * Technical staff records meter readings with photos
 */
export const createMeterReading = async (data, technicianId) => {
  const { CanHoID, ThangNam, ChiSoDienMoi, ChiSoNuocMoi, AnhDongHoDien, AnhDongHoNuoc } = data;

  // Validate apartment exists
  const apartment = await prisma.canho.findFirst({
    where: { ID: Number(CanHoID), is_deleted: 0 },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }

  // Check if reading already exists for this month
  const existing = await prisma.chisodiennuoc.findFirst({
    where: {
      CanHoID: Number(CanHoID),
      ThangNam,
    },
  });

  if (existing) {
    throw Object.assign(
      new Error(`Chỉ số tháng ${ThangNam} đã được ghi cho căn hộ này`),
      { statusCode: 400 }
    );
  }

  // Get previous month's reading
  const previousReading = await prisma.chisodiennuoc.findFirst({
    where: { CanHoID: Number(CanHoID) },
    orderBy: { ThangNam: "desc" },
  });

  const reading = await prisma.chisodiennuoc.create({
    data: {
      CanHoID: Number(CanHoID),
      ThangNam,
      ChiSoDienCu: previousReading?.ChiSoDienMoi || new Prisma.Decimal(0),
      ChiSoDienMoi: new Prisma.Decimal(ChiSoDienMoi),
      ChiSoNuocCu: previousReading?.ChiSoNuocMoi || new Prisma.Decimal(0),
      ChiSoNuocMoi: new Prisma.Decimal(ChiSoNuocMoi),
      AnhDongHoDien,
      AnhDongHoNuoc,
      NguoiGhiID: Number(technicianId),
      TrangThai: "ChoDuyetKeToan",
      NgayGhi: new Date(),
    },
    include: {
      canho: {
        select: {
          MaCanHo: true,
          SoPhong: true,
        },
      },
      nguoidung: {
        select: {
          HoTen: true,
        },
      },
    },
  });

  return reading;
};

/**
 * BƯỚC 2: Kế toán xem danh sách chỉ số chờ duyệt
 * Accountant views pending meter readings
 */
export const getPendingMeterReadings = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {
    TrangThai: "ChoDuyetKeToan",
    ...(filters.ThangNam && { ThangNam: filters.ThangNam }),
    ...(filters.CanHoID && { CanHoID: Number(filters.CanHoID) }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.chisodiennuoc.findMany({
      where,
      skip,
      take: limit,
      include: {
        canho: {
          select: {
            ID: true,
            MaCanHo: true,
            SoPhong: true,
            Tang: true,
            hopdong: {
              where: {
                TrangThai: "DangThue",
                is_deleted: 0,
              },
              select: {
                ID: true,
                GiaThue: true,
                nguoidung: {
                  select: {
                    HoTen: true,
                    SoDienThoai: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
        nguoidung: {
          select: {
            HoTen: true,
          },
        },
      },
      orderBy: { NgayGhi: "desc" },
    }),
    prisma.chisodiennuoc.count({ where }),
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
 * BƯỚC 2: Kế toán xác nhận và phát hành hóa đơn
 * Accountant confirms readings and generates invoice
 */
export const confirmAndGenerateInvoice = async (readingId, data, accountantId) => {
  const { ChiSoDienChinhThuc, ChiSoNuocChinhThuc, GhiChuKeToan } = data;

  const reading = await prisma.chisodiennuoc.findUnique({
    where: { ID: Number(readingId) },
    include: {
      canho: {
        include: {
          hopdong: {
            where: {
              TrangThai: "DangThue",
              is_deleted: 0,
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!reading) {
    throw Object.assign(new Error("Không tìm thấy chỉ số"), { statusCode: 404 });
  }

  if (reading.TrangThai !== "ChoDuyetKeToan") {
    throw Object.assign(
      new Error("Chỉ số này đã được xử lý"),
      { statusCode: 400 }
    );
  }

  const activeContract = reading.canho.hopdong[0];
  if (!activeContract) {
    throw Object.assign(
      new Error("Căn hộ không có hợp đồng đang hoạt động"),
      { statusCode: 400 }
    );
  }

  // Import billing config
  const billingConfig = await import("../../config/billing.config.js");
  const config = billingConfig.default;

  // Calculate amounts
  const chiSoDienMoi = new Prisma.Decimal(ChiSoDienChinhThuc);
  const chiSoNuocMoi = new Prisma.Decimal(ChiSoNuocChinhThuc);
  const chiSoDienCu = reading.ChiSoDienCu;
  const chiSoNuocCu = reading.ChiSoNuocCu;

  const soDien = chiSoDienMoi.minus(chiSoDienCu);
  const soNuoc = chiSoNuocMoi.minus(chiSoNuocCu);

  const tienDien = soDien.times(config.ELECTRICITY_PRICE);
  const tienNuoc = soNuoc.times(config.WATER_PRICE);
  const tienThue = activeContract.GiaThue;
  const phiChung = new Prisma.Decimal(config.COMMON_FEE);
  const phiVeSinh = new Prisma.Decimal(config.CLEANING_FEE);

  const tongTien = tienThue
    .plus(tienDien)
    .plus(tienNuoc)
    .plus(phiChung)
    .plus(phiVeSinh);

  // Generate invoice code
  const maHoaDon = `HD${reading.ThangNam.replace("-", "")}${String(reading.CanHoID).padStart(3, "0")}`;

  // Calculate due date
  const ngayLap = new Date();
  const ngayDenHan = new Date(ngayLap);
  ngayDenHan.setDate(ngayDenHan.getDate() + config.PAYMENT_DUE_DAYS);

  // Generate VietQR content
  const noiDungCK = config.TRANSFER_CONTENT_TEMPLATE.replace("{maHoaDon}", maHoaDon);
  const qrContent = `${config.BANK_INFO.bankCode}|${config.BANK_INFO.accountNumber}|${tongTien}|${noiDungCK}`;

  // Transaction: Update reading + Create invoice
  const result = await prisma.$transaction(async (tx) => {
    // Update meter reading
    const updatedReading = await tx.chisodiennuoc.update({
      where: { ID: Number(readingId) },
      data: {
        ChiSoDienChinhThuc: chiSoDienMoi,
        ChiSoNuocChinhThuc: chiSoNuocMoi,
        TrangThai: "DaPhatHanhHoaDon",
        KeToanDuyetID: Number(accountantId),
        NgayKeToanDuyet: new Date(),
        GhiChuKeToan,
      },
    });

    // Create invoice
    const invoice = await tx.hoadon.create({
      data: {
        HopDongID: activeContract.ID,
        ThangNam: reading.ThangNam,
        MaHoaDon: maHoaDon,
        NgayLap: ngayLap,
        NgayDenHan: ngayDenHan,
        TongTien: tongTien,
        TrangThai: "ChuaTT",
        SoTaiKhoan: config.BANK_INFO.accountNumber,
        NganHangNhan: config.BANK_INFO.bankName,
        NoiDungCK: noiDungCK,
        QRContent: qrContent,
      },
    });

    // Create invoice details
    await tx.hoadonchitiet.createMany({
      data: [
        {
          HoaDonID: invoice.ID,
          Loai: "TienThue",
          SoTien: tienThue,
          MoTa: `Tiền thuê tháng ${reading.ThangNam}`,
        },
        {
          HoaDonID: invoice.ID,
          Loai: "Dien",
          SoTien: tienDien,
          MoTa: `Điện: ${soDien} kWh × ${config.ELECTRICITY_PRICE}đ`,
        },
        {
          HoaDonID: invoice.ID,
          Loai: "Nuoc",
          SoTien: tienNuoc,
          MoTa: `Nước: ${soNuoc} m³ × ${config.WATER_PRICE}đ`,
        },
        {
          HoaDonID: invoice.ID,
          Loai: "DichVu",
          SoTien: phiChung,
          MoTa: "Phí quản lý chung",
        },
        {
          HoaDonID: invoice.ID,
          Loai: "DichVu",
          SoTien: phiVeSinh,
          MoTa: "Phí vệ sinh",
        },
      ],
    });

    // TODO: Send notification to tenant
    // await sendInvoiceNotification(activeContract.NguoiThueID, invoice.ID);

    return { reading: updatedReading, invoice };
  });

  return result;
};

/**
 * Get meter reading by ID with photos
 */
export const getMeterReadingById = async (id) => {
  const reading = await prisma.chisodiennuoc.findUnique({
    where: { ID: Number(id) },
    include: {
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
        },
      },
    },
  });

  if (!reading) {
    throw Object.assign(new Error("Không tìm thấy chỉ số"), { statusCode: 404 });
  }

  return reading;
};

/**
 * Get all meter readings with filters
 */
export const getAllMeterReadings = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.CanHoID && { CanHoID: Number(filters.CanHoID) }),
    ...(filters.ThangNam && { ThangNam: filters.ThangNam }),
    ...(filters.TrangThai && { TrangThai: filters.TrangThai }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.chisodiennuoc.findMany({
      where,
      skip,
      take: limit,
      include: {
        canho: {
          select: {
            MaCanHo: true,
            SoPhong: true,
          },
        },
        nguoidung: {
          select: {
            HoTen: true,
          },
        },
      },
      orderBy: { NgayGhi: "desc" },
    }),
    prisma.chisodiennuoc.count({ where }),
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
