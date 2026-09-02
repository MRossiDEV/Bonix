# 🔎 PROJECT AUDIT — Bonix

Date: 2026-06-16 • Scope: full repository at `d:\DEV\bonix` • Read-only audit (no code changes).

Cross-references: [`ProductionReadiness.md`](./ProductionReadiness.md) · [`PerformanceOptimizations.md`](./PerformanceOptimizations.md) · [`ErrorDebugging.md`](./ErrorDebugging.md) · [`UnusedCode.md`](./UnusedCode.md) · [`TECH_DEBT_REPORT.md`](./TECH_DEBT_REPORT.md)

---

## 1. Architecture Overview

### Stack
- **Framework**: Next.js 16.1.6 (App Router) on React 19.2.3, TypeScript 5.
- **Data**: Supabase (PostgreSQL + Auth + Storage), accessed via `@supabase/ssr` (browser, server, middleware) and `@supabase/supabase-js` (admin / service-role).
- **Styling**: Tailwind v4 (`@tailwindcss/postcss`), Poppins via `next/font`.
- **Auth crypto**: `jsonwebtoken`, `bcryptjs`. **QR**: `qrcode` + an in-repo HMAC-SHA256 signer in [`lib/qr.ts`](../lib/qr.ts).
- **UI motion / icons**: `framer-motion`, `lucide-react`.
- **PWA**: hand-written [`public/sw.js`](../public/sw.js) + [`app/manifest.ts`](../app/manifest.ts) + [`app/components/ServiceWorkerRegistration.tsx`](../app/components/ServiceWorkerRegistration.tsx).
- **Tooling**: ESLint 9 (`eslint-config-next`). **No test runner, no CI workflow.**

### Routing model
Role-scoped App Router segments under dynamic role IDs:
- `app/admin/[adminID]/*` — admin console (agents, merchants, users, promos, settings, dashboard, profile).
- `app/agent/[agentID]/*` — affiliate / agent UI (dashboard, merchants, offers, reports, audits, academy, activity, updates, profile).
- `app/merchant/[merchantId]/*` — merchant ops (dashboard, qr, redemptions, stats, list, plans, staff, notifications, settings, profile, support, company-profile).
- `app/user/[userId]/*` — end-user UI (feed, reservations, wallet, nearby, profile, merchant, agent, apply).
- Shared / unscoped: `/feed`, `/wallet`, `/reservations`, `/profile`, `/nearby`, `/merchant`, `/promo/[slug]`, `/login`, `/register`, `/install`.

### API surface (`app/api/*`)
- `admin/{agents,balances/{adjust,aggregate,snapshot},merchants/[merchantId]/disable,merchants,promo-requests,promos/[promoId]/disable,redemptions,settings}`.
- `agent/apply`, `analytics/merchant-profile`, `favorites`.
- `merchant/{apply,businesses,businesses/[businessId],logo,promos,promos/[id],promos/upload}`.
- `promos`, `reservations`, `qr/{generate,validate,confirm}`.
- `auth/{callback,sync}`.

### Cross-cutting libs (`lib/`)
- `env.ts` — fail-fast env getters (placeholder + min-length checks).
- `config.ts` — typed view of `env.ts` + feature flags + reservation TTL.
- `supabase/{client,server,middleware,admin}.ts` — four distinct Supabase clients.
- `qr.ts` — HMAC-SHA256 token sign/verify with `crypto.timingSafeEqual`.
- `audit.ts` — `audit_logs` insert with structured error logging.
- `promos.ts`, `promos/get-promos.ts`, `merchant-promos.ts`, `preview-promos.ts`, `promo-activity-state.ts`, `promo-image.ts` — promo mapping / fetching / image resolution.
- `admin.ts`, `auth-profile.ts`, `platform-settings.ts` — admin RPCs, profile fetch helpers, settings cache.
- `types.ts`, `database.types.ts`, `../types/promos.ts` — domain enums and DB row types.

### Database (`supabase/migrations`)
25 sequential migrations (`001_initial_schema.sql` → `025_merchant_profile_fields.sql`) covering: schema, RLS, RPCs (`reserve_promo`, `create_redemption`, `confirm_redemption`), wallet/payment rules, balance aggregation, public promos RPC, multi-role system, promo image storage, platform settings, edit-request workflow, merchant logos, multi-merchant accounts, default promo image, activity state, user favorites, merchant profile fields. Seed: `seed.mock.sql`.

