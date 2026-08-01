import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductInput } from "@/lib/product-form";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands-options"],
    queryFn: async () => (await supabase.from("brands").select("id, name").order("name")).data ?? [],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-options"],
    queryFn: async () => (await supabase.from("categories").select("id, name").order("name")).data ?? [],
  });

  async function handleSave(values: ProductInput) {
    setSaving(true);
    const { error } = await supabase.from("products").update(values).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Product updated");
    qc.invalidateQueries({ queryKey: ["admin-product", id] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    navigate({ to: "/admin/products" });
  }

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!product) return <p className="text-muted-foreground">Product not found.</p>;

  const initial: ProductInput = {
    slug: product.slug,
    name: product.name,
    brand_id: product.brand_id,
    category_id: product.category_id,
    price: Number(product.price),
    compare_at_price: product.compare_at_price != null ? Number(product.compare_at_price) : null,
    description: product.description ?? "",
    ingredients: product.ingredients ?? "",
    usage_instructions: product.usage_instructions ?? "",
    skin_types: (product.skin_types ?? []) as ProductInput["skin_types"],
    skincare_goals: (product.skincare_goals ?? []) as ProductInput["skincare_goals"],
    stock_qty: product.stock_qty ?? 0,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_bestseller: product.is_bestseller,
  };

  return (
    <div>
      <Link to="/admin/products" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-plum">← Back to products</Link>
      <div className="flex items-start justify-between mt-3 mb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl text-plum">Edit product</h1>
          <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
        </div>
        <button onClick={handleDelete} className="text-xs uppercase tracking-widest text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50">Delete</button>
      </div>

      <ProductImages productId={id} />

      <div className="mt-12">
        <ProductForm initial={initial} brands={brands} categories={categories} onSubmit={handleSave} submitting={saving} submitLabel="Save changes" />
      </div>
    </div>
  );
}

function ProductImages({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: images = [] } = useQuery({
    queryKey: ["admin-product-images", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("id, url, alt, sort_order")
        .eq("product_id", productId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let nextSort = images.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        toast.error(upErr.message);
        continue;
      }
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        url: `/api/public/product-image/${path}`,
        alt: file.name.replace(/\.[^.]+$/, ""),
        sort_order: nextSort++,
      });
      if (error) toast.error(error.message);
    }
    setUploading(false);
    toast.success("Upload complete");
    qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });
  }

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!/^https?:\/\/\S+$/i.test(trimmed)) {
      toast.error("Enter a valid image URL (http/https)");
      return;
    }
    setAdding(true);
    const nextSort = images.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url: trimmed,
      alt: alt.trim() || null,
      sort_order: nextSort,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setUrl("");
    setAlt("");
    toast.success("Image added");
    qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });
  }

  async function removeImage(imgId: string) {
    const { error } = await supabase.from("product_images").delete().eq("id", imgId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });
  }

  async function move(imgId: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === imgId);
    const swap = images[idx + dir];
    if (!swap) return;
    const current = images[idx];
    await supabase.from("product_images").update({ sort_order: swap.sort_order }).eq("id", current.id);
    await supabase.from("product_images").update({ sort_order: current.sort_order }).eq("id", swap.id);
    qc.invalidateQueries({ queryKey: ["admin-product-images", productId] });
  }

  return (
    <section className="border border-border p-6 bg-cream-dark/30">
      <h2 className="font-display text-2xl text-plum mb-4">Images</h2>
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">No images yet. Add one below.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {images.map((img, i) => (
            <li key={img.id} className="border border-border bg-cream">
              <div className="aspect-square bg-muted overflow-hidden">
                <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.3")} />
              </div>
              <div className="p-2 flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button onClick={() => move(img.id, -1)} disabled={i === 0} className="px-1.5 disabled:opacity-30" aria-label="Move up">↑</button>
                  <button onClick={() => move(img.id, 1)} disabled={i === images.length - 1} className="px-1.5 disabled:opacity-30" aria-label="Move down">↓</button>
                </div>
                <button onClick={() => removeImage(img.id)} className="text-red-600 hover:opacity-70">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addImage} className="grid md:grid-cols-[2fr_1fr_auto] gap-2 items-end">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Image URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full border border-border bg-cream px-3 py-2 text-sm" maxLength={2000} required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Alt text</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full border border-border bg-cream px-3 py-2 text-sm" maxLength={200} />
        </div>
        <button type="submit" disabled={adding} className="bg-plum text-cream px-5 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50">
          {adding ? "Adding…" : "Add image"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground mt-3">Paste an image URL from your CDN or an image host (e.g. Unsplash). Direct file uploads aren't enabled on this workspace.</p>
    </section>
  );
}
