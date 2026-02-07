-- Row Level Security (RLS) Policies for Bonix

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::uuid = id);

-- MERCHANTS policies
CREATE POLICY "Merchants can view their own data" ON merchants
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Merchants can update their own data" ON merchants
  FOR UPDATE USING (auth.uid()::uuid = id);

-- PROMOS policies
CREATE POLICY "Everyone can view active promos" ON promos
  FOR SELECT USING (status = 'ACTIVE' AND expires_at > NOW());

CREATE POLICY "Merchants can view their own promos" ON promos
  FOR SELECT USING (auth.uid()::uuid = merchant_id);

CREATE POLICY "Merchants can create promos" ON promos
  FOR INSERT WITH CHECK (auth.uid()::uuid = merchant_id);

CREATE POLICY "Merchants can update their draft promos" ON promos
  FOR UPDATE USING (
    auth.uid()::uuid = merchant_id AND 
    status = 'DRAFT'
  );

-- RESERVATIONS policies
CREATE POLICY "Users can view their own reservations" ON reservations
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Merchants can view reservations for their promos" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM promos 
      WHERE promos.id = reservations.promo_id 
      AND promos.merchant_id = auth.uid()::uuid
    )
  );

-- REDEMPTIONS policies
CREATE POLICY "Users can view their own redemptions" ON redemptions
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Merchants can view redemptions for their promos" ON redemptions
  FOR SELECT USING (auth.uid()::uuid = merchant_id);

CREATE POLICY "Merchants can create redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid()::uuid = merchant_id);

CREATE POLICY "Merchants can update their redemptions" ON redemptions
  FOR UPDATE USING (auth.uid()::uuid = merchant_id);

-- WALLETS policies
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- MERCHANT_BALANCES policies
CREATE POLICY "Merchants can view their own balances" ON merchant_balances
  FOR SELECT USING (auth.uid()::uuid = merchant_id);

-- AUDIT_LOGS policies
CREATE POLICY "Only service role can access audit logs" ON audit_logs
  FOR ALL USING (false);

-- Admin policies (check user role from users table)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all merchants" ON merchants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update any merchant" ON merchants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all promos" ON promos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update any promo" ON promos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all redemptions" ON redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view all merchant balances" ON merchant_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update merchant balances" ON merchant_balances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
  );