### State management
No global store. Server Components fetch via Supabase server client; Client Components own local UI state with `useState` / `useMemo` / `useRef`. Auth session refresh is driven by [`AuthSessionSync`](../app/components/AuthSessionSync.tsx) mounted in `app/layout.tsx`. Session cookies handled by [`middleware.ts`](../middleware.ts) → [`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts).

### Environment variables (validated in [`lib/env.ts`](../lib/env.ts))
Required (boot-blocking): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `QR_TOKEN_SECRET`.
Optional with defaults: `JWT_EXPIRES_IN` (`7d`), `QR_TOKEN_TTL_MINUTES` (`10`), `PLATFORM_FEE` (`3`), `AFFILIATE_FEE` (`5`), `ENABLE_WALLET`, `ENABLE_AFFILIATES`, `ENABLE_PAYMENT_GATEWAY`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`.

### Third-party dependencies (production)
`@supabase/ssr 0.8`, `@supabase/supabase-js 2.95`, `bcryptjs 3`, `framer-motion 12`, `jsonwebtoken 9`, `lucide-react 1.16`, `nanoid 5`, `next 16.1.6`, `qrcode 1.5`, `react 19.2.3`, `react-dom 19.2.3`.

---

## 2. Unused Files / Dead Code

Confirmed from [`UnusedCode.md`](./UnusedCode.md) and re-verified against the repo:
- `lib/promos.ts` — unused `index` parameter in `mapPromoRowToCard` (already removed in current source; entry is stale).
- `lib/supabase/middleware.ts` — unused destructured `options` in the first cookies `forEach` (line 30).
- `public/sw.js` — `SW_VERSION` constant declared but never referenced for cache busting.
- **Nine API routes with no in-repo callers** — either consumed by an external admin tool, or genuine dead code. Each needs a definitive yes/no:
  - `api/admin/balances/{adjust,aggregate,snapshot}/route.ts`
  - `api/admin/merchants/route.ts`, `api/admin/merchants/[merchantId]/disable/route.ts`
  - `api/admin/promos/[promoId]/disable/route.ts`, `api/admin/redemptions/route.ts`
  - `api/qr/{generate,validate,confirm}/route.ts`
- `lib/preview-promos.ts` — only used by the install / preview path; verify it is still reachable after PWA changes.

No `*.bak`, generated bundles, or stray scripts were found in the working tree.

---

## 3. Duplicate Functionality

- **Four near-identical layout components** — `AdminAppLayout.tsx`, `AgentAppLayout.tsx`, `MerchantAppLayout.tsx`, `UserAppLayout.tsx` share ~80% of their structure (header, side drawer, avatar quick-menu, nav items, body lock effect, `LogoutButton` slot). The only deltas are `navItems`, `pageTitles`, `sideMenuItems`, and copy. A shared `RoleAppLayout` taking a `config` prop would remove hundreds of duplicated lines.
- **Promo fetching** is split across `lib/promos.ts`, `lib/promos/get-promos.ts`, `lib/merchant-promos.ts`, `lib/preview-promos.ts`, and the `api/promos` and `api/merchant/promos` route handlers — each with its own row-shape mapper. A single shared mapper + typed selector would eliminate the drift visible in [`api/promos/route.ts`](../app/api/promos/route.ts) (which redefines `PromoRow` locally).
- **Supabase clients** — `lib/supabase/{client,server,middleware,admin}.ts` are all named `createClient` / `createAdminClient`. Import-site disambiguation works today but is error-prone; consider distinct names (`createBrowserSupabase`, `createServerSupabase`, …).
- **Profile pages** — `app/{admin,agent,merchant,user}/[…]/profile/page.tsx` plus the shared `app/profile/page.tsx` repeat the same "avatar + action buttons" layout, all with the same unwired action buttons flagged in [`ErrorDebugging.md`](./ErrorDebugging.md).
- **`<img>` vs `next/image`** — at least 12 raw `<img>` tags across layouts and profile pages where `next/image` is already in use elsewhere (see [`PerformanceOptimizations.md`](./PerformanceOptimizations.md)).

---

## 4. Technical Debt

Itemised separately in [`TECH_DEBT_REPORT.md`](./TECH_DEBT_REPORT.md). Headline items:
- No automated tests, no CI/CD.
- 25 migrations with no programmatic RLS coverage tests.
- Layout duplication and promo-mapping duplication.
- ~9 API endpoints with unclear ownership.
- `console.*` is the only logging surface.

---

## 5. Security Concerns

- ✅ Secrets fail-fast in [`lib/env.ts`](../lib/env.ts) (placeholder + 16-char min). `lib/config.ts` no longer ships hard-coded fallbacks.
- ✅ QR tokens use HMAC-SHA256 with `timingSafeEqual` comparison and a TTL ([`lib/qr.ts`](../lib/qr.ts)).
- ✅ Baseline security headers (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`) set in [`next.config.ts`](../next.config.ts). **CSP intentionally deferred** (needs nonce wiring).
- ⚠️ [`middleware.ts`](../middleware.ts) only refreshes the Supabase session. **No route-level role gating** for `/admin/*`, `/merchant/*`, `/agent/*`, `/user/[id]/*` — every page must re-check, and any page that forgets is a privilege-escalation risk.
- ⚠️ **No CSRF / Origin validation** on any state-changing route (`POST` / `PATCH` / `DELETE`). Supabase cookies are `SameSite=Lax` by default, but cross-site `POST` from a malicious form is not blocked.
- ⚠️ **No rate limiting** on `/api/qr/*`, `/api/reservations`, `/api/auth/*`, `/login`, `/register`. QR brute-force is bounded by HMAC strength but reservation spam is not.
- ⚠️ `createAdminClient()` (service-role) is invoked in routes that also perform role checks (e.g. [`api/qr/confirm/route.ts`](../app/api/qr/confirm/route.ts), [`api/promos/route.ts`](../app/api/promos/route.ts)). Audit each call site to make sure auth + role are enforced **before** any admin-client query that exposes data.
- ⚠️ Supabase Storage policies for `promo-images` / `merchant-logos` need an explicit MIME whitelist, size cap, and signed-URL TTL review.
- ⚠️ Audit logging ([`lib/audit.ts`](../lib/audit.ts)) falls back to `console.error` on failure — fine for dev, insufficient for production (no queue, no alerting).
- ⚠️ Empty session-storage `catch` blocks in [`AuthSessionSync.tsx`](../app/components/AuthSessionSync.tsx) are now throttled-logged, but failures still result in repeated `/auth/sync` POSTs (the cache write is what prevents the loop).
- ⚠️ No CAPTCHA / bot protection on `/register` or `/api/merchant/apply`, `/api/agent/apply`.

---

## 6. Scalability Concerns

- **Service-role over-reach** — `api/promos/route.ts` uses the admin client for what is a public read; this bypasses RLS and concentrates all read load on a single privileged path. Prefer the anon client + the `public_promos` RPC (migration `007`).
- **No pagination on the feed UI** — `app/user/[userId]/feed/page.tsx` and `PromoFeed.tsx` render all loaded promos via `.map()` (see [`PerformanceOptimizations.md`](./PerformanceOptimizations.md#L20-L22)); fine at <50 items, breaks at scale.
- **No `sold_out_duration` index plan** — `api/promos/route.ts` fans out a second query for sold-out promos and walks all reservations to compute durations; needs an index on `reservations(promo_id, created_at desc)` and ideally a materialised column on `promos`.
- **No CDN/cache strategy** documented for promo images (Supabase Storage public URLs are used directly).
- **No background workers** — reservation expiry (15-day TTL) and balance aggregation rely on RPCs called on demand; needs Supabase cron / Edge Functions for guaranteed eventual consistency.
- **Single Supabase project** — no documented split between staging and production; running migrations against the same project is risky for live traffic.

---

## 7. Performance Bottlenecks

See [`PerformanceOptimizations.md`](./PerformanceOptimizations.md) for line-level items. Highlights:
- All four layout components used `setState` in a `pathname` effect causing cascading renders — **fixed** during the recent pass (see end of session summary), but `PromoCard` is still not `React.memo`-wrapped so toggling `modalOpen` re-renders the entire list.
- ~12 `<img>` tags (layouts + profile pages + promo hero) bypass `next/image`, hurting LCP and bandwidth.
- `framer-motion` is imported in every layout — ~50KB gz of motion shipped on every authenticated page; candidate for `next/dynamic`.
- `api/promos/route.ts` performs two sequential round-trips when sold-out promos exist; can be one RPC.
- No `revalidate` directives on server-side `fetch` / Supabase calls — every request hits the DB.
- No bundle analyzer run on record; no documented per-route JS budget.

---

## 8. Recommended Improvements (prioritised)

| # | Area | Action | Owner of detail |
|---|------|--------|------|
| 1 | Security | Add route-level role gating in `middleware.ts`; add CSRF/origin check + rate limiting on `/api/*` mutations. | ProductionReadiness §🔐 |
| 2 | Testing | Add Vitest + Supabase pgTAP; cover `lib/qr.ts`, RPCs, and the reserve→QR→confirm happy path. | ProductionReadiness §🧪 |
| 3 | CI/CD | GitHub Actions: `lint`, `tsc --noEmit`, `test`, `build`, migration apply on PR. | ProductionReadiness §🔁 |
| 4 | Observability | Sentry + structured logger + request-id middleware; replace `console.*`. | ProductionReadiness §📈 |
| 5 | Refactor | Extract shared `RoleAppLayout`; consolidate promo mappers; rename Supabase factory functions. | TECH_DEBT §Duplication |
| 6 | Cleanup | Decide on the 9 unreferenced API routes — wire to UI or delete; remove `SW_VERSION` or use it. | UnusedCode.md |
| 7 | Performance | `React.memo` for `PromoCard`; `next/image` migration; paginate feed; `next/dynamic` for motion-heavy modals. | PerformanceOptimizations.md |
| 8 | Data ops | Supabase backups + restore drill; scheduled jobs for reservation expiry + balance aggregation. | ProductionReadiness §🗄️ |
| 9 | Compliance | ToS, Privacy, Cookie pages; GDPR export/delete for USER role. | ProductionReadiness §📜 |
| 10 | DX | `.env.production` template, dependency bots, bundle analyzer, README updates. | ProductionReadiness §🧰 |

---

_End of audit. See [`TECH_DEBT_REPORT.md`](./TECH_DEBT_REPORT.md) for the itemised debt register._
