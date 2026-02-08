-- Fix admin policies to avoid recursion on users table

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()::uuid
      AND role = 'ADMIN'
  );
$$
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

-- Users table policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin());

-- Merchants table policies
DROP POLICY IF EXISTS "Admins can view all merchants" ON merchants;
CREATE POLICY "Admins can view all merchants" ON merchants
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any merchant" ON merchants;
CREATE POLICY "Admins can update any merchant" ON merchants
  FOR UPDATE USING (public.is_admin());

-- Promos table policies
DROP POLICY IF EXISTS "Admins can view all promos" ON promos;
CREATE POLICY "Admins can view all promos" ON promos
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any promo" ON promos;
CREATE POLICY "Admins can update any promo" ON promos
  FOR UPDATE USING (public.is_admin());

-- Redemptions table policies
DROP POLICY IF EXISTS "Admins can view all redemptions" ON redemptions;
CREATE POLICY "Admins can view all redemptions" ON redemptions
  FOR SELECT USING (public.is_admin());

-- Merchant balances table policies
DROP POLICY IF EXISTS "Admins can view all merchant balances" ON merchant_balances;
CREATE POLICY "Admins can view all merchant balances" ON merchant_balances
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update merchant balances" ON merchant_balances;
CREATE POLICY "Admins can update merchant balances" ON merchant_balances
  FOR UPDATE USING (public.is_admin());

-- Audit logs table policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (public.is_admin());
