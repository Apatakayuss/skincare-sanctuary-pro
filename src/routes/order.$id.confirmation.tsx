import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/order/$id/confirmation")({
  head: () => ({ meta: [{ title: "Order confirmed — Alluring" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useParams();
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
      return data;
    },
  });

  return (
    <SiteLayout>
      <div className="container-page py-20 max-w-2xl mx-auto text-center">
        <CheckCircle2 size={48} className="mx-auto text-gold mb-6" />
        <p className="eyebrow text-gold mb-3">Order placed</p>
        <h1 className="font-display text-4xl md:text-5xl text-plum">Thank you for your order</h1>
        <p className="text-muted-foreground mt-4">
          We've received your order. Our team will confirm by phone within 1 business hour and ship within 24 hours.
        </p>
        {order && (
          <div className="mt-10 bg-card border border-border p-8 text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Order #</p>
            <p className="font-mono text-sm mt-1">{order.id.slice(0, 8).toUpperCase()}</p>
            <div className="mt-6 space-y-3">
              {(order.order_items as any[])?.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span>{i.product_name} <span className="text-muted-foreground">× {i.qty}</span></span>
                  <span>{formatNaira(Number(i.unit_price) * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border my-6" />
            <div className="flex justify-between font-semibold text-plum"><span>Total</span><span>{formatNaira(order.grand_total)}</span></div>
            <p className="text-sm text-muted-foreground mt-6">Estimated delivery: 2–5 business days in Lagos, 3–7 days nationwide.</p>
          </div>
        )}
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/shop" className="bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest">Continue shopping</Link>
          <Link to="/account/orders" className="border border-plum text-plum px-8 py-3 text-xs uppercase tracking-widest">View orders</Link>
        </div>
      </div>
    </SiteLayout>
  );
}
