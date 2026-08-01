# API Integration Map

Base URL: `NEXT_PUBLIC_API_URL` (default local `http://localhost:5000/api`).  
Auth: `Authorization: Bearer <accessToken>` via `lib/api-client.ts` unless noted `skipAuth`.  
Envelope: `{ success, message, data }` — failures may include `errorDetails.issues`.

## Auth

| UI | Endpoint(s) |
|---|---|
| `app/(authGroup)/_components/login-form.tsx` | `POST /auth/login` |
| `app/(authGroup)/_components/register-form.tsx` | `POST /auth/register` |
| `hooks/use-auth.ts` / `components/auth-hydrator.tsx` | `GET /auth/me` (hydrate session) |
| Logout (navbar / dashboard shell) | Clears cookies/store only — **no** logout API |

## Public

| UI | Endpoint(s) |
|---|---|
| Landing featured services | `GET /services` |
| Landing top technicians | `GET /technicians` |
| `/services` browse + filters | `GET /services`, `GET /categories` |
| `/technicians/[id]` profile + reviews | `GET /technicians/:id` |
| Book Now panel | `POST /bookings` |

## Customer dashboard

| UI | Endpoint(s) |
|---|---|
| `/dashboard/customer` | `GET /bookings`, `GET /payments` |
| `/dashboard/customer/bookings/[id]` | `GET /bookings/:id`, `PATCH /bookings/:id/cancel`, `POST /reviews` |
| `/dashboard/customer/bookings/[id]/pay` | `GET /bookings/:id`, `POST /payments/create` → redirect `gatewayUrl` |
| `/payment/success` | Polls `GET /bookings/:id` until `PAID` |
| `/payment/cancel` | No API (retry → pay page) |

## Technician dashboard

| UI | Endpoint(s) |
|---|---|
| `/dashboard/technician` | `GET /technicians/bookings`, `GET /technicians/:id` |
| `/dashboard/technician/profile` | `GET /technicians/:id`, `PUT /technicians/profile`, then `GET /auth/me` |
| `/dashboard/technician/availability` | `GET /technicians/:id`, `PUT /technicians/availability` |
| `/dashboard/technician/services` | `GET /technicians/:id`, `GET /categories`, `POST/PATCH/DELETE /services/:id?` |
| `/dashboard/technician/bookings` | `GET /technicians/bookings`, `PATCH /technicians/bookings/:id` |

## Admin dashboard

| UI | Endpoint(s) |
|---|---|
| `/dashboard/admin` | `GET /admin/users`, `GET /admin/bookings` (stats derived client-side) |
| `/dashboard/admin/users` | `GET /admin/users`, `PATCH /admin/users/:id` |
| `/dashboard/admin/categories` | `GET/POST/PATCH/DELETE /admin/categories` |
| `/dashboard/admin/bookings` | `GET /admin/bookings` |

## Service layer ↔ hooks

| Service file | Hook file |
|---|---|
| `service/auth.service.ts` | `hooks/use-auth.ts` |
| `service/service.service.ts` | `hooks/use-services.ts` |
| `service/category.service.ts` | `hooks/use-categories.ts` |
| `service/technician.service.ts` | `hooks/use-technicians.ts` |
| `service/booking.service.ts` | `hooks/use-bookings.ts` |
| `service/payment.service.ts` | `hooks/use-payments.ts` |
| `service/review.service.ts` | `hooks/use-reviews.ts` |
| `service/admin.service.ts` | `hooks/use-admin.ts` |

## Notes

- Stripe Checkout is hosted — frontend never posts card data; webhook `POST /payments/confirm` is server-only.
- Availability is stored as freeform `string[]` (e.g. `"Monday 9AM-5PM"`).
- Middleware protects `/dashboard/*`, `/login`, `/register` with role cookies.
