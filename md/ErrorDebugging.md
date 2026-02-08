## 🔧 CODEBASE CLEANUP TASK LIST ###
### 🛠️ Debug & Fixes
- [ ] [app/components/AuthSessionSync.tsx](app/components/AuthSessionSync.tsx#L31) - empty `catch` block suppresses storage errors; log to monitoring with throttling or add fallback behavior.
- [ ] [app/components/AuthSessionSync.tsx](app/components/AuthSessionSync.tsx#L50) - non-OK `/auth/sync` response is ignored; add error handling and a user-safe fallback.
- [ ] [app/components/AuthSessionSync.tsx](app/components/AuthSessionSync.tsx#L53) - empty `catch` block suppresses storage errors after sync; add logging or fallback.
- [ ] [app/install/page.tsx](app/install/page.tsx#L41) - JSX text contains unescaped quotes; escape to satisfy lint and avoid HTML parsing issues.
- [ ] [app/page.tsx](app/page.tsx#L80) - JSX text contains an unescaped apostrophe; escape to satisfy lint and avoid HTML parsing issues.

### 🧪 Incomplete Logic
- [ ] [app/components/AdminAppLayout.tsx](app/components/AdminAppLayout.tsx#L263) - Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/AdminAppLayout.tsx](app/components/AdminAppLayout.tsx#L305) - Quick menu Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/AgentAppLayout.tsx](app/components/AgentAppLayout.tsx#L263) - Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/AgentAppLayout.tsx](app/components/AgentAppLayout.tsx#L305) - Quick menu Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/MerchantAppLayout.tsx](app/components/MerchantAppLayout.tsx#L263) - Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/MerchantAppLayout.tsx](app/components/MerchantAppLayout.tsx#L305) - Quick menu Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/UserAppLayout.tsx](app/components/UserAppLayout.tsx#L263) - Logout button has no handler; wire to sign-out flow.
- [ ] [app/components/UserAppLayout.tsx](app/components/UserAppLayout.tsx#L305) - Quick menu Logout button has no handler; wire to sign-out flow.
- [ ] [app/admin/[adminID]/profile/page.tsx](app/admin/[adminID]/profile/page.tsx#L85) - profile settings buttons have no handlers; add navigation or change to non-interactive elements.
- [ ] [app/agent/[agentID]/profile/page.tsx](app/agent/[agentID]/profile/page.tsx#L105) - profile preference buttons have no handlers; add navigation or change to non-interactive elements.
- [ ] [app/merchant/[merchantId]/profile/page.tsx](app/merchant/[merchantId]/profile/page.tsx#L104) - profile action buttons have no handlers; add navigation or change to non-interactive elements.
- [ ] [app/user/[userId]/profile/page.tsx](app/user/[userId]/profile/page.tsx#L88) - profile action buttons have no handlers; add navigation or change to non-interactive elements.
- [ ] [app/profile/page.tsx](app/profile/page.tsx#L23) - profile action buttons have no handlers; add navigation or change to non-interactive elements.
- [ ] [app/api/admin/balances/adjust/route.ts](app/api/admin/balances/adjust/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/balances/aggregate/route.ts](app/api/admin/balances/aggregate/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/balances/snapshot/route.ts](app/api/admin/balances/snapshot/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/merchants/route.ts](app/api/admin/merchants/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/merchants/[merchantId]/disable/route.ts](app/api/admin/merchants/[merchantId]/disable/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/promos/[promoId]/disable/route.ts](app/api/admin/promos/[promoId]/disable/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/admin/redemptions/route.ts](app/api/admin/redemptions/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/qr/confirm/route.ts](app/api/qr/confirm/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/qr/generate/route.ts](app/api/qr/generate/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.
- [ ] [app/api/qr/validate/route.ts](app/api/qr/validate/route.ts#L1) - endpoint not referenced in repo; verify external usage or remove.

### ✅ Production Prep
- [ ] [package.json](package.json) - run `npm run lint` and fix reported issues before release.
- [ ] [package.json](package.json) - run `npm run build` to validate production bundles and tree-shaking.
- [ ] [.env.example](.env.example) - create `.env.production` with required keys and validate it in CI/CD.
- [ ] [next.config.ts](next.config.ts) - if switching to `next/image`, add allowed remote image domains or patterns.
