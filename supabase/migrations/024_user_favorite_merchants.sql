CREATE TABLE IF NOT EXISTS user_favorite_merchants (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_merchants_user_id
  ON user_favorite_merchants(user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorite_merchants_merchant_id
  ON user_favorite_merchants(merchant_id);

ALTER TABLE user_favorite_merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their favorite merchants" ON user_favorite_merchants;
CREATE POLICY "Users can view their favorite merchants" ON user_favorite_merchants
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can favorite merchants" ON user_favorite_merchants;
CREATE POLICY "Users can favorite merchants" ON user_favorite_merchants
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can unfavorite merchants" ON user_favorite_merchants;
CREATE POLICY "Users can unfavorite merchants" ON user_favorite_merchants
  FOR DELETE USING (auth.uid()::uuid = user_id);
