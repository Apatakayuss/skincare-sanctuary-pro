import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { placeOrder } from "@/lib/checkout.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Alluring" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  email: z.string().email("Valid email required").max(255),
  recipient: z.string().trim().min(2, "Name required").max(100),
  phone: z.string().trim().min(7, "Phone required").max(20),
  street: z.string().trim().min(3, "Street required").max(200),
  city: z.string().trim().min(2, "City required").max(80),
  state: z.string().trim().min(2, "State required").max(80),
  notes: z.string().max(500).optional(),
});

type SavedAddress = {
  id: string;
  label: string | null;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  is_default: boolean;
};

function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const submitOrder = useServerFn(placeOrder);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [form, setForm] = useState({
    email: user?.email ?? "",
    recipient: "",
    phone: "",
    street: "",
    city: "Lagos",
    state: "Lagos",
    notes: "",
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: addrs }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("addresses")
          .select("id, label, recipient, phone, street, city, state, is_default")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      const list = addrs ?? [];
      setAddresses(list);
      const pick = list.find((a) => a.is_default) ?? list[0];

      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        recipient: f.recipient || pick?.recipient || profile?.full_name || "",
        phone: f.phone || pick?.phone || profile?.phone || "",
        street: f.street || pick?.street || "",
        city: pick?.city ?? f.city,
        state: pick?.state ?? f.state,
      }));
      if (pick) setSelectedAddressId(pick.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function applyAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm((f) => ({ ...f, recipient: "", phone: "", street: "", city: "Lagos", state: "Lagos" }));
      return;
    }
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setForm((f) => ({
      ...f,
      recipient: a.recipient,
      phone: a.phone,
      street: a.street,
      city: a.city,
      state: a.state,
    }));
  }

  const shipping = cart.subtotal >= 30000 ? 0 : 2500;
  const total = cart.subtotal + shipping;


  if (cart.items.length === 0) {
    return (
      <SiteLayout>
        <div className="container-page py-32 text-center">
          <h1 className="font-display text-3xl text-plum">Your bag is empty</h1>
        </div>
      </SiteLayout>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          items: cart.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
          guest_email: user ? null : parsed.data.email,
          recipient: parsed.data.recipient,
          phone: parsed.data.phone,
          street: parsed.data.street,
          city: parsed.data.city,
          state: parsed.data.state,
          notes: parsed.data.notes ?? null,
        },
      });
      cart.clear();
      router.navigate({ to: "/order/$id/confirmation", params: { id: result.orderId } });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <div className="container-page py-12 md:py-20">
        <h1 className="font-display text-4xl md:text-5xl text-plum mb-10">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-8">
            <section>
              <h2 className="eyebrow text-gold mb-4">Contact</h2>
              <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled={!!user} />
            </section>
            <section>
              <h2 className="eyebrow text-gold mb-4">Delivery address</h2>
              {addresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex gap-3 items-start border p-4 cursor-pointer ${selectedAddressId === a.id ? "border-gold bg-cream-dark/40" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        className="mt-1 accent-plum"
                        checked={selectedAddressId === a.id}
                        onChange={() => applyAddress(a.id)}
                      />
                      <span className="text-sm">
                        {a.label && <span className="block eyebrow text-gold">{a.label}</span>}
                        <span className="block text-plum">{a.recipient}</span>
                        <span className="block text-charcoal">{a.street}, {a.city}, {a.state}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{a.phone}</span>
                      </span>
                    </label>
                  ))}
                  <label className={`flex gap-3 items-center border p-4 cursor-pointer ${selectedAddressId === "new" ? "border-gold bg-cream-dark/40" : "border-border"}`}>
                    <input
                      type="radio"
                      name="saved-address"
                      className="accent-plum"
                      checked={selectedAddressId === "new"}
                      onChange={() => applyAddress("new")}
                    />
                    <span className="text-sm text-plum">Use a new address</span>
                  </label>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">

                <Field label="Full name" required value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} />
                <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Street address" required className="sm:col-span-2" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
                <Field label="City" required value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="State" required value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Field label="Order notes (optional)" className="sm:col-span-2" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              </div>
            </section>
            <section>
              <h2 className="eyebrow text-gold mb-4">Payment</h2>
              <div className="border border-border p-5 bg-cream-dark/40">
                <p className="font-display text-lg text-plum">Cash / bank transfer on delivery</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Live card payments via Paystack are coming soon. For now, our team confirms each order by phone within 1 business hour.
                </p>
              </div>
            </section>
          </div>
          <aside className="bg-card p-8 border border-border h-fit">
            <h2 className="font-display text-2xl text-plum mb-6">Order summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {cart.items.map((i) => (
                <div key={i.productId} className="flex gap-3 text-sm">
                  <div className="w-12 h-14 bg-cream-dark flex-shrink-0">{i.image && <img src={i.image} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <p className="text-plum">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.qty}</p>
                  </div>
                  <span>{formatNaira(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border my-6" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(cart.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{shipping === 0 ? "Free" : formatNaira(shipping)}</span></div>
            </div>
            <div className="border-t border-border my-6" />
            <div className="flex justify-between text-lg font-semibold text-plum"><span>Total</span><span>{formatNaira(total)}</span></div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-8 bg-plum text-cream py-4 text-xs uppercase tracking-widest font-semibold hover:bg-plum-light disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </aside>
        </form>
      </div>
    </SiteLayout>
  );
}

function Field({
  label, value, onChange, type = "text", required, className = "", disabled,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; className?: string; disabled?: boolean }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold disabled:opacity-60"
      />
    </label>
  );
}
