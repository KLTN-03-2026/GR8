import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import { ROLES } from "../../constants/roles.js";

/**
 * ===============================
 * HELPER FUNCTIONS
 * ===============================
 */

const validateCanHoID = (canHoId) => {
  if (!canHoId || isNaN(Number(canHoId))) {
    const error = new Error("CanHoID không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
};

const parseThangNamToDate = (thangNam) => {
  const [month, year] = thangNam.split("-");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
};

const validateThangNam = (thangNam) => {
  const inputDate = parseThangNamToDate(thangNam);
  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (inputDate > nextMonthStart) {
    const error = new Error("Không được nhập chỉ số cho tháng tương lai");
    error.statusCode = 400;
    throw error;
  }
};

export const getPreviousChiSo = async (canHoId, thangNamDate, tx) => {
  const db = tx || prisma;
  const prevRecord = await db.chisodiennuoc.findFirst({
    where: {
      CanHoID: canHoId,
      thang_nam_date: {
        lt: thangNamDate,
      },
    },
    orderBy: {
      thang_nam_date: "desc",
    },
  });

  if (prevRecord) {
    return {
      ChiSoDienCu: prevRecord.ChiSoDienMoi,
      ChiSoNuocCu: prevRecord.ChiSoNuocMoi,
      isFirstMonth: false,
    };
  }

  const hopdong = await db.hopdong.findFirst({
    where: {
      CanHoID: canHoId,
      TrangThai: { in: ["DangThue", "DaKy"] },
    },
    orderBy: { NgayBatDau: "desc" },
  });

  return {
    ChiSoDienCu: new Prisma.Decimal(0),
    ChiSoNuocCu: new Prisma.Decimal(0),
    isFirstMonth: true,
  };
};

/**
 * ===============================
 * CORE LOGIC
 * ===============================
 */

export const createMeterReading = async (data, technicianId) => {
  const { CanHoID, ThangNam, ChiSoDienMoi, ChiSoNuocMoi, AnhDongHoDien, AnhDongHoNuoc } = data;

  validateCanHoID(CanHoID);
  validateThangNam(ThangNam);

  const numCanHoID = Number(CanHoID);
  const numDienMoi = Number(ChiSoDienMoi);
  const numNuocMoi = Number(ChiSoNuocMoi);
  const thangNamDate = parseThangNamToDate(ThangNam);

  const apartment = await prisma.canho.findFirst({
    where: { ID: numCanHoID, is_deleted: 0 },
  });

  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.chisodiennuoc.findFirst({
      where: {
        CanHoID: numCanHoID,
        ThangNam,
      },
    });

    if (existing) {
      throw Object.assign(
        new Error(`Chỉ số tháng ${ThangNam} đã được ghi cho căn hộ này`),
        { statusCode: 400 }
      );
    }

    const { ChiSoDienCu, ChiSoNuocCu } = await getPreviousChiSo(
      numCanHoID,
      thangNamDate,
      tx
    );

    if (numDienMoi < Number(ChiSoDienCu)) {
      throw Object.assign(new Error("Chỉ số điện mới < chỉ số cũ"), { statusCode: 400 });
    }

    if (numNuocMoi < Number(ChiSoNuocCu)) {
      throw Object.assign(new Error("Chỉ số nước mới < chỉ số cũ"), { statusCode: 400 });
    }

    return await tx.chisodiennuoc.create({
      data: {
        CanHoID: numCanHoID,
        ThangNam,
        ChiSoDienCu: ChiSoDienCu,
        ChiSoDienMoi: new Prisma.Decimal(ChiSoDienMoi),
        ChiSoNuocCu: ChiSoNuocCu,
        ChiSoNuocMoi: new Prisma.Decimal(ChiSoNuocMoi),
        AnhDongHoDien,
        AnhDongHoNuoc,
        NguoiGhiID: Number(technicianId),
        TrangThai: "ChoDuyetKeToan",
        NgayGhi: new Date(),
        thang_nam_date: thangNamDate,
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
  });
};

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
      orderBy: { thang_nam_date: "desc" },
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

export const updateMeterReading = async (id, data) => {
  const recordId = Number(id);
  const numDienMoi = data.ChiSoDienMoi !== undefined ? Number(data.ChiSoDienMoi) : undefined;
  const numNuocMoi = data.ChiSoNuocMoi !== undefined ? Number(data.ChiSoNuocMoi) : undefined;

  return await prisma.$transaction(async (tx) => {
    const record = await tx.chisodiennuoc.findUnique({
      where: { ID: recordId },
    });

    if (!record) {
      const error = new Error("Không tìm thấy bản ghi");
      error.statusCode = 404;
      throw error;
    }

    if (record.TrangThai !== "ChoDuyetKeToan") {
      const error = new Error("Không thể cập nhật chỉ số đã được kế toán xử lý");
      error.statusCode = 400;
      throw error;
    }

    const nextRecord = await tx.chisodiennuoc.findFirst({
      where: {
        CanHoID: record.CanHoID,
        thang_nam_date: { gt: record.thang_nam_date },
      },
    });

    if (nextRecord) {
      const error = new Error("Không thể cập nhật vì đã có dữ liệu của tháng sau");
      error.statusCode = 400;
      throw error;
    }

    const numDienCu = Number(record.ChiSoDienCu);
    const numNuocCu = Number(record.ChiSoNuocCu);

    if (numDienMoi !== undefined && numDienMoi < numDienCu) {
      const error = new Error("Chỉ số điện không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    if (numNuocMoi !== undefined && numNuocMoi < numNuocCu) {
      const error = new Error("Chỉ số nước không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const updateData = {};
    if (numDienMoi !== undefined) updateData.ChiSoDienMoi = new Prisma.Decimal(numDienMoi);
    if (numNuocMoi !== undefined) updateData.ChiSoNuocMoi = new Prisma.Decimal(numNuocMoi);
    if (data.AnhDongHoDien !== undefined) updateData.AnhDongHoDien = data.AnhDongHoDien;
    if (data.AnhDongHoNuoc !== undefined) updateData.AnhDongHoNuoc = data.AnhDongHoNuoc;

    return await tx.chisodiennuoc.update({
      where: { ID: recordId },
      data: updateData,
    });
  });
};

export const deleteMeterReading = async (id) => {
  const recordId = Number(id);

  return await prisma.$transaction(async (tx) => {
    const record = await tx.chisodiennuoc.findUnique({
      where: { ID: recordId },
    });

    if (!record) {
      const error = new Error("Không tìm thấy bản ghi");
      error.statusCode = 404;
      throw error;
    }

    if (record.TrangThai !== "ChoDuyetKeToan") {
      const error = new Error("Không thể xóa chỉ số đã được kế toán xử lý");
      error.statusCode = 400;
      throw error;
    }

    const nextRecord = await tx.chisodiennuoc.findFirst({
      where: {
        CanHoID: record.CanHoID,
        thang_nam_date: {
          gt: record.thang_nam_date,
        },
      },
    });

    if (nextRecord) {
      const error = new Error("Không thể xóa vì đã có tháng sau phụ thuộc");
      error.statusCode = 400;
      throw error;
    }

    await tx.chisodiennuoc.delete({
      where: { ID: recordId },
    });

    return { success: true };
  });
};

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
