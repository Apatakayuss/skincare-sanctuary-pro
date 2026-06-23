import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(qty)").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Orders</h1>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3">{o.shipping_recipient}<br /><span className="text-xs text-muted-foreground">{o.guest_email ?? "Registered"}</span></td>
                <td className="p-3">{(o.order_items as any[])?.reduce((n, i) => n + i.qty, 0)}</td>
                <td className="p-3 font-semibold">{formatNaira(o.grand_total)}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="border border-border bg-transparent px-2 py-1 text-xs uppercase">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
