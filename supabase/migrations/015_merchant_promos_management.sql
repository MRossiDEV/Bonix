-- Merchant promos management V1

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'promo_status' AND e.enumlabel = 'PAUSED'
  ) THEN
    ALTER TYPE promo_status ADD VALUE 'PAUSED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'promo_status' AND e.enumlabel = 'SOLD_OUT'
  ) THEN
    ALTER TYPE promo_status ADD VALUE 'SOLD_OUT';
  END IF;
END $$;

ALTER TABLE promos
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_promos_deleted_at ON promos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_promos_status_expires ON promos(status, expires_at);

CREATE OR REPLACE FUNCTION public.sync_promo_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at <= NOW() THEN
    NEW.status := 'EXPIRED';
  ELSIF NEW.available_slots <= 0 THEN
    NEW.status := 'SOLD_OUT';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_promo_status_trigger ON promos;
CREATE TRIGGER sync_promo_status_trigger
  BEFORE INSERT OR UPDATE ON promos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_promo_status();

DROP POLICY IF EXISTS "Merchants can update their draft promos" ON promos;
DROP POLICY IF EXISTS "Merchants can create promos" ON promos;
DROP POLICY IF EXISTS "Merchants can view their own promos" ON promos;
DROP POLICY IF EXISTS "Merchant can manage own promos" ON promos;

CREATE POLICY "Merchant can manage own promos"
ON promos
FOR ALL
USING (
  merchant_id IN (
    SELECT id
    FROM merchants
    WHERE user_id = auth.uid()::uuid
  )
)
WITH CHECK (
  merchant_id IN (
    SELECT id
    FROM merchants
    WHERE user_id = auth.uid()::uuid
  )
);
