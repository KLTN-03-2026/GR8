import * as thongbaoService from "./thongbao.service.js";

export const createNotification = async (req, res, next) => {
  try {
    const senderId = req.user.ID || req.user.id;
    console.log("🔵 Creating notification - User:", senderId, "Body:", req.body);
    
    // Xử lý ảnh upload nếu có - sử dụng Cloudinary URLs
    const imagePaths = Array.isArray(req.files)
      ? req.files.map((file) => file.path)
      : [];
    
    console.log("🔵 Image paths:", imagePaths);
    
    const payload = { ...req.body, HinhAnh: imagePaths.length > 0 ? imagePaths : undefined };
    console.log("🔵 Payload:", payload);
    
    const result = await thongbaoService.createNotification(payload, senderId);
    console.log("✅ Notification created successfully:", result.ID);
    
    res.status(201).json({ success: true, message: "Tạo thông báo thành công", data: result });
  } catch (error) {
    console.error("🔴 Error creating notification:", error.message, error.stack);
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imagePaths = Array.isArray(req.files) ? req.files.map((file) => file.path) : [];
    
    let existingImages = req.body.existingImages || [];
    if (typeof existingImages === 'string') {
        existingImages = existingImages.trim() ? [existingImages] : [];
    }
    
    // finalImages is the concatenation of retained old images and newly uploaded images
    const finalImages = [...existingImages, ...imagePaths];

    const payload = { ...req.body, HinhAnh: finalImages };
    const result = await thongbaoService.updateNotification(id, payload);
    res.json({ success: true, message: "Cập nhật thông báo thành công", data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await thongbaoService.deleteNotification(id);
    res.json({ success: true, message: "Xóa thông báo thành công" });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    const result = await thongbaoService.getUserNotifications(userId, req.query);
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    await thongbaoService.markAsRead(req.params.id, userId);
    res.json({ success: true, message: "Đã đánh dấu đọc" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    await thongbaoService.markAllAsRead(userId);
    res.json({ success: true, message: "Đã đánh dấu đọc tất cả" });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.ID || req.user.id;
    const result = await thongbaoService.getUnreadCount(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getSystemRequests = async (req, res, next) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const userId = req.user.ID || req.user.id;
    const role = req.user.roles?.TenVaiTro || req.user.VaiTro;
    
    let notifications = [];

    if (role === 'QuanLy' || role === 'ChuNha') {
      // Fetch pending requests with user details
      const yeucauthueRaw = await prisma.yeucauthue.findMany({ 
        where: { TrangThai: 'ChoKiemTra' },
        include: { nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung: true, canho: true },
        orderBy: { NgayYeuCau: 'desc' },
        take: 10
      });
      const yeucaudichvuRaw = await prisma.yeucaudichvu.findMany({ 
        where: { TrangThai: 'ChoXuLy' },
        include: { nguoidung: true, canho: true, dichvu: true },
        orderBy: { NgayYeuCau: 'desc' },
        take: 10
      });
      const yeucausucoRaw = await prisma.yeucausuco.findMany({ 
        where: { TrangThai: 'Moi' },
        include: { nguoidung_yeucausuco_NguoiThueIDTonguoidung: true, canho: true },
        orderBy: { NgayBao: 'desc' },
        take: 10
      });
      const hopdongKetThucRaw = await prisma.hopdong.findMany({ 
        where: { YeuCauKetThuc: true, TrangThai: { not: 'KetThuc' } },
        include: { nguoidung: true, canho: true },
        orderBy: { NgayYeuCauKetThuc: 'desc' },
        take: 10
      });
      const chuyennhuongRaw = await prisma.chuyennhuong.findMany({ 
        where: { TrangThai: 'ChoDuyet' },
        include: { nguoidung_chuyennhuong_NguoiThueCuIDTonguoidung: true, hopdong_chuyennhuong_HopDongIDTohopdong: { include: { canho: true } } },
        orderBy: { NgayYeuCau: 'desc' },
        take: 10
      });

      yeucauthueRaw.forEach(item => {
        notifications.push({
          id: `thue_${item.ID}`,
          type: 'yeucauthue',
          title: 'Yêu cầu thuê nhà',
          message: `${item.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen || 'Khách'} đã gửi yêu cầu thuê căn hộ ${item.canho?.MaCanHo}`,
          time: item.NgayYeuCau,
          link: '/yeucauthue',
          icon: '🏠'
        });
      });

      yeucaudichvuRaw.forEach(item => {
        notifications.push({
          id: `dichvu_${item.ID}`,
          type: 'yeucaudichvu',
          title: 'Yêu cầu dịch vụ',
          message: `${item.nguoidung?.HoTen || 'Khách'} yêu cầu dịch vụ ${item.dichvu?.TenDichVu} cho căn hộ ${item.canho?.MaCanHo}`,
          time: item.NgayYeuCau,
          link: '/services?tab=requests',
          icon: '🛠️'
        });
      });

      yeucausucoRaw.forEach(item => {
        notifications.push({
          id: `suco_${item.ID}`,
          type: 'yeucausuco',
          title: 'Báo cáo sự cố',
          message: `${item.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || 'Khách'} báo cáo sự cố tại căn hộ ${item.canho?.MaCanHo}: ${item.TieuDe}`,
          time: item.NgayBao,
          link: '/assign-incidents',
          icon: '⚠️'
        });
      });

      hopdongKetThucRaw.forEach(item => {
        notifications.push({
          id: `hopdong_${item.ID}`,
          type: 'hopdongKetThuc',
          title: 'Yêu cầu kết thúc HĐ',
          message: `${item.nguoidung?.HoTen || 'Khách'} yêu cầu kết thúc hợp đồng căn hộ ${item.canho?.MaCanHo}`,
          time: item.NgayYeuCauKetThuc,
          link: '/contracts?showTerminations=true',
          icon: '📄'
        });
      });

      chuyennhuongRaw.forEach(item => {
        notifications.push({
          id: `chuyennhuong_${item.ID}`,
          type: 'chuyennhuong',
          title: 'Yêu cầu chuyển nhượng',
          message: `${item.nguoidung_chuyennhuong_NguoiThueCuIDTonguoidung?.HoTen || 'Khách'} yêu cầu chuyển nhượng hợp đồng căn hộ ${item.hopdong_chuyennhuong_HopDongIDTohopdong?.canho?.MaCanHo}`,
          time: item.NgayYeuCau,
          link: '/transfer-requests',
          icon: '🔄'
        });
      });
    } else if (role === 'NhanVienKyThuat') {
      const assignedIncidents = await prisma.yeucausuco.findMany({ 
        where: { NhanVienXuLyID: userId, TrangThai: 'DangXuLy' },
        include: { canho: true },
        orderBy: { NgayBao: 'desc' },
        take: 10
      });

      assignedIncidents.forEach(item => {
        notifications.push({
          id: `assigned_suco_${item.ID}`,
          type: 'yeucausuco_assigned',
          title: 'Phân công sự cố mới',
          message: `Bạn được phân công xử lý sự cố tại căn hộ ${item.canho?.MaCanHo}: ${item.TieuDe}`,
          time: item.NgayBao,
          link: '/staff/work',
          icon: '🔧'
        });
      });
    } else if (role === 'KeToan') {
      const pendingReadings = await prisma.chisodiennuoc.findMany({ 
        where: { TrangThai: 'ChoDuyetKeToan' },
        include: { canho: true },
        orderBy: { NgayGhi: 'desc' },
        take: 10
      });

      pendingReadings.forEach(item => {
        notifications.push({
          id: `chiso_${item.ID}`,
          type: 'chisodiennuoc_pending',
          title: 'Duyệt chỉ số',
          message: `Chỉ số điện/nước tháng ${item.ThangNam} của căn hộ ${item.canho?.MaCanHo} đang chờ duyệt`,
          time: item.NgayGhi || new Date(),
          link: '/pending-readings',
          icon: '💧'
        });
      });
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: {
        total: notifications.length,
        items: notifications
      }
    });
  } catch (error) {
    next(error);
  }
};
