# FixItNow — Frontend Build Prompt (copy this whole file to your AI agent)

> **How to use this file:** Paste this entire document as your first message to the coding
> agent that will build the Next.js frontend inside `FixItNow-web-pro`. It is self-contained:
> tech stack, API contract, data models, pages, design system, and rules of engagement are all
> included so the agent does not need to guess anything about the backend.

---

## 0. Ground rules for you (the agent) — READ FIRST

1. **Never run `git add`, `git commit`, or `git push` yourself — not once, for the entire
   project, under any circumstance, even if I say "looks good," "continue," or "commit."**
   I am doing 100% of the git add/commit/push and the GitHub push myself, manually, every
   time. Your job is only to write the code and hand me a commit message to use — never to
   run the git commands.
2. **Stop after every module/milestone and wait for me**, instead of ploughing ahead through
   the whole build in one go. A "module" means things like: project scaffold & theme setup,
   shared UI primitives, the API client layer (`lib/`), the service layer (`service/*.ts`),
   the data-fetching hooks layer (`hooks/*.ts`), the auth store + middleware, each individual
   page/route (e.g. landing page, `/services`, `/technicians/[id]`, login, register, each
   dashboard page), the payment flow, etc. Use the checklist in Section 14 as your stopping
   points — do not silently merge multiple checklist items into one turn.
3. **At every stop, report back to me in this format** before waiting for my next instruction:
   - What you just built (files touched, in plain language).
   - How to see/test it (e.g. "run `npm run dev`, open `/services`").
   - A **suggested commit message** (Conventional Commits style) for me to use when I commit
     manually, e.g. `feat: add services browse page with filters and skeleton loading`.
   - Anything you skipped, assumed, or need a decision on.
4. Do not batch multiple modules' worth of changes into one giant diff just because it's
   faster — smaller, reviewable stops are required even if it means more turns.
5. Every suggested commit message must use **Conventional Commits** style (`feat:`, `fix:`,
   `refactor:`, `style:`, `chore:`, `docs:`) and be scoped to one logical checkpoint, e.g.
   `feat: add auth store and login form` — never one giant message covering many checkpoints.
   We need **20+ meaningful frontend commits** total by the end, which the checkpoint list in
   Section 14 already produces one suggested message per stop.
6. Never invent backend endpoints, field names, or response shapes. Everything you need is in
   Section 3 (API contract) and Section 4 (data models) below — they were extracted directly
   from the real backend source code, not guessed.
7. If something genuinely isn't covered by the API (see Section 10, "Known backend gaps"),
   handle it gracefully on the frontend (hide the feature, use a sensible client-side
   fallback, or ask me) instead of inventing a fake endpoint.
8. Follow the folder structure in Section 6 exactly (route groups, `_actions`/`_components`
   per group, shared `service/`/`hooks`/`lib`/`utils`/`components`). Don't invent a different
   layout mid-project.
9. Build incrementally: scaffold → auth → public pages → customer flow → technician flow →
   admin flow → payments → polish. Confirm each phase works before moving to the next — this
   is the same list as rule 2, just at the phase level instead of the module level.

---

## 1. Project Overview

**FixItNow** is a home-services marketplace. Customers browse services and technicians, book a
time slot, pay online, and leave a review. Technicians manage their profile, availability, and
incoming bookings. Admins moderate users and service categories.

This is a **frontend-only** assignment — the backend already exists and is deployed. You are
building the Next.js client that consumes it.

- Backend repo: `FixItNowPro` (Express + TypeScript + Prisma + PostgreSQL), sibling folder to
  this frontend.
- Frontend folder: `FixItNow-web-pro` (already scaffolded with Next.js 16 App Router, React 19,
  TypeScript, Tailwind CSS v4 — build inside this project).

---

## 2. Tech Stack (mandatory)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui components (Radix-based, no heavy UI kit lock-in) |
| Server state / data fetching | TanStack Query (React Query) |
| Global/client state | Zustand (auth session, UI state) — not Redux |
| Forms & validation | React Hook Form + Zod |
| HTTP client | `fetch` wrapped in a small typed API client (see Section 5) |
| Auth | Custom JWT (backend issues a plain Bearer token — no cookies, no Auth.js needed) |
| Route protection | Next.js Middleware reading the JWT from a cookie you set at login |
| Payments | Stripe Checkout redirect flow (`gatewayUrl` from backend) — SSLCommerz optional bonus |
| Notifications | `sonner` (toasts) |
| Icons | `lucide-react` |
| Dates | `date-fns` |

---

## 3. Backend API Contract (source of truth)

