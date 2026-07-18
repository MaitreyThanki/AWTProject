# Inventory Management System

Basic full-stack skeleton for the lab inventory borrowing system described in
`Inventory_Management_System_Documentation.md`.

## Stack

- React + Vite frontend
- Express.js backend
- MySQL database
- Sequelize ORM
- JWT authentication
- Multer document uploads
- Nodemailer email service placeholder

## Project Structure

```text
client/          React frontend
server/          Express API
server/uploads/  Uploaded documents
```

## Setup

Install dependencies:

```bash
npm install
```

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Update `server/.env` with your MySQL username, password, and database name.
Create the MySQL database manually before syncing:

```sql
CREATE DATABASE inventory_management;
```

Sync tables:

```bash
npm run db:sync --workspace server
```

Optional seed data:

```bash
npm run db:seed --workspace server
```

Run both frontend and backend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/health`

## Starter Accounts

Created only after running the seed command:

- Admin: `admin@example.edu` / `admin123`
- Faculty: `faculty.makers@example.edu` / `faculty123`

## Main API Groups

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
