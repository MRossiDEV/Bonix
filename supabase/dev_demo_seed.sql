BEGIN;

TRUNCATE TABLE
  merchant_balance_adjustments,
  merchant_balances,
  redemptions,
  reservations,
  promos,
  wallets,
  user_favorite_merchants,
  user_roles,
  audit_logs,
  merchants,
  users
RESTART IDENTITY CASCADE;

-- Users
INSERT INTO users (id, email, name, phone, role, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@bonix.dev', 'Admin User', '+598 99 000 001', 'ADMIN', 'ACTIVE', '2026-01-05T10:00:00Z', '2026-01-05T10:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'alex@bonix.dev', 'Alex Rivera', '+598 99 000 002', 'USER', 'ACTIVE', '2026-01-10T12:00:00Z', '2026-01-10T12:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'jamie@bonix.dev', 'Jamie Chen', '+598 99 000 003', 'USER', 'ACTIVE', '2026-01-12T09:30:00Z', '2026-01-12T09:30:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'taylor@bonix.dev', 'Taylor Singh', '+598 99 000 004', 'USER', 'ACTIVE', '2026-01-15T16:45:00Z', '2026-01-15T16:45:00Z'),
  ('55555555-5555-5555-5555-555555555555', 'maria@bonix.dev', 'María López', '+598 99 000 005', 'USER', 'ACTIVE', '2026-01-16T09:00:00Z', '2026-01-16T09:00:00Z'),
  ('66666666-6666-6666-6666-666666666666', 'hello@lumen.cafe', 'Lumen Café Merchant', '+598 2900 1111', 'MERCHANT', 'ACTIVE', '2026-01-18T08:00:00Z', '2026-01-18T08:00:00Z'),
  ('77777777-7777-7777-7777-777777777777', 'owner@harborgrill.uy', 'Harbor Grill Merchant', '+598 2900 2222', 'MERCHANT', 'ACTIVE', '2026-01-19T08:00:00Z', '2026-01-19T08:00:00Z'),
  ('88888888-8888-8888-8888-888888888888', 'team@pueblosushi.uy', 'Pueblo Sushi Merchant', '+598 2900 3333', 'MERCHANT', 'ACTIVE', '2026-01-20T08:00:00Z', '2026-01-20T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ADMIN', '2026-01-05T10:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'USER', '2026-01-05T10:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'USER', '2026-01-10T12:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'USER', '2026-01-12T09:30:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'USER', '2026-01-15T16:45:00Z'),
  ('55555555-5555-5555-5555-555555555555', 'USER', '2026-01-16T09:00:00Z'),
  ('66666666-6666-6666-6666-666666666666', 'MERCHANT', '2026-01-18T08:00:00Z'),
  ('77777777-7777-7777-7777-777777777777', 'MERCHANT', '2026-01-19T08:00:00Z'),
  ('88888888-8888-8888-8888-888888888888', 'MERCHANT', '2026-01-20T08:00:00Z')
ON CONFLICT (user_id, role) DO NOTHING;

