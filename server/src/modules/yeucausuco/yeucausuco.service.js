import prisma from "../../config/prisma.js";
import { ROLES } from "../../constants/roles.js";

export const getAllIncidents = async (filters = {}) => {
  const { TrangThai, DoUuTien, search } = filters;
  
  const where = {
    ...(TrangThai && { TrangThai }),
    ...(DoUuTien && { DoUuTien }),
    ...(search && {
      OR: [
        { TieuDe: { contains: search } },
        { MoTa: { contains: search } },
        { canho: { MaCanHo: { contains: search } } }
      ]
    })
  };

  return await prisma.yeucausuco.findMany({
    where,
    include: {
      canho: {
        select: {
          ID: true,
          MaCanHo: true,
          SoPhong: true,
          Tang: true
        }
      },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true,
          SoDienThoai: true,
          Email: true
        }
      },
      nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true,
          SoDienThoai: true
        }
      },
      nguoidung_yeucausuco_QuanLyNhanIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true
        }
      }
    },
    orderBy: [
      { TrangThai: "asc" },
      { DoUuTien: "desc" },
      { NgayBao: "desc" }
    ]
  });
};

export const getMyIncidents = async (userId) => {
  return await prisma.yeucausuco.findMany({
    where: { NguoiThueID: Number(userId) },
    include: {
      canho: {
        select: { MaCanHo: true }
      }
    },
    orderBy: { NgayBao: "desc" }
  });
};

export const createIncident = async (userId, data) => {
  const { CanHoID, TieuDe, MoTa, DoUuTien, HinhAnh } = data;

  if (!CanHoID) {
    throw Object.assign(new Error("Vui lòng chọn căn hộ để báo cáo sự cố"), { statusCode: 400 });
  }
  if (!TieuDe?.trim() || !MoTa?.trim()) {
    throw Object.assign(new Error("Tiêu đề và mô tả là bắt buộc"), { statusCode: 400 });
  }

  const canho = await prisma.canho.findUnique({ where: { ID: Number(CanHoID) } });
  if (!canho) {
    throw Object.assign(new Error("Căn hộ không tồn tại"), { statusCode: 400 });
  }

  return await prisma.yeucausuco.create({
    data: {
      NguoiThueID: Number(userId),
      CanHoID: Number(CanHoID),
      TieuDe,
      MoTa,
      DoUuTien: DoUuTien || "Trung",
      TrangThai: "Moi",
      NgayBao: new Date(),
      HinhAnh: Array.isArray(HinhAnh) ? HinhAnh : []
    }
  });
};

export const updateIncidentStatus = async (id, status, staffId) => {
  const updateData = {
    TrangThai: status
  };

  if (status === "DangXuLy") {
    updateData.NhanVienXuLyID = Number(staffId);
    updateData.NgayXuLy = new Date();
  }

  return await prisma.yeucausuco.update({
    where: { ID: Number(id) },
    data: updateData
  });
};

// Lấy danh sách kỹ thuật viên có sẵn
export const getAvailableStaff = async () => {
  // Lấy role ID của kỹ thuật viên
  const techRole = await prisma.roles.findFirst({
    where: { TenVaiTro: ROLES.NHAN_VIEN_KY_THUAT }
  });

  if (!techRole) {
    return [];
  }

  // Lấy danh sách kỹ thuật viên và số công việc đang xử lý
  const staff = await prisma.nguoidung.findMany({
    where: {
      RoleID: techRole.ID,
      TrangThai: "Active"
    },
    select: {
      ID: true,
      HoTen: true,
      SoDienThoai: true,
      Email: true,
      yeucausuco_yeucausuco_NhanVienXuLyIDTonguoidung: {
        where: {
          TrangThai: "DangXuLy"
        },
        select: {
          ID: true
        }
      }
    }
  });

  return staff.map(s => ({
    ...s,
    SoCongViecDangXuLy: s.yeucausuco_yeucausuco_NhanVienXuLyIDTonguoidung.length
  }));
};

// Phân công kỹ thuật viên tự động (chọn người có ít việc nhất)
export const autoAssignStaff = async (incidentId, managerId) => {
  // Đã tắt tính năng lịch trực - chỉ chọn kỹ thuật viên có ít việc nhất
  const availableStaff = await getAvailableStaff();
  
  if (availableStaff.length === 0) {
    throw Object.assign(new Error("Không có kỹ thuật viên nào khả dụng"), { statusCode: 400 });
  }

  // Chọn người có ít công việc đang xử lý nhất
  const selectedStaff = availableStaff.reduce((prev, current) => 
    (prev.SoCongViecDangXuLy < current.SoCongViecDangXuLy) ? prev : current
  );

  return await assignStaff(incidentId, { NhanVienXuLyID: selectedStaff.ID }, managerId);
};

