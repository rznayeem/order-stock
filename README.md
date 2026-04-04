# 📦 OrderStock — Smart Inventory & Order Management System

A full-stack web application to manage products, stock levels, customer orders, and fulfillment workflows with real-time validation, conflict detection, and automated restock management.

> **Live Demo**: [Add your deployed URL here]  
> **Demo Credentials**: `demo@orderstock.com` / `demo1234`

---

## ✨ Features

### 🔐 Authentication
- User **Signup & Login** with email/password (via better-auth)
- **Demo Login** button with pre-filled credentials for quick access
- Role-based access control (Admin / Manager / User)
- Secure session management with cookie-based authentication

### 📦 Product & Category Management
- Create, update, and delete **product categories** (e.g., Electronics, Grocery, Clothing)
- Add products with: **Name, Category, Price, Stock Quantity, Minimum Stock Threshold**
- Product statuses: **Active** / **Out of Stock** (auto-managed based on stock)
- Search, filter by category/status, and paginate product listings

### 🛒 Order Management
- Create orders with: **Customer Name**, **Multiple Products**, **Quantity per product**
- **Auto-calculated total price** based on product prices and quantities
- Update order status workflow: `Pending → Confirmed → Shipped → Delivered`
- **Cancel orders** with automatic stock restoration
- View orders filtered by **date range**, **status**, or **search term**
- Full **pagination** support for large datasets

### 📉 Stock Handling Rules
- **Automatic stock deduction** when orders are placed
- **Real-time stock warnings**: _"Only X items available in stock"_
- **Prevents order confirmation** when stock is insufficient
- Product status automatically changes to **Out of Stock** when stock reaches 0
- Stock automatically restored when orders are cancelled

### 🔄 Restock Queue (Low Stock Management)
- Products automatically added to restock queue when stock falls **below threshold**
- Smart **priority levels**: High (0 stock) / Medium / Low
- Queue sorted by **priority first**, then **lowest stock**
- Manual restock capability with live inventory balance preview
- Items removed from queue automatically when restocked above threshold

### 🛡️ Conflict Detection
- **Duplicate product prevention**: Real-time warning for same product added twice
- **Inactive product blocking**: Cannot order out-of-stock products
- **Stock validation**: Frontend + backend validation with clear error messages
- Messages: _"This product is already added"_, _"This product is currently unavailable"_

### 📊 Dashboard
- **Total Orders Today** / **Pending Orders** / **Completed Orders** / **Cancelled Orders**
- **Revenue Today** and **All-Time Revenue**
- **Low Stock Items Count** / **Restock Queue Count**
- **Revenue Chart** — Last 7 days trend (area chart)
- **Product Summary** — Live stock level cards with status indicators
  - `iPhone 13 — 3 left (Low Stock)`
  - `Premium T-Shirt — 20 available (OK)`
- **Quick Actions** — Navigate to add products or create orders

### 📝 Activity Log
- Timeline view of **all system events**
- Tracks: Order created/updated/shipped/delivered/cancelled
- Tracks: Product added/updated/restocked, Category created, Restock queue changes
- Rich metadata with JSON details per event
- Animated timeline with icon-coded entries

### 🎁 Bonus Features
- ✅ **Search & filter** for products and orders
- ✅ **Pagination** for large datasets
- ✅ **Analytics chart** — Revenue trend over 7 days
- ✅ **Role-based access** — Admin / Manager / User roles
- ✅ **Dark mode** with system preference detection
- ✅ **Responsive design** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **UI Components** | Shadcn UI, Radix Primitives, TailwindCSS 4 |
| **State Management** | TanStack React Query, React Hook Form, Zod |
| **Animations** | Framer Motion (motion/react) |
| **Charts** | Recharts |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL with Prisma ORM 7 |
| **Authentication** | better-auth (email/password) |
| **Monorepo** | Turborepo, pnpm workspaces |

---

## 📁 Project Structure

```
order-stock/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── auth/       # Login & Register
│   │   │   │   └── dashboard/  # Dashboard, Products, Orders, etc.
│   │   │   ├── components/     # Reusable components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Auth, Axios, Routes config
│   │   │   ├── providers/      # Theme, Query, Toast providers
│   │   │   └── react-query/    # API query hooks
│   │   └── ...
│   └── api/                    # Express backend
│       └── src/
│           └── app/
│               ├── modules/    # Feature modules (Order, Product, etc.)
│               ├── routes/     # API route registry
│               ├── middlewares/# Error handling, logging, auth
│               └── utils/      # Response helpers
├── packages/
│   ├── database/               # Prisma schema, client, seed
│   ├── ui/                     # Shared Shadcn UI component library
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
└── turbo.json                  # Turborepo pipeline config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9
- **PostgreSQL** database (local or cloud — e.g., Supabase, Neon)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/order-stock.git
cd order-stock
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
DATABASE_URL=postgresql://user:password@host:5432/orderstock
DIRECT_URL=postgresql://user:password@host:5432/orderstock
SERVER_PORT=4000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

Optional: `NEXT_PUBLIC_BETTER_AUTH_URL` and `NEXT_PUBLIC_API_URL` (set in production — see Deployment).

### 4. Setup Database

```bash
# Generate Prisma client
pnpm generate