**Base URL (local):** `http://localhost:5000/api`
**Base URL (deployed):** `https://fix-it-now-two.vercel.app/api`
**Swagger docs:** `https://fix-it-now-two.vercel.app/api-docs`

Put both in `.env.local` as `NEXT_PUBLIC_API_URL`.

### Response envelope (always this shape — build your API client around it)

Success:
```json
{ "success": true, "message": "...", "data": { } }
```

Error:
```json
{ "success": false, "message": "Human readable message", "errorDetails": { } }
```
- Validation errors (400) put per-field issues in `errorDetails.issues: [{ field, message }]` —
  use these to set React Hook Form field errors.
- Auth errors are 401 (not logged in) or 403 (wrong role / banned).
- 404 for missing resources, 409 for duplicate email, 500 for unexpected errors.
- **Every non-2xx response must surface a toast with `message`, plus inline field errors when
  `errorDetails.issues` exists.**

### Auth

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{ email, password, role?: "CUSTOMER"\|"TECHNICIAN", skills?: string[], experience?: number, hourlyRate?: number, bio?: string, location?: string }` | `role` defaults to CUSTOMER. If `role: "TECHNICIAN"`, `skills`, `experience`, `hourlyRate` become **required** (backend validation will reject if missing). Registration UI must show a role toggle that reveals extra fields when "Technician" is selected. |
| POST | `/auth/login` | none | `{ email, password }` | Returns `{ accessToken, user: { id, email, role, status } }`. |
| GET | `/auth/me` | Bearer (any role) | — | Returns full profile incl. `technicianProfile` if technician. Use on app load to hydrate the session/refresh role. |

There is **no refresh token flow and no logout endpoint** — login returns one `accessToken`
(1 day expiry). "Logout" = clear the token client-side and redirect to `/`.

**Auth header:** `Authorization: Bearer <accessToken>` on every protected request.

### Public / Services

| Method | Path | Auth | Query/Body | Notes |
|---|---|---|---|---|
| GET | `/services` | none | `?search=&type=&location=&minPrice=&maxPrice=&minRating=` | `type` filters by category name (partial match). Returns array of services with nested `category` and `technician` (incl. `averageRating`, `reviewCount`, `technicianProfile`). |
| POST | `/services` | Technician | `{ name, description, price, categoryId }` | Technician creates their own service. |
| PATCH | `/services/:id` | Technician (owner only) | any subset of the above | |
| DELETE | `/services/:id` | Technician (owner only) | — | |

### Technicians

| Method | Path | Auth | Query/Body | Notes |
|---|---|---|---|---|
| GET | `/technicians` | none | `?skill=&location=&minExperience=&minRating=&search=` | List with `averageRating`, `reviewCount`. |
| GET | `/technicians/:id` | none | — | Full profile + `reviews` array + `services`. |
| PUT | `/technicians/profile` | Technician | `{ skills?, experience?, hourlyRate?, bio?, location? }` | Upserts the technician's own profile. |
| PUT | `/technicians/availability` | Technician | `{ availability: string[] }` | Freeform slot strings, e.g. `"Monday 9AM-5PM"` (see Section 9 — no structured calendar in backend). |
| GET | `/technicians/bookings` | Technician | — | Incoming bookings for this technician. |
| PATCH | `/technicians/bookings/:id` | Technician (owner only) | `{ status: "ACCEPTED"\|"DECLINED"\|"IN_PROGRESS"\|"COMPLETED" }` | Allowed transitions are enforced server-side: `REQUESTED→ACCEPTED/DECLINED`, `PAID→IN_PROGRESS`, `IN_PROGRESS→COMPLETED`. Trying to skip a step (e.g. ACCEPTED→IN_PROGRESS before payment) returns a 400 with an explanatory message — surface it as a toast, don't just show "Something went wrong."|

### Categories

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/categories` | none | — |
| POST | `/categories` | Admin | `{ name, slug }` |
| PATCH | `/categories/:id` | Admin | `{ name?, slug? }` |
| DELETE | `/categories/:id` | Admin | — |

### Bookings (customer-owned)

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/bookings` | Customer | `{ technicianId, serviceId, scheduledTime: ISO8601 string }` — must be a service actually owned by that technician. |
| GET | `/bookings` | Customer | — list own bookings, newest first, includes `technician`, `service`, `payment`, `review`. |
| GET | `/bookings/:id` | Customer (owner only) | — |
| PATCH | `/bookings/:id/cancel` | Customer (owner only) | — only allowed while status is `REQUESTED`, `ACCEPTED`, or `PAID` (blocked once `IN_PROGRESS`). |

### Payments

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/payments/create` | Customer | `{ bookingId, provider?: "STRIPE"\|"SSLCOMMERZ" (default STRIPE) }` | Booking must be `ACCEPTED` and not already paid. Returns `{ provider, gatewayUrl, sessionId?, payment }`. **Redirect the browser to `gatewayUrl`.** |
| GET | `/payments` | Customer | — list own payment history with nested booking/service/technician. |
| GET | `/payments/:id` | Customer (owner only) | — |
| POST | `/payments/confirm` | webhook (Stripe server→server, not called by frontend) | — |
| POST | `/payments/sslcommerz/*` | gateway callbacks (not called by frontend) | — |

