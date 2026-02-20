BEGIN;

TRUNCATE TABLE
  merchant_balance_adjustments,
  merchant_balances,
  redemptions,
  reservations,
  promos,
  wallets,
  merchants,
  users,
  user_roles,
  audit_logs
RESTART IDENTITY CASCADE;

-- Users
INSERT INTO users (id, email, name, phone, role, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@bonix.dev', 'Admin User', '+1-555-1000', 'ADMIN', 'ACTIVE', '2026-01-05T10:00:00Z', '2026-01-05T10:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'alex@bonix.dev', 'Alex Rivera', '+1-555-2000', 'USER', 'ACTIVE', '2026-01-10T12:00:00Z', '2026-01-10T12:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'jamie@bonix.dev', 'Jamie Chen', '+1-555-3000', 'USER', 'ACTIVE', '2026-01-12T09:30:00Z', '2026-01-12T09:30:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'taylor@bonix.dev', 'Taylor Singh', '+1-555-4000', 'USER', 'ACTIVE', '2026-01-15T16:45:00Z', '2026-01-15T16:45:00Z');

-- User roles
INSERT INTO user_roles (user_id, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ADMIN', '2026-01-05T10:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'USER', '2026-01-05T10:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'USER', '2026-01-10T12:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'USER', '2026-01-12T09:30:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'USER', '2026-01-15T16:45:00Z');

-- Merchants
INSERT INTO merchants (id, email, business_name, contact_name, phone, address, status, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hello@lumen-cafe.dev', 'Lumen Cafe', 'Priya Patel', '+1-555-1111', '123 Market St, San Francisco, CA', 'ACTIVE', '2026-01-08T09:00:00Z', '2026-01-08T09:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'owner@harbor-grill.dev', 'Harbor Grill', 'Marco Diaz', '+1-555-2222', '88 Bay Ave, Oakland, CA', 'ACTIVE', '2026-01-09T11:15:00Z', '2026-01-09T11:15:00Z'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'team@studio-yoga.dev', 'Studio Yoga', 'Ava Brooks', '+1-555-3333', '44 Elm Rd, Berkeley, CA', 'ACTIVE', '2026-01-10T14:20:00Z', '2026-01-10T14:20:00Z');

-- Promos
INSERT INTO promos (
  id, merchant_id, title, description, original_price, discounted_price, cashback_percent,
  total_slots, available_slots, status, activated_at, expires_at, created_at, updated_at
) VALUES
  ('51111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Morning Latte Bundle', 'Any latte + pastry combo', 12.00, 8.00, 10.00,
   100, 82, 'ACTIVE', '2026-01-15T08:00:00Z', '2026-03-15T23:59:59Z', '2026-01-12T10:00:00Z', '2026-01-15T08:00:00Z'),
  ('52222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Coffee Beans Bag', 'Single origin 12oz bag', 18.00, 14.00, 8.00,
   60, 60, 'DRAFT', NULL, '2026-04-01T23:59:59Z', '2026-01-20T10:00:00Z', '2026-01-20T10:00:00Z'),
  ('53333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Harbor Lunch Special', 'Entree + drink', 22.00, 15.00, 12.50,
   120, 95, 'ACTIVE', '2026-01-18T17:00:00Z', '2026-03-05T23:59:59Z', '2026-01-16T09:30:00Z', '2026-01-18T17:00:00Z'),
  ('54444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Yoga Starter Pack', '3-class intro pack', 45.00, 30.00, 15.00,
   80, 72, 'ACTIVE', '2026-01-20T07:00:00Z', '2026-04-20T23:59:59Z', '2026-01-18T08:15:00Z', '2026-01-20T07:00:00Z');

-- Wallets
INSERT INTO wallets (id, user_id, balance, status, created_at, updated_at)
VALUES
  ('81111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 25.00, 'ACTIVE', '2026-01-10T12:05:00Z', '2026-02-01T12:05:00Z'),
  ('82222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 9.50, 'ACTIVE', '2026-01-12T09:45:00Z', '2026-02-02T09:45:00Z'),
  ('83333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 0.00, 'ACTIVE', '2026-01-15T17:00:00Z', '2026-02-03T17:00:00Z');

-- Reservations
INSERT INTO reservations (id, user_id, promo_id, status, expires_at, redeemed_at, created_at, updated_at)
VALUES
  ('61111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '51111111-1111-1111-1111-111111111111',
   'REDEEMED', '2026-03-01T23:59:59Z', '2026-02-02T10:05:00Z', '2026-01-25T10:00:00Z', '2026-02-02T10:05:00Z'),
  ('62222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '53333333-3333-3333-3333-333333333333',
   'ACTIVE', '2026-03-10T23:59:59Z', NULL, '2026-02-01T12:00:00Z', '2026-02-01T12:00:00Z'),
  ('63333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '54444444-4444-4444-4444-444444444444',
   'REDEEMED', '2026-03-20T23:59:59Z', '2026-02-03T09:00:00Z', '2026-02-01T08:30:00Z', '2026-02-03T09:00:00Z');

-- Redemptions
INSERT INTO redemptions (
  id, reservation_id, user_id, promo_id, merchant_id, payment_type,
  promo_amount, wallet_used, cash_paid, cashback_amount, cashback_percent,
  status, qr_token, qr_generated_at, qr_expires_at, confirmed_at, created_at, updated_at
) VALUES
  ('71111111-1111-1111-1111-111111111111', '61111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   '51111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PARTIAL_WALLET',
   8.00, 3.00, 5.00, 0.50, 10.00,
   'CONFIRMED', 'qr-latte-111', '2026-02-02T09:50:00Z', '2026-02-02T10:20:00Z',
   '2026-02-02T10:05:00Z', '2026-02-02T09:50:00Z', '2026-02-02T10:05:00Z'),
  ('72222222-2222-2222-2222-222222222222', '63333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
   '54444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'IN_STORE',
   30.00, 0.00, 30.00, 4.50, 15.00,
   'CONFIRMED', 'qr-yoga-222', '2026-02-03T08:40:00Z', '2026-02-03T09:10:00Z',
   '2026-02-03T09:00:00Z', '2026-02-03T08:40:00Z', '2026-02-03T09:00:00Z');

-- Merchant balances (January 2026 period)
INSERT INTO merchant_balances (
  id, merchant_id, period_start, period_end, total_redemptions, gross_amount,
  platform_fee, affiliate_fee, wallet_credits, net_balance, is_locked, status,
  paid_at, created_at, updated_at
) VALUES
  ('91111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z', 4, 120.00,
   3.60, 6.00, 12.00, 98.40, TRUE, 'ACTIVE',
   '2026-02-03T12:00:00Z', '2026-02-02T12:00:00Z', '2026-02-03T12:00:00Z'),
  ('92222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z', 3, 90.00,
   2.70, 4.50, 6.00, 76.80, FALSE, 'ACTIVE',
   NULL, '2026-02-02T12:30:00Z', '2026-02-02T12:30:00Z');

-- Balance adjustments
INSERT INTO merchant_balance_adjustments (
  id, merchant_id, period_start, period_end, amount, reason, created_by, created_at
) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z', 5.00,
   'Customer satisfaction credit', '11111111-1111-1111-1111-111111111111', '2026-02-03T10:00:00Z');

-- Audit logs
INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, metadata, status, created_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'REDEMPTION_CONFIRMED', 'redemption',
   '71111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   '{"cashback_amount": 0.50, "promo_id": "51111111-1111-1111-1111-111111111111"}', 'ACTIVE', '2026-02-02T10:05:00Z'),
  ('b2222222-2222-2222-2222-222222222222', 'REDEMPTION_CONFIRMED', 'redemption',
   '72222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
   '{"cashback_amount": 4.50, "promo_id": "54444444-4444-4444-4444-444444444444"}', 'ACTIVE', '2026-02-03T09:00:00Z');

COMMIT;
