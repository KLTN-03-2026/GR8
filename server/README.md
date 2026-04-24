# Server - Apartment Management System

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/quanlychungcu"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### 3. Setup Database

#### Option A: Use existing database
If you already have the database, just generate Prisma Client:
```bash
npm run prisma:generate
```

#### Option B: Create new database from schema
```bash
# Create database in MySQL first
mysql -u root -p
CREATE DATABASE quanlychungcu;
exit;

# Then push schema to database
npx prisma db push

# Generate Prisma Client
npm run prisma:generate
```

### 4. Test Database Connection
```bash
npm run test:db
```

You should see:
```
✅ Database connection successful!
📊 Found 3 roles in database
👥 Total users: X
🏢 Total apartments: X
```

### 5. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## 📝 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run test:db` - Test database connection
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Create and apply migrations

## 🔧 Prisma Commands

### View Database in GUI
```bash
npm run prisma:studio
```

### Pull Schema from Database
```bash
npx prisma db pull
```

### Push Schema to Database
```bash
npx prisma db push
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

## 🗄️ Database Structure

The system uses MySQL with Prisma ORM. Main tables:
- `nguoidung` - Users
- `roles` - User roles
- `canho` - Apartments
- `toanha` - Buildings
- `hopdong` - Contracts
- `hoadon` - Invoices
- `thanhtoan` - Payments
- `chisodiennuoc` - Utility meters
- And more...

## 🔐 Security Notes

- Never commit `.env` file
- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable SSL for database connections in production

## 📚 API Documentation

Once server is running, visit:
- Swagger UI: `http://localhost:5000/api-docs`

## 🐛 Troubleshooting

### Database Connection Error
1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Port Already in Use
Change `PORT` in `.env` file
