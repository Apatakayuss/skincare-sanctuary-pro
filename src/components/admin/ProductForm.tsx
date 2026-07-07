import { useState } from "react";
import {
  ProductInput,
  productSchema,
  SKIN_TYPES,
  SKINCARE_GOALS,
  slugify,
} from "@/lib/product-form";

type Option = { id: string; name: string };

export function ProductForm({
  initial,
  brands,
  categories,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial: ProductInput;
  brands: Option[];
  categories: Option[];
  onSubmit: (values: ProductInput) => Promise<unknown> | unknown;
  submitting: boolean;
  submitLabel: string;
}) {
  const [values, setValues] = useState<ProductInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);

  function set<K extends keyof ProductInput>(key: K, v: ProductInput[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function toggle<T extends string>(key: "skin_types" | "skincare_goals", v: T) {
    setValues((s) => {
      const arr = s[key] as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...s, [key]: next as ProductInput[typeof key] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      const es: Record<string, string> = {};
      for (const issue of parsed.error.issues) es[issue.path.join(".")] = issue.message;
      setErrors(es);
      return;
    }
    setErrors({});
    await onSubmit(parsed.data);
  }

  const inputCls = "w-full border border-border bg-transparent px-3 py-2 text-sm";
  const labelCls = "block text-xs uppercase tracking-widest text-muted-foreground mb-1.5";
  const errCls = "text-xs text-red-600 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <section className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={values.name}
            onChange={(e) => {
              const name = e.target.value;
              set("name", name);
              if (!slugTouched) set("slug", slugify(name));
            }}
            maxLength={200}
            required
          />
          {errors.name && <p className={errCls}>{errors.name}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Slug</label>
          <input
            className={inputCls}
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            maxLength={120}
            required
          />
          {errors.slug && <p className={errCls}>{errors.slug}</p>}
        </div>
        <div>
          <label className={labelCls}>Brand</label>
          <select className={inputCls} value={values.brand_id ?? ""} onChange={(e) => set("brand_id", e.target.value || null)}>
            <option value="">— None —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={values.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price (₦)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={inputCls}
            value={values.price || ""}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
            required
          />
          {errors.price && <p className={errCls}>{errors.price}</p>}
        </div>
        <div>
          <label className={labelCls}>Compare-at price (optional)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={inputCls}
            value={values.compare_at_price ?? ""}
            onChange={(e) => set("compare_at_price", e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div>
          <label className={labelCls}>Stock quantity</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={values.stock_qty}
            onChange={(e) => set("stock_qty", parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </section>

      <section>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={4} maxLength={5000} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </section>
      <section>
        <label className={labelCls}>Ingredients</label>
        <textarea className={inputCls} rows={3} maxLength={5000} value={values.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
      </section>
      <section>
        <label className={labelCls}>Usage instructions</label>
        <textarea className={inputCls} rows={3} maxLength={5000} value={values.usage_instructions} onChange={(e) => set("usage_instructions", e.target.value)} />
      </section>

      <section>
        <p className={labelCls}>Skin types</p>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((t) => {
            const on = values.skin_types.includes(t);
            return (
              <button type="button" key={t} onClick={() => toggle("skin_types", t)} className={`px-3 py-1.5 text-xs uppercase tracking-widest border ${on ? "bg-plum text-cream border-plum" : "border-border text-charcoal"}`}>
                {t}
              </button>
            );
          })}
        </div>
      </section>
      <section>
        <p className={labelCls}>Skincare goals</p>
        <div className="flex flex-wrap gap-2">
          {SKINCARE_GOALS.map((g) => {
            const on = values.skincare_goals.includes(g);
            return (
              <button type="button" key={g} onClick={() => toggle("skincare_goals", g)} className={`px-3 py-1.5 text-xs uppercase tracking-widest border ${on ? "bg-plum text-cream border-plum" : "border-border text-charcoal"}`}>
                {g.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={values.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Active</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={values.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={values.is_bestseller} onChange={(e) => set("is_bestseller", e.target.checked)} /> Bestseller</label>
      </section>

      <div className="pt-4 border-t border-border">
        <button type="submit" disabled={submitting} className="bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest disabled:opacity-50">
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