-- Merchants
INSERT INTO merchants (id, user_id, email, business_name, contact_name, phone, address, status, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'hello@lumen.cafe', 'Lumen Café', 'Priya Patel', '+598 2900 1111', '18 Plaza Independencia, Montevideo', 'ACTIVE', '2026-01-08T09:00:00Z', '2026-01-08T09:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'owner@harborgrill.uy', 'Harbor Grill', 'Marco Díaz', '+598 2900 2222', 'Av. 18 de Julio 1980, Montevideo', 'ACTIVE', '2026-01-09T11:15:00Z', '2026-01-09T11:15:00Z'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '88888888-8888-8888-8888-888888888888', 'team@pueblosushi.uy', 'Pueblo Sushi', 'Sofía Gómez', '+598 2900 3333', 'Calle Sarandí 1234, Montevideo', 'ACTIVE', '2026-01-10T14:20:00Z', '2026-01-10T14:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- Favorite merchants
INSERT INTO user_favorite_merchants (user_id, merchant_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (user_id, merchant_id) DO NOTHING;

-- Promos
INSERT INTO promos (
  id,
  merchant_id,
  title,
  description,
  original_price,
  discounted_price,
  cashback_percent,
  total_slots,
  available_slots,
  status,
  activity_state,
  activated_at,
  expires_at,
  created_at,
  updated_at
)
VALUES
  (
    '51111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Combo Café + Medialuna',
    'Café espresso más medialuna del día.',
    390.00,
    260.00,
    12.00,
    80,
    62,
    'ACTIVE',
    'ACTIVE',
    '2026-01-15T08:00:00Z',
    NOW() + INTERVAL '30 days',
    '2026-01-12T10:00:00Z',
    '2026-01-15T08:00:00Z'
  ),
  (
    '52222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Almuerzo del Puerto',
    'Entrada más plato principal con bebida.',
    980.00,
    650.00,
    10.00,
    120,
    89,
    'ACTIVE',
    'ACTIVE',
    '2026-01-18T17:00:00Z',
    NOW() + INTERVAL '45 days',
    '2026-01-16T09:30:00Z',
    '2026-01-18T17:00:00Z'
  ),
  (
    '53333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Sushi Starter Pack',
    'Set de entrada para probar combinado.',
    1450.00,
    980.00,
    15.00,
    60,
    42,
    'ACTIVE',
    'ACTIVE',
    '2026-01-20T07:00:00Z',
    NOW() + INTERVAL '60 days',
    '2026-01-18T08:15:00Z',
    '2026-01-20T07:00:00Z'
  ),
  (
    '54444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Descuento de mañana',
    '20% off en panadería y tostadas.',
    520.00,
    420.00,
    8.00,
    50,
    50,
    'DRAFT',
    'UNACTIVE',
    NULL,
    '2026-04-01T23:59:59Z',
    '2026-02-10T10:00:00Z',
    '2026-02-10T10:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Wallets
INSERT INTO wallets (id, user_id, balance, created_at, updated_at)
VALUES
  ('81111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 250.00, '2026-01-10T12:05:00Z', '2026-02-01T12:05:00Z'),
  ('82222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 95.00, '2026-01-12T09:45:00Z', '2026-02-02T09:45:00Z'),
  ('83333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 0.00, '2026-01-15T17:00:00Z', '2026-02-03T17:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Reservations
INSERT INTO reservations (id, user_id, promo_id, status, expires_at, redeemed_at, created_at, updated_at, qr_code)
VALUES
  (
    '61111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '51111111-1111-1111-1111-111111111111',
    'REDEEMED',
    '2026-03-01T23:59:59Z',
    '2026-02-02T10:05:00Z',
    '2026-01-25T10:00:00Z',
    '2026-02-02T10:05:00Z',
    'reservation-qr-lumen-111'
  ),
  (
    '62222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '52222222-2222-2222-2222-222222222222',
    'ACTIVE',
    '2026-03-10T23:59:59Z',
    NULL,
    '2026-02-01T12:00:00Z',
    '2026-02-01T12:00:00Z',
    'reservation-qr-harbor-222'
  ),
  (
    '63333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '53333333-3333-3333-3333-333333333333',
    'REDEEMED',
    '2026-03-20T23:59:59Z',
    '2026-02-03T09:00:00Z',
    '2026-02-01T08:30:00Z',
    '2026-02-03T09:00:00Z',
    'reservation-qr-sushi-333'
  )
ON CONFLICT (id) DO NOTHING;

-- Redemptions
INSERT INTO redemptions (
  id,
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
  status,
  qr_token,
  qr_generated_at,
  qr_expires_at,
  confirmed_at,
  created_at,
  updated_at
)
VALUES
  (
    '71111111-1111-1111-1111-111111111111',
    '61111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '51111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'PARTIAL_WALLET',
    260.00,
    120.00,
    140.00,
    31.20,
    12.00,
    'CONFIRMED',
    'qr-lumen-111',
    '2026-02-02T09:50:00Z',
    '2026-02-02T10:20:00Z',
    '2026-02-02T10:05:00Z',
    '2026-02-02T09:50:00Z',
    '2026-02-02T10:05:00Z'
  ),
  (
    '72222222-2222-2222-2222-222222222222',
    '63333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '53333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'IN_STORE',
    980.00,
    0.00,
    980.00,
    147.00,
    15.00,
    'CONFIRMED',
    'qr-sushi-222',
    '2026-02-03T08:40:00Z',
    '2026-02-03T09:10:00Z',
    '2026-02-03T09:00:00Z',
    '2026-02-03T08:40:00Z',
    '2026-02-03T09:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Merchant balance snapshots
INSERT INTO merchant_balances (
  id,
  merchant_id,
  period_start,
  period_end,
  total_redemptions,
  gross_amount,
  platform_fee,
  affiliate_fee,
  wallet_credits,
  net_balance,
  is_locked,
  paid_at,
  created_at,
  updated_at
)
VALUES
  (
    '91111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2026-01-01T00:00:00Z',
    '2026-02-01T00:00:00Z',
    1,
    260.00,
    7.80,
    13.00,
    120.00,
    119.20,
    TRUE,
    '2026-02-03T12:00:00Z',
    '2026-02-02T12:00:00Z',
    '2026-02-03T12:00:00Z'
  ),
  (
    '92222222-2222-2222-2222-222222222222',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2026-01-01T00:00:00Z',
    '2026-02-01T00:00:00Z',
    1,
    980.00,
    29.40,
    49.00,
    0.00,
    901.60,
    FALSE,
    NULL,
    '2026-02-02T12:30:00Z',
    '2026-02-02T12:30:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Merchant balance adjustments
INSERT INTO merchant_balance_adjustments (id, merchant_id, period_start, period_end, amount, reason, created_by, created_at)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2026-01-01T00:00:00Z',
    '2026-02-01T00:00:00Z',
    25.00,
    'Ajuste por promoción de lanzamiento',
    '11111111-1111-1111-1111-111111111111',
    '2026-02-03T10:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Audit logs
INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, metadata, created_at)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'REDEMPTION_CONFIRMED',
    'redemption',
    '71111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '{"cashback_amount": 31.2, "promo_id": "51111111-1111-1111-1111-111111111111"}',
    '2026-02-02T10:05:00Z'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'REDEMPTION_CONFIRMED',
    'redemption',
    '72222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    '{"cashback_amount": 147.0, "promo_id": "53333333-3333-3333-3333-333333333333"}',
    '2026-02-03T09:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