Stripe redirect URLs are configured **server-side** as:
`{FRONTEND_URL}/payment/success?bookingId=...&session_id={CHECKOUT_SESSION_ID}` and
`{FRONTEND_URL}/payment/cancel?bookingId=...`. This means **the backend `FRONTEND_URL` env var
must point at your deployed frontend** for the redirect to land on your Next.js pages — flag
this to me if it's not already set. Your `/payment/success` page should read `bookingId` and
`session_id` from the query string, then call `GET /bookings/:id` (or `GET /payments`) and
poll/refetch for a couple of seconds until status flips to `PAID` (webhook can lag slightly
behind the redirect), showing a "confirming payment…" skeleton in the meantime.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

### Reviews

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/reviews` | Customer | `{ bookingId, rating: 1-5, comment?: string }` — only valid once booking is `COMPLETED` and has no existing review. |

### Admin

| Method | Path | Auth | Query/Body |
|---|---|---|---|
| GET | `/admin/users` | Admin | `?role=&status=&search=` — includes `technicianProfile`. |
| PATCH | `/admin/users/:id` | Admin | `{ status: "ACTIVE"\|"BANNED" }` |
| GET | `/admin/bookings` | Admin | `?status=` — every booking on the platform with full relations. |
| GET/POST/PATCH/DELETE | `/admin/categories...` | Admin | mirrors `/categories` |

There is **no dedicated admin stats endpoint** — compute dashboard totals (total users, total
bookings, revenue, active bookings) client-side by deriving them from `GET /admin/users` +
`GET /admin/bookings` with `useMemo`/React Query `select`. Don't block on a stats API that
doesn't exist.

### Seed / test accounts (already in the database)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixitnow.com` | `Admin@1234` |
| Technician | `technician@fixitnow.com` | `tech123` |
| Customer | `customer@fixitnow.com` | `customer123` |

Use the **Admin** credentials above as the "working admin email & password" required by the
assignment's mandatory checklist.

---

## 4. Data Models (TypeScript — mirror these exactly)

```ts
type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
type UserStatus = "ACTIVE" | "BANNED";
type BookingStatus =
  | "REQUESTED" | "ACCEPTED" | "DECLINED" | "PAID"
  | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
type PaymentProvider = "STRIPE" | "SSLCOMMERZ";

interface User {
  id: string; email: string; role: Role; status: UserStatus;
  createdAt: string; updatedAt: string;
  technicianProfile?: TechnicianProfile | null;
}

interface TechnicianProfile {
  id: string; userId: string;
  skills: string[]; experience: number; hourlyRate: number;
  bio: string | null; location: string | null;
  availability: string[];
  createdAt: string; updatedAt: string;
}

interface Category { id: string; name: string; slug: string; }

interface Service {
  id: string; name: string; description: string; price: number;
  categoryId: string; technicianId: string;
  category: Category;
  technician?: { id: string; email: string; technicianProfile: TechnicianProfile | null;
                 averageRating: number; reviewCount: number };
}

interface Booking {
  id: string; customerId: string; technicianId: string; serviceId: string;
  status: BookingStatus; scheduledTime: string; createdAt: string; updatedAt: string;
  technician?: { id: string; email: string; technicianProfile: TechnicianProfile | null };
  customer?: { id: string; email: string };
  service?: Service;
  payment?: Payment | null;
  review?: Review | null;
}

interface Payment {
  id: string; bookingId: string; transactionId: string | null;
  amount: number; method: string; provider: PaymentProvider;
  status: PaymentStatus; paidAt: string | null; createdAt: string;
}

interface Review {
  id: string; bookingId: string; customerId: string; technicianId: string;
  rating: number; comment: string | null; createdAt: string;
}
```

---

## 5. API Client & Data Fetching Architecture

See Section 6 for exactly where each of these files lives (`service/`, `hooks/`, `lib/`).

