import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import billingConfig from "../../config/billing.config.js";
import * as thongbaoService from "../thongbao/thongbao.service.js";


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
  // Format: YYYY-MM (từ HTML input type="month")
  const [year, month] = thangNam.split("-");
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

/**
 * Tính tiền điện theo bậc thang EVN
 */
export const tinhTienDienBacThang = (soKwh) => {
  let remaining = Number(soKwh);
  let total = 0;
  for (const tier of billingConfig.ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    // capacity = số kWh trong bậc này (to - from), Infinity cho bậc cuối
    const capacity = tier.to === Infinity ? remaining : (tier.to - tier.from);
    const inTier = Math.min(remaining, capacity);
    total += inTier * tier.price;
    remaining -= inTier;
  }
  return Math.round(total);
};

/**
 * Lấy ngày tính tiền của căn hộ (fallback về config mặc định)
 */
export const getBillingDays = (canho) => ({
  ngayDien:    canho.NgayTinhDien    ?? billingConfig.DEFAULT_NGAY_TINH_DIEN,
  ngayNuoc:    canho.NgayTinhNuoc    ?? billingConfig.DEFAULT_NGAY_TINH_NUOC,
  ngayTienNha: canho.NgayTinhTienNha ?? billingConfig.DEFAULT_NGAY_TINH_TIEN_NHA,
});

