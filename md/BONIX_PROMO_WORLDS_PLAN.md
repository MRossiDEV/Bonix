# Bonix Promo Worlds Upgrade Plan

## 1. Executive Summary

This plan upgrades the existing Bonix platform from a traditional promo card experience into a reusable 3D promotional discovery engine. The goal is to add a mobile-first, lightweight, data-driven Promo World layer without replacing the current Bonix transaction model.

The upgrade is designed around the current architecture:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- Existing promo, wallet, and merchant workflows

The fundamental design principle is:

> 3D is for discovery and engagement. Traditional UI remains for details, claims, and wallet actions.

---

## 2. Product Goals

### User outcomes

- Users can discover business promotions through an interactive 3D mini-scene.
- Users can identify interactive promotion objects and tap them quickly.
- Users can view offer details and claim promotions in a standard Bonix flow.
- Users are always served a fallback non-3D experience when performance is poor.

### Merchant outcomes

- Merchants can select a scene template rather than building a custom 3D experience.
- Merchants can assign promotions to fixed promo slots inside a template.
- Merchants can publish or unpublish their Promo World without developer involvement.

### Platform outcomes

- The model is reusable across businesses with the same scene template.
- Promotions are bound to objects dynamically from the database.
- Analytics can measure discovery, interaction, and conversion behavior.

---

## 3. Scope and Non-Goals

### In scope for MVP

- Reusable Promo World engine
- Three default scene templates:
  - Burger Restaurant
  - Coffee Shop
  - Pizza Restaurant
- Dynamic slot assignment
- Promotion detail sheet / modal
- Claim flow into the existing wallet
- Mobile-friendly camera and interaction controls
- Loading fallback and performance safeguards
- Analytics for world views, object clicks, and claims
- Merchant admin configuration flow

### Out of scope for MVP

- Multiplayer or shared world navigation
- Full custom 3D model creation per business
- Realtime live-world environments
- VR/AR features
- Full custom asset pipeline for every merchant
- Cross-business district navigation

---

## 4. Core Architecture

### 4.1 Application layer

Add a new `promo-world` feature domain beside the current merchant, user, and admin flows.

Suggested structure:

```text
app/
  api/
    promo-world/
      templates/
      worlds/
      claims/
      analytics/
  components/
    promo-world/
      PromoWorld.tsx
      PromoWorldCanvas.tsx
      PromoWorldFallback.tsx
      SceneLoader.tsx
      SceneCamera.tsx
      InteractiveObject.tsx
      PromoObject.tsx
      MysteryObject.tsx
      PromoDetailsSheet.tsx
      ClaimSuccess.tsx
    promotion/
      PromotionSheet.tsx
      PromotionDetails.tsx
      ClaimPromotion.tsx
```

### 4.2 Data model additions

The platform will need a new tier of entities to separate templates and business-specific world configurations.

#### New tables

- `promo_world_templates`
- `promo_worlds`
- `promo_world_slots`
- `promo_world_objects`
- `promo_world_interactions`
- `promo_world_claims`

#### Proposed core schema

```ts
interface PromoWorld {
  id: string;
  businessId: string;
  sceneTemplateId: string;
  status: "draft" | "published";
  configuration: SceneConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

interface SceneTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  modelUrl: string;
  slots: PromoSlot[];
  cameraConfig: CameraConfig;
}

interface PromoSlot {
  id: string;
  name: string;
  objectId: string;
  position: { x: number; y: number; z: number };
  supportedPromoTypes: PromoType[];
}
```

### 4.3 Business logic

- A template defines the environment and slot layout.
- A world binds the template to a business.
- Each object slot can contain a promotion or a mystery reward item.
- The claim flow should continue to go through the existing Bonix wallet and redemption logic.

---

## 5. Database and Backend Plan

### Phase 1 tasks

1. Add migration files for new tables and indexes.
2. Add RLS policies for world visibility, merchant configuration, and user world reads.
3. Create RPCs or queries to fetch:
   - published world by merchant
   - scene template metadata
   - slot-to-promotion mapping
   - object interaction analytics
4. Add claim protection for duplicate claims.

### Required backend endpoints

- `GET /api/promo-world/templates`
- `GET /api/promo-world/[worldId]`
- `POST /api/promo-world/[worldId]/publish`
- `POST /api/promo-world/[worldId]/assign-slot`
- `POST /api/promo-world/[worldId]/claim`
- `POST /api/promo-world/analytics`

### API contract principles

- All promotional rendering must be data-driven.
- No scene-specific hardcoded logic in the UI.
- The backend should remain the source of truth for slot assignment and claim validity.

---

## 6. Frontend Implementation Plan

### 6.1 User-facing Promo World

