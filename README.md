# FixItNow Web

Next.js frontend for **FixItNow** — a home-services marketplace. Customers browse and book technicians, pay with Stripe Checkout, and leave reviews. Technicians manage profile, availability, services, and jobs. Admins moderate users, categories, and bookings.

Backend: FixItNowPro (Express + Prisma). Live API example: `https://fix-it-now-two.vercel.app/api`

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI)
- TanStack Query · Zustand · React Hook Form + Zod · sonner · next-themes

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base (no trailing slash). Local: `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | This app’s public URL. Must match the backend `FRONTEND_URL` so Stripe redirects return here |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional — Checkout redirect does not require it |

Point `NEXT_PUBLIC_API_URL` at a running FixItNowPro instance (local or deployed).

## Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixitnow.com` | `Admin@1234` |
| Technician | `technician@fixitnow.com` | `tech123` |
| Customer | `customer@fixitnow.com` | `customer123` |

## Demo flow (grading)

1. **Customer** — log in → `/services` → open a technician → Book Now → dashboard
2. **Technician** — Accept booking → wait for payment → Start job → Mark completed
3. **Customer** — Pay Now (Stripe test card `4242 4242 4242 4242`) → return `/payment/success` → Leave review when completed
4. **Admin** — `/dashboard/admin` stats → Users (ban/unban) → Categories CRUD → Bookings filter

## Role dashboards

| Role | Root |
|---|---|
| Customer | `/dashboard/customer` |
| Technician | `/dashboard/technician` |
| Admin | `/dashboard/admin` |

Middleware enforces role segments on `/dashboard/*`.

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve build
npm run lint     # ESLint
```

## Docs

- [`API_INTEGRATION.md`](./API_INTEGRATION.md) — page ↔ endpoint map
- [`AGENTS.md`](./AGENTS.md) — conventions for future agent sessions
- [`AI_BUILD_PROMPT.md`](./AI_BUILD_PROMPT.md) — full product/build specification

## Project layout (high level)

```
app/
  (authGroup)/       login, register
  (publicGroup)/     landing, services, technicians, payment return
  (dashboardGroup)/  customer, technician, admin panels
components/          shared UI (navbar, badges, theme toggle, shadcn)
hooks/               TanStack Query hooks
service/             typed API wrappers
lib/                 api client, auth store, types, query keys
```