- Build one `lib/api-client.ts` with a typed `apiFetch<T>(path, options)` that:
  - prefixes `NEXT_PUBLIC_API_URL`, sets `Content-Type: application/json`,
  - attaches `Authorization: Bearer <token>` from the auth store/cookie when present,
  - unwraps `{ data }` on success, and throws a typed `ApiError { message, errorDetails, status }`
    on failure so React Query's `onError` / error boundaries can render it consistently.
- Wrap all reads in TanStack Query hooks per resource (`useServices`, `useTechnician(id)`,
  `useMyBookings`, `useAdminUsers`, etc.) with sensible `queryKey`s for cache invalidation.
- Wrap all writes in `useMutation`, invalidating the relevant query keys on success (e.g.
  accepting a booking invalidates both the technician's booking list and that booking's detail).
- Use optimistic updates for booking status changes (Accept/Decline/Start/Complete) so the UI
  feels instant; roll back on error with a toast.
- Auth session lives in a Zustand store (`useAuthStore`: `user`, `token`, `setSession`,
  `clear`), persisted to a cookie (not just localStorage) so **Next.js Middleware can read it**
  for route protection. Keep localStorage as a mirror for quick client reads if convenient.

---

## 6. Project Folder Structure (mandatory convention)

Use **Next.js route groups** to separate public, auth, and dashboard areas, each with its own
`_components` (UI local to that group) and `_actions` (Next.js Server Actions local to that
group). Shared code lives in top-level `components/`, `hooks/`, `lib/`, `service/`, `utils/`.
This mirrors a proven bootcamp-grade structure — follow it exactly instead of improvising a
different layout mid-project:

```
FixItNow-web-pro/
├─ app/
│  ├─ (publicGroup)/                  # no auth required
│  │  ├─ _components/                 # Hero, ServiceCard, TechnicianCard, HowItWorks, Footer...
│  │  ├─ page.tsx                     # "/"  — landing page
│  │  ├─ services/
│  │  │  └─ page.tsx                  # "/services" — browse/filter grid
│  │  └─ technicians/
│  │     └─ [id]/
│  │        └─ page.tsx               # "/technicians/:id" — profile + Book Now
│  │
│  ├─ (authGroup)/                    # login/register only, redirect away if already logged in
│  │  ├─ _actions/                    # login.action.ts, register.action.ts (Server Actions)
│  │  ├─ _components/                 # LoginForm, RegisterForm, RoleToggle
│  │  ├─ login/
│  │  │  └─ page.tsx                  # "/login"
│  │  ├─ register/
│  │  │  └─ page.tsx                  # "/register"
│  │  └─ layout.tsx                   # centered auth shell (logo + card)
│  │
│  ├─ (dashboardGroup)/               # everything behind the JWT + role check
│  │  └─ dashboard/
│  │     ├─ _components/              # Sidebar, Topbar, StatTile, RoleGuard
│  │     ├─ layout.tsx                # shared shell: sidebar + topbar, reads role from session
│  │     ├─ customer/
│  │     │  ├─ _actions/              # cancelBooking.action.ts, submitReview.action.ts
│  │     │  ├─ _components/           # BookingCard, PaymentHistoryTable, ReviewForm
│  │     │  ├─ page.tsx               # "/dashboard/customer" — overview
│  │     │  └─ bookings/
│  │     │     └─ [id]/
│  │     │        ├─ page.tsx         # "/dashboard/customer/bookings/:id"
│  │     │        └─ pay/
│  │     │           └─ page.tsx      # "/dashboard/customer/bookings/:id/pay"
│  │     ├─ technician/
│  │     │  ├─ _actions/              # updateBookingStatus.action.ts
│  │     │  ├─ _components/           # AvailabilityEditor, ServiceForm, BookingsTable
│  │     │  ├─ page.tsx               # "/dashboard/technician" — overview
│  │     │  ├─ profile/page.tsx       # "/dashboard/technician/profile"
│  │     │  ├─ availability/page.tsx  # "/dashboard/technician/availability"
│  │     │  ├─ services/page.tsx      # "/dashboard/technician/services"
│  │     │  └─ bookings/page.tsx      # "/dashboard/technician/bookings"
│  │     └─ admin/
│  │        ├─ _actions/              # banUser.action.ts, createCategory.action.ts
│  │        ├─ _components/           # UsersTable, CategoryForm, PlatformStats
│  │        ├─ page.tsx               # "/dashboard/admin" — overview
│  │        ├─ users/page.tsx         # "/dashboard/admin/users"
│  │        ├─ categories/page.tsx    # "/dashboard/admin/categories"
│  │        └─ bookings/page.tsx      # "/dashboard/admin/bookings"
│  │
│  ├─ payment/
│  │  ├─ success/page.tsx             # "/payment/success"
│  │  └─ cancel/page.tsx              # "/payment/cancel"
│  │
│  ├─ layout.tsx                      # root layout: fonts, <Toaster/>, QueryClientProvider
│  ├─ globals.css
│  ├─ loading.tsx                     # root-level skeleton fallback
│  ├─ error.tsx                       # root-level error boundary
│  └─ not-found.tsx                   # branded 404
│
├─ components/                        # truly global, reused across route groups (not group-local)
│  ├─ ui/                             # shadcn/ui primitives (Button, Input, Badge, Dialog...)
│  ├─ booking-status-badge.tsx
│  ├─ data-table.tsx
│  ├─ empty-state.tsx
│  ├─ page-skeleton.tsx
│  └─ navbar.tsx
│
├─ hooks/                             # TanStack Query hooks (one file per resource) + UI hooks
│  ├─ use-auth.ts                     # session read/hydrate, wraps the Zustand store
│  ├─ use-services.ts
│  ├─ use-technicians.ts
│  ├─ use-bookings.ts
│  ├─ use-payments.ts
│  ├─ use-admin.ts
│  └─ use-mobile.ts                   # responsive breakpoint helper
│
├─ service/                           # plain fetch functions per resource, no React inside
│  ├─ auth.service.ts
│  ├─ service.service.ts              # /services CRUD
│  ├─ technician.service.ts
│  ├─ category.service.ts
│  ├─ booking.service.ts
│  ├─ payment.service.ts
│  ├─ review.service.ts
│  └─ admin.service.ts
│
├─ lib/
│  ├─ api-client.ts                   # apiFetch<T>() + ApiError, reads NEXT_PUBLIC_API_URL
│  ├─ query-client.ts                 # TanStack Query client + defaults
│  ├─ auth-store.ts                   # Zustand store (user, token, setSession, clear)
│  └─ utils.ts                        # cn() and other shadcn-required helpers
│
├─ utils/                             # pure, framework-free helpers
│  ├─ format-currency.ts
│  ├─ format-date.ts
│  ├─ get-initials.ts
│  └─ parse-availability.ts
│
├─ middleware.ts                      # role-based route protection (Section 7)
├─ public/
├─ .env.example                       # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
├─ AGENTS.md                          # condensed version of this file's rules, for future agent sessions
└─ AI_BUILD_PROMPT.md                 # this file
```

**Conventions:**
- `_actions` and `_components` (underscore prefix) are **private folders** — Next.js never
  treats them as routes, so use them freely for anything scoped to one route group.
- A component only moves up to top-level `components/` once **two or more** route groups need
  it (e.g. `booking-status-badge.tsx` is used by both the customer and technician dashboards).
- `service/*.ts` files never touch React — they just call `apiFetch` and return typed data.
  `hooks/*.ts` wrap those service calls in `useQuery`/`useMutation`. `_actions/*.ts` (Server
  Actions, `"use server"`) are only for the handful of mutations that benefit from running on
  the server (e.g. login/register setting an httpOnly cookie); everything else (dashboard CRUD,
  status updates) can be a normal client-side mutation through the `hooks/` layer for snappier
  optimistic UI.
- At the end of scaffolding, create `AGENTS.md` at the repo root summarizing Section 0 (ground
  rules), this folder structure, and the API base URL, so any future agent session (or a
  different AI tool) picks up the same conventions without re-reading this whole prompt.

---

## 7. Roles, Route Protection & Navigation

Three roles: `CUSTOMER`, `TECHNICIAN`, `ADMIN`, chosen at registration. The UI must render
different navigation, dashboards, and actions per role — never show a technician the admin
sidebar, etc.

Implement a single `middleware.ts` that:
- reads the auth token cookie,
- decodes the role (store role alongside the token in the cookie payload, or fetch `/auth/me`
  once at login and cache the role in a second cookie),
- redirects unauthenticated users hitting `/dashboard/**` to `/login?next=...`,
- redirects a role to their own dashboard root if they try to access another role's dashboard
  (e.g. a CUSTOMER hitting `/dashboard/admin` → redirect to `/dashboard/customer` with a toast).

### Route map

