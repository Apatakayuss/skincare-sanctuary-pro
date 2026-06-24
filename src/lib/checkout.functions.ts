import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().int().min(1).max(50),
});

const placeOrderInput = z.object({
  items: z.array(itemSchema).min(1).max(50),
  guest_email: z.string().email().max(255).optional().nullable(),
  recipient: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  notes: z.string().max(500).optional().nullable(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => placeOrderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Optional auth — guests allowed, but if a bearer is present we verify it.
    let userId: string | null = null;
    try {
      const req = getRequest();
      const auth = req?.headers.get("authorization") ?? "";
      if (auth.startsWith("Bearer ")) {
        const token = auth.slice(7);
        if (token.split(".").length === 3) {
          const { data: claims } = await supabaseAdmin.auth.getClaims(token);
          if (claims?.claims?.sub) userId = claims.claims.sub as string;
        }
      }
    } catch {
      // ignore — treat as guest
    }

    if (!userId && !data.guest_email) {
      throw new Error("Guest checkout requires an email address.");
    }

    // Server-side price lookup — never trust client prices.
    const ids = Array.from(new Set(data.items.map((i) => i.product_id)));
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, price, sale_price, stock, is_active")
      .in("id", ids);
    if (pErr) throw pErr;

    const byId = new Map(products?.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      product_name: string;
      product_slug: string;
      product_image: string | null;
      unit_price: number;
      qty: number;
    }> = [];

    for (const line of data.items) {
      const p = byId.get(line.product_id);
      if (!p || !p.is_active) throw new Error(`Product unavailable: ${line.product_id}`);
      if (p.stock !== null && p.stock < line.qty) {
        throw new Error(`Insufficient stock for ${p.name}`);
      }
      const unit = Number(p.sale_price ?? p.price);
      if (!Number.isFinite(unit) || unit <= 0) {
        throw new Error(`Invalid price for ${p.name}`);
      }
      subtotal += unit * line.qty;
      orderItems.push({
        product_id: p.id,
        product_name: p.name,
        product_slug: p.slug,
        product_image: null,
        unit_price: unit,
        qty: line.qty,
      });
    }

    // Fetch a primary image for each product (best-effort).
    const { data: imgs } = await supabaseAdmin
      .from("product_images")
      .select("product_id, url")
      .in("product_id", ids)
      .order("sort_order", { ascending: true });
    const firstImg = new Map<string, string>();
    for (const r of imgs ?? []) {
      if (!firstImg.has(r.product_id)) firstImg.set(r.product_id, r.url);
    }
    for (const oi of orderItems) {
      oi.product_image = firstImg.get(oi.product_id) ?? null;
    }

    const shipping_total = subtotal >= 30000 ? 0 : 2500;
    const grand_total = subtotal + shipping_total;

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        guest_email: userId ? null : data.guest_email!,
        status: "pending",
        subtotal,
        shipping_total,
        grand_total,
        payment_method: "Pay on delivery (Paystack coming soon)",
        shipping_recipient: data.recipient,
        shipping_phone: data.phone,
        shipping_street: data.street,
        shipping_city: data.city,
        shipping_state: data.state,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (oErr || !order) throw oErr ?? new Error("Order create failed");

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));
    if (iErr) throw iErr;

    return { orderId: order.id };
  });
