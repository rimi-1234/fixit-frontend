# FixItNow Web

Next.js frontend for **FixItNow** — a home-services marketplace.

Customers browse services and technicians, book time slots, pay with Stripe Checkout / SSLCommerz, track bookings, and leave reviews. Technicians manage profile, services, availability, and jobs. Admins moderate users, categories, and bookings.

| Item | URL |
|------|-----|
| Live Frontend | https://fixit-frontend-umber.vercel.app |
| Live API | https://fix-it-now-123.vercel.app/api |
| Frontend Repo | https://github.com/rimi-1234/fixit-frontend |
| Backend Repo | https://github.com/rimi-1234/FixItNow |

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI)
- TanStack Query · Zustand · React Hook Form + Zod · sonner · Motion · next-themes

## Features

### Public
- Responsive home grids (featured services + top-rated technicians) with `next/image`
- Advanced search & filters (category, location, rating, price range) with real-time updates
- Technician profile page (bio, skills, reviews) + interactive Book Now date/time picker
- Skeleton loaders and `error.tsx` fallbacks

### Customer
- Register / login with role selection and validation errors
- Booking flow with available vs booked time slots
- Stripe / SSLCommerz checkout after technician accepts
- `/payment/success` and `/payment/cancel` outcome pages
- Dashboard: booking history, cancel (before `IN_PROGRESS`), payments, reviews

### Technician
- Dashboard: pending requests, upcoming jobs, earnings
- Profile & services management (skills, rate, avatar, CRUD services)
- Availability scheduler (weekday + time blocks)
- Booking actions: Accept, Decline, Mark In-Progress, Mark completed

### Admin
- Platform stats (users, active bookings, revenue)
- User management with search, pagination, ban / unban
- Category CRUD
- Platform-wide bookings overview

Routes under `/dashboard/*` are protected by Next.js Middleware (role-based).

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
| `NEXT_PUBLIC_API_URL` | Backend API base (no trailing slash). Local: `http://localhost:5000/api` · Deployed: `https://fix-it-now-123.vercel.app/api` |
| `NEXT_PUBLIC_APP_URL` | This app’s public URL. Must match the backend `FRONTEND_URL` so Stripe redirects return here |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional — Checkout redirect does not require it |

## Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixitnow.com` | `Admin@1234` |
| Technician | `technician@fixitnow.com` | `tech123` |
| Customer | `customer@fixitnow.com` | `customer123` |

## Demo flow (grading)

1. **Customer** — register/login → `/services` → open a technician → Book Now → dashboard
2. **Technician** — Accept booking → wait for payment → Mark In-Progress → Mark completed
3. **Customer** — Pay Now (Stripe test card `4242 4242 4242 4242`) → `/payment/success` → Leave review when completed
4. **Admin** — `/dashboard/admin` stats → Users (ban/unban) → Categories CRUD → Bookings filter

## Main routes

| Route | Feature |
|---|---|
| `/` | Home — featured services & top technicians |
| `/services` | Browse & filter services |
| `/technicians` | Browse & filter technicians |
| `/technicians/[id]` | Technician profile & Book Now |
| `/login` · `/register` | Auth (role selection on register) |
| `/dashboard/customer` | Customer overview & bookings |
| `/dashboard/customer/bookings/[id]/pay` | Payment initiation |
| `/payment/success` · `/payment/cancel` | Payment outcome pages |
| `/dashboard/technician` | Technician overview |
| `/dashboard/technician/bookings` | Accept / decline / start / complete |
| `/dashboard/technician/availability` | Availability scheduler |
| `/dashboard/admin` | Admin overview |
| `/dashboard/admin/users` | Ban / unban users |
| `/dashboard/admin/categories` | Category management |

## Booking status badges

| Status | UI |
|---|---|
| `REQUESTED` | Yellow / orange — technician Accept / Decline |
| `ACCEPTED` | Blue — customer Pay Now |
| `DECLINED` | Red |
| `PAID` | Purple — technician Mark In-Progress |
| `IN_PROGRESS` | Green — technician Mark completed; customer cannot cancel |
| `COMPLETED` | Gray — customer Leave review |
| `CANCELLED` | Dark red |

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve build
npm run lint     # ESLint
```

## Docs

- [`VIDEO_EXPLANATION_GUIDE.md`](./VIDEO_EXPLANATION_GUIDE.md) — recording script & checklist for the demo video
- [`API_INTEGRATION.md`](./API_INTEGRATION.md) — page ↔ endpoint map
- [`AI_BUILD_PROMPT.md`](./AI_BUILD_PROMPT.md) — full product/build specification

## Project layout

```
app/
  (authGroup)/       login, register
  (publicGroup)/     landing, services, technicians, payment return
  (dashboardGroup)/  customer, technician, admin panels
components/          shared UI (navbar, badges, theme toggle, shadcn)
hooks/               TanStack Query hooks
service/             typed API wrappers
lib/                 api client, auth store, types, query keys
middleware.ts        role-based route protection
```