| Route | Access | Purpose | API calls |
|---|---|---|---|
| `/` | public | Landing page: hero, featured services, top technicians, how-it-works, CTA | `GET /services`, `GET /technicians` |
| `/services` | public | Browse/filter grid | `GET /services`, `GET /categories` |
| `/technicians/[id]` | public | Technician profile, reviews, "Book Now" | `GET /technicians/:id` |
| `/technicians/[id]/book` (or a modal on the profile page) | Customer | Pick service + date/time, submit | `POST /bookings` |
| `/register` | public | Role toggle (Customer/Technician) + conditional fields | `POST /auth/register` |
| `/login` | public | Login form | `POST /auth/login` |
| `/dashboard/customer` | Customer | Overview, booking list, status badges | `GET /bookings`, `GET /payments` |
| `/dashboard/customer/bookings/[id]` | Customer | Booking detail, cancel, pay, review | `GET /bookings/:id`, `PATCH /bookings/:id/cancel`, `POST /reviews` |
| `/dashboard/customer/bookings/[id]/pay` | Customer | Payment initiation (provider choice) | `POST /payments/create` → redirect to `gatewayUrl` |
| `/payment/success` | Customer | Confirms & shows success state | `GET /bookings/:id` (poll until `PAID`) |
| `/payment/cancel` | Customer | Cancelled/failed state, retry CTA | — |
| `/dashboard/technician` | Technician | Overview: upcoming jobs, earnings, pending requests | `GET /technicians/bookings` |
| `/dashboard/technician/profile` | Technician | Edit skills/experience/rate/bio/location | `PUT /technicians/profile` |
| `/dashboard/technician/availability` | Technician | Availability slot manager | `PUT /technicians/availability` |
| `/dashboard/technician/bookings` | Technician | Table w/ Accept/Decline/Start/Complete | `GET /technicians/bookings`, `PATCH /technicians/bookings/:id` |
| `/dashboard/technician/services` | Technician | CRUD own services | `POST/PATCH/DELETE /services` |
| `/dashboard/admin` | Admin | Platform overview (derived stats) | `GET /admin/users`, `GET /admin/bookings` |
| `/dashboard/admin/users` | Admin | User table, ban/unban, search/filter | `GET /admin/users`, `PATCH /admin/users/:id` |
| `/dashboard/admin/categories` | Admin | Category CRUD | `GET/POST/PATCH/DELETE /admin/categories` |
| `/dashboard/admin/bookings` | Admin | Global bookings table | `GET /admin/bookings` |

Every dashboard segment gets its own `loading.tsx` (skeletons) and `error.tsx` (retry button +
friendly message). Add a global `app/not-found.tsx` (404) and top-level `app/error.tsx` (500).

---

## 8. Booking Status → UI Badge Map

| Status | Badge color | Who sees which action |
|---|---|---|
| `REQUESTED` | amber/yellow | Technician: Accept / Decline |
| `ACCEPTED` | blue | Customer: Pay Now |
| `DECLINED` | red | — (terminal) |
| `PAID` | violet/purple | Technician: Start Job |
| `IN_PROGRESS` | green | Technician: Mark Completed. Customer: Cancel button hidden/disabled from here on |
| `COMPLETED` | slate/gray | Customer: Leave Review |
| `CANCELLED` | dark red | — (terminal) |

Use one shared `<BookingStatusBadge status={...} />` component everywhere so colors stay
consistent across customer, technician, and admin views.

---

## 9. Design System & UI/UX Direction

Build a **modern, premium SaaS product feel** — not a form-heavy admin template, and not a
"card for everything" layout. Follow these rules everywhere:

**Overall aesthetic**
- Clean, minimal, confident. Generous whitespace over decoration. Calm neutral background
  (off-white / near-black in dark mode) with a single confident accent color for primary
  actions (e.g. a deep indigo or teal) — don't scatter 5 different colors around the UI.
- Typography carries the hierarchy: a distinct heading font-weight/size scale (e.g. text-3xl
  bold for page titles, text-lg semibold for section headers, text-sm text-muted for
  supporting copy). Never rely on a bordered box just to separate content — use spacing,
  a soft divider (`border-b border-border/50`), or a subtle background tint instead.
- **Avoid "boxes everywhere."** Use cards *only* for genuinely discrete, comparable items in a
  grid (service cards, technician cards, stat tiles). Everything else (forms, page sections,
  dashboard overviews, settings) should sit directly on the page background, separated by
  whitespace/typography/dividers, not by wrapping every block in a bordered container.
- Consistent radius scale (e.g. `rounded-xl` for cards/inputs, `rounded-full` for pills/badges/
  avatars), consistent shadow usage (one soft shadow level, used sparingly — e.g. only on
  hover or on the one primary CTA card), consistent spacing scale (4/8/12/16/24/32px steps).
- Buttons: one clear primary style (solid, accent color) per screen, secondary actions as
  ghost/outline buttons, destructive actions (ban, decline, cancel) in a muted red — never let
  two buttons compete visually for primary attention.
- Icons (`lucide-react`) only where they add scannability (status badges, nav items, empty
  states) — not decorating every label.
- Support light/dark mode via a simple theme toggle (bonus, not blocking).

