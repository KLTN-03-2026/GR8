// server/src/modules/lichtruc/lichtruc.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// NgayTruc là @db.Date — chỉ cần phần ngày, không cần giờ
// Truyền string "YYYY-MM-DD" trực tiếp để Prisma/MySQL tự xử lý đúng
const toDateOnly = (dateString) => {
  if (!dateString) return null;
  // Nếu đã là "YYYY-MM-DD" thì dùng luôn
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T00:00:00.000Z'); // Prisma @db.Date expects 00:00:00Z
  }
  if (dateString instanceof Date) {
    const y = dateString.getUTCFullYear();
    const m = String(dateString.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateString.getUTCDate()).padStart(2, '0');
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }
  return new Date(dateString);
};

// Lấy chuỗi "YYYY-MM-DD" từ Date object (theo UTC)
const toDateStr = (date) => {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Alias để không phải đổi tên ở các chỗ khác
const parseLocalDate = toDateOnly;

class LichTrucService {
  // Lấy danh sách lịch trực với filter
  async getAll(filters = {}) {
    const { NgayTruc, NhanVienID, TrangThai, startDate, endDate } = filters;
    
    const where = {};
    
    if (NgayTruc) {
      where.NgayTruc = toDateOnly(NgayTruc);
    }
    
    if (startDate && endDate) {
      where.NgayTruc = {
        gte: parseLocalDate(startDate),
        lte: parseLocalDate(endDate)
      };
    }
    
    if (NhanVienID) {
      where.NhanVienID = parseInt(NhanVienID);
    }
    
    if (TrangThai) {
      where.TrangThai = TrangThai;
    }

    const schedules = await prisma.lichtruc.findMany({
      where,
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true,
            Avatar: true
          }
        },
        nguoidung_lichtruc_NguoiTaoIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true
          }
        }
      },
      orderBy: [
        { NgayTruc: 'desc' },
        { CaTruc: 'asc' }
      ]
    });

    return schedules;
  }

  // Lấy lịch trực theo tháng (calendar view)
  async getByMonth(year, month) {
    // @db.Date: dùng 00:00:00Z để Prisma/MySQL so sánh đúng
    const startDate = new Date(`${year}-${String(month).padStart(2,'0')}-01T00:00:00.000Z`);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const endDate = new Date(`${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}T23:59:59.999Z`);

    const schedules = await prisma.lichtruc.findMany({
      where: {
        NgayTruc: { gte: startDate, lte: endDate },
        TrangThai: { not: 'Huy' }
      },
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            SoDienThoai: true,
            Avatar: true
          }
        }
      },
      orderBy: [
        { NgayTruc: 'asc' },
        { NgayTao: 'asc' }  // cũ trước để bản mới nhất ghi đè
      ]
    });

    // Deduplicate: mỗi nhân viên mỗi ngày chỉ giữ ca mới nhất cho từng slot
    // Nếu có CaNgay thì loại bỏ Sang/Chieu cùng nhân viên cùng ngày
    const keyMap = new Map(); // key: "nhanVienID_dateStr_caTruc" → schedule

    for (const s of schedules) {
      const d = new Date(s.NgayTruc);
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
      const staffId = s.NhanVienID;

      // Nếu đã có CaNgay cho nhân viên này ngày này → bỏ qua Sang/Chieu
      const caNgayKey = `${staffId}_${dateStr}_CaNgay`;
      if (s.CaTruc !== 'CaNgay' && keyMap.has(caNgayKey)) continue;

      // Nếu đang thêm CaNgay → xóa Sang/Chieu đã có
      if (s.CaTruc === 'CaNgay') {
        keyMap.delete(`${staffId}_${dateStr}_Sang`);
        keyMap.delete(`${staffId}_${dateStr}_Chieu`);
        keyMap.delete(`${staffId}_${dateStr}_Toi`);
      }

      // Ghi đè bản cũ hơn (vì sort created_at asc, bản sau = mới hơn)
      keyMap.set(`${staffId}_${dateStr}_${s.CaTruc}`, s);
    }

    return Array.from(keyMap.values());
  }

  // Lấy người trực trong ngày hôm nay
  async getTodayDuty() {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const today = new Date(todayStr + 'T00:00:00.000Z');

    const schedules = await prisma.lichtruc.findMany({
      where: {
        NgayTruc: today,
        TrangThai: { not: 'Huy' }
      },
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true,
            Avatar: true
          }
        }
      }
    });

    return schedules;
  }

  // Lấy người trực theo ngày cụ thể
  async getDutyByDate(date) {
    const targetDate = toDateOnly(date);

    const schedules = await prisma.lichtruc.findMany({
      where: {
        NgayTruc: targetDate,
        TrangThai: { not: 'Huy' }
      },
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true,
            Avatar: true
          }
        }
      }
    });

    return schedules;
  }

  // Tạo lịch trực mới
  async create(data, creatorId) {
    const { NhanVienID, NgayTruc, CaTruc, GhiChu } = data;

    const targetDate = toDateOnly(NgayTruc);
    const nhanVienId = parseInt(NhanVienID);

    // Lấy tất cả lịch chưa hủy của nhân viên trong ngày đó
    // @db.Date: so sánh bằng equals vì chỉ lưu ngày
    const existing = await prisma.lichtruc.findMany({
      where: {
        NhanVienID: nhanVienId,
        NgayTruc: targetDate,
        TrangThai: { not: 'Huy' }
      },
      orderBy: { NgayTao: 'asc' }
    });

    // Xác định các ca cần xóa
    const idsToDelete = [];

    if (CaTruc === 'CaNgay') {
      // Phân công cả ngày → xóa tất cả ca khác trong ngày
      existing.forEach(e => idsToDelete.push(e.ID));
    } else {
      // Phân công ca lẻ → xóa nếu đã có CaNgay hoặc trùng đúng ca đó
      existing.forEach(e => {
        if (e.CaTruc === 'CaNgay' || e.CaTruc === CaTruc) {
          idsToDelete.push(e.ID);
        }
      });
    }

    // Xóa các ca bị thay thế
    if (idsToDelete.length > 0) {
      await prisma.lichtruc.deleteMany({
        where: { ID: { in: idsToDelete } }
      });
    }

    // Tạo lịch mới
    const schedule = await prisma.lichtruc.create({
      data: {
        NhanVienID: nhanVienId,
        NgayTruc: targetDate,
        CaTruc,
        GhiChu: GhiChu || null,
        NguoiTaoID: creatorId,
        TrangThai: 'DangTruc'
      },
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true
          }
        }
      }
    });

    return schedule;
  }

  // Tạo nhiều lịch trực cùng lúc
  async createBulk(schedules, creatorId) {
    const data = schedules.map(s => ({
      NhanVienID: parseInt(s.NhanVienID),
      NgayTruc: parseLocalDate(s.NgayTruc),
      CaTruc: s.CaTruc || 'CaNgay',
      GhiChu: s.GhiChu || null,
      NguoiTaoID: creatorId,
      TrangThai: 'DangTruc'
    }));

    const result = await prisma.lichtruc.createMany({
      data,
      skipDuplicates: true
    });

    return result;
  }

  // Cập nhật lịch trực
  async update(id, data) {
    const schedule = await prisma.lichtruc.update({
      where: { ID: parseInt(id) },
      data: {
        ...data,
        NgayTruc: data.NgayTruc ? parseLocalDate(data.NgayTruc) : undefined,
        updated_at: new Date()
      },
      include: {
        nguoidung_lichtruc_NhanVienIDTonguoidung: {
          select: {
            ID: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true
          }
        }
      }
    });

    return schedule;
  }

  // Hủy lịch trực
  async cancel(id) {
    const schedule = await prisma.lichtruc.update({
      where: { ID: parseInt(id) },
      data: {
        TrangThai: 'Huy',
        updated_at: new Date()
      }
    });

    return schedule;
  }

  // Xóa lịch trực
  async delete(id) {
    await prisma.lichtruc.delete({
      where: { ID: parseInt(id) }
    });
  }

  // Lấy thống kê lịch trực
  async getStats(startDate, endDate) {
    const where = {};
    
    if (startDate && endDate) {
      where.NgayTruc = {
        gte: parseLocalDate(startDate),
        lte: parseLocalDate(endDate)
      };
    }

    const total = await prisma.lichtruc.count({ where });
    const active = await prisma.lichtruc.count({ 
      where: { ...where, TrangThai: 'DangTruc' } 
    });
    const completed = await prisma.lichtruc.count({ 
      where: { ...where, TrangThai: 'DaTruc' } 
    });
    const cancelled = await prisma.lichtruc.count({ 
      where: { ...where, TrangThai: 'Huy' } 
    });

    // Thống kê theo nhân viên
    const byStaff = await prisma.lichtruc.groupBy({
      by: ['NhanVienID'],
      where,
      _count: true
    });

    const staffStats = await Promise.all(
      byStaff.map(async (item) => {
        const staff = await prisma.nguoidung.findUnique({
          where: { ID: item.NhanVienID },
          select: { ID: true, HoTen: true }
        });
        return {
          ...staff,
          soLanTruc: item._count
        };
      })
    );

    return {
      total,
      active,
      completed,
      cancelled,
      byStaff: staffStats
    };
  }
}

export default new LichTrucService();
