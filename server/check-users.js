import prisma from "./src/config/prisma.js";

async function checkUsers() {
  try {
    console.log("🔍 Checking existing users...\n");
    
    const users = await prisma.nguoidung.findMany({
      where: { TrangThai: "Active" },
      include: { roles: true },
      select: {
        ID: true,
        TenDangNhap: true,
        Email: true,
        HoTen: true,
        TrangThai: true,
        roles: {
          select: {
            TenVaiTro: true
          }
        }
      }
    });
    
    if (users.length === 0) {
      console.log("❌ No active users found!");
      console.log("\nYou need to register a new account first:");
      console.log("POST http://localhost:5000/api/auth/register");
      console.log(`{
  "TenDangNhap": "admin",
  "MatKhau": "123456",
  "HoTen": "Admin User",
  "Email": "admin@example.com",
  "SoDienThoai": "0123456789"
}`);
    } else {
      console.log(`✅ Found ${users.length} active user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user.ID}`);
        console.log(`   Username: ${user.TenDangNhap}`);
        console.log(`   Email: ${user.Email}`);
        console.log(`   Full Name: ${user.HoTen}`);
        console.log(`   Role: ${user.roles?.TenVaiTro || 'N/A'}`);
        console.log(`   Status: ${user.TrangThai}`);
        console.log(`   ---`);
      });
      
      console.log("\n📝 To login, use:");
      console.log("POST http://localhost:5000/api/auth/login");
      console.log(`{
  "TenDangNhapOrEmail": "${users[0].Email}",
  "MatKhau": "your-password"
}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
