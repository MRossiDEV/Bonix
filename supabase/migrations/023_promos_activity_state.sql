ALTER TABLE promos
  ADD COLUMN IF NOT EXISTS activity_state TEXT;

UPDATE promos
SET activity_state = CASE
  WHEN status = 'ACTIVE' THEN 'ACTIVE'
  ELSE 'UNACTIVE'
END
WHERE activity_state IS NULL OR BTRIM(activity_state) = '';

ALTER TABLE promos
  ALTER COLUMN activity_state SET DEFAULT 'UNACTIVE';

ALTER TABLE promos
  ALTER COLUMN activity_state SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'promos_activity_state_check'
  ) THEN
    ALTER TABLE promos
      ADD CONSTRAINT promos_activity_state_check
      CHECK (activity_state IN ('ACTIVE', 'UNACTIVE'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_promos_activity_state ON promos(activity_state);