Build the feature as a reusable engine in the app shell, with stable UI and fallback behavior.

#### Components

- `PromoWorld`: container and orchestration logic
- `PromoWorldCanvas`: React Three Fiber canvas wrapper
- `SceneLoader`: GLB loading and suspense handling
- `SceneCamera`: constrained camera setup
- `InteractiveObject`: item state logic for idle, focused, selected, claimed
- `PromoDetailsSheet`: bottom sheet or side panel
- `ClaimSuccess`: success UI after wallet addition
- `PromoWorldFallback`: static 2D scene preview when 3D is unavailable

### 6.2 UX flow

1. User opens a participating merchant.
2. User sees a Promo World section.
3. The world renders themed scene objects.
4. User taps an object.
5. System opens the standard promotion panel.
6. User claims the promotion.
7. Promotion enters wallet and scene object transitions to claimed state.

### 6.3 Mobile-first considerations

- Default camera angle with constrained pan and zoom
- Only tap-to-focus gestures on mobile
- Bottom sheet detail panel
- Reduced object count and low-poly scene assets
- Clear visual affordances for interactive objects

---

## 7. Scene Templates and Object Model

### MVP templates

1. Burger Restaurant
   - burger counter
   - drink machine
   - mystery box
   - neon sign
   - VIP table

2. Coffee Shop
   - coffee cup
   - croissant display
   - gift box
   - daily special board
   - loyalty table

3. Pizza Restaurant
   - pizza
   - pizza oven
   - drink station
   - mystery box
   - golden table

### Object state machine

Each object must support:

- `idle`
- `hover`
- `focused`
- `selected`
- `locked`
- `disabled`
- `claimed`

This state must be reflected in both visual treatment and business logic.

---

## 8. Mystery Promotion Flow

The mystery feature is important for gamification and may be implemented in phases.

### MVP approach

- Business config defines multiple reward buckets.
- Server resolves the reward after user interaction.
- Client handles the reveal animation only after backend confirmation.
- Claim flow remains backend-authoritative.

### Example reward configuration

- 10% discount
- 20% discount
- Free drink
- Premium reward

### Security requirement

Mystery reward selection must not be processed only on the client. The server must be the source of truth.

---

## 9. Analytics and Tracking

Add event tracking for:

- `promo_world_viewed`
- `interactive_object_seen`
- `interactive_object_clicked`
- `promotion_revealed`
- `promotion_claimed`
- `promotion_redeemed`
- `scene_exited`

### Business analytics to surface

- Promo World views
- Object interactions
- Most popular promotion object
- Claim rate
- Redemption rate
- Average exploration time

### Implementation approach

Use a lightweight event pipeline:

- client emits interaction events
- server persists analytics rows
- dashboard aggregates by merchant and world

---

## 10. Performance and Fallback Strategy

### Performance requirements

- Lazy-load promo worlds
- Do not preload all worlds at once
- Compress GLB assets
- Use low-poly models
- Keep texture sizes constrained
- Reuse materials and baked lighting where possible
- Pause rendering when a scene is not visible
- Keep the whole scene below target sizes for mobile

### Fallback rules

If the device cannot support 3D:

- Show a static 2D preview card with promotion pills
- Keep all offers available via a traditional list
- Maintain a non-3D claim path

### Device detection

Use capability checks for:

- device memory
- CPU profile
- reduced motion preference
- connection speed / network quality
- browser support for WebGL

---

## 11. Accessibility Requirements

The 3D experience must never be the only path to a promotion.

### Required accessibility features

- “Explore scene” and “View all promotions” options
- Visible list of all active promotions in the world
- Keyboard-friendly interaction for non-visual users
- Sufficient contrast and readable labels
- Motion reduction support
- Alternative fallback summary panel

---

## 12. Merchant Admin Experience

The admin system should be simple and template-based.

### Merchant configuration flow

1. Create business profile
2. Choose category
3. Choose scene template
4. Assign promotions to scene slots
5. Publish or unpublish
6. View analytics

### Admin dashboard requirements

- Select template from a gallery
- See slot list and object names
- Assign promotion by slot
- Preview changes before publish
- Manage inactivity and expired offers

---

## 13. MVP Delivery Phases

### Phase 0 — Foundation and architecture

- Confirm PRD acceptance and success criteria
- Design data model and migration plan
- Set up feature flags for Promo World rollout
- Choose 3D stack and asset workflow

### Phase 1 — Core infrastructure

- Database migrations
- Scene template model
- Promo-slot mapping
- GLB loading pipeline
- Initial 3D environment shell

### Phase 2 — First scene

- Build burger restaurant scene
- Add camera controls
- Load 3 interactive objects
- Wire promotion binding
- Add object selection

