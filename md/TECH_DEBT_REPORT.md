# 🧾 TECHNICAL DEBT REPORT — Bonix

Date: 2026-06-16 • Companion to [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md). Read-only register; no code changes.

Severity legend: 🔴 critical (release-blocking) · 🟠 high · 🟡 medium · 🟢 low.
Effort legend: S (≤½ day) · M (1–3 days) · L (>3 days).

---

## 1. Tooling & Process Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| T1 | 🔴 | M | **No test runner** in [`package.json`](../package.json) — only `dev`, `build`, `start`, `lint`. Add Vitest (or Jest) with `test` / `test:watch` scripts. |
| T2 | 🔴 | M | **No CI pipeline** — no `.github/workflows/*` or equivalent. Lint, typecheck, tests, build, migration apply must run on every PR. |
| T3 | 🟠 | S | No `tsc --noEmit` script; type errors only surface during `next build`. |
| T4 | 🟠 | S | No dependency update bot (Dependabot / Renovate); `next`, `@supabase/*`, `react`, `framer-motion`, `jsonwebtoken`, `bcryptjs` will drift. |
| T5 | 🟡 | S | No bundle analyzer in `next.config.ts`; no documented per-route JS budget. |
| T6 | 🟡 | S | `lint` script invokes bare `eslint`; relies on `eslint.config.mjs` defaults — no `--max-warnings 0` gate, so warnings can accumulate. |
| T7 | 🟡 | S | No `prettier` or formatter config; inconsistent spacing visible in `lib/promos.ts` (double-spaced fields) vs `app/api/*` (tight formatting). |

## 2. Security Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| S1 | 🔴 | M | [`middleware.ts`](../middleware.ts) does **not** enforce route-level role gating. `/admin/[adminID]/*`, `/merchant/[merchantId]/*`, `/agent/[agentID]/*`, `/user/[userId]/*` rely on per-page checks; any page that forgets is a privilege-escalation bug. |
| S2 | 🔴 | M | No CSRF / `Origin` header validation on any state-changing API route (`POST` / `PATCH` / `DELETE`). |
| S3 | 🔴 | M | No rate limiting on `/api/qr/*`, `/api/reservations`, `/api/auth/*`, `/login`, `/register`, `/api/merchant/apply`, `/api/agent/apply`. |
| S4 | 🟠 | M | `createAdminClient()` (service role) is used inside routes that also do auth — e.g. [`api/promos/route.ts`](../app/api/promos/route.ts) uses it for a public read, bypassing RLS. Should use the anon client or the `public_promos` RPC (migration `007`). |
| S5 | 🟠 | M | No CAPTCHA / bot protection on registration or application forms. |
| S6 | 🟠 | S | Content-Security-Policy is intentionally absent in [`next.config.ts`](../next.config.ts); needs nonce wiring for Next.js inline scripts. |
| S7 | 🟠 | S | Supabase Storage policies for `promo-images` and `merchant-logos` not reviewed in this repo: MIME whitelist, size cap, signed-URL TTL all unverified. |
| S8 | 🟡 | S | No automated RLS coverage tests — 25 migrations, all RLS-dependent, with zero programmatic verification per role. |
| S9 | 🟡 | S | [`AuthSessionSync.tsx`](../app/components/AuthSessionSync.tsx) silently retries on a non-OK `/auth/sync` response; throttled to once per minute but no escalation path. |
| S10 | 🟢 | S | `JWT_EXPIRES_IN` is read directly from `process.env` in `lib/config.ts` (line 9) without validation; mistyped values silently fall back to `7d`. |

## 3. Architectural Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| A1 | 🟠 | L | **Four near-duplicate layout components** (`{Admin,Agent,Merchant,User}AppLayout.tsx`) share ~80% structure. Extract a shared `RoleAppLayout` taking nav/items/copy config. |
| A2 | 🟠 | M | **Promo mapping fragmented** across `lib/promos.ts`, `lib/promos/get-promos.ts`, `lib/merchant-promos.ts`, `lib/preview-promos.ts`, and inline mappers in `api/promos/route.ts`. Risk: shape drift (`PromoRow` is redefined in three places). |
| A3 | 🟡 | S | Four Supabase factories all named `createClient` / `createAdminClient`. Rename to `createBrowserSupabase`, `createServerSupabase`, `createMiddlewareSupabase`, `createServiceSupabase`. |
| A4 | 🟡 | M | No global state manager; layouts re-fetch the same user profile multiple times per navigation. A lightweight server-action + React Cache or Zustand store would avoid repeat queries. |
| A5 | 🟡 | S | `lib/config.ts` mixes getters and plain literals (`jwtExpiresIn`, `reservationTTLDays`) — inconsistent surface. |
| A6 | 🟡 | M | Two separate "feed" implementations: server-rendered `app/user/[userId]/feed/page.tsx` and client-rendered `app/components/feed/PromoFeed.tsx`. Consolidate or document why both exist. |

