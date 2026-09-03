-- ============================================================================
-- 027 · City progression (PRD §81)
--
-- Adds `city_progress_events` so we can audit slot unlocks and reward
-- flows without bloating the worlds table. RLS keeps owners in control
-- of their own events while letting admins peek for support cases.
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE city_progress_event_kind AS ENUM (
    'FAVORITE_ADDED',
    'SLOT_UNLOCKED',
    'PROMO_PLACED',
    'PROMO_REDEEMED',
    'BUILDING_PLACED',
    'BUILDING_VISITED',
    'LEVEL_UP'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS city_progress_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  world_id UUID REFERENCES worlds(id) ON DELETE SET NULL,
  kind city_progress_event_kind NOT NULL,
  slot_id UUID REFERENCES world_slots(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  promo_id UUID REFERENCES promos(id) ON DELETE SET NULL,
  points INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_city_progress_events_user
  ON city_progress_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_progress_events_world
  ON city_progress_events(world_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_progress_events_kind
  ON city_progress_events(kind, created_at DESC);

ALTER TABLE city_progress_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own city progress events" ON city_progress_events;
CREATE POLICY "Users can view their own city progress events"
  ON city_progress_events FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can log their own city progress events" ON city_progress_events;
CREATE POLICY "Users can log their own city progress events"
  ON city_progress_events FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can manage city progress events" ON city_progress_events;
CREATE POLICY "Admins can manage city progress events"
  ON city_progress_events FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'));