**Layout patterns**
- **Landing page (`/`)**: full-bleed hero with a clear value proposition + primary CTA
  ("Book a trusted technician in minutes"), a trust strip (ratings/number of jobs done), a
  services grid with `next/image`, a "how it works" 3-step section using numbered steps and
  whitespace (not 3 heavy cards), a top-technicians row, and a simple footer. No walls of text.
- **Services/technicians browse**: sticky top filter bar (or collapsible sidebar on desktop,
  bottom sheet on mobile) with search, category, location, price range, min rating — filters
  apply with visible loading state (skeleton grid), not a full page reload.
- **Technician profile**: header with avatar-initial, name, rating, skills as pills, location;
  bio and reviews below using simple list rows with dividers (not boxed review cards); a
  sticky "Book Now" panel on desktop / bottom sticky bar on mobile with date + time-slot picker
  that visually distinguishes available vs. booked slots (e.g. filled pill vs. outline/disabled
  pill with strikethrough).
- **Dashboards (all roles)**: a persistent left sidebar (collapsible on mobile into a top
  sheet) showing only the nav items relevant to that role, a top bar with user menu + role
  badge, and a content area that opens with 2-4 lightweight stat rows/tiles (not boxed KPI
  cards with heavy borders — think large number + label + soft background tint), followed by
  the main table/list for that page.
- **Tables** (bookings, users): clean rows with generous vertical padding, sortable headers,
  pagination, inline status badges, and row actions as icon buttons or a kebab menu — avoid
  bordering every cell.
- **Forms** (register, profile, service, category): single column, label above input, helper
  text below, inline Zod error messages appearing right under the field on blur/submit, primary
  submit button full-width on mobile / auto width on desktop, disabled + spinner while
  submitting.
