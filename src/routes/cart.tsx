import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your bag — Alluring" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, update, remove } = useCart();
  const shipping = subtotal === 0 ? 0 : subtotal >= 30000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container-page py-32 text-center max-w-md mx-auto">
          <ShoppingBag size={36} className="mx-auto text-gold mb-6" />
          <h1 className="font-display text-4xl text-plum">Your bag is empty</h1>
          <p className="text-muted-foreground mt-3">Discover serums, sunscreens, and treatments curated for your skin.</p>
          <Link to="/shop" className="inline-block mt-8 bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest">Start shopping</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-12 md:py-20">
        <h1 className="font-display text-4xl md:text-5xl text-plum mb-10">Your bag</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-6">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-5 border-b border-border pb-6">
                <Link to="/product/$slug" params={{ slug: i.slug }} className="w-24 h-32 bg-cream-dark overflow-hidden flex-shrink-0">
                  {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: i.slug }} className="font-display text-xl text-plum hover:text-gold">
                    {i.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{formatNaira(i.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border">
                      <button onClick={() => update(i.productId, i.qty - 1)} className="p-2"><Minus size={12} /></button>
                      <span className="w-8 text-center text-sm">{i.qty}</span>
                      <button onClick={() => update(i.productId, i.qty + 1)} className="p-2"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => remove(i.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="text-right font-semibold text-plum">{formatNaira(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <aside className="bg-card p-8 h-fit border border-border">
            <h2 className="font-display text-2xl text-plum mb-6">Summary</h2>
            <div className="space-y-3 text-sm">
              <Row label="Subtotal" value={formatNaira(subtotal)} />
              <Row label="Delivery" value={shipping === 0 ? "Free" : formatNaira(shipping)} />
            </div>
            <div className="border-t border-border my-6" />
            <Row label="Total" value={formatNaira(total)} large />
            <Link to="/checkout" className="block text-center bg-plum text-cream mt-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-plum-light">
              Checkout
            </Link>
            <Link to="/shop" className="block text-center mt-3 text-xs uppercase tracking-widest text-plum">Continue shopping</Link>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className={`flex justify-between ${large ? "text-lg font-semibold text-plum" : ""}`}>
      <span className={large ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
