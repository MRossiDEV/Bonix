-- Multi-role system for users

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role user_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
AS $$
  SELECT public.has_role(auth.uid()::uuid, 'ADMIN'::user_role);
$$
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT public.has_role(p_user_id, 'ADMIN'::user_role);
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (public.is_admin());

INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users WHERE role IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'USER'::user_role FROM users
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'USER')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_public_user_created_roles ON public.users;
CREATE TRIGGER on_public_user_created_roles
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_roles();

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all merchants" ON merchants;
CREATE POLICY "Admins can view all merchants" ON merchants
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any merchant" ON merchants;
CREATE POLICY "Admins can update any merchant" ON merchants
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all promos" ON promos;
CREATE POLICY "Admins can view all promos" ON promos
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any promo" ON promos;
CREATE POLICY "Admins can update any promo" ON promos
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all redemptions" ON redemptions;
CREATE POLICY "Admins can view all redemptions" ON redemptions
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all merchant balances" ON merchant_balances;
CREATE POLICY "Admins can view all merchant balances" ON merchant_balances
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update merchant balances" ON merchant_balances;
CREATE POLICY "Admins can update merchant balances" ON merchant_balances
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view balance adjustments" ON merchant_balance_adjustments;
CREATE POLICY "Admins can view balance adjustments" ON merchant_balance_adjustments
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert balance adjustments" ON merchant_balance_adjustments;
CREATE POLICY "Admins can insert balance adjustments" ON merchant_balance_adjustments
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all agents" ON agents;
CREATE POLICY "Admins can view all agents" ON agents
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any agent" ON agents;
CREATE POLICY "Admins can update any agent" ON agents
  FOR UPDATE USING (public.is_admin());