### Phase 3 — Promotion flow

- Promotion detail sheet
- Claim flow to wallet
- Success feedback
- Wallet integration and post-claim state change

### Phase 4 — Mystery promotion logic

- Mystery object type
- Reward resolution on server
- Reveal animation and redemption flow

### Phase 5 — Merchant configuration

- Template selection UI
- Promotion assignment to slots
- Publish/unpublish controls
- Save flow with validation

### Phase 6 — Analytics

- Track events
- Build admin analytics panel
- Confirm conversion metrics

### Phase 7 — Optimization and rollout

- Performance tuning
- Fallback checks
- Asset reduction and lazy loading
- Final QA and beta launch

---

## 14. Technical Stack Recommendation

### Frontend

- Next.js 16
- TypeScript
- React 19
- Tailwind CSS
- Framer Motion (limited to subtle UI transitions)

### 3D

- Three.js
- React Three Fiber
- React Three Drei

### Data and backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage for GLB assets
- Existing Bonix wallet and promo APIs

### Browser support strategy

- Support modern mobile browsers first
- Gracefully degrade for older devices
- Use WebGL capability detection and static preview fallback

---

## 15. Risks and Mitigations

### Risk: Heavy 3D asset load on mobile

Mitigation:

- Lazy load scenes
- Optimize GLB size
- Keep models low-poly
- Implement mobile capability checks

### Risk: Poor object discoverability

Mitigation:

- Use clear glow and subtle animation
- Keep scene visually readable
- Add a traditional promotion list as alternative access path

### Risk: Claim duplication

Mitigation:

- Enforce server-side claim uniqueness
- Reuse wallet and redemption validations

### Risk: Merchant setup complexity

Mitigation:

- Restrict merchants to predefined templates and slot mapping
- Provide guided selection and validation

### Risk: Feature conflicts with current Bonix UX

Mitigation:

- Keep 3D as an enhancement layer only
- Do not replace the normal promo card or wallet flows

---

## 16. Acceptance Criteria for MVP

### User experience

- A user can open a merchant Promo World.
- The user sees a stylized 3D environment.
- The user can identify interactive objects.
- The user can tap an object and open a promotion detail panel.
- The user can claim a promotion.
- The claim appears in the wallet.

### Business experience

- A merchant can select a scene template.
- A merchant can assign promotions to scene slots.
- A merchant can publish or unpublish the Promo World.

### Technical requirements

- Scenes load dynamically.
- Promotions are bound to the world via data and slot configuration.
- The scene is database-driven.
- GLB assets are optimized.
- Fallback mode exists for unsupported devices.
- Traditional promo list remains accessible.
- Analytics events are recorded.

---

## 17. Implementation Priorities

### Priority 1 — Must ship for MVP

- Scene template architecture
- One working scene template
- Slot-to-promotion binding
- Claim flow and wallet integration
- Merchant assignment UI
- Mobile fallback

### Priority 2 — Should ship in early rollout

- Mystery object flow
- Analytics tracking
- More template variants
- Better scene polish and object discoverability

### Priority 3 — Nice-to-have post-MVP

- Seasonal theme variants
- Advanced object animations
- Custom brand colors in worlds
- Loyalty progression hooks

---

## 18. Recommended Delivery Timeline

### Week 1–2: Discovery and data model

- Confirm domain model
- Define scene templates and slots
- Build database migration plan
- Finalize asset pipeline

### Week 3–4: Core 3D shell

- Set up React Three Fiber plus camera system
- Build first scene template
- Implement object states and interaction model

### Week 5–6: Promo flow and claim UX

- Connect claims to wallet
- Add detail drawer and success states
- Validate mobile behavior

### Week 7: Merchant admin + analytics

- Add config UI
- Bind merchant promos to slots
- Track interaction events

### Week 8: QA, optimization, rollout

- Performance testing
- Fallback validation
- Bug fixing and beta release

---

## 19. Recommended Next Actions

1. Create the migration and schema for Promo World entities.
2. Add a feature flag to enable Promo World experiments for selected merchants.
3. Build the first scene template and adapter layer.
4. Connect one merchant profile to one published world.
5. Validate one complete claim flow end-to-end.
6. Expand to additional templates after the initial validation passes.

---

## 20. Final Product Direction

The final result should not be a metaverse or a gaming platform. It should be a lightweight, memorable promotion layer that turns ordinary offers into discoverable objects inside a small, stylized, mobile-friendly environment.

The product principle remains clear:

> Promotions should not just be displayed. They should be discovered.

This feature is a strategic upgrade to Bonix’s visual identity and customer engagement model while preserving the existing transactional UX that already works.
