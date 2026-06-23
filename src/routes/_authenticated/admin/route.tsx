import { createFileRoute, redirect, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";

const NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/reviews", label: "Reviews" },
];

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/account" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <SiteLayout>
      <div className="container-page py-12 grid md:grid-cols-[220px_1fr] gap-12">
        <aside>
          <p className="eyebrow text-gold mb-4">Admin</p>
          <nav className="space-y-1.5 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={`block py-1.5 ${path === n.to ? "text-gold font-semibold" : "text-charcoal hover:text-plum"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <Outlet />
      </div>
    </SiteLayout>
  );
}
