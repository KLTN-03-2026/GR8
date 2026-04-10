/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: canho
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `canho` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MaCanHo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ToaNhaID` int DEFAULT NULL,
  `Tang` int NOT NULL,
  `SoPhong` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DienTich` decimal(10, 2) DEFAULT NULL,
  `GiaThue` decimal(15, 2) NOT NULL,
  `TienCoc` decimal(15, 2) NOT NULL,
  `TrangThai` enum('Trong', 'DaThue', 'BaoTri', 'DangDon') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Trong',
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ChuNhaID` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `canho_MaCanHo_key` (`MaCanHo`),
  KEY `canho_TrangThai_idx` (`TrangThai`),
  KEY `canho_ToaNhaID_idx` (`ToaNhaID`),
  KEY `canho_ChuNhaID_idx` (`ChuNhaID`),
  KEY `idx_canho_trangthai` (`TrangThai`),
  CONSTRAINT `canho_ChuNhaID_fkey` FOREIGN KEY (`ChuNhaID`) REFERENCES `nguoidung` (`ID`),
  CONSTRAINT `canho_ToaNhaID_fkey` FOREIGN KEY (`ToaNhaID`) REFERENCES `toanha` (`ID`)
) ENGINE = InnoDB AUTO_INCREMENT = 11 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: canho_tienich
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `canho_tienich` (
  `CanHoID` int NOT NULL,
  `TienIchID` int NOT NULL,
  PRIMARY KEY (`CanHoID`, `TienIchID`),
  KEY `canho_tienich_TienIchID_fkey` (`TienIchID`),
  CONSTRAINT `canho_tienich_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `canho_tienich_TienIchID_fkey` FOREIGN KEY (`TienIchID`) REFERENCES `tienich` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: chisodiennuoc
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chisodiennuoc` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CanHoID` int NOT NULL,
  `ThangNam` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYY-MM',
  `ChiSoDienCu` decimal(10, 2) DEFAULT '0.00',
  `ChiSoDienMoi` decimal(10, 2) NOT NULL,
  `ChiSoNuocCu` decimal(10, 2) DEFAULT '0.00',
  `ChiSoNuocMoi` decimal(10, 2) NOT NULL,
  `NgayGhi` datetime DEFAULT CURRENT_TIMESTAMP,
  `NguoiGhiID` int DEFAULT NULL,
  `thang_nam_date` date DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `chisodiennuoc_CanHoID_idx` (`CanHoID`),
  KEY `chisodiennuoc_NguoiGhiID_idx` (`NguoiGhiID`),
  KEY `idx_chisodiennuoc_thang` (`ThangNam`),
  CONSTRAINT `chisodiennuoc_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chisodiennuoc_NguoiGhiID_fkey` FOREIGN KEY (`NguoiGhiID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: chuyennhuong
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chuyennhuong` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `HopDongID` int NOT NULL,
  `NguoiThueCuID` int NOT NULL,
  `NguoiThueMoiID` int NOT NULL,
  `NgayYeuCau` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('ChoDuyet', 'DaDuyet', 'TuChoi') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ChoDuyet',
  `QuanLyDuyetID` int DEFAULT NULL,
  `ChuNhaDuyetID` int DEFAULT NULL,
  `NewHopDongID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `chuyennhuong_HopDongID_idx` (`HopDongID`),
  KEY `chuyennhuong_NguoiThueCuID_idx` (`NguoiThueCuID`),
  KEY `chuyennhuong_NguoiThueMoiID_idx` (`NguoiThueMoiID`),
  KEY `chuyennhuong_QuanLyDuyetID_idx` (`QuanLyDuyetID`),
  KEY `chuyennhuong_ChuNhaDuyetID_idx` (`ChuNhaDuyetID`),
  KEY `chuyennhuong_NewHopDongID_idx` (`NewHopDongID`),
  CONSTRAINT `chuyennhuong_ChuNhaDuyetID_fkey` FOREIGN KEY (`ChuNhaDuyetID`) REFERENCES `nguoidung` (`ID`),
  CONSTRAINT `chuyennhuong_HopDongID_fkey` FOREIGN KEY (`HopDongID`) REFERENCES `hopdong` (`ID`),
  CONSTRAINT `chuyennhuong_NewHopDongID_fkey` FOREIGN KEY (`NewHopDongID`) REFERENCES `hopdong` (`ID`),
  CONSTRAINT `chuyennhuong_NguoiThueCuID_fkey` FOREIGN KEY (`NguoiThueCuID`) REFERENCES `nguoidung` (`ID`),
  CONSTRAINT `chuyennhuong_NguoiThueMoiID_fkey` FOREIGN KEY (`NguoiThueMoiID`) REFERENCES `nguoidung` (`ID`),
  CONSTRAINT `chuyennhuong_QuanLyDuyetID_fkey` FOREIGN KEY (`QuanLyDuyetID`) REFERENCES `nguoidung` (`ID`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: cuoctrochuyen
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cuoctrochuyen` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NguoiDungID` int NOT NULL,
  `SessionID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayBatDau` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `cuoctrochuyen_SessionID_key` (`SessionID`),
  KEY `cuoctrochuyen_NguoiDungID_idx` (`NguoiDungID`),
  CONSTRAINT `cuoctrochuyen_NguoiDungID_fkey` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`ID`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: dichvu
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `dichvu` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TenDichVu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Gia` decimal(12, 2) NOT NULL,
  `TrangThai` enum('Active', 'Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  PRIMARY KEY (`ID`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hoadon
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hoadon` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `HopDongID` int NOT NULL,
  `ThangNam` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayLap` date NOT NULL,
  `NgayDenHan` date NOT NULL,
  `TongTien` decimal(15, 2) NOT NULL,
  `TrangThai` enum('ChuaTT', 'DaTT', 'QuaHan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ChuaTT',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `thang_nam_date` date DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `hoadon_TrangThai_idx` (`TrangThai`),
  KEY `hoadon_HopDongID_idx` (`HopDongID`),
  KEY `idx_hoadon_thangnam` (`ThangNam`),
  CONSTRAINT `hoadon_HopDongID_fkey` FOREIGN KEY (`HopDongID`) REFERENCES `hopdong` (`ID`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hoadonchitiet
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hoadonchitiet` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `HoaDonID` int NOT NULL,
  `Loai` enum('TienThue', 'Dien', 'Nuoc', 'DichVu', 'Phat') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoTien` decimal(15, 2) NOT NULL,
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `hoadonchitiet_HoaDonID_idx` (`HoaDonID`),
  CONSTRAINT `hoadonchitiet_HoaDonID_fkey` FOREIGN KEY (`HoaDonID`) REFERENCES `hoadon` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hopdong
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hopdong` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `YeuCauThueID` int DEFAULT NULL,
  `CanHoID` int NOT NULL,
  `NguoiThueID` int NOT NULL,
  `NgayBatDau` date NOT NULL,
  `NgayKetThuc` date NOT NULL,
  `GiaThue` decimal(15, 2) NOT NULL,
  `TienCoc` decimal(15, 2) NOT NULL,
  `TienCocDaNhan` decimal(15, 2) DEFAULT '0.00',
  `TrangThai` enum(
  'ChoKy',
  'DaKy',
  'DangThue',
  'HetHan',
  'ChuyenNhuong',
  'DaChuyenNhuong',
  'KetThuc'
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ChoKy',
  `NgayKy` date DEFAULT NULL,
  `FileHopDong` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `hopdong_TrangThai_idx` (`TrangThai`),
  KEY `hopdong_YeuCauThueID_idx` (`YeuCauThueID`),
  KEY `hopdong_CanHoID_idx` (`CanHoID`),
  KEY `hopdong_NguoiThueID_idx` (`NguoiThueID`),
  KEY `idx_hopdong_canho` (`CanHoID`),
  CONSTRAINT `hopdong_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`),
  CONSTRAINT `hopdong_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung` (`ID`),
  CONSTRAINT `hopdong_YeuCauThueID_fkey` FOREIGN KEY (`YeuCauThueID`) REFERENCES `yeucauthue` (`ID`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: media
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `media` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LoaiEntity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EntityID` int NOT NULL,
  `FileURL` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LoaiFile` enum('image', 'video', 'pdf') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'image',
  `NgayUpload` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UploadedBy` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `media_UploadedBy_idx` (`UploadedBy`),
  CONSTRAINT `media_UploadedBy_fkey` FOREIGN KEY (`UploadedBy`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: nguoidung
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `nguoidung` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `MatKhau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'bcrypt hash',
  `RoleID` int DEFAULT NULL,
  `HoTen` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoDienThoai` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CCCD` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `DiaChi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GioiTinh` enum('Nam', 'Nu', 'Khac') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayTao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('Active', 'Inactive', 'Locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `LoaiGiayTo` enum('CCCD', 'Passport') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'CCCD',
  `NgayHetHanGiayTo` date DEFAULT NULL,
  `NgayHetHanVisa` date DEFAULT NULL,
  `QuocTich` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SoGiayTo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VisaType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nguoidung_TenDangNhap_key` (`TenDangNhap`),
  UNIQUE KEY `nguoidung_Email_key` (`Email`),
  UNIQUE KEY `nguoidung_SoDienThoai_key` (`SoDienThoai`),
  UNIQUE KEY `nguoidung_CCCD_key` (`CCCD`),
  UNIQUE KEY `nguoidung_SoGiayTo_key` (`SoGiayTo`),
  KEY `nguoidung_SoGiayTo_idx` (`SoGiayTo`),
  KEY `nguoidung_QuocTich_idx` (`QuocTich`),
  KEY `idx_nguoidung_email` (`Email`),
  KEY `fk_nguoidung_roles` (`RoleID`),
  CONSTRAINT `fk_nguoidung_roles` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: refreshtokens
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `refreshtokens` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `RevokedAt` datetime DEFAULT NULL,
  `ReplacedByToken` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IPAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `refreshtokens_UserID_idx` (`UserID`),
  CONSTRAINT `refreshtokens_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `nguoidung` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: roles
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roles` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TenVaiTro` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `roles_TenVaiTro_key` (`TenVaiTro`)
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: status
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: statushistory
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `statushistory` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EntityType` enum(
  'CanHo',
  'HopDong',
  'YeuCauThue',
  'YeuCauSuCo',
  'ChuyenNhuong',
  'HoaDon'
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `EntityID` int NOT NULL,
  `OldStatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NewStatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ChangedBy` int DEFAULT NULL,
  `ChangedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `statushistory_ChangedBy_idx` (`ChangedBy`),
  CONSTRAINT `statushistory_ChangedBy_fkey` FOREIGN KEY (`ChangedBy`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: systemlogs
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `systemlogs` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `EntityType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EntityID` int DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `IPAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `level` enum('INFO', 'WARN', 'ERROR') COLLATE utf8mb4_unicode_ci DEFAULT 'INFO',
  PRIMARY KEY (`ID`),
  KEY `systemlogs_UserID_idx` (`UserID`),
  CONSTRAINT `systemlogs_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: taisan
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `taisan` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MaTaiSan` varchar(50) NOT NULL,
  `TenTaiSan` varchar(200) NOT NULL,
  `LoaiTaiSan` enum(
  'ThietBiChung',
  'ThietBiCanHo',
  'NoiThat',
  'ThietBiDien',
  'CoSoVatChat'
  ) DEFAULT 'ThietBiChung',
  `ToaNhaID` int DEFAULT NULL,
  `CanHoID` int DEFAULT NULL,
  `ViTri` varchar(255) DEFAULT NULL,
  `SoLuong` int DEFAULT '1',
  `TinhTrang` enum('Tot', 'Hong', 'DangSua', 'Mat', 'Cu') DEFAULT 'Tot',
  `NgayMua` date DEFAULT NULL,
  `GiaTri` decimal(15, 2) DEFAULT '0.00',
  `NhaCungCap` varchar(150) DEFAULT NULL,
  `GhiChu` text,
  `is_deleted` tinyint DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MaTaiSan` (`MaTaiSan`),
  KEY `ToaNhaID` (`ToaNhaID`),
  KEY `CanHoID` (`CanHoID`),
  CONSTRAINT `fk_taisan_canho` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE
  SET
  NULL,
  CONSTRAINT `fk_taisan_toanha` FOREIGN KEY (`ToaNhaID`) REFERENCES `toanha` (`ID`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: thanhtoan
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `thanhtoan` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `HoaDonID` int NOT NULL,
  `SoTien` decimal(15, 2) NOT NULL,
  `NgayThanhToan` datetime DEFAULT CURRENT_TIMESTAMP,
  `MaGiaoDich` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhuongThuc` enum(
  'ChuyenKhoan',
  'TienMat',
  'ViDienTu',
  'VNPay',
  'Momo',
  'ZaloPay'
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NganHang` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `XacNhanBoID` int DEFAULT NULL,
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `thanhtoan_HoaDonID_idx` (`HoaDonID`),
  KEY `thanhtoan_XacNhanBoID_idx` (`XacNhanBoID`),
  KEY `idx_thanhtoan_ngay` (`NgayThanhToan`),
  KEY `idx_thanhtoan_hoadon` (`HoaDonID`),
  CONSTRAINT `thanhtoan_HoaDonID_fkey` FOREIGN KEY (`HoaDonID`) REFERENCES `hoadon` (`ID`) ON UPDATE CASCADE,
  CONSTRAINT `thanhtoan_XacNhanBoID_fkey` FOREIGN KEY (`XacNhanBoID`) REFERENCES `nguoidung` (`ID`) ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: theguixe
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `theguixe` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MaThe` varchar(50) NOT NULL,
  `NguoiDungID` int NOT NULL,
  `CanHoID` int DEFAULT NULL,
  `LoaiThe` enum('Thang', 'Ngay', 'Tam') NOT NULL,
  `LoaiXe` enum('OTo', 'XeMay') NOT NULL,
  `BienSoXe` varchar(20) DEFAULT NULL,
  `NgayLap` date NOT NULL,
  `NgayHetHan` date DEFAULT NULL,
  `SoTienDaNop` decimal(12, 2) DEFAULT '0.00',
  `TrangThai` enum('Active', 'HetHan', 'MatThe', 'TamKhoa') DEFAULT 'Active',
  `GhiChu` text,
  `is_deleted` tinyint DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MaThe` (`MaThe`),
  KEY `NguoiDungID` (`NguoiDungID`),
  KEY `CanHoID` (`CanHoID`),
  CONSTRAINT `fk_theguixe_canho` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE
  SET
  NULL,
  CONSTRAINT `fk_theguixe_user` FOREIGN KEY (`NguoiDungID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: thongbao
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `thongbao` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TieuDe` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NoiDung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Loai` enum('Chung', 'Rieng', 'NhacNo', 'SuCo', 'HopDong') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NguoiGuiID` int NOT NULL,
  `NgayGui` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `thongbao_NguoiGuiID_idx` (`NguoiGuiID`),
  CONSTRAINT `thongbao_NguoiGuiID_fkey` FOREIGN KEY (`NguoiGuiID`) REFERENCES `nguoidung` (`ID`) ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: thongbao_nguoinhan
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `thongbao_nguoinhan` (
  `ThongBaoID` int NOT NULL,
  `NguoiNhanID` int NOT NULL,
  `DaDoc` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ThongBaoID`, `NguoiNhanID`),
  KEY `thongbao_nguoinhan_NguoiNhanID_idx` (`NguoiNhanID`),
  CONSTRAINT `thongbao_nguoinhan_NguoiNhanID_fkey` FOREIGN KEY (`NguoiNhanID`) REFERENCES `nguoidung` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `thongbao_nguoinhan_ThongBaoID_fkey` FOREIGN KEY (`ThongBaoID`) REFERENCES `thongbao` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tienich
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tienich` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TenTienIch` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `tienich_TenTienIch_key` (`TenTienIch`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tinnhanchatbot
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tinnhanchatbot` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CuocTroChuyenID` int NOT NULL,
  `LoaiNguoiGui` enum('User', 'AI') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `NoiDung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ThoiGian` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `tinnhanchatbot_CuocTroChuyenID_idx` (`CuocTroChuyenID`),
  CONSTRAINT `tinnhanchatbot_CuocTroChuyenID_fkey` FOREIGN KEY (`CuocTroChuyenID`) REFERENCES `cuoctrochuyen` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tinnhanhethong
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tinnhanhethong` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NguoiGuiID` int NOT NULL,
  `NguoiNhanID` int NOT NULL,
  `NoiDung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ThoiGian` datetime DEFAULT CURRENT_TIMESTAMP,
  `DaDoc` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `tinnhanhethong_NguoiGuiID_idx` (`NguoiGuiID`),
  KEY `tinnhanhethong_NguoiNhanID_idx` (`NguoiNhanID`),
  CONSTRAINT `tinnhanhethong_NguoiGuiID_fkey` FOREIGN KEY (`NguoiGuiID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `tinnhanhethong_NguoiNhanID_fkey` FOREIGN KEY (`NguoiNhanID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: toanha
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `toanha` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TenToaNha` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DiaChi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoTang` int NOT NULL,
  `ChuNhaID` int NOT NULL,
  `NgayTao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `toanha_ChuNhaID_idx` (`ChuNhaID`),
  CONSTRAINT `toanha_ChuNhaID_fkey` FOREIGN KEY (`ChuNhaID`) REFERENCES `nguoidung` (`ID`) ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: yeucaudichvu
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `yeucaudichvu` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NguoiThueID` int NOT NULL,
  `DichVuID` int NOT NULL,
  `CanHoID` int NOT NULL,
  `NgayYeuCau` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('ChoXuLy', 'DaXuLy') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ChoXuLy',
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `yeucaudichvu_NguoiThueID_idx` (`NguoiThueID`),
  KEY `yeucaudichvu_DichVuID_idx` (`DichVuID`),
  KEY `yeucaudichvu_CanHoID_idx` (`CanHoID`),
  CONSTRAINT `yeucaudichvu_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucaudichvu_DichVuID_fkey` FOREIGN KEY (`DichVuID`) REFERENCES `dichvu` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucaudichvu_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: yeucausuco
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `yeucausuco` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NguoiThueID` int NOT NULL,
  `CanHoID` int NOT NULL,
  `TieuDe` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DoUuTien` enum('Thap', 'Trung', 'Cao') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Trung',
  `NgayBao` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('Moi', 'QuanLyDaNhan', 'DangXuLy', 'DaGiaiQuyet') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Moi',
  `QuanLyNhanID` int DEFAULT NULL,
  `NhanVienXuLyID` int DEFAULT NULL,
  `NgayXuLy` datetime DEFAULT NULL,
  `KetQua` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `yeucausuco_TrangThai_idx` (`TrangThai`),
  KEY `yeucausuco_NguoiThueID_idx` (`NguoiThueID`),
  KEY `yeucausuco_CanHoID_idx` (`CanHoID`),
  KEY `yeucausuco_QuanLyNhanID_idx` (`QuanLyNhanID`),
  KEY `yeucausuco_NhanVienXuLyID_idx` (`NhanVienXuLyID`),
  CONSTRAINT `yeucausuco_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucausuco_NguoiThueID_fkey` FOREIGN KEY (`NguoiThueID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucausuco_NhanVienXuLyID_fkey` FOREIGN KEY (`NhanVienXuLyID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `yeucausuco_QuanLyNhanID_fkey` FOREIGN KEY (`QuanLyNhanID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: yeucauthue
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `yeucauthue` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NguoiYeuCauID` int NOT NULL,
  `CanHoID` int NOT NULL,
  `NgayYeuCau` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('ChoKiemTra', 'ChoDuyet', 'DaDuyet', 'TuChoi') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ChoKiemTra',
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `QuanLyKiemTraID` int DEFAULT NULL,
  `ChuNhaDuyetID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `yeucauthue_NguoiYeuCauID_idx` (`NguoiYeuCauID`),
  KEY `yeucauthue_CanHoID_idx` (`CanHoID`),
  KEY `yeucauthue_QuanLyKiemTraID_idx` (`QuanLyKiemTraID`),
  KEY `yeucauthue_ChuNhaDuyetID_idx` (`ChuNhaDuyetID`),
  CONSTRAINT `yeucauthue_CanHoID_fkey` FOREIGN KEY (`CanHoID`) REFERENCES `canho` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucauthue_ChuNhaDuyetID_fkey` FOREIGN KEY (`ChuNhaDuyetID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `yeucauthue_NguoiYeuCauID_fkey` FOREIGN KEY (`NguoiYeuCauID`) REFERENCES `nguoidung` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `yeucauthue_QuanLyKiemTraID_fkey` FOREIGN KEY (`QuanLyKiemTraID`) REFERENCES `nguoidung` (`ID`) ON DELETE
  SET
  NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: canho
# ------------------------------------------------------------

INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    1,
    'A101',
    NULL,
    1,
    '01',
    35.50,
    4500000.00,
    9000000.00,
    'Trong',
    'Phòng studio thoáng mát, gần thang máy',
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    2,
    'A102',
    NULL,
    1,
    '02',
    40.00,
    5000000.00,
    10000000.00,
    'DaThue',
    'Phòng 1 ngủ có ban công',
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    3,
    'B201',
    NULL,
    2,
    '01',
    28.00,
    3800000.00,
    7600000.00,
    'Trong',
    'Phòng nhỏ gọn, phù hợp sinh viên',
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    4,
    'C301',
    NULL,
    3,
    '01',
    50.00,
    6500000.00,
    13000000.00,
    'Trong',
    'Căn hộ 2 phòng ngủ rộng rãi',
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    5,
    'A01',
    1,
    12,
    '15',
    21.00,
    123456.00,
    0.00,
    'Trong',
    NULL,
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    6,
    'A02',
    1,
    12,
    '16',
    20000.00,
    2000000.00,
    0.00,
    'Trong',
    NULL,
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `canho` (
    `ID`,
    `MaCanHo`,
    `ToaNhaID`,
    `Tang`,
    `SoPhong`,
    `DienTich`,
    `GiaThue`,
    `TienCoc`,
    `TrangThai`,
    `MoTa`,
    `ChuNhaID`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    10,
    'a03',
    1,
    12,
    '15',
    2000.00,
    15.00,
    0.00,
    'Trong',
    NULL,
    1,
    '2026-04-10 06:22:54',
    0,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: canho_tienich
# ------------------------------------------------------------

INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (1, 1);
INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (2, 1);
INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (1, 2);
INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (2, 2);
INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (1, 4);
INSERT INTO
  `canho_tienich` (`CanHoID`, `TienIchID`)
VALUES
  (2, 4);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: chisodiennuoc
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: chuyennhuong
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: cuoctrochuyen
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: dichvu
# ------------------------------------------------------------

INSERT INTO
  `dichvu` (`ID`, `TenDichVu`, `MoTa`, `Gia`, `TrangThai`)
VALUES
  (
    1,
    'Dọn phòng',
    'Dọn dẹp phòng hàng tuần',
    150000.00,
    'Active'
  );
INSERT INTO
  `dichvu` (`ID`, `TenDichVu`, `MoTa`, `Gia`, `TrangThai`)
VALUES
  (2, 'Giặt đồ', 'Giặt và là đồ', 50000.00, 'Active');
INSERT INTO
  `dichvu` (`ID`, `TenDichVu`, `MoTa`, `Gia`, `TrangThai`)
VALUES
  (
    3,
    'Gửi xe máy',
    'Gửi xe máy cả tháng',
    200000.00,
    'Active'
  );
INSERT INTO
  `dichvu` (`ID`, `TenDichVu`, `MoTa`, `Gia`, `TrangThai`)
VALUES
  (
    4,
    'Internet',
    'Wifi tốc độ cao 100Mbps',
    150000.00,
    'Active'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hoadon
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hoadonchitiet
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hopdong
# ------------------------------------------------------------

INSERT INTO
  `hopdong` (
    `ID`,
    `YeuCauThueID`,
    `CanHoID`,
    `NguoiThueID`,
    `NgayBatDau`,
    `NgayKetThuc`,
    `GiaThue`,
    `TienCoc`,
    `TienCocDaNhan`,
    `TrangThai`,
    `NgayKy`,
    `FileHopDong`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    1,
    NULL,
    2,
    3,
    '2026-03-01',
    '2027-02-28',
    5000000.00,
    10000000.00,
    0.00,
    'DangThue',
    '2026-02-25',
    NULL,
    '2026-04-10 06:22:54',
    0,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: media
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: nguoidung
# ------------------------------------------------------------

INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    1,
    'chuhouse',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    3,
    'Nguyễn Văn Chủ',
    'chuhouse@gmail.com',
    '0912345678',
    '012345678901',
    '1985-03-15',
    'Đà Nẵng',
    NULL,
    'Nam',
    '2026-03-24 10:39:37',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 15:19:10',
    0,
    NULL
  );
INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    2,
    'quanly01',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    'Trần Thị Quản',
    'quanly01@gmail.com',
    '0987654321',
    '098765432109',
    '1992-07-20',
    'Đà Nẵng',
    NULL,
    'Nu',
    '2026-03-24 10:39:37',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 15:19:10',
    0,
    NULL
  );
INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    3,
    'thue01',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    2,
    'Lê Văn Thuê',
    'thue01@gmail.com',
    '0901234567',
    '001122334455',
    '1998-11-05',
    'Quận Hải Châu, Đà Nẵng',
    NULL,
    'Nam',
    '2026-03-24 10:39:37',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 15:19:10',
    0,
    NULL
  );
INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    4,
    'thue02',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    2,
    'Phạm Thị Lan',
    'thue02@gmail.com',
    '0933456789',
    '556677889900',
    '2000-04-12',
    'Quận Thanh Khê, Đà Nẵng',
    NULL,
    'Nu',
    '2026-03-24 10:39:37',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 15:19:10',
    0,
    NULL
  );
INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    5,
    'chuhouse1',
    '$2b$10$examplehash',
    NULL,
    'Nguyễn Văn Chủ',
    'chunha@example.com',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-03 09:22:07',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 06:22:54',
    0,
    NULL
  );
INSERT INTO
  `nguoidung` (
    `ID`,
    `TenDangNhap`,
    `MatKhau`,
    `RoleID`,
    `HoTen`,
    `Email`,
    `SoDienThoai`,
    `CCCD`,
    `NgaySinh`,
    `DiaChi`,
    `Avatar`,
    `GioiTinh`,
    `NgayTao`,
    `TrangThai`,
    `LoaiGiayTo`,
    `NgayHetHanGiayTo`,
    `NgayHetHanVisa`,
    `QuocTich`,
    `SoGiayTo`,
    `VisaType`,
    `updated_at`,
    `is_deleted`,
    `deleted_at`
  )
VALUES
  (
    7,
    'binhdz',
    '$2b$10$FcGQbb6YZeJcCutgpuTcS.VbCfhPN3Xt5WaGwsczq6ScsDO4OunR.',
    NULL,
    'Nguyen Van A',
    'nbinh@gmail.com',
    '0357877087',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 16:22:50',
    'Active',
    'CCCD',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-04-10 16:22:50',
    0,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: refreshtokens
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: roles
# ------------------------------------------------------------

INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (
    1,
    'QuanLy',
    'Quản lý hệ thống',
    '2026-03-24 09:57:08'
  );
INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (
    2,
    'NguoiThue',
    'Người thuê nhà',
    '2026-03-24 09:57:08'
  );
INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (3, 'ChuNha', 'Chủ nhà', '2026-03-24 09:57:08');
INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (
    4,
    'NhanVienKyThuat',
    'Nhân viên kỹ thuật',
    '2026-03-24 09:57:08'
  );
INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (5, 'KeToan', 'Kế toán', '2026-03-24 09:57:08');
INSERT INTO
  `roles` (`ID`, `TenVaiTro`, `MoTa`, `CreatedAt`)
VALUES
  (
    6,
    'KhachVangLai',
    'Khách vãng lai',
    '2026-03-24 09:57:08'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: status
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: statushistory
# ------------------------------------------------------------

INSERT INTO
  `statushistory` (
    `ID`,
    `EntityType`,
    `EntityID`,
    `OldStatus`,
    `NewStatus`,
    `ChangedBy`,
    `ChangedAt`,
    `GhiChu`
  )
VALUES
  (
    1,
    'CanHo',
    2,
    'Trong',
    'DaThue',
    2,
    '2026-03-24 17:39:37',
    'Duyệt hợp đồng thành công'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: systemlogs
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: taisan
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: thanhtoan
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: theguixe
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: thongbao
# ------------------------------------------------------------

INSERT INTO
  `thongbao` (
    `ID`,
    `TieuDe`,
    `NoiDung`,
    `Loai`,
    `NguoiGuiID`,
    `NgayGui`
  )
VALUES
  (
    1,
    'Thông báo phí điện nước tháng 3',
    'Vui lòng thanh toán phí điện nước tháng 3 trước ngày 10/04/2026',
    'NhacNo',
    2,
    '2026-03-24 17:39:37'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: thongbao_nguoinhan
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tienich
# ------------------------------------------------------------

INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (1, 'Điều hòa', 'Máy lạnh 2 chiều');
INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (2, 'Tủ lạnh', 'Tủ lạnh mini');
INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (3, 'Máy giặt', 'Máy giặt chung tầng');
INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (4, 'Wifi', 'Internet tốc độ cao');
INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (5, 'Bếp điện', 'Bếp từ + lò vi sóng');
INSERT INTO
  `tienich` (`ID`, `TenTienIch`, `MoTa`)
VALUES
  (6, 'Ban công', 'Có view đẹp');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tinnhanchatbot
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tinnhanhethong
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: toanha
# ------------------------------------------------------------

INSERT INTO
  `toanha` (
    `ID`,
    `TenToaNha`,
    `DiaChi`,
    `SoTang`,
    `ChuNhaID`,
    `NgayTao`
  )
VALUES
  (
    1,
    'Tòa Nhà Sunrise',
    '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    25,
    1,
    '2026-04-03 09:22:07'
  );
INSERT INTO
  `toanha` (
    `ID`,
    `TenToaNha`,
    `DiaChi`,
    `SoTang`,
    `ChuNhaID`,
    `NgayTao`
  )
VALUES
  (
    2,
    'Tòa Nhà Moonlight',
    '456 Lê Duẩn, Thanh Khê, Đà Nẵng',
    18,
    1,
    '2026-04-03 09:22:07'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: yeucaudichvu
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: yeucausuco
# ------------------------------------------------------------

INSERT INTO
  `yeucausuco` (
    `ID`,
    `NguoiThueID`,
    `CanHoID`,
    `TieuDe`,
    `MoTa`,
    `DoUuTien`,
    `NgayBao`,
    `TrangThai`,
    `QuanLyNhanID`,
    `NhanVienXuLyID`,
    `NgayXuLy`,
    `KetQua`
  )
VALUES
  (
    1,
    3,
    2,
    'Máy lạnh bị hỏng',
    'Máy lạnh không mát, có tiếng kêu lạ',
    'Cao',
    '2026-03-24 17:39:37',
    'Moi',
    NULL,
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: yeucauthue
# ------------------------------------------------------------


/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
