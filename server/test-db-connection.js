import prisma from "./src/config/prisma.js";

async function testConnection() {
  try {
    console.log("🔄 Testing database connection...");
    
    // Test connection by querying roles table
    const roles = await prisma.roles.findMany();
    console.log("✅ Database connection successful!");
    console.log(`📊 Found ${roles.length} roles in database:`);
    roles.forEach(role => {
      console.log(`   - ${role.TenVaiTro} (ID: ${role.ID})`);
    });
    
    // Test nguoidung count
    const userCount = await prisma.nguoidung.count();
    console.log(`👥 Total users: ${userCount}`);
    
    // Test canho count
    const apartmentCount = await prisma.canho.count();
    console.log(`🏢 Total apartments: ${apartmentCount}`);
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n✅ Test completed!");
  }
}

testConnection();
