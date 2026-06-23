import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/category/serum", label: "Serums" },
  { to: "/category/sunscreen", label: "Sunscreen" },
  { to: "/category/treatment", label: "Treatments" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-border">
      <div className="container-page flex items-center justify-between gap-6 py-4 md:py-5">
        <button
          className="md:hidden text-plum"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] text-charcoal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 md:gap-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }}
            className="hidden lg:flex items-center border-b border-border/70 focus-within:border-gold transition-colors"
          >
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skincare…"
              className="bg-transparent px-2 py-1.5 text-sm outline-none w-48"
            />
          </form>
          <Link to="/search" aria-label="Search" className="lg:hidden text-plum hover:text-gold">
            <Search size={20} />
          </Link>
          {user ? (
            <Link to="/account" aria-label="Account" className="text-plum hover:text-gold">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/auth" aria-label="Sign in" className="text-plum hover:text-gold">
              <User size={20} />
            </Link>
          )}
          {user && (
            <Link to="/account/wishlist" aria-label="Wishlist" className="hidden md:inline text-plum hover:text-gold">
              <Heart size={20} />
            </Link>
          )}
          <Link to="/cart" aria-label="Bag" className="relative text-plum hover:text-gold">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-plum text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline text-[11px] uppercase tracking-widest text-gold border border-gold px-3 py-1.5 hover:bg-gold hover:text-plum transition">
              Admin
            </Link>
          )}
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-cream">
          <nav className="container-page flex flex-col py-4 gap-3 text-sm uppercase tracking-widest">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2">
                {n.label}
              </Link>
            ))}
            {user && <Link to="/account/wishlist" onClick={() => setOpen(false)} className="py-2">Wishlist</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-gold">Admin</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
