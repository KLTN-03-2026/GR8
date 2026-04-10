# Apartment Management System

A comprehensive apartment management system built with Node.js + Express (Backend) and React + Vite + Tailwind CSS (Frontend).

## Project Structure

```
apartment-management-system/
├── server/                  # Node.js + Express backend
├── client/                  # React + Vite + Tailwind frontend
├── database/                # SQL schemas and migrations
├── docs/                    # Documentation (API, ERD, etc)
├── README.md
└── .gitignore
```

## Quick Start

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Documentation

See the [docs/](docs/) folder for:
- API Documentation: [docs/API.md](docs/API.md)
- Entity Relationship Diagram: [docs/ERD.md](docs/ERD.md)
- Database Schema: [database/schema.sql](database/schema.sql)

## Tech Stack

### Backend
- Node.js + Express
- MySQL + Prisma ORM
- JWT Authentication
- CORS

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- Ant Design

## Project Structure Details

### Server (Backend)
```
server/src/
├── controllers/          # Request handlers
├── services/             # Business logic
├── routes/               # API routes
├── middleware/           # Express middleware
├── config/               # Configuration files
├── utils/                # Helper functions
└── server.js             # Entry point
```

### Client (Frontend)
```
client/src/
├── components/           # React components
│   ├── common/           # Reusable UI components
│   ├── layout/           # Layout components
│   ├── canho/            # Apartment components
│   └── chat/             # Chat components
├── pages/                # Page components
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── canho/            # Apartment pages
│   ├── hopdong/          # Contract pages
│   ├── hoadon/           # Invoice pages
│   └── chat/             # Chat pages
├── context/              # React Context
├── hooks/                # Custom React hooks
├── services/             # API services
├── utils/                # Helper utilities
├── assets/               # Images, fonts, etc
├── App.jsx               # Main app component
└── main.jsx              # Entry point
```

## License

MIT
