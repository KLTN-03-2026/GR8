import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ nếu cần
  await prisma.chuyennhuong.deleteMany();
  await prisma.chungthuc.deleteMany?.(); // nếu có
  await prisma.canho.deleteMany();
  await prisma.toanha.deleteMany();
  await prisma.nguoidung.deleteMany();

  // Tạo 1 chủ nhà mẫu
  const owner = await prisma.nguoidung.create({
    data: {
      HoTen: "Nguyễn Văn A",
      Email: "chunha@example.com",
      MatKhau: "password123",
      VaiTro: "ChuNha",
      TrangThai: "HoatDong",
      SDT: "0909123456",
    },
  });

  // Tạo 1 tòa nhà mẫu
  const building = await prisma.toanha.create({
    data: {
      TenToaNha: "Tòa Nhà A",
      DiaChi: "123 Đường ABC, Quận 1",
      TrangThai: "HoatDong",
    },
  });

  // Tạo 5 căn hộ mẫu gắn với tòa nhà và chủ nhà
  const apartments = [
    {
      MaCanHo: "A101",
      ToaNhaID: building.ID,
      ChuNhaID: owner.ID,
      Tang: 1,
      SoPhong: "2PN",
      DienTich: 45,
      GiaThue: 5000000,
      TienCoc: 1000000,
      TrangThai: "Trong",
      MoTa: "Căn hộ hướng Đông, ban công thoáng",
    },
    {
      MaCanHo: "A102",
      ToaNhaID: building.ID,
      ChuNhaID: owner.ID,
      Tang: 1,
      SoPhong: "3PN",
      DienTich: 65,
      GiaThue: 7000000,
      TienCoc: 1400000,
      TrangThai: "DaThue",
      MoTa: "Căn hộ đã có người thuê, đầy đủ nội thất",
    },
    {
      MaCanHo: "A103",
      ToaNhaID: building.ID,
      ChuNhaID: owner.ID,
      Tang: 2,
      SoPhong: "2PN",
      DienTich: 50,
      GiaThue: 6000000,
      TienCoc: 1200000,
      TrangThai: "BaoTri",
      MoTa: "Đang bảo trì hệ thống điện nước",
    },
    {
      MaCanHo: "A104",
      ToaNhaID: building.ID,
      ChuNhaID: owner.ID,
      Tang: 2,
      SoPhong: "1PN",
      DienTich: 35,
      GiaThue: 5500000,
      TienCoc: 1100000,
      TrangThai: "Trong",
      MoTa: "Căn hộ nhỏ gọn, phù hợp cặp đôi",
    },
    {
      MaCanHo: "A105",
      ToaNhaID: building.ID,
      ChuNhaID: owner.ID,
      Tang: 3,
      SoPhong: "3PN",
      DienTich: 75,
      GiaThue: 10000000,
      TienCoc: 2000000,
      TrangThai: "DaThue",
      MoTa: "Căn hộ góc, view đẹp",
    },
  ];

  await Promise.all(
    apartments.map((apartment) => prisma.canho.create({ data: apartment }))
  );

  console.log("Seed dữ liệu mẫu đã hoàn thành.");
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });