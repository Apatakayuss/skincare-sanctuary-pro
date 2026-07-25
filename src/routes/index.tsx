import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShieldCheck, Truck, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { formatNaira } from "@/lib/format";
import heroPortrait from "@/assets/hero-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alluring — Authentic Skincare for Nigerian Skin" },
      { name: "description", content: "Discover authentic serums, sunscreens, and treatments curated for your skin type. Free Lagos delivery over ₦30,000." },
      { property: "og:title", content: "Alluring — Authentic Skincare" },
      { property: "og:description", content: "Authentic skincare, curated for Nigerian skin." },
    ],
  }),
  component: Home,
});

const CONCERNS = [
  { slug: "acne", label: "Acne" },
  { slug: "hyperpigmentation", label: "Hyperpigmentation" },
  { slug: "dark_spots", label: "Dark Spots" },
  { slug: "sensitive_repair", label: "Sensitive" },
  { slug: "brightening", label: "Brightening" },
  { slug: "hydration", label: "Hydration" },
];

const TRUST = [
  { icon: ShieldCheck, label: "100% Authentic" },
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: Sparkles, label: "Expert Curation" },
  { icon: Lock, label: "Secure Payment" },
];

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, avg_rating, review_count, brand:brands(name), product_images(url)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(8);
      return data ?? [];
    },
  });

  const { data: bestSellers = [] } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, avg_rating, review_count, brand:brands(name), product_images(url)")
        .eq("is_active", true)
        .eq("is_bestseller", true)
        .limit(4);
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const heroBestSeller = bestSellers[0];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="container-page pt-10 md:pt-16 pb-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
            <p className="eyebrow text-gold">Trusted Skincare Marketplace</p>
            <h1 className="font-display text-5xl md:text-7xl xl:text-8xl text-plum leading-[0.95]">
              The Art of <br />
              <span className="italic text-gold">Authentic</span> Glow
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Curating the world's most effective dermatological brands for Nigerian skin. Targeted solutions for acne, hyperpigmentation, and daily radiance.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="bg-plum text-cream px-9 py-4 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-plum-light transition shadow-xl"
              >
                Shop the Collection
              </Link>
              <Link
                to="/about"
                className="border border-plum text-plum px-9 py-4 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-plum hover:text-cream transition"
              >
                The Alluring Promise
              </Link>
            </div>
            <div className="pt-10 border-t border-gold/30">
              <p className="eyebrow text-muted-foreground mb-5">Targeted Concerns</p>
              <div className="flex flex-wrap gap-x-7 gap-y-3 font-display text-xl text-plum">
                {CONCERNS.slice(0, 4).map((c) => (
                  <Link key={c.slug} to="/shop" search={{ goal: c.slug }} className="hover:text-gold transition-colors">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
              <img
                src={heroPortrait}
                alt="Editorial portrait — Alluring authentic skincare"
                width={1024}
                height={1280}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-cream/20 m-4 pointer-events-none" />
            </div>
            {heroBestSeller && (
              <Link
                to="/product/$slug"
                params={{ slug: heroBestSeller.slug }}
                className="absolute -bottom-6 -left-6 bg-card p-6 shadow-2xl max-w-[220px] hidden md:block border-l-4 border-gold hover:-translate-y-1 transition-transform"
              >
                <p className="text-charcoal font-semibold text-[10px] uppercase tracking-[0.18em]">Bestseller</p>
                <p className="font-display text-lg text-plum mt-1 leading-tight">{heroBestSeller.name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-gold font-semibold">{formatNaira(heroBestSeller.price)}</span>
                  <span className="text-[10px] bg-cream-dark px-2 py-1 uppercase font-bold tracking-wider">In Stock</span>
                </div>
              </Link>
            )}
            <div className="absolute -top-8 -right-4 md:-right-10 w-32 md:w-40 h-32 md:h-40 border border-gold/30 rounded-full flex items-center justify-center text-center p-4 bg-cream/60 backdrop-blur">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold leading-tight font-semibold">
                100% Authentic
                <br />
                Guaranteed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-plum text-cream py-10">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center md:justify-start">
              <Icon size={22} className="text-gold flex-shrink-0" />
              <span className="text-xs uppercase tracking-widest text-cream/90">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="Six considered categories. Every product tested for our climate."
          action={
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest text-plum border-b border-gold pb-1 hover:text-gold">
              View all <ChevronRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group block text-center"
            >
              <div className="aspect-square overflow-hidden bg-cream-dark mb-3">
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
              <h3 className="font-display text-lg text-plum group-hover:text-gold transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL STORY */}
      <section className="bg-cream-dark py-20 md:py-28">
        <div className="container-page grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="eyebrow text-gold mb-4">The Alluring Promise</p>
            <h2 className="font-display text-4xl md:text-5xl text-plum leading-tight">
              Authenticity, expertise, <br /> and care — in every order.
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              We source directly from authorised distributors. Every product is verified for batch authenticity before it reaches your doorstep. Our team — pharmacists and licensed aestheticians — has personally tested every formula in our edit.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-8 text-xs uppercase tracking-widest text-plum border-b border-gold pb-1 hover:text-gold"
            >
              Read our story <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-cream">
              <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80" alt="Skincare ritual" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-cream mt-12">
              <img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80" alt="Texture detail" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          eyebrow="The Edit"
          title="This season's most loved"
          description="A curated edit of our team's current obsessions."
          action={
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest text-plum border-b border-gold pb-1 hover:text-gold">
              Shop all <ChevronRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* SHOP BY CONCERN */}
      <section className="bg-plum text-cream py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Targeted"
            title={<span className="text-cream">Shop by concern</span>}
            description="Tell us what your skin needs — we'll edit the noise out."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CONCERNS.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ goal: c.slug }}
                className="border border-cream/20 p-6 text-center hover:border-gold hover:bg-plum-light transition-colors"
              >
                <p className="font-display text-xl break-words">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading eyebrow="Loved by you" title="Bestsellers" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-cream-dark py-20">
        <div className="container-page max-w-3xl text-center">
          <p className="eyebrow text-gold mb-6">From our customers</p>
          <blockquote className="font-display text-3xl md:text-4xl text-plum italic leading-tight">
            "Finally — a place I trust to buy skincare in Nigeria. My hyperpigmentation has visibly faded in three months."
          </blockquote>
          <p className="text-sm text-muted-foreground mt-6 uppercase tracking-widest">Tomi A. · Lagos</p>
        </div>
      </section>
    </SiteLayout>
  );
}