// Phân công kỹ thuật viên thủ công
export const assignStaff = async (id, data, managerId) => {
  const { NhanVienXuLyID, GhiChu } = data;

  const incident = await prisma.yeucausuco.findUnique({
    where: { ID: Number(id) }
  });

  if (!incident) {
    throw Object.assign(new Error("Không tìm thấy sự cố"), { statusCode: 404 });
  }

  // Kiểm tra kỹ thuật viên có tồn tại không
  const staff = await prisma.nguoidung.findUnique({
    where: { ID: Number(NhanVienXuLyID) }
  });

  if (!staff) {
    throw Object.assign(new Error("Kỹ thuật viên không tồn tại"), { statusCode: 404 });
  }

  return await prisma.yeucausuco.update({
    where: { ID: Number(id) },
    data: {
      NhanVienXuLyID: Number(NhanVienXuLyID),
      QuanLyNhanID: Number(managerId),
      TrangThai: "DangXuLy",
      NgayXuLy: new Date(),
      ...(GhiChu && { KetQua: GhiChu })
    },
    include: {
      canho: { select: { MaCanHo: true, SoPhong: true, Tang: true } },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: { select: { HoTen: true, SoDienThoai: true } },
      nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung: { select: { HoTen: true, SoDienThoai: true } }
    }
  });
};

// Kỹ thuật viên cập nhật tiến độ và upload hình hoàn thành
export const completeIncident = async (id, data, staffId) => {
  const { KetQua, HinhAnhHoanThanh } = data;

  const incident = await prisma.yeucausuco.findUnique({
    where: { ID: Number(id) }
  });

  if (!incident) {
    throw Object.assign(new Error("Không tìm thấy sự cố"), { statusCode: 404 });
  }

  if (incident.NhanVienXuLyID !== Number(staffId)) {
    throw Object.assign(new Error("Bạn không có quyền cập nhật sự cố này"), { statusCode: 403 });
  }

  if (incident.TrangThai !== "DangXuLy") {
    throw Object.assign(new Error("Chỉ có thể hoàn thành sự cố đang xử lý"), { statusCode: 400 });
  }

  return await prisma.yeucausuco.update({
    where: { ID: Number(id) },
    data: {
      KetQua: KetQua || "",
      HinhAnhHoanThanh: Array.isArray(HinhAnhHoanThanh) ? HinhAnhHoanThanh : [],
      TrangThai: "DaGiaiQuyet"
    },
    include: {
      canho: { select: { MaCanHo: true } },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: { select: { HoTen: true } },
      nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung: { select: { HoTen: true } }
    }
  });
};

// Lấy danh sách công việc của kỹ thuật viên
export const getStaffIncidents = async (staffId) => {
  return await prisma.yeucausuco.findMany({
    where: { 
      NhanVienXuLyID: Number(staffId)
    },
    include: {
      canho: {
        select: { 
          ID: true,
          MaCanHo: true,
          SoPhong: true,
          Tang: true
        }
      },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true,
          SoDienThoai: true
        }
      }
    },
    orderBy: [
      { TrangThai: "asc" },
      { DoUuTien: "desc" },
      { NgayBao: "desc" }
    ]
  });
};

// Lấy chi tiết sự cố
export const getIncidentById = async (id) => {
  const incident = await prisma.yeucausuco.findUnique({
    where: { ID: Number(id) },
    include: {
      canho: {
        select: { 
          ID: true,
          MaCanHo: true,
          SoPhong: true,
          Tang: true
        }
      },
      nguoidung_yeucausuco_NguoiThueIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true,
          SoDienThoai: true,
          Email: true
        }
      },
      nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true,
          SoDienThoai: true
        }
      },
      nguoidung_yeucausuco_QuanLyNhanIDTonguoidung: {
        select: {
          ID: true,
          HoTen: true
        }
      }
    }
  });

  if (!incident) {
    throw Object.assign(new Error("Không tìm thấy sự cố"), { statusCode: 404 });
  }

  return incident;
};

export const deleteIncident = async (id) => {
  return await prisma.yeucausuco.delete({
    where: { ID: Number(id) }
  });
};
