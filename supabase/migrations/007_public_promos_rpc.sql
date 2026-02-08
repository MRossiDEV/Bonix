-- Public RPC to expose promo feed with merchant name only

CREATE OR REPLACE FUNCTION get_public_promos(p_limit INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  original_price DECIMAL,
  discounted_price DECIMAL,
  cashback_percent DECIMAL,
  image TEXT,
  expires_at TIMESTAMPTZ,
  merchant_name TEXT
) AS $$
  SELECT
    promos.id,
    promos.title,
    promos.description,
    promos.original_price,
    promos.discounted_price,
    promos.cashback_percent,
    promos.image,
    promos.expires_at,
    merchants.business_name AS merchant_name
  FROM promos
  JOIN merchants ON merchants.id = promos.merchant_id
  WHERE promos.status = 'ACTIVE'
    AND promos.expires_at > NOW()
  ORDER BY promos.created_at DESC
  LIMIT LEAST(p_limit, 50);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_public_promos(INTEGER) TO anon, authenticated;
