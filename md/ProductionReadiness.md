## 🚀 PRODUCTION READINESS TASK LIST

This file consolidates the work required to take Bonix from internal alpha to a production-grade release.
For granular code-level items see [`PerformanceOptimizations.md`](./PerformanceOptimizations.md), [`ErrorDebugging.md`](./ErrorDebugging.md) and [`UnusedCode.md`](./UnusedCode.md).

### 🔐 Security & Secrets
- [ ] [lib/config.ts](../lib/config.ts#L5-L9) — remove `'default-secret-key'` and `'default-qr-secret'` fallbacks; fail fast at boot if `JWT_SECRET` / `QR_TOKEN_SECRET` are missing.
- [ ] [lib/config.ts](../lib/config.ts) — add a Zod (or manual) env schema validated on startup; surface clear errors for missing/invalid values.
- [ ] [lib/supabase/admin.ts](../lib/supabase/admin.ts) — audit every caller of `createAdminClient()` to ensure it is only reachable from server routes that have already enforced auth + role checks.
- [ ] [middleware.ts](../middleware.ts) — extend middleware to enforce route-level role gating (`/admin`, `/merchant`, `/agent`, `/user/[id]`) instead of relying solely on per-page checks.
- [ ] Add CSRF protection / `Origin` header validation for all state-changing API routes (`POST`/`PATCH`/`DELETE`).
- [ ] Add rate limiting (e.g. Upstash Ratelimit or middleware) on `/api/qr/*`, `/api/auth/*`, `/api/reservations`, login and registration endpoints.
- [ ] Add security headers in [next.config.ts](../next.config.ts) — `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] Rotate any secrets that ever lived in the repo / dev `.env` before going live.
- [ ] Review Supabase Storage bucket policies for `promo-images` and `merchant-logos`; confirm size limits, MIME whitelisting, and signed-URL TTLs.
- [ ] Confirm all 25 migrations have RLS coverage; add automated tests that hit each table as USER / MERCHANT / ADMIN to verify policies.

### 🧰 Environment & Configuration
- [ ] Create a committed `.env.example` listing every variable from [README.md](../README.md#L87-L101) (also referenced in [ErrorDebugging.md](./ErrorDebugging.md#L37)).
- [ ] Document and provision separate Supabase projects for `staging` and `production`.
- [ ] Add `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, and monitoring DSNs to the deployment platform (Vercel project settings or equivalent).
- [ ] Verify feature flags (`ENABLE_WALLET`, `ENABLE_AFFILIATES`, `ENABLE_PAYMENT_GATEWAY`) behave correctly when disabled — write smoke tests per flag.

### 🧪 Testing
- [ ] Add a unit-test runner (Vitest or Jest) to [package.json](../package.json#L5-L10) with `test` and `test:watch` scripts.
- [ ] Cover [lib/qr.ts](../lib/qr.ts) — token signing, expiry, tampering rejection.
- [ ] Cover [lib/promos.ts](../lib/promos.ts), [lib/promo-activity-state.ts](../lib/promo-activity-state.ts), [lib/merchant-promos.ts](../lib/merchant-promos.ts) — pricing, cashback math, status transitions.
- [ ] Add integration tests for the QR flow: `/api/qr/generate` → `/api/qr/validate` → `/api/qr/confirm` (happy path, expired token, replay attempt, wrong merchant, wrong payment type).
- [ ] Add integration tests for `/api/reservations` (15-day TTL, duplicate prevention, capacity limits).
- [ ] Add integration tests for `/api/admin/balances/{adjust,aggregate,snapshot}` and `/api/admin/{merchants,promos}/.../disable`.
- [ ] Add Playwright (or Cypress) end-to-end tests for the three role journeys: user reserve→QR→wallet, merchant scan→confirm, admin disable promo.
- [ ] Add a SQL-level test suite (pgTAP or `supabase test db`) for RPCs `reserve_promo`, `create_redemption`, `confirm_redemption`.

### 🔁 CI / CD
- [ ] Add a GitHub Actions (or equivalent) workflow that runs on every PR: `npm ci`, `npm run lint`, `tsc --noEmit`, `npm test`, `npm run build`.
- [ ] Add a migration-check job that applies every file in [supabase/migrations](../supabase/migrations) against a throwaway Postgres to catch drift.
- [ ] Add a preview-deployment step (Vercel preview or Docker image) per PR with an isolated Supabase branch.
- [ ] Add a production deploy workflow gated on manual approval + green checks.
- [ ] Add Dependabot / Renovate for `next`, `@supabase/*`, `react`, `framer-motion`, `jsonwebtoken`, `bcryptjs`.

### 📈 Observability
- [ ] Integrate an error reporter (Sentry or equivalent) on both client and server; wire it into the empty `catch` blocks called out in [ErrorDebugging.md](./ErrorDebugging.md#L3-L5).
- [ ] Replace `console.*` calls with a structured logger (e.g. `pino`) carrying `request_id`, `user_id`, `role`.
- [ ] Emit a `request_id` header from middleware and propagate it through API responses and audit logs.
- [ ] Extend [lib/audit.ts](../lib/audit.ts) — handle insertion failures instead of silently swallowing them; add retry/queue or fallback to logger.
- [ ] Add uptime + synthetic monitoring for `/`, `/feed`, `/login`, `/api/promos`, `/api/qr/generate`.
- [ ] Add basic web-vitals reporting (LCP, INP, CLS) via `next/web-vitals` to the analytics sink.

### 🧱 Application Completeness
- [ ] Wire up logout handlers across all four layouts and the quick-menu variants (8 items in [ErrorDebugging.md](./ErrorDebugging.md#L10-L17)) using [app/components/LogoutButton.tsx](../app/components/LogoutButton.tsx).
- [ ] Implement or remove the non-functional profile action buttons across admin / agent / merchant / user / shared profile pages ([ErrorDebugging.md](./ErrorDebugging.md#L18-L22)).
- [ ] Confirm all admin endpoints flagged in [UnusedCode.md](./UnusedCode.md#L6-L12) are reachable from the admin UI — either build the UI or delete the routes.
- [ ] Confirm the QR flow endpoints in [UnusedCode.md](./UnusedCode.md#L13-L15) are wired into the merchant scanner and user reservation pages.
- [ ] Resolve `ENABLE_PAYMENT_GATEWAY` — either integrate a real gateway (Stripe / local provider) behind the flag or document it as out-of-scope for v1.
- [ ] Resolve `ENABLE_AFFILIATES` — finish the agent flow or hide all agent UI when the flag is off.
- [ ] Add user-facing error boundaries (`error.tsx`) and `not-found.tsx` for each route segment that currently lacks them.
- [ ] Add loading skeletons (`loading.tsx`) for slow data routes — feed, merchant dashboard, admin tables.
- [ ] Verify the PWA: [public/sw.js](../public/sw.js), [app/manifest.ts](../app/manifest.ts), install prompt, offline fallback, and cache versioning (see [UnusedCode.md](./UnusedCode.md#L5)).
- [ ] Run an accessibility pass (axe / Lighthouse) on each role's main pages; fix contrast, focus order, and ARIA labels on icon-only buttons.
- [ ] Add internationalisation scaffolding if multi-language is required for launch; otherwise lock copy to one locale and remove stray translations.

### 🎯 Performance
- [ ] Complete every item in [PerformanceOptimizations.md](./PerformanceOptimizations.md) (image migrations, `React.memo`, pagination/virtualization, layout effect guards).
- [ ] Audit database indexes for the hottest queries: `promos` by `status` + `merchant_id`, `reservations` by `user_id` + `status`, `redemptions` by `qr_token` + `reservation_id`.
- [ ] Use `next/dynamic` for heavy client-only components (QR scanner, framer-motion-heavy modals) to shrink first load JS.
- [ ] Set `revalidate` / `cache: 'no-store'` deliberately on each `fetch`/`supabase` call in server components.
- [ ] Run `next build --profile` and review the bundle analyzer output; budget < 200 KB JS per route.

### 🗄️ Data & Operations
- [ ] Enable Supabase automated backups + verify a documented restore procedure.
- [ ] Write a runbook for: revoking a leaked secret, disabling a merchant, rolling back a migration, replaying a failed redemption.
- [ ] Add a soft-delete / archival strategy for `users`, `merchants`, `promos`, `reservations`, `redemptions`.
- [ ] Add scheduled jobs (Supabase cron / Edge Functions) to expire stale reservations and recompute merchant balance aggregates.
- [ ] Confirm timezone handling end-to-end — store UTC, render in user locale, and verify with at least one non-UTC test.

### 📜 Legal & Compliance
- [ ] Add Terms of Service, Privacy Policy, and Cookie Policy pages; link from footer and registration.
- [ ] Implement GDPR-style data export and delete-account flows for the USER role.
- [ ] Document data retention for `audit_logs`, `redemptions`, and PII fields on `users` / `merchants`.
- [ ] Add a consent banner if any third-party analytics or marketing scripts are loaded.

### 📦 Release Checklist (final gate)
- [ ] `npm run lint` clean ([ErrorDebugging.md](./ErrorDebugging.md#L35)).
- [ ] `npm run build` clean with no type errors ([ErrorDebugging.md](./ErrorDebugging.md#L36)).
- [ ] All migrations applied to production Supabase; row counts and RLS checks pass.
- [ ] Smoke test on staging: register → reserve → QR → merchant confirm → wallet credit → admin sees redemption.
- [ ] Monitoring dashboards green for 24h on staging with synthetic traffic.
- [ ] Tag release, freeze main, deploy, monitor error rate for the first hour.
