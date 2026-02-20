-- Link merchant profiles to registered users

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE merchants
SET user_id = users.id
FROM users
WHERE merchants.user_id IS NULL
  AND LOWER(merchants.email) = LOWER(users.email);

DELETE FROM merchants
WHERE user_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM merchants WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'merchants.user_id contains NULLs; backfill required';
  END IF;
END $$;

ALTER TABLE merchants
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE merchants
  DROP CONSTRAINT IF EXISTS merchants_user_id_fkey,
  ADD CONSTRAINT merchants_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS merchants_user_id_key ON merchants(user_id);

-- Update RLS policies to use merchant user linkage
DROP POLICY IF EXISTS "Merchants can view their own data" ON merchants;
CREATE POLICY "Merchants can view their own data" ON merchants
  FOR SELECT USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Merchants can update their own data" ON merchants;
CREATE POLICY "Merchants can update their own data" ON merchants
  FOR UPDATE USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Merchants can create their own profile" ON merchants;
CREATE POLICY "Merchants can create their own profile" ON merchants
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::uuid
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Merchants can view their own promos" ON promos;
CREATE POLICY "Merchants can view their own promos" ON promos
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = promos.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can create promos" ON promos;
CREATE POLICY "Merchants can create promos" ON promos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = promos.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can update their draft promos" ON promos;
CREATE POLICY "Merchants can update their draft promos" ON promos
  FOR UPDATE USING (
    status = 'DRAFT'
    AND EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = promos.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can view reservations for their promos" ON reservations;
CREATE POLICY "Merchants can view reservations for their promos" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM promos
      JOIN merchants ON merchants.id = promos.merchant_id
      WHERE promos.id = reservations.promo_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can view redemptions for their promos" ON redemptions;
CREATE POLICY "Merchants can view redemptions for their promos" ON redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = redemptions.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can create redemptions" ON redemptions;
CREATE POLICY "Merchants can create redemptions" ON redemptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = redemptions.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can update their redemptions" ON redemptions;
CREATE POLICY "Merchants can update their redemptions" ON redemptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = redemptions.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can view their own balances" ON merchant_balances;
CREATE POLICY "Merchants can view their own balances" ON merchant_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM merchants
      WHERE merchants.id = merchant_balances.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );
