// Test script to check roles
import prisma from './src/config/prisma.js';

async function checkRoles() {
  try {
    const roles = await prisma.roles.findMany();
    console.log('📋 Roles trong database:');
    roles.forEach(role => {
      console.log(`  - ID: ${role.ID}, Tên: ${role.TenVaiTro}, Mô tả: ${role.MoTa}`);
    });
    
    const khachVangLai = await prisma.roles.findFirst({ 
      where: { TenVaiTro: "KhachVangLai" } 
    });
    
    if (khachVangLai) {
      console.log('\n✅ Role "KhachVangLai" đã tồn tại với ID:', khachVangLai.ID);
    } else {
      console.log('\n❌ Role "KhachVangLai" KHÔNG tồn tại!');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkRoles();
