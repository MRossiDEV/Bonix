-- Allow admin-approved promo edits while keeping merchant restrictions

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

  -- Admin/service operations are allowed to update promo fields.
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Draft promos can be edited and activated by non-admins.
  IF OLD.status = 'DRAFT' THEN
    IF NEW.status = 'ACTIVE' AND NEW.activated_at IS NULL THEN
      NEW.activated_at := NOW();
    END IF;

    IF NEW.status = 'DISABLED' THEN
      RAISE EXCEPTION 'Only admin can disable promos';
    END IF;

    RETURN NEW;
  END IF;

  -- Non-admins cannot change status once activated.
  IF NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Promo status cannot be changed after activation';
  END IF;

  -- Non-admins cannot modify core promo data once activated.
  IF NEW.merchant_id IS DISTINCT FROM OLD.merchant_id
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.original_price IS DISTINCT FROM OLD.original_price
     OR NEW.discounted_price IS DISTINCT FROM OLD.discounted_price
     OR NEW.cashback_percent IS DISTINCT FROM OLD.cashback_percent
     OR NEW.total_slots IS DISTINCT FROM OLD.total_slots
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.activated_at IS DISTINCT FROM OLD.activated_at
     OR NEW.category IS DISTINCT FROM OLD.category
     OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
     OR NEW.image IS DISTINCT FROM OLD.image
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    RAISE EXCEPTION 'Promo cannot be modified after activation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
