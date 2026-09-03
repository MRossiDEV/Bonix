-- 3D World Engine schema (PRD §76)
-- Adds worlds, world_slots, world_buildings, assets, asset_versions,
-- building_templates, building_template_components, and
-- merchant_3d_customizations, plus the storage buckets that back them.
-- Mirrors RLS style from 002_rls_policies.sql and 024_user_favorite_merchants.sql.

-- ============================================================================
-- Enums
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('BUILDING', 'VEGETATION', 'PROP', 'ENVIRONMENT', 'CHARACTER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM ('DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE world_type AS ENUM ('CITY', 'DISTRICT', 'MERCHANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE world_theme AS ENUM ('MODERN', 'INDUSTRIAL', 'JAPANESE', 'RUSTIC', 'URBAN', 'LUXURY', 'NEUTRAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE slot_type AS ENUM ('BUILDING', 'DECORATION', 'EMPTY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE building_state AS ENUM (
    'NORMAL',
    'NEW',
    'RESERVED',
    'VISITED',
    'ACTIVE_PROMO',
    'LIMITED_PROMO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- Assets: reusable GLB library (PRD §33)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  asset_type asset_type NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  status asset_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type_status ON assets(asset_type, status);
CREATE INDEX IF NOT EXISTS idx_assets_slug ON assets(slug);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published assets" ON assets;
CREATE POLICY "Anyone can view published assets" ON assets
  FOR SELECT USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Admins can manage assets" ON assets;
CREATE POLICY "Admins can manage assets" ON assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- Asset versions: history of every GLB uploaded for an asset (PRD §37)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_current ON asset_versions(asset_id, is_current);

ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view current versions of published assets" ON asset_versions;
CREATE POLICY "Anyone can view current versions of published assets" ON asset_versions
  FOR SELECT USING (
    is_current = TRUE
    AND EXISTS (SELECT 1 FROM assets a WHERE a.id = asset_versions.asset_id AND a.status = 'PUBLISHED')
  );

DROP POLICY IF EXISTS "Admins can manage asset versions" ON asset_versions;
CREATE POLICY "Admins can manage asset versions" ON asset_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- Building templates: reusable composition of one base asset + components
-- ============================================================================

CREATE TABLE IF NOT EXISTS building_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  base_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  status asset_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_building_templates_status ON building_templates(status);
CREATE INDEX IF NOT EXISTS idx_building_templates_base_asset ON building_templates(base_asset_id);

ALTER TABLE building_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published building templates" ON building_templates;
CREATE POLICY "Anyone can view published building templates" ON building_templates
  FOR SELECT USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Admins can manage building templates" ON building_templates;
CREATE POLICY "Admins can manage building templates" ON building_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- Template components: decorations / props attached to a template (PRD §40)
-- ============================================================================

CREATE TABLE IF NOT EXISTS building_template_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES building_templates(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  component_type TEXT NOT NULL,
  position JSONB NOT NULL DEFAULT '{}'::jsonb,
  rotation JSONB NOT NULL DEFAULT '{}'::jsonb,
  scale JSONB NOT NULL DEFAULT '{}'::jsonb,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_components_template ON building_template_components(template_id);
CREATE INDEX IF NOT EXISTS idx_template_components_asset ON building_template_components(asset_id);

ALTER TABLE building_template_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view components of published templates" ON building_template_components;
CREATE POLICY "Anyone can view components of published templates" ON building_template_components
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM building_templates t WHERE t.id = building_template_components.template_id AND t.status = 'PUBLISHED')
  );

DROP POLICY IF EXISTS "Admins can manage template components" ON building_template_components;
CREATE POLICY "Admins can manage template components" ON building_template_components
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- Worlds: user-owned miniature city / district / merchant interior (PRD §19)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  world_type world_type NOT NULL DEFAULT 'CITY',
  level INTEGER NOT NULL DEFAULT 1,
  theme world_theme NOT NULL DEFAULT 'NEUTRAL',
  max_slots INTEGER NOT NULL DEFAULT 9,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_worlds_user_id ON worlds(user_id);

ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own worlds" ON worlds;
CREATE POLICY "Users can view their own worlds" ON worlds
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can create their own worlds" ON worlds;
CREATE POLICY "Users can create their own worlds" ON worlds
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can update their own worlds" ON worlds;
CREATE POLICY "Users can update their own worlds" ON worlds
  FOR UPDATE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can delete their own worlds" ON worlds;
CREATE POLICY "Users can delete their own worlds" ON worlds
  FOR DELETE USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can view all worlds" ON worlds;
CREATE POLICY "Admins can view all worlds" ON worlds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- World slots: predefined positions (PRD §20)
-- ============================================================================

CREATE TABLE IF NOT EXISTS world_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  slot_key TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  z DOUBLE PRECISION NOT NULL DEFAULT 0,
  rotation_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  rotation_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  rotation_z DOUBLE PRECISION NOT NULL DEFAULT 0,
  scale DOUBLE PRECISION NOT NULL DEFAULT 1,
  slot_type slot_type NOT NULL DEFAULT 'BUILDING',
  occupied BOOLEAN NOT NULL DEFAULT FALSE,
  unlock_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(world_id, slot_key)
);

CREATE INDEX IF NOT EXISTS idx_world_slots_world_id ON world_slots(world_id);

ALTER TABLE world_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own world slots" ON world_slots;
CREATE POLICY "Users can view their own world slots" ON world_slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_slots.world_id AND w.user_id = auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Users can manage their own world slots" ON world_slots;
CREATE POLICY "Users can manage their own world slots" ON world_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_slots.world_id AND w.user_id = auth.uid()::uuid)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_slots.world_id AND w.user_id = auth.uid()::uuid)
  );

-- ============================================================================
-- World buildings: merchant → slot → template (PRD §21)
-- ============================================================================

CREATE TABLE IF NOT EXISTS world_buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  slot_id UUID UNIQUE NOT NULL REFERENCES world_slots(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  building_template_id UUID REFERENCES building_templates(id) ON DELETE SET NULL,
  customization_id UUID,
  state building_state NOT NULL DEFAULT 'NORMAL',
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_buildings_world_id ON world_buildings(world_id);
CREATE INDEX IF NOT EXISTS idx_world_buildings_merchant_id ON world_buildings(merchant_id);
CREATE INDEX IF NOT EXISTS idx_world_buildings_state ON world_buildings(state);

ALTER TABLE world_buildings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own buildings" ON world_buildings;
CREATE POLICY "Users can view their own buildings" ON world_buildings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_buildings.world_id AND w.user_id = auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Users can manage their own buildings" ON world_buildings;
CREATE POLICY "Users can manage their own buildings" ON world_buildings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_buildings.world_id AND w.user_id = auth.uid()::uuid)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM worlds w WHERE w.id = world_buildings.world_id AND w.user_id = auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Admins can view all buildings" ON world_buildings;
CREATE POLICY "Admins can view all buildings" ON world_buildings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- ============================================================================
-- Merchant 3D customizations: per-merchant branding on a template (PRD §43)
-- ============================================================================

CREATE TABLE IF NOT EXISTS merchant_3d_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID UNIQUE NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  building_template_id UUID REFERENCES building_templates(id) ON DELETE SET NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  sign_text TEXT,
  sign_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  interior_theme world_theme,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_3d_customizations_merchant ON merchant_3d_customizations(merchant_id);

ALTER TABLE merchant_3d_customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view merchant customizations" ON merchant_3d_customizations;
CREATE POLICY "Anyone can view merchant customizations" ON merchant_3d_customizations
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Merchants can manage their own customizations" ON merchant_3d_customizations;
CREATE POLICY "Merchants can manage their own customizations" ON merchant_3d_customizations
  FOR ALL USING (
    auth.uid()::uuid = merchant_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  ) WITH CHECK (
    auth.uid()::uuid = merchant_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN')
  );

-- Backfill the FK on world_buildings now that merchant_3d_customizations exists
DO $$ BEGIN
  ALTER TABLE world_buildings
    DROP CONSTRAINT IF EXISTS world_buildings_customization_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE world_buildings
    ADD CONSTRAINT world_buildings_customization_id_fkey
    FOREIGN KEY (customization_id) REFERENCES merchant_3d_customizations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- Storage buckets (PRD §38)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('bonix-3d-assets', 'bonix-3d-assets', true, 26214400, ARRAY['model/gltf-binary', 'model/gltf+json']::text[]),
  ('bonix-3d-thumbnails', 'bonix-3d-thumbnails', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('bonix-3d-previews', 'bonix-3d-previews', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('bonix-3d-environments', 'bonix-3d-environments', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json']::text[]),
  ('bonix-merchant-branding', 'bonix-merchant-branding', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
