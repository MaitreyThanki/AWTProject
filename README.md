# Lab Inventory Management System

Full-stack web application for managing laboratory equipment borrowing, approvals, returns, reminders, and penalties across **Makers Lab 2** and **Design IoT Lab**.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), React Router v6, Lucide Icons, Pure CSS (Earthy Palette)
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT, bcryptjs, Speakeasy TOTP Authenticator (Admin)
- **File Uploads**: Multer with MIME/size validation (`server/uploads/`)
- **Automated Tasks**: Node-cron scheduled return reminders and overdue monitors
- **Email Service**: Nodemailer notifications

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Local MongoDB running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_management
JWT_SECRET=inventory_secret_key_jwt_2026
ADMIN_EMAIL=admin@university.edu
ADMIN_TOTP_SECRET=JBSWY3DPEHPK3PXP
```

### 3. Initialize Database & Seed Demo Data
```bash
cd server
npm run db:sync
npm run db:seed
cd ..
```

### 4. Start Development Servers
From the root directory:
```bash
npm run dev
```
* **Frontend Application**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`
* **Health Check**: `http://localhost:5000/health`

---

## 👥 Demo Accounts (Seeded)

| Role | Email | Password / Auth Method | Scope / Lab |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | **TOTP 6-digit OTP** (Secret: `JBSWY3DPEHPK3PXP`) | Global Overrides, All Labs, Faculty Provisioning |
| **Faculty** | `faculty.makers@university.edu` | `password123` | Makers Lab 2 In-Charge |
| **Faculty** | `faculty.iot@university.edu` | `password123` | Design IoT Lab In-Charge |
| **Student** | `student@university.edu` | `password123` | B.Tech CS Student |

> **Admin Authenticator Setup**: Add a manual key in Google Authenticator or Microsoft Authenticator with Secret `JBSWY3DPEHPK3PXP`, then enter the current 6-digit code on `/admin-login`.

---

## 📡 Core API Endpoints

### Authentication & Users
- `POST /api/auth/student/register` — Student sign-up with academic details
- `POST /api/auth/login` — Student & Faculty login (returns JWT token)
- `POST /api/auth/admin/login` — Authenticator TOTP verification for Admin
- `POST /api/auth/faculty/create` — Admin creates faculty account and emails random password
- `POST /api/auth/change-password` — Password update endpoint
- `GET /api/auth/me` — Current user profile

### Inventory Management
- `GET /api/items/labs` — List lab facilities (Makers Lab 2 & Design IoT Lab)
- `GET /api/items` — Browse inventory (supports `?labId=`, `?category=`, `?search=`)
- `GET /api/items/:id` — Item details
- `GET /api/items/:id/history` — Audit trail for item borrowing & stock adjustments
- `POST /api/items` — Add new equipment (Admin / Faculty)
- `PATCH /api/items/:id` — Update stock, condition, or status
- `DELETE /api/items/:id` — Remove item (Admin)

### Borrow Requests & Lifecycle
- `GET /api/requests` — Requisitions list (filtered by role and permissions)
- `GET /api/requests/:id` — Requisition details
- `POST /api/requests` — Submit checkout with optional multipart document upload
- `POST /api/requests/:id/issue` — Faculty/Admin confirms physical handover (decrements available stock)
- `POST /api/requests/:id/return` — Faculty/Admin confirms return (restores stock, assesses overdue/damage penalties)
- `POST /api/requests/:id/cancel` — Cancel pending/approved request

### Approvals & Overrides
- `PATCH /api/approvals/:id/decision` — Faculty approves or rejects request with remarks
- `POST /api/approvals/:id/override` — Admin decision override (with mandatory reason)
- `GET /api/approvals/overrides` — Audit log of all administrative override decisions

### Documents & Verification
- `POST /api/documents/upload/:requestId` — Upload permission slips or project letters (max 5MB)
- `GET /api/documents` — Admin & faculty document review queue
- `GET /api/documents/:id/file` — Authenticated document download/preview

### Penalties
- `GET /api/penalties` — List penalty records
- `POST /api/penalties` — Manually apply penalty (Admin / Faculty)
- `PATCH /api/penalties/:id/status` — Mark penalty as `paid` or `waived` (Admin)

### Dashboard Metrics
- `GET /api/dashboard` — Role-tailored metrics aggregated from MongoDB
