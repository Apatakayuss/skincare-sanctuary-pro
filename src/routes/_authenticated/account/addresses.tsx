import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  component: AddressesPage,
});

type Addr = {
  id: string; label: string | null; recipient: string; phone: string; street: string; city: string; state: string; is_default: boolean;
};

function AddressesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Addr[]>([]);
  const [form, setForm] = useState({ label: "", recipient: "", phone: "", street: "", city: "Lagos", state: "Lagos" });

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { load(); }, [user]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) toast.error(error.message); else { toast.success("Added"); setForm({ label: "", recipient: "", phone: "", street: "", city: "Lagos", state: "Lagos" }); load(); }
  }

  async function remove(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Saved addresses</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {list.map((a) => (
          <div key={a.id} className="border border-border p-5">
            <div className="flex justify-between items-start">
              <div>
                {a.label && <p className="eyebrow text-gold">{a.label}</p>}
                <p className="font-display text-lg text-plum">{a.recipient}</p>
                <p className="text-sm text-charcoal mt-1">{a.street}<br />{a.city}, {a.state}</p>
                <p className="text-xs text-muted-foreground mt-2">{a.phone}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl text-plum mb-4">Add address</h2>
      <form onSubmit={add} className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <Field label="Label (Home, Office...)" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
        <Field label="Recipient" value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} required />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="Street" value={form.street} onChange={(v) => setForm({ ...form, street: v })} required className="sm:col-span-2" />
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
        <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
        <button className="sm:col-span-2 bg-plum text-cream py-3 text-xs uppercase tracking-widest">Save address</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, className = "" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
    </label>
  );
}
