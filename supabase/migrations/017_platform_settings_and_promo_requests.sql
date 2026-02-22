-- Admin-controlled settings and merchant promo action requests

CREATE TABLE IF NOT EXISTS platform_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  default_cashback_percent DECIMAL(5,2) NOT NULL DEFAULT 2 CHECK (default_cashback_percent >= 0 AND default_cashback_percent <= 100),
  max_promos_per_merchant INTEGER NOT NULL DEFAULT 10 CHECK (max_promos_per_merchant > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (id, default_cashback_percent, max_promos_per_merchant)
VALUES (TRUE, 2, 10)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view platform settings" ON platform_settings;
CREATE POLICY "Admins can view platform settings" ON platform_settings
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update platform settings" ON platform_settings;
CREATE POLICY "Admins can update platform settings" ON platform_settings
  FOR UPDATE USING (public.is_admin());

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS promo_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id UUID NOT NULL REFERENCES promos(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('ACTIVATE', 'PAUSE', 'DEACTIVATE', 'DELETE')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  note TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_change_requests_promo_id ON promo_change_requests(promo_id);
CREATE INDEX IF NOT EXISTS idx_promo_change_requests_status ON promo_change_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_promo_action
  ON promo_change_requests (promo_id, action)
  WHERE status = 'PENDING';

ALTER TABLE promo_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own promo requests" ON promo_change_requests;
CREATE POLICY "Merchants can view own promo requests" ON promo_change_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = promo_change_requests.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Merchants can create own promo requests" ON promo_change_requests;
CREATE POLICY "Merchants can create own promo requests" ON promo_change_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = promo_change_requests.merchant_id
        AND merchants.user_id = auth.uid()::uuid
    )
    AND requested_by = auth.uid()::uuid
  );

DROP POLICY IF EXISTS "Admins can view promo requests" ON promo_change_requests;
CREATE POLICY "Admins can view promo requests" ON promo_change_requests
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update promo requests" ON promo_change_requests;
CREATE POLICY "Admins can update promo requests" ON promo_change_requests
  FOR UPDATE USING (public.is_admin());

DROP TRIGGER IF EXISTS update_promo_change_requests_updated_at ON promo_change_requests;
CREATE TRIGGER update_promo_change_requests_updated_at BEFORE UPDATE ON promo_change_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
