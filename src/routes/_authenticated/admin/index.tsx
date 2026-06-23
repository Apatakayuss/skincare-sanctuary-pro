import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: orderCount }, { count: productCount }, { data: revenueRows }, { count: customerCount }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("grand_total").in("status", ["paid", "processing", "shipped", "delivered"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      const revenue = (revenueRows ?? []).reduce((n: number, r: any) => n + Number(r.grand_total ?? 0), 0);
      return { orderCount: orderCount ?? 0, productCount: productCount ?? 0, revenue, customerCount: customerCount ?? 0 };
    },
  });

  const cards = [
    { label: "Revenue", value: formatNaira(stats?.revenue ?? 0) },
    { label: "Orders", value: String(stats?.orderCount ?? 0) },
    { label: "Products", value: String(stats?.productCount ?? 0) },
    { label: "Customers", value: String(stats?.customerCount ?? 0) },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-border p-6 bg-card">
            <p className="eyebrow text-gold">{c.label}</p>
            <p className="font-display text-3xl text-plum mt-2">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-10 max-w-xl">
        Use the navigation on the left to manage products, fulfill orders, moderate reviews, and view customer accounts.
        Live card payments via Paystack and email notifications are scheduled for the next release.
      </p>
    </div>
  );
}
