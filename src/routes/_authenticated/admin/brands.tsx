import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/product-form";

export const Route = createFileRoute("/_authenticated/admin/brands")({
  component: AdminBrands,
});

type Brand = { id: string; slug: string; name: string; logo_url: string | null };

const emptyForm = { slug: "", name: "", logo_url: "" };

function AdminBrands() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Brand[];
    },
  });

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
  }
  function edit(row: Brand) {
    setEditingId(row.id);
    setSlugTouched(true);
    setForm({ slug: row.slug, name: row.name, logo_url: row.logo_url ?? "" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return toast.error("Name and slug are required");
    setSaving(true);
    const payload = { slug: form.slug.trim(), name: form.name.trim(), logo_url: form.logo_url.trim() || null };
    const { error } = editingId
      ? await supabase.from("brands").update(payload).eq("id", editingId)
      : await supabase.from("brands").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Brand updated" : "Brand created");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
    qc.invalidateQueries({ queryKey: ["admin-brands-options"] });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete brand "${name}"? Products with this brand will be unassigned.`)) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
    qc.invalidateQueries({ queryKey: ["admin-brands-options"] });
  }

  const inputCls = "w-full border border-border bg-transparent px-3 py-2 text-sm";
  const labelCls = "block text-xs uppercase tracking-widest text-muted-foreground mb-1.5";

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Brands</h1>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 mb-10 p-6 border border-border bg-cream-dark/30">
        <div>
          <label className={labelCls}>Name</label>
          <input value={form.name} onChange={(e) => { const name = e.target.value; setForm((s) => ({ ...s, name, slug: slugTouched ? s.slug : slugify(name) })); }} maxLength={100} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((s) => ({ ...s, slug: e.target.value })); }} maxLength={120} className={inputCls} required />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Logo URL</label>
          <input value={form.logo_url} onChange={(e) => setForm((s) => ({ ...s, logo_url: e.target.value }))} maxLength={2000} className={inputCls} />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="bg-plum text-cream px-6 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update brand" : "Add brand"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-6 py-2.5 text-xs uppercase tracking-widest border border-border">Cancel</button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 text-plum font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground">{r.slug}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => edit(r)} className="text-xs uppercase tracking-widest text-plum hover:text-gold mr-3">Edit</button>
                  <button onClick={() => remove(r.id, r.name)} className="text-xs uppercase tracking-widest text-red-600 hover:opacity-70">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
