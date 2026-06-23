import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Alluring" },
      { name: "description", content: "Why Alluring exists: authentic skincare, expert curation, and care for Nigerian skin." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <div className="container-page py-20 md:py-32 max-w-3xl">
        <p className="eyebrow text-gold mb-6">Our story</p>
        <h1 className="font-display text-5xl md:text-6xl text-plum leading-tight">
          A trusted home for skincare in Nigeria.
        </h1>
        <div className="mt-12 prose prose-lg text-charcoal leading-relaxed space-y-6">
          <p>Alluring began with a simple frustration: finding authentic skincare in Nigeria meant guesswork, counterfeit fears, and overpriced imports. We knew there was a better way.</p>
          <p>We work directly with authorised distributors of the world's most respected dermatological brands — CeraVe, La Roche-Posay, The Ordinary, COSRX, Beauty of Joseon, and emerging African names like Orire — to bring you formulas verified for batch authenticity, climate-tested for West Africa, and curated for the concerns we actually face.</p>
          <p>Our team — pharmacists, licensed aestheticians, and skincare obsessives — has personally tested every product in our edit. If it isn't on the shelf, it didn't make the cut.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8 border-t border-border pt-12">
          <div>
            <p className="eyebrow text-gold mb-3">Authentic</p>
            <p className="text-sm text-charcoal">Every product traceable to an authorised source.</p>
          </div>
          <div>
            <p className="eyebrow text-gold mb-3">Curated</p>
            <p className="text-sm text-charcoal">A tight edit — only what genuinely works.</p>
          </div>
          <div>
            <p className="eyebrow text-gold mb-3">Local</p>
            <p className="text-sm text-charcoal">Free Lagos delivery over ₦30,000. Nationwide shipping.</p>
          </div>
        </div>
        <Link to="/shop" className="inline-block mt-16 bg-plum text-cream px-10 py-4 text-xs uppercase tracking-widest">Explore the edit</Link>
      </div>
    </SiteLayout>
  );
}