export const getPreviousChiSo = async (canHoId, thangNamDate, tx) => {
  const db = tx || prisma;

  // Tính ThangNam string (YYYY-MM) từ thangNamDate để so sánh chính xác, tránh lỗi timezone
  const year = thangNamDate.getFullYear();
  const month = String(thangNamDate.getMonth() + 1).padStart(2, "0");
  const currentThangNam = `${year}-${month}`;

  // Lấy tất cả bản ghi các tháng trước (so sánh string YYYY-MM)
  const prevRecords = await db.chisodiennuoc.findMany({
    where: {
      CanHoID: canHoId,
      ThangNam: { lt: currentThangNam },
    },
    orderBy: { ThangNam: "asc" },
  });

  if (prevRecords.length === 0) {
    return {
      ChiSoDienCu: new Prisma.Decimal(0),
      ChiSoNuocCu: new Prisma.Decimal(0),
      isFirstMonth: true,
    };
  }

  // Cộng dồn: tổng ChiSoDienMoi (ưu tiên ChiSoDienChinhThuc nếu kế toán đã xác nhận)
  let totalDien = new Prisma.Decimal(0);
  let totalNuoc = new Prisma.Decimal(0);

  for (const r of prevRecords) {
    const dienVal = r.ChiSoDienChinhThuc ?? r.ChiSoDienMoi;
    const nuocVal = r.ChiSoNuocChinhThuc ?? r.ChiSoNuocMoi;
    if (dienVal !== null && dienVal !== undefined)
      totalDien = totalDien.plus(new Prisma.Decimal(dienVal));
    if (nuocVal !== null && nuocVal !== undefined)
      totalNuoc = totalNuoc.plus(new Prisma.Decimal(nuocVal));
  }

  return {
    ChiSoDienCu: totalDien,
    ChiSoNuocCu: totalNuoc,
    isFirstMonth: false,
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
  const thangNamDate = parseThangNamToDate(ThangNam);
  const ghiDien = ChiSoDienMoi !== undefined && ChiSoDienMoi !== null;
  const ghiNuoc = ChiSoNuocMoi !== undefined && ChiSoNuocMoi !== null;

  const apartment = await prisma.canho.findFirst({
    where: { ID: numCanHoID, is_deleted: 0 },
  });
  if (!apartment) {
    throw Object.assign(new Error("Không tìm thấy căn hộ"), { statusCode: 404 });
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.chisodiennuoc.findFirst({
      where: { CanHoID: numCanHoID, ThangNam },
    });

    const { ChiSoDienCu, ChiSoNuocCu } = await getPreviousChiSo(numCanHoID, thangNamDate, tx);

    if (existing) {
      // Bản ghi tháng này đã có — bổ sung loại còn thiếu
      if (ghiDien && existing.ChiSoDienMoi !== null) {
        throw Object.assign(new Error(`Chỉ số điện tháng ${ThangNam} đã được ghi`), { statusCode: 400 });
      }
      if (ghiNuoc && existing.ChiSoNuocMoi !== null) {
        throw Object.assign(new Error(`Chỉ số nước tháng ${ThangNam} đã được ghi`), { statusCode: 400 });
      }
      if (ghiDien && Number(ChiSoDienMoi) < Number(ChiSoDienCu)) {
        throw Object.assign(new Error("Chỉ số điện mới < chỉ số cũ"), { statusCode: 400 });
      }
      if (ghiNuoc && Number(ChiSoNuocMoi) < Number(ChiSoNuocCu)) {
        throw Object.assign(new Error("Chỉ số nước mới < chỉ số cũ"), { statusCode: 400 });
      }

      const updateData = {};
      if (ghiDien) {
        updateData.ChiSoDienMoi = new Prisma.Decimal(ChiSoDienMoi);
        updateData.NgayGhiDien  = new Date();
        if (AnhDongHoDien) updateData.AnhDongHoDien = AnhDongHoDien;
      }
      if (ghiNuoc) {
        updateData.ChiSoNuocMoi = new Prisma.Decimal(ChiSoNuocMoi);
        updateData.NgayGhiNuoc  = new Date();
        if (AnhDongHoNuoc) updateData.AnhDongHoNuoc = AnhDongHoNuoc;
      }

      // Nếu sau khi update cả 2 đều có → chuyển sang ChoDuyetKeToan
      const dienSau = ghiDien ? true : existing.ChiSoDienMoi !== null;
      const nuocSau = ghiNuoc ? true : existing.ChiSoNuocMoi !== null;
      if (dienSau && nuocSau && existing.TrangThai === 'ChoDienHoacNuoc') {
        updateData.TrangThai = 'ChoDuyetKeToan';
        updateData.NgayGhi   = new Date();
      }

      return await tx.chisodiennuoc.update({
        where: { ID: existing.ID },
        data: updateData,
        include: {
          canho: { select: { MaCanHo: true, SoPhong: true } },
          nguoidung: { select: { HoTen: true } },
        },
      });
    }

    // Bản ghi chưa có — tạo mới
    if (ghiDien && Number(ChiSoDienMoi) < Number(ChiSoDienCu)) {
      throw Object.assign(new Error("Chỉ số điện mới < chỉ số cũ"), { statusCode: 400 });
    }
    if (ghiNuoc && Number(ChiSoNuocMoi) < Number(ChiSoNuocCu)) {
      throw Object.assign(new Error("Chỉ số nước mới < chỉ số cũ"), { statusCode: 400 });
    }

    // Nếu chỉ ghi 1 loại → trạng thái chờ loại còn lại
    const trangThai = (ghiDien && ghiNuoc) ? 'ChoDuyetKeToan' : 'ChoDienHoacNuoc';

    return await tx.chisodiennuoc.create({
      data: {
        CanHoID: numCanHoID,
        ThangNam,
        ChiSoDienCu,
        ChiSoDienMoi: ghiDien ? new Prisma.Decimal(ChiSoDienMoi) : null,
        NgayGhiDien:  ghiDien ? new Date() : null,
        ChiSoNuocCu,
        ChiSoNuocMoi: ghiNuoc ? new Prisma.Decimal(ChiSoNuocMoi) : null,
        NgayGhiNuoc:  ghiNuoc ? new Date() : null,
        AnhDongHoDien: ghiDien ? AnhDongHoDien : null,
        AnhDongHoNuoc: ghiNuoc ? AnhDongHoNuoc : null,
        NguoiGhiID: Number(technicianId),
        TrangThai: trangThai,
        NgayGhi: (ghiDien && ghiNuoc) ? new Date() : null,
        thang_nam_date: thangNamDate,
      },
      include: {
        canho: { select: { MaCanHo: true, SoPhong: true } },
        nguoidung: { select: { HoTen: true } },
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

  try {
    const [items, total] = await prisma.$transaction([
      prisma.chisodiennuoc.findMany({
        where,
        skip,
        take: limit,
        include: {
          canho: {
            include: {
              hopdong: {
                where: { TrangThai: "DangThue", is_deleted: 0 },
                include: {
                  nguoidung: { select: { HoTen: true, SoDienThoai: true } },
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
  } catch (error) {
    console.error("Error in getPendingMeterReadings:", error);
    throw error;
  }
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
            hopdong: {
              where: { TrangThai: "DangThue", is_deleted: 0 },
              select: {
                ID: true,
                GiaThue: true,
                nguoidung: { select: { HoTen: true, SoDienThoai: true } },
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

    if (!['ChoDuyetKeToan', 'ChoDienHoacNuoc'].includes(record.TrangThai)) {
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
  const { GhiChuKeToan } = data;

  // Lấy reading kèm canho (bao gồm ngày tính tiền riêng của căn hộ)
  const reading = await prisma.chisodiennuoc.findUnique({
    where: { ID: Number(readingId) },
    include: {
      canho: {
        include: {
          hopdong: {
            where: { TrangThai: "DangThue", is_deleted: 0 },
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
    throw Object.assign(new Error("Chỉ số này đã được xử lý"), { statusCode: 400 });
  }

  if (!reading.canho.hopdong[0]) {
    throw Object.assign(new Error("Căn hộ không có hợp đồng đang hoạt động"), { statusCode: 400 });
  }

  // Cập nhật chỉ số chính thức nếu kế toán có điều chỉnh
  const chiSoDienChinhThuc = data.ChiSoDienChinhThuc !== undefined
    ? new Prisma.Decimal(data.ChiSoDienChinhThuc)
    : reading.ChiSoDienMoi;
  const chiSoNuocChinhThuc = data.ChiSoNuocChinhThuc !== undefined
    ? new Prisma.Decimal(data.ChiSoNuocChinhThuc)
    : reading.ChiSoNuocMoi;

  // Validate chỉ số không âm
  const soDienCheck = new Prisma.Decimal(chiSoDienChinhThuc).minus(reading.ChiSoDienCu);
  const soNuocCheck = new Prisma.Decimal(chiSoNuocChinhThuc).minus(reading.ChiSoNuocCu);
  if (soDienCheck.isNegative() || soNuocCheck.isNegative()) {
    throw Object.assign(
      new Error("Chỉ số chính thức không hợp lệ (nhỏ hơn chỉ số cũ)"),
      { statusCode: 400 }
    );
  }

  // Lưu chỉ số chính thức vào DB trước
  const updatedReading = await prisma.chisodiennuoc.update({
    where: { ID: Number(readingId) },
    data: {
      ChiSoDienChinhThuc: chiSoDienChinhThuc,
      ChiSoNuocChinhThuc: chiSoNuocChinhThuc,
      KeToanDuyetID: Number(accountantId),
      NgayKeToanDuyet: new Date(),
      GhiChuKeToan,
      // Trạng thái: kiểm tra ngày tính tiền nhà để quyết định phát hành ngay hay chờ
      TrangThai: (() => {
        const today = new Date().getDate();
        const { ngayTienNha } = getBillingDays(reading.canho);
        return today >= ngayTienNha ? "DaPhatHanhHoaDon" : "DaDuyetChoPhatHanh";
      })(),
    },
  });

  // Nếu đã đến ngày tính tiền nhà → phát hành hóa đơn ngay
  const today = new Date().getDate();
  const { ngayTienNha } = getBillingDays(reading.canho);

  if (today >= ngayTienNha) {
    // Dùng reading đã có chỉ số chính thức
    const readingWithOfficial = { ...reading, ChiSoDienChinhThuc: chiSoDienChinhThuc, ChiSoNuocChinhThuc: chiSoNuocChinhThuc };
    const result = await _issueInvoice(reading.canho, readingWithOfficial);
    return { reading: updatedReading, invoice: result.invoice, status: "issued" };
  }

  // Chưa đến ngày → trả về trạng thái chờ phát hành
  return {
    reading: updatedReading,
    invoice: null,
    status: "pending",
    message: `Chỉ số đã duyệt. Hóa đơn sẽ tự phát hành vào ngày ${ngayTienNha} hàng tháng.`,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIC MỚI: Ngày tính tiền riêng + Giá điện bậc thang EVN
// ═══════════════════════════════════════════════════════════════════════════

const _buildDienMoTa = (kwh) => {
  const lines = [];
  let remaining = kwh;
  for (const tier of billingConfig.ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const capacity = tier.to === Infinity ? remaining : (tier.to - tier.from);
    const inTier = Math.min(remaining, capacity);
    const label = tier.to === Infinity ? `>${tier.from}` : `${tier.from + 1}-${tier.to}`;
    lines.push(`  Bậc ${label} kWh: ${inTier} × ${tier.price.toLocaleString()}đ = ${(inTier * tier.price).toLocaleString()}đ`);
    remaining -= inTier;
  }
  return `Điện: ${kwh} kWh (bậc thang EVN)\n${lines.join('\n')}`;
};

/**
 * Phát hành hóa đơn thực sự (dùng chung cho approveReading và cron)
 */
export const _issueInvoice = async (canho, reading) => {
  const config = billingConfig;

  const activeContract = canho.hopdong?.[0] ?? await prisma.hopdong.findFirst({
    where: { CanHoID: canho.ID, TrangThai: 'DangThue', is_deleted: 0 },
  });
  if (!activeContract) throw new Error('Không tìm thấy hợp đồng đang hoạt động');

  const chiSoDienMoi = reading.ChiSoDienChinhThuc ?? reading.ChiSoDienMoi;
  const chiSoNuocMoi = reading.ChiSoNuocChinhThuc ?? reading.ChiSoNuocMoi;

  const soDien = new Prisma.Decimal(chiSoDienMoi).minus(reading.ChiSoDienCu);
  const soNuoc = new Prisma.Decimal(chiSoNuocMoi).minus(reading.ChiSoNuocCu);

  // Tiền điện bậc thang EVN
  const tienDien   = new Prisma.Decimal(tinhTienDienBacThang(soDien));
  const tienNuoc   = soNuoc.times(config.WATER_PRICE);
  const tienThue   = new Prisma.Decimal(activeContract.GiaThue);
  const phiChung   = new Prisma.Decimal(config.COMMON_FEE);
  const phiVeSinh  = new Prisma.Decimal(config.CLEANING_FEE);

  const dichVuDaXuLy = await prisma.yeucaudichvu.findMany({
    where: { CanHoID: canho.ID, TrangThai: 'DaXuLy', HoaDonID: null },
    include: { dichvu: { select: { TenDichVu: true, Gia: true } } },
  });
  const tienDichVu = dichVuDaXuLy.reduce(
    (s, yc) => s.plus(new Prisma.Decimal(yc.dichvu.Gia)),
    new Prisma.Decimal(0)
  );

  const tongTien = tienThue.plus(tienDien).plus(tienNuoc).plus(phiChung).plus(phiVeSinh).plus(tienDichVu);

  const maHoaDon = `HD${reading.ThangNam.replace('-', '')}${String(canho.ID).padStart(3, '0')}`;
  const ngayLap = new Date();
  const ngayDenHan = new Date(ngayLap);
  ngayDenHan.setDate(ngayDenHan.getDate() + config.PAYMENT_DUE_DAYS);

  const noiDungCK = config.TRANSFER_CONTENT_TEMPLATE.replace('{maHoaDon}', maHoaDon);
  const qrContent = `${config.BANK_INFO.bankCode}|${config.BANK_INFO.accountNumber}|${tongTien}|${noiDungCK}`;

  return await prisma.$transaction(async (tx) => {
    await tx.chisodiennuoc.update({
      where: { ID: reading.ID },
      data: { TrangThai: 'DaPhatHanhHoaDon' },
    });

    const invoice = await tx.hoadon.create({
      data: {
        HopDongID: activeContract.ID,
        ThangNam: reading.ThangNam,
        MaHoaDon: maHoaDon,
        NgayLap: ngayLap,
        NgayDenHan: ngayDenHan,
        TongTien: tongTien,
        TrangThai: 'ChuaTT',
        SoTaiKhoan: config.BANK_INFO.accountNumber,
        NganHangNhan: config.BANK_INFO.bankName,
        NoiDungCK: noiDungCK,
        QRContent: qrContent,
      },
    });

    await tx.hoadonchitiet.createMany({
      data: [
        { HoaDonID: invoice.ID, Loai: 'TienThue', SoTien: tienThue,  MoTa: `Tiền thuê tháng ${reading.ThangNam}` },
        { HoaDonID: invoice.ID, Loai: 'Dien',     SoTien: tienDien,  MoTa: _buildDienMoTa(Number(soDien)) },
        { HoaDonID: invoice.ID, Loai: 'Nuoc',     SoTien: tienNuoc,  MoTa: `Nước: ${soNuoc} m³ × ${config.WATER_PRICE.toLocaleString()}đ` },
        { HoaDonID: invoice.ID, Loai: 'DichVu',   SoTien: phiChung,  MoTa: 'Phí quản lý chung' },
        { HoaDonID: invoice.ID, Loai: 'DichVu',   SoTien: phiVeSinh, MoTa: 'Phí vệ sinh' },
        ...dichVuDaXuLy.map(yc => ({
          HoaDonID: invoice.ID, Loai: 'DichVu',
          SoTien: new Prisma.Decimal(yc.dichvu.Gia),
          MoTa: `Dịch vụ: ${yc.dichvu.TenDichVu}`,
        })),
      ],
    });

    if (dichVuDaXuLy.length > 0) {
      await tx.yeucaudichvu.updateMany({
        where: { ID: { in: dichVuDaXuLy.map(yc => yc.ID) } },
        data: { HoaDonID: invoice.ID },
      });
    }

    try {
      await thongbaoService.sendInvoiceNotification(
        activeContract.NguoiThueID, invoice.ID, tongTien, reading.ThangNam
      );
    } catch (e) { console.error('Invoice notification failed:', e); }

    return invoice;
  });
};

/**
 * BƯỚC 2A (MỚI): Kế toán duyệt số liệu
 * - Lưu chỉ số chính thức
 * - Nếu hôm nay >= ngày tính tiền nhà → phát hành ngay
 * - Ngược lại → đánh dấu chờ, cron job phát hành đúng ngày
 */
export const approveReading = async (readingId, data, accountantId) => {
  const { GhiChuKeToan, ChiSoDienChinhThuc, ChiSoNuocChinhThuc } = data;

  const reading = await prisma.chisodiennuoc.findUnique({
    where: { ID: Number(readingId) },
    include: {
      canho: {
        select: {
          ID: true, MaCanHo: true,
          NgayTinhDien: true, NgayTinhNuoc: true, NgayTinhTienNha: true,
          hopdong: {
            where: { TrangThai: 'DangThue', is_deleted: 0 },
            take: 1,
          },
        },
      },
    },
  });

  if (!reading) throw Object.assign(new Error('Không tìm thấy chỉ số'), { statusCode: 404 });
  if (reading.TrangThai !== 'ChoDuyetKeToan')
    throw Object.assign(new Error('Chỉ số này đã được xử lý'), { statusCode: 400 });
  if (!reading.canho.hopdong[0])
    throw Object.assign(new Error('Căn hộ không có hợp đồng đang hoạt động'), { statusCode: 400 });

  const chiSoDienMoi = new Prisma.Decimal(ChiSoDienChinhThuc ?? reading.ChiSoDienMoi);
  const chiSoNuocMoi = new Prisma.Decimal(ChiSoNuocChinhThuc ?? reading.ChiSoNuocMoi);

  if (chiSoDienMoi.minus(reading.ChiSoDienCu).isNegative() ||
      chiSoNuocMoi.minus(reading.ChiSoNuocCu).isNegative())
    throw Object.assign(new Error('Chỉ số chính thức không hợp lệ (nhỏ hơn chỉ số cũ)'), { statusCode: 400 });

  const { ngayTienNha } = getBillingDays(reading.canho);
  const todayDay = new Date().getDate();
  const shouldIssueNow = todayDay >= ngayTienNha;

  // Lưu chỉ số chính thức
  const updatedReading = await prisma.chisodiennuoc.update({
    where: { ID: Number(readingId) },
    data: {
      ChiSoDienChinhThuc: chiSoDienMoi,
      ChiSoNuocChinhThuc: chiSoNuocMoi,
      // Trạng thái: đã duyệt, chờ phát hành hoặc đã phát hành
      TrangThai: shouldIssueNow ? 'DaPhatHanhHoaDon' : 'DaDuyetChoPhatHanh',
      KeToanDuyetID: Number(accountantId),
      NgayKeToanDuyet: new Date(),
      GhiChuKeToan,
    },
  });

  if (shouldIssueNow) {
    const invoice = await _issueInvoice(reading.canho, updatedReading);
    return { reading: updatedReading, invoice, issued: true };
  }

  return {
    reading: updatedReading,
    invoice: null,
    issued: false,
    message: `Số liệu đã duyệt. Hóa đơn sẽ tự phát hành vào ngày ${ngayTienNha} hàng tháng.`,
  };
};

/**
 * CRON: Chạy hàng ngày, phát hành hóa đơn cho các căn hộ đến ngày
 */
export const runDailyInvoiceRelease = async () => {
  const today = new Date();
  const todayDay = today.getDate();
  const thangNam = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Lấy chỉ số đã có chỉ số chính thức nhưng chưa phát hành hóa đơn tháng này
  const pendingReadings = await prisma.chisodiennuoc.findMany({
    where: {
      ThangNam: thangNam,
      TrangThai: 'DaDuyetChoPhatHanh',
      ChiSoDienChinhThuc: { not: null }, // đã được kế toán duyệt
      KeToanDuyetID: { not: null },
    },
    include: {
      canho: {
        select: {
          ID: true, MaCanHo: true,
          NgayTinhDien: true, NgayTinhNuoc: true, NgayTinhTienNha: true,
          hopdong: {
            where: { TrangThai: 'DangThue', is_deleted: 0 },
            take: 1,
          },
        },
      },
    },
  });

  const results = [];
  for (const reading of pendingReadings) {
    const { ngayTienNha } = getBillingDays(reading.canho);
    if (todayDay < ngayTienNha) continue;

    try {
      const invoice = await _issueInvoice(reading.canho, reading);
      results.push({ canHoID: reading.CanHoID, maCanHo: reading.canho.MaCanHo, invoiceID: invoice.ID, success: true });
    } catch (e) {
      results.push({ canHoID: reading.CanHoID, maCanHo: reading.canho.MaCanHo, error: e.message, success: false });
    }
  }

  return results;
};
