ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS default_promo_image_url TEXT;

UPDATE platform_settings
SET default_promo_image_url = '/promo-placeholder.svg'
WHERE default_promo_image_url IS NULL OR BTRIM(default_promo_image_url) = '';

ALTER TABLE platform_settings
  ALTER COLUMN default_promo_image_url SET DEFAULT '/promo-placeholder.svg';