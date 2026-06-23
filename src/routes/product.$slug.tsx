import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { formatNaira, SKIN_TYPES, SKIN_GOALS } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Alluring` },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const cart = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "ingredients" | "usage">("description");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, brand:brands(name,slug), category:categories(name,slug), product_images(url, alt, sort_order)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      if (!product) return [];
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!product,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", product?.id],
    queryFn: async () => {
      if (!product) return [];
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, avg_rating, review_count, brand:brands(name), product_images(url)")
        .eq("is_active", true)
        .eq("category_id", product.category_id!)
        .neq("id", product.id)
        .limit(4);
      return data ?? [];
    },
    enabled: !!product,
  });

  const { data: isWishlisted = false } = useQuery({
    queryKey: ["wishlisted", product?.id, user?.id],
    queryFn: async () => {
      if (!user || !product) return false;
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!product,
  });

  async function toggleWishlist() {
    if (!user) {
      toast.error("Sign in to save favourites");
      router.navigate({ to: "/auth" });
      return;
    }
    if (!product) return;
    if (isWishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      toast.success("Saved to wishlist");
    }
    router.invalidate();
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-20 text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }
  if (!product) {
    return (
      <SiteLayout>
        <div className="container-page py-32 text-center">
          <h1 className="font-display text-4xl text-plum">Product not found</h1>
          <Link to="/shop" className="inline-block mt-6 text-gold border-b border-gold text-xs uppercase tracking-widest pb-1">
            Back to shop
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const img = product.product_images?.[0]?.url ?? "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80";
  const skinLabels = (product.skin_types as string[]).map((s) => SKIN_TYPES.find((x) => x.value === s)?.label).filter(Boolean);
  const goalLabels = (product.skincare_goals as string[]).map((g) => SKIN_GOALS.find((x) => x.value === g)?.label).filter(Boolean);

  return (
    <SiteLayout>
      <div className="container-page py-10 md:py-16">
        <nav className="text-xs uppercase tracking-widest text-muted-foreground mb-8 flex gap-2">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to="/category/$slug" params={{ slug: (product.category as any).slug }} className="hover:text-gold">
                {(product.category as any).name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <div className="aspect-[4/5] overflow-hidden bg-cream-dark shadow-xl">
              <img src={img} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            {(product.brand as any)?.name && (
              <p className="eyebrow text-gold">{(product.brand as any).name}</p>
            )}
            <h1 className="font-display text-4xl md:text-5xl text-plum mt-2 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              {product.review_count > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className={i <= Math.round(Number(product.avg_rating)) ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{Number(product.avg_rating).toFixed(1)} · {product.review_count} reviews</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Be the first to review</span>
              )}
            </div>

            <div className="flex items-baseline gap-4 mt-6">
              <span className="font-display text-3xl text-plum">{formatNaira(product.price)}</span>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                <span className="text-muted-foreground line-through">{formatNaira(product.compare_at_price)}</span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {skinLabels.map((l) => (
                <span key={l} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1 text-charcoal">{l} skin</span>
              ))}
              {goalLabels.map((l) => (
                <span key={l} className="text-[10px] uppercase tracking-widest bg-gold/15 text-plum px-3 py-1">{l}</span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-plum hover:bg-cream-dark"><Minus size={14} /></button>
                <span className="w-10 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3 text-plum hover:bg-cream-dark"><Plus size={14} /></button>
              </div>
              <button
                onClick={() =>
                  cart.add(
                    {
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: Number(product.price),
                      image: img,
                      stock: product.stock_qty,
                    },
                    qty,
                  )
                }
                disabled={product.stock_qty <= 0}
                className="flex-1 bg-plum text-cream px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-plum-light disabled:opacity-50"
              >
                {product.stock_qty > 0 ? "Add to bag" : "Out of stock"}
              </button>
              <button onClick={toggleWishlist} aria-label="Save" className="p-4 border border-border hover:border-gold">
                <Heart size={18} className={isWishlisted ? "fill-gold text-gold" : "text-plum"} />
              </button>
            </div>

            <div className="mt-8 space-y-3 text-sm text-charcoal">
              <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-gold" /> 100% authentic — verified by our team</div>
              <div className="flex items-center gap-3"><Truck size={16} className="text-gold" /> Free Lagos delivery on orders over ₦30,000</div>
            </div>

            {/* Tabs */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex gap-8 mb-6">
                {(["description", "ingredients", "usage"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-xs uppercase tracking-widest pb-2 ${tab === t ? "text-plum border-b-2 border-gold font-semibold" : "text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
                {tab === "description" && product.description}
                {tab === "ingredients" && product.ingredients}
                {tab === "usage" && product.usage_instructions}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-24">
          <h2 className="font-display text-3xl md:text-4xl text-plum mb-8">Customer reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Verified purchasers can leave the first.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {reviews.map((r) => (
                <div key={r.id} className="border-l-2 border-gold pl-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className={i <= r.rating ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  {r.title && <p className="font-display text-lg text-plum">{r.title}</p>}
                  <p className="text-sm text-charcoal mt-1">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl md:text-4xl text-plum mb-8">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {related.map((p) => (
                <ProductCard key={p.id} p={p as any} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
