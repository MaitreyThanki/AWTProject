# Inventory Management System

Full-stack lab inventory and borrowing system.

## Stack
- React + Vite frontend
- Express.js backend
- MongoDB + Mongoose
- JWT authentication and bcrypt password hashing
- Multer document uploads to `server/uploads/`
- Nodemailer email service placeholder

## Setup

Requirements: Node.js (LTS) and MongoDB Community Server or a MongoDB Atlas URI.

Install dependencies from the repository root:

```bash
npm install
cp server/.env.example server/.env
```

Set `MONGODB_URI` and a private `JWT_SECRET` in `server/.env`. Local default:
`mongodb://127.0.0.1:27017/inventory_management`.

Initialize MongoDB indexes and seed demo data:

```bash
npm run db:sync --workspace server
npm run db:seed --workspace server
```

Start both frontend and backend:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5000/health

## Demo accounts
Created only after seeding:
- Admin: `admin@example.edu` / `admin123`
- Faculty: `faculty.makers@example.edu` / `faculty123`

Change demo credentials and JWT secret before deploying.

## Main API groups
- `POST /api/auth/student/register`
- `POST /api/auth/login`
- `GET /api/items`
- `POST /api/items`
- `GET /api/requests`
- `POST /api/requests`
- `PATCH /api/approvals/:id/decision`
- `POST /api/documents/:requestId`
- `GET /api/penalties`
- `POST /api/penalties`
