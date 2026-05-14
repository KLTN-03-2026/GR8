/**
 * Script cập nhật tọa độ cho các tòa nhà trong database
 * Chạy: node scripts/update-coordinates.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateCoordinates() {
  console.log('🗺️  Đang cập nhật tọa độ tòa nhà...\n');

  const updates = [
    {
      ID: 1,
      TenToaNha: 'Tòa Nhà Sunrise',
      DiaChi: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
      // Đường Nguyễn Văn Linh, quận Hải Châu, Đà Nẵng
      Latitude: 16.0471,
      Longitude: 108.2068,
    },
    {
      ID: 2,
      TenToaNha: 'Tòa Nhà Moonlight',
      DiaChi: '456 Lê Duẩn, Thanh Khê, Đà Nẵng',
      // Đường Lê Duẩn, quận Thanh Khê, Đà Nẵng
      Latitude: 16.0678,
      Longitude: 108.2108,
    },
  ];

  for (const item of updates) {
    try {
      await prisma.toanha.update({
        where: { ID: item.ID },
        data: {
          Latitude: item.Latitude,
          Longitude: item.Longitude,
        },
      });
      console.log(`✅ ${item.TenToaNha}`);
      console.log(`   📍 ${item.DiaChi}`);
      console.log(`   🌐 Lat: ${item.Latitude}, Lng: ${item.Longitude}\n`);
    } catch (err) {
      console.error(`❌ Lỗi cập nhật ID=${item.ID}:`, err.message);
    }
  }

  // Kiểm tra kết quả
  const result = await prisma.toanha.findMany({
    select: { ID: true, TenToaNha: true, DiaChi: true, Latitude: true, Longitude: true },
  });

  console.log('📋 Kết quả sau khi cập nhật:');
  console.table(result.map(r => ({
    ID: r.ID,
    TenToaNha: r.TenToaNha,
    Latitude: r.Latitude?.toString(),
    Longitude: r.Longitude?.toString(),
  })));

  await prisma.$disconnect();
}

updateCoordinates().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
