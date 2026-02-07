-- Database functions for Bonix business logic

-- Function to reserve a promo
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
$$ LANGUAGE plpgsql;

-- Function to expire old reservations
CREATE OR REPLACE FUNCTION expire_old_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  WITH expired_reservations AS (
    UPDATE reservations
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' 
      AND expires_at < NOW()
    RETURNING id, promo_id
  )
  SELECT COUNT(*) INTO v_expired_count FROM expired_reservations;

  -- Release slots back to promos
  UPDATE promos
  SET available_slots = available_slots + subquery.count
  FROM (
    SELECT promo_id, COUNT(*) as count
    FROM reservations
    WHERE status = 'EXPIRED' 
      AND updated_at >= NOW() - INTERVAL '1 minute'
    GROUP BY promo_id
  ) AS subquery
  WHERE promos.id = subquery.promo_id;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cashback
CREATE OR REPLACE FUNCTION calculate_cashback(
  p_promo_amount DECIMAL,
  p_wallet_used DECIMAL,
  p_cashback_percent DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  v_cash_paid DECIMAL;
  v_cashback DECIMAL;
BEGIN
  -- Cash paid = promo amount - wallet used
  v_cash_paid := p_promo_amount - p_wallet_used;
  
  -- Cashback only on cash portion
  v_cashback := ROUND(v_cash_paid * (p_cashback_percent / 100), 2);
  
  RETURN v_cashback;
END;
$$ LANGUAGE plpgsql;

-- Function to create redemption with all validations
CREATE OR REPLACE FUNCTION create_redemption(
  p_reservation_id UUID,
  p_merchant_id UUID,
  p_payment_type payment_type,
  p_wallet_used DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_redemption_id UUID;
  v_reservation RECORD;
  v_promo RECORD;
  v_wallet_balance DECIMAL;
  v_cash_paid DECIMAL;
  v_cashback_amount DECIMAL;
BEGIN
  -- Get reservation details
  SELECT * INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id
    AND status = 'ACTIVE'
    AND expires_at > NOW()
  FOR UPDATE;

  IF v_reservation IS NULL THEN
    RAISE EXCEPTION 'Reservation not found or expired';
  END IF;

  -- Get promo details
  SELECT * INTO v_promo
  FROM promos
  WHERE id = v_reservation.promo_id
    AND merchant_id = p_merchant_id
    AND status = 'ACTIVE'
  FOR UPDATE;

  IF v_promo IS NULL THEN
    RAISE EXCEPTION 'Promo not found or not active';
  END IF;

  -- Validate wallet usage
  IF p_wallet_used > 0 THEN
    SELECT balance INTO v_wallet_balance
    FROM wallets
    WHERE user_id = v_reservation.user_id
    FOR UPDATE;

    IF v_wallet_balance IS NULL OR v_wallet_balance < p_wallet_used THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    IF p_wallet_used > v_promo.discounted_price THEN
      RAISE EXCEPTION 'Wallet amount exceeds promo price';
    END IF;
  END IF;

  -- Calculate cash paid and cashback
  v_cash_paid := v_promo.discounted_price - p_wallet_used;
  v_cashback_amount := calculate_cashback(
    v_promo.discounted_price,
    p_wallet_used,
    v_promo.cashback_percent
  );

  -- Create redemption
  INSERT INTO redemptions (
    reservation_id,
    user_id,
    promo_id,
    merchant_id,
    payment_type,
    promo_amount,
    wallet_used,
    cash_paid,
    cashback_amount,
    cashback_percent,
    status
  ) VALUES (
    p_reservation_id,
    v_reservation.user_id,
    v_promo.id,
    p_merchant_id,
    p_payment_type,
    v_promo.discounted_price,
    p_wallet_used,
    v_cash_paid,
    v_cashback_amount,
    v_promo.cashback_percent,
    'PENDING'
  ) RETURNING id INTO v_redemption_id;

  -- Update reservation status
  UPDATE reservations
  SET status = 'REDEEMED',
      redeemed_at = NOW()
  WHERE id = p_reservation_id;

  -- Deduct from wallet if used
  IF p_wallet_used > 0 THEN
    UPDATE wallets
    SET balance = balance - p_wallet_used
    WHERE user_id = v_reservation.user_id;
  END IF;

  RETURN v_redemption_id;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm redemption and credit cashback
CREATE OR REPLACE FUNCTION confirm_redemption(
  p_redemption_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_redemption RECORD;
BEGIN
  -- Get redemption details
  SELECT * INTO v_redemption
  FROM redemptions
  WHERE id = p_redemption_id
    AND status = 'PENDING'
  FOR UPDATE;

  IF v_redemption IS NULL THEN
    RAISE EXCEPTION 'Redemption not found or already confirmed';
  END IF;

  -- Update redemption status
  UPDATE redemptions
  SET status = 'CONFIRMED',
      confirmed_at = NOW()
  WHERE id = p_redemption_id;

  -- Credit cashback to wallet
  INSERT INTO wallets (user_id, balance)
  VALUES (v_redemption.user_id, v_redemption.cashback_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = wallets.balance + v_redemption.cashback_amount;

  -- Log the action
  INSERT INTO audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'REDEMPTION_CONFIRMED',
    'redemption',
    p_redemption_id,
    v_redemption.user_id,
    jsonb_build_object(
      'cashback_amount', v_redemption.cashback_amount,
      'promo_id', v_redemption.promo_id
    )
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
