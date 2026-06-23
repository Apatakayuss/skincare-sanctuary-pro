import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/account", label: "Profile" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/wishlist", label: "Wishlist" },
];

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();
  return (
    <SiteLayout>
      <div className="container-page py-12 md:py-16 grid md:grid-cols-[220px_1fr] gap-12">
        <aside>
          <p className="eyebrow text-gold mb-4">Your account</p>
          <nav className="space-y-2 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`block py-1.5 ${path === n.to ? "text-gold font-semibold" : "text-charcoal hover:text-plum"}`}
              >
                {n.label}
              </Link>
            ))}
            <button onClick={signOut} className="block py-1.5 text-muted-foreground hover:text-destructive text-left">Sign out</button>
          </nav>
        </aside>
        <Outlet />
      </div>
    </SiteLayout>
  );
}
