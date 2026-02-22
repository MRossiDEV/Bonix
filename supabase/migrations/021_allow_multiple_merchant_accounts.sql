-- Allow multiple merchant accounts per user

ALTER TABLE merchants DROP CONSTRAINT IF EXISTS merchants_user_id_key;
DROP INDEX IF EXISTS merchants_user_id_key;

ALTER TABLE merchants DROP CONSTRAINT IF EXISTS merchants_email_key;
DROP INDEX IF EXISTS merchants_email_key;

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
