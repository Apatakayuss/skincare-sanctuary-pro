
DROP POLICY IF EXISTS "own orders insert" ON public.orders;
DROP POLICY IF EXISTS "guest order insert" ON public.orders;
DROP POLICY IF EXISTS "order_items insert with order" ON public.order_items;

REVOKE EXECUTE ON FUNCTION public.redeem_coupon(text) FROM PUBLIC, anon, authenticated;
