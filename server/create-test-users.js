// create-test-users.js
// Script tạo tài khoản test cho tất cả roles

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log("🚀 Bắt đầu tạo tài khoản test...\n");

  // Hash password "123456" với bcrypt rounds 10
  console.log("🔐 Đang hash password...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  console.log("✅ Password đã được hash\n");

  // Lấy hoặc tạo roles
  const roles = [
    { TenVaiTro: "QuanLy", MoTa: "Quản lý hệ thống" },
    { TenVaiTro: "KeToan", MoTa: "Kế toán" },
    { TenVaiTro: "NhanVienKyThuat", MoTa: "Nhân viên kỹ thuật" },
    { TenVaiTro: "NguoiThue", MoTa: "Người thuê" },
    { TenVaiTro: "ChuNha", MoTa: "Chủ nhà" },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { TenVaiTro: role.TenVaiTro },
      update: {},
      create: role,
    });
  }

  // Lấy role IDs
  const roleQuanLy = await prisma.roles.findUnique({ where: { TenVaiTro: "QuanLy" } });
  const roleKeToan = await prisma.roles.findUnique({ where: { TenVaiTro: "KeToan" } });
  const roleKyThuat = await prisma.roles.findUnique({ where: { TenVaiTro: "NhanVienKyThuat" } });
  const roleNguoiThue = await prisma.roles.findUnique({ where: { TenVaiTro: "NguoiThue" } });
  const roleChuNha = await prisma.roles.findUnique({ where: { TenVaiTro: "ChuNha" } });

  // Tạo users
  const users = [
    {
      TenDangNhap: "quanly",
      MatKhau: hashedPassword,
      RoleID: roleQuanLy.ID,
      HoTen: "Nguyễn Văn Quản Lý",
      Email: "quanly@test.com",
      SoDienThoai: "0901000001",
      CCCD: "001000000001",
      TrangThai: "Active",
    },
    {
      TenDangNhap: "ketoan",
      MatKhau: hashedPassword,
      RoleID: roleKeToan.ID,
      HoTen: "Trần Thị Kế Toán",
      Email: "ketoan@test.com",
      SoDienThoai: "0901000002",
      CCCD: "001000000002",
      TrangThai: "Active",
    },
    {
      TenDangNhap: "kythuat",
      MatKhau: hashedPassword,
      RoleID: roleKyThuat.ID,
      HoTen: "Lê Văn Kỹ Thuật",
      Email: "kythuat@test.com",
      SoDienThoai: "0901000003",
      CCCD: "001000000003",
      TrangThai: "Active",
    },
    {
      TenDangNhap: "nguoithue",
      MatKhau: hashedPassword,
      RoleID: roleNguoiThue.ID,
      HoTen: "Phạm Thị Người Thuê",
      Email: "nguoithue@test.com",
      SoDienThoai: "0901000004",
      CCCD: "001000000004",
      TrangThai: "Active",
    },
    {
      TenDangNhap: "chunha",
      MatKhau: hashedPassword,
      RoleID: roleChuNha.ID,
      HoTen: "Hoàng Văn Chủ Nhà",
      Email: "chunha@test.com",
      SoDienThoai: "0901000005",
      CCCD: "001000000005",
      TrangThai: "Active",
    },
  ];

  console.log("📝 Tạo tài khoản test:\n");

  for (const userData of users) {
    try {
      // Check if user exists
      const existing = await prisma.nguoidung.findUnique({
        where: { TenDangNhap: userData.TenDangNhap },
      });

      if (existing) {
        console.log(`⚠️  ${userData.TenDangNhap} đã tồn tại, bỏ qua...`);
        continue;
      }

      const user = await prisma.nguoidung.create({
        data: userData,
        include: {
          roles: true,
        },
      });

      console.log(`✅ Tạo thành công: ${user.TenDangNhap} (${user.roles.TenVaiTro})`);
    } catch (error) {
      console.error(`❌ Lỗi tạo ${userData.TenDangNhap}:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 HOÀN THÀNH! Thông tin đăng nhập:");
  console.log("=".repeat(60));
  console.log("\n📋 DANH SÁCH TÀI KHOẢN TEST:\n");
  
  console.log("1️⃣  QUẢN LY:");
  console.log("   Username: quanly");
  console.log("   Password: 123456");
  console.log("   Role: QuanLy\n");

  console.log("2️⃣  KẾ TOÁN:");
  console.log("   Username: ketoan");
  console.log("   Password: 123456");
  console.log("   Role: KeToan\n");

  console.log("3️⃣  KỸ THUẬT:");
  console.log("   Username: kythuat");
  console.log("   Password: 123456");
  console.log("   Role: NhanVienKyThuat\n");

  console.log("4️⃣  NGƯỜI THUÊ:");
  console.log("   Username: nguoithue");
  console.log("   Password: 123456");
  console.log("   Role: NguoiThue\n");

  console.log("5️⃣  CHỦ NHÀ:");
  console.log("   Username: chunha");
  console.log("   Password: 123456");
  console.log("   Role: ChuNha\n");

  console.log("=".repeat(60));
  console.log("💡 Sử dụng các tài khoản này để test billing workflow!");
  console.log("=".repeat(60) + "\n");
}

createTestUsers()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