## 4. Code-Quality Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| Q1 | 🟠 | M | **Logging is only `console.*`** — no structured logger (pino/winston), no request-id propagation, no log levels, no sink. |
| Q2 | 🟠 | M | **Empty error boundaries everywhere** — `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` exist but most route segments don't have their own `error.tsx` / `loading.tsx`. |
| Q3 | 🟡 | S | `lib/audit.ts` falls back to `console.error` on insert failure with no retry, no queue, and no escalation. |
| Q4 | 🟡 | S | `lib/supabase/middleware.ts` line 30 destructures `options` but only uses `name` and `value`; unused but doesn't break anything. |
| Q5 | 🟡 | S | `public/sw.js` declares `SW_VERSION` and never uses it — either wire to cache busting or remove. |
| Q6 | 🟡 | S | Several layout components still use raw `<img>` tags (12 occurrences from [`PerformanceOptimizations.md`](./PerformanceOptimizations.md)) — typed as quality debt because it also affects LCP. |
| Q7 | 🟡 | S | Inline mock data in many client components (e.g. `app/agent/[agentID]/merchants/page.tsx` ships hard-coded `merchants` array); needs to be loaded from Supabase or clearly marked as fixtures. |
| Q8 | 🟢 | S | `JSDoc` / inline documentation is sparse for RPC contracts (`reserve_promo`, `create_redemption`, `confirm_redemption`); only the SQL files describe behaviour. |

## 5. Feature & Completeness Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| F1 | 🟠 | M | **Nine API routes have no in-repo caller** (see [`UnusedCode.md`](./UnusedCode.md)): `api/admin/balances/{adjust,aggregate,snapshot}`, `api/admin/merchants` + `disable`, `api/admin/promos/[promoId]/disable`, `api/admin/redemptions`, `api/qr/{generate,validate,confirm}`. Either wire to UI or delete. |
| F2 | 🟠 | M | Five profile pages have unwired action buttons (admin/agent/merchant/user/shared) — see [`ErrorDebugging.md`](./ErrorDebugging.md#L18-L22). |
| F3 | 🟠 | M | `ENABLE_PAYMENT_GATEWAY` flag exists with no integration. Either ship a real gateway or document as out-of-scope. |
| F4 | 🟡 | M | `ENABLE_AFFILIATES` flag exists; entire `app/agent/[agentID]/*` tree is built but its production status is undecided. Hide UI when flag is off, or finish the flow. |
| F5 | 🟡 | S | No `loading.tsx` for slow data routes (feed, dashboards, admin tables); UX shows blank during navigation. |
| F6 | 🟡 | S | PWA: cache versioning unimplemented (`SW_VERSION` unused), no offline fallback page, install prompt not exercised in CI. |
| F7 | 🟡 | M | No accessibility pass on record — icon-only buttons across layouts lack `aria-label` audit. |

## 6. Data & Operations Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| D1 | 🟠 | M | No documented Supabase backup / restore runbook. |
| D2 | 🟠 | M | No scheduled job to expire stale reservations (15-day TTL) or recompute merchant balance aggregates — both rely on on-demand RPCs. |
| D3 | 🟡 | S | No staging Supabase project documented; same project likely serves dev + early users. |
| D4 | 🟡 | S | No soft-delete / archival strategy for `users`, `merchants`, `promos`, `reservations`, `redemptions`. Hard deletes break audit trails. |
| D5 | 🟡 | S | Timezone handling not verified end-to-end (store UTC, render in user locale). |
| D6 | 🟢 | S | No documented data-retention policy for `audit_logs` or `redemptions` (PII implications). |

## 7. Compliance Debt

| ID | Sev | Effort | Item |
|----|-----|--------|------|
| L1 | 🟠 | M | No Terms of Service, Privacy Policy, or Cookie Policy pages; no footer links. |
| L2 | 🟠 | M | No GDPR-style data export / delete-account flow for USER role. |
| L3 | 🟡 | S | No consent banner; safe today because no third-party analytics are loaded, but blocks launch if/when they are added. |

---

## Remediation Roadmap (suggested order)

1. **Block release**: S1, S2, S3, T1, T2, F1 (decide each route's fate).
2. **Stabilise**: S4, S6, S7, Q1, Q2, D1, D2.
3. **Refactor**: A1, A2, A3, A6.
4. **Polish & comply**: F2–F7, L1–L3, Q3–Q8, D3–D6, T3–T7.

Each numbered item maps back to a granular checkbox in [`ProductionReadiness.md`](./ProductionReadiness.md), [`PerformanceOptimizations.md`](./PerformanceOptimizations.md), [`ErrorDebugging.md`](./ErrorDebugging.md), or [`UnusedCode.md`](./UnusedCode.md) where one already exists.
