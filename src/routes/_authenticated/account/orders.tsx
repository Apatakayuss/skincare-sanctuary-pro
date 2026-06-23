import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(qty)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet. <Link to="/shop" className="text-gold underline">Start shopping</Link>.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} to="/order/$id/confirmation" params={{ id: o.id }} className="block border border-border p-5 hover:border-gold">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="font-display text-lg text-plum mt-1">{(o.order_items as any[])?.reduce((n, i) => n + i.qty, 0)} items</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-plum">{formatNaira(o.grand_total)}</p>
                  <span className="text-[10px] uppercase tracking-widest bg-gold/15 text-plum px-2 py-1 inline-block mt-2">{o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