- **Empty/loading/error states** everywhere data can be empty: friendly illustration-free empty
  state with a short sentence + a CTA (e.g. "No bookings yet — browse services to get
  started"), skeleton loaders matching the real layout's shape, and error states with a retry
  button, never a raw error dump.
- Fully responsive: mobile-first, test at 375px/768px/1280px. Touch targets ≥44px. Sufficient
  color contrast (WCAG AA) and visible keyboard focus rings on every interactive element.

---

## 10. Known Backend Gaps — handle gracefully, don't fake them

- **No admin stats endpoint** — derive dashboard totals client-side from `/admin/users` +
  `/admin/bookings` (see Section 3).
- **No profile picture / avatar upload endpoint** — use a generated initials avatar
  (deterministic color from the user's id/email) instead of a fake upload flow.
- **No refresh token / logout endpoint** — token simply expires after 1 day; "logout" clears
  local session and redirects home. Handle a 401 anywhere by clearing the session and
  redirecting to `/login`.
- **Availability is a freeform string array**, not structured time-slot objects — build the
  "availability scheduler" UI as a friendly slot builder (day + start/end time pickers) that
  serializes to strings like `"Monday 9AM-5PM"` when saving, and parses them back for display.
  Keep the parsing forgiving (fall back to showing the raw string if it doesn't match the
  expected pattern).
- **Booking time slots aren't validated against availability server-side** — the frontend
  should still visually cross-reference the technician's stated `availability` when the
  customer picks a time, to prevent obviously conflicting bookings, even though the backend
  won't reject it.
- **CORS is fully open** on the backend, so no special credentials/proxy config is needed
  beyond setting `NEXT_PUBLIC_API_URL`.

---

## 11. Error Handling Checklist (mandatory requirement #2)

- Global `<Toaster />` (sonner) mounted once in the root layout; every mutation's `onError`
  fires a toast built from `error.message`.
- Every form uses React Hook Form + Zod; server-side `errorDetails.issues` are mapped onto
  the matching field via `setError(field, { message })`, with a fallback toast for
  non-field errors.
- `app/error.tsx` (root) and per-segment `error.tsx` for dashboard sections — friendly
  message + "Try again" + "Back to dashboard" links, not a stack trace.
- `app/not-found.tsx` — branded 404 with a link back to `/`.
- Network/API failures never render a blank screen — always a skeleton, an empty state, or an
  error state, in that priority.

---

## 12. Payment Flow (mandatory requirement #5)

1. Customer opens an `ACCEPTED` booking → clicks **Pay Now** → `/dashboard/customer/bookings/[id]/pay`.
2. Page calls `POST /payments/create` with `{ bookingId, provider: "STRIPE" }`.
3. On success, `window.location.href = data.gatewayUrl` (full redirect to Stripe Checkout —
   this is the hosted Checkout flow, no Stripe Elements form needed on our side).
4. Stripe redirects back to `${FRONTEND_URL}/payment/success?bookingId=...&session_id=...` on
   success or `${FRONTEND_URL}/payment/cancel?bookingId=...` if the customer backs out.
5. `/payment/success`: read query params, show a "confirming your payment…" skeleton, poll
   `GET /bookings/:id` every ~2s (max ~5 tries) until `status === "PAID"`, then show a success
   screen with a link to the booking. If it never confirms, show a soft warning with a
   "check my bookings" link (webhook may still be processing).
6. `/payment/cancel`: clear "cancelled" messaging + a **Try again** button back to the pay page.
7. Booking UI everywhere (dashboard list, detail page) must reflect the live status via React
   Query refetch/invalidation — don't require a manual page refresh.
8. **Do not build a fake "Cash on Delivery" or "Pay Later" option** — Stripe Checkout redirect
   is the only accepted flow per the assignment rules. SSLCommerz can be added the same way as
   a secondary option if time allows (bonus).

---

## 13. Deliverables Checklist (map back to grading)

- [ ] `API_INTEGRATION.md` at the frontend repo root listing every page/component and the exact
      endpoint(s) it calls (use Section 3/7 tables above as the base, refine as you build).
- [ ] Toasts + inline form errors + error boundaries everywhere (Section 11).
- [ ] 20+ conventional commits, **only after I approve each commit** (Section 0).
- [ ] Working admin login demoed with `admin@fixitnow.com` / `Admin@1234`.
- [ ] Stripe Checkout redirect flow fully wired with `/payment/success` and `/payment/cancel`.
- [ ] Role-based nav/dashboards/middleware for Customer, Technician, Admin.
- [ ] Full CRUD via UI wherever the API supports it (services, categories, technician profile,
      bookings, reviews, user status).
- [ ] Responsive at 375px / 768px / 1280px, loading skeletons, dark/light toggle (bonus).

---

## 14. What to build first — stop after each numbered checkpoint

Each line below is one **stop point**: finish it, report back per Section 0 rule 3 (what you
built, how to test it, a suggested commit message), and wait for me before starting the next
one. Don't skip ahead or combine checkpoints.

1. Project scaffold: Tailwind theme tokens, shadcn/ui setup, folder structure (Section 6),
   root `layout.tsx` with `QueryClientProvider` + `<Toaster/>`, `.env.example`.
2. Shared UI primitives in `components/ui/` (Button, Input, Badge, Card, Skeleton, Table,
   Dialog) + shared layout pieces (`navbar.tsx`, `booking-status-badge.tsx`, `empty-state.tsx`).
3. API client layer: `lib/api-client.ts` (`apiFetch`/`ApiError`), `lib/query-client.ts`.
4. Service layer: all `service/*.ts` files (one per resource, per Section 6) — plain typed
   fetch wrappers, no UI yet.
5. Auth store + session: `lib/auth-store.ts` (Zustand), `hooks/use-auth.ts`, `middleware.ts`
   for role-based route protection.
6. Data-fetching hooks layer: `hooks/*.ts` (`use-services`, `use-technicians`, `use-bookings`,
   `use-payments`, `use-admin`) wrapping the service layer in `useQuery`/`useMutation`.
7. `(authGroup)`: register page (role toggle) + login page, wired to the auth store.
8. `(publicGroup)`: landing page (`/`).
9. `(publicGroup)`: services browse page (`/services`) with filters + skeleton loading.
10. `(publicGroup)`: technician profile page (`/technicians/[id]`) with reviews + Book Now.
11. Customer: booking creation flow (from technician profile → `POST /bookings`).
12. Customer dashboard: overview page + booking list with status badges.
13. Customer: booking detail page (cancel action, status-aware actions).
14. Payment flow: pay page → Stripe redirect → `/payment/success` + `/payment/cancel` pages.
15. Customer: review submission on completed bookings.
16. Technician dashboard: overview page.
17. Technician: profile management page (skills/experience/rate/bio/location).
18. Technician: availability manager page.
19. Technician: services CRUD page.
20. Technician: bookings management table (Accept/Decline/Start/Complete actions).
21. Admin dashboard: overview page with derived stats.
22. Admin: users table (search/filter, ban/unban).
23. Admin: categories CRUD page.
24. Admin: global bookings table.
25. Polish pass: error boundaries (`error.tsx`), 404 (`not-found.tsx`), empty states,
    responsive pass at 375px/768px/1280px, dark mode toggle (bonus), final
    `API_INTEGRATION.md` and `AGENTS.md`.

This naturally produces well more than 20 reviewable, committable checkpoints — matching the
20-commit requirement without you ever needing to guess how to group changes.
