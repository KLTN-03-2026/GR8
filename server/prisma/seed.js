import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const HASHED_PW = await bcrypt.hash("123456", 10); // All test accounts use 123456

async function main() {
  console.log("Start FULL REALISTIC seed...");

  // ========================================
  // CLEAR ALL
  // ========================================
  await prisma.thongbao_nguoinhan.deleteMany();
  await prisma.thongbao.deleteMany();
  await prisma.thanhtoan.deleteMany();
  await prisma.hoadonchitiet.deleteMany();
  await prisma.hoadon.deleteMany();
  await prisma.yeucausuco.deleteMany();
  await prisma.yeucaudichvu.deleteMany();
  await prisma.chisodiennuoc.deleteMany();
  await prisma.canho_tienich.deleteMany();
  await prisma.tienich.deleteMany();
  await prisma.taisan.deleteMany();
  await prisma.theguixe.deleteMany();
  await prisma.hopdong.deleteMany();
  await prisma.yeucauthue.deleteMany();
  await prisma.canho.deleteMany();
  await prisma.toanha.deleteMany();
  await prisma.dichvu.deleteMany();
  await prisma.nguoidung.deleteMany();
  await prisma.roles.deleteMany();

  // ========================================
  // ROLES
  // ========================================
  await prisma.roles.createMany({
    data: [
      { TenVaiTro: "QuanLy", MoTa: "Quản lý hệ thống" },
      { TenVaiTro: "KeToan", MoTa: "Kế toán" },
      { TenVaiTro: "NhanVienKyThuat", MoTa: "Nhân viên kỹ thuật" },
      { TenVaiTro: "NguoiThue", MoTa: "Người thuê" },
      { TenVaiTro: "ChuNha", MoTa: "Chủ nhà" },
      { TenVaiTro: "KhachVangLai", MoTa: "Khách vãng lai" },
    ]
  });

  const roles = await prisma.roles.findMany();

  const role = {};
  roles.forEach(r => role[r.TenVaiTro] = r.ID);

  // ========================================
  // USERS
  // ========================================
  const users = [];

  // Quản lý
  users.push(await prisma.nguoidung.create({
    data: {
      TenDangNhap: "quanly",
      MatKhau: HASHED_PW,
      HoTen: "Nguyễn Văn Quản Lý",
      Email: "quanly@test.com",
      RoleID: role.QuanLy
    }
  }));

  // Kế toán
  users.push(await prisma.nguoidung.create({
    data: {
      TenDangNhap: "ketoan",
      MatKhau: HASHED_PW,
      HoTen: "Trần Thị Kế Toán",
      Email: "ketoan@test.com",
      RoleID: role.KeToan
    }
  }));

  // Chủ nhà
  for (let i = 1; i <= 2; i++) {
    users.push(await prisma.nguoidung.create({
      data: {
        TenDangNhap: `chunha${i}`,
        MatKhau: HASHED_PW,
        HoTen: `Chủ nhà ${i}`,
        Email: `chunha${i}@test.com`,
        RoleID: role.ChuNha
      }
    }));
  }

  // Người thuê
  for (let i = 1; i <= 10; i++) {
    users.push(await prisma.nguoidung.create({
      data: {
        TenDangNhap: `nguoithue${i}`,
        MatKhau: HASHED_PW,
        HoTen: `Người thuê ${i}`,
        Email: `nguoithue${i}@test.com`,
        RoleID: role.NguoiThue
      }
    }));
  }

  // Nhân viên kỹ thuật
  for (let i = 1; i <= 2; i++) {
    users.push(await prisma.nguoidung.create({
      data: {
        TenDangNhap: `kythuat${i}`,
        MatKhau: HASHED_PW,
        HoTen: `Nhân viên kỹ thuật ${i}`,
        Email: `kythuat${i}@test.com`,
        RoleID: role.NhanVienKyThuat
      }
    }));
  }

  const owners = users.filter(x => x.RoleID === role.ChuNha);
  const tenants = users.filter(x => x.RoleID === role.NguoiThue);
  const staffs = users.filter(x => x.RoleID === role.NhanVienKyThuat);
  const ketoan = users.find(x => x.RoleID === role.KeToan);

  // ========================================
  // BUILDINGS
  // ========================================
  const buildings = [];

  buildings.push(await prisma.toanha.create({
    data: {
      TenToaNha: "Sunrise Apartment",
      DiaChi: "Quận 7, TP.HCM",
      SoTang: 12,
      ChuNhaID: owners[0].ID
    }
  }));

  buildings.push(await prisma.toanha.create({
    data: {
      TenToaNha: "Central Residence",
      DiaChi: "Quận Bình Thạnh, TP.HCM",
      SoTang: 10,
      ChuNhaID: owners[1].ID
    }
  }));

  // ========================================
  // APARTMENTS (15 căn thật)
  // ========================================
  const apartmentData = [
    ["A101",1,1,32,5200000,"DaThue"],
    ["A102",1,1,35,5500000,"DaThue"],
    ["A201",1,2,38,6200000,"DaThue"],
    ["A202",1,2,42,6800000,"Trong"],
    ["A301",1,3,45,7200000,"DaThue"],
    ["A302",1,3,48,7600000,"BaoTri"],
    ["A401",1,4,52,8200000,"DaThue"],
    ["A402",1,4,55,8600000,"Trong"],
    ["B101",2,1,30,5000000,"DaThue"],
    ["B102",2,1,34,5400000,"DangDon"],
    ["B201",2,2,40,6500000,"DaThue"],
    ["B202",2,2,46,7300000,"Trong"],
    ["B301",2,3,50,8100000,"DaThue"],
    ["B302",2,3,58,9200000,"Trong"],
    ["B401",2,4,65,11000000,"DaThue"],
  ];

  const apartments = [];

  for (let i = 0; i < apartmentData.length; i++) {
    const a = apartmentData[i];

    apartments.push(await prisma.canho.create({
      data: {
        MaCanHo: a[0],
        ToaNhaID: buildings[a[1]-1].ID,
        Tang: a[2],
        SoPhong: a[0],
        DienTich: a[3],
        GiaThue: a[4],
        TienCoc: a[4] * 2,
        TrangThai: a[5],
        ChuNhaID: owners[i % 2].ID
      }
    }));
  }

  // ========================================
  // SERVICES
  // ========================================
  await prisma.dichvu.createMany({
    data: [
      { TenDichVu: "Dọn vệ sinh", Gia: 250000 },
      { TenDichVu: "Giặt ủi", Gia: 180000 },
      { TenDichVu: "Sửa điện nước", Gia: 350000 },
      { TenDichVu: "Internet tốc độ cao", Gia: 220000 },
      { TenDichVu: "Bảo trì điều hòa", Gia: 400000 }
    ]
  });

  const services = await prisma.dichvu.findMany();

  // ========================================
  // CONTRACTS (8 hợp đồng)
  // ========================================
  const rented = apartments.filter(x => x.TrangThai === "DaThue");
  const contracts = [];

  for (let i = 0; i < rented.length; i++) {
    contracts.push(await prisma.hopdong.create({
      data: {
        CanHoID: rented[i].ID,
        NguoiThueID: tenants[i].ID,
        NgayBatDau: new Date("2025-01-01"),
        NgayKetThuc: new Date("2025-12-31"),
        GiaThue: rented[i].GiaThue,
        TienCoc: rented[i].TienCoc,
        TrangThai: "DangThue"
      }
    }));
  }

  // ========================================
  // BILLING DASHBOARD ĐẸP
  // ========================================
  for (let i = 0; i < contracts.length; i++) {
    for (let m = 1; m <= 6; m++) {

      const dien = 350000 + Math.floor(Math.random() * 250000);
      const nuoc = 120000 + Math.floor(Math.random() * 100000);
      const dv = 250000;

      const tong = Number(contracts[i].GiaThue) + dien + nuoc + dv;

      const status =
        m <= 4 ? "DaTT"
        : m === 5 ? "ChuaTT"
        : "QuaHan";

      const bill = await prisma.hoadon.create({
        data: {
          HopDongID: contracts[i].ID,
          ThangNam: `2025-${String(m).padStart(2,"0")}`,
          NgayLap: new Date(`2025-${String(m).padStart(2,"0")}-01`),
          NgayDenHan: new Date(`2025-${String(m).padStart(2,"0")}-10`),
          TongTien: tong,
          TrangThai: status,
          MaHoaDon: `HD${contracts[i].ID}${m}`,
          SoTaiKhoan: '1031312786',
          NganHangNhan: 'Vietcombank',
          NoiDungCK: `HD${contracts[i].ID}${m}`,
        }
      });

      await prisma.hoadonchitiet.createMany({
        data: [
          { HoaDonID: bill.ID, Loai: "TienThue", SoTien: contracts[i].GiaThue, MoTa: "Tiền thuê căn hộ" },
          { HoaDonID: bill.ID, Loai: "Dien", SoTien: dien, MoTa: "Tiền điện" },
          { HoaDonID: bill.ID, Loai: "Nuoc", SoTien: nuoc, MoTa: "Tiền nước" },
          { HoaDonID: bill.ID, Loai: "DichVu", SoTien: dv, MoTa: "Phí dịch vụ chung" }
        ]
      });

      if (status === "DaTT") {
        await prisma.thanhtoan.create({
          data: {
            HoaDonID: bill.ID,
            SoTien: tong,
            PhuongThuc: "ChuyenKhoan",
            NganHang: "Vietcombank",
            XacNhanBoID: ketoan.ID
          }
        });
      }
    }
  }

  // ========================================
  // RENT REQUESTS
  // ========================================
  const available = apartments.filter(
    x => x.TrangThai === "Trong" || x.TrangThai === "DangDon"
  );

  for (let i = 0; i < 6; i++) {
    await prisma.yeucauthue.create({
      data: {
        NguoiYeuCauID: tenants[i].ID,
        CanHoID: available[i % available.length].ID,
        TrangThai: i < 2 ? "DaDuyet" : "ChoKiemTra",
        GhiChu: "Muốn chuyển vào cuối tháng"
      }
    });
  }

  // ========================================
  // SERVICE REQUEST
  // ========================================
  for (let i = 0; i < 8; i++) {
    await prisma.yeucaudichvu.create({
      data: {
        NguoiThueID: tenants[i].ID,
        DichVuID: services[i % services.length].ID,
        CanHoID: rented[i].ID,
        TrangThai: i < 4 ? "DaXuLy" : "ChoXuLy"
      }
    });
  }

  // ========================================
  // INCIDENTS
  // ========================================
  const issueTitles = [
    "Máy lạnh không lạnh",
    "Rò rỉ nước bếp",
    "Đèn hành lang hỏng",
    "Khóa cửa lỗi",
    "Nước yếu",
    "Mất wifi",
    "Ổ điện chập chờn",
    "Cửa sổ kẹt"
  ];

  for (let i = 0; i < 8; i++) {
    await prisma.yeucausuco.create({
      data: {
        NguoiThueID: tenants[i].ID,
        CanHoID: rented[i].ID,
        TieuDe: issueTitles[i],
        MoTa: "Cần xử lý sớm",
        DoUuTien: i < 3 ? "Cao" : "Trung",
        TrangThai: i < 5 ? "DangXuLy" : "Moi",
        NhanVienXuLyID: staffs[i % 2].ID
      }
    });
  }

  // ========================================
  // NOTIFICATION
  // ========================================
  for (let i = 1; i <= 12; i++) {
    const tb = await prisma.thongbao.create({
      data: {
        TieuDe: `Thông báo tháng ${i}`,
        NoiDung: "Vui lòng thanh toán đúng hạn và giữ gìn vệ sinh chung.",
        Loai: "Chung",
        NguoiGuiID: owners[0].ID
      }
    });

    for (let j = 0; j < 5; j++) {
      await prisma.thongbao_nguoinhan.create({
        data: {
          ThongBaoID: tb.ID,
          NguoiNhanID: tenants[j].ID
        }
      });
    }
  }

  // ========================================
  // AMENITIES (TIỆN ÍCH)
  // ========================================
  await prisma.tienich.createMany({
    data: [
      { TenTienIch: "Hồ bơi vô cực", MoTa: "Hồ bơi trên tầng thượng" },
      { TenTienIch: "Phòng Gym", MoTa: "Trang thiết bị hiện đại" },
      { TenTienIch: "Khu BBQ", MoTa: "Khu vực nướng ngoài trời" },
      { TenTienIch: "Ban công riêng", MoTa: "Ban công view thành phố" },
      { TenTienIch: "Chỗ đậu xe ô tô", MoTa: "Bãi đỗ xe dưới tầng hầm" }
    ]
  });
  const amenitiesList = await prisma.tienich.findMany();
  
  // Gắn tiện ích cho các căn hộ
  for (let i = 0; i < apartments.length; i++) {
    // Mỗi căn hộ có 2-3 tiện ích ngẫu nhiên
    await prisma.canho_tienich.createMany({
      data: [
        { CanHoID: apartments[i].ID, TienIchID: amenitiesList[i % 5].ID },
        { CanHoID: apartments[i].ID, TienIchID: amenitiesList[(i + 1) % 5].ID }
      ]
    });
  }

  // ========================================
  // ASSETS (TÀI SẢN)
  // ========================================
  let assetCounter = 1;
  for (let i = 0; i < rented.length; i++) {
    await prisma.taisan.createMany({
      data: [
        {
          MaTaiSan: `TS${assetCounter++}`,
          TenTaiSan: "Tủ lạnh Samsung Inverter 300L",
          LoaiTaiSan: "ThietBiDien",
          CanHoID: rented[i].ID,
          TinhTrang: "Tot",
          GiaTri: 7500000
        },
        {
          MaTaiSan: `TS${assetCounter++}`,
          TenTaiSan: "Máy giặt LG 9kg",
          LoaiTaiSan: "ThietBiDien",
          CanHoID: rented[i].ID,
          TinhTrang: "Tot",
          GiaTri: 6200000
        },
        {
          MaTaiSan: `TS${assetCounter++}`,
          TenTaiSan: "Sofa da",
          LoaiTaiSan: "NoiThat",
          CanHoID: rented[i].ID,
          TinhTrang: "Cu",
          GiaTri: 4500000
        }
      ]
    });
  }

  // ========================================
  // METER READINGS (CHỈ SỐ ĐIỆN NƯỚC)
  // ========================================
  for (let i = 0; i < rented.length; i++) {
    // Ghi chỉ số cho 3 tháng gần nhất
    for (let m = 1; m <= 3; m++) {
      const monthStr = `2025-0${m}`;
      await prisma.chisodiennuoc.create({
        data: {
          CanHoID: rented[i].ID,
          ThangNam: monthStr,
          ChiSoDienCu: (m - 1) * 150,
          ChiSoDienMoi: m * 150 + Math.floor(Math.random() * 50),
          ChiSoNuocCu: (m - 1) * 20,
          ChiSoNuocMoi: m * 20 + Math.floor(Math.random() * 10),
          NguoiGhiID: staffs[0].ID,
          TrangThai: m === 3 ? "ChoDuyetKeToan" : "DaPhatHanhHoaDon",
          KeToanDuyetID: m < 3 ? ketoan.ID : null
        }
      });
    }
  }

  // ========================================
  // PARKING CARDS (THẺ GỬI XE)
  // ========================================
  let cardCounter = 1;
  for (let i = 0; i < 5; i++) {
    await prisma.theguixe.create({
      data: {
        MaThe: `CARD${String(cardCounter++).padStart(4, "0")}`,
        NguoiDungID: tenants[i].ID,
        CanHoID: rented[i].ID,
        LoaiThe: "Thang",
        LoaiXe: "XeMay",
        BienSoXe: `59-X${i} ${Math.floor(1000 + Math.random() * 9000)}`,
        NgayLap: new Date(),
        TrangThai: "Active"
      }
    });
  }

  console.log("✅ FULL REALISTIC SEED SUCCESS");
}

main()
.catch(e => console.error(e))
.finally(async () => await prisma.$disconnect());