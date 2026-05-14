// scripts/reset-and-setup.js
// Script reset toàn bộ và setup lại từ đầu

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function resetAndSetup() {
  try {
    console.log('🔄 Starting FULL RESET...\n');

    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;

    console.log('🔧 Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
    });

    console.log('✅ Connected to MySQL\n');

    // Drop database nếu tồn tại
    console.log(`🗑️  Dropping database '${database}' if exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    console.log('✅ Database dropped\n');

    // Tạo database mới
    console.log(`🗄️  Creating fresh database '${database}'...`);
    await connection.query(
      `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ Database created\n');

    await connection.end();

    // Xóa migrations cũ (giữ migration_lock.toml)
    console.log('🗑️  Removing old migrations...');
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    const items = fs.readdirSync(migrationsDir);
    
    for (const item of items) {
      if (item !== 'migration_lock.toml') {
        const itemPath = path.join(migrationsDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
          console.log(`   ✓ Removed ${item}`);
        }
      }
    }
    console.log('✅ Old migrations removed\n');

    // Chạy migrate dev để tạo migration mới
    console.log('📦 Creating new migration from schema...');
    execSync('npx prisma migrate dev --name init', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Migration created\n');

    // Seed data
    console.log('🌱 Seeding database...');
    execSync('npm run seed', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('\n🎉 RESET & SETUP COMPLETED!');
    console.log('\n✅ Database is ready to use!');
    console.log('   Run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

resetAndSetup();
