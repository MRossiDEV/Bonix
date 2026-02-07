-- Phase 1 constraints and defaults

-- Add status columns for models missing status
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE merchant_balances
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

UPDATE wallets SET status = 'ACTIVE' WHERE status IS NULL;
UPDATE merchant_balances SET status = 'ACTIVE' WHERE status IS NULL;
UPDATE audit_logs SET status = 'ACTIVE' WHERE status IS NULL;

-- Default reservation expiry to 15 days
ALTER TABLE reservations
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '15 days');

-- Helper: admin check
CREATE OR REPLACE FUNCTION is_admin_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_user_id IS NULL THEN FALSE
    ELSE EXISTS (
      SELECT 1 FROM users WHERE id = p_user_id AND role = 'ADMIN'
    )
  END;
$$;

-- Enforce promo lifecycle rules
CREATE OR REPLACE FUNCTION enforce_promo_update_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    v_is_admin := TRUE;
  ELSE
    v_is_admin := is_admin_user(auth.uid()::uuid);
  END IF;

  -- Draft promos can be edited and activated
  IF OLD.status = 'DRAFT' THEN
    IF NEW.status = 'ACTIVE' AND NEW.activated_at IS NULL THEN
      NEW.activated_at := NOW();
    END IF;

    IF NEW.status = 'DISABLED' AND NOT v_is_admin THEN
      RAISE EXCEPTION 'Only admin can disable promos';
    END IF;

    RETURN NEW;
  END IF;

  -- After activation, only allow deactivation by admin and slot adjustments
  IF NEW.status <> OLD.status THEN
    IF OLD.status = 'ACTIVE' AND NEW.status = 'DISABLED' THEN
      IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admin can deactivate promos';
      END IF;
    ELSE
      RAISE EXCEPTION 'Promo status cannot be changed after activation';
    END IF;
  END IF;

  IF NEW.merchant_id IS DISTINCT FROM OLD.merchant_id
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.original_price IS DISTINCT FROM OLD.original_price
     OR NEW.discounted_price IS DISTINCT FROM OLD.discounted_price
     OR NEW.cashback_percent IS DISTINCT FROM OLD.cashback_percent
     OR NEW.total_slots IS DISTINCT FROM OLD.total_slots
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.activated_at IS DISTINCT FROM OLD.activated_at THEN
    RAISE EXCEPTION 'Promo cannot be modified after activation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enforce reservation immutability and status transitions
CREATE OR REPLACE FUNCTION enforce_reservation_update_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.promo_id IS DISTINCT FROM OLD.promo_id THEN
    RAISE EXCEPTION 'Reservation user_id and promo_id are immutable';
  END IF;

  IF OLD.status = 'ACTIVE' THEN
    IF NEW.status NOT IN ('ACTIVE', 'EXPIRED', 'REDEEMED', 'CANCELLED') THEN
      RAISE EXCEPTION 'Invalid reservation status transition';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Reservation status is immutable once terminal';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promo_update_rules ON promos;
CREATE TRIGGER promo_update_rules
  BEFORE UPDATE ON promos
  FOR EACH ROW EXECUTE FUNCTION enforce_promo_update_rules();

DROP TRIGGER IF EXISTS reservation_update_rules ON reservations;
CREATE TRIGGER reservation_update_rules
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION enforce_reservation_update_rules();

-- Optional scheduled expiration job (if pg_cron is available)
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'expire_reservations_daily',
      '0 2 * * *',
      'SELECT expire_old_reservations();'
    );
  END IF;
END;
$$;
