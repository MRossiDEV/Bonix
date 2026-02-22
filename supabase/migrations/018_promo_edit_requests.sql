-- Enable edit requests in promo change workflow

ALTER TABLE promo_change_requests
  ADD COLUMN IF NOT EXISTS requested_changes JSONB;

ALTER TABLE promo_change_requests
  DROP CONSTRAINT IF EXISTS promo_change_requests_action_check;

ALTER TABLE promo_change_requests
  ADD CONSTRAINT promo_change_requests_action_check
  CHECK (action IN ('ACTIVATE', 'PAUSE', 'DEACTIVATE', 'DELETE', 'EDIT'));
