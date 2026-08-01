# AGENTS.md — FixItNow Web

Condensed rules for agents working in `FixItNow-web-pro`.

## Ground rules

1. **Never auto-commit or push.** Suggest a commit message and wait. The human runs git.
2. **Stop after each checkpoint** when following `AI_BUILD_PROMPT.md` — report what shipped, how to test, suggested commit message.
3. Prefer small, reviewable diffs. Match existing folder and UI patterns.
4. Do not invent backend endpoints. Handle known gaps (no admin stats API, no avatar upload, freeform availability strings, no refresh/logout API).

## Stack

- Next.js App Router, React 19, Tailwind v4, shadcn (Base UI), TanStack Query, Zustand, RHF + Zod, sonner
- API: `NEXT_PUBLIC_API_URL` → Express/Prisma FixItNowPro (`{ success, message, data }`)
- Auth cookies: `fixitnow_token`, `fixitnow_role` (middleware-readable)

## Folder conventions

- Route groups: `(authGroup)`, `(dashboardGroup)`, `(publicGroup)`
- Colocate `_components/` under feature routes; shared UI in `components/`
- Data: `service/*.ts` → `hooks/*.ts` → pages
- Types mirror backend in `lib/types.ts`

## Roles & dashboards

| Role | Dashboard root |
|---|---|
| CUSTOMER | `/dashboard/customer` |
| TECHNICIAN | `/dashboard/technician` |
| ADMIN | `/dashboard/admin` |

Middleware enforces role segments. Seed admin: `admin@fixitnow.com` / `Admin@1234`.

## Booking flow

`REQUESTED` → `ACCEPTED` → `PAID` → `IN_PROGRESS` → `COMPLETED`  
(+ `DECLINED` / `CANCELLED`). Pay via Stripe Checkout redirect; success polls until `PAID`.

## UI notes

- Shared `<BookingStatusBadge />` for all status colors
- Prefer skeletons / empty states / error states — never blank screens
- Forms: RHF + Zod; map `errorDetails.issues` with `applyApiFieldErrors`
- Theme: light default; toggle via `next-themes` (`ThemeToggle`)
- Avoid purple/cream AI-cliché aesthetics; keep cards minimal

## Docs

- Full build prompt: `AI_BUILD_PROMPT.md`
- Endpoint ↔ page map: `API_INTEGRATION.md`
- Env template: `.env.example`
