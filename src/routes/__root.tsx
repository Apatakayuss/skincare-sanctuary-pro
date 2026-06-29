import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-gold mb-4">404</p>
        <h1 className="font-display text-5xl text-plum">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has been moved or never existed.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-plum text-cream px-8 py-3 text-xs uppercase tracking-widest hover:bg-plum-light transition"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-plum">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We had a moment. Try refreshing — or head back to discover skincare.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-plum text-cream px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-plum-light"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-plum text-plum px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-plum hover:text-cream"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alluring — Authentic Skincare, Curated for You" },
      { name: "description", content: "Nigeria's trusted skincare marketplace. Authentic products from CeraVe, The Ordinary, La Roche-Posay, COSRX and more — curated for your skin type and concerns." },
      { name: "author", content: "Alluring" },
      { property: "og:title", content: "Alluring — Authentic Skincare, Curated for You" },
      { property: "og:description", content: "Nigeria's trusted skincare marketplace. Authentic products from CeraVe, The Ordinary, La Roche-Posay, COSRX and more — curated for your skin type and concerns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Alluring — Authentic Skincare, Curated for You" },
      { name: "twitter:description", content: "Nigeria's trusted skincare marketplace. Authentic products from CeraVe, The Ordinary, La Roche-Posay, COSRX and more — curated for your skin type and concerns." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/84fd58ea-01b4-492e-9c19-e09024515351/id-preview-3135c7d3--e5efad23-b835-42a7-ad6c-217aea55e451.lovable.app-1782733462540.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/84fd58ea-01b4-492e-9c19-e09024515351/id-preview-3135c7d3--e5efad23-b835-42a7-ad6c-217aea55e451.lovable.app-1782733462540.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Outlet />
          <Toaster position="top-center" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
