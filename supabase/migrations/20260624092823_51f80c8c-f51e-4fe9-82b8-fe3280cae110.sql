DROP POLICY IF EXISTS "coupons public read active" ON public.coupons;

CREATE POLICY "coupons admin read"
ON public.coupons FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.coupons FROM anon;

CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  discount_type text,
  value numeric,
  usage_limit integer,
  used_count integer,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, c.discount_type, c.value,
         c.usage_limit, c.used_count, c.expires_at
  FROM public.coupons c
  WHERE upper(c.code) = upper(_code)
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at >= now())
    AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_coupon(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO anon, authenticated;