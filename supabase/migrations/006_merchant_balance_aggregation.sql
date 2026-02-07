-- Merchant balance aggregation and adjustments

CREATE TABLE IF NOT EXISTS merchant_balance_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_balance_adjustments_merchant_period
  ON merchant_balance_adjustments(merchant_id, period_start);

ALTER TABLE merchant_balance_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view balance adjustments" ON merchant_balance_adjustments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can insert balance adjustments" ON merchant_balance_adjustments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE OR REPLACE FUNCTION calculate_merchant_balance(
  p_merchant_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_platform_fee_rate DECIMAL DEFAULT 0.03,
  p_affiliate_fee_rate DECIMAL DEFAULT 0.05
)
RETURNS TABLE (
  total_redemptions INTEGER,
  gross_amount DECIMAL,
  platform_fee DECIMAL,
  affiliate_fee DECIMAL,
  wallet_credits DECIMAL,
  net_balance DECIMAL
) AS $$
DECLARE
  v_total INTEGER;
  v_gross DECIMAL;
  v_wallet DECIMAL;
  v_platform DECIMAL;
  v_affiliate DECIMAL;
  v_adjustments DECIMAL;
BEGIN
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(promo_amount), 0),
    COALESCE(SUM(wallet_used), 0)
  INTO v_total, v_gross, v_wallet
  FROM redemptions
  WHERE merchant_id = p_merchant_id
    AND status = 'CONFIRMED'
    AND confirmed_at >= p_period_start
    AND confirmed_at < p_period_end;

  v_platform := ROUND(v_gross * p_platform_fee_rate, 2);
  v_affiliate := ROUND(v_gross * p_affiliate_fee_rate, 2);

  SELECT COALESCE(SUM(amount), 0)
  INTO v_adjustments
  FROM merchant_balance_adjustments
  WHERE merchant_id = p_merchant_id
    AND period_start = p_period_start;

  total_redemptions := v_total;
  gross_amount := v_gross;
  platform_fee := v_platform;
  affiliate_fee := v_affiliate;
  wallet_credits := v_wallet;
  net_balance := v_gross - v_platform - v_affiliate - v_wallet + v_adjustments;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_merchant_balance(
  p_merchant_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_platform_fee_rate DECIMAL DEFAULT 0.03,
  p_affiliate_fee_rate DECIMAL DEFAULT 0.05,
  p_lock BOOLEAN DEFAULT FALSE,
  p_allow_locked_override BOOLEAN DEFAULT FALSE
)
RETURNS merchant_balances AS $$
DECLARE
  v_existing merchant_balances;
  v_calc RECORD;
  v_result merchant_balances;
BEGIN
  SELECT * INTO v_existing
  FROM merchant_balances
  WHERE merchant_id = p_merchant_id
    AND period_start = p_period_start
  FOR UPDATE;

  IF v_existing.id IS NOT NULL AND v_existing.is_locked AND NOT p_allow_locked_override THEN
    RAISE EXCEPTION 'Balance is locked';
  END IF;

  SELECT * INTO v_calc FROM calculate_merchant_balance(
    p_merchant_id,
    p_period_start,
    p_period_end,
    p_platform_fee_rate,
    p_affiliate_fee_rate
  );

  INSERT INTO merchant_balances (
    merchant_id,
    period_start,
    period_end,
    total_redemptions,
    gross_amount,
    platform_fee,
    affiliate_fee,
    wallet_credits,
    net_balance,
    is_locked
  ) VALUES (
    p_merchant_id,
    p_period_start,
    p_period_end,
    v_calc.total_redemptions,
    v_calc.gross_amount,
    v_calc.platform_fee,
    v_calc.affiliate_fee,
    v_calc.wallet_credits,
    v_calc.net_balance,
    p_lock
  )
  ON CONFLICT (merchant_id, period_start) DO UPDATE SET
    period_end = EXCLUDED.period_end,
    total_redemptions = EXCLUDED.total_redemptions,
    gross_amount = EXCLUDED.gross_amount,
    platform_fee = EXCLUDED.platform_fee,
    affiliate_fee = EXCLUDED.affiliate_fee,
    wallet_credits = EXCLUDED.wallet_credits,
    net_balance = EXCLUDED.net_balance,
    is_locked = CASE WHEN merchant_balances.is_locked THEN TRUE ELSE EXCLUDED.is_locked END,
    updated_at = NOW()
  RETURNING * INTO v_result;

  IF p_lock AND NOT v_result.is_locked THEN
    UPDATE merchant_balances
    SET is_locked = TRUE,
        updated_at = NOW()
    WHERE id = v_result.id
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION lock_merchant_balance(
  p_merchant_id UUID,
  p_period_start TIMESTAMPTZ
)
RETURNS merchant_balances AS $$
DECLARE
  v_result merchant_balances;
BEGIN
  UPDATE merchant_balances
  SET is_locked = TRUE,
      updated_at = NOW()
  WHERE merchant_id = p_merchant_id
    AND period_start = p_period_start
  RETURNING * INTO v_result;

  IF v_result.id IS NULL THEN
    RAISE EXCEPTION 'Balance not found';
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_balance_adjustment(
  p_merchant_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_amount DECIMAL,
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS merchant_balances AS $$
DECLARE
  v_balance merchant_balances;
BEGIN
  INSERT INTO merchant_balance_adjustments (
    merchant_id,
    period_start,
    period_end,
    amount,
    reason,
    created_by
  ) VALUES (
    p_merchant_id,
    p_period_start,
    p_period_end,
    p_amount,
    p_reason,
    p_admin_id
  );

  SELECT * INTO v_balance
  FROM merchant_balances
  WHERE merchant_id = p_merchant_id
    AND period_start = p_period_start
  FOR UPDATE;

  IF v_balance.id IS NULL THEN
    v_balance := upsert_merchant_balance(
      p_merchant_id,
      p_period_start,
      p_period_end,
      0.03,
      0.05,
      FALSE,
      TRUE
    );
  END IF;

  UPDATE merchant_balances
  SET net_balance = net_balance + p_amount,
      updated_at = NOW()
  WHERE id = v_balance.id
  RETURNING * INTO v_balance;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;
