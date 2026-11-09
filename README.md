# Tenant Management System (Vercel Full-Stack)

A production-ready full-stack Tenant and Property Management application built with **Next.js (App Router)**, **Prisma ORM**, **Tailwind CSS**, and **PostgreSQL**, designed for deployment on **Vercel**.

---

## Features

- **Authentication & RBAC**: Secure email/password login with hashed passwords (`bcryptjs`) and HTTP-only session cookies (`jose` JWT).
- **Admin Panel (`/admin`)**:
  - Dedicated administrator portal.
  - **Account Creation**: Create new accounts for users with roles (`USER` or `ADMIN`).
  - **Tenant Linking**: Optionally associate user logins with existing Tenant profiles.
  - Account deletion and user directory table.
- **Tenant Directory**: Register, view, edit, and delete tenant records with contact details and lease history.
- **Property & Unit Management**: Organize properties and units with hierarchical structure.
- **Lease Lifecycle Tracking**: Monitor lease start/end dates, monthly rent, and active/expired/terminated status.
- **Maintenance Ticketing**: Submit repair requests with priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and track status (`PENDING`, `IN_PROGRESS`, `RESOLVED`).
- **Unified Vercel Serverless Architecture**: Frontend UI and Backend REST APIs coexist seamlessly under Next.js App Router (`/src/app/api/*`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Auth & Security** | Jose (JWT), Bcrypt.js, HTTP-Only Cookies |
| **ORM** | Prisma ORM 6 |
| **Database** | Serverless PostgreSQL (Neon, Supabase, or Vercel Postgres) |
| **Hosting** | Vercel (Frontend + Serverless Functions) |

---

## Default Initial Admin Credentials

When the database is freshly initialized, an initial administrator account is automatically seeded on first login:

- **Email**: `admin@rental.com`
- **Password**: `admin123`

You can immediately use this account to log in at [`/login`](http://localhost:3000/login) and access the [`/admin`](http://localhost:3000/admin) panel to create additional accounts for users and staff.

---

## Project Structure

```text
tenant-management-app/
├── prisma/
│   └── schema.prisma              # Database schema (User, Tenant, Property, Unit, Lease, Maintenance)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx           # Admin Panel for User Account Creation & Management
│   │   ├── login/
│   │   │   └── page.tsx           # User Authentication Page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/         # POST /api/auth/login
│   │   │   │   ├── logout/        # POST /api/auth/logout
│   │   │   │   └── me/            # GET /api/auth/me
│   │   │   ├── admin/
│   │   │   │   └── users/         # GET, POST /api/admin/users
│   │   │   │       └── [id]/      # PUT, DELETE /api/admin/users/[id]
│   │   │   ├── tenants/           # GET, POST /api/tenants
│   │   │   │   └── [id]/          # GET, PUT, DELETE /api/tenants/[id]
│   │   │   ├── properties/        # GET, POST /api/properties
│   │   │   │   └── [id]/          # GET, PUT, DELETE /api/properties/[id]
│   │   │   ├── leases/            # GET, POST /api/leases
│   │   │   │   └── [id]/          # GET, PUT, DELETE /api/leases/[id]
│   │   │   └── maintenance/       # GET, POST /api/maintenance
│   │   │       └── [id]/          # GET, PUT, DELETE /api/maintenance/[id]
│   │   ├── layout.tsx             # Root Layout with Tailwind
│   │   ├── page.tsx               # Full Interactive Dashboard UI
│   │   └── globals.css            # Global Tailwind Styles
│   └── lib/
│       ├── auth.ts                # Session verification, bcrypt, RBAC helpers
│       └── prisma.ts              # Global Prisma client singleton
├── vercel.json                    # Vercel deployment configuration
├── .env.example                   # Environment variable templates
└── package.json
```

---

## Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set your `DATABASE_URL` (e.g. from [Neon](https://neon.tech), [Supabase](https://supabase.com), or a local PostgreSQL instance):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tenant_management?schema=public"
JWT_SECRET="your-secure-jwt-secret-at-least-32-chars-long"
```

### 3. Push Database Schema

Sync your schema with your database:

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

1. Open [http://localhost:3000/login](http://localhost:3000/login) to sign in as Admin (`admin@rental.com` / `admin123`).
2. Visit [http://localhost:3000/admin](http://localhost:3000/admin) to create new user accounts.
3. Access [http://localhost:3000](http://localhost:3000) for the main Rental Management dashboard.

---

## Deploying to Vercel

### Method 1: Deploy via GitHub (Recommended)

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." → "Project"**.
3. Select your GitHub repository and click **Import**.
4. Under **Environment Variables**, add:
   - **`DATABASE_URL`**: Your connection string from Neon, Supabase, or Vercel Postgres.
   - **`JWT_SECRET`**: A random 32+ character string.
5. Under **Build Settings**, verify:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `prisma generate && next build` (configured automatically via `vercel.json` and `package.json`).
6. Click **Deploy**.
