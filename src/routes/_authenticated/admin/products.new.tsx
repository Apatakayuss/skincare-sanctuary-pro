import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { emptyProduct, ProductInput } from "@/lib/product-form";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands-options"],
    queryFn: async () => (await supabase.from("brands").select("id, name").order("name")).data ?? [],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-options"],
    queryFn: async () => (await supabase.from("categories").select("id, name").order("name")).data ?? [],
  });

  async function handleCreate(values: ProductInput) {
    setSaving(true);
    const { data, error } = await supabase.from("products").insert(values).select("id").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Product created");
    navigate({ to: "/admin/products/$id", params: { id: data.id } });
  }

  return (
    <div>
      <Link to="/admin/products" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-plum">← Back to products</Link>
      <h1 className="font-display text-4xl text-plum mt-3 mb-8">New product</h1>
      <ProductForm initial={emptyProduct} brands={brands} categories={categories} onSubmit={handleCreate} submitting={saving} submitLabel="Create product" />
    </div>
  );
}
