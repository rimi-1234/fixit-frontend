# API Integration Map

Frontend consumes the FixItNowPro API via typed wrappers in `service/*.ts` and TanStack Query hooks in `hooks/*.ts`.

| | |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` (local: `http://localhost:5000/api`, live: `https://fix-it-now-123.vercel.app/api`) |
| Auth header | `Authorization: Bearer <accessToken>` (`lib/api-client.ts`) — omitted when `skipAuth: true` |
| Response | `{ success, message, data }` — validation errors may include `errorDetails.issues` |

---

## Page / component → endpoint

### Auth

| Frontend | Endpoint | Auth |
|---|---|---|
| `login-form.tsx` | `POST /auth/login` | Public |
| `register-form.tsx` | `POST /auth/register` | Public |
| `use-auth.ts` / `auth-hydrator.tsx` | `GET /auth/me` | Bearer |
| Logout (navbar / dashboard shell) | Client cookie clear only | — |

### Public browsing & booking

| Frontend | Endpoint | Auth |
|---|---|---|
| Home featured services (`featured-services.tsx`) | `GET /services` | Public |
| Home top technicians (`top-technicians.tsx`) | `GET /technicians` | Public |
| `/services` browse (`services-browse.tsx`) | `GET /services`, `GET /categories` | Public |
| `/technicians` browse (`technicians-browse.tsx`) | `GET /technicians` | Public |
| `/technicians/[id]` profile | `GET /technicians/:id` | Public |
| Book Now panel (`book-now-panel.tsx`) | `POST /bookings` | Customer |

### Customer dashboard

| Frontend | Endpoint | Auth |
|---|---|---|
| `/dashboard/customer` overview | `GET /bookings`, `GET /payments` | Customer |
| `/dashboard/customer/bookings` | `GET /bookings` | Customer |
| `/dashboard/customer/bookings/[id]` | `GET /bookings/:id` | Customer |
| Cancel booking button | `PATCH /bookings/:id/cancel` | Customer |
| Leave review (`review-form.tsx`) | `POST /reviews` | Customer |
| `/dashboard/customer/bookings/[id]/pay` | `GET /bookings/:id`, `POST /payments/create` → redirect `gatewayUrl` | Customer |
| `/dashboard/customer/payments` | `GET /payments` | Customer |
| `/payment/success` | Polls `GET /bookings/:id` until `PAID` | Customer |
| `/payment/cancel` | UI only (retry → pay page) | — |

### Technician dashboard

| Frontend | Endpoint | Auth |
|---|---|---|
| `/dashboard/technician` overview | `GET /technicians/bookings` | Technician |
| `/dashboard/technician/profile` | `GET /technicians/:id`, `PUT /technicians/profile` | Technician |
| `/dashboard/technician/availability` | `GET /technicians/:id`, `PUT /technicians/availability` | Technician |
| `/dashboard/technician/services` list | `GET /technicians/:id`, `GET /categories` | Technician |
| Create / edit / delete service | `POST /services`, `PATCH /services/:id`, `DELETE /services/:id` | Technician |
| `/dashboard/technician/bookings` | `GET /technicians/bookings` | Technician |
| Accept / Decline / Mark In-Progress / Complete | `PATCH /technicians/bookings/:id` | Technician |

### Admin dashboard

| Frontend | Endpoint | Auth |
|---|---|---|
| `/dashboard/admin` stats | `GET /admin/users`, `GET /admin/bookings` (aggregated client-side) | Admin |
| `/dashboard/admin/users` | `GET /admin/users`, `PATCH /admin/users/:id` (ban/unban) | Admin |
| `/dashboard/admin/categories` | `GET/POST/PATCH/DELETE /admin/categories` | Admin |
| `/dashboard/admin/bookings` | `GET /admin/bookings` | Admin |

---

## Service layer ↔ hooks

| Service | Hook | Endpoints wrapped |
|---|---|---|
| `auth.service.ts` | `use-auth.ts` | `/auth/register`, `/auth/login`, `/auth/me` |
| `service.service.ts` | `use-services.ts` | `GET/POST/PATCH/DELETE /services` |
| `category.service.ts` | `use-categories.ts` | `GET /categories` (public filters) |
| `technician.service.ts` | `use-technicians.ts` | `/technicians`, `/technicians/:id`, profile, availability, bookings |
| `booking.service.ts` | `use-bookings.ts` | `POST/GET /bookings`, `GET /bookings/:id`, `PATCH .../cancel` |
| `payment.service.ts` | `use-payments.ts` | `POST /payments/create`, `GET /payments` |
| `review.service.ts` | `use-reviews.ts` | `POST /reviews` |
| `admin.service.ts` | `use-admin.ts` | `/admin/users`, `/admin/bookings`, `/admin/categories` |

---

## Backend endpoints — consumption checklist

| Module | Endpoint | Consumed by frontend? |
|---|---|---|
| Auth | `POST /auth/register` | Yes |
| Auth | `POST /auth/login` | Yes |
| Auth | `GET /auth/me` | Yes |
| Services | `GET /services` | Yes |
| Services | `POST /services` | Yes (technician) |
| Services | `PATCH /services/:id` | Yes (technician) |
| Services | `DELETE /services/:id` | Yes (technician) |
| Technicians | `GET /technicians` | Yes |
| Technicians | `GET /technicians/:id` | Yes |
| Technicians | `PUT /technicians/profile` | Yes |
| Technicians | `PUT /technicians/availability` | Yes |
| Technicians | `GET /technicians/bookings` | Yes |
| Technicians | `PATCH /technicians/bookings/:id` | Yes |
| Categories | `GET /categories` | Yes (public filters) |
| Bookings | `POST /bookings` | Yes |
| Bookings | `GET /bookings` | Yes |
| Bookings | `GET /bookings/:id` | Yes |
| Bookings | `PATCH /bookings/:id/cancel` | Yes |
| Payments | `POST /payments/create` | Yes |
| Payments | `GET /payments` | Yes |
| Payments | `GET /payments/:id` | Available in service (detail optional) |
| Reviews | `POST /reviews` | Yes |
| Admin | `GET /admin/users` | Yes |
| Admin | `PATCH /admin/users/:id` | Yes |
| Admin | `GET /admin/bookings` | Yes |
| Admin | `GET/POST/PATCH/DELETE /admin/categories` | Yes |
| Payments | `POST /payments/confirm` | **Server-only** (Stripe webhook) |
| Payments | `POST /payments/sslcommerz/*` | **Server-only** (gateway callbacks) |

---

## Notes

- Card data never touches the Next.js app — Stripe Checkout / SSLCommerz redirect only.
- After `POST /payments/create`, the UI navigates to `data.gatewayUrl`.
- Booking status toasts poll `GET /bookings` on customer pages (`use-booking-status-toasts.ts`).
- Middleware (`middleware.ts`) gates `/dashboard/*` by role cookie; API still enforces JWT roles.
