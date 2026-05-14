@echo off
echo ========================================
echo FIX MIGRATION AND APPLY NEW CHANGES
echo ========================================

echo.
echo Step 1: Reset migration state...
npx prisma migrate resolve --rolled-back 20260507115655_add_da_khai_bao_ngoai_tru

echo.
echo Step 2: Apply fix migration manually...
echo Please run fix-migration.sql in MySQL Workbench or command line
echo Press any key after running the SQL file...
pause

echo.
echo Step 3: Mark migration as applied...
npx prisma migrate resolve --applied 20260507115655_add_da_khai_bao_ngoai_tru

echo.
echo Step 4: Apply new migration...
npx prisma migrate deploy

echo.
echo Step 5: Generate Prisma Client...
npx prisma generate

echo.
echo ========================================
echo DONE! Server is ready to start.
echo ========================================
pause
