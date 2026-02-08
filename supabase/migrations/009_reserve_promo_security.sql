-- Secure reserve_promo and allow authenticated execution

CREATE OR REPLACE FUNCTION reserve_promo(
  p_user_id UUID,
  p_promo_id UUID,
  p_reservation_ttl_days INTEGER DEFAULT 15
)
RETURNS UUID AS $$
DECLARE
  v_reservation_id UUID;
  v_available_slots INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid()::uuid <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if promo is available and active
  SELECT available_slots INTO v_available_slots
  FROM promos
  WHERE id = p_promo_id
    AND status = 'ACTIVE'
    AND expires_at > NOW()
  FOR UPDATE;

  IF v_available_slots IS NULL THEN
    RAISE EXCEPTION 'Promo not found or not available';
  END IF;

  IF v_available_slots <= 0 THEN
    RAISE EXCEPTION 'No slots available';
  END IF;

  -- Check if user already has a reservation for this promo
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE user_id = p_user_id AND promo_id = p_promo_id
  ) THEN
    RAISE EXCEPTION 'User already has a reservation for this promo';
  END IF;

  -- Create reservation
  INSERT INTO reservations (user_id, promo_id, expires_at)
  VALUES (
    p_user_id,
    p_promo_id,
    NOW() + (p_reservation_ttl_days || ' days')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;

  -- Decrement available slots
  UPDATE promos
  SET available_slots = available_slots - 1
  WHERE id = p_promo_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION reserve_promo(UUID, UUID, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION reserve_promo(UUID, UUID, INTEGER) TO authenticated;
