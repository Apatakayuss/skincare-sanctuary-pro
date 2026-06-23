import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SKIN_GOALS, SKIN_TYPES } from "@/lib/format";

type Search = {
  category?: string;
  goal?: string;
  skin?: string;
  brand?: string;
  q?: string;
  sort?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: s.category as string | undefined,
    goal: s.goal as string | undefined,
    skin: s.skin as string | undefined,
    brand: s.brand as string | undefined,
    q: s.q as string | undefined,
    sort: s.sort as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all skincare — Alluring" },
      { name: "description", content: "Browse the full Alluring edit. Filter by category, brand, skin type, and concern." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop", search],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, avg_rating, review_count, skincare_goals, skin_types, brand:brands(name, slug), category:categories(slug), product_images(url)")
        .eq("is_active", true);

      if (search.q) q = q.ilike("name", `%${search.q}%`);

      const sort = search.sort ?? "featured";
      if (sort === "price-asc") q = q.order("price", { ascending: true });
      else if (sort === "price-desc") q = q.order("price", { ascending: false });
      else if (sort === "rating") q = q.order("avg_rating", { ascending: false });
      else q = q.order("is_featured", { ascending: false }).order("avg_rating", { ascending: false });

      const { data } = await q.limit(60);
      let rows = data ?? [];
      if (search.category) rows = rows.filter((p) => (p.category as any)?.slug === search.category);
      if (search.brand) rows = rows.filter((p) => (p.brand as any)?.slug === search.brand);
      if (search.goal) rows = rows.filter((p) => (p.skincare_goals as string[])?.includes(search.goal!));
      if (search.skin) rows = rows.filter((p) => (p.skin_types as string[])?.includes(search.skin!));
      return rows;
    },
  });

  function setFilter(key: keyof Search, value?: string) {
    navigate({ search: (prev) => ({ ...prev, [key]: value || undefined }) });
  }

  const activeFilters = useMemo(
    () => Object.entries(search).filter(([, v]) => !!v),
    [search],
  );

  return (
    <SiteLayout>
      <div className="container-page pt-10 md:pt-16 pb-20">
        <SectionHeading
          eyebrow="The Collection"
          title={search.category ? categories.find((c) => c.slug === search.category)?.name ?? "Shop" : "Shop all skincare"}
          description="A curated edit of authentic products. Filter to find what suits you."
        />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="md:hidden inline-flex items-center gap-2 border border-plum text-plum px-4 py-2 text-xs uppercase tracking-widest"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <div className="ml-auto flex items-center gap-3">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Sort</label>
            <select
              value={search.sort ?? "featured"}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="bg-transparent border-b border-border focus:border-gold text-sm py-1 outline-none"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {activeFilters.map(([k, v]) => (
              <button
                key={k}
                onClick={() => setFilter(k as keyof Search, undefined)}
                className="inline-flex items-center gap-2 bg-plum/5 text-plum px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-plum/10"
              >
                {String(v).replace(/_/g, " ")} <X size={12} />
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-[220px_1fr] gap-10">
          <aside className={`${showFilters ? "block" : "hidden"} md:block space-y-8`}>
            <FilterGroup title="Category">
              {categories.map((c) => (
                <FilterRow key={c.slug} active={search.category === c.slug} onClick={() => setFilter("category", search.category === c.slug ? undefined : c.slug)}>
                  {c.name}
                </FilterRow>
              ))}
            </FilterGroup>
            <FilterGroup title="Skin Type">
              {SKIN_TYPES.map((s) => (
                <FilterRow key={s.value} active={search.skin === s.value} onClick={() => setFilter("skin", search.skin === s.value ? undefined : s.value)}>
                  {s.label}
                </FilterRow>
              ))}
            </FilterGroup>
            <FilterGroup title="Concern">
              {SKIN_GOALS.map((s) => (
                <FilterRow key={s.value} active={search.goal === s.value} onClick={() => setFilter("goal", search.goal === s.value ? undefined : s.value)}>
                  {s.label}
                </FilterRow>
              ))}
            </FilterGroup>
            <FilterGroup title="Brand">
              {brands.map((b) => (
                <FilterRow key={b.slug} active={search.brand === b.slug} onClick={() => setFilter("brand", search.brand === b.slug ? undefined : b.slug)}>
                  {b.name}
                </FilterRow>
              ))}
            </FilterGroup>
          </aside>

          <div>
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-2xl text-plum">No products match those filters.</p>
                <Link to="/shop" className="inline-block mt-4 text-xs uppercase tracking-widest text-gold border-b border-gold pb-1">
                  Clear all
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow text-plum mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterRow({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm py-1.5 ${active ? "text-gold font-semibold" : "text-charcoal hover:text-plum"}`}
    >
      {children}
    </button>
  );
}
