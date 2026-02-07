-- Wallet payment rules for redemption
-- Note: Re-running this file will replace the function definition.

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
  IF p_payment_type = 'IN_STORE' THEN
    IF p_wallet_used <> 0 THEN
      RAISE EXCEPTION 'Wallet cannot be used for in-store payment';
    END IF;
  ELSIF p_payment_type = 'FULL_WALLET' THEN
    IF p_wallet_used <> v_promo.discounted_price THEN
      RAISE EXCEPTION 'Full wallet payment must cover full promo price';
    END IF;
  ELSIF p_payment_type = 'PARTIAL_WALLET' THEN
    IF p_wallet_used <= 0 OR p_wallet_used >= v_promo.discounted_price THEN
      RAISE EXCEPTION 'Partial wallet payment must be between 0 and promo price';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported payment type';
  END IF;

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
