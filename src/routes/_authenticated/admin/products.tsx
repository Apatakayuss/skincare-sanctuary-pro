import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProductsLayout,
});

function AdminProductsLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Only render the list on the exact /admin/products path; child routes render via <Outlet />.
  if (path !== "/admin/products") return <Outlet />;
  return <AdminProductsList />;
}

function AdminProductsList() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, stock_qty, is_active, is_featured, is_bestseller, brand:brands(name), category:categories(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function updateStock(id: string, qty: number) {
    const { error } = await supabase.from("products").update({ stock_qty: qty }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Stock updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  async function toggleActive(id: string, v: boolean) {
    const { error } = await supabase.from("products").update({ is_active: v }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This also removes its images and cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-plum">Products</h1>
        <Link to="/admin/products/new" className="bg-plum text-cream px-5 py-2.5 text-xs uppercase tracking-widest">
          + New product
        </Link>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 text-plum font-medium">
                  <Link to="/admin/products/$id" params={{ id: p.id }} className="hover:underline">{p.name}</Link>
                </td>
                <td className="p-3 text-muted-foreground">{p.brand?.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.category?.name ?? "—"}</td>
                <td className="p-3">{formatNaira(p.price)}</td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.stock_qty}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v !== p.stock_qty) updateStock(p.id, v);
                    }}
                    className="w-20 border border-border bg-transparent px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <button onClick={() => toggleActive(p.id, !p.is_active)} className={`px-3 py-1 text-xs uppercase tracking-widest ${p.is_active ? "bg-gold/15 text-plum" : "bg-muted text-muted-foreground"}`}>
                    {p.is_active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Link to="/admin/products/$id" params={{ id: p.id }} className="text-xs uppercase tracking-widest text-plum hover:text-gold mr-3">Edit</Link>
                  <button onClick={() => remove(p.id, p.name)} className="text-xs uppercase tracking-widest text-red-600 hover:opacity-70">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