# Push schema to database
pnpm db:push

# Seed demo data (creates demo account + sample data)
pnpm db:seed
```

### 5. Run Development Server

```bash
pnpm dev
```

This starts both the **frontend** (http://localhost:3000) and **API** (http://localhost:4000 by default from `.env.example`) simultaneously.

### Demo Login

Use the **"Use Demo Credentials"** button on the login page, or enter:
- **Email**: `demo@orderstock.com`
- **Password**: `demo1234`

---

## 🌐 Deployment

This repo is a **Turborepo** (`pnpm` workspaces). Deploy the **web** and **API** as **two separate Vercel projects** from the same GitHub repository.

### 1. Project: `order-stock` (Next.js — `apps/web`)

1. **Import** the repo in Vercel → **Add New** → **Project** → select the repo.
2. **Root Directory**: `apps/web` (click **Edit** on the detected root).
3. **Framework Preset**: Next.js (auto).
4. **Build & Install**: the committed `apps/web/vercel.json` runs `pnpm install` from the monorepo root and `pnpm turbo run build --filter=@repo/web...` so workspace packages (`@repo/ui`, `@repo/database`, etc.) resolve correctly.
5. **Environment variables** (Vercel → Project → Settings → Environment Variables):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Your deployed **frontend** URL, e.g. `https://order-stock.vercel.app` (no trailing slash). Must match what you use for `BETTER_AUTH_URL` on the API. |
| `NEXT_PUBLIC_API_URL` | Your deployed **API** URL, e.g. `https://order-stock-server.vercel.app` (no trailing slash). |
| `DATABASE_URL` | Same PostgreSQL URL as the API (needed for Prisma / server code in `@repo/database`). |
| `DIRECT_URL` | Same as local (often the non-pooler/direct string for migrations). |
| `BETTER_AUTH_SECRET` | Same long random string as on the API project. |
| `BETTER_AUTH_URL` | Same as `NEXT_PUBLIC_BETTER_AUTH_URL` (server-side auth in Next). |

Redeploy after changing env vars.

### 2. Project: `order-stock-server` (Express — `apps/api`)

1. **Add** another project from the **same** repository.
2. **Root Directory**: `apps/api`.
3. **Framework Preset**: Other or **Express** (Vercel supports [Express](https://vercel.com/docs/frameworks/backend/express) with `src/server.ts` exporting the app).
4. **Build & Install**: `apps/api/vercel.json` installs from the repo root and runs `pnpm turbo run build --filter=@repo/api...` (Prisma generate + API TypeScript build).
5. **Environment variables**:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Production PostgreSQL connection string. |
| `DIRECT_URL` | Direct connection string (if you use it for migrations). |
| `BETTER_AUTH_URL` | **Public URL of the Next.js app** (not the API), e.g. `https://order-stock.vercel.app`. |
| `BETTER_AUTH_SECRET` | Same value as on the web project. |
| `CORS_ORIGINS` | Optional comma-separated list; if omitted, CORS uses `BETTER_AUTH_URL` and `http://localhost:3000`. In production include your frontend origin, e.g. `https://order-stock.vercel.app`. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Optional; comma-separated origins for Better Auth cookies (e.g. preview URLs). |

Do **not** rely on a repo-root `.env.local` on Vercel — set variables in the dashboard for each project.

### Why the API used to crash on Vercel

Vercel runs Express as **serverless functions**, not a long-lived `node server.js` process. The API must **export the Express `app` as the default export** from `src/server.ts` and must not call `process.exit` or bind a port when `VERCEL=1`. The app also needs valid `DATABASE_URL` and auth-related env vars; missing values caused Prisma or auth to fail at startup.

### Backend on Railway / Render (alternative)

1. Point the service at `apps/api`.
2. Build: `pnpm turbo run build --filter=@repo/api...` (from repo root).
3. Start: `node apps/api/dist/server.js` (after build).
4. Set the same env vars as above (except Vercel-specific behavior).

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/categories` | Create category |
| `GET` | `/api/v1/categories` | List categories |
| `PATCH` | `/api/v1/categories/:id` | Update category |
| `DELETE` | `/api/v1/categories/:id` | Delete category |
| `POST` | `/api/v1/products` | Create product |
| `GET` | `/api/v1/products` | List products (with filters) |
| `GET` | `/api/v1/products/:id` | Get single product |
| `PATCH` | `/api/v1/products/:id` | Update product |
| `DELETE` | `/api/v1/products/:id` | Delete product |
| `PATCH` | `/api/v1/products/:id/restock` | Restock a product |
| `POST` | `/api/v1/orders` | Create order |
| `GET` | `/api/v1/orders` | List orders (with filters) |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status |
| `GET` | `/api/v1/dashboard` | Dashboard statistics |
| `GET` | `/api/v1/restock-queue` | Restock queue items |
| `GET` | `/api/v1/activity-logs` | Activity log entries |

---

## 📄 License

This project is built for educational and demonstration purposes.
