## 🔧 CODEBASE CLEANUP TASK LIST ###
🗑️ Unused Code to Remove
- [ ] [lib/promos.ts](lib/promos.ts#L56) - unused parameter `index` in `mapPromoRowToCard()` — 🗑️ Safe to delete (remove param or rename to `_index`).
- [ ] [lib/supabase/middleware.ts](lib/supabase/middleware.ts#L25) - unused destructured `options` in cookies loop — 🗑️ Safe to delete (drop from the first `forEach` destructure).
- [ ] [public/sw.js](public/sw.js#L1) - unused constant `SW_VERSION` — ⚠️ Possibly unused (keep only if you plan cache versioning).
- [ ] [app/api/admin/balances/adjust/route.ts](app/api/admin/balances/adjust/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/balances/aggregate/route.ts](app/api/admin/balances/aggregate/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/balances/snapshot/route.ts](app/api/admin/balances/snapshot/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/merchants/route.ts](app/api/admin/merchants/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/merchants/[merchantId]/disable/route.ts](app/api/admin/merchants/[merchantId]/disable/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/promos/[promoId]/disable/route.ts](app/api/admin/promos/[promoId]/disable/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/admin/redemptions/route.ts](app/api/admin/redemptions/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (likely invoked by external admin tooling).
- [ ] [app/api/qr/confirm/route.ts](app/api/qr/confirm/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (only if QR flow is wired).
- [ ] [app/api/qr/generate/route.ts](app/api/qr/generate/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (only if QR flow is wired).
- [ ] [app/api/qr/validate/route.ts](app/api/qr/validate/route.ts#L1) - API route has no in-repo callers — 📦 Used conditionally (only if QR flow is wired).
