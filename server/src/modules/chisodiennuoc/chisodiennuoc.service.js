import prisma from "../../config/prisma.js";

/**
 * ===============================
 * HELPER FUNCTIONS
 * ===============================
 */

// Validate CanHoID
const validateCanHoID = (canHoId) => {
  if (!canHoId || isNaN(Number(canHoId))) {
    const error = new Error("CanHoID không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
};

// Convert để sort (tránh lỗi timezone)
const parseThangNamToDate = (thangNam) => {
  const [month, year] = thangNam.split("-");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
};

// Validate input cơ bản
const validateInput = ({ ChiSoDienMoi, ChiSoNuocMoi }) => {
  if (
    ChiSoDienMoi === undefined ||
    ChiSoNuocMoi === undefined ||
    isNaN(Number(ChiSoDienMoi)) ||
    isNaN(Number(ChiSoNuocMoi))
  ) {
    const error = new Error("Chỉ số điện/nước không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
};

// Check tháng hợp lệ (không quá tương lai)
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
 * ===============================
 * CORE LOGIC
 * ===============================
 */

// Lấy chỉ số gần nhất trước đó (không bị lỗi skip tháng)
export const getPreviousChiSo = async (canHoId, thangNamDate, tx) => {
  const prevRecord = await tx.chisodiennuoc.findFirst({
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

  // Fallback từ hợp đồng (nếu có)
  const hopdong = await tx.hopdong.findFirst({
    where: {
      CanHoID: canHoId,
      TrangThai: { in: ["DangThue", "DaKy"] },
    },
    orderBy: { NgayBatDau: "desc" },
  });

  return {
    ChiSoDienCu: 0,
    ChiSoNuocCu: 0,
    isFirstMonth: true,
  };
};

/**
 * Tạo mới chỉ số điện nước
 */
export const createChiSoDienNuoc = async (data, nguoiGhiId) => {
  const { CanHoID, ThangNam, ChiSoDienMoi, ChiSoNuocMoi } = data;

  validateCanHoID(CanHoID);
  validateInput({ ChiSoDienMoi, ChiSoNuocMoi });
  validateThangNam(ThangNam);

  const numCanHoID = Number(CanHoID);
  const numDienMoi = Number(ChiSoDienMoi);
  const numNuocMoi = Number(ChiSoNuocMoi);
  const thangNamDate = parseThangNamToDate(ThangNam);

  return await prisma.$transaction(async (tx) => {
    // Check trùng (race condition safe inside tx)
    const existing = await tx.chisodiennuoc.findFirst({
      where: {
        CanHoID: numCanHoID,
        ThangNam,
      },
    });

    if (existing) {
      const error = new Error("Tháng này đã có chỉ số");
      error.statusCode = 400;
      throw error;
    }

    const { ChiSoDienCu, ChiSoNuocCu } = await getPreviousChiSo(
      numCanHoID,
      thangNamDate,
      tx
    );

    const numDienCu = Number(ChiSoDienCu);
    const numNuocCu = Number(ChiSoNuocCu);

    if (numDienMoi < numDienCu) {
      const error = new Error("Chỉ số điện mới < chỉ số cũ");
      error.statusCode = 400;
      throw error;
    }

    if (numNuocMoi < numNuocCu) {
      const error = new Error("Chỉ số nước mới < chỉ số cũ");
      error.statusCode = 400;
      throw error;
    }

    return await tx.chisodiennuoc.create({
      data: {
        CanHoID: numCanHoID,
        ThangNam,
        ChiSoDienCu: numDienCu,
        ChiSoDienMoi: numDienMoi,
        ChiSoNuocCu: numNuocCu,
        ChiSoNuocMoi: numNuocMoi,
        NguoiGhiID: nguoiGhiId,
        thang_nam_date: thangNamDate,
      },
    });
  });
};

/**
 * Lấy danh sách + phân trang
 */
export const getAllChiSoDienNuoc = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const { CanHoID, ThangNam } = filters;

  const where = {};
  if (CanHoID) where.CanHoID = Number(CanHoID);
  if (ThangNam) where.ThangNam = ThangNam;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const [total, data] = await prisma.$transaction([
    prisma.chisodiennuoc.count({ where }),
    prisma.chisodiennuoc.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: { thang_nam_date: "desc" },
      include: {
        canho: true,
        nguoidung: { select: { HoTen: true } },
      },
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Lấy chi tiết
 */
export const getChiSoDienNuocById = async (id) => {
  const record = await prisma.chisodiennuoc.findUnique({
    where: { ID: Number(id) },
    include: {
      canho: true,
      nguoidung: true,
    },
  });

  if (!record) {
    const error = new Error("Không tìm thấy");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

/**
 * Update (có check hóa đơn)
 */
export const updateChiSoDienNuoc = async (id, data) => {
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

    // Không cho update nếu đã có tháng sau
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

    // Check hóa đơn
    const hoadon = await tx.hoadon.findFirst({
      where: {
        ThangNam: record.ThangNam,
        hopdong: {
          CanHoID: record.CanHoID,
        },
      },
    });

    if (hoadon && hoadon.TrangThai === "DaTT") {
      const error = new Error("Hóa đơn đã thanh toán, không được sửa");
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
    if (numDienMoi !== undefined) updateData.ChiSoDienMoi = numDienMoi;
    if (numNuocMoi !== undefined) updateData.ChiSoNuocMoi = numNuocMoi;

    return await tx.chisodiennuoc.update({
      where: { ID: recordId },
      data: updateData,
    });
  });
};

/**
 * Delete (có check ràng buộc)
 */
export const deleteChiSoDienNuoc = async (id) => {
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

    // Check tháng sau
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

    // Check hóa đơn
    const hoadon = await tx.hoadon.findFirst({
      where: {
        ThangNam: record.ThangNam,
        hopdong: {
          CanHoID: record.CanHoID,
        },
      },
    });

    if (hoadon && hoadon.TrangThai === "DaTT") {
      const error = new Error("Không thể xóa vì hóa đơn đã thanh toán");
      error.statusCode = 400;
      throw error;
    }

    await tx.chisodiennuoc.delete({
      where: { ID: recordId },
    });

    return { success: true };
  });
};