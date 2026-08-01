import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/cart";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  compare_at_price?: number | string | null;
  avg_rating: number;
  review_count: number;
  stock_qty?: number | null;
  brand?: { name: string } | null;
  product_images?: { url: string }[] | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const cart = useCart();
  const img = p.product_images?.[0]?.url ?? "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80";
  const outOfStock = typeof p.stock_qty === "number" && p.stock_qty <= 0;

  function addToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      image: p.product_images?.[0]?.url ?? null,
      stock: p.stock_qty ?? undefined,
    });
  }

  return (
    <div className="group relative">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-cream-dark mb-4 relative">
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
          />
          {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
            <span className="absolute top-3 left-3 bg-plum text-cream text-[10px] uppercase tracking-widest px-2 py-1">
              Save
            </span>
          )}
          <button
            type="button"
            onClick={addToBag}
            disabled={outOfStock}
            aria-label={outOfStock ? `${p.name} is out of stock` : `Add ${p.name} to bag`}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-plum/95 text-cream py-3 text-[10px] uppercase tracking-widest font-semibold translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 disabled:bg-charcoal/70 disabled:cursor-not-allowed max-md:translate-y-0 max-md:opacity-100"
          >
            <ShoppingBag size={13} />
            {outOfStock ? "Out of stock" : "Add to bag"}
          </button>
        </div>
        <div className="space-y-1">
          {p.brand?.name && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.brand.name}</p>
          )}
          <h3 className="font-display text-lg text-plum leading-snug group-hover:text-gold transition-colors">
            {p.name}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-charcoal font-semibold">{formatNaira(p.price)}</span>
              {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                <span className="text-xs text-muted-foreground line-through">{formatNaira(p.compare_at_price)}</span>
              )}
            </div>
            {p.review_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star size={12} className="fill-gold text-gold" />
                {Number(p.avg_rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
