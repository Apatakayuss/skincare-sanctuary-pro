import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-plum text-cream/80 mt-24">
      <div className="container-page py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-display text-3xl text-cream">Alluring</div>
          <p className="text-sm mt-4 leading-relaxed text-cream/60 max-w-xs">
            Nigeria's trusted destination for authentic skincare. Curated for our climate, delivered nationwide.
          </p>
        </div>
        <div>
          <h4 className="eyebrow text-gold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/cleanser" className="hover:text-gold">Cleansers</Link></li>
            <li><Link to="/category/toner" className="hover:text-gold">Toners</Link></li>
            <li><Link to="/category/serum" className="hover:text-gold">Serums</Link></li>
            <li><Link to="/category/moisturizer" className="hover:text-gold">Moisturizers</Link></li>
            <li><Link to="/category/sunscreen" className="hover:text-gold">Sunscreen</Link></li>
            <li><Link to="/category/treatment" className="hover:text-gold">Treatments</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">Our story</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Shop all</Link></li>
            <li><Link to="/account" className="hover:text-gold">Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold mb-4">Stay in touch</h4>
          <p className="text-sm text-cream/60 mb-4">Skincare guidance and early access to new arrivals.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks — we'll be in touch.");
            }}
            className="flex"
          >
            <input
              type="email"
              required
              placeholder="Email"
              className="flex-1 bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            />
            <button className="bg-gold text-plum px-4 text-xs uppercase tracking-widest font-semibold hover:bg-gold-soft">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-cream/10 py-6">
        <div className="container-page flex flex-col md:flex-row justify-between gap-3 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Alluring. All rights reserved.</p>
          <p>Authentic skincare · Free delivery in Lagos over ₦30,000 · Nationwide shipping</p>
        </div>
      </div>
    </footer>
  );
}
