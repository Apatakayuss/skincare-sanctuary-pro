import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/product-form";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

const emptyForm = { slug: "", name: "", description: "", image_url: "", sort_order: 0 };

function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
  }

  function edit(row: Category) {
    setEditingId(row.id);
    setSlugTouched(true);
    setForm({
      slug: row.slug,
      name: row.name,
      description: row.description ?? "",
      image_url: row.image_url ?? "",
      sort_order: row.sort_order,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return toast.error("Name and slug are required");
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      sort_order: form.sort_order || 0,
    };
    const { error } = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Category updated" : "Category created");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["admin-categories-options"] });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Products in this category will be unassigned.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["admin-categories-options"] });
  }

  const inputCls = "w-full border border-border bg-transparent px-3 py-2 text-sm";
  const labelCls = "block text-xs uppercase tracking-widest text-muted-foreground mb-1.5";

  return (
    <div>
      <h1 className="font-display text-4xl text-plum mb-8">Categories</h1>

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
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} maxLength={500} rows={2} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Image URL</label>
          <input value={form.image_url} onChange={(e) => setForm((s) => ({ ...s, image_url: e.target.value }))} maxLength={2000} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sort order</label>
          <input type="number" value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: parseInt(e.target.value, 10) || 0 }))} className={inputCls} />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="bg-plum text-cream px-6 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update category" : "Add category"}
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
              <th className="p-3">Sort</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 text-plum font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground">{r.slug}</td>
                <td className="p-3">{r.sort_order}</td>
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
