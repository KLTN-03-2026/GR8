import prisma from "../../config/prisma.js";

export const getOverviewStats = async () => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  const [
    totalCanHo,
    canHoTrong,
    hopdongActive,
    yeuCauSuCoChoXuLy,
    revenueThisMonth
  ] = await Promise.all([
    prisma.canho.count({ where: { is_deleted: 0 } }),
    prisma.canho.count({ where: { is_deleted: 0, TrangThai: "Trong" } }),
    prisma.hopdong.count({ where: { is_deleted: 0, TrangThai: "DangThue" } }),
    prisma.yeucausuco.count({ where: { TrangThai: { in: ["Moi", "DangXuLy"] } } }),
    prisma.hoadon.aggregate({
      where: {
        is_deleted: 0,
        ThangNam: currentMonth,
        TrangThai: "DaTT"
      },
      _sum: {
        TongTien: true
      }
    })
  ]);

  return {
    totalCanHo,
    canHoTrong,
    hopdongActive,
    yeuCauSuCoChoXuLy,
    revenueThisMonth: revenueThisMonth._sum.TongTien || 0
  };
};

export const getRevenueChart = async (year) => {
  const targetYear = year || new Date().getFullYear();
  
  const invoices = await prisma.hoadon.findMany({
    where: {
      is_deleted: 0,
      TrangThai: "DaTT",
      ThangNam: {
        startsWith: String(targetYear)
      }
    },
    select: {
      ThangNam: true,
      TongTien: true
    }
  });

  const monthlyRevenue = Array(12).fill(0);
  
  invoices.forEach(invoice => {
    const month = parseInt(invoice.ThangNam.split("-")[1], 10) - 1;
    monthlyRevenue[month] += Number(invoice.TongTien);
  });

  return {
    year: targetYear,
    data: monthlyRevenue
  };
};

export const getOccupancyRate = async () => {
  const total = await prisma.canho.count({ where: { is_deleted: 0 } });
  if (total === 0) return { total: 0, occupied: 0, rate: 0 };
  
  const occupied = await prisma.canho.count({ 
    where: { is_deleted: 0, TrangThai: "DaThue" } 
  });
  
  return {
    total,
    occupied,
    rate: Number(((occupied / total) * 100).toFixed(2))
  };
};
