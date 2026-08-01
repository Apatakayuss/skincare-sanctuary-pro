import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/_authenticated/account/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const { data: items = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("product:products(id, slug, name, price, compare_at_price, avg_rating, review_count, stock_qty, brand:brands(name), product_images(url))")
        .eq("user_id", user!.id);
      return (data ?? []).map((r) => r.product).filter(Boolean);
    },
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No saved products. <Link to="/shop" className="text-gold underline">Browse the shop</Link>.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => <ProductCard key={(p as any).id} p={p as any} />)}
        </div>
      )}
    </div>
  );
}
