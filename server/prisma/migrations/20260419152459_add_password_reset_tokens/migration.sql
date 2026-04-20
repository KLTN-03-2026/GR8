-- CreateTable
CREATE TABLE `canho` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `MaCanHo` VARCHAR(20) NOT NULL,
    `ToaNhaID` INTEGER NULL,
    `Tang` INTEGER NOT NULL,
    `SoPhong` VARCHAR(10) NOT NULL,
    `DienTich` DECIMAL(10, 2) NULL,
    `GiaThue` DECIMAL(15, 2) NOT NULL,
    `TienCoc` DECIMAL(15, 2) NOT NULL,
    `TrangThai` ENUM('Trong', 'DaThue', 'BaoTri', 'DangDon') NULL DEFAULT 'Trong',
    `MoTa` TEXT NULL,
    `ChuNhaID` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `canho_MaCanHo_key`(`MaCanHo`),
    INDEX `canho_ChuNhaID_idx`(`ChuNhaID`),
    INDEX `canho_ToaNhaID_idx`(`ToaNhaID`),
    INDEX `canho_TrangThai_idx`(`TrangThai`),
    INDEX `idx_canho_trangthai`(`TrangThai`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `canho_tienich` (
    `CanHoID` INTEGER NOT NULL,
    `TienIchID` INTEGER NOT NULL,

    INDEX `canho_tienich_TienIchID_fkey`(`TienIchID`),
    PRIMARY KEY (`CanHoID`, `TienIchID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chisodiennuoc` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `CanHoID` INTEGER NOT NULL,
    `ThangNam` VARCHAR(7) NOT NULL,
    `ChiSoDienCu` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `ChiSoDienMoi` DECIMAL(10, 2) NOT NULL,
    `ChiSoNuocCu` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `ChiSoNuocMoi` DECIMAL(10, 2) NOT NULL,
    `NgayGhi` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `NguoiGhiID` INTEGER NULL,
    `thang_nam_date` DATE NULL,

    INDEX `chisodiennuoc_CanHoID_idx`(`CanHoID`),
    INDEX `chisodiennuoc_NguoiGhiID_idx`(`NguoiGhiID`),
    INDEX `idx_chisodiennuoc_thang`(`ThangNam`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chuyennhuong` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `HopDongID` INTEGER NOT NULL,
    `NguoiThueCuID` INTEGER NOT NULL,
    `NguoiThueMoiID` INTEGER NOT NULL,
    `NgayYeuCau` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TrangThai` ENUM('ChoDuyet', 'DaDuyet', 'TuChoi') NULL DEFAULT 'ChoDuyet',
    `QuanLyDuyetID` INTEGER NULL,
    `ChuNhaDuyetID` INTEGER NULL,
    `NewHopDongID` INTEGER NULL,

    INDEX `chuyennhuong_ChuNhaDuyetID_idx`(`ChuNhaDuyetID`),
    INDEX `chuyennhuong_HopDongID_idx`(`HopDongID`),
    INDEX `chuyennhuong_NewHopDongID_idx`(`NewHopDongID`),
    INDEX `chuyennhuong_NguoiThueCuID_idx`(`NguoiThueCuID`),
    INDEX `chuyennhuong_NguoiThueMoiID_idx`(`NguoiThueMoiID`),
    INDEX `chuyennhuong_QuanLyDuyetID_idx`(`QuanLyDuyetID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuoctrochuyen` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NguoiDungID` INTEGER NOT NULL,
    `SessionID` VARCHAR(50) NOT NULL,
    `NgayBatDau` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cuoctrochuyen_SessionID_key`(`SessionID`),
    INDEX `cuoctrochuyen_NguoiDungID_idx`(`NguoiDungID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dichvu` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TenDichVu` VARCHAR(100) NOT NULL,
    `MoTa` TEXT NULL,
    `Gia` DECIMAL(12, 2) NOT NULL,
    `TrangThai` ENUM('Active', 'Inactive') NULL DEFAULT 'Active',

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hoadon` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `HopDongID` INTEGER NOT NULL,
    `ThangNam` VARCHAR(7) NOT NULL,
    `NgayLap` DATE NOT NULL,
    `NgayDenHan` DATE NOT NULL,
    `TongTien` DECIMAL(15, 2) NOT NULL,
    `TrangThai` ENUM('ChuaTT', 'DaTT', 'QuaHan') NULL DEFAULT 'ChuaTT',
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` DATETIME(0) NULL,
    `thang_nam_date` DATE NULL,

    INDEX `hoadon_HopDongID_idx`(`HopDongID`),
    INDEX `hoadon_TrangThai_idx`(`TrangThai`),
    INDEX `idx_hoadon_thangnam`(`ThangNam`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hoadonchitiet` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `HoaDonID` INTEGER NOT NULL,
    `Loai` ENUM('TienThue', 'Dien', 'Nuoc', 'DichVu', 'Phat') NOT NULL,
    `SoTien` DECIMAL(15, 2) NOT NULL,
    `MoTa` TEXT NULL,

    INDEX `hoadonchitiet_HoaDonID_idx`(`HoaDonID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hopdong` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `YeuCauThueID` INTEGER NULL,
    `CanHoID` INTEGER NOT NULL,
    `NguoiThueID` INTEGER NOT NULL,
    `NgayBatDau` DATE NOT NULL,
    `NgayKetThuc` DATE NOT NULL,
    `GiaThue` DECIMAL(15, 2) NOT NULL,
    `TienCoc` DECIMAL(15, 2) NOT NULL,
    `TienCocDaNhan` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `TrangThai` ENUM('ChoKy', 'DaKy', 'DangThue', 'HetHan', 'ChuyenNhuong', 'DaChuyenNhuong', 'KetThuc') NULL DEFAULT 'ChoKy',
    `NgayKy` DATE NULL,
    `FileHopDong` VARCHAR(500) NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` DATETIME(0) NULL,

    INDEX `hopdong_CanHoID_idx`(`CanHoID`),
    INDEX `hopdong_NguoiThueID_idx`(`NguoiThueID`),
    INDEX `hopdong_TrangThai_idx`(`TrangThai`),
    INDEX `hopdong_YeuCauThueID_idx`(`YeuCauThueID`),
    INDEX `idx_hopdong_canho`(`CanHoID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `LoaiEntity` VARCHAR(50) NULL,
    `EntityID` INTEGER NOT NULL,
    `FileURL` VARCHAR(500) NOT NULL,
    `LoaiFile` ENUM('image', 'video', 'pdf') NULL DEFAULT 'image',
    `NgayUpload` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `UploadedBy` INTEGER NULL,

    INDEX `media_UploadedBy_idx`(`UploadedBy`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nguoidung` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TenDangNhap` VARCHAR(50) NOT NULL,
    `MatKhau` VARCHAR(255) NOT NULL,
    `RoleID` INTEGER NULL,
    `HoTen` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    `CCCD` VARCHAR(20) NULL,
    `NgaySinh` DATE NULL,
    `DiaChi` VARCHAR(255) NULL,
    `Avatar` VARCHAR(500) NULL,
    `GioiTinh` ENUM('Nam', 'Nu', 'Khac') NULL,
    `NgayTao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TrangThai` ENUM('Active', 'Inactive', 'Locked') NULL DEFAULT 'Active',
    `LoaiGiayTo` ENUM('CCCD', 'Passport') NULL DEFAULT 'CCCD',
    `NgayHetHanGiayTo` DATE NULL,
    `NgayHetHanVisa` DATE NULL,
    `QuocTich` VARCHAR(100) NULL,
    `SoGiayTo` VARCHAR(50) NULL,
    `VisaType` VARCHAR(50) NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `nguoidung_TenDangNhap_key`(`TenDangNhap`),
    UNIQUE INDEX `nguoidung_Email_key`(`Email`),
    UNIQUE INDEX `nguoidung_SoDienThoai_key`(`SoDienThoai`),
    UNIQUE INDEX `nguoidung_CCCD_key`(`CCCD`),
    UNIQUE INDEX `nguoidung_SoGiayTo_key`(`SoGiayTo`),
    INDEX `fk_nguoidung_roles`(`RoleID`),
    INDEX `idx_nguoidung_email`(`Email`),
    INDEX `nguoidung_QuocTich_idx`(`QuocTich`),
    INDEX `nguoidung_SoGiayTo_idx`(`SoGiayTo`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refreshtokens` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `Token` VARCHAR(512) NOT NULL,
    `ExpiresAt` DATETIME(0) NOT NULL,
    `RevokedAt` DATETIME(0) NULL,
    `ReplacedByToken` VARCHAR(512) NULL,
    `IPAddress` VARCHAR(45) NULL,
    `UserAgent` TEXT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `refreshtokens_UserID_idx`(`UserID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passwordresettokens` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `Token` VARCHAR(512) NOT NULL,
    `ExpiresAt` DATETIME(0) NOT NULL,
    `UsedAt` DATETIME(0) NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `passwordresettokens_UserID_idx`(`UserID`),
    INDEX `passwordresettokens_Token_idx`(`Token`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TenVaiTro` VARCHAR(50) NOT NULL,
    `MoTa` VARCHAR(150) NULL,
    `CreatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `roles_TenVaiTro_key`(`TenVaiTro`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NULL,
    `name` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statushistory` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `EntityType` ENUM('CanHo', 'HopDong', 'YeuCauThue', 'YeuCauSuCo', 'ChuyenNhuong', 'HoaDon') NOT NULL,
    `EntityID` INTEGER NOT NULL,
    `OldStatus` VARCHAR(50) NOT NULL,
    `NewStatus` VARCHAR(50) NOT NULL,
    `ChangedBy` INTEGER NULL,
    `ChangedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `GhiChu` TEXT NULL,

    INDEX `statushistory_ChangedBy_idx`(`ChangedBy`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `systemlogs` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NULL,
    `Action` VARCHAR(100) NOT NULL,
    `EntityType` VARCHAR(50) NULL,
    `EntityID` INTEGER NULL,
    `Description` TEXT NULL,
    `IPAddress` VARCHAR(45) NULL,
    `UserAgent` TEXT NULL,
    `CreatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `level` ENUM('INFO', 'WARN', 'ERROR') NULL DEFAULT 'INFO',

    INDEX `systemlogs_UserID_idx`(`UserID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taisan` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `MaTaiSan` VARCHAR(50) NOT NULL,
    `TenTaiSan` VARCHAR(200) NOT NULL,
    `LoaiTaiSan` ENUM('ThietBiChung', 'ThietBiCanHo', 'NoiThat', 'ThietBiDien', 'CoSoVatChat') NULL DEFAULT 'ThietBiChung',
    `ToaNhaID` INTEGER NULL,
    `CanHoID` INTEGER NULL,
    `ViTri` VARCHAR(255) NULL,
    `SoLuong` INTEGER NULL DEFAULT 1,
    `TinhTrang` ENUM('Tot', 'Hong', 'DangSua', 'Mat', 'Cu') NULL DEFAULT 'Tot',
    `NgayMua` DATE NULL,
    `GiaTri` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `NhaCungCap` VARCHAR(150) NULL,
    `GhiChu` TEXT NULL,
    `is_deleted` TINYINT NULL DEFAULT 0,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `MaTaiSan`(`MaTaiSan`),
    INDEX `CanHoID`(`CanHoID`),
    INDEX `ToaNhaID`(`ToaNhaID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thanhtoan` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `HoaDonID` INTEGER NOT NULL,
    `SoTien` DECIMAL(15, 2) NOT NULL,
    `NgayThanhToan` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `MaGiaoDich` VARCHAR(100) NULL,
    `PhuongThuc` ENUM('ChuyenKhoan', 'TienMat', 'ViDienTu', 'VNPay', 'Momo', 'ZaloPay') NOT NULL,
    `NganHang` VARCHAR(50) NULL,
    `XacNhanBoID` INTEGER NULL,
    `GhiChu` TEXT NULL,

    INDEX `idx_thanhtoan_hoadon`(`HoaDonID`),
    INDEX `idx_thanhtoan_ngay`(`NgayThanhToan`),
    INDEX `thanhtoan_HoaDonID_idx`(`HoaDonID`),
    INDEX `thanhtoan_XacNhanBoID_idx`(`XacNhanBoID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `theguixe` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `MaThe` VARCHAR(50) NOT NULL,
    `NguoiDungID` INTEGER NOT NULL,
    `CanHoID` INTEGER NULL,
    `LoaiThe` ENUM('Thang', 'Ngay', 'Tam') NOT NULL,
    `LoaiXe` ENUM('OTo', 'XeMay') NOT NULL,
    `BienSoXe` VARCHAR(20) NULL,
    `NgayLap` DATE NOT NULL,
    `NgayHetHan` DATE NULL,
    `SoTienDaNop` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `TrangThai` ENUM('Active', 'HetHan', 'MatThe', 'TamKhoa') NULL DEFAULT 'Active',
    `GhiChu` TEXT NULL,
    `is_deleted` TINYINT NULL DEFAULT 0,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `MaThe`(`MaThe`),
    INDEX `CanHoID`(`CanHoID`),
    INDEX `NguoiDungID`(`NguoiDungID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thongbao` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TieuDe` VARCHAR(200) NOT NULL,
    `NoiDung` TEXT NOT NULL,
    `Loai` ENUM('Chung', 'Rieng', 'NhacNo', 'SuCo', 'HopDong') NOT NULL,
    `NguoiGuiID` INTEGER NOT NULL,
    `NgayGui` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `thongbao_NguoiGuiID_idx`(`NguoiGuiID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thongbao_nguoinhan` (
    `ThongBaoID` INTEGER NOT NULL,
    `NguoiNhanID` INTEGER NOT NULL,
    `DaDoc` BOOLEAN NULL DEFAULT false,

    INDEX `thongbao_nguoinhan_NguoiNhanID_idx`(`NguoiNhanID`),
    PRIMARY KEY (`ThongBaoID`, `NguoiNhanID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tienich` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TenTienIch` VARCHAR(100) NOT NULL,
    `MoTa` TEXT NULL,

    UNIQUE INDEX `tienich_TenTienIch_key`(`TenTienIch`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tinnhanchatbot` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `CuocTroChuyenID` INTEGER NOT NULL,
    `LoaiNguoiGui` ENUM('User', 'AI') NOT NULL,
    `NoiDung` TEXT NOT NULL,
    `ThoiGian` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `tinnhanchatbot_CuocTroChuyenID_idx`(`CuocTroChuyenID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tinnhanhethong` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NguoiGuiID` INTEGER NOT NULL,
    `NguoiNhanID` INTEGER NOT NULL,
    `NoiDung` TEXT NOT NULL,
    `ThoiGian` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `DaDoc` BOOLEAN NULL DEFAULT false,

    INDEX `tinnhanhethong_NguoiGuiID_idx`(`NguoiGuiID`),
    INDEX `tinnhanhethong_NguoiNhanID_idx`(`NguoiNhanID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `toanha` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `TenToaNha` VARCHAR(100) NOT NULL,
    `DiaChi` VARCHAR(255) NOT NULL,
    `SoTang` INTEGER NOT NULL,
    `ChuNhaID` INTEGER NOT NULL,
    `NgayTao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `toanha_ChuNhaID_idx`(`ChuNhaID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `yeucaudichvu` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NguoiThueID` INTEGER NOT NULL,
    `DichVuID` INTEGER NOT NULL,
    `CanHoID` INTEGER NOT NULL,
    `NgayYeuCau` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TrangThai` ENUM('ChoXuLy', 'DaXuLy') NULL DEFAULT 'ChoXuLy',
    `GhiChu` TEXT NULL,

    INDEX `yeucaudichvu_CanHoID_idx`(`CanHoID`),
    INDEX `yeucaudichvu_DichVuID_idx`(`DichVuID`),
    INDEX `yeucaudichvu_NguoiThueID_idx`(`NguoiThueID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `yeucausuco` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NguoiThueID` INTEGER NOT NULL,
    `CanHoID` INTEGER NOT NULL,
    `TieuDe` VARCHAR(200) NOT NULL,
    `MoTa` TEXT NOT NULL,
    `DoUuTien` ENUM('Thap', 'Trung', 'Cao') NULL DEFAULT 'Trung',
    `NgayBao` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TrangThai` ENUM('Moi', 'QuanLyDaNhan', 'DangXuLy', 'DaGiaiQuyet') NULL DEFAULT 'Moi',
    `QuanLyNhanID` INTEGER NULL,
    `NhanVienXuLyID` INTEGER NULL,
    `NgayXuLy` DATETIME(0) NULL,
    `KetQua` TEXT NULL,

    INDEX `yeucausuco_CanHoID_idx`(`CanHoID`),
    INDEX `yeucausuco_NguoiThueID_idx`(`NguoiThueID`),
    INDEX `yeucausuco_NhanVienXuLyID_idx`(`NhanVienXuLyID`),
    INDEX `yeucausuco_QuanLyNhanID_idx`(`QuanLyNhanID`),
    INDEX `yeucausuco_TrangThai_idx`(`TrangThai`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `yeucauthue` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NguoiYeuCauID` INTEGER NOT NULL,
    `CanHoID` INTEGER NOT NULL,
    `NgayYeuCau` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `TrangThai` ENUM('ChoKiemTra', 'ChoDuyet', 'DaDuyet', 'TuChoi') NULL DEFAULT 'ChoKiemTra',
    `GhiChu` TEXT NULL,
    `QuanLyKiemTraID` INTEGER NULL,
    `ChuNhaDuyetID` INTEGER NULL,

    INDEX `yeucauthue_CanHoID_idx`(`CanHoID`),
    INDEX `yeucauthue_ChuNhaDuyetID_idx`(`ChuNhaDuyetID`),
    INDEX `yeucauthue_NguoiYeuCauID_idx`(`NguoiYeuCauID`),
    INDEX `yeucauthue_QuanLyKiemTraID_idx`(`QuanLyKiemTraID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `canho` ADD CONSTRAINT `canho_ChuNhaID_fkey` FOREIGN KEY (`ChuNhaID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `canho` ADD CONSTRAINT `canho_ToaNhaID_fkey` FOREIGN KEY (`ToaNhaID`) REFERENCES `toanha`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `canho_tienich` ADD CONSTRAINT `canho_tienich_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `canho_tienich` ADD CONSTRAINT `canho_tienich_TienIchID_fkey` FOREIGN KEY (`TienIchID`) REFERENCES `tienich`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chisodiennuoc` ADD CONSTRAINT `chisodiennuoc_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chisodiennuoc` ADD CONSTRAINT `chisodiennuoc_NguoiGhiID_fkey` FOREIGN KEY (`NguoiGhiID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_ChuNhaDuyetID_fkey` FOREIGN KEY (`ChuNhaDuyetID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_HopDongID_fkey` FOREIGN KEY (`HopDongID`) REFERENCES `hopdong`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_NewHopDongID_fkey` FOREIGN KEY (`NewHopDongID`) REFERENCES `hopdong`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_NguoiThueCuID_fkey` FOREIGN KEY (`NguoiThueCuID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_NguoiThueMoiID_fkey` FOREIGN KEY (`NguoiThueMoiID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chuyennhuong` ADD CONSTRAINT `chuyennhuong_QuanLyDuyetID_fkey` FOREIGN KEY (`QuanLyDuyetID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cuoctrochuyen` ADD CONSTRAINT `cuoctrochuyen_NguoiDungID_fkey` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hoadon` ADD CONSTRAINT `hoadon_HopDongID_fkey` FOREIGN KEY (`HopDongID`) REFERENCES `hopdong`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hoadonchitiet` ADD CONSTRAINT `hoadonchitiet_HoaDonID_fkey` FOREIGN KEY (`HoaDonID`) REFERENCES `hoadon`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hopdong` ADD CONSTRAINT `hopdong_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hopdong` ADD CONSTRAINT `hopdong_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hopdong` ADD CONSTRAINT `hopdong_YeuCauThueID_fkey` FOREIGN KEY (`YeuCauThueID`) REFERENCES `yeucauthue`(`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_UploadedBy_fkey` FOREIGN KEY (`UploadedBy`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nguoidung` ADD CONSTRAINT `fk_nguoidung_roles` FOREIGN KEY (`RoleID`) REFERENCES `roles`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refreshtokens` ADD CONSTRAINT `refreshtokens_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `nguoidung`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passwordresettokens` ADD CONSTRAINT `passwordresettokens_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `nguoidung`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statushistory` ADD CONSTRAINT `statushistory_ChangedBy_fkey` FOREIGN KEY (`ChangedBy`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `systemlogs` ADD CONSTRAINT `systemlogs_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taisan` ADD CONSTRAINT `fk_taisan_canho` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taisan` ADD CONSTRAINT `fk_taisan_toanha` FOREIGN KEY (`ToaNhaID`) REFERENCES `toanha`(`ID`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `thanhtoan` ADD CONSTRAINT `thanhtoan_HoaDonID_fkey` FOREIGN KEY (`HoaDonID`) REFERENCES `hoadon`(`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thanhtoan` ADD CONSTRAINT `thanhtoan_XacNhanBoID_fkey` FOREIGN KEY (`XacNhanBoID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `theguixe` ADD CONSTRAINT `fk_theguixe_canho` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `theguixe` ADD CONSTRAINT `fk_theguixe_user` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `thongbao` ADD CONSTRAINT `thongbao_NguoiGuiID_fkey` FOREIGN KEY (`NguoiGuiID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thongbao_nguoinhan` ADD CONSTRAINT `thongbao_nguoinhan_NguoiNhanID_fkey` FOREIGN KEY (`NguoiNhanID`) REFERENCES `nguoidung`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thongbao_nguoinhan` ADD CONSTRAINT `thongbao_nguoinhan_ThongBaoID_fkey` FOREIGN KEY (`ThongBaoID`) REFERENCES `thongbao`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tinnhanchatbot` ADD CONSTRAINT `tinnhanchatbot_CuocTroChuyenID_fkey` FOREIGN KEY (`CuocTroChuyenID`) REFERENCES `cuoctrochuyen`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tinnhanhethong` ADD CONSTRAINT `tinnhanhethong_NguoiGuiID_fkey` FOREIGN KEY (`NguoiGuiID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tinnhanhethong` ADD CONSTRAINT `tinnhanhethong_NguoiNhanID_fkey` FOREIGN KEY (`NguoiNhanID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `toanha` ADD CONSTRAINT `toanha_ChuNhaID_fkey` FOREIGN KEY (`ChuNhaID`) REFERENCES `nguoidung`(`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucaudichvu` ADD CONSTRAINT `yeucaudichvu_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucaudichvu` ADD CONSTRAINT `yeucaudichvu_DichVuID_fkey` FOREIGN KEY (`DichVuID`) REFERENCES `dichvu`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucaudichvu` ADD CONSTRAINT `yeucaudichvu_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucausuco` ADD CONSTRAINT `yeucausuco_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucausuco` ADD CONSTRAINT `yeucausuco_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucausuco` ADD CONSTRAINT `yeucausuco_NhanVienXuLyID_fkey` FOREIGN KEY (`NhanVienXuLyID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucausuco` ADD CONSTRAINT `yeucausuco_QuanLyNhanID_fkey` FOREIGN KEY (`QuanLyNhanID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucauthue` ADD CONSTRAINT `yeucauthue_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucauthue` ADD CONSTRAINT `yeucauthue_ChuNhaDuyetID_fkey` FOREIGN KEY (`ChuNhaDuyetID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucauthue` ADD CONSTRAINT `yeucauthue_NguoiYeuCauID_fkey` FOREIGN KEY (`NguoiYeuCauID`) REFERENCES `nguoidung`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `yeucauthue` ADD CONSTRAINT `yeucauthue_QuanLyKiemTraID_fkey` FOREIGN KEY (`QuanLyKiemTraID`) REFERENCES `nguoidung`(`ID`) ON DELETE SET NULL ON UPDATE CASCADE;